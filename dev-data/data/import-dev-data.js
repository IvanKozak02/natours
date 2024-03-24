const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');   // package that allows to bind env defined in config.env file with node env vars
const Review = require('../../models/reviewModel')
dotenv.config({ path: './config.env' });   // env variables config

// DB config with mongoose
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false
}).then((con) => console.log('DB was connected successfully!!!'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    // await User.create(users, {validateBeforeSave: false});
    // await Review.create(reviews);
    console.log('Data successfully loaded!!!');
  }catch (err){
    console.log(err);
  }
  process.exit();
}

// DELETE ALL DATA FROM COLLECTION

const deleteData = async () => {
  try {
    await Tour.deleteMany();    // DELETE ALL DOCS FROM COLLECTION
    await User.deleteMany();    // DELETE ALL DOCS FROM COLLECTION
    await Review.deleteMany();    // DELETE ALL DOCS FROM COLLECTION
  }catch (err){
    console.log(err);
  }
  process.exit()
}
console.log(process.argv);

if (process.argv[2] === '--import'){
  importData()
}else if (process.argv[2] === '--delete'){
  deleteData();
}


