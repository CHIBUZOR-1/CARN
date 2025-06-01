// __tests__/Controllers/authz.test.js
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

jest.mock("../../Model/userModel");
jest.mock("../../Utilz/emailz");
jest.mock("bcryptjs");
jest.mock("../../Utilz/Tokenize", () => ({
  setCookiesWithToken: jest.fn(),
}));

const userModel = require("../../Model/userModel");
const { sendVerificationEmail, sendVerifiedEmail, sendPasswordResetEmail, sendResetSuccessEmail } = require("../../Utilz/emailz");
const { register, verifyEmail, Login, forgotPassword, resetPassword, logout } = require("../../Controller/authz");
const { setCookiesWithToken } = require("../../Utilz/Tokenize");

describe("register controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if required fields are missing", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "test@example.com" } // missing name and password
    });
    const res = httpMocks.createResponse();

    await register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: "All fields required"
    });
  });

  it("should return 400 if email already exists", async () => {
    userModel.findOne.mockResolvedValue({ email: "test@example.com" });

    const req = httpMocks.createRequest({
      method: "POST",
      body: { name: "John", email: "test@example.com", password: "password123" }
    });
    const res = httpMocks.createResponse();

    await register(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().msg).toBe("Email already in use");
  });

  it("should return 400 for invalid email", async () => {
    userModel.findOne.mockResolvedValue(null);
    jest.spyOn(validator, "isEmail").mockReturnValue(false);

    const req = httpMocks.createRequest({
      method: "POST",
      body: { name: "John", email: "bademail", password: "password123" }
    });
    const res = httpMocks.createResponse();

    await register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().msg).toBe("Enter a valid Email Address");
  });

  it("should return 400 for weak password", async () => {
    userModel.findOne.mockResolvedValue(null);
    jest.spyOn(validator, "isEmail").mockReturnValue(true);

    const req = httpMocks.createRequest({
      method: "POST",
      body: { name: "John", email: "test@example.com", password: "123" }
    });
    const res = httpMocks.createResponse();

    await register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().msg).toBe("Please enter a strong password");
  });

  it("should register user and return 201", async () => {
    userModel.findOne.mockResolvedValue(null);
    jest.spyOn(validator, "isEmail").mockReturnValue(true);
    bcrypt.genSaltSync.mockReturnValue("salt");
    bcrypt.hashSync.mockReturnValue("hashedPassword");
    userModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({})
    }));
    sendVerificationEmail.mockResolvedValue();

    const req = httpMocks.createRequest({
      method: "POST",
      body: { name: "John", email: "john@example.com", password: "password123" }
    });
    const res = httpMocks.createResponse();

    await register(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData().msg).toBe("Registered sucessfully");
  });

  it("should handle server error", async () => {
    userModel.findOne.mockImplementation(() => {
      throw new Error("DB Error");
    });

    const req = httpMocks.createRequest({
      method: "POST",
      body: { name: "John", email: "john@example.com", password: "password123" }
    });
    const res = httpMocks.createResponse();

    await register(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData().msg).toBe("An error occurred!");
  });
});

describe("verifyEmail controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should verify email with valid token", async () => {
    const mockUser = {
      email: "john@example.com",
      name: "John",
      verified: false,
      verificationToken: "123456",
      verificationTokenExpiresAt: Date.now() + 10000,
      save: jest.fn(),
    };

    userModel.findOne.mockResolvedValue(mockUser);
    sendVerifiedEmail.mockResolvedValue();

    const req = httpMocks.createRequest({
      method: "POST",
      body: { verificationCode: "123456" },
    });
    const res = httpMocks.createResponse();

    await verifyEmail(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({
      verificationToken: "123456",
      verificationTokenExpiresAt: { $gt: expect.any(Number) },
    });
    expect(mockUser.verified).toBe(true);
    expect(mockUser.verificationToken).toBe("");
    expect(mockUser.verificationTokenExpiresAt).toBeUndefined();
    expect(mockUser.save).toHaveBeenCalled();
    expect(sendVerifiedEmail).toHaveBeenCalledWith(mockUser.email, mockUser.name);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(
      expect.objectContaining({
        ok: true,
        msg: "Email verified successfully",
        user: expect.objectContaining({
            email: "john@example.com",
            name: "John",
            verified: true,
            verificationToken: "",
        }),
      })
    );
  });

  it("should return 400 for invalid or expired token", async () => {
    userModel.findOne.mockResolvedValue(null);

    const req = httpMocks.createRequest({
      method: "POST",
      body: { verificationCode: "wrongcode" },
    });
    const res = httpMocks.createResponse();

    await verifyEmail(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: "Invalid or expired token",
    });
  });

  it("should handle server error", async () => {
    userModel.findOne.mockRejectedValue(new Error("DB failure"));

    const req = httpMocks.createRequest({
      method: "POST",
      body: { verificationCode: "123456" },
    });
    const res = httpMocks.createResponse();

    await verifyEmail(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: "Server error",
    });
  });
});

describe("Login controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if email or password is missing", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "", password: "" },
    });
    const res = httpMocks.createResponse();

    await Login(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ ok: false, msg: "All fields required" });
  });

  it("should return 400 if user is not found", async () => {
    userModel.findOne.mockResolvedValue(null);

    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "test@example.com", password: "pass123" },
    });
    const res = httpMocks.createResponse();

    await Login(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: true,
      ok: false,
      msg: "User not found",
    });
  });

  it("should return 400 if user is unverified", async () => {
    const mockUser = { verified: false };
    userModel.findOne.mockResolvedValue(mockUser);

    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "test@example.com", password: "pass123" },
    });
    const res = httpMocks.createResponse();

    await Login(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ ok: false, msg: "Account Unverified" });
  });

  it("should return 400 if password is invalid", async () => {
    const mockUser = {
      verified: true,
      password: "hashed-password",
    };
    userModel.findOne.mockResolvedValue(mockUser);
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "test@example.com", password: "wrongpass" },
    });
    const res = httpMocks.createResponse();

    await Login(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith("wrongpass", "hashed-password");
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: true,
      ok: false,
      msg: "Invalid password",
    });
  });

  it("should log in successfully with valid credentials", async () => {
    const mockUser = {
      _id: "user123",
      verified: true,
      password: "hashed-password",
      _doc: { name: "Test", email: "test@example.com", password: "hashed-password" },
    };
    userModel.findOne.mockResolvedValue(mockUser);
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    setCookiesWithToken.mockImplementation(() => {});

    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "test@example.com", password: "pass123" },
    });
    const res = httpMocks.createResponse();

    await Login(req, res);

    expect(setCookiesWithToken).toHaveBeenCalledWith("user123", res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(
      expect.objectContaining({
        ok: true,
        msg: "Login successful",
        user: expect.objectContaining({
          name: "Test",
          email: "test@example.com",
        }),
      })
    );
  });

  it("should handle server errors", async () => {
    userModel.findOne.mockRejectedValue(new Error("DB failure"));

    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "test@example.com", password: "pass123" },
    });
    const res = httpMocks.createResponse();

    await Login(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      ok: false,
      error: true,
      msg: "An error occurred!",
    });
  });
});

describe("forgotPassword controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if user is not found", async () => {
    userModel.findOne.mockResolvedValue(null);

    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "nonexistent@example.com" },
    });
    const res = httpMocks.createResponse();

    await forgotPassword(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ ok: false, msg: "User not found" });
  });

  it("should generate reset token, save user, and send email", async () => {
    const mockUser = {
      email: "john@example.com",
      name: "John",
      save: jest.fn(),
    };

    userModel.findOne.mockResolvedValue(mockUser);
    sendPasswordResetEmail.mockResolvedValue();

    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: mockUser.email },
    });
    const res = httpMocks.createResponse();

    await forgotPassword(req, res);

    expect(mockUser.resetPasswordToken).toBeDefined();
    expect(mockUser.resetPasswordExpiresAt).toBeDefined();
    expect(mockUser.save).toHaveBeenCalled();
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      mockUser.email,
      mockUser.name,
      expect.stringContaining("/reset-password/")
    );
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      ok: true,
      msg: "Password reset link sent to your email",
    });
  });

  it("should handle server error", async () => {
    userModel.findOne.mockRejectedValue(new Error("Database error"));

    const req = httpMocks.createRequest({
      method: "POST",
      body: { email: "error@example.com" },
    });
    const res = httpMocks.createResponse();

    await forgotPassword(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: "Database error",
    });
  });
});

describe("resetPassword controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if token is invalid or expired", async () => {
    userModel.findOne.mockResolvedValue(null);

    const req = httpMocks.createRequest({
      method: "POST",
      params: { token: "invalidtoken" },
      body: { password: "newpassword123" },
    });
    const res = httpMocks.createResponse();

    await resetPassword(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: "Invalid or expired reset token",
    });
  });

  it("should update password and clear reset fields", async () => {
    const mockUser = {
      email: "john@example.com",
      name: "John",
      password: "oldHashed",
      save: jest.fn(),
    };

    userModel.findOne.mockResolvedValue(mockUser);
    sendResetSuccessEmail.mockResolvedValue();

    const req = httpMocks.createRequest({
      method: "POST",
      params: { token: "validtoken" },
      body: { password: "newPassword123" },
    });
    const res = httpMocks.createResponse();

    await resetPassword(req, res);

    expect(mockUser.password).not.toBe("newPassword123"); // should be hashed
    expect(mockUser.resetPasswordToken).toBeUndefined();
    expect(mockUser.resetPasswordExpiresAt).toBeUndefined();
    expect(mockUser.save).toHaveBeenCalled();
    expect(sendResetSuccessEmail).toHaveBeenCalledWith(mockUser.email, mockUser.name);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      ok: true,
      msg: "Password reset successful",
    });
  });

  it("should handle server error", async () => {
    userModel.findOne.mockRejectedValue(new Error("DB error"));

    const req = httpMocks.createRequest({
      method: "POST",
      params: { token: "anytoken" },
      body: { password: "anypass" },
    });
    const res = httpMocks.createResponse();

    await resetPassword(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: "DB error",
    });
  });
});

describe("logout controller", () => {
  it("should clear cookies and return success message", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    res.cookie = jest.fn();

    await logout(req, res);

    expect(res.cookie).toHaveBeenCalledWith("jwt", "", { maxAge: 0 });
    expect(res.cookie).toHaveBeenCalledWith("socket", "", { maxAge: 0 });
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      ok: true,
      msg: "Logged Out successfully",
    });
  });

  it("should handle server error", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    // force an error by throwing from `res.cookie`
    res.cookie = () => {
      throw new Error("Cookie error");
    };

    await logout(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      error: true,
      ok: false,
      msg: "An error occured!",
    });
  });
});
