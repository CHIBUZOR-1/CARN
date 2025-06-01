// __tests__/routes/authRoute.test.js
/*jest.mock('../../Utilz/emailz', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
}));*/
jest.mock('../../Utilz/emailz');

const request = require('supertest');
const app = require('../../app');

describe('POST /api/user/sign-up', () => {
  it('should create a new user and return success', async () => {
    const email = `john${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/user/sign-up')
      .send({
        name: 'John Tester',
        email,
        password: 'test1234',
        confirmPassword: 'test1234',
        terms: true
      });
    console.log('RESPONSE:', res.body); 

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('msg', 'Registered sucessfully'); // customize this based on your actual response
    expect(res.body.ok).toBe(true);
  }, 15000);
});

describe('POST /api/user/sign-in', () => {
  const email = `john${Date.now()}@example.com`;
  const password = 'test1234';

  beforeAll(async () => {
    // Register a new user
    await request(app).post('/api/user/sign-up').send({
      name: 'John Tester',
      email,
      password,
      confirmPassword: password,
      terms: true,
    });

    // Manually verify the user in DB (using mongoose)
    const User = require('../../Model/userModel');
    const user = await User.findOne({ email });
    user.verified = true;
    await user.save();
  });

  it('should login the user and return success', async () => {
    const res = await request(app).post('/api/user/sign-in').send({ email, password });
    console.log('LOGIN RESPONSE:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('msg', 'Login successful'); // or your actual message
    expect(res.body.ok).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined(); // Checks if auth cookie was set
  }, 10000);
});

describe('POST /api/user/verify-email', () => {
  const email = 'verifytest@example.com';
  const password = 'Verify@123';
  let verificationToken;

  beforeAll(async () => {
    // Step 1: Register user (unverified by default)
    await request(app).post('/api/user/sign-up').send({
      name: 'Verifier',
      email,
      password,
      confirmPassword: password,
      terms: true,
    });

    // Step 2: Get verification token from DB
    const User = require('../../Model/userModel');
    const user = await User.findOne({ email });
    verificationToken = user.verificationToken;
  });

  it('should verify the user email successfully', async () => {
    const res = await request(app).post('/api/user/verify-email').send({
      verificationCode: verificationToken,
    });

    console.log('VERIFY RESPONSE:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.msg).toBe('Email verified successfully');
    expect(res.body.user.verified).toBe(true);
  });
});

describe('POST /api/user/forgot-password', () => {
  const email = 'forgotme@example.com';
  const password = 'Forgot@123';

  beforeAll(async () => {
    // Register user
    await request(app).post('/api/user/sign-up').send({
      name: 'Forgot User',
      email,
      password,
      confirmPassword: password,
      terms: true,
    });

    // Verify the user
    const User = require('../../Model/userModel');
    const user = await User.findOne({ email });
    user.verified = true;
    await user.save();
  });

  it('should generate a reset token and respond with success message', async () => {
    const res = await request(app).post('/api/user/forgot-password').send({ email });

    console.log('FORGOT PASSWORD RESPONSE:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.msg).toBe('Password reset link sent to your email');

    const User = require('../../Model/userModel');
    const user = await User.findOne({ email });

    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordExpiresAt).toBeDefined();
  });
});

describe('POST /api/user/reset-password/:token', () => {
  const email = 'resetuser@example.com';
  const oldPassword = 'OldPass@123';
  const newPassword = 'NewPass@456';
  let resetToken;

  beforeAll(async () => {
    // Register and verify the user
    await request(app).post('/api/user/sign-up').send({
      name: 'Reset Me',
      email,
      password: oldPassword,
      confirmPassword: oldPassword,
      terms: true,
    });

    const User = require('../../Model/userModel');
    const user = await User.findOne({ email });
    user.verified = true;

    // Manually set reset token and expiry
    resetToken = require('crypto').randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
  });

  it('should reset the password and clear reset fields', async () => {
    const res = await request(app)
      .post(`/api/user/reset-password/${resetToken}`)
      .send({ password: newPassword });

    console.log('RESET RESPONSE:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.msg).toBe('Password reset successful');

    const User = require('../../Model/userModel');
    const user = await User.findOne({ email });

    expect(user.resetPasswordToken).toBeUndefined();
    expect(user.resetPasswordExpiresAt).toBeUndefined();

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(newPassword, user.password);
    expect(isMatch).toBe(true);
  });
});

describe('POST /api/user/logout', () => {
  it('should clear jwt and socket cookies and return success message', async () => {
    const res = await request(app).get('/api/user/logout');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.msg).toBe('Logged Out successfully');

    // Ensure cookies were cleared
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();

    const jwtCleared = cookies.some(cookie => cookie.startsWith('jwt=') && cookie.includes('Max-Age=0'));
    const socketCleared = cookies.some(cookie => cookie.startsWith('socket=') && cookie.includes('Max-Age=0'));

    expect(jwtCleared).toBe(true);
    expect(socketCleared).toBe(true);
  });
});



