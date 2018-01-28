/**
 * @author kemunpus
 */

'use strict';

const sites = {
    defaultPotd: 'wikimedia',

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

    setWallpaper: (param) => {
        const potd = param.potd ? param.potd : sites.defaultPotd;
        const potdSite = sites[potd];
        const now = new Date();

        const today = now.getUTCFullYear() + '-' + ('00' + (now.getUTCMonth() + 1)).slice(-2) + '-' + ('00' + now.getUTCDate()).slice(-2);
        const apiRequest = potdSite.apiUrl + today + potdSite.apiSuffix;

        let done = false;
        let imageUrl = potdSite.baseUrl;

        const xmlhttpRequest = new XMLHttpRequest();

        xmlhttpRequest.open('GET', apiRequest, true);
        xmlhttpRequest.setRequestHeader('Pragma', 'no-cache');
        xmlhttpRequest.setRequestHeader('Cache-Control', 'no-cache');

        xmlhttpRequest.onreadystatechange = () => {

            if (xmlhttpRequest.readyState === 4) {

                if (xmlhttpRequest.status === 200) {
                    JSON.parse(xmlhttpRequest.response, (key, value) => {

                        if (!done && value) {

                            if (key === potdSite.firstKey) {
                                imageUrl += value;

                                if (!potdSite.secondKey) {
                                    done = true;
                                }

                            } else if (key === potdSite.secondKey) {
                                imageUrl += value;

                                done = true;
                            }

                            if (done) {
                                sites.setImage({
                                    potd: potd,
                                    imageUrl: imageUrl,
                                    onSuccess: param.onSuccess,
                                    onFail: param.onFail
                                });
                            }
                        }

                        return value;
                    });

                    if (!done) {
                        param.onFail();
                    }

                } else {
                    param.onFail();
                }
            }
        };

        xmlhttpRequest.send();
    },

    setImage: (param) => {
        chrome.storage.local.get(['lastImageUrl', 'interval'], (settings) => {
            const next = Date.now() + (settings.interval * 60000);
            chrome.storage.local.set({ next: next });
            chrome.storage.local.set({ log_next: new Date(next).toString() });

            if (settings.lastImageUrl !== param.imageUrl) {

                try {
                    chrome.wallpaper.setWallpaper({ 'url': param.imageUrl, 'filename': param.potd, 'layout': 'CENTER_CROPPED' }, () => {
                        chrome.storage.local.set({ lastImageUrl: param.imageUrl });
                        param.onSuccess();
                    });

                } catch (e) {
                    param.onFail();
                }
            }
        });
    }
};