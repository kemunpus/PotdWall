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

    chrome.storage.local.get('currentPotd', (settings) => {

        for (let potd in sites) {

            if (sites[potd].title) {
                const option = document.createElement('option');

                if (potd === settings.currentPotd) {
                    option.setAttribute('selected', 'selected');
                    site.setAttribute("href", sites[potd].url);
                    site.innerHTML = sites[potd].url;
                }

                option.setAttribute('value', potd);
                option.innerHTML = sites[potd].title;

                potdList.appendChild(option);
            }
        }

        potdList.onchange = () => {
            const url = sites[potdList.value].url;
            site.setAttribute("href", url);
            site.innerHTML = url;
        };

        save.onclick = () => {
            chrome.storage.local.set({
                currentPotd: potdList.value,
                lastPotd: '',
                lastApiRequest: '',
                lastImageUrl: ''
            });

            sites.setWallpaper(potdList.value);
        };

    });
})();
