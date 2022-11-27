const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);


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
        // const adverticeProductCollection = client.db('bike-resel-project').collection('adverticeProducts');
        const wishListProductsCollection = client.db('bike-resel-project').collection('wishListProducts');
        const paymentsCollection = client.db('bike-resel-project').collection('payments');

        //users post info 
        app.post('/users', async(req, res)=>{
            const body = req.body;
            const result = await usersCollection.insertOne(body);
            res.send(result);
        })

        //google login
        app.put('/googleUsers', async(req, res)=>{
            const user = req.body;
            const email = req.body.email;
            const filter = {email: email};
                const options = { upsert: true };
                const updatedDoc = {
                    $set:user,
                }

                const googleLoign = await usersCollection.updateOne(filter, updatedDoc, options)
                 res.send({email})
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

        //delete seller
        app.delete('/allSellers/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const users = await usersCollection.deleteOne(query);
            res.send(users);

        })

        //verify seller
        app.put('/seller/verify/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const users = await usersCollection.findOne(filter);
            const filter2 = {sellerEmail: users.email}
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verify: true,
                    
                }
            }
            const verifyCategory = await bikeAllCategoryCollection.updateMany(filter2, updatedDoc, options)
            const verifySeller = await usersCollection.updateOne(filter, updatedDoc, options)
            res.send(verifySeller)


        })

            ///admin role implement 
        app.get('/users/admin/:email', async(req, res)=>{
            const email = req.params.email;
            // console.log(email)
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

         //booking product payment 
         app.get('/mybookedProducts/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const paymentOders = await bookingProductsCollection.findOne(query);
            res.send(paymentOders);

        })


        // sellar add product post
        app.post('/addProducts', async(req, res)=>{
            const body = req.body;
            const addProducts = await bikeAllCategoryCollection.insertOne(body);
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
            const allProducts = await bikeAllCategoryCollection.find(query).toArray();
            res.send(allProducts)

        })

        //sellar add product delete 
        app.delete('/allMyProducts/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const orders = await bikeAllCategoryCollection.deleteOne(query);
            res.send(orders);

        })



        //advertice product put 
        app.put('/addverticeProducts/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    advertice: true,
                    
                }
            }
            const addverticeProducts = await bikeAllCategoryCollection.updateOne(filter, updatedDoc, options);
            res.send(addverticeProducts)
            
        })
        //advertice product get 
        app.get('/addverticeProducts', async(req, res)=>{
            const query = {advertice: true};
            const addverticeProducts = await bikeAllCategoryCollection.find(query).toArray();
            res.send(addverticeProducts)

        })

        // wishlist product post api
        app.put('/reportProducts/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    report: true,
                    
                }
            }
            const reportProducts = await bikeAllCategoryCollection.updateOne(filter, updatedDoc, options);
            res.send(reportProducts)

        })

        //report product get api
        app.get('/reportProducts', async(req, res)=>{
            const query = {report: true};
            const reportProducts = await bikeAllCategoryCollection.find(query).toArray();
            res.send(reportProducts)

        })
        //report product delete api
        app.delete('/reportProducts/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const reportProducts = await bikeAllCategoryCollection.deleteOne(query);
            res.send(reportProducts);

        })

        //payment methode
        app.post("/create-payment-intent", async (req, res) => {
            const orders = req.body;
            const price = orders.productPrice;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
              amount: amount,
              currency: "usd",
              "payment_method_types": [
                "card"
            ],
            });
          
            res.send({
              clientSecret: paymentIntent.client_secret,
            });
          });

          //payment post information
          app.post('/payments', async(req, res)=>{
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.orderId;
            const payProductId = payment.productId;
            console.log(payProductId)
            const filter = {_id: ObjectId(id)}
            const filter1 = {_id: ObjectId(payProductId)}
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedDoc1 = {
                $set: {
                    paid: true,
                    
                }
            }
           
            const updatedResult1 = await bikeCategorysCollection.updateOne(filter1, updatedDoc1)
            const updatedResult = await bookingProductsCollection.updateOne(filter, updatedDoc)
            res.send(result)
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