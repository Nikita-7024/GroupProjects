const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    title : {type: String, trim:true, required:true, unique:true},
    description : {type:String, required:true, trim:true},
    price : {type:Number, required:true},
    currencyId : {type:String, required:true, trim:true, uppercase:true, emum:['INR','USD','GBP','EUR', 'AED']},
    currencyFormat : {type:String, required:true, trim:true},
    isFreeShipping : {type:Boolean, default:false},
    productImage : {type:String},
    style : {type:String},
    availableSizes: {type:String, enum:["S", "XS","M","X", "L","XXL", "XL"]},
    installments: {type:Number},
    deletedAt : {type:Date, default:null},
    isDeleted : {type:Boolean, default:false}

}, {timestamps: true});

module.exports = mongoose.model('Products', productSchema);
