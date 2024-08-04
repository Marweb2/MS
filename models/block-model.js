/** @format */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const projetSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "users" },
    by: { type: Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

const BlockModel = mongoose.model("Blocked", projetSchema);

module.exports = BlockModel;
