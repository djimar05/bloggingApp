const graphql = require('graphql-tag')

const typeDefs = graphql `
    type User {
        _id: ID!
        username: String!
        email: String!
        address: String
        password: String!
        blogs: [Blog!]
    }
    
    type Blog {
        _id: ID!
        title: String!
        body: String!
        category: String!
        author: User
    }
    
    type Comment {
        body: String!
        createAt: String!
        author: User!
        blog: Blog!
    }

    type AuthMessage {
        accessToken : String!
        refreshToken : String!
    }

    type Query {
        blogs: [Blog!]!
        comments: [Comment!]!
        users: [User!]!
        user(id: ID, username: String, email: String): User
        blog(id:ID!): Blog
        blogComments(idBlog: ID!): [Comment!]
    }

    type Mutation {
        createUser(username: String!, email: String!, password: String!, address: String): User!
        createBlog(title: String!, body: String!, author: ID!, category: String, imageUrl: String): Blog
        createComment(body: String!, author: ID!, blog: ID!): Comment
        updateBlog(blogId: ID!, title: String, body: String,  category: String): Blog
        updateComment(commentId: ID!, body: String!): Comment
        deleteComment(commentId: ID!): Comment
        deleteBlog(blogId: ID!): Blog
        register(username: String!, password: String!, email: String!): User!
        login(username: String!, password: String!): AuthMessage!
    }
`;

module.exports = typeDefs;