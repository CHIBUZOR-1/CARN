const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();


const transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  host: process.env.HOST,
  port: parseInt(process.env.PORTZ, 10), // Ensure port is a number
  secure: process.env.SECURE === 'true', // Convert to boolean
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});


const sender = process.env.EMAIL



module.exports = { transporter, sender }