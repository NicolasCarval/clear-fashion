/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./sites/dedicatedbrand');
const montlimartbrand = require('./sites/montlimart');
const adresseparisbrand = require('./sites/adresseparis');
const loom = require('./sites/loom');

const jsonProducts = require('./products.json');

const fs = require('fs');
const db = require('./db');

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


        let pages = [
            'https://www.loom.fr/collections/hauts-homme',
            'https://www.loom.fr/collections/bas-homme'
        ];
               
        const promises = pages.map(page => loom.scrape(page));
        const results = await Promise.all(promises);
        
        let products4 = []
        products4.push(results.flat());
        products4 = products4.flat();

        console.log(`loom is done :`, products4.length);

        const finalProducts = products.concat(products2, products3, products4);
        console.log("total before :", finalProducts.length)
        

        let today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;

        for (let i = 0; i < finalProducts.length; i++) {
            finalProducts[i].date = today            
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
        for (let i = 0; i < jsonProducts.length; i++) {
            let alreadyExist = false
            for (let j = 0; j < finalProducts.length && alreadyExist == false; j++) {
                if (finalProducts[i].link == jsonProducts[j].link) {
                    alreadyExist = true
                }
            }
            if (alreadyExist == false) {

                jsonProducts.splice(i,1);
            }
        }
        console.log("total after :",jsonProducts.length)
        
        fs.writeFileSync("./products.json", JSON.stringify(jsonProducts, null, 4));
        console.log('done');
        const result = await db.insert(jsonProducts);

        console.log(`💽  ${result.insertedCount} inserted products`);

        console.log('\n');
        db.close();

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

const [, , eshop] = process.argv;

sandbox(eshop);
