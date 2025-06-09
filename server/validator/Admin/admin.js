import bcrypt from "bcrypt";
import Admin from "../../models/admin";
import lang from "../../helpers/locale/lang";
import utility from "../../helpers/utility";

const checkValidEmail = utility.checkValidEmail;

const adminLoginValidator = async (req, res, next) => {
  req.body.email = req.body.email ? req.body.email.toLowerCase().trim() : null;
  const { email, password } = req.body;

  if (email && password) {
    next();
  } else if (!email) {
    res.json({
      success: false,
      message: lang.PLEASE_ENTER_EMAIL_ADDRESS.PR,
    });
  } else {
    res.json({
      success: false,
      message: lang.PLEASE_ENTER_PASSWORD.PR,
    });
  }
};

const changePasswordValidator = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (oldPassword && newPassword) {
    //is old password match with database password
    if (newPassword.length >= 6) {
      const foundUser = await Admin.findOne({ email: req.admin.email });
      const validPassword = await bcrypt.compare(
        oldPassword,
        foundUser.password,
      );
      if (validPassword) {
        next();
      } else {
        res.json({ success: false, message: lang.OLD_PASSWORD_IS_WRONG.PR });
      }
    } else {
      res.json({
        success: false,
        message: lang.PASSWORD_LENGTH_MUST_BE_AT_LEAST_6_CHARACTER.PR,
      });
    }
  } else if (!oldPassword) {
    res.json({ success: false, message: lang.PLEASE_ENTER_OLD_PASSWORD.PR });
  } else {
    res.json({ success: false, message: lang.PLEASE_ENTER_NEW_PASSWORD.PR });
  }
};

const signUpValidator = async (req, res, next) => {
  req.body.email = req.body.email ? req.body.email.trim().toLowerCase() : null;
  const { name, email, password, code, designation } = req.body;
  console.log("req.body", req.body);
  try {
    if (name && email && password && code && designation) {
      if (checkValidEmail(email)) {
        if (password.length >= 6 && password.length <= 15) {
          //check email already exits? const emailExist = await PartnerUser.find({ email });
          const emailExist = await Admin.find({ email });

          if (emailExist.length === 0) {
            next();
          } else {
            res.json({
              success: false,
              message: lang.EMAIL_ALREADY_REGISTER_TRY_LOGIN_INSTEAD.PR,
            });
          }
        } else {
          res.json({
            success: false,
            message:
              lang
                .PASSWORD_LENGTH_MINIMUM_6_AND_MAXIMUM_15_CHARACTERS_ALLOWED_ONLY
                .PR,
          });
        }
      } else {
        res.json({
          success: false,
          message: lang.EMAIL_ADDRESS_IS_NOT_PROPER.PR,
        });
      }
    } else if (!name) {
      res.json({
        success: false,
        message: lang.PLEASE_ENTER_NAME.PR,
      });
    } else if (!email) {
      res.json({
        success: false,
        message: lang.PLEASE_ENTER_EMAIL_ADDRESS.PR,
      });
    } else if (!password) {
      res.json({
        success: false,
        message: lang.PLEASE_ENTER_PASSWORD.PR,
      });
    } else if (!code) {
      res.json({
        success: false,
        message: lang.PLEASE_ENTER_CODE.PR,
      });
    } else {
      res.json({
        success: false,
        message: lang.PLEASE_ENTER_DESIGNATION.PR,
      });
    }
  } catch (err) {
    console.log("Validator ERR :: ", err);
  }
};

export { adminLoginValidator, changePasswordValidator, signUpValidator };
