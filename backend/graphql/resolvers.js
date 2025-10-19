const User = require('../models/User');

const AuthMessage = require('../dto/AuthMessage');

const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const authorize = require('../middleware/authMiddleware');

const generateAccessToken = (user) => {
  return jwt.sign( {id: user._id, username: user.username}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({id: user._id, username: user.username} , process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });
};

const resolvers = {
    Query: {
        blogs : async (_,__,  context) => {

            if (!context.user) throw new Error("Unauthorized");

            return await Blog.find().populate('author')
        },
        comments : async (_,__, context) => {
            if (!context.user) throw new Error("Unauthorized");
            
            return await Comment.find()
            .populate('blog')
            .populate('author')
        },
        users : async () => {
            return await User.find()
        },

        user: async (_, args, context) => {
            if (!context.user) throw new Error("Unauthorized");

            const { id, username, email } = args;
            const query = {
                $or: [
                    { _id: id },
                    { username: username },
                    { email: email }
                ]
            };

            const cleanQuery = {
                $or: query.$or.filter(cond => Object.values(cond)[0] !== undefined)
            };
            const user = await User.findOne(cleanQuery)

            return user;
        },

        blog: async (_, args, context) => {
            if (!context.user) throw new Error("Unauthorized");
            const { id} = args;
            const blog = await Blog.findOne({_id: id})
            .populate('author');
            return blog;
        },

        blogComments: async (_, args, context) => {
            if (!context.user) throw new Error("Unauthorized");
            const { idBlog } = args;
            const comments = await Comment.find({blog: idBlog})
            .populate("author");
            
            return comments;
        }
    },
 
    Mutation: {
        createUser: async (_, args, context) => {
            if (!context.user) throw new Error("Unauthorized");
            const userAdded = await User.create({
				username: args.username,
				email: args.email,
                password: args.password,
				address: args.address
			});

            return userAdded;
        },

        createBlog: async (_, args, context) => {
            if (!context.user) throw new Error("Unauthorized");

            const { title, body, author, category , imageUrl} = args;
            blogAdded = await Blog.create({
                title, body, author, category , imageUrl
            });

            return blogAdded;
        },

        createComment: async (_, args, context) => {
            if (!context.user) throw new Error("Unauthorized");

            const { body, author, blog } = args;
            const commentAdded = await Comment.create({ body, author, blog });
            
            return commentAdded;
        },

        //blogId: ID! title: String!, body: String!,  category: String!
        updateBlog: async (_, args, context) => {
            if (!context.user) throw new Error("Unauthorized");

            const {blogId, title, body, category} = args;

            try{
                const blog = await Blog.findOneAndUpdate({_id:blogId },
                    {title, body, category},
                    { new: true }
                );
            if(!blog){
                console.log('Blog non trouvé');
                return null;
            }
            return blog;
            }catch(err){
                console.log('Erreur lors de la mise à jour du blog:', err)
            }

        },
        
        updateComment: async (_, args, context) => {
            if (!context.user) throw new Error("Unauthorized");

            try{
                 const {commentId, body} = args;
                 const comment = await Comment.findOneAndUpdate({_id: commentId },
                    { body},
                    { new: true }
                );

                if(!comment){
                    console.log('Commentaire non trouvé');
                    return null;
                 }

                return comment;

            }catch(err){
                console.log('Erreur lors de la mise à jour du Commentaire:', err)
            }

        },

        deleteComment: async (_,args, context) => {
            if (!context.user) throw new Error("Unauthorized");

            const {commentId} = args
            try{
                const deletedComment= await Comment.findByIdAndDelete(commentId)
                .populate("blog")
                .populate("author");

                if(!deletedComment){
                    console.log('Commentaire non trouvé');
                    return null;
                 }

                return deletedComment;
            }catch(err){
                console.log('Erreur lors de la suppression du Commentaire:', err)
            }
        },

        deleteBlog: async (_, args, context) => {
            if (!context.user) throw new Error("Unauthorized");

            const {blogId} = args

            try{

                const deletedBlog = await Blog.findByIdAndDelete(blogId)
                .populate("author");

                const deletedComment = await Comment.deleteMany({blog: blogId});

                if(!deletedBlog){
                    console.log('Blog non trouvé');
                    return null;
                 }
                 return deletedBlog;
            }catch(err){
                console.log('Erreur lors de la suppression du Blog:', err);
            }
        },

        register: async (_,args) => {
            const { username, email, password } = args;
           try{
                // Verifiation
                if (!username || !password || !email) {
                    console.log('Champs requis manquants');
                    return null;
                }

                // Vérifie si l'utilisateur existe déjà
                const existingUser = await User.findOne({ username });
                if (existingUser) {
                    console.log('Nom d’utilisateur déjà pris' );
                    return null;
                }

                // Hash du mot de passe
                const hashedPassword = await bcrypt.hash(password, 10);

                // Sauvegarde
                const newUser = new User({ username, email, password: hashedPassword });
                const userAdded=  await newUser.save();

                console.log('Utilisateur créé avec succès' );

                return userAdded;
            }catch(err){
                console.log("Erreur", err);
            }
        },

        login: async (_, args) => {
            const { username, password } = args;

            try {   
                const user = await User.findOne({ username });
                if (!user) {
                    console.log('Utilisateur introuvable' );
                    return null;
                }
            
                const valid = await bcrypt.compare(password, user.password);
                if (!valid) {
                    console.log('Mot de passe incorrect');
                    return null;
                }

                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);

                user.refreshToken = refreshToken;
                await user.save();

                console.log({ message: 'Connexion réussie', accessToken, refreshToken });

                return new AuthMessage(accessToken,refreshToken);

            }catch(err){
                console.log("Erreur", err);

                 return null;
            }
        }
    
    }
}

module.exports = resolvers