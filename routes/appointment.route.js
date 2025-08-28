
const express = require('express');
const { Appointment, Availability, User } = require('../models/model.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');
const router = express.Router();

router.post('/', authMiddleware, async (req, res))
router.post('/:id/cancel', authMiddleware, async (req, res))
router.get('/me', authMiddleware, async (req, res))



module.exports = router;