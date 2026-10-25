// script.js runs in the page itself, since it needs React's state and props.
// Its only stored setting, listRetweets, is passed in through a <script> element.

browser.storage.local.get({ listRetweets: "ignore" }).then(stored => {
  const $settings = document.createElement("script");
  $settings.type = "text/json";
  $settings.id = "cpftSettings";
  $settings.textContent = JSON.stringify(stored);
  document.documentElement.append($settings);

  const $main = document.createElement("script");
  $main.src = browser.runtime.getURL("script.js");
  $main.onload = () => $main.remove();
  document.documentElement.append($main);
});

// Saves the "Turn on/off Retweets" choice made from a List's menu.
window.addEventListener("message", event => {
  if (event.source !== window || event.data?.type !== "cpftConfigChange") return;
  const { listRetweets } = event.data.changes ?? {};
  if (listRetweets === "ignore" || listRetweets === "hide") browser.storage.local.set({ listRetweets });
});
