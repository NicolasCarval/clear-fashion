/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./sites/dedicatedbrand');
const montlimartbrand = require('./sites/montlimart');
const adresseparisbrand = require('./sites/adresseparis');

const montlimartLink = 'https://www.montlimart.com/toute-la-collection.html?limit=all';
const dedicatedLink = 'https://www.dedicatedbrand.com/en/men/all-men';
const adresseparisLink = 'https://adresse.paris/630-toute-la-collection';

async function sandbox(eshop = dedicatedLink) {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop} source`);

      const products = await dedicatedbrand.scrape(eshop);
      //const products2 = await montlimartbrand.scrape(eshop);
      //const products3 = await adresseparisbrand.scrape(eshop);
      console.log(products);
      //console.log(products2);
      //console.log(products3);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);
