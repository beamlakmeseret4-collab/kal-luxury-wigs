const mongoose = require('mongoose');
const dns = require('node:dns');

// Recent Node.js versions on Windows have a known bug where they don't
// correctly use the system DNS resolver for SRV lookups — which is exactly
// what mongodb+srv:// connection strings need. This shows up as
// "querySrv ECONNREFUSED ...mongodb.net". Pointing Node at public DNS
// servers that reliably support SRV lookups works around it. Harmless on
// Mac/Linux, where this bug doesn't occur.
dns.setServers(['1.1.1.1', '8.8.8.8']);

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
    }
    const conn = await mongoose.connect(uri);
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[db] MongoDB connection error:', err.message);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('[db] MongoDB disconnected');
    });
  } catch (err) {
    console.error(`[db] Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;