/**
 * @author kemunpus
 */

'use strict';

(() => {
    const defaultTick = 5;
    const defaultInterval = (60 - defaultTick);

    const notification = {
        type: 'basic',
        iconUrl: '../image/icon-128.png'
    };

    chrome.storage.local.get(['interval', 'tick'], (settings) => {
        const i = Math.max(parseInt(settings.interval ? settings.interval : defaultInterval, 10), defaultInterval);
        const t = Math.max(parseInt(settings.tick ? settings.tick : defaultTick, 10), defaultTick);

        chrome.storage.local.set({ interval: i, tick: t });

        chrome.alarms.create('PotdWall', { periodInMinutes: t });
        console.log(`alaram interval : ${i} tick : ${t}`);
    });

    chrome.alarms.onAlarm.addListener((alarm) => {

        if (!window.navigator.onLine) {
            console.log(`nothing to do with offline`);
            return;
        }

        chrome.storage.local.get(['next', 'interval', 'currentPotd', 'lastImageUrl'], (settings) => {
            const now = Date.now();

            if (!settings.next || (now < parseInt(settings.next, 10))) {
                console.log(`time ${now} is not reached ${settings.next} yet`);
                return;
            }

            sites.setWallpaper({
                currentPotd: settings.currentPotd,
                lastImageUrl: settings.lastImageUrl,

                onStart: (apiRequestUrl, potd) => {
                    console.log(`background image loading from : ${potd.title}`);
                    chrome.storage.local.set({ next: now + (settings.interval * 60000) });
                },

                onApply: (imageUrl, potd) => {

                    if (settings.lastImageUrl !== imageUrl) {
                        chrome.wallpaper.setWallpaper({ url: imageUrl, filename: potd.title, layout: 'CENTER_CROPPED', thumbnail: true }, (thumbnail) => {
                            chrome.storage.local.set({ lastImageUrl: imageUrl });

                            notification.message = potd.title;
                            notification.title = chrome.i18n.getMessage(thumbnail ? 'success' : 'fail');
                            chrome.notifications.create(notification);
                        });
                    }
                },

                onFail: (apiRequestUrl, potd) => {
                    notification.title = chrome.i18n.getMessage('fail');
                    notification.message = potd.title;
                    chrome.notifications.create(notification);
                }
            });
        });
    });

    chrome.app.runtime.onLaunched.addListener(() => {
        chrome.app.window.create('html/main.html');
    });

})();
