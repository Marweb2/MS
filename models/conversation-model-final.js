/** @format */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new mongoose.Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Please provide a client"],
    },

    assistant: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Please provide an assistant"],
    },

    projectId: { type: Schema.Types.ObjectId, ref: "ProjetModel" },
    avisId: { type: Schema.Types.ObjectId, ref: "AvisProjet" },
    viewedByClient: {
      type: Boolean,
      default: false,
    },
    viewedByAssistant: {
      type: Boolean,
      default: false,
    },
    modifiedByClient: Date,
    modifiedByAssistant: Date,
    lastMesssageSentBy: String,
    deletedByClient: {
      type: Boolean,
      default: false,
    },
    deletedByAssistant: {
      type: Boolean,
      default: false,
    },
    date: String,
    notViewedByAssistant: Number,
    notViewedByClient: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConversationModel", schema);
