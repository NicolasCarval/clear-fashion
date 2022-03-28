const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const clientPromise = require('./mongodb-client');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = 'ClearFashionCluster';
const products = require('./products.json');
const ObjectId = require("mongodb").ObjectID;

const { calculateLimitAndOffset, paginate } = require('paginate-info')


const PORT = 8092;
var database, collection,client;

const app = express();

const connectionDB = async () => {
    const client = await MongoClient.connect(MONGODB_URI, { 'useNewUrlParser': true });
    database = client.db(MONGODB_DB_NAME)
    collection = database.collection('products')
}


module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/',async (request, response) => {
    client = await clientPromise;
    collection = await client.db(MONGODB_DB_NAME).collection("products")
    response.send({ 'ack': true, 'dbConnection': true, 'dbName': client.db().databaseName });
});

app.get('/products/search', async (request, response) => {
    client = await clientPromise;
    collection = await client.db(MONGODB_DB_NAME).collection("products")
    try {
        let query = {};
        let sort = { "price": "asc"}
        let final_answer = {
            "success": true,
            "data": {
                "results": [],
                "meta": {
                    "count": 0
                }
            }
        }
        let size = 12;
        let page = 1;

        if (request.query.brand && request.query.brand != null) {
            query["brand"] = request.query.brand;
        }
        if (request.query.price && parseInt(request.query.price) > 0) {
            query["price"] = { $lte: parseFloat(request.query.price) };
        }
        if (request.query.recent == "yes") {
            const recentDate = new Date()
            const pastDate = recentDate.getDate() - 14;
            recentDate.setDate(pastDate);
            const dd = String(recentDate.getDate()).padStart(2, '0');
            const mm = String(recentDate.getMonth() + 1).padStart(2, '0'); //January is 0!
            const yyyy = recentDate.getFullYear();

            const ago = yyyy + '-' + mm + '-' + dd;
            console.log(ago)
            query["date"] = { $gte: ago }
        }
        if (request.query.sort == "desc" || request.query.sort == "recently" || request.query.sort == "anciently") {
            if (request.query.sort == "desc") {
                sort = { "price": "desc" }
            } else {
                if (request.query.sort == "recently") {
                    sort = { "date": "desc" }
                }
                else {
                    sort = { "date": "asc" }
                }
            }
        }
        if (request.query.size && parseInt(request.query.size) > 0) {
            size = parseInt(request.query.size);
        }
        if (request.query.page && parseInt(request.query.page) > 0) {
            page = parseInt(request.query.page);
        }

        console.log(query)
        console.log("size: " + size + " page: " + page);    

        const productCount = await collection.find(query).count();
        final_answer.data.meta["count"] = productCount;
        
        const { limit, offset } = calculateLimitAndOffset(page, size);
        const productList = await collection.find(query).sort(sort).skip(offset).limit(limit).toArray();
        final_answer.data["results"] = productList;
        const meta = paginate(page, productCount, productList, size);

        final_answer.data.meta = meta;
        response.send(final_answer);

    } catch (error) {
        response.status(500).send(error);
    }    
});

app.get('/products/:id', async (request, response) => {

    collection.findOne({ "_id": request.params.id }, (error, result) => {
            if (error) {
                return response.status(500).send(error);
            }
            response.send(result);
        });
});

app.get('/brands', async (request, response) => {
    client = await clientPromise;
    collection = await client.db(MONGODB_DB_NAME).collection("products")
    collection.distinct("brand", (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send({ "result": result });
    });
});



app.listen(PORT, () => {
    MongoClient.connect(MONGODB_URI, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error;
        }
        database = client.db(MONGODB_DB_NAME);
        collection = database.collection("products");
        console.log("Connected to `" + MONGODB_DB_NAME + "`!");
    });
});

console.log(`📡 Running on port ${PORT}`);
