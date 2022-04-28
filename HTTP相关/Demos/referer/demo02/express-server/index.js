const express = require('express');
const app = express();

app.use('/img', require('./routers/index.js'))

app.listen(3000);