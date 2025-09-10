const express = require("express");
const chats = require("./data/data");
const connectDB = require("./config/db");
const dotenv = require("dotenv").config();
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
const cors = require("cors");

app.use(cors({
    origin: "http://localhost:3000", // autorise ton front React
    credentials: true
}));
app.use(express.json()); // Parse JSON
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.get("/", (req, res) => {
    res.send("L'API a démarré avec succès");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Middlewares
app.use(notFound);
app.use(errorHandler);

// Démarrer le serveur
const server = app.listen(PORT, () => {
    console.log(`✅ Serveur lancé : http://localhost:${PORT}`.yellow.bold);
});

// SOCKET.IO
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
});

const connectedUsers = new Map(); // socket.id -> userData

io.on("connection", (socket) => {
    console.log("🔌 Socket connecté");

    // Quand un utilisateur se connecte
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        connectedUsers.set(socket.id, userData);
        socket.emit("connected");

        const userList = Array.from(connectedUsers.values());
        io.emit("connected users", userList); // envoyer la liste actualisée
    });

    // Rejoindre un chat
    socket.on("join chat", (room) => {
        socket.join(room);
        console.log(`👤 Rejoint le chat : ${room}`);
    });

    // Événements de typing
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    // Nouveau message
    socket.on("new message", (newMessageReceived) => {
        const chat = newMessageReceived.chat;
        if (!chat.users) return;

        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    // Déconnexion
    socket.on("disconnect", () => {
        console.log("❌ Socket déconnecté");
        connectedUsers.delete(socket.id);

        const userList = Array.from(connectedUsers.values());
        io.emit("connected users", userList); // mettre à jour la liste
    });
});
