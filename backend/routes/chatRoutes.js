const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  toggleFavoriteChat,
  fetchPublicRooms, // import de la nouvelle fonction
  createPublicChat,
} = require('../controllers/chatControllers');

const router = express.Router();

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChats);
router.route('/group').post(protect, createGroupChat);
router.route('/rename').put(protect, renameGroup);
router.route('/groupadd').put(protect, addToGroup);
router.route('/groupremove').put(protect, removeFromGroup);

// Route pour marquer/démarquer un chat comme favori
router.route('/:id/favorite').put(protect, toggleFavoriteChat);

// Nouvelle route pour récupérer les salons publics
router.route('/public-rooms').get(protect, fetchPublicRooms);
router.route('/public').post(protect, createPublicChat);

module.exports = router;
