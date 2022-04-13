const express = require('express');
const app = express();
app.use(express.json());
const mongoose = require('mongoose');
const route = require('./routes/route')
const multer = require('multer');


app.use('/', route);
app.use(multer().any());

try {
    //Insert your MongoDB Atlas String here:
    mongoose.connect("mongodb+srv://rahat6713:1819rahat@cluster0.iee0y.mongodb.net/Project-2-Group-1?retryWrites=true&w=majority", {useNewUrlParser:true});
    console.log(`MongoDB Connection Successful`);
} catch (error) {
    console.log(error);
}




const port = process.env.PORT || 3000;
app.listen(port, console.log(`Express App running on ${port} 🚀`));