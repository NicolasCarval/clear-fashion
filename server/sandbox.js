/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./sites/dedicatedbrand');
const montlimartbrand = require('./sites/montlimart');
const adresseparisbrand = require('./sites/adresseparis');

const fs = require('fs');

const links = {
    'montlimartLink': 'https://www.montlimart.com/toute-la-collection.html?limit=all',
    'dedicatedLink': 'https://www.dedicatedbrand.com/en/men/all-men',
    'adresseparisLink': 'https://adresse.paris/630-toute-la-collection'
}

async function sandbox(eshop = "eshop") {
    try {
        console.log(`🕵️‍♀️  browsing ${eshop} source`);

        const products = await dedicatedbrand.scrape(links["dedicatedLink"]);
        console.log("dedicated is done")
        const products2 = await montlimartbrand.scrape(links["montlimartLink"]);
        console.log("montlimart is done")
        const products3 = await adresseparisbrand.scrape(links["adresseparisLink"]);
        console.log("adresse paris is done")

        const finalProducts = products.concat(products2, products3);
        console.log(finalProducts.length);

        fs.writeFileSync("./products.json", JSON.stringify(finalProducts, null, 4));

        console.log('done');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

const [, , eshop] = process.argv;

sandbox(eshop);
