/**
 * @author kemunpus
 */

'use strict';

const sites = {

    wikimedia: {
        title: "Wikimedia Commons 'Picture of the day'",
        url: 'https://commons.wikimedia.org/wiki/Main_Page',
        apiUrl: 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&generator=images&formatversion=2&iiprop=url&titles=Template%3APotd%2F',
        apiSuffix: '',
        firstKey: 'url',
        secondKey: '',
        validExt: '.jpg'
    },

    nasa: {
        title: "NASA 'Astronomy Picture of the day'",
        url: 'https://apod.nasa.gov/',
        apiUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=',
        apiSuffix: '',
        firstKey: 'url',
        secondKey: '',
        validExt: '.jpg'
    },

    nationalgeographic: {
        title: "National Geographic 'Photo of the day'",
        url: 'https://www.nationalgeographic.com/photography/photo-of-the-day/',
        apiUrl: 'https://www.nationalgeographic.com/photography/photo-of-the-day/_jcr_content/.gallery.',
        apiSuffix: '.json',
        firstKey: 'url',
        secondKey: 'originalUrl',
        validExt: ''
    },

    setWallpaper: (potd) => {

        if (!potd) {
            potd = 'wikimedia';
        }

        const potdSite = sites[potd];

        chrome.storage.local.get(['lastPotd', 'lastApiRequest', 'lastImageUrl'], (settings) => {
            const lastPotd = settings.lastPotd;
            const lastApiRequest = settings.lastApiRequest;
            const lastImageUrl = settings.lastImageUrl;

            const now = new Date();
            const utc = new Date(now.valueOf() + now.getTimezoneOffset() * 60000);
            const today = utc.getFullYear() + '-' + ('00' + (utc.getMonth() + 1)).slice(-2) + '-' + ('00' + utc.getDate()).slice(-2);

            const apiRequest = potdSite.apiUrl + today + potdSite.apiSuffix;

            if (apiRequest === lastApiRequest) {
                console.log(`api request might be same as the last one : ${lastApiRequest}`);

                sites.setImage(lastPotd, lastApiRequest, lastImageUrl);

                return;
            }

            const xmlhttpRequest = new XMLHttpRequest();

            let done = false;
            let imageUrl = '';

            console.log(`calling api : ${apiRequest}`);

            xmlhttpRequest.open('GET', apiRequest, true);

            xmlhttpRequest.onreadystatechange = () => {

                if (xmlhttpRequest.readyState === 4) {

                    if (xmlhttpRequest.status === 200) {
                        console.log(`parsing api response as json : ${xmlhttpRequest.response}`);

                        JSON.parse(xmlhttpRequest.response, (key, value) => {

                            if (!done && value) {

                                if (key === potdSite.firstKey) {

                                    if (!potdSite.validExt || value.endsWith(potdSite.validExt)) {
                                        imageUrl = value;

                                        if (!potdSite.secondKey) {
                                            sites.setImage(potd, apiRequest, imageUrl);

                                            done = true;
                                        }
                                    }

                                } else if (key === potdSite.secondKey) {

                                    if (!potdSite.validExt || value.endsWith(potdSite.validExt)) {
                                        imageUrl += value;

                                        sites.setImage(potd, apiRequest, imageUrl);

                                        done = true;
                                    }
                                }
                            }

                            return value;
                        });

                    } else {
                        console.log(`api call failed : ${apiRequest}`);

                        chrome.notifications.create({
                            type: 'basic',
                            title: chrome.i18n.getMessage('failed'),
                            message: sites[potd].title,
                            iconUrl: '../image/icon-128.png'
                        }, () => { });
                    }
                }
            };

            xmlhttpRequest.send();
        });
    },

    setImage: (potd, apiRequest, imageUrl) => {

        if (!apiRequest || !imageUrl) {
            console.log(`invalid url : apiRequest=${imageUrl} imageUrl=${imageUrl}`);

            return;
        }

        console.log(`loading image from : ${imageUrl}`);

        chrome.wallpaper.setWallpaper({
            'url': imageUrl,
            'filename': potd,
            'layout': 'CENTER_CROPPED'
        }, () => {

            chrome.notifications.create({
                type: 'basic',
                title: chrome.i18n.getMessage('updated'),
                message: sites[potd].title,
                iconUrl: '../image/icon-128.png'
            }, () => { });
        });
    }
};