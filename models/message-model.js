/** @format */

const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Message must must have content"],
      trim: true,
    },
    from: String,
    to: String,
    date: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", schema);
