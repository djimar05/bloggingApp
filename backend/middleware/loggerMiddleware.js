function logger(req, res, next){
    
    console.log("Requête interceptée : ",  req.method, req.originalUrl);

    next();
}

module.exports.logger = logger;