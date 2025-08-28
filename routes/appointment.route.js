
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware.js');
const Router = express.Router();
const {createAppointment , cancelAppointment , getAppointment} = require('../controllers/appointment.controller.js');

Router.post('/', authMiddleware, createAppointment)
Router.post('/:id/cancel', authMiddleware, cancelAppointment)
Router.get('/me', authMiddleware, getAppointment)



module.exports = Router;