
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const {init} = require('./models/model.js');

const authRoute = require('./routes/auth.route.js');
const professorRoute = require('./routes/professor.route.js');
const appointmentRoute = require('./routes/appointment.route.js');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoute);
app.use('/api/professor', professorRoute);
app.use('/api/appointment', appointmentRoute);

const PORT = process.env.PORT || 3000;
async function start() {
    const force = process.env.FORCE_SYNC === 'true';
    await init({ force });
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  }


  if (require.main === module) {
    start();
  }
  
  module.exports = app;