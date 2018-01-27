/**
 * @author kemunpus
 */

'use strict';

(() => {

    for (let element of document.getElementsByTagName('html')) {
        element.innerHTML = element.innerHTML.toString().replace(/__MSG_(\w+)__/g, (match, value) => {
            return value ? chrome.i18n.getMessage(value) : '';
        });
    }

    chrome.storage.local.get(['currentPotd', 'interval'], (settings) => {

        interval.innerHTML = interval.innerHTML.toString().replace(/_INTERVAL_/g, (match, value) => {
            return settings.interval;
        });

        const currentPotd = settings.currentPotd ? settings.currentPotd : sites.defaultPotd;

        for (let potd in sites) {

            if (sites[potd].title) {
                const option = document.createElement('option');

                if (potd === currentPotd) {
                    option.setAttribute('selected', 'selected');
                    site.setAttribute('href', sites[potd].url);
                }

                option.setAttribute('value', potd);
                option.innerHTML = sites[potd].title;

                potdList.appendChild(option);
            }
        }

        potdList.onchange = () => {
            site.setAttribute('href', sites[potdList.value].url);
        };

        save.onclick = () => {
            icon.src = '../image/loader-100x100.gif';
            save.disabled = true;

            chrome.storage.local.set({ currentPotd: potdList.value, lastImageUrl: '' });

            sites.setWallpaper({
                potd: potdList.value,
                lastImageUrl: '',

                onSuccess: () => {
                    icon.src = '../image/icon-128.png';
                    save.disabled = false;
                    message.innerHTML = ''; // chrome.i18n.getMessage('success');
                },

                onFail: () => {
                    icon.src = '../image/icon-128.png';
                    save.disabled = false;
                    message.innerHTML = chrome.i18n.getMessage('fail');
                }
            });
        };

        icon.src = '../image/icon-128.png';
    });

})();
