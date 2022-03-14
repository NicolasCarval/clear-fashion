const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' })
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = 'ClearFashionCluster';
const products = require('./products.json');
const ObjectId = require("mongodb").ObjectID;


const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/products/search', (request, response) => {
    let query = {};
    let limit = 12;
    if (request.query.brand) {        
        query["brand"] = request.query.brand;
    }
    if (request.query.price && parseInt(request.query.price) > 0) {        
        query["price"] = { $lte: parseFloat(request.query.price) };
    }
    if (request.query.limit && parseInt(request.query.limit) > 0 && parseInt(request.query.limit) <=48) {
        limit = parseInt(request.query.limit);
    }

    let final_answer = { "limit": limit, "total": 0, "results": [] }
    collection.find(query).count((error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        final_answer["total"] = parseInt(result);
    });
    collection.find(query).sort({ "price": "asc" }).limit(limit).toArray((error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        final_answer["results"] = result
        response.send(final_answer);
    });
});

app.get('/products/:id', (request, response) => {

    collection.findOne({ "_id": request.params.id }, (error, result) => {
            if (error) {
                return response.status(500).send(error);
            }
            response.send(result);
        });
});

app.get('/brands', (request, response) => {

    collection.distinct("brand", (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send({ "result": result });
    });
});


var database, collection;
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
