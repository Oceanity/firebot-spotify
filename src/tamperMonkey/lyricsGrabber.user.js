// ==UserScript==
// @name         Lyric Grabber
// @namespace    https://oceanity.github.io
// @version      0.7.5
// @description  Sends Spotify lyrics to Firebot
// @author       Oceanity
// @match        https://open.spotify.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=spotify.com
// @grant        none
// ==/UserScript==

(async function () {
  'use strict';

  const {
    fetch: originalFetch
  } = window;

  const version = "0.7.5a";

  // Consts
  const lyricUrlRegex = /https:\/\/spclient\.wg\.spotify\.com\/color-lyrics\/v2\/track\/([a-zA-Z0-9]+)\/image\/.+/;

  // Storage Keys
  const FIREBOT_HOST_KEY = "firebotHost";
  const FIREBOT_SAVED_IDS_KEY = "firebotSavedIds";

  // Fetch storage
  let firebotHost = localStorage.getItem(FIREBOT_HOST_KEY);
  let savedLyricIds = [];

  if (!firebotHost) {
    console.log("No Firebot Host found in Local storage, setting to default");
    firebotHost = "http://localhost:7472";
    localStorage.setItem(FIREBOT_HOST_KEY, firebotHost);
  }

  const firebotApiUrl = () => `${firebotHost}/integrations/oceanity-spotify`;

  // Overload Fetch
  window.fetch = async (...args) => {
    let [resource, config] = args;
    // request interceptor here
    const response = await originalFetch(resource, config);
    const match = resource.match(lyricUrlRegex);

    if (response.ok && match) {
      const id = resource.match(lyricUrlRegex)[1];
      const data = await response.json();

      if (data.lyrics.syncType === "LINE_SYNCED") {
        await saveLyricsToFirebotAsync(id, data);
      }
    }
    // response interceptor here
    return response;
  };

  window.onresize = () => {
    moveOverlay(overlay.offsetLeft, overlay.offsetTop);
  }

  addStyles(`
      #oceanity-spotify-modal {
          position: absolute;
          border-radius: 10px;
          top: 20px;
          left: 310px;
          width: 360px;
          overflow: hidden;
          color: #fff;
          text-shadow: 1px 1px 2px #000;
          background-color: rgba(0,45,70,0.85);
          z-index: 999;
      }
      #oceanity-spotify-modal input,
      #oceanity-spotify-modal textarea {
          border: 0;
          border-radius: 5px;
          padding: 5px;
          color: #ddd;
          background-color: rgba(0, 0, 0, 0.5);
      }
      .oceanity-spotify-new-version {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 10px;
          padding: 4px 10px;
          color: #fff;
          background-color: darkgoldenrod;
      }
      .oceanity-spotify-new-version a {
          color: cyan;
      }
      .oceanity-spotify-connection-row {
          display: flex;
          align-items: center;
          gap: 10px;
      }
      .oceanity-spotify-connection-light {
          border-radius: 50%;
          border: 2px solid #fff;
          width: 16px;
          height: 16px;
          background: red;
      }
      .oceanity-spotify-connection-text {
          color: #bbb;
          font-size: 0.8em;
      }
  `);

  // Create UI Overlay
  const overlay = createDomElement("div", {
    id: "oceanity-spotify-modal"
  });
  const overlayHeader = createDomElement("div", {
    id: "oceanity-spotify-modal-header",
    css: {
      height: "20px",
      background: "rgba(0,25,50,0.5)",
      cursor: "move"
    },
    onmousedown: dragOverlayHandler
  });
  overlay.append(overlayHeader);

  const connectionPanel = createDomElement("div", {
    css: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      padding: "4px 10px",
    }
  });
  overlay.append(connectionPanel);

  //#region Lyrics connected
  const lyricsConnectedRow = createDomElement("div", {
    className: "oceanity-spotify-connection-row",
  });
  connectionPanel.append(lyricsConnectedRow);

  const lyricsConnectedLight = createDomElement("div", {
    className: "oceanity-spotify-connection-light",
  });
  lyricsConnectedRow.append(lyricsConnectedLight);

  const lyricsConnectedText = createDomElement("span", {
    html: "Disconnected from Spotify Lyrics, go to <a href='/lyrics'>lyrics</a>",
    className: "oceanity-spotify-connection-text"
  });
  lyricsConnectedRow.append(lyricsConnectedText);

  async function checkLyrics() {
    const onLyrics = window.location.pathname === "/lyrics";
    lyricsConnectedLight.style.background = onLyrics ?
      "green" :
      "red";
    lyricsConnectedText.innerHTML = onLyrics ?
      "Connected to Spotify Lyrics" :
      "Disconnected from Spotify Lyrics, go to <a href='/lyrics'>lyrics</a>";
    setTimeout(checkLyrics, 15000);
  }
  checkLyrics();
  //#endregion

  //#region Firebot connected
  const firebotConnectedRow = createDomElement("div", {
    className: "oceanity-spotify-connection-row",
  });
  connectionPanel.append(firebotConnectedRow);
  const firebotConnectedLight = createDomElement("div", {
    className: "oceanity-spotify-connection-light",
  });
  firebotConnectedRow.append(firebotConnectedLight);
  const firebotConnectedText = createDomElement("span", {
    text: "Disconnected from Firebot",
    className: "oceanity-spotify-connection-text"
  });
  firebotConnectedRow.append(firebotConnectedText);
  async function checkFirebot() {
    try {
      const firebotResponse = await originalFetch(`${firebotApiUrl()}/lyrics/ping`);

      const firebotConnected = firebotResponse.ok;
      if (firebotConnected) {
        firebotConnectedLight.style.background = "green";
        firebotConnectedText.innerHTML = "Connected to Firebot";
        checkFirebotVersion();
        return;
      }
    } catch (error) {}
    firebotConnectedLight.style.background = "red";
    firebotConnectedText.innerHTML = "Disconnected from Firebot";
    setTimeout(checkFirebot, 1000);
  }
  checkFirebot();
  //#endregion

  const overlayBody = createDomElement("div", {
    html: `<h2>Lyrics Grabber <span style="font-size:0.75em; color: rgba(255,255,255,0.7)">(by Oceanity)</span></h2>
             <label>Firebot Host</label>`,
    css: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      padding: "10px"
    }
  });
  overlay.append(overlayBody);

  let timeoutToSaveHost;
  const overlayHostInput = createDomElement("input", {
    name: "firebot-hostname",
    id: "firebot-hostname",
    type: "text",
    value: firebotHost,
    oninput: (e) => {
      if (timeoutToSaveHost) clearTimeout(timeoutToSaveHost);
      firebotHost = e.target.value;
      timeoutToSaveHost = setTimeout(() => {
        localStorage.setItem(FIREBOT_HOST_KEY, firebotHost);
      }, 1000);
    }
  });
  overlayBody.append(overlayHostInput);

  const overlayLog = createDomElement("textarea", {
    value: "Log:",
    readOnly: true,
    css: {
      minHeight: "160px",
      overflowX: "hidden",
      overflowY: "auto",
      userSelect: "none",
      fontSize: "10px",
      fontFamily: "monospace",
      resize: "none"
    }
  });
  overlayBody.append(overlayLog);

  document.body.prepend(overlay);


  async function checkFirebotVersion() {

    // Check for new version
    console.log(`Checking for new vesrion at ${firebotApiUrl()}/version?v=${version}`);
    const versionCheckResponse = await originalFetch(`${firebotApiUrl()}/version?v=${version}`);

    if (versionCheckResponse.ok) {
      const {
        localVersion,
        remoteVersion,
        newVersionAvailable
      } = await versionCheckResponse.json();

      if (newVersionAvailable) {
        console.log(`New version available: ${localVersion} -> ${remoteVersion}`);

        const versionCheckModal = createDomElement("div", {
          className: "oceanity-spotify-new-version",
          html: `
          <h3>New version available! ${localVersion} -> ${remoteVersion}</h3>
          <p>Click <a href="https://github.com/Oceanity/firebot-spotify/releases/latest" target="_blank">here</a> to download the latest version.</p>
        `
        });

        overlay.insertBefore(versionCheckModal, connectionPanel);
      }
    }
  }

  // Firebot functions
  async function saveLyricsToFirebotAsync(id, data) {
    try {
      if (savedLyricIds.includes(id)) return;

      const lyricsExistResponse = await originalFetch(`${firebotApiUrl()}/lyrics/exists?id=${id}`);

      if (lyricsExistResponse.ok) {
        const lyricsExist = (await lyricsExistResponse.json()).exists;

        if (lyricsExist) {
          console.log(`Lyrics for track with Id ${id} already exist`);
          savedLyricIds.push(id);
          return;
        }
      }

      console.log(lyricsExistResponse);

      const firebotResponse = await originalFetch(`${firebotApiUrl()}/lyrics/save`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          data,
          id
        })
      });
      if (firebotResponse.ok || firebotResponse.status === 409) {
        localStorage.setItem(FIREBOT_SAVED_IDS_KEY, JSON.stringify(savedLyricIds));

        const data = await firebotResponse.json();

        if (data.status === 200 && data.track) {
          overlayLog.value += `\nSaved lyrics: ${data.track}`;
          overlayLog.scrollTop = overlayLog.scrollHeight;
        }
      }
    } catch (error) {
      console.log(error instanceof Error ? error.message : error.toString());
    }
  }

  function createDomElement(type, data = {}) {
    const element = document.createElement(type);

    for (const [key, value] of Object.entries(data)) {
      switch (key) {
        case "html":
          element.innerHTML = data.html;
          break;
        case "text":
          element.textContent = data.text;
          break;
        case "css":
          for (const [cssKey, cssValue] of Object.entries(data.css)) {
            element.style[cssKey] = cssValue;
          }
          break;
        default:
          element[key] = value;
          break;
      }
    }

    return element;
  }

  function addStyles(content = "") {
    const style = createDomElement("style", {
      innerHTML: content
    });
    document.head.append(style);
  }

  function dragOverlayHandler(e) {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    e = e || window.event;
    e.preventDefault();
    // Prevent dragging if the target is an input element
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmousemove = (e) => {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      moveOverlay(overlay.offsetLeft - pos1, overlay.offsetTop - pos2);
    };
    // stop moving when mouse button is released:
    document.onmouseup = (e) => {
      document.onmouseup = null;
      document.onmousemove = null;
    };
  }

  function moveOverlay(x, y) {
    const rightBoundary = window.innerWidth - overlay.getBoundingClientRect().width;
    const bottomBoundary = window.innerHeight - overlay.getBoundingClientRect().height;

    overlay.style.left = clamp(x, 0, rightBoundary) + "px";
    overlay.style.top = clamp(y, 0, bottomBoundary) + "px";
  }

  // Helpers
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
})();