/**
 * @author kemunpus
 */

'use strict';

(() => {
    chrome.storage.local.get('currentPotd', (settings) => {
        console.log('interval page - trying to update the wallpaper...');

        sites.setWallpaper(settings.currentPotd, null);
    });

    window.close();
})();
