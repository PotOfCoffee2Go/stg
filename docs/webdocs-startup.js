// Append fetched script to <head>
function fetchWebDocDown(script) {
  return fetch(sources.webdocdown(script))
    .then((response) => response.text())
    .then((text) => {
      let elem = document.createElement("script");
      elem.innerHTML = text;
      document.head.appendChild(elem);
    });
}

// Load WebDocDown on startup
window.onload = () => {
  fetchWebDocDown("webdocdown.js")
    .then(() => new WebDocFetch())
    .then((webdocfetch) => webdocfetch.loadWebDocDown(sources))
    .catch((err) => {
      document.getElementById(sources.element).innerHTML = err;
    });
};
