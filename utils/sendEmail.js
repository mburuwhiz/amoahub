import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2. Render the email template
    const emailHtml = await ejs.renderFile(
        path.join(__dirname, `../views/emails/${options.template}.ejs`),
        options.data
    );

    // 3. Define the email options
    const mailOptions = {
        from: `Amora Hub <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: emailHtml,
        text: options.message, // For email clients that don't support HTML
    };

    // 4. Actually send the email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;