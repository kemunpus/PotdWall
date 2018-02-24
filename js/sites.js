/**
 * @author kemunpus
 */

'use strict';

const sites = {
    defaultPotd: 'bing',

    wikimedia: {
        title: "Wikimedia Commons 'Picture of the day'",
        url: 'https://commons.wikimedia.org/wiki/Main_Page',
        apiUrl: 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&generator=images&formatversion=2&iiprop=url&titles=Template%3APotd%2FTODAY',
        getImageUrl: (json) => {
            return json.query.pages[0].imageinfo[0].url;
        }
    },

    nasa: {
        title: "NASA 'Astronomy Picture of the day'",
        url: 'https://apod.nasa.gov/',
        apiUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=TODAY',
        getImageUrl: (json) => {
            return json.url;
        }
    },

    nationalgeographic: {
        title: "National Geographic 'Photo of the day'",
        url: 'https://www.nationalgeographic.com/photography/photo-of-the-day/',
        apiUrl: 'https://www.nationalgeographic.com/photography/photo-of-the-day/_jcr_content/.gallery.TODAY.json',
        getImageUrl: (json) => {
            return json.items[0].url + json.items[0].originalUrl;
        }
    },

    bing: {
        title: "Bing 'Photo of the day'",
        url: 'https://www.bing.com/',
        apiUrl: 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&DUMMY=TODAY',
        getImageUrl: (json) => {
            return 'http://www.bing.com/' + json.images[0].url;
        }
    },

    setWallpaper: (args) => {
        const potd = sites[args.currentPotd ? args.currentPotd : sites.defaultPotd];
        console.log(`source site: ${potd.title}`);

        const now = new Date();
        const today = now.getUTCFullYear() + '-' + String(now.getUTCMonth() + 1).padStart(2, '0') + '-' + String(now.getUTCDate()).padStart(2, '0');

        const apiRequestUrl = potd.apiUrl.replace('TODAY', today);
        console.log(`calling api : ${apiRequestUrl}`);

        args.onStart(apiRequestUrl, potd);

        fetch(apiRequestUrl).then((response) => {

            if (response.ok) {
                return response.json();

            } else {
                throw new Error();
            }

        }).then((json) => {
            // console.log(JSON.stringify(json));

            const imageUrl = potd.getImageUrl(json);
            console.log(`apply image from url : ${imageUrl}`);
            args.onApply(imageUrl, potd);

        }).catch((error) => {
            console.log(`api call failed : ${apiRequestUrl}`);
            args.onFail(apiRequestUrl, potd);
        });
    }
};