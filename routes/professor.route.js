const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware.js');
const { professorAvailability , professorSlots , professorAppointments } = require('../controllers/professor.controller.js');
const router = express.Router();

router.post('/availability', authMiddleware, professorAvailability);

router.get('/:profId/availabilities', authMiddleware, professorSlots);

router.get('/:profId/slots', authMiddleware, professorAppointments);


module.exports = router;
