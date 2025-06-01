const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

// Connect to test DB before any tests run
beforeAll(async () => {
  await mongoose.connect(process.env.MONGOOSE_URI_TEST);
});

// Clean all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect after all tests complete
afterAll(async () => {
  await mongoose.connection.close();
});
