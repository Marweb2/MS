/** @format */

const express = require("express");
const app = express();
const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const connect = require("./db/db.js");
const messageModel = require("./models/message-model-final");
const conversationModel = require("./models/conversation-model-final.js");
require("dotenv").config();
const { condition } = require("./utils/condition.js");
const mongoose = require("mongoose");
const cors = require("cors");
const messageRoute = require("./routes/message-route.js");
const userModel = require("./models/user-model-final");
const BlockModel = require("./models/block-model");
const ClientFavoriteModel = require("./models/client-favorite-model.js");
const AssistantFavoriteModel = require("./models/assistant-favorite-model.js");
const UserModel = require("./models/user-model-final");
const MessageModel = require("./models/message-model-final.js");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.use(cors());

app.get("/", (req, res) => {
  res.send("salut");
});

try {
  app.use("/conversation", messageRoute);
  app.get("/base", async (req, res) => {
    const a = await conversationModel.updateMany(
      {},
      {
        $set: { date: "07/06/2024 01:19" },
      }
    );
    res.json(a);
  });
  io.on("connection", (socket) => {
    let id;

    socket.on("join", async (data) => {
      if (data) {
        socket.join(`${data}`);
        await userModel.findByIdAndUpdate(data, {
          isOnline: true,
        });
        id = data;
        console.log(`joined ${data}`);
      }
    });
    socket.on("disconnect", async (data) => {
      console.log("disconnected", id);
      await userModel.findByIdAndUpdate(id, {
        isOnline: false,
        lastOnlineDate: new Date().toISOString(),
      });
      io.emit("logout", { msg: `disconnect: ${socket.request.user}` });
    });
    socket.on("typing", async (data) => {
      io.to(data.to).emit("writting", {
        projectId: data.projectId,
        avisId: data.avisId,
      });
    });
    socket.on("notTyping", async (data) => {
      // socket.join(data.to);

      io.to(data.to).emit("notWritting", {
        projectId: data.projectId,
        avisId: data.avisId,
      });
    });
    socket.on("sendMessage", async (data) => {
      const client = data.client;
      const assistant = data.assistant;
      const sender = data.sender;
      const projectId = data.projectId;
      const avisId = data.avisId;
      const contentType = data.contentType;
      const document = data.document;

      const ObjectId = mongoose.isValidObjectId(client);
      const ObjectId2 = mongoose.isValidObjectId(assistant);
      if (!ObjectId || !ObjectId2) {
        try {
          throw new Error("Invalid objectid");
        } catch (error) {
          console.log(error);
        }
      }
      let conversation = await conversationModel.findOne({
        $or: condition(client, assistant),
        projectId,
        avisId,
      });

      console.log(conversation, "conversation");

      const maintenant = new Date();

      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      const dateHeureFormattee = new Intl.DateTimeFormat(
        "fr-FR",
        options
      ).format(maintenant);
      if (!conversation) {
        console.log("tafiditra", projectId, avisId, client, assistant);
        if (sender === "client") {
          conversation = await conversationModel.create({
            client,
            assistant,
            projectId,
            avisId,
            viewedByClient: true,
            viewedByAssistant: false,
            ModifiedByClient: new Date().toISOString(),
            lastMesssageSentBy: sender,
            date: dateHeureFormattee,
            notViewedByAssistant: 1,
          });
        } else {
          conversation = await conversationModel.create({
            client,
            assistant,
            projectId,
            avisId,
            viewedByClient: false,
            viewedByAssistant: true,
            notViewedByClient: 1,
            modifiedByAssistant: new Date().toISOString(),
            lastMesssageSentBy: sender,
            date: dateHeureFormattee,
          });
        }
      } else {
        if (sender === "client") {
          await conversationModel.findOneAndUpdate(
            {
              $or: condition(client, assistant),
              projectId,
              avisId,
            },
            {
              viewedByClient: true,
              viewedByAssistant: false,
              modifiedByClient: new Date().toISOString(),
              lastMesssageSentBy: sender,
              date: dateHeureFormattee,
              notViewedByAssistant: conversation?.notViewedByAssistant + 1,
            }
          );
        } else {
          await conversationModel.findOneAndUpdate(
            {
              $or: condition(client, assistant),
              projectId,
              avisId,
            },
            {
              viewedByClient: false,
              viewedByAssistant: true,
              modifiedByAssistant: new Date().toISOString(),
              lastMesssageSentBy: sender,
              date: dateHeureFormattee,
              notViewedByClient: conversation?.notViewedByClient + 1,
            }
          );
        }
      }

      const message = await messageModel.create({
        content: data.content,
        from: sender === "client" ? client : assistant,
        to: sender === "client" ? assistant : client,
        conversationId: conversation._id,
        contentType,
        document,
      });

      io.to(client)
        .to(assistant)
        .emit("message", { message, projectId, avisId, sender });
      // io.emit("message", { message });
    });
    socket.on("block", async (data) => {
      const { user, by, type, avisId } = data;

      let block = await BlockModel.findOne({
        $or: [
          {
            $and: [{ user: user }, { by: by }],
          },
          {
            $and: [{ user: by }, { by: user }],
          },
        ],
      });

      if (!block) {
        block = await BlockModel.create(data);
      }

      if (type === "client") {
        await ClientFavoriteModel.findOneAndDelete({
          clientId: by,
          avisId,
        });
      } else {
        await AssistantFavoriteModel.findOneAndDelete({
          assistantId: by,
          avisId,
        });
      }

      io.to(user).to(by).emit("userBlocked", {
        by,
        user,
        type: block.type,
      });
    });
    socket.on("deleteBlock", async (data) => {
      const { user, by, avisId } = data;

      const block = await BlockModel.findOneAndDelete({
        $or: [
          {
            $and: [{ user: user }, { by: by }],
          },
          {
            $and: [{ user: by }, { by: user }],
          },
        ],
      });

      io.to(user).to(by).emit("blockDeleted", {
        by,
        user,
        avisId,
      });
    });

    socket.on("lastConversationViewed", async (data) => {
      const { user } = data;

      const block = await UserModel.findOneAndUpdate(
        {
          _id: user,
        },
        {
          lastConversationViewedTime: new Date().toISOString(),
        },
        { new: true }
      );

      io.to(user).emit("changed", {
        okay: true,
      });
    });
    socket.on("conversationViewed", async (data) => {
      const { projectId, assistant, client, userType } = data;

      if (userType === "assistant") {
        const conv = await conversationModel.findOneAndUpdate(
          {
            $or: condition(assistant, client),
            projectId,
          },
          {
            viewedByAssistant: true,
            notViewedByAssistant: 0,
          },
          {
            new: true,
          }
        );
        io.to(client).emit("viewed", {
          projectId,
          assistant,
          convId: conv?._id,
          client,
        });
      } else {
        const conv = await conversationModel.findOneAndUpdate(
          {
            $or: condition(assistant, client),
            projectId,
          },
          {
            viewedByClient: true,
            notViewedByClient: 0,
          }
        );
        console.log(conv);

        io.to(assistant).emit("viewed", {
          projectId,
          assistant,
          convId: conv?._id,
          client,
        });
      }
    });
    socket.on("deletedMessage", async (data) => {
      const { messageId, by, to } = data;

      await MessageModel.findOneAndDelete({ _id: messageId });
      io.to(to).to(by).emit("deleted", {
        deleted: true,
        messageId,
      });
    });
  });
} catch (error) {
  console.log(error);
}

const port = process.env.PORT || 5000;

const connectToDb = async () => {
  try {
    await connect(process.env.MONGODB_URI);
    console.log("connected to mongoDb", process.env.MONGODB_URI);
    server.listen(port, console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};
connectToDb();
