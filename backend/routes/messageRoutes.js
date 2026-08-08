const express = require("express");
const {
  allMessages,
  sendMessage,
  editMessage,
  deleteMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/:messageId").put(protect, editMessage).delete(protect, deleteMessage);

module.exports = router;
