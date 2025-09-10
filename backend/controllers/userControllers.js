const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Veuillez remplir tous les champs");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("Cet utilisateur existe déjà");
    }

    const user = await User.create({
        name,
        email,
        password,
        pic
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id), // Assuming you have a method to generate a token
        });
    } else {
        res.status(400);
        throw new Error("Erreur lors de la création de l'utilisateur");
    }
});

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }); // Find user by email

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id), // Assuming you have a method to generate a token
        });
    } else {
        res.status(401);
        throw new Error("Email ou mot de passe incorrect");
    }
});

const allUsers = asyncHandler(async (req, res) => {
    let keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ]
    } : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
    // if (!users) {
    //     res.status(404);
    //     throw new Error("Aucun utilisateur trouve");
    // }
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.pic = req.body.pic || user.pic;

        if (req.body.password && req.body.password.trim() !== "") {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            pic: updatedUser.pic,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error("Utilisateur introuvable");
    }
});


module.exports = { registerUser, authUser, allUsers, updateUserProfile };