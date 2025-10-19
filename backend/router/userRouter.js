var userRouter = require('express').Router();

var userController = require('../controller/UserController');

userRouter.route('/api/signup').post(userController.register);

userRouter.route('/api/login').post(userController.login);

userRouter.route('/api/refresh').post(userController.refresh);

userRouter.route('/api/logout').post(userController.logout);

module.exports = userRouter;