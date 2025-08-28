
const express = require('express');
const bcrypt = require('bcryptjs');

const { User } = require('../models/model.js');
const { authMiddleware} = require('../middlewares/auth.middleware.js');
const {loginController , registerController} = require('../controllers/auth.controller.js');
const {Router} = express.Router();

Router.post('/login', authMiddleware, loginController)
Router.post('/register', authMiddleware, registerController)


const router = express.Router();