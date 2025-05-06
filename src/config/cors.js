
module.exports = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true)
    }
    if (1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200,// some legacy browsers (IE11, various SmartTVs) choke on 204,
  credentials: true
}