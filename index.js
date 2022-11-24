const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();


//middle ware
app.use(cors());
app.use(express.json())

app.get('/', async(req, res)=>{
    res.send('server is running...')
})



const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.epqkzkd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try {
        const bikeCategorysCollection = client.db('bike-resel-project').collection('bike-categorys');
        const bikeAllCategoryCollection = client.db('bike-resel-project').collection('bike-all-categorys');
        const bookingProductsCollection = client.db('bike-resel-project').collection('bookingProducts');
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
            console.log(category)
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

        
    } catch (error) {
        console.log(error.message)
    }


}
run().catch(console.log)







app.listen(port,()=>{
    console.log('your server running port is ', port)
})