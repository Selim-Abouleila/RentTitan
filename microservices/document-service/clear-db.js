const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function clearDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connection.db.dropCollection('checklists');
    console.log('Checklists collection dropped successfully');
  } catch (err) {
    if (err.code === 26) {
      console.log('Collection does not exist, nothing to drop');
    } else {
      console.error('Error:', err);
    }
  } finally {
    await mongoose.disconnect();
  }
}

clearDB();
