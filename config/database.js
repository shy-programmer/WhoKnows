const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoDB = process.env.MONGO_URL

const connect = async () => {
  try {
    await mongoose.connect(mongoDB);
    console.log("Connected to MongoDB");
  } 
  catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

module.exports = { connect };