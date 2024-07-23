// import
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const AppError = require("./utils/appError");
const runCommand = require("./utils/shellCommand");
const util = require("util");



// variables from en viroument variables
const port = process.env.PORT || 800;
const DB = process.env.DATABASE_NAME;
const url = `mongodb://localhost:27017/${DB}`
// const url = `mongodb+srv://shaamil:boss@cluster0.zv5ews4.mongodb.net/${DB}`
// `mongodb+srv://amiin:amiinboss@cluster0.dh4gwdv.mongodb.net/${DB}`
// `mongodb+srv://amiin:amiinboss@cluster0.dh4gwdv.mongodb.net/${DB}`
const user = process.env.DATABASE_USER;
const pass = process.env.DATABASE_PASSWORD;
const authSource = process.env.AUTHSOURCE;

// Check if Database Exists, if not throw error  

Admin = mongoose.mongo.Admin;
var connection = mongoose.createConnection(url);
connection.on('open', function () {
  new Admin(connection.db).listDatabases(function (err, result) {
    if (!DB) {
      throw new AppError("No conncetion Setting was found", 400)
    }
    var db = result.databases.filter((database) => database.name === DB);
    if (db.length < 1) {
      throw new AppError(`Database Connection Error, ${DB} was not found!`, 400)
    }
  });
});


// connect to mongdb instance with user and password
const options = {
  authSource,
  user,
  pass,
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

mongoose.connect(url, options).then((result) => {
  console.log("DB connection successful!");
}).catch(err => {
  console.log("Database Connection Error" + err)
});

// listen the server
const command = `npx kill-port 80`;
runCommand(command).then(() => {
  // listen the server
  app.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });
});
