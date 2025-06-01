const bcrypt = require('bcryptjs');
const validator = require('validator');
const userModel = require('../Model/userModel');
const { sendVerificationEmail, sendVerifiedEmail, sendPasswordResetEmail, sendResetSuccessEmail } = require('../Utilz/emailz');
const { setCookiesWithToken } = require('../Utilz/Tokenize');
const crypto = require('crypto')

const register = async(req, res) => {
    try {
        const { name, email, password } = req.body;
        if(!name|| !email || !password) {
            return res.status(400).json({ ok: false, msg: "All fields required"});
        }
        const existsEmail = await userModel.findOne({ email });
        if(existsEmail) {
            return res.status(400).json({
                ok: false,
                msg: "Email already in use"
            })
        }
        // validating email format & password
        if(!validator.isEmail(email)) {
            return res.status(400).json({
                ok: false,
                msg: "Enter a valid Email Address"
            })
        }
        if(password.length < 6) {
            return res.status(400).json({
                ok: false,
                msg: "Please enter a strong password"
            })
        }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, `${salt}`);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const newUser = await new userModel({
            name,
            email,
            password: `${hashedPassword}`,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        }).save();
        await sendVerificationEmail(newUser.email, verificationToken);
        res.status(201).json({
            ok: true,
            error: false,
            msg: "Registered sucessfully"
        })
    } catch (error) {
        console.error('SIGN-UP ERROR:', error);
        res.status(500).json({
            ok: false,
            error: true,
            msg: "An error occurred!"
        })
    }
}

const Login = async(req, res)=> {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ok: false, msg: "All fields required"})
        }
        const user = await userModel.findOne({email});
        if(!user) {
            return res.status(400).json({
                error: true,
                ok: false,
                msg: "User not found"
            })
        } 

        if (!user.verified) {
            return res.status(400).json({ ok: false, msg: 'Account Unverified' });
        }

        const matchedPassword = await bcrypt.compare(password, user.password);
        if(!matchedPassword) {
            return res.status(400).json({
                error: true,
                ok: false,
                msg: "Invalid password"
            });
        }
        setCookiesWithToken(user._id, res);
        res.status(200).json({
            ok: true,
            msg: "Login successful",
            user: { ...user._doc, password: undefined }
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: true,
            msg: "An error occurred!"
        })
    }
}

const forgotPassword = async (req, res) => {
	try {
        const { email } = req.body;
		const user = await userModel.findOne({ email });

		if (!user) {
			return res.status(400).json({ ok: false, msg: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, user.name, `${process.env.ORIGIN}/reset-password/${resetToken}`);

		res.status(200).json({ ok: true, msg: "Password reset link sent to your email" });
	} catch (error) {
		res.status(400).json({ ok: false, msg: error.message });
	}
};

const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await userModel.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ ok: false, msg: "Invalid or expired reset token" });
		}

		// update password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, `${salt}`);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email, user.name);

		res.status(200).json({ ok: true, msg: "Password reset successful" });
	} catch (error) {
		res.status(400).json({ ok: false, msg: error.message });
	}
};

const verifyEmail = async (req, res) => {
	const { verificationCode } = req.body;
	try {
		const user = await userModel.findOne({
			verificationToken: verificationCode,
            verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ ok: false, msg: "Invalid or expired token" });
		}

		user.verified = true;
		user.verificationToken = '';
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		await sendVerifiedEmail(user.email, user.name);

		res.status(200).json({
			ok: true,
			msg: "Email verified successfully",
			user
		});
	} catch (error) {
		res.status(500).json({ ok: false, msg: "Server error" });
	}
};


const logout = async(req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0});
        res.cookie("socket", "", { maxAge: 0});
        res.status(200).json({
            ok: true,
            msg: "Logged Out successfully"
        })
    } catch (error) {
        res.status(500).json({
            error: true,
            ok: false,
            msg: "An error occured!"
        })
    }
}








module.exports = { register, verifyEmail, Login, forgotPassword, resetPassword, logout }