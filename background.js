let currentTab;
let currentState;

/*
 * Enable or disable Debugging
 */
function toggleButton(event) {
  function onExecuted() {
    browser.tabs.executeScript(
      currentTab.id, {
        file: "cookies.js"
      });
  }

  function onError(error) {
    console.log(`Can't execute script: ${error}, for current tab ID ` + currentTab.id);
  }

  const userTriggered = (typeof event === 'object');
  const executing = browser.tabs.executeScript(
    currentTab.id, {
      code: "var currentState = " + currentState + "; var userTriggered = " + userTriggered + ";"
    });
  executing.then(onExecuted, onError);
}

browser.browserAction.onClicked.addListener(toggleButton);

/*
 * Switches currentTab to reflect the currently active tab
 */
function updateActiveTab(e) {
  function isSupportedProtocol(urlString) {
    const supportedProtocols = ["https:", "http:", "ftp:", "file:"];
    let url = document.createElement('a');
    url.href = urlString;

    return (supportedProtocols.indexOf(url.protocol) !== -1);
  }

  function updateTab(tabs) {
    if (tabs[0]) {
      currentTab = tabs[0];
      if (isSupportedProtocol(currentTab.url)) {
        toggleButton();
      }
    }
  }

  const gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then(updateTab);

}

function updateButton(result) {
  if (typeof currentTab.id === 'undefined') {
    return;
  }

  browser.browserAction.setIcon({
    path: result ? {
      32: "data/icons/debug_32_active.png",
      48: "data/icons/debug_32_active.png"
    } : {
      32: "data/icons/debug_48_inactive.png",
      48: "data/icons/debug_48_inactive.png"
    },
    tabId: currentTab.id
  });

  browser.browserAction.setTitle({
    title: result ? 'Disable Debugging' : 'Enable Debugging',
    tabId: currentTab.id
  });
}

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateActiveTab);

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab);

// listen for window switching
browser.windows.onFocusChanged.addListener(updateActiveTab);

// Listen to button clicks
//browser.browserAction.onClicked.addListener(updateActiveTab);

function notify(message) {
  if (typeof message.state !== 'undefined') {
    updateButton(message.state);
    currentState = message.state;
  }
}

// Listen to content scripts messages
browser.runtime.onMessage.addListener(notify);

// update when the extension loads initially
updateActiveTab();
