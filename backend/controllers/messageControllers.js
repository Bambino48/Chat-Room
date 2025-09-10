const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const path = require("path");
const multer = require("multer");

// Configuration de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "uploads")); // <- parent du dossier controllers
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});


const upload = multer({ storage });


// ✅ Récupérer tous les messages d’un chat
const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate({
                path: "chat",
                populate: {
                    path: "users",
                    select: "name pic email",
                },
            });

        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// ✅ Envoyer un message texte
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res.status(400).json({ message: "Contenu ou ID de chat manquant." });
    }

    let newMessage = {
        sender: req.user._id,
        content,
        chat: chatId,
        type: "text",
    };

    try {
        let message = await Message.create(newMessage);
        message = await Message.findById(message._id)
            .populate("sender", "name pic")
            .populate({
                path: "chat",
                populate: {
                    path: "users",
                    select: "name pic email",
                },
            });

        await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
        res.status(200).json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// ✅ Upload de fichier
// ✅ Upload de fichier (amélioré avec métadonnées)
const uploadFileController = [
    upload.single("file"),
    asyncHandler(async (req, res) => {
        try {
            const { chatId } = req.body;
            const file = req.file;

            if (!file || !chatId) {
                return res.status(400).json({ message: "Fichier ou ID de chat manquant." });
            }

            const fileUrl = `/uploads/${file.filename}`; // accessible via serveur static
            const newMessage = await Message.create({
                sender: req.user._id,
                chat: chatId,
                type: "file",
                content: fileUrl, // fallback si tu veux afficher un lien direct
                file: {
                    name: file.originalname,
                    url: fileUrl,
                    mimeType: file.mimetype,
                },
            });

            const fullMessage = await Message.findById(newMessage._id)
                .populate("sender", "name pic")
                .populate({
                    path: "chat",
                    populate: {
                        path: "users",
                        select: "name pic email",
                    },
                });

            await Chat.findByIdAndUpdate(chatId, { latestMessage: fullMessage });

            res.status(200).json(fullMessage);
        } catch (error) {
            console.error("Upload error:", error);
            res.status(500).json({ message: "Upload échoué" });
        }
    }),
];


module.exports = {
    allMessages,
    sendMessage,
    uploadFileController,
};
