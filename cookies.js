/* this is a CONTENT script that interact directly with web content
 * http://www.quirksmode.org/js/cookies.html
 */
if (typeof options === "undefined") {
  function onError(error) {
    console.log(`Can't get var: ${error}`);
  }

  function onGot(item) {
    options.checkCookies.XDEBUG_SESSION = item.idekey || "PHPSTORM";
    options.samesite = item.cookieSameSite || "Strict";
    options.secure = item.cookieSecure || false;
  }

  options = {
    cookieName: "XDEBUG_SESSION",
    checkCookies: {
      XDEBUG_SESSION: '',
      /*XDEBUG_TRACE: '',
      XDEBUG_PROFILE: ''*/
    },
    samesite: "Strict",
    secure: false,
  };

  let getting = browser.storage.local.get(["idekey", "cookieSameSite", "cookieSecure"]);
  getting.then(onGot, onError);
}


function createCookie(name, value, days, samesite = "Lax", secure = false) {
  let expires = "";

  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }

  if (typeof document.cookie != 'undefined') {
    browser.runtime.sendMessage("Cookie " + name + " created with value " + value);

    let cookieStr = name + "=" + value + expires + "; path=/; SameSite=" + samesite;

    if (secure || samesite === "None") {
      cookieStr += "; Secure";
    }

    document.cookie = cookieStr;
  }
}

function readCookie(name) {
  let nameEQ = name + "=";

  if (typeof document.cookie === 'undefined') {
    //console.log('this doc has no cookies');
    return null;
  }

  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ')
      c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0)
      return c.substring(nameEQ.length, c.length);
  }

  return null;
}

function eraseCookie(name) {
  createCookie(name, "", -1);
}

function isSet(name) {
  return readCookie(name) !== null;
}

browser.runtime.sendMessage(options);
browser.runtime.sendMessage({currentState: currentState, userTriggered: userTriggered});

if (userTriggered === false) {
  // tab changed or page loaded
  let result = {};

  for (const cookieName in options.checkCookies) {
    browser.runtime.sendMessage("Checking cookie " + cookieName);
    result[cookieName] = isSet(cookieName);

    // if user changes values, we must immediately update cookies after any tab changing or page loading
    if (isSet(cookieName)) {
      let currentValue = readCookie(cookieName);
      let newValue = options.checkCookies[cookieName];
      let samesite = options.samesite;
      let secure = options.secure;
      browser.runtime.sendMessage("Cookie found with value " + currentValue);
      if (newValue !== currentValue) {
        browser.runtime.sendMessage("Cookie values mismatch, resetting (" + currentValue + " -> " + newValue + ")");
        eraseCookie(cookieName);
        createCookie(cookieName, newValue, 1, samesite, secure);
      }
    }

    browser.runtime.sendMessage({"state": result[cookieName]});
  }
} else {
  // widget button pressed
  let cookieName = options.cookieName;
  let cookieValue = options.checkCookies[cookieName];
  let samesite = options.samesite;
  let secure = options.secure;
  browser.runtime.sendMessage({"debug": 'Button pressed'});

  if (!isSet(cookieName)) {
    browser.runtime.sendMessage({"debug": 'Needs to be set'});
    // sometimes URL is null e.g. when we're on about:addons under linux (is it true?)
    if (typeof document.URL === 'string' && document.URL.substring(0, 4) === 'http') {
      createCookie(cookieName, cookieValue, 1, samesite, secure);

      // Cookies can be disabled
      let state = isSet(cookieName);
      if (!state) {
        alert('Please enable cookies for this page');
      }

      browser.runtime.sendMessage({"state": state});
    } else {
      browser.runtime.sendMessage({"state": false});
    }
  } else {
    browser.runtime.sendMessage({"debug": 'Needs to be removed'});
    eraseCookie(cookieName);
    browser.runtime.sendMessage({"state": false});
  }
}
