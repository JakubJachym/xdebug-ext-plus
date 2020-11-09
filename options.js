function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    idekey: document.querySelector("#idekey").value,
    cookieSameSite: document.querySelector("#cookie_samesite").value,
    cookieSecure: (document.querySelector("#cookie_secure").value === "1"),
  });

  document.querySelector("#msg_settings_saved").classList.remove("u-isHidden");
  window.setTimeout(function () {
    document.querySelector("#msg_settings_saved").classList.add("u-isHidden");
  }, 3000);
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#idekey").value = result.idekey || "PHPSTORM";
    document.querySelector("#cookie_samesite").value = result.cookieSameSite || "Strict";
    document.querySelector("#cookie_secure").value = (result.cookieSecure === true) ? "1" : "0";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  const getting = browser.storage.local.get(["idekey", "cookieSameSite", "cookieSecure"]);
  getting.then(setCurrentChoice, onError);

  handleSecureOption();
}

function handleSecureOption() {
  const secureSelect = document.querySelector("#cookie_secure");
  const secureHint = document.querySelector("#cookie_secure_hint");
  if (document.querySelector("#cookie_samesite").value === "None") {
    secureSelect.value = "1";
    secureSelect.disabled = true;
    secureHint.classList.remove("u-isHidden");
  } else {
    secureSelect.disabled = false;
    secureHint.classList.add("u-isHidden");
  }
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#cookie_samesite").addEventListener("change", handleSecureOption);
