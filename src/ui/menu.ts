/* tslint:disable:no-reference */
/// <reference path="../models/interface.ts" />
/// <reference path="./ui.ts" />

function getVersion() {
  return chrome.runtime.getManifest().version;
}

async function syncTimeWithGoogle() {
  return new Promise(
      (resolve: (value: string) => void, reject: (reason: Error) => void) => {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('HEAD', 'https://www.google.com/generate_204');
          const xhrAbort = setTimeout(() => {
            xhr.abort();
            return resolve('updateFailure');
          }, 5000);
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              clearTimeout(xhrAbort);
              const date = xhr.getResponseHeader('date');
              if (!date) {
                return resolve('updateFailure');
              }
              const serverTime = new Date(date).getTime();
              const clientTime = new Date().getTime();
              const offset = Math.round((serverTime - clientTime) / 1000);

              if (Math.abs(offset) <= 300) {  // within 5 minutes
                localStorage.offset =
                    Math.round((serverTime - clientTime) / 1000);
                return resolve('updateSuccess');
              } else {
                return resolve('clock_too_far_off');
              }
            }
          };
          xhr.send();
        } catch (error) {
          return reject(error);
        }
      });
}

function resize(zoom: number) {
  if (zoom !== 100) {
    document.body.style.marginBottom = 480 * (zoom / 100 - 1) + 'px';
    document.body.style.marginRight = 320 * (zoom / 100 - 1) + 'px';
    document.body.style.transform = 'scale(' + (zoom / 100) + ')';
  }
}

function openHelp() {
  let url =
      'https://github.com/Authenticator-Extension/Authenticator/wiki/Chrome-Issues';

  if (navigator.userAgent.indexOf('Chrome') !== -1) {
    url =
        'https://github.com/Authenticator-Extension/Authenticator/wiki/Chrome-Issues';
  } else if (navigator.userAgent.indexOf('Firefox') !== -1) {
    url =
        'https://github.com/Authenticator-Extension/Authenticator/wiki/Firefox-Issues';
  }

  window.open(url, '_blank');
}

async function menu(_ui: UI) {
  const version = getVersion();
  const zoom = Number(localStorage.zoom) || 100;
  resize(zoom);

  const ui: UIConfig = {
    data: {version, zoom},
    methods: {
      openLink: (url: string) => {
        window.open(url, '_blank');
        return;
      },
      showMenu: () => {
        _ui.instance.class.slidein = true;
        _ui.instance.class.slideout = false;
        return;
      },
      closeMenu: () => {
        _ui.instance.class.slidein = false;
        _ui.instance.class.slideout = true;
        setTimeout(() => {
          _ui.instance.class.slideout = false;
        }, 200);
        return;
      },
      openHelp: () => {
        openHelp();
        return;
      },
      isChrome: () => {
        if (navigator.userAgent.indexOf('Chrome') !== -1) {
          return true;
        } else {
          return false;
        }
      },
      saveZoom: () => {
        localStorage.zoom = _ui.instance.zoom;
        resize(_ui.instance.zoom);
        return;
      },
      syncClock: async () => {
        chrome.permissions.request(
            {origins: ['https://www.google.com/']}, async (granted) => {
              if (granted) {
                const message = await syncTimeWithGoogle();
                _ui.instance.alert(_ui.instance.i18n[message]);
              }
              return;
            });
        return;
      },
      toggleDarkMode: () => {
        const isDarkMode = localStorage.darkMode === 'true';
        localStorage.darkMode = (!isDarkMode).toString();
        document.body.classList.toggle('dark-mode');
        return;
      },
      updateSearch: () => {
        // Search filtering is handled by Vue computed property
        return;
      },
      isMatchedEntry: (entry: OTPEntry) => {
        const query = _ui.instance.searchQuery || '';
        if (!query) return true;
        const searchLower = query.toLowerCase();
        return entry.issuer.toLowerCase().includes(searchLower) ||
               entry.account.toLowerCase().includes(searchLower);
      },
      copyCode: (entry: OTPEntry) => {
        if (entry.code && entry.code !== '&bull;&bull;&bull;&bull;&bull;&bull;') {
          const clipboard = document.getElementById('codeClipboard') as HTMLInputElement;
          if (clipboard) {
            clipboard.value = entry.code;
            clipboard.select();
            document.execCommand('copy');
            _ui.instance.showNotification('Code copied!');
          }
        }
        return;
      },
      showNotification: (message: string) => {
        _ui.instance.notification = message;
        _ui.instance.class.notificationFadein = true;
        _ui.instance.class.notificationFadeout = false;
        setTimeout(() => {
          _ui.instance.class.notificationFadein = false;
          _ui.instance.class.notificationFadeout = true;
        }, 2000);
        return;
      }
    }
  };

  _ui.update(ui);
}
