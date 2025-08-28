
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const {init} = require('./models/model.js');

const authRoute = require('./routes/auth.route.js');
const professorRoute = require('./routes/professor.route.js');
const appointmentRoute = require('./routes/appointment.route.js');

const app = express();

