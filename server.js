const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const instanceMongoDb = require('./src/config/connection')
const corsOption = require('./src/config/cors')
const http = require('http')
var cors = require('cors');
const app = express();
var server = http.createServer(app);
const port = 8000;
const router = require('./src/route/photo_route')
const io = require('./src/config/io');
const appConfig = {
  redisDB:
  {
    host: 'localhost',
    port: 6379,
  },
}
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
io(app, server, appConfig)

app.use('/photo', router)
// Start the server
const start = async () => {
  try {
    await instanceMongoDb

    await server.listen(3000, () => {
      console.log(`Example app listening on http://localhost:3000`)
      // console.log(`Server is live on ${env.PORT}`)
    })
  }
  catch (error) {
    console.log(error);
  }
}
start();