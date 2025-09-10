const express = require('express');
const { registerUser, authUser, allUsers } = require('../controllers/userControllers');
const { protect } = require('../middlewares/authMiddleware');
const { updateUserProfile } = require('../controllers/userControllers');

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login",authUser);
router.route("/update").put(protect, updateUserProfile);

module.exports = router;