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

    chrome.storage.local.get(['currentPotd', 'interval', 'tick', 'lastImageUrl'], (settings) => {
        const normalIcon = icon.src;
        const loaderIcon = '../image/loader-100.gif';
        const currentPotd = settings.currentPotd ? settings.currentPotd : sites.defaultPotd;
        const totalInterval = parseInt(settings.interval, 10) + parseInt(settings.tick, 10);

        interval.innerHTML = interval.innerHTML.toString().replace(/_INTERVAL_/g, (match, value) => {
            return totalInterval.toString();
        });

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
            sites.setWallpaper({
                currentPotd: potdList.value,
                lastImageUrl: settings.lastImageUrl,

                onStart: (apiRequestUrl, potd) => {
                    icon.src = loaderIcon;
                    message.innerHTML = '';
                    save.disabled = true;
                },

                onApply: (imageUrl, potd) => {
                    chrome.wallpaper.setWallpaper({ url: imageUrl, filename: potd.title, layout: 'CENTER_CROPPED', thumbnail: true }, (thumbnail) => {

                        if (thumbnail) {
                            chrome.storage.local.set({ currentPotd: potdList.value, lastImageUrl: imageUrl, next: Date.now() + (settings.interval * 60000) });

                        } else {
                            message.innerHTML = chrome.i18n.getMessage('fail');
                        }

                        icon.src = normalIcon;
                        save.disabled = false;
                    });
                },

                onFail: (apiRequestUrl, potd) => {
                    icon.src = normalIcon;
                    message.innerHTML = chrome.i18n.getMessage('fail');
                    save.disabled = false;
                }
            });
        };

        save.disabled = !window.navigator.onLine;
    });

})();
