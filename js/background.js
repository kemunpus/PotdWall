/**
 * @author kemunpus
 */

'use strict';

(() => {
    chrome.alarms.create('checkUpdate', { periodInMinutes: 60 });

    chrome.alarms.onAlarm.addListener((alarm) => {

        if (window.navigator.onLine) {
            chrome.app.window.create('html/interval.html', { hidden: true });
        }
    });

    chrome.app.runtime.onLaunched.addListener(() => {
        chrome.app.window.create('html/options.html');
    });
})();
