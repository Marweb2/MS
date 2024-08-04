/** @format */

const express = require("express");
const {
  getConversation,
  isBlocked,
} = require("../controllers/message-controller");
const router = express.Router();

router.get("/get", getConversation);
router.get("/block", isBlocked);

module.exports = router;
