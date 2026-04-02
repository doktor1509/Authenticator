/* tslint:disable:no-reference */
/// <reference path="../models/interface.ts" />
/// <reference path="./ui.ts" />

async function className(_ui: UI) {
  // Load dark mode preference
  const isDarkMode = localStorage.darkMode === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }

  const ui: UIConfig = {
    data: {
      class: {
        timeout: false,
        edit: false,
        slidein: false,
        slideout: false,
        fadein: false,
        fadeout: false,
        qrfadein: false,
        qrfadeout: false,
        notificationFadein: false,
        notificationFadeout: false,
        hotpDiabled: false
      },
      searchQuery: '',
      notification: ''
    }
  };

  _ui.update(ui);
}
