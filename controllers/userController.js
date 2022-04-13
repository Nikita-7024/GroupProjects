const userModel = require('../models/userModel');
const validator = require('../utils/validator');
const aws = require('../aws/profilePicture');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
    try {
        let requestBody = req.body;
        let files = req.files;

        if (Object.keys(requestBody).length == 0) {
            return res.status(400).json({ status: false, msg: `Please input some data in the body!` });
        }
        let { fname, lname, email, password, phone, address } = requestBody;  //destructuring method 

        // validation Start -------------------------------
        if (!requestBody.fname) {
            return res.status(400).json({ status: false, msg: `First Name is mandatory!` });
        }
        if (!validator.isValidString(fname)) {
            return res.status(400).json({ status: false, msg: `Please input valid First Name!` });
        }
        if (!requestBody.lname) {
            return res.status(400).json({ status: false, msg: `Last Name is mandatory!` });
        }
        if (!validator.isValidString(lname)) {
            return res.status(400).json({ status: false, msg: `Please input valid Last Name!` });
        }

        // Email validation-----------------------
        if (!requestBody.email) {
            return res.status(400).json({ status: false, msg: `eMail is mandatory!` });
        }
        if (!validator.isValidString(email)) {
            return res.status(400).json({ status: false, msg: `please input valid email!` });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ status: false, msg: `Invalid eMail Address!` });
        }
        const isEmailAlreadyUsed = await userModel.findOne({ email: email });
        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${email} is already registered!` });
        }

        // password validation----------------------
        if (!requestBody.password) {
            return res.status(400).json({ status: false, msg: `password is mandatory field!` });
        }
        if (!validator.isValidString(password)) {
            return res.status(400).json({ status: false, msg: `please input valid password!` });
        }
        if (!validator.isValidPassword(password)) {
            return res.status(400).json({ status: false, msg: `password must be 8-15 characters long!` });
        }

        // phone validatiion------------------
        if (!requestBody.phone) {
            return res.status(400).json({ status: false, msg: `phone is mandatory field!` });
        }
        if (!validator.isValidString(phone)) {
            return res.status(400).json({ status: false, msg: `please input valid phone!` });
        }
        if (!/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ status: false, msg: `Invalid Phone Number!` });
        }
        const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone });
        if (isPhoneAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${phone} is already registered` });
        }

        // address validation------------------
        if (!requestBody.address) {
            return res.status(400).json({ status: false, msg: `address is mandatory field!` });
        }
        if (!validator.isValidString(address)) {
            return res.status(400).json({ status: false, msg: `address is mandatory field!` });
        }
        // shipping address validation-------------------
        if (!requestBody.address["shipping"]["street"]) {
            return res.status(400).json({ status: false, msg: `shipping street  is mandatory field!` });
        }
        if (!requestBody.address["shipping"]["city"]) {
            return res.status(400).json({ status: false, msg: ` shipping city  is mandatory field!` });
        }
        if (!requestBody.address["shipping"]["pincode"]) {
            return res.status(400).json({ status: false, msg: `shipping pincode is mandatory field!` });
        }
        //Billing Address Validation----------------
        if (!requestBody.address["billing"]["street"]) {
            return res.status(400).json({ status: false, msg: ` billing street is mandatory field!` });
        }
        if (!requestBody.address["billing"]["city"]) {
            return res.status(400).json({ status: false, msg: `billing city is mandatory field!` });
        }
        if (!requestBody.address["billing"]["pincode"]) {
            return res.status(400).json({ status: false, msg: `billing PIN code is mandatory field!` });
        }
        // validation ends -----------

        profileImage = await aws.uploadFile(files[0]); //upload s3 link of profileImage

        // create user -----------------
        let finalData = { fname, lname, email, password, profileImage, phone, address };
        const userData = await userModel.create(finalData);
        res.status(201).json({ status: true, data: userData });


    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
        console.log(error);
    }
}

const userLogIn = async (req, res) => {
    try {
        let requestBody = req.body;
        // validation start --------------
        if (Object.keys(requestBody).length === 0) {
            return res.status(400).json({ status: false, msg: `Invalid input. Please enter email and password!`, });
        }
        const { email, password } = requestBody;

        if (!requestBody.email) {
            return res.status(400).json({ status: false, msg: `email is mandatory field!` });
        }
        if (!validator.isValidString(email)) {
            return res.status(400).json({ status: false, msg: `email is mandatory field!` });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ status: false, msg: `Invalid eMail Address!` });
        }
        if (!requestBody.password) {
            return res.status(400).json({ status: false, msg: `password is mandatory field!` });
        }
        if (!validator.isValidString(password)) {
            return res.status(400).json({ status: false, msg: `password is mandatory field!` });
        }
        // validation ends -----------------

        const findUser = await userModel.findOne({ email: email, password: password, });
        if (!findUser) {
            return res.status(401).json({ status: false, msg: `Invalid email or password!` });
        }

        // generate token -----------------
        const token = jwt.sign({
            userId: findUser._id
        }, "thorium@group8", { expiresIn: '1500mins' });

        res.setHeader("x-api-key", token);
        let UserID = findUser._id
        let finalData = { token, UserID }
        res.status(201).json({ status: true, msg: `user login successful`, data: finalData });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        let { userId: _id } = req.params;
        if (!validator.isValidObjectId(_id)) {
            return res.status(400).json({ status: false, msg: `Invalid ID!` });
        }
        const userData = await userModel.findById(_id);

        if (!userData) {
            return res.status(404).json({ status: false, msg: `${_id} is not present in DB!` });
        }
        res.status(200).json({ status: true, data: userData });


    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
}

const updateUserProfile = async (req, res) => {
    try {
        // let { userId: _id } = req.params;
        let userId = req.params.userId
        let requestBody = req.body;
        const salt = await bcrypt.genSalt(10);

        if (Object.keys(requestBody).length === 0) {
            return res.status(400).send({ status: false, msg: "Enter Data to update." })
        }
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).json({ status: false, msg: `Invalid User ID!` });
        }

        const checkID = await userModel.findById(userId);

        if (!checkID) {
            return res.status(404).json({ status: false, msg: `${_id} is not present in DB!` });
        }

        if (checkID._id.toString() !== req.params.userId) {
            //console.log(checkID._id, req.params.userId );
            return res.status(401).json({ status: false, msg: `User not authorised to update profile!` });
        }


        const { email, phone, fname, lname, password } = requestBody;

        const isEmailAlreadyUsed = await userModel.findOne({ email: email });

        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${email} already exists!` });
        }

        // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        // return res.status(400).json({ status: false, msg: `Invalid eMail Address!` });
        // }
        const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone });
        if (isPhoneAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${phone} already exists!` });
        }

        requestBody.password = await bcrypt.hash(requestBody.password, salt);
        // let files = req.files
        // profileImage = await aws.uploadFile(files[0]);
        let updatedata = req.body
        const updateUser = await userModel.findOneAndUpdate({ "_id": userId }, { "$set": { "fname": fname, "lname": lname, "email": email, "phone": phone, "password": password}})

        res.status(201).json({ status: true, msg: `Updated Successfully`, data: updateUser });

        // const newData = await userModel.find({ _id: userId }, { fname: updatedata.fname, lname: updatedata.lname, email: updatedata.email, files: updatedata.profileImage, phone: updatedata.phone, password: updatedata.password })

        // const updateUser = await userModel.updateMany(newData)
        // res.status(201).json({ status: true, msg: `Updated Successfully`, data: updateUser });



    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
}


module.exports = {
    createUser,
    userLogIn,
    getUserProfile,
    updateUserProfile
}





