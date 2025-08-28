const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware.js');
const { professorAvailability , professorSlots , professorAppointments } = require('../controllers/professor.controller.js');
const Router = express.Router();

Router.post('/availability', authMiddleware, professorAvailability);

Router.get('/:profId/availabilities', authMiddleware, professorSlots);

Router.get('/:profId/slots', authMiddleware, professorAppointments);


module.exports = Router;
