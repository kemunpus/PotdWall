/**
 * @author kemunpus
 */

'use strict';

(() => {
    chrome.storage.local.get('currentPotd', (settings) => {
        const now = new Date();
        chrome.storage.local.set({ lastInterval: now });

        sites.setWallpaper(settings.currentPotd, null);
    });

    window.close();
})();
