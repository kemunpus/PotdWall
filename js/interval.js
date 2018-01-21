/**
 * @author kemunpus
 */

'use strict';

(() => {
    chrome.storage.local.get('currentPotd', (settings) => {
        sites.setWallpaper(settings.currentPotd, null);
    });

    window.close();
})();
