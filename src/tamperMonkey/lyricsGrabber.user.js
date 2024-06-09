// ==UserScript==
// @name         Lyric Grabber
// @namespace    https://oceanity.github.io
// @version      0.7.0
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

  // Consts
  const lyricUrlRegex = /https:\/\/spclient\.wg\.spotify\.com\/color-lyrics\/v2\/track\/([a-zA-Z0-9]+)\/image\/.+/;

  // Storage Keys
  const FIREBOT_HOST_KEY = "firebotHost";
  const FIREBOT_SAVED_IDS_KEY = "firebotSavedIds";

  // Fetch storage
  let firebotHost = localStorage.getItem(FIREBOT_HOST_KEY);
  let savedLyricIds = JSON.parse(localStorage.getItem(FIREBOT_SAVED_IDS_KEY) ?? "[]");

  if (!firebotHost) {
    console.log("No Firebot Host found in Local storage, setting to default");
    firebotHost = "http://localhost:7472";
    localStorage.setItem(FIREBOT_HOST_KEY, firebotHost);
  }

  const firebotApiUrl = () => `${firebotHost}/integrations/oceanity-spotify/lyrics`;

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

  // Create Modal
  const startOffsetTop = localStorage.getItem("modalOffsetTop") ?? "20";
  const startOffsetLeft = localStorage.getItem("modalOffsetLeft") ?? "310";

  const pluginCss = createDomElement("style", `
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
  document.head.append(pluginCss);

  // Create UI Overlay
  const overlay = createDomElement("div", "", {
    id: "firebot-lyric-grabber-overlay",
    css: {
      position: "absolute",
      borderRadius: "10px",
      top: `${startOffsetTop}px`,
      left: `${startOffsetLeft}px`,
      width: "360px",
      overflow: "hidden",
      color: "#fff",
      textShadow: "1px 1px 2px #000",
      backgroundColor: "rgba(0,45,70,0.8)",
      zIndex: 9999
    },
  });

  const overlayHeader = createDomElement("div", "", {
    id: "firebot-lyric-grabber-overlay-header",
    css: {
      height: "20px",
      background: "rgba(0,25,50,0.5)",
      cursor: "move"
    }
  });
  overlay.append(overlayHeader);


  const connectionPanel = createDomElement("div", "", {
    css: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      padding: "4px 10px",
    }
  });
  overlay.append(connectionPanel);

  //#region Lyrics connected
  const lyricsConnectedRow = createDomElement("div", "", {
    className: "oceanity-spotify-connection-row",
  });
  connectionPanel.append(lyricsConnectedRow);
  const lyricsConnectedLight = createDomElement("div", "", {
    className: "oceanity-spotify-connection-light",
  });
  lyricsConnectedRow.append(lyricsConnectedLight);
  const lyricsConnectedText = createDomElement("span", "Disconnected from Spotify Lyrics, go to <a href='/lyrics'>lyrics</a>", {
    className: "oceanity-spotify-connection-text"
  });
  lyricsConnectedRow.append(lyricsConnectedText);
  async function checkLyrics() {
    if (window.location.pathname === "/lyrics") {
      lyricsConnectedLight.style.background = "green";
      lyricsConnectedText.innerHTML = "Connected to Spotify Lyrics";
    } else {
      lyricsConnectedLight.style.background = "red";
      lyricsConnectedText.innerHTML = "Disconnected from Spotify Lyrics, go to <a href='/lyrics'>lyrics</a>";
      setTimeout(checkLyrics, 1000);
    }
  }
  checkLyrics();
  //#endregion

  //#region Firebot connected
  const firebotConnectedRow = createDomElement("div", "", {
    className: "oceanity-spotify-connection-row",
  });
  connectionPanel.append(firebotConnectedRow);
  const firebotConnectedLight = createDomElement("div", "", {
    className: "oceanity-spotify-connection-light",
  });
  firebotConnectedRow.append(firebotConnectedLight);
  const firebotConnectedText = createDomElement("span", "Disconnected from Firebot", {
    className: "oceanity-spotify-connection-text"
  });
  firebotConnectedRow.append(firebotConnectedText);
  async function checkFirebot() {
    try {
      const firebotResponse = await originalFetch(`${firebotApiUrl()}/ping`);

      const firebotConnected = firebotResponse.ok;
      if (firebotConnected) {
        firebotConnectedLight.style.background = "green";
        firebotConnectedText.innerHTML = "Connected to Firebot";
        return;
      }
    } catch (error) {}
    firebotConnectedLight.style.background = "red";
    firebotConnectedText.innerHTML = "Disconnected from Firebot";
    setTimeout(checkFirebot, 1000);
  }
  checkFirebot();
  //#endregion

  const overlayBody = createDomElement("div", `
      <h2>Lyrics Grabber <span style="font-size:0.75em; color: rgba(255,255,255,0.7)">(by Oceanity)</span></h2>
      <label>Firebot Host</label>
  `, {
    css: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      padding: "10px"
    }
  });
  overlay.append(overlayBody);

  const overlayHostInput = createDomElement("input", "", {
    name: "firebot-hostname",
    id: "firebot-hostname",
    type: "text",
    value: firebotHost,
    css: {
      color: "navy"
    }
  });
  let timeoutToSaveHost;
  overlayHostInput.addEventListener("input", (e) => {
    if (timeoutToSaveHost) clearTimeout(timeoutToSaveHost);
    firebotHost = e.target.value;
    timeoutToSaveHost = setTimeout(() => {
      console.log("Saved host to local storage");
      localStorage.setItem(FIREBOT_HOST_KEY, firebotHost);
    }, 5000);
  });
  overlayBody.append(overlayHostInput);

  const overlayLog = createDomElement("textarea", "Log:", {
    readOnly: true,
    css: {
      padding: "5px",
      minHeight: "160px",
      overflowX: "hidden",
      overflowY: "auto",
      color: "#ddd",
      background: "rgba(0, 0, 0, 0.5)",
      userSelect: "none",
      fontSize: "10px",
      fontFamily: "monospace",
      resize: "vertical",
      border: 0
    }
  });
  overlayBody.append(overlayLog);

  document.body.prepend(overlay);

  dragElement(overlay);

  // Firebot functions
  async function saveLyricsToFirebotAsync(id, data) {
    try {
      if (savedLyricIds.includes(id)) return;

      const firebotResponse = await originalFetch(`${firebotApiUrl()}/save`, {
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
        savedLyricIds.push(id);
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

  // Draggable element functions
  function dragElement(elmnt) {
    var pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    if (document.getElementById(elmnt.id + "-header")) {
      // if present, the header is where you move the DIV from:
      document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // Prevent dragging if the target is an input element
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;

      localStorage.setItem("modalOffsetTop", elmnt.offsetTop);
      localStorage.setItem("modalOffsetLeft", elmnt.offsetLeft);
    }
  }

  function createDomElement(type, content = "", data = {}) {
    const element = document.createElement(type);
    element.innerHTML = content;

    for (const [key, value] of Object.entries(data)) {
      switch (key) {
        case "css":
          for (const [cssKey, cssValue] of Object.entries(data.css)) {
            element.style[cssKey] = cssValue;
          }
          break;
        case "parent":
          if (data.prepend) data.parent.prepend(element);
          else data.parent.append(element);
          break;
        default:
          element[key] = value;
          break;
      }
    }

    return element;
  }
})();