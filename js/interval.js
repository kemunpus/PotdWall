/**
 * @author kemunpus
 */

'use strict';

(() => {

    chrome.storage.local.get(['currentPotd', 'lastImageUrl'], (settings) => {

        sites.setWallpaper({
            potd: settings.currentPotd,
            lastImageUrl: settings.lastImageUrl,

            onSuccess: () => {
                chrome.notifications.create({
                    type: 'basic',
                    title: chrome.i18n.getMessage('success'),
                    message: sites[settings.currentPotd].title,
                    iconUrl: '../image/icon-128.png'
                }, () => { });
            },

            onFail: () => {
                chrome.notifications.create({
                    type: 'basic',
                    title: chrome.i18n.getMessage('fail'),
                    message: sites[settings.currentPotd].title,
                    iconUrl: '../image/icon-128.png'
                }, () => { });
            }
        });

        window.close();

    });

})();
