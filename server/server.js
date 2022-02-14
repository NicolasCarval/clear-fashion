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

const Brands = async (brand="dedicated") => {
    const products = await collection.find({"brand":brand}).toArray();
    console.log(products);    
}


const connection = async () => {
    const client = await MongoClient.connect(MONGODB_URI, { 'useNewUrlParser': true });
    const db = client.db(MONGODB_DB_NAME)
    collection = db.collection('products');
    await findNumber();
    await Brands();
    process.exit(0);
}

connection();
