require('dotenv').config()
const nodeMailer = require('nodemailer');

// console.log(process.env.SMTP_USER, process.env.SMTP_PASSWORD);
class MailService {
  constructor() {
    this.transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(to, link) {

    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Activation Mail from" + process.env.API_URL,
      text: '',
      html:
    `
    <div>
    <h1> For activation link</h1>
    <a href=" ${link}">${link}</a>
    </div>
    `,
    });
  }
}

module.exports = new MailService();
