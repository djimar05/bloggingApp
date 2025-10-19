var express = require('express');
var db = require('./config/db');

var userRouter = require('./router/userRouter');


const AppoloServer = require('@apollo/server') ;
const resolvers= require('./graphql/resolvers');
const typeDefs = require('./graphql/typeDefs');
const {expressMiddleware}= require('@as-integrations/express5');
const { ApolloServer } = require('@apollo/server');
const cors = require('cors')



var middlewareLogger = require('./middleware/loggerMiddleware');
const middlewareLimiter = require('./middleware/limiterMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const authorize = require('./middleware/authMiddleware');

const PORT = 5000;



var app = express();

app.use(express.json());

app.use(middlewareLogger.logger);

app.use('/user', middlewareLimiter.rateLimter, userRouter);

const serverAppolo = async () => {
	const server = new ApolloServer({
		typeDefs,
		resolvers,
	});
	
	await server.start()

    app.use('/graphql', cors(), express.json(),  expressMiddleware(server,
        {
            context: async ({req, res}) => {
                const ctx =   authorize(req);
                console.log("test context : " + JSON.stringify(ctx));
                return ctx;
            }
        }
    ));

}


app.listen(PORT, function () {
        console.log('Blogging APP listening on http://localhost:' + PORT);
    });
    
serverAppolo().then((url) =>{
    console.log('oK')
}).catch((err) => {
    console.log("erreur", err)
});