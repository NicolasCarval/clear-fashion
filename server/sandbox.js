/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./sites/dedicatedbrand');
const montlimartbrand = require('./sites/montlimart');
const adresseparisbrand = require('./sites/adresseparis');

const jsonProducts = require('./products2.json');

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
        console.log("dedicated is done :", products.length)
        
        const products2 = await montlimartbrand.scrape(links["montlimartLink"]);
        console.log("montlimart is done :", products2.length)

        const products3 = await adresseparisbrand.scrape(links["adresseparisLink"]);
        console.log("adresse paris is done :", products3.length)

        const finalProducts = products.concat(products2, products3);
        console.log("total before :", finalProducts.length)
        

        let today = new Date();

        for (let i = 0; i < finalProducts.length; i++) {
            finalProducts[i].date = today.toDateString()            
            let alreadyExist = false
            for (let j = 0; j < jsonProducts.length && alreadyExist==false; j++) {
                if (finalProducts[i].link == jsonProducts[j].link) {
                    alreadyExist = true
                }
            }
            if (alreadyExist != true) {
                
                jsonProducts.push(finalProducts[i]);
            }
        }
        console.log("total after :",jsonProducts.length)
        
        fs.writeFileSync("./products2.json", JSON.stringify(jsonProducts, null, 4));
        console.log('done');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

const [, , eshop] = process.argv;

sandbox(eshop);
