const mongoose = require('mongoose');

async function connectDB() {
    try {
        const connect = await mongoose.connect(process.env.MONGOOSE_URL);
        console.log('Connected to Database');

    } catch (error) {
        console.log('Connection Error');

    }
}

module.exports = { connectDB };