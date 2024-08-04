/** @format */

const mongoose = require("mongoose");
const { Schema } = mongoose;
const projetSchema = new mongoose.Schema(
  {
    assistantId: { type: Schema.Types.ObjectId, ref: "users" },
    avisId: { type: Schema.Types.ObjectId, ref: "AvisProjet" },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
    date: String,
  },
  { timestamps: true }
);

const ProjetModel =
  mongoose.models.AssistantFavorite ||
  mongoose.model("AssistantFavorite", projetSchema);

module.exports = ProjetModel;
