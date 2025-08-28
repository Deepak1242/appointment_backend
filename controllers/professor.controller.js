// routes/prof.js
const express = require('express');
const { Availability, Appointment, User } = require('../models/model.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');


export const professorAvailability = async (req, res) => {
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
    return res.json({ created });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

//professor fetches available slots for professor (availabilities minus already booked times)
export const professorSlots = async (req, res) => {
    const avail = await Availability.findAll({ where: { professorId: req.params.profId } });
    return res.json({ avail });
    
}

// Student fetches available slots for professor (availabilities minus already booked times)
export const professorAppointments = async (req, res) => {
    const profId = req.params.profId;
  // Get availabilities
  const availabilities = await Availability.findAll({ where: { professorId: profId }, order: [['start','ASC']] });
  // Get booked appointments for professor (status booked)
  const appointments = await Appointment.findAll({
    where: { professorId: profId, status: 'booked' }
  });
  // For simplicity: treat availabilities as independent slots. If an appointment overlaps that slot, mark it unavailable.
  const slots = availabilities.map(a => {
    const aStart = new Date(a.start).getTime();
    const aEnd = new Date(a.end).getTime();
    const occupied = appointments.some(app => {
      const s = new Date(app.start).getTime();
      const e = new Date(app.end).getTime();
      return !(e <= aStart || s >= aEnd); // overlap
    });
    return {
      id: a.id,
      start: a.start,
      end: a.end,
      available: !occupied
    };
  });
  return res.json({ slots });
}


// Student fetches available slots for professor (availabilities minus already booked times)




