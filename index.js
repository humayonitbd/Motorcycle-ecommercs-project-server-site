const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();


//middle ware
app.use(cors());
app.use(express.json())

app.get('/', async(req, res)=>{
    res.send('server is running...')
})



const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.epqkzkd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//verify jwt
const verifyJwt=(req, res, next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send('unauthorized access!')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbiden access'})
        }
        req.decoded = decoded;
        next();
    })


}

async function run(){
    try {
        const usersCollection = client.db('bike-resel-project').collection('users');
        const bikeCategorysCollection = client.db('bike-resel-project').collection('bike-categorys');
        const bikeAllCategoryCollection = client.db('bike-resel-project').collection('bike-all-categorys');
        const bookingProductsCollection = client.db('bike-resel-project').collection('bookingProducts');
        const sellarAddProductCollection = client.db('bike-resel-project').collection('sellarAddProducts');
        const adverticeProductCollection = client.db('bike-resel-project').collection('adverticeProducts');
        const wishListProductsCollection = client.db('bike-resel-project').collection('wishListProducts');

        //users post info 
        app.post('/users', async(req, res)=>{
            const body = req.body;
            const result = await usersCollection.insertOne(body);
            res.send(result);
        })

        //get all users
        app.get('/allUsers', async(req, res)=>{
            const filter = {role: 'user'}
            const users = await usersCollection.find(filter).toArray();
            res.send(users)
            
        })
        //delete users
        app.delete('/allUsers/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const users = await usersCollection.deleteOne(query);
            res.send(users);

        })
        //get all seller
        app.get('/allSellers', async(req, res)=>{
            const filter = {role: 'seller'}
            const users = await usersCollection.find(filter).toArray();
            res.send(users)
            
        })

        //delete users
        app.delete('/allSellers/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const users = await usersCollection.deleteOne(query);
            res.send(users);

        })

            ///admin role implement 
        app.get('/users/admin/:email', async(req, res)=>{
            const email = req.params.email;
            console.log(email)
            const filter = {email: email}
            const user = await usersCollection.findOne(filter);
            res.send({isAdmin: user.role})
        })

        //category get api
        app.get('/categorys', async(req, res)=>{
            const query = {};
            const categorys = await bikeCategorysCollection.find(query).toArray();
            res.send(categorys)
        })

        //single category api
        app.get('/category/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await bikeCategorysCollection.findOne(query);
            res.send(result)

        })

        //all category get
        app.get('/allCategory', async(req, res)=>{
            const category = req.query.category;
           
            const bandAllCategory = {category: category}
            const bandCategory = await bikeAllCategoryCollection.find(bandAllCategory).toArray();
            res.send(bandCategory)
        })


        //booking product data post 
        app.post('/bookedProduct', async(req, res)=>{
            const body = req.body;
            const bookingproduct = await bookingProductsCollection.insertOne(body);
            res.send(bookingproduct)

        })

        //booking product get email
        app.get('/mybookedProducts', verifyJwt, async(req, res)=>{
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden accesss'})
            }
            const query = {email: email}
            const orders = await bookingProductsCollection.find(query).toArray();
            res.send(orders);

        })
        //booking product delete user
        app.delete('/mybookedProducts/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const orders = await bookingProductsCollection.deleteOne(query);
            res.send(orders);

        })

        //sellar add product post
        app.post('/addProducts', async(req, res)=>{
            const body = req.body;
            const addProducts = await sellarAddProductCollection.insertOne(body);
            res.send(addProducts)

        })

        //sellar add product get
        app.get('/allMyProducts',verifyJwt, async(req, res)=>{
            const email = req.query.email;
            // console.log(email)
            const decodedEmail = req.decoded.email;
            // console.log(decodedEmail)
            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden accesss'})
            }
            const query = {sellerEmail: email}
            const allProducts = await sellarAddProductCollection.find(query).toArray();
            res.send(allProducts)

        })

        //sellar add product delete 
        app.delete('/allMyProducts/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const orders = await sellarAddProductCollection.deleteOne(query);
            res.send(orders);

        })


        //advertice product post 
        app.post('/addverticeProducts', async(req, res)=>{
            const body = req.body;
            console.log(body)
            const addverticeProducts = await adverticeProductCollection.insertOne(body);
            res.send(addverticeProducts)

        })
        //advertice product get 
        app.get('/addverticeProducts', async(req, res)=>{
            const query = {};
            const addverticeProducts = await adverticeProductCollection.find(query).toArray();
            res.send(addverticeProducts)

        })

        //wishlist product post api
        app.post('/wishListProducts', async(req, res)=>{
            const body = req.body;
            const wishListProducts = await wishListProductsCollection.insertOne(body);
            res.send(wishListProducts)

        })
        //wishlist product get api
        app.get('/wishListProducts', verifyJwt, async(req, res)=>{
            const email = req.query.email;
            console.log(email)
            const decodedEmail = req.decoded.email;
            console.log(decodedEmail)
            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden accesss'})
            }
            const query = {wishlishEmail: email};
            const wishListProducts = await wishListProductsCollection.find(query).toArray();
            res.send(wishListProducts)

        })


        // jwt token get
        app.get('/jwt', async(req, res)=>{
            const email = req.query.email;
            const userEmail = {email: email}
            const user = await usersCollection.findOne(userEmail);
            if(user){
                const token = jwt.sign({email}, process.env.JWT_TOKEN, {expiresIn: '2h'})
                return res.send({accessToken: token});
            }
            res.status(403).send({jwttoken: ''})
        })

        
    } catch (error) {
        console.log(error.message)
    }


}
run().catch(console.log)







app.listen(port,()=>{
    console.log('your server running port is ', port)
})