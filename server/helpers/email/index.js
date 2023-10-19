import fs from "fs";
import path from "path";
import lang from "../../helpers/locale/lang";

const onAdvocateBlock = (email, reason) => {
  return new Promise(async (resolve, reject) => {
    const keywords = ["{{email_title_strong}}", "{{email_main_content}}"];

    const replace_values = [
      lang.TOO_MANY_WRONG.PR,
      `<b>${lang.TOO_MANY_ATTEMPT_1.PR} ${reason}.
      <br /><br />
      ${lang.PLEASE_CONTACT_ADMIN.PR}
      <b/>`,
      ,
    ];

    generateTemplate(keywords, replace_values).then(resolve);
  });
};

const forgotPin = (randomCode, update = false) => {
  const action = update ? "update" : "reset";
  return new Promise(resolve => {
    const keywords = ["{{email_title_strong}}", "{{email_main_content}}"];

    const replace_values = [
      `${lang.TEMP_PIN.PR}`,
      `${lang.PLEASE_ENTER_TEMP_PIN_1.PR} ${action} ${lang.PLEASE_ENTER_TEMP_PIN_2.PR}.
	  <br /><br />
	  ${lang.TEMP_PIN.PR}: <b>${randomCode}</b>
	  <br /><br />
	  <span>${lang.TEMP_PIN_NOTE.PR}</span>
	  <br /><br />
	  `,
    ];

    generateTemplate(keywords, replace_values).then(resolve);
  });
};

const generateTemplate = (keywords, replace_values) => {
  return new Promise(async (resolve, reject) => {
    const html = await fs.readFileSync(
      path.resolve("server", "helpers", "email", "emailTemplate.html"),
      "utf8",
    );

    let replaced_html = html;
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const replace_value = replace_values[i];
      const array_split = replaced_html.split(keyword);
      const afterJoin = array_split.join(`${replace_value}`);
      replaced_html = afterJoin;
    }
    resolve(replaced_html);
  });
};
const onAddAttorney = (email, password, admin, link) => {
  return new Promise(async (resolve, reject) => {
    const keywords = ["{{email_title_strong}}", "{{email_main_content}}"];

    const replace_values = [
      `${lang.getStarted.PR}`,
      `<b>${lang.accCreatedBy.PR} ${admin}.
      <br />
      ${lang.yourCred.PR}
      <br /><br />
      ${lang.changePassOnceLogin.PR}
      <br />
      <br />
      ${lang.email.PR} : <b>${email}</b> <br />
      ${lang.password.PR} : <b>${password}</b>
      <br /> <br />
      ${lang.loginToAcc.PR}
      `,
    ];

    generateTemplate(keywords, replace_values).then(resolve);
  });
};

const loginVerification = (email, password) => {
  return new Promise(resolve => {
    const keywords = ["{{email_title_strong}}", "{{email_main_content}}"];

    const replace_values = [
      `<b>${lang.LOGIN_CRED.PR}</b>`,
      `${lang.YOUR_EMAIL.PR} : ${email}
      ${lang.TEMP_PIN.PR} : ${password} `,
    ];

    generateTemplate(keywords, replace_values).then(resolve);
  });
};

export default {
  forgotPin,
  onAdvocateBlock,
  onAddAttorney,
  loginVerification,
};
