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

    setWallpaper: (param) => {
        const potd = param.potd ? param.potd : 'wikimedia';
        const potdSite = sites[potd];
        const now = Date();

        console.log(`Loading image from : ${potd} at : ${now}`);

        const today = now.getUTCFullYear() + '-' + ('00' + (now.getUTCMonth() + 1)).slice(-2) + '-' + ('00' + now.getUTCDate()).slice(-2);
        const apiRequest = potdSite.apiUrl + today + potdSite.apiSuffix;

        let done = false;
        let imageUrl = potdSite.baseUrl;

        console.log(`calling api : ${apiRequest}`);

        const xmlhttpRequest = new XMLHttpRequest();

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
                                    sites.setImage({
                                        potd: potd,
                                        apiRequest: apiRequest,
                                        imageUrl: imageUrl,
                                        lastImageUrl: param.lastImageUrl,
                                        notify: param.notify,
                                        callback: param.callback
                                    });

                                    done = true;
                                }

                            } else if (key === potdSite.secondKey) {
                                imageUrl += value;

                                sites.setImage({
                                    potd: potd,
                                    apiRequest: apiRequest,
                                    imageUrl: imageUrl,
                                    lastImageUrl: param.lastImageUrl,
                                    notify: param.notify,
                                    callback: param.callback
                                });

                                done = true;
                            }
                        }

                        return value;
                    });

                    if (!done) {
                        console.log(`no image url: ${apiRequest}`);

                        if (param.notify) {
                            chrome.notifications.create({
                                type: 'basic',
                                title: chrome.i18n.getMessage('failed'),
                                message: sites[potd].title,
                                iconUrl: '../image/icon-128.png'
                            }, () => { });
                        }

                        param.callback();
                    }

                } else {
                    console.log(`api call failed : ${apiRequest}`);

                    if (param.notify) {
                        chrome.notifications.create({
                            type: 'basic',
                            title: chrome.i18n.getMessage('failed'),
                            message: sites[potd].title,
                            iconUrl: '../image/icon-128.png'
                        }, () => { });
                    }

                    param.callback();
                }
            }
        };

        xmlhttpRequest.send();
    },

    setImage: (param) => {

        if (param.lastImageUrl === param.imageUrl) {
            console.log(`imageUrl is same as previouse one : ${param.imageUrl}`);

            return;
        }

        console.log(`loading image from : ${param.imageUrl}`);

        try {
            chrome.wallpaper.setWallpaper({
                'url': param.imageUrl,
                'filename': param.potd,
                'layout': 'CENTER_CROPPED'
            }, () => {
                chrome.storage.local.set({
                    lastImageUrl: param.imageUrl
                });

                param.callback();

                if (param.notify) {
                    chrome.notifications.create({
                        type: 'basic',
                        title: chrome.i18n.getMessage('updated'),
                        message: sites[param.potd].title,
                        iconUrl: '../image/icon-128.png'
                    }, () => { });
                }
            });

        } catch (ex) {
            param.callback();

            console.log(ex);
        }
    }
};