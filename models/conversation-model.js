/** @format */

const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    user1: {
      type: String,
      required: [true, "Please provide User1"],
    },

    user2: {
      type: String,
      required: [true, "Please provide User2"],
    },

    messages: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Message",
        required: [true, "Please provide message"],
      },
    ],

    lastMessage: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
      required: [true, "Please provide last message"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", schema);
