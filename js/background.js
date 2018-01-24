/**
 * @author kemunpus
 */

'use strict';

(() => {
    chrome.storage.local.get('interval', (settings) => {
        const i = parseInt(settings.interval ? settings.interval : '60', 10);

        console.log(`PotdWall alaram Interval is : ${i}`);

        chrome.storage.local.set({ interval: i });

        chrome.alarms.create('checkUpdate', { periodInMinutes: i });
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
        const now = new Date();

        chrome.storage.local.set({ lastAlaram: now });

        if (window.navigator.onLine) {
            chrome.storage.local.set({ lastOnline: now });

            chrome.app.window.create('html/interval.html', { hidden: true });
        }
    });

    chrome.app.runtime.onLaunched.addListener(() => {
        chrome.app.window.create('html/options.html');
    });
})();
