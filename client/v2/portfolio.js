// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrand = document.querySelector('#brand-select');

const sectionProducts = document.querySelector('#products');

const spanNbProducts = document.querySelector('#nbProducts');
const spanNbNewProducts = document.querySelector('#nbNewProducts');
const spanDateLatestProduct = document.querySelector('#DateLatestProduct');
const span50 = document.querySelector('#P50');
const span90 = document.querySelector('#P90');
const span95 = document.querySelector('#P95');


/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({ result, meta }) => {
    currentProducts = result;
    currentPagination = meta;
    if (selectBrand.value != "all") {
        currentProducts = GetProductsByBrand(selectBrand.value);
    }
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
    try {
        const response = await fetch(
            `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
        );
        const body = await response.json();

        if (body.success !== true) {
            console.error(body);
            return { currentProducts, currentPagination };
        }
        console.log(body.data);
        return body.data;
    } catch (error) {
        console.error(error);
        return { currentProducts, currentPagination };
    }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
    const fragment = document.createDocumentFragment();
    if (products.length != 0) {
        const div = document.createElement('div');
        const template = products
            .map(product => {
                return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}" target="_blank">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
            })
            .join('');

        div.innerHTML = template;
        fragment.appendChild(div);
        sectionProducts.innerHTML = '<h2>Products</h2>';
        sectionProducts.appendChild(fragment);
    } else {
        const div = document.createElement('div');
        div.innerHTML = `<p><strong>No current products on this page under these conditions</strong></p>`;
        fragment.appendChild(div);
        sectionProducts.innerHTML = '<h2>Products</h2>';
        sectionProducts.appendChild(fragment);
    }

};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
    const { currentPage, pageCount } = pagination;
    const options = Array.from(
        { 'length': pageCount },
        (value, index) => `<option value="${index + 1}">${index + 1}</option>`
    ).join('');

    selectPage.innerHTML = options;
    selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
    const { count } = pagination;
    spanNbProducts.innerHTML = count;

    fetchProducts(1, count).then(product => {
        const productSortedDate = SortProductsDate(product.result);
        spanDateLatestProduct.innerHTML = productSortedDate[0].released;

        const nbRecentlyReleased = CountRecentlyReleased(productSortedDate);
        spanNbNewProducts.innerHTML = nbRecentlyReleased;

        const { p50, p90, p95 } = pValueCalculator(productSortedDate);
        span50.innerHTML = p50;
        span90.innerHTML = p90;
        span95.innerHTML = p95;
    });
};

const render = (products, pagination) => {
    renderProducts(products);
    renderPagination(pagination);
    renderIndicators(pagination);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display, will update current page if necessary
 * @type {[type]}
 */
selectShow.addEventListener('change', event => {
    let newPage = currentPagination.currentPage
    if (newPage > parseInt(spanNbProducts.innerHTML) / parseInt(event.target.value)) {
        newPage = Math.ceil(parseInt(spanNbProducts.innerHTML) / parseInt(event.target.value))
    }
    fetchProducts(newPage, parseInt(event.target.value))
        .then(setCurrentProducts)
        .then(() => render(currentProducts, currentPagination));
});

/**
 * Select the page of products to display
 * @type {[type]}
 */
selectPage.addEventListener('change', event => {

    fetchProducts(parseInt(event.target.value), selectShow.value)
        .then(setCurrentProducts)
        .then(() => render(currentProducts, currentPagination));
});

/**
 * Filter products by brand on the current page.
 * Later we could 
 * @type {[type]}
 */
selectBrand.addEventListener('change', event => {
    if (event.target.value != "all") {
        renderProducts(GetProductsByBrand(event.target.value))
    } else {
        fetchProducts(currentPagination.currentPage, selectShow.value)
            .then(setCurrentProducts)
            .then(() => render(currentProducts, currentPagination));
    }
});



document.addEventListener('DOMContentLoaded', async () => {
    //here we could find all brands once, and create the options in html    
    const products = await fetchProducts(currentPagination.currentPage, selectShow.value);
    fetchProducts(1, products.meta.count).then(BrandSelectOptionCreation);

    setCurrentProducts(products);
    render(currentProducts, currentPagination);
});


//Declaration of all additional functions


function GetProductsByBrand(brandName) {
    let brandProducts = [];
    for (let i = 0; i < currentProducts.length; i++) {
        if (currentProducts[i].brand == brandName) {
            brandProducts.push(currentProducts[i]);
        }
    }
    console.log(brandProducts);
    return brandProducts;
}

function SortProductsDate(ProductsList) {
    return ProductsList.slice().sort(function (itemA, itemB) {
        if (itemA.released > itemB.released) { return -1; }
        else if (itemA.released < itemB.released) { return 1; }
        else { return 0; }
    });
}

function CountRecentlyReleased(ProductList) {
    let counter = 0;
    const recentDate = new Date()
    const pastDate = recentDate.getDate() - 14;
    recentDate.setDate(pastDate);
    while (new Date(ProductList[counter].released) >= recentDate) {
        counter = counter + 1;
    }
    return counter;
}

function BrandSelectOptionCreation(allProducts) {
    let Brands = []
    for (let i = 0; i < allProducts.result.length; i++) {
        if (!Brands.includes(allProducts.result[i].brand)) {
            Brands.push(allProducts.result[i].brand);
            const el = document.createElement("option");
            el.innerHTML = allProducts.result[i].brand
            el.value = allProducts.result[i].brand
            selectBrand.appendChild(el)
        }
    }
}

function pValueCalculator(listOfProducts) {
    
    const reducer = (previousProduct, NextProduct) => previousProduct + NextProduct.price;
    const mean = listOfProducts.reduce(reducer, 0) / listOfProducts.length;
    let variance = 0.0;
    for (let i = 0; i < listOfProducts.length; i++) {
        variance += Math.pow((listOfProducts[i].price - mean), 2);
    }
    variance = variance / listOfProducts.length;
    const standardDeviation = Math.sqrt(variance);

    const p50 = (mean - 0.0 * standardDeviation).toFixed(2);
    const p90 = (mean + 1.282 * standardDeviation).toFixed(2);
    const p95 = (mean + 1.645 * standardDeviation).toFixed(2);
    console.log("mean", mean)
    console.log("variance", variance)
    console.log("std", standardDeviation)
    return { p50, p90, p95 };
}