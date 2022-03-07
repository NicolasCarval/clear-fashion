
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' })
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = 'ClearFashionCluster';
const products = require('./products.json');
let collection = null

const insertProducts = async () => {    
    const result = collection.insertMany(products);
    console.log(result);
}

const findNumber = async () => {
    const products = await collection.find({}).count();
    console.log(products);
}

const Brands = async () => {
    const products = await collection.distinct("brand");
    console.log(products);    
}

const ProductsBrands = async (brand = "montlimart") => {
    const products = await collection.find({ "brand": brand }).toArray();
    console.log(products);
}

const ProductsPrice = async (price=50) => {
    const products = await collection.find({ "price": { $lte: parseFloat(price) } }).toArray();
    console.log(products);
}

const ProductsSortedPrice = async (asc=1) => {
    const products = await collection.find({}).sort({ "price": asc }).toArray();
    for (let i = 0; i < 10; i++) {
        console.log(products[i]);
    }   
}

const ProductsSortedDate = async (asc = 1) => {
    const products = await collection.find({}).sort({ "date": asc }).toArray();
    for (let i = 0; i < 10; i++) {
        console.log(products[i]);
    }
}

const ProductsRecent = async () => {
    const recentDate = new Date()
    const pastDate = recentDate.getDate() - 14;
    recentDate.setDate(pastDate);

    const dd = String(recentDate.getDate()).padStart(2, '0');
    const mm = String(recentDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = recentDate.getFullYear();

    const recent = yyyy + '-' + mm + '-' + dd;
    console.log(recent)
    const products = await collection.find({ "date": { $gte: recent } }).toArray();
    for (let i = 0; i < 10; i++) {
        console.log(products[i]);
    }
}


const connection = async () => {
    const client = await MongoClient.connect(MONGODB_URI, { 'useNewUrlParser': true });
    const db = client.db(MONGODB_DB_NAME)
    collection = db.collection('products');
    await findNumber();
    //await Brands();
    //await ProductsBrands();
    await ProductsPrice(10);
    //await ProductsSortedPrice(-1);
    //await ProductsSortedDate();
    //await ProductsRecent();
    await client.close()
    process.exit(0);
}

connection();
