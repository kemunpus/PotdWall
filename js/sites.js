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
        baseUrl: ''
    },

    nasa: {
        title: "NASA 'Astronomy Picture of the day'",
        url: 'https://apod.nasa.gov/',
        apiUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=',
        apiSuffix: '',
        firstKey: 'url',
        secondKey: '',
        baseUrl: ''
    },

    nationalgeographic: {
        title: "National Geographic 'Photo of the day'",
        url: 'https://www.nationalgeographic.com/photography/photo-of-the-day/',
        apiUrl: 'https://www.nationalgeographic.com/photography/photo-of-the-day/_jcr_content/.gallery.',
        apiSuffix: '.json',
        firstKey: 'url',
        secondKey: 'originalUrl',
        baseUrl: ''
    },

    bing: {
        title: "Bing 'Photo of the day'",
        url: 'https://www.bing.com/',
        apiUrl: 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&DUMMY=',
        apiSuffix: '',
        firstKey: 'url',
        secondKey: '',
        baseUrl: 'http://www.bing.com/'
    },

    setWallpaper: (potd, callback) => {

        if (!potd) {
            potd = 'wikimedia';
        }

        const potdSite = sites[potd];

        chrome.storage.local.get(['lastPotd', 'lastApiRequest', 'lastImageUrl'], (settings) => {
            const lastPotd = settings.lastPotd;
            const lastApiRequest = settings.lastApiRequest;
            const lastImageUrl = settings.lastImageUrl;

            const now = new Date();
            const today = now.getUTCFullYear() + '-' + ('00' + (now.getUTCMonth() + 1)).slice(-2) + '-' + ('00' + now.getUTCDate()).slice(-2);

            const apiRequest = potdSite.apiUrl + today + potdSite.apiSuffix;

            if (apiRequest === lastApiRequest) {
                console.log(`api request might be same as the last one : ${lastApiRequest}`);

                sites.setImage(lastPotd, lastApiRequest, lastImageUrl, callback);

                return;
            }

            const xmlhttpRequest = new XMLHttpRequest();

            let done = false;
            let imageUrl = potdSite.baseUrl;

            console.log(`calling api : ${apiRequest}`);

            xmlhttpRequest.open('GET', apiRequest, true);

            xmlhttpRequest.onreadystatechange = () => {

                if (xmlhttpRequest.readyState === 4) {

                    if (xmlhttpRequest.status === 200) {
                        console.log(`parsing api response as json : ${xmlhttpRequest.response}`);

                        JSON.parse(xmlhttpRequest.response, (key, value) => {

                            if (!done && value) {

                                if (key === potdSite.firstKey) {
                                    imageUrl += value;

                                    if (!potdSite.secondKey) {
                                        sites.setImage(potd, apiRequest, imageUrl, callback);

                                        done = true;
                                    }

                                } else if (key === potdSite.secondKey) {
                                    imageUrl += value;

                                    sites.setImage(potd, apiRequest, imageUrl, callback);

                                    done = true;
                                }
                            }

                            return value;
                        });

                        if (!done) {
                            console.log(`no image url: ${apiRequest}`);

                            chrome.notifications.create({
                                type: 'basic',
                                title: chrome.i18n.getMessage('failed'),
                                message: sites[potd].title,
                                iconUrl: '../image/icon-128.png'
                            }, () => { });

                            if (callback) {
                                callback();
                            }
                        }

                    } else {
                        console.log(`api call failed : ${apiRequest}`);

                        chrome.notifications.create({
                            type: 'basic',
                            title: chrome.i18n.getMessage('failed'),
                            message: sites[potd].title,
                            iconUrl: '../image/icon-128.png'
                        }, () => { });

                        if (callback) {
                            callback();
                        }
                    }
                }
            };

            xmlhttpRequest.send();
        });
    },

    setImage: (potd, apiRequest, imageUrl, callback) => {

        if (!apiRequest || !imageUrl) {
            console.log(`invalid url : apiRequest=${imageUrl} imageUrl=${imageUrl}`);

        } else {
            console.log(`loading image from : ${imageUrl}`);

            try {
                chrome.wallpaper.setWallpaper({
                    'url': imageUrl,
                    'filename': potd,
                    'layout': 'CENTER_CROPPED'
                }, () => {

                    if (!callback) {
                        chrome.notifications.create({
                            type: 'basic',
                            title: chrome.i18n.getMessage('updated'),
                            message: sites[potd].title,
                            iconUrl: '../image/icon-128.png'
                        }, () => { });
                    }
                });

            } catch (ex) {
                console.log(ex);
            }
        }

        if (callback) {
            callback();
        }
    }
};