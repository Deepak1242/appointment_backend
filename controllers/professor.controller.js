// routes/prof.js
const express = require('express');
const { Availability, Appointment, User } = require('../models/model.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');


const professorAvailability = async (req, res) => {
  if (req.user.role !== 'professor') return res.status(403).json({ error: 'Only professors' });
  const slots = Array.isArray(req.body) ? req.body : [req.body];
  const created = [];
  try {
    for (const s of slots) {
      if (!s.start || !s.end) return res.status(400).json({ error: 'Missing start or end for slot' });
      const start = new Date(s.start);
      const end = new Date(s.end);
      if (end <= start) return res.status(400).json({ error: 'end must be after start' });
      const a = await Availability.create({ professorId: req.user.id, start, end });
      created.push(a);
    }
    return res.status(200).json({ created });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}


const professorSlots = async (req, res) => {
    const [avail] = await Availability.findAll({ where: { professorId: req.params.profId } });
    return res.status(200).json({ avail });
    
}


const professorAppointments = async (req, res) => {
    const profId = req.params.profId;
  
  const availabilities = await Availability.findAll({ where: { professorId: profId }, order: [['start','ASC']] });
  
  const appointments = await Appointment.findAll({
    where: { professorId: profId, status: 'booked' }
  });
  
  const slots = availabilities.map(a => {
    const aStart = new Date(a.start).getTime();
    const aEnd = new Date(a.end).getTime();
    const occupied = appointments.some(app => {
      const s = new Date(app.start).getTime();
      const e = new Date(app.end).getTime();
      return !(e <= aStart || s >= aEnd); 
    });
    return {
      id: a.id,
      start: a.start,
      end: a.end,
      available: !occupied
    };
  });
  return res.status(200).json({ slots });
}


module.exports = {professorAvailability , professorSlots , professorAppointments}
