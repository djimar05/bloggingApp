const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const authorize =   function(req ){
    const authHeader = req.headers['authorization'];

    console.log(" > authMiddleware");

    console.log("authHeader", authHeader)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            user : null,
            code: 401,
            message: 'Token manquant ou mal formaté.'
        }
    }

    const token = authHeader.split(' ')[1];

   
    console.log(token, 'token Authentification\n')

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
    
        return {
            user : decoded,
            code: 200,
            message: 'Authentification reussie.'
        };

        
    } catch (err) {
        console.log("Erreur serveur.", err)
        
        return {
            user : null,
            code: 500,
            message: 'Token invalide ou expiré.'
        };

    }
}


module.exports = authorize;