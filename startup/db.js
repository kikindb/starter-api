const mongoose = require('mongoose');
const config = require('config');

module.exports = function () {
  const db = config.get('db');
  //mongoose.connect(db)
  //.then(() => winston.info(`Connected to ${db}...`));

  mongoose.connect(db, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
  }, (err) => {
    if (err) throw err;
    console.log(`Connected to ${db}...`);
  });
}