const mongoose = require('mongoose');

async function connectDatabase(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Add it to your environment before starting the server.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);

  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  return mongoose.connection;
}

module.exports = {
  connectDatabase
};
