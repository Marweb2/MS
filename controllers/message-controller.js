/** @format */

const { condition } = require("../utils/condition");

const conversationModel = require("../models/conversation-model-final");
const Message = require("../models/message-model-final");
const BlockModel = require("../models/block-model");

async function getConversation(req, res) {
  const { client, assistant, projectId, userType } = req.query;
  let populate;
  if (userType === "client") {
    populate = "assistant";
  } else {
    populate = "client";
  }
  console.log(client, assistant, projectId);
  const conversation = await conversationModel
    .findOne({
      $or: condition(assistant, client),
      projectId,
    })
    .populate({
      path: populate,
      select: "isOnline lastOnlineDate",
    });
  let statut;
  let isOnline = false;
  if (userType === "client") {
    const assistant = conversation?.assistant;
    console.log(assistant);
    if (assistant?.isOnline === false) {
      const date1 = new Date(new Date().toISOString());
      const date2 = new Date(assistant.lastOnlineDate);
      const difference = date1.getTime() - date2.getTime();
      const sec = Math.floor(difference / 1000);
      const min = Math.floor(sec / 60);
      const h = Math.floor(min / 60);
      const d = Math.floor(h / 24);
      if (min < 1) {
        statut = "à l'instant";
      } else if (min > 1 && min < 60) {
        statut = `${min} min`;
      } else if (h >= 1 && h <= 23) {
        statut = `${h}h`;
      } else {
        statut = `${d}j`;
      }
    } else {
      isOnline = true;
    }
  } else if (userType === "assistant") {
    const client = conversation?.client;
    if (client?.isOnline === false) {
      const date1 = new Date(new Date().toISOString());
      const date2 = new Date(client.lastOnlineDate);
      const difference = date1.getTime() - date2.getTime();
      const sec = Math.floor(difference / 1000);
      const min = Math.floor(sec / 60);
      const h = Math.floor(min / 60);
      const d = Math.floor(h / 24);
      if (min <= 1) {
        statut = "à l'instant";
      } else if (min > 1 && min < 60) {
        statut = `${min} min`;
      } else if (h >= 1 && h <= 23) {
        statut = `${h}h`;
      } else {
        statut = `${d}j`;
      }
    } else {
      isOnline = true;
    }
  } else {
    isOnline = true;
    statut = statut;
  }

  const messages = await Message.find({
    conversationId: conversation?._id,
  });

  res.status(200).json({ messages, statut, isOnline, conversation });
}

async function isBlocked(req, res) {
  try {
    const { client, assistant } = req.query;

    const block = await BlockModel.findOne({
      $or: [
        {
          $and: [{ user: client }, { by: assistant }],
        },
        {
          $and: [{ user: assistant }, { by: client }],
        },
      ],
    });

    console.log(block, client, assistant, "test");

    if (!block) {
      res.status(200).json({
        found: false,
      });
    } else {
      res.status(200).json({
        found: true,
        block,
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
}
module.exports = { getConversation, isBlocked };
