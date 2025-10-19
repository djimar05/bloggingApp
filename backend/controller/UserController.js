const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const User = require('../models/User');

const generateAccessToken = (user) => {
  return jwt.sign( {id: user._id, username: user.username}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({id: user._id, username: user.username} , process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });
};

const controller = {
    register : async  function(req, res) {
        try{
            const { username, email, password } = req.body;

            // Verifiation
            if (!username || !password) {
                return res.status(400).json({ error: 'Champs requis manquants' });
            }

            // Vérifie si l'utilisateur existe déjà
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: 'Nom d’utilisateur déjà pris' });
            }

            // Hash du mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Sauvegarde
            const newUser = new User({ username, email, password: hashedPassword });
            await newUser.save();

            res.status(201).json({ message: 'Utilisateur créé avec succès' });
        }catch(err){
            console.log("Erreur", err)
            res.status(500).json({ error: err.message });
        }
    },

    login: async  function(req, res){

       try{
            const { username, password } = req.body;

            const user = await User.findOne({ username });
            if (!user) return res.status(400).json({ message: 'Utilisateur introuvable' });
            
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.status(400).json({ message: 'Mot de passe incorrect' });

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            user.refreshToken = refreshToken;
            await user.save();

            res.status(200).json({ message: 'Connexion réussie', accessToken, refreshToken });
       }catch(error){
            res.status(500).json({ error: error.message });
       }
    },

    refresh: async function(req, res){
        const { refreshToken } = req.body;

        if (!refreshToken) return res.status(401).json({ message: 'Aucun token fourni' });

        const user = await User.findOne({ refreshToken });
        if (!user) return res.status(403).json({ message: 'Refresh token invalide' });
        console.log(`refreshToken : ${refreshToken} , JWT_REFRESH_SECRET :${process.env.JWT_REFRESH_SECRET}`);
        
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err){
                console.log("Erreur", err)
                return res.status(403).json({ message: 'Token expiré ou invalide' });
            }else{
                console.log("Userdecoded", decoded)
                
                const accessToken = generateAccessToken(user);
                res.json({ accessToken });
            }

        });
    },

    logout: async function(req, res){
        const { refreshToken } = req.body;

        const user = await User.findOne({ refreshToken });
        if (!user) return res.status(400).json({ message: 'Utilisateur introuvable' });

        user.refreshToken = null;
        await user.save();

        res.status(200).json({ message: 'Déconnexion réussie' });

    }

}

module.exports = controller;