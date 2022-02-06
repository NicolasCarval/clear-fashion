const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { 'v5': uuidv5 } = require('uuid');

/**
 * Parse webpage vêtements
 * @param  {String} data - html response
 * @return {Object} vêtements
 */
const parse = data => {
    const $ = cheerio.load(data);

    return $("input[class='hidden']")
        .map((i, element) => {
            return {
                'nbItem': parseInt(
                    $(element)
                        .attr('value')                        
                )};
        })
        .get();
};

const parse2 = data => {
    const $ = cheerio.load(data);
    console.log("yo")
    return $('.product-container')
        .map((i, element) => {
            const link = $(element)
                .find('.right-block .product-name-container .product-name')
                .attr('href');            
            if (link != null && link != undefined ) {
                return {
                    'link': link,
                    'brand': 'ADRESSE Paris',
                    'price': parseInt(
                        $(element)
                            .find('.right-block .prixright .content_price .product-price')
                            .text()
                            .trim()
                            .replace(/\s/g, ' ')
                            .replace(/,/, '.')
                    ),
                    'name': $(element)
                        .find('.right-block .product-name-container .product-name')
                        .attr('title'),
                    'photo': $(element)
                        .find('.left-block .product-image-container .product_img_link img')
                        .attr('data-original'),
                    'id': uuidv5(link, uuidv5.URL)
                };
            }
            else {
                return {}
            }
            
        })
        .get();
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape = async url => {
    try {
        const response = await fetch(url);

        if (response.ok) {
            const body = await response.text();
            const rep = await parse(body)
            console.log(rep)
            const url2 = 'https://adresse.paris/630-toute-la-collection?id_category=630&n=' + rep[0]["nbItem"].toString()
            console.log(url2)
            try {
                const response2 = await fetch(url2);

                if (response2.ok) {
                    const body2 = await response2.text();
                    const finalrep = parse2(body2).filter(element => {
                        if (typeof element === 'object' && Object.keys(element).length === 0) {
                            return false;
                        } else {
                            return true;
                        }
                    });
                    
                    return finalrep;
                }
                console.error(response2);
                return null;
            } catch (error) {
                console.error(error);
                return null;
            }
        }
        console.error(response);
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
};
