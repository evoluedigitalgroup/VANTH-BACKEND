import multiparty from "multiparty";
import { cpf, cnpj } from "cpf-cnpj-validator";
import lang from "./../../helpers/locale/lang";
import utility from "../../helpers/utility";
export const ValidDoc = (req, res, next) => {
  const forms = new multiparty.Form();
  forms.parse(req, async (err, fields, files) => {
    const addressProof = files["addressProof"][0];
    const socialContact = files["socialContact"][0];
    const contactId = fields["contactId"][0];
    const requestId = fields["requestId"][0];
    if (
      contactId != "" &&
      requestId != "" &&
      addressProof.originalFilename != "" &&
      socialContact.originalFilename != ""
    ) {
      next();
    } else if (
      contactId == "" &&
      requestId == "" &&
      addressProof == "" &&
      socialContact == ""
    ) {
      res.json({
        success: false,
        message: lang.ENTER_DETAIL_PLZ.PR,
      });

      next();
    } else if (contactId == "") {
      res.status(404).json({
        success: false,
        message: lang.ENTER_CONTACT_ID.PR,
      });
    } else if (requestId == "") {
      res.status(404).json({
        success: false,
        message: lang.ENTER_REQUEST_ID.PR,
      });
    } else if (addressProof.originalFilename == "") {
      res.status(404).json({
        success: false,
        message: lang.ENTER_ADDRESS_PROOF.PR,
      });
    } else if (socialContact.originalFilename == "") {
      res.status(404).json({
        success: false,
        message: lang.ENTER_SOCIAL_CONTACT.PR,
      });
    }
  });
};
export const ValidId = (req, res, next) => {
  const { contactId, requestId } = req.body;
  if (contactId && requestId) {
    next();
  } else if (!contactId && !requestId) {
    res.json({
      success: false,
      message: lang.ENTER_ALL_INFO.PR,
    });
  } else if (!contactId) {
    res.json({
      success: false,
      message: lang.ENTER_CONTACT_ID.PR,
    });
  } else if (!requestId) {
    res.json({
      success: false,
      message: lang.ENTER_REQUEST_ID.PR,
    });
  }
};
export const ValidContact = (req, res, next) => {
  const { name, email, phone, CPF, CNPJ } = req.body;

  if (name && email && phone && (CPF || CNPJ)) {
    if (CPF || CNPJ) {
      if (cpf.isValid(CPF) || cnpj.isValid(CNPJ)) {
        if (utility.checkValidMobile(phone) == true) {
          next();
        } else {
          res.json({
            success: false,
            message: lang.PLEASE_ENTER_VALID_MOBILE_NUMBER.PR,
          });
        }
      } else {
        res.json({
          success: false,
          message: lang.PLEASE_ENTER_VALID_CPF_OR_CNPJ_NUMBER.PR,
        });
      }
    }
  } else if (!name && !email && !phone && !CPF && !CNPJ) {
    res.json({
      success: false,
      message: lang.ENTER_ALL_INFO.PR,
    });
  } else if (!name) {
    res.json({
      success: false,
      message: lang.ENTER_NAME.PR,
    });
  } else if (!email) {
    res.json({
      success: false,
      message: lang.ENTER_EMAIL.PR,
    });
  } else if (!phone) {
    res.json({
      success: false,
      message: lang.ENTER_PHONE.PR,
    });
  } else if (!CPF) {
    res.json({
      success: false,
      message: lang.PLEASE_ENTER_CPF_NUMBER.PR,
    });
  } else if (!CNPJ) {
    res.json({
      success: false,
      message: lang.PLEASE_ENTER_CNPJ_NUMBER.PR,
    });
  }
};
export const EditProfileValidator = async (fields, files) => {
  return new Promise(async (resolve, reject) => {
    const name = fields["name"][0];

    if (name) {
      resolve({
        success: true,
      });
    } else if (!name) {
      resolve({
        success: false,
        message: lang.PLEASE_ENTER_NAME.PR,
      });
    }
  });
};
