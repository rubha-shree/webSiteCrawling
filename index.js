const requestPromise = require('request-promise');
const PromisePool = require('es6-promise-pool');
let urlsToBeCrawled = new Set(['https://medium.com']);
const dbConnection = require('./dbconnection');
const crawlDataDbSchema = require('./crawlData');
const url = require('url');
global.URLSearchParams = url.URLSearchParams;

const cheerio = require('cheerio');


let promiseProducer = () => {
    let nextUrl = [...urlsToBeCrawled].pop();

    urlsToBeCrawled.delete(nextUrl);

    return nextUrl ? crawl(nextUrl) : null;
}

let concurrency = 5;

let pool = new PromisePool(promiseProducer, concurrency)

let main = async () => {
    // Start the pool. 
    try {
        let poolResponse = await pool.start();
        console.log(poolResponse);
    } catch (error) {
        console.log('POOL Error', error);
    }
}

let crawl = async (url) => {
    try {
        let response = await requestPromise(url);
        let $ = cheerio.load(response);
        let i = 1;
        $('a').each(async (index, value) => {
            var link = $(value).attr('href');
            console.log(i++);
            console.log(link);
            let host = link.split('?')[0];
            let paramKeys = new URLSearchParams(link.split('?')[1]).keys();
            try {
                let isUrlexists = await crawlDataDbSchema.find({"url": host}).exec();
                if (isUrlexists && isUrlexists.length > 0) {
                    console.log('URL Exists');
                    let paramsSet = new Set(isUrlexists[0]['params']);
                    for (let key of paramKeys) {
                        paramsSet.add(key);
                    }

                    let crawlDataModel = new crawlDataDbSchema({
                        url: host,
                        params: [...paramsSet]
                    });

                    let crawlDataModelObject = crawlDataModel.toObject();

                    delete crawlDataModelObject._id;

                    let updateCrawl = await crawlDataDbSchema.updateOne(
                        {
                            'url': host
                        },
                        crawlDataModelObject,
                        {}
                    ).exec();
                } else {
                    console.log('URL does not exists');
                    let paramsArray = [];
                    for (let key of paramKeys) {
                        paramsArray.push(key);
                    }

                    let crawlDataModel = new crawlDataDbSchema({
                        url: host,
                        params: paramsArray
                    });

                    let saveCrawlData = await crawlDataModel.save();
                }
            } catch(error) {
                console.log('DB error', error);
            }
            urlsToBeCrawled.add(link);
         });

    } catch(error) {
        console.log(error);
    }
}

main();



