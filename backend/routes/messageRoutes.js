const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { sendMessage, allMessages, uploadFileController } = require('../controllers/messageControllers');

const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessages);
router.post('/upload', protect, uploadFileController);


module.exports = router;