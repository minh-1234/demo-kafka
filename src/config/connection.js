const mongoose = require('mongoose')
require('dotenv').config()
class Database {
  constructor() {
    this.connect()
  }
  connect(type = "mongodb") {
    mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50
    }).then(console.log("Connected Database successfully !"))
      .catch(err => console.log(err.message))
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database
    }

    return Database.instance
  }
}

module.exports = Database.getInstance()