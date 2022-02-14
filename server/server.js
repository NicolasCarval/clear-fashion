const { MongoClient } = require('mongodb');
const MONGODB_URI = 'mongodb+srv://clearfashion:clearfashion@clearfashioncluster.m1kpo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
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


const connection = async () => {
    const client = await MongoClient.connect(MONGODB_URI, { 'useNewUrlParser': true });
    const db = client.db(MONGODB_DB_NAME)
    collection = db.collection('products');
    //await findNumber();
    //await Brands();
    //await ProductsBrands();
    //await ProductsPrice(10);
    await ProductsSortedPrice(-1);
    process.exit(0);
}

connection();
