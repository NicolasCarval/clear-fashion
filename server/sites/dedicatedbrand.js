const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { 'v5': uuidv5 } = require('uuid');

/**
 * Parse webpage restaurant
 * @param  {String} data - html response
 * @return {Object} restaurant
 */
const parse = data => {
    const $ = cheerio.load(data);

    return $(".paging-showing")
        .map((i, element) => {
            return {
                'nbCurrent': parseInt(
                    $(element).find('.js-items-current')
                        .text()
                        .trim()
                        .replace(/\s/g, ' ')
                ),
                'nbProduct': parseInt(
                    $(element).find('.js-allItems-total')
                        .text()
                        .trim()
                        .replace(/\s/g, ' ')
                )
            };
        })
        .get();
};

const parse2 = data => {
    const $ = cheerio.load(data);

    return $('.productList-container .productList')
        .map((i, element) => {
            const link = `https://www.dedicatedbrand.com${$(element)
                .find('.productList-link')
                .attr('href')}`;
            return {
                'link': link,
                'brand': 'dedicated',
                'price': parseInt(
                    $(element)
                        .find('.productList-price')
                        .text()
                ),
                'name': $(element)
                    .find('.productList-title')
                    .text()
                    .trim()
                    .replace(/\s/g, ' '),
                'photo': $(element)
                    .find('.productList-image img')
                    .attr('data-src'),
                'id': uuidv5(link, uuidv5.URL)
            };
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
            const result = parse(body)
            const nbPage = Math.ceil(result[0]["nbProduct"] / result[0]["nbCurrent"]);
            let finalresult = []
            for (let i = 1; i <= nbPage; i++) {
                const url2 = 'https://www.dedicatedbrand.com/en/men/all-men?p=' + i.toString();               
                try {
                    const response2 = await fetch(url2);
  
                    if (response2.ok) {
                        const body2 = await response2.text();
                        finalresult = finalresult.concat(parse2(body2));
                    } else {
                        console.error(response2);
                        return null
                    }
                } catch (error) {
                    console.error(error);
                    return null;
                }
            }
            return finalresult;
        }

        console.error(response);

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
};
