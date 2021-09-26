require('dotenv').config();
const conf = require('./config').makeConfig();
require('./server').makeServer(conf);
