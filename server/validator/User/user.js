import bcrypt from "bcrypt";
import User from '../../models/users';
import lang from "../../helpers/locale/lang";
import utility from "../../helpers/utility";

const checkValidEmail = utility.checkValidEmail;

const userLoginValidator = async (req, res, next) => {
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
      const foundUser = await User.findOne({ email: req.user.email });
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

  const { name, email, password, code, companyName, designation } = req.body;

  console.log("req.body : ", req.body);
  try {

    if (password.length < 6) {
      res.json({
        success: false,
        message:
          lang
            .PASSWORD_LENGTH_MUST_BE_AT_LEAST_6_CHARACTER
            .PR,
      });
    }

    if (!name) {
      res.json({
        success: false,
        message: lang.PLEASE_ENTER_NAME.PR,
      });
      return;
    }

    if (!email) {
      res.json({
        success: false,
        message: lang.PLEASE_ENTER_EMAIL_ADDRESS.PR,
      });
      return;
    }

    if (!password) {
      res.json({
        success: false,
        message: lang.PLEASE_ENTER_PASSWORD.PR,
      });
      return;
    }

    if (companyName && code) {
      res.json({
        success: false,
        message: lang.WENT_WRONG_CANT_SIGNUP_COMPANY_WITH_CODE.PR,
      });
      return;
    }

    if (companyName && designation) {
      res.json({
        success: false,
        message: lang.WENT_WRONG_CANT_SIGNUP_COMPANY_WITH_CODE.PR,
      });
      return;
    }

    if (!code && !companyName) {
      res.json({
        success: false,
        message: lang.PLEASE_ENTER_CODE.PR,
      });
      return;
    }

    if (!designation && !companyName) {
      res.json({
        success: false,
        message: lang.PLEASE_ENTER_DESIGNATION.PR,
      });
      return;
    }

    if (!checkValidEmail(email)) {
      res.json({
        success: false,
        message: lang.EMAIL_ADDRESS_IS_NOT_PROPER.PR,
      });
      return;
    }

    const emailExist = await User.find({ email });

    if (emailExist.length != 0) {
      res.json({
        success: false,
        message: lang.EMAIL_ALREADY_REGISTER_TRY_LOGIN_INSTEAD.PR,
      });
    }

    next();

  } catch (err) {
    console.log("Validator ERR :: ", err);
  }
};

export { userLoginValidator, changePasswordValidator, signUpValidator };
