/** @format */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new mongoose.Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "ConversationModel",
      required: [true, "Please provide a conversation id"],
    },
    contentType: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message must must have content"],
      trim: true,
    },
    document: {
      type: String,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Please provide the 'from' field"],
    },
    time: String,
    to: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Please provide the 'to' field"],
    },
    date: String,
  },
  { timestamps: true }
);

schema.pre("save", async function (next) {
  const maintenant = new Date();

  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const dateHeureFormattee = new Intl.DateTimeFormat("fr-FR", options).format(
    maintenant
  );
  this.date = `${dateHeureFormattee}`;
  return next();
});

schema.pre("save", async function (next) {
  const date = new Date();

  const hours = date.getHours();
  const minutes = date.getMinutes();
  this.time = `${hours}h${minutes}`;
  return next();
});

module.exports = mongoose.model("Message", schema);
