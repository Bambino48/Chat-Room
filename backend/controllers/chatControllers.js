const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

// ✅ Accès à un chat privé
const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.sendStatus(400);
    }

    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        const chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            res.status(200).json(fullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

// ✅ Récupérer les chats de l'utilisateur
const fetchChats = asyncHandler(async (req, res) => {
    try {
        const results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        const populated = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
        });

        res.status(200).send(populated);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// ✅ Créer un groupe
const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Veuillez remplir tous les champs" });
    }

    const users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res.status(400).send("Plus de deux utilisateurs sont requis pour créer un groupe");
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// ✅ Renommer un groupe
const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat non trouvé");
    }

    res.json(updatedChat);
});

// ✅ Ajouter un utilisateur au groupe
const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat non trouvé");
    }

    res.json(updatedChat);
});

// ✅ Supprimer un utilisateur du groupe
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat non trouvé");
    }

    res.json(updatedChat);
});

// ✅ Ajouter ou retirer des favoris
const toggleFavoriteChat = asyncHandler(async (req, res) => {
    const chatId = req.params.id;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404);
        throw new Error("Chat introuvable");
    }

    if (!chat.favorites) {
        chat.favorites = [];
    }

    const isFavorite = chat.favorites.some(
        (favId) => favId.toString() === userId.toString()
    );

    if (isFavorite) {
        chat.favorites = chat.favorites.filter(
            (favId) => favId.toString() !== userId.toString()
        );
    } else {
        chat.favorites.push(userId);
    }

    const updatedChat = await chat.save();
    const populatedChat = await Chat.findById(updatedChat._id)
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage");

    res.status(200).json(populatedChat);
});

// ✅ Nouveau : récupérer les salons publics (groupes existants)
const fetchPublicRooms = asyncHandler(async (req, res) => {
    try {
        const publicRooms = await Chat.find({
            isGroupChat: true,
            isPublic: true, // ✅ Ajout du filtre public
        })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .sort({ updatedAt: -1 });

        res.status(200).json(publicRooms);
    } catch (error) {
        res.status(500);
        throw new Error("Erreur lors de la récupération des salons publics");
    }
});


const createPublicChat = asyncHandler(async (req, res) => {
    const { name, avatar, description } = req.body;

    if (!name) {
        return res.status(400).send({ message: "Le nom du salon est requis" });
    }

    try {
        // ✅ Création du salon public avec avatar et description
        const publicChat = await Chat.create({
            chatName: name,
            isGroupChat: true,
            isPublic: true,
            users: [req.user._id],
            groupAdmin: req.user._id,
            avatar: avatar || "https://icon-library.com/images/group-icon-png/group-icon-png-14.jpg",
            description: description || "",
        });

        const fullChat = await Chat.findById(publicChat._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(201).json(fullChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});




module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    toggleFavoriteChat,
    fetchPublicRooms,
    createPublicChat,
};
