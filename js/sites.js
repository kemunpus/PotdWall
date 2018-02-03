/**
 * @author kemunpus
 */

'use strict';

const sites = {
    defaultPotd: 'bing',

    wikimedia: {
        title: "Wikimedia Commons 'Picture of the day'",
        url: 'https://commons.wikimedia.org/wiki/Main_Page',
        apiUrl: 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&generator=images&formatversion=2&iiprop=url&titles=Template%3APotd%2F',
        apiUrlSuffix: '',
        firstKey: 'url',
        secondKey: '',
        baseImageUrl: ''
    },

    nasa: {
        title: "NASA 'Astronomy Picture of the day'",
        url: 'https://apod.nasa.gov/',
        apiUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=',
        apiUrlSuffix: '',
        firstKey: 'url',
        secondKey: '',
        baseImageUrl: ''
    },

    nationalgeographic: {
        title: "National Geographic 'Photo of the day'",
        url: 'https://www.nationalgeographic.com/photography/photo-of-the-day/',
        apiUrl: 'https://www.nationalgeographic.com/photography/photo-of-the-day/_jcr_content/.gallery.',
        apiUrlSuffix: '.json',
        firstKey: 'url',
        secondKey: 'originalUrl',
        baseImageUrl: ''
    },

    bing: {
        title: "Bing 'Photo of the day'",
        url: 'https://www.bing.com/',
        apiUrl: 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&DUMMY=',
        apiUrlSuffix: '',
        firstKey: 'url',
        secondKey: '',
        baseImageUrl: 'http://www.bing.com/'
    },

    setWallpaper: (args) => {
        const potd = sites[args.currentPotd ? args.currentPotd : sites.defaultPotd];
        console.log(`source site: ${potd.title}`);

        const now = new Date();
        const today = now.getUTCFullYear() + '-' + ('00' + (now.getUTCMonth() + 1)).slice(-2) + '-' + ('00' + now.getUTCDate()).slice(-2);

        const apiRequestUrl = potd.apiUrl + today + potd.apiUrlSuffix;
        console.log(`calling api : ${apiRequestUrl}`);

        args.onStart(apiRequestUrl, potd);

        let imageUrl = potd.baseImageUrl;
        let done = false;

        const xmlhttpRequest = new XMLHttpRequest();

        xmlhttpRequest.open('GET', apiRequestUrl, true);
        xmlhttpRequest.setRequestHeader('Pragma', 'no-cache');
        xmlhttpRequest.setRequestHeader('Cache-Control', 'no-cache');

        xmlhttpRequest.onreadystatechange = () => {

            if (xmlhttpRequest.readyState === 4) {

                if (xmlhttpRequest.status === 200) {
                    console.log(`parsing api response : ${xmlhttpRequest.response}`);

                    JSON.parse(xmlhttpRequest.response, (key, value) => {

                        if (!done && value) {

                            if (key === potd.firstKey) {
                                imageUrl += value;

                                if (!potd.secondKey) {
                                    done = true;
                                }

                            } else if (key === potd.secondKey) {
                                imageUrl += value;

                                done = true;
                            }

                            if (done) {
                                console.log(`apply image from url : ${imageUrl}`);
                                args.onApply(imageUrl, potd);
                            }
                        }

                        return value;
                    });

                    if (!done) {
                        console.log(`no image url found: ${apiRequestUrl}`);
                        args.onFail(apiRequestUrl, potd);
                    }

                } else {
                    console.log(`api call failed : ${apiRequestUrl}`);
                    args.onFail(apiRequestUrl, potd);
                }
            }
        };

        xmlhttpRequest.send();
    }
};