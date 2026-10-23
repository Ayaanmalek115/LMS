const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/library_db';
  const autoInMemory = process.env.AUTO_IN_MEMORY_DB !== 'false';

  try {
    console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')} ...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick fail if local server is down
    });
    console.log('MongoDB Connected successfully to external/local database.');
    return { isInMemory: false, uri };
  } catch (err) {
    if (autoInMemory) {
      console.warn('Could not connect to external MongoDB server:', err.message);
      console.log('Launching in-memory MongoDB server (mongodb-memory-server) for zero-configuration testing...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const memUri = mongodInstance.getUri();
        await mongoose.connect(memUri);
        console.log(`In-memory MongoDB Connected successfully at ${memUri}`);
        return { isInMemory: true, uri: memUri };
      } catch (memErr) {
        console.error('Failed to launch in-memory MongoDB:', memErr.message);
        throw memErr;
      }
    } else {
      console.error('MongoDB Connection Error:', err.message);
      throw err;
    }
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
