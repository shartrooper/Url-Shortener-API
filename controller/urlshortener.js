const dns = require('dns');
const urlShortenerRouter = require('express').Router();
const Url = require('../model/urls');

urlShortenerRouter.post('/new', async(req, res, next) => {
    const url_input = req.body.url_input;
    const ERROR_MESSAGE = {
        "error": "invalid URL"
    };
    //Save in DB valid URL with an unique number as shortened URL id
    const saveURL = async(urlToSave) => {
        let totalDocs = await Url.estimatedDocumentCount({}, (err, count) => {
            if (err) {
                console.log(err)
            } else {
                return count;
            }
        });

        const newURL = new Url({
            url: urlToSave,
            shortened: totalDocs + 1,
        });
        const savedURL = await newURL.save();
        console.log(savedURL);
        return savedURL.shortened;
    };

    // Async function for dns lookup
    const checkValidSite = async(url) => {
        const hostname = (new URL(url)).hostname;
        async function lookupPromise() {
            return new Promise((resolve, reject) => dns.lookup(hostname, (err, address, family) => (err) ? reject(err) : resolve(address)));
        };
        try {
            const address = await lookupPromise();
            console.log(address);

            const responseSaved = {
                "original_url": url,
                "short_url": await saveURL(url)
            };

            return responseSaved;
        } catch (err) {
            console.error(err);
            return ERROR_MESSAGE;
        }
    };

    if (url_input) {
        let validURL = /^https*:\/\/www\.[a-z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}[/?]?([-a-z0-9@:%_\+.~#?&=]+\/?)*$/i.test(url_input);
        req.url = validURL ? await checkValidSite(url_input) : ERROR_MESSAGE;
    } else {
        req.url = ERROR_MESSAGE;
    }
    next();
}, (req, res) => {
    res.json(req.url);
});

urlShortenerRouter.get('/:short_url', async(req, res, next) => {

    try {
        const findShortUrl = await Url.findOne({
            shortened: req.params.short_url
        });
        console.log(findShortUrl);
        req.foundUrl = findShortUrl ? findShortUrl.url : {
            error: 'Cannot find source from shortened Url'
        };
        next();
    } catch (err) {
        console.error(err);
    }
}, (req, res) => {

    if (req.foundUrl.error) {
        res.status(404).send(req.foundUrl.error);
    } else {
        res.redirect(req.foundUrl);
    }
});

module.exports = urlShortenerRouter;
