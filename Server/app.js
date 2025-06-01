const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require("path");
const userRouter = require('./Route/authRoutes')

const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

const app = express();

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true
}));

app.use(morgan('dev'));
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

app.use('/api/user', userRouter);
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res)=> {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'))
})
app.get('/', (req, res) => {
    res.send("Welcome to CARN");
});

module.exports = app;