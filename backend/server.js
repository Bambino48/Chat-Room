const express = require('express');
const chats = require('./data/data');
const dotenv = require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send("L'API a demarrer avec success");
});

app.get('/api/chats', (req, res) => {
    res.send(chats);
});

app.get('/api/chats/:id', (req, res) => {
    //console.log(req.params.id);
    const singleChat = chats.find((c) => c._id === req.params.id);
    res.send(singleChat);
});

app.listen(PORT, () => {
    console.log(`L'application tourne sur http://localhost:${PORT}`);
});

