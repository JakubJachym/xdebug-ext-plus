function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    idekey: document.querySelector("#idekey").value
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#idekey").value = result.idekey || "PHPSTORM";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  const getting = browser.storage.local.get(["idekey", "cookieSameSite", "cookieSecure"]);
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);