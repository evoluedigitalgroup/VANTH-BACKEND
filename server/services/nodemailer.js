const nodemailer = require('nodemailer')
import config from "../config";
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
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

  console.info("info.messageId : ", info.messageId);
};

export default sendMail;
