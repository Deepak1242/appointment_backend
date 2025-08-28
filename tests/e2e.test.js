const request = require('supertest');
const app = require('../server.js');
const { init, sequelize } = require('../models/model.js');
// const { DESCRIBE } = require('sequelize/lib/query-types');

beforeAll(async () => {
  // !!>>fresh start...!!
  await init({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});


describe('College appointment end-to-end flow', () => {
    test('full user flow: register/login, set availability, book, cancel, check', async () => {
      
      const profReg = await request(app).post('/api/auth/register').send({
        name: 'Prof P1',
        email: 'p1@example.com',
        password: 'password',
        role: 'professor'
      });
      expect(profReg.status).toBe(200);
      const profToken = profReg.body.token;
      const profId = profReg.body.user.id;
  
        const s1Reg = await request(app).post('/api/auth/register').send({
        name: 'Student A1',
        email: 'a1@example.com',
        password: 'password',
        role: 'student'
      });
      expect(s1Reg.status).toBe(200);
      const s1Token = s1Reg.body.token;
      const s1Id = s1Reg.body.user.id;
  
      const now = new Date();
      const T1_start = new Date(now.getTime() + 60 * 60 * 1000); // +1h
      const T1_end = new Date(T1_start.getTime() + 30 * 60 * 1000); // +30m
      const T2_start = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2h
      const T2_end = new Date(T2_start.getTime() + 30 * 60 * 1000); // +30m
  
      const availResp = await request(app)
        .post('/api/professor/availability')
        .set('Authorization', `Bearer ${profToken}`)
        .send([
          { start: T1_start.toISOString(), end: T1_end.toISOString() },
          { start: T2_start.toISOString(), end: T2_end.toISOString() }
        ]);
      expect(availResp.status).toBe(200);
      const created = availResp.body.created;
      expect(created.length).toBe(2);
      const T1_avail_id = created[0].id;
      const T2_avail_id = created[1].id;
  
      const slotsResp = await request(app)
        .get(`/api/professor/${profId}/slots`)
        .set('Authorization', `Bearer ${s1Token}`);
      expect(slotsResp.status).toBe(200);
      const slots = slotsResp.body.slots;
      expect(slots.length).toBeGreaterThanOrEqual(2);
      const availableSlots = slots.filter(s => s.available);
      expect(availableSlots.length).toBeGreaterThanOrEqual(2);
  
      const book1 = await request(app)
        .post('/api/appointment')
        .set('Authorization', `Bearer ${s1Token}`)
        .send({ professorId: profId, availabilityId: T1_avail_id });
      expect(book1.status).toBe(200);
      const appt1 = book1.body.appointment;
      expect(appt1.studentId).toBe(s1Id);
  
      const s2Reg = await request(app).post('/api/auth/register').send({
        name: 'Student A2',
        email: 'a2@example.com',
        password: 'password',
        role: 'student'
      });
      expect(s2Reg.status).toBe(200);
      const s2Token = s2Reg.body.token;
      const s2Id = s2Reg.body.user.id;
  
      const book2 = await request(app)
        .post('/api/appointment')
        .set('Authorization', `Bearer ${s2Token}`)
        .send({ professorId: profId, availabilityId: T2_avail_id });
      expect(book2.status).toBe(200);
      const appt2 = book2.body.appointment;
      expect(appt2.studentId).toBe(s2Id);
  
      const cancel = await request(app)
        .post(`/api/appointment/${appt1.id}/cancel`)
        .set('Authorization', `Bearer ${profToken}`)
        .send();
      expect(cancel.status).toBe(200);
      expect(cancel.body.appointment.status).toBe('cancelled');
  
      const a1Check = await request(app)
        .get('/api/appointment/me')
        .set('Authorization', `Bearer ${s1Token}`);
      expect(a1Check.status).toBe(200);
      expect(a1Check.body.appointments).toBeInstanceOf(Array);
      expect(a1Check.body.appointments.length).toBe(0);
    }, 20000);
  });
  
