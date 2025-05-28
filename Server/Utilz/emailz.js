const { VERIFICATION_EMAIL_TEMPLATE, VERIFIED_ACCOUNT_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } = require('./mailTemplates.js');
const { sender, transporter } = require('./nodemailer.config.js')


const sendVerificationEmail = async (email, verificationToken) => {
	try {
		const info = await transporter.sendMail({
            from: `"CARN" <${sender}>`,
            to: email,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
        });

		console.log('Email sent: %s', info.messageId);
	} catch (error) {
		console.error(`Error sending verification`, error);

		throw new Error(`Error sending verification email: ${error}`);
	}
};
const sendVerifiedEmail = async (email, name) => {
	try {
		const info = await transporter.sendMail({
            from: `"CARN" <${sender}>`,
            to: email,
            subject: "Verify your email",
            html: VERIFIED_ACCOUNT_TEMPLATE.replace("{username}", name.split(" ")[0]),
        });

		console.log('Email sent: %s', info.messageId);
	} catch (error) {
		console.error(`Error sending verification`, error);

		throw new Error(`Error sending verification email: ${error}`);
	}
};

const sendPasswordResetEmail = async (email, name, url) => {
	try {
		const info = await transporter.sendMail({
            from: `"CARN" <${sender}>`,
            to: email,
            subject: "Password Reset Link",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", url).replace("{username}", name.split(" ")[0]),
        });

		console.log('Email sent: %s', info.messageId);
	} catch (error) {
		console.error(`Error sending verification`, error);

		throw new Error(`Error sending verification email: ${error}`);
	}
}
const sendResetSuccessEmail = async (email, name) => {
	try {
		const info = await transporter.sendMail({
            from: `"CARN" <${sender}>`,
            to: email,
            subject: "Password Reset Link",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{username}", name.split(" ")[0]),
        });

		console.log('Email sent: %s', info.messageId);
	} catch (error) {
		console.error(`Error sending verification`, error);

		throw new Error(`Error sending verification email: ${error}`);
	}
}

module.exports = { sendVerificationEmail, sendVerifiedEmail, sendPasswordResetEmail, sendResetSuccessEmail }