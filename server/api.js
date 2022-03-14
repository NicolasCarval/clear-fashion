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

app.get('/products/:id', (request, response) => {

    collection.findOne({ "_id": new ObjectId(request.params.id) }, (error, result) => {
            if (error) {
                return response.status(500).send(error);
            }
            response.send(result);
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
