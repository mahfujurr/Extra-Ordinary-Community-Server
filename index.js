const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const jwt = require('jsonwebtoken');
require('dotenv').config();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iz8azxp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJWT(req, res, next) {

//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send('unauthorized access');
//     }

//     const token = authHeader.split(' ')[1];

//     jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'forbidden access' })
//         }
//         req.decoded = decoded;
//         next();
//     })

// }


async function run() {
    try {
        const postsCollection = client.db('eoc').collection('posts');
        const commentsCollection = client.db('eoc').collection('comments');
        const usersCollection = client.db('eoc').collection('users');


        app.post('/posts', async (req, res) => {
            const post = req.body;
            const result = await postsCollection.insertOne(post);
            res.send(result);
        });

        app.get('/posts', async (req, res) => {
            const query = {};
            const result = await postsCollection.find(query).sort({ time: -1 }).toArray();
            res.send(result);
        });
        app.get('/home', async (req, res) => {
            const query = {};
            const result = await postsCollection.find(query).limit(3).sort({ like: -1 }).toArray();
            res.send(result);
        });

        app.get('/status/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await postsCollection.findOne(query);
            res.send(result);
        });

        app.put('/status/:id', async (req, res) => {
            const id = req.params.id;

            const filter = { _id: ObjectId(id) };
            const currentLike = req.body;
            const option = { upsert: true }
            const updatedLikes = {
                $set: {
                    like: currentLike.like,
                }
            }
            const result = await postsCollection.updateOne(filter, updatedLikes, option);
            res.send(result);
        })

        //comments section 
        app.post('/comments', async (req, res) => {
            const comment = req.body;
            const result = await commentsCollection.insertOne(comment);
            res.send(result);
        });

        app.get('/comments', async (req, res) => {
            
            const query = {};
            const result = await commentsCollection.find(query).toArray();
            res.send(result);
        });
        app.get('/comments/:postid', async (req, res) => {
            const postId = req.params.postid
            const query = {postId: postId};
            const result = await commentsCollection.find(query).sort({ time: -1 }).toArray();
            res.send(result);
        });

        //users section

        app.post('/userinfo', async (req, res) => {
            const users = req.body;
            const result = await usersCollection.insertOne(users);
            res.send(result);
        });

        app.get('/userinfo/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const result = await usersCollection.findOne(query);
            res.send(result);
        });

        // app.post('/postlike', async (req, res) => {
        //     const users = req.body;
        //     const result = await usersCollection.insertOne(users);
        //     res.send(result);
        // });

        // app.get('/postlike', async (req, res) => {
        //     const email = req.params.email;
        //     const query = {email: email};
        //     const result = await usersCollection.findOne(query);
        //     res.send(result);
        // });

       



        // app.delete('/users/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await usersCollection.deleteOne(query);
        //     res.send(result);
        // })





    }
    finally {

    }
}
run().catch(console.log);

app.get('/', async (req, res) => {
    res.send('eoc server is running');
})

app.listen(port, () => console.log(`eoc running on ${port}`))