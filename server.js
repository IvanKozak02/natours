const mongoose = require('mongoose');
const dotenv = require('dotenv');               // package that allows to bind env defined in config.env file with node env vars
dotenv.config({ path: './config.env' });   // env variables config

const app = require('./app');

//DB config with mongoose
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false
}).then((con) => console.log('DB was connected successfully!!!'));

const server = app.listen(process.env.PORT, () => {
  console.log('SERVER STARTED...');
});


process.on('UnhandledRejection', err=>{
  console.log(err.name, err.message);
  server.close();
  process.exit(1);
})


process.on('uncaughtException', err=>{
  console.log(err.name, err.message);
  server.close();
  process.exit(1);
})



