// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

//temp fav
const MY_FAVORITE_BRANDS = [];

// current products on the page
let currentProducts = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrand = document.querySelector('#brand-select');
const selectSort = document.querySelector('#sort-select');
const selectRecent = document.querySelector('#recent-select');
const selectFavourite = document.querySelector('#favourite-select');
const selectPrice = document.querySelector('#price-select');
const selectPriceValue = document.querySelectorAll('input[name="priceRadio"]');

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
    console.log(currentPagination);
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12, brand="") => {
    try {
        const response = await fetch(
            `https://clear-fashion-api.vercel.app?page=${page}&size=${size}&brand=${brand}`
        );
        const body = await response.json();

        if (body.success !== true) {
            console.error(body);
            return { currentProducts, currentPagination };
        }
        return body.data;
    } catch (error) {
        console.error(error);
        return { currentProducts, currentPagination };
    }
};

/**
 * Fetch brands from api
 * @return {Object}
 */
const fetchBrands = async () => {
    try {
        const response = await fetch(
            `https://clear-fashion-api.vercel.app/brands`
        );
        const body = await response.json();

        if (body.success !== true) {
            console.error(body);
            return { result:["loom","dedicated","adresse","1083"] };
        }
        console.log("yes")
        return body.data;
    } catch (error) {
        console.error(error);
        return { result: ["loom", "dedicated", "adresse", "1083"] };
    }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
    if (selectFavourite.checked) {
        products = JSON.parse(localStorage.getItem('favourites') || '[]');
        if (selectBrand.value != "") {
            products = GetProductsByBrand(selectBrand.value, products);
        }
    }
    if (selectRecent.checked) {
        products = SortProductsDate(products)
        products = products.slice(0, CountRecentlyReleased(products))
    }
    if (selectPrice.checked) {
        for (let index = 0; index < selectPriceValue.length; index++) {
            if (selectPriceValue[index].checked) {
                const priceLimit = parseInt(selectPriceValue[index].value);
                products = products.filter(elements => elements.price <= priceLimit);
            }
        }
    }
    products = sortBy(products);
    console.log(products)
    const fragment = document.createDocumentFragment();
    if (products.length != 0) {
        const div = document.createElement('div');
        div.className = "flex-container"
        const template = products
            .map(product => {
                return `
      <div class="product" id=${product.uuid}>              
        <span>${product.brand}</span>
        <a href="${product.link}" target="_blank">${product.name}</a>
        <span>${product.price}</span>
        <input type="button" id="fav${product.uuid}" value="Add" onclick="manageFavourite('${product.uuid}')">
      </div>
    `;
            })
            .join('');

        div.innerHTML = template;
        fragment.appendChild(div);
        sectionProducts.innerHTML = '<h2 class="topnav2">Products</h2>';
        sectionProducts.appendChild(fragment);
        changeValue(products);

    } else {
        const div = document.createElement('div');
        div.innerHTML = `<p><strong>No current products on this page under these conditions</strong></p>`;
        fragment.appendChild(div);
        sectionProducts.innerHTML = '<h2 class="topnav2">Products</h2>';
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

    fetchProducts(1, count, selectBrand.value).then(product => {
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
    fetchProducts(newPage, parseInt(event.target.value), selectBrand.value)
        .then(setCurrentProducts)
        .then(() => render(currentProducts, currentPagination));
});

/**
 * Select the page of products to display
 * @type {[type]}
 */
selectPage.addEventListener('change', event => {

    fetchProducts(parseInt(event.target.value), selectShow.value, selectBrand.value)
        .then(setCurrentProducts)
        .then(() => render(currentProducts, currentPagination));
});

/**
 * Filter products by brand on the current page.
 * Later we could 
 * @type {[type]}
 */
selectBrand.addEventListener('change', event => {
    /*
    fetchProducts(currentPagination.currentPage, selectShow.value)
        .then(setCurrentProducts)
        .then(() => render(currentProducts, currentPagination));*/

    fetchProducts(currentPagination.currentPage, selectShow.value, event.target.value)
        .then(setCurrentProducts)
        .then(() => render(currentProducts, currentPagination));
    
});

selectSort.addEventListener('change', event => {
    fetchProducts(currentPagination.currentPage, selectShow.value, selectBrand.value)
        .then(setCurrentProducts)
        .then(() => render(currentProducts, currentPagination));
})

selectRecent.addEventListener('change', event => {
    fetchProducts(currentPagination.currentPage, selectShow.value, selectBrand.value)
        .then(setCurrentProducts)
        .then(() => render(currentProducts, currentPagination));
})

selectFavourite.addEventListener('click', event => {

    if (event.target.checked) {
        const result = JSON.parse(localStorage.getItem('favourites') || '[]');
        const meta = Object.assign({}, currentPagination);
        setCurrentProducts({ result, meta });
        render(currentProducts, currentPagination);
    } else {
        if (selectBrand.value == "") {
            fetchProducts(currentPagination.currentPage, selectShow.value)
                .then(setCurrentProducts)
                .then(() => render(currentProducts, currentPagination));
        } else {
            fetchProducts(currentPagination.currentPage, selectShow.value, selectBrand.value)
                .then(setCurrentProducts)
                .then(() => render(currentProducts, currentPagination));
        }
        
    }
})

selectPrice.addEventListener('change', event => {
    fetchProducts(currentPagination.currentPage, selectShow.value, selectBrand.value)
        .then(setCurrentProducts)
        .then(() => render(currentProducts, currentPagination));
})

async function RadioOnclick() {
    fetchProducts(currentPagination.currentPage, selectShow.value, selectBrand.value)
        .then(setCurrentProducts)
        .then(() => render(currentProducts, currentPagination));
}

document.addEventListener('DOMContentLoaded', async () => {
        
    const products = await fetchProducts(currentPagination.currentPage, selectShow.value);
    fetchBrands().then(BrandSelectOptionCreation);

    setCurrentProducts(products);
    render(currentProducts, currentPagination);
});


//Declaration of all additional functions


function GetProductsByBrand(brandName,products) {
    let brandProducts = [];
    for (let i = 0; i < products.length; i++) {
        if (products[i].brand == brandName) {
            brandProducts.push(products[i]);
        }
    }
    return brandProducts;
}

function SortProductsDate(ProductsList) {
    return ProductsList.slice().sort(function (itemA, itemB) {
        if (itemA.released > itemB.released) { return -1; }
        else if (itemA.released < itemB.released) { return 1; }
        else { return 0; }
    });
}

function SortProductsPrice(ProductsList) {
    return ProductsList.slice().sort(function (itemA, itemB) {
        if (itemA.price > itemB.price) { return -1; }
        else if (itemA.price < itemB.price) { return 1; }
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

function BrandSelectOptionCreation({ result }) {
    const brands = result
    for (let i = 0; i < brands.length; i++) {
        const el = document.createElement("option");
        el.innerHTML = brands[i]
        el.value = brands[i]
        selectBrand.appendChild(el)        
    }
    /*
    let Brands = []
    for (let i = 0; i < allProducts.result.length; i++) {
        if (!Brands.includes(allProducts.result[i].brand)) {
            Brands.push(allProducts.result[i].brand);
            const el = document.createElement("option");
            el.innerHTML = allProducts.result[i].brand
            el.value = allProducts.result[i].brand
            selectBrand.appendChild(el)
        }
    }*/
}

function pValueCalculator(listOfProducts) {
    displayPriceRange();
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
    return { p50, p90, p95 };
}

function sortBy(products) {
    let sortedProduct = [];
    if (selectSort.value == "date-asc") {
        sortedProduct = SortProductsDate(products);
        sortedProduct.reverse();
    } else if (selectSort.value == "date-desc") {
        sortedProduct = SortProductsDate(products);        
    } else if (selectSort.value == "price-asc") {
        sortedProduct = SortProductsPrice(products);
        sortedProduct.reverse();
    } else {
        sortedProduct = SortProductsPrice(products);
    }
    return sortedProduct;
}

function displayPriceRange() {
    const showDiv = document.getElementById("PriceRange");
    if (selectPrice.checked) {
        showDiv.style.display = "";
    }
    else {
        showDiv.style.display = "none";
    }    
}

function manageFavourite(id) {
    const div = document.querySelector("[id=" + CSS.escape(id) + "]");
    const favourites = JSON.parse(localStorage.getItem('favourites') || '[]');
    let newFavourite = favourites.find(product => product.uuid == div.id);
    if (newFavourite === undefined) {
        div.querySelector(`#fav${id}`).value = "Remove";
        newFavourite = currentProducts.find(product => product.uuid == div.id);
        favourites.push(newFavourite);
        localStorage.setItem('favourites', JSON.stringify(favourites));
        console.log("push:",localStorage.favourites);
    }
    else {
        div.querySelector(`#fav${id}`).value = "Add";
        newFavourite = currentProducts.find(product => product.uuid == div.id);
        const index = favourites.findIndex(product => product.uuid == newFavourite.uuid);
        if (index > -1) {
            favourites.splice(index, 1); // 2nd parameter means remove one item only
        }
        localStorage.setItem('favourites', JSON.stringify(favourites));        
    }
    if (selectFavourite.checked) {
        render(currentProducts, currentPagination);
    }
     
}

function changeValue(products) {
    const favourites = JSON.parse(localStorage.getItem('favourites') || '[]');
    for (let i = 0; i < products.length; i++) {
        const div = document.querySelector("[id=" + CSS.escape(products[i].uuid) + "]");   
        const newFavourite = favourites.find(product => product.uuid == div.id);
        if (newFavourite !== undefined) {
            div.querySelector("[id=fav" + CSS.escape(products[i].uuid) + "]").value = "Remove";
        }

    }
    
}