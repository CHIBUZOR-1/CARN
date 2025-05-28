const express = require('express');
const { register, verifyEmail, Login, resetPassword, forgotPassword, logout } = require('../Controller/authz');
userRouter = express.Router();

userRouter.post('/sign-up', register);
userRouter.post('/sign-in', Login);
userRouter.post('/verify-email', verifyEmail);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password/:token', resetPassword);
userRouter.get('/logout', logout);


module.exports = userRouter;