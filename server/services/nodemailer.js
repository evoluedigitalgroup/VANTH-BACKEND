const nodemailer = require('nodemailer')
import config from "../config";
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true para porta 465, false para outras
  auth: {
    user: config.nodemailerUserId,
    pass: config.nodemailerPassword,
  },
});

const sendMail = async (to, subject, html) => {
  let info = await transporter.sendMail({
    from: `${config.nodemailerUserId}`, // sender address
    to,
    subject,
    html,
  });
};

export default sendMail;
