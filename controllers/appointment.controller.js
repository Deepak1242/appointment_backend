
export const createAppointment = async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can book' });
  const { professorId, availabilityId, start, end } = req.body;
  try {
    let slotStart, slotEnd;
    if (availabilityId) {
      const avail = await Availability.findByPk(availabilityId);
      if (!avail) return res.status(400).json({ error: 'Invalid availability' });
      if (String(avail.professorId) !== String(professorId)) return res.status(400).json({ error: 'Availability not for that professor' });
      slotStart = new Date(avail.start);
      slotEnd = new Date(avail.end);
    } else {
      if (!start || !end) return res.status(400).json({ error: 'Provide start and end' });
      slotStart = new Date(start); slotEnd = new Date(end);
    }

    // Check availability exists and not already booked (appointments overlapping)
    const overlapping = await Appointment.findOne({
      where: { professorId, status: 'booked',
        // We'll check overlap in JS below because Sequelize date overlapping is fiddly with sqlite
      }
    });

    // Fetch all existing booked appointments for professor to check conflict
    const booked = await Appointment.findAll({ where: { professorId, status: 'booked' } });
    const s = slotStart.getTime(); const e = slotEnd.getTime();
    const conflict = booked.some(b => {
      const bs = new Date(b.start).getTime();
      const be = new Date(b.end).getTime();
      return !(be <= s || bs >= e); // overlap
    });
    if (conflict) return res.status(400).json({ error: 'Slot already booked or overlaps booked appointment' });

    // Also ensure there's a matching availability that fully contains the requested slot
    const availContaining = await Availability.findOne({
      where: { professorId }
    });
    // check at least one availability that includes the requested interval
    const availList = await Availability.findAll({ where: { professorId } });
    const contains = availList.some(a => {
      const as = new Date(a.start).getTime();
      const ae = new Date(a.end).getTime();
      return as <= s && ae >= e;
    });
    if (!contains) return res.status(400).json({ error: 'Requested slot not within professor availability' });

    const appointment = await Appointment.create({
      studentId: req.user.id,
      professorId,
      start: slotStart,
      end: slotEnd
    });

    return res.json({ appointment });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// !!!!!!!--------Professor can cancel appointment hereee......
export const cancelAppointment = async (req, res) => {

  if (req.user.role !== 'professor') return res.status(403).json({ error: 'Only professors can cancel here' });
  const appt = await Appointment.findByPk(req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  if (String(appt.professorId) !== String(req.user.id)) return res.status(403).json({ error: 'Not your appointment' });
  appt.status = 'cancelled';
  await appt.save();
  return res.json({ appointment: appt })

};


/// !!!!!!!--------Student can check therr own appointment hereee......
export const getAppointment = async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students' });
    const appts = await Appointment.findAll({
        where: { studentId: req.user.id, status: 'booked' },
        order: [['start','ASC']]
    });
    return res.json({ appointments: appts });
}