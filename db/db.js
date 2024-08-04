/** @format */

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const connectToDb = (url) => {
  return mongoose.connect(url);
};

module.exports = connectToDb;
