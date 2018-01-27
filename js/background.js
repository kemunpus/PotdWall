/**
 * @author kemunpus
 */

'use strict';

(() => {

    chrome.storage.local.get(['interval', 'tick', 'next'], (settings) => {
        const interval = parseInt(settings.interval ? settings.interval : 60, 10);
        const tick = parseInt(settings.tick ? settings.tick : 5, 10);

        chrome.storage.local.set({ interval: interval, tick: tick });

        chrome.alarms.create('PotdWall', { periodInMinutes: tick });
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
        const now = new Date().toString();

        chrome.storage.local.set({ log_tick: now });

        if (window.navigator.onLine) {
            chrome.storage.local.get('next', (settings) => {

                if (settings.next && (Date.now() > parseInt(settings.next, 10))) {
                    chrome.storage.local.set({ log_interval: now });

                    chrome.app.window.create('html/interval.html', { hidden: true });
                }
            });
        }
    });

    chrome.app.runtime.onLaunched.addListener(() => {
        chrome.app.window.create('html/options.html');
    });

})();
