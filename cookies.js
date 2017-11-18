/* this is a CONTENT script that interact directly with web content
 * http://www.quirksmode.org/js/cookies.html
 */
if (typeof options === "undefined") {
    var options = {
        cookieName: "XDEBUG_SESSION",
        cookieValue: "happydebug"
    };
}


function createCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires=" + date.toGMTString();
	} else {
		var expires = "";
	}

	if (typeof document.cookie != 'undefined') {
		document.cookie = name + "=" + value + expires + "; path=/";
	}
}

function readCookie(name) {
	var nameEQ = name + "=";

	if (typeof document.cookie == 'undefined') {
		//console.log('this doc has no cookies');
		return null;
	}

	var ca = document.cookie.split(';');
	for (var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ')
			c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0)
			return c.substring(nameEQ.length,c.length);
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

	var result = {};
	for (var cookieName in options.checkCookies)
	{
		result[cookieName] = isSet(cookieName);

		// if user changes values, we must immediately update cookies after any tab changing or page loading
		if (isSet(cookieName))
		{
			var currentValue = readCookie(cookieName);
			var newValue = options.checkCookies[cookieName];
			if (newValue != currentValue)
			{
				eraseCookie(cookieName);
				createCookie(cookieName, newValue, 1);
			}
		}
	}

	browser.runtime.sendMessage({"result": result});
}
else
{
	// widget button pressed
	var cookieName = options.cookieName;
	var cookieValue = options.cookieValue;
    browser.runtime.sendMessage({"debug": 'Button pressed'});

	if (!isSet(cookieName))
	{
		// sometimes URL is null e.g. when we're on about:addons under linux (is it true?)
		if (typeof document.URL == 'string' && document.URL.substring(0, 4) == 'http')
		{
			createCookie(cookieName, cookieValue, 1);

			// Cookies can be disabled
			var state = isSet(cookieName);
			if (!state) {
//				console.log('Couldnt set cookie! url: '+document.URL);
				alert('Please enable cookies for this page');
			}

			browser.runtime.sendMessage({"state": state});
		}
		else
		{
			browser.runtime.sendMessage({"state": false});
		}
	}
	else
	{
		eraseCookie(cookieName);
		browser.runtime.sendMessage({"state": false});
	}
}

