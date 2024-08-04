/** @format */

const mongoose = require("mongoose");
const { Schema } = mongoose;
const projetSchema = new mongoose.Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "users" },
    avisId: { type: Schema.Types.ObjectId, ref: "AvisProjet" },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
  },
  { timestamps: true }
);

const ProjetModel =
  mongoose.models.ClientFavorite ||
  mongoose.model("ClientFavorite", projetSchema);

module.exports = ProjetModel;
