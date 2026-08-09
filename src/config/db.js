require('dotenv').config()
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(MONGO_URI)
        console.log(`MongoDB connected: ${connect.connection.host}`)
    }
    catch(err) {
        console.error(`Error connecting database : ${err}`)
        process.exit(1);
    }
}

module.exports = connectDB;