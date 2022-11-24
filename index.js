const express = require('express');
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;


//middle ware
app.use(cors());
app.use(express.json())

app.get('/', async(req, res)=>{
    res.send('server is running...')
})


app.listen(port,()=>{
    console.log('your server running port is ', port)
})