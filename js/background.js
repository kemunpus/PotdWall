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
        console.log('PotdWall alarm fired : ${alaram}');

        if (window.navigator.onLine) {
            console.log('online now - go with interval.html...');

            chrome.app.window.create('html/interval.html', { hidden: true });

        } else {
            console.log('offline now - will be on the next alaram...');
        }
    });

    chrome.app.runtime.onLaunched.addListener(() => {
        chrome.app.window.create('html/options.html');
    });
})();
