/**
 * @author kemunpus
 */

'use strict';

(() => {

    chrome.storage.local.get('interval', (settings) => {
        const i = parseInt(settings.interval ? settings.interval : 60, 10);

        chrome.storage.local.set({ interval: i, start: new Date().toLocaleString() });

        chrome.alarms.create('PotdWall', { periodInMinutes: i });
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
        chrome.storage.local.set({ alarm: new Date().toLocaleString() });

        if (window.navigator.onLine) {
            chrome.app.window.create('html/interval.html', { hidden: true });
        }
    });

    chrome.app.runtime.onLaunched.addListener(() => {
        chrome.app.window.create('html/options.html');
    });

})();
