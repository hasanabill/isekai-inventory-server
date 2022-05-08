const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('The Server is up and running')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mstm0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemCollection = client.db('isekaiItem').collection('items');

        // Authentication
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })


        // load all data
        app.get('/inventory', async (req, res) => {
            const query = {}
            const cursor = itemCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })

        // filter specific data by email
        app.get('/myitems', async (req, res) => {
            const email = req?.query?.email;
            const query = { email }
            const cursor = itemCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await itemCollection.findOne(query)
            res.send(result)
        })

        // add item
        app.post('/inventory', async (req, res) => {
            const newItem = req.body;
            const result = await itemCollection.insertOne(newItem);
            res.send(result);
        })

        // DELETE ITEM
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await itemCollection.deleteOne(query)
            res.send(result)
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.listen(port)