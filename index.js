const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        app.get('/categorys', async(req, res)=>{
            const query = {};
            const categorys = await bikeCategorysCollection.find(query).toArray();
            res.send(categorys)
        })
        
    } catch (error) {
        console.log(error.message)
    }


}
run().catch(console.log)







app.listen(port,()=>{
    console.log('your server running port is ', port)
})