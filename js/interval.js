/**
 * @author kemunpus
 */

'use strict';

(() => {
    chrome.storage.local.get(['currentPotd', 'lastImageUrl'], (settings) => {

        sites.setWallpaper({
            potd: settings.currentPotd,
            lastImageUrl: settings.lastImageUrl,
            notify: true,
            callback: () => {
                window.close
            }
        });
    });
})();
