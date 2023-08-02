const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;


// meddleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.tfb4xbn.mongodb.net/?retryWrites=true&w=majority`;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        // connection--------------------
        const usersCollection = client.db("green-bazar").collection("users");
        const productCollection = client.db("green-bazar").collection("product");
        const CategoryCollection = client.db("green-bazar").collection("category");

        // connection--------------------



        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (user?.roal !== 'admin') {
                return res.status(403).send({ error: true, message: 'forbidden message' });
            }
            next();
        }



        // Users releted apis

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            console.log('ExistingUser', existingUser)

            if (existingUser) {
                return res.send({ message: 'User alerady exists' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })


        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.roal === 'admin' }
            res.send(result);
        })


        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    roal: 'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)
        })
        // End user relted api     



        // Category Releted Api 

        app.get('/category', async (req, res) => {
            const result = await CategoryCollection.find().toArray();
            res.send(result);
        })



        app.post('/addCategory', async (req, res) => {
            const postCategory = req.body;
            console.log(postCategory);

            // Check if the category name already exists in the collection
            CategoryCollection.findOne({ name: postCategory.name })
                .then(existingCategory => {
                    if (existingCategory) {
                        return res.json({ message: 'Category already exists' });
                    }

                    // If the category name is unique, insert the data into the collection
                    CategoryCollection.insertOne(postCategory)
                        .then(result => {

                        })
                        .catch(error => {
                            console.error('Error:', error);
                            res.status(500).json({ error: 'An error occurred while adding the category' });
                        });
                })
                .catch(error => {
                    console.error('Error:', error);
                    res.status(500).json({ error: 'An error occurred while checking the category' });
                });
        });






        // Product Releted api ------------

        app.get('/product', async (req, res) => {
            const result = await productCollection.find().toArray();
            res.send(result);
        })


        app.post('/product', async (req, res) => {
            const addProduct = req.body;
            const result = await productCollection.insertOne(addProduct);
            res.send(result);
        })


        app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(query);
            console.log(result)
            res.send(result);
        });








        // Product Releted api ------------







        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('Green-bazar Server is running');
})

app.listen(port, () => {
    console.log(`Green-bazar is running on port: ${port}`)
})