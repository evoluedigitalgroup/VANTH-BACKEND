import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import authentication from "../../services/authentication";

import validator from "../../validator/User";
import lang from "../../helpers/locale/lang";
import User from "../../models/users";
import Company from "../../models/Company";
import UserInvitation from "../../models/userInvitation";
import _ from "lodash";
import config from "../../config";

const router = express.Router();

router.post("/login", validator.userLoginValidator, async (req, res) => {
  const { email, password } = req.body;

  const verifyEmail = await User.findOne({ email });

  if (verifyEmail) {
    const validPassword = await bcrypt.compare(password, verifyEmail.password);
    if (validPassword) {
      const jwtUserObj = authentication.generateObjForJwt(verifyEmail);

      const jwtTokens = await authentication.UserSignInJwt(jwtUserObj);

      let responseUserObj = authentication.getUserObjForResponse(verifyEmail);

      const response = {
        ...responseUserObj._doc,
        jwtTokens,
      };
      res.json({
        success: true,
        data: response,
        message: lang.LOGIN_SUCCESSFUL.PR,
      });
    } else {
      res.json({
        success: false,
        message: lang.PASSWORD_IS_INVALID.PR,
      });
    }
  } else {
    res.json({
      success: false,
      message: lang.EMAIL_ADDRESS_IS_INVALID_TRY_AGAIN.PR,
    });
  }
});

router.post(
  "/change-password",
  authentication.UserAuthValidateMiddleware,
  validator.changePasswordValidator,
  async (req, res) => {
    const userObj = req.user;
    const { newPassword } = req.body;
    if (userObj) {
      const password_salt = bcrypt.genSaltSync(parseInt(config.passwordSalt));

      const hashed_password = await bcrypt.hash(newPassword, password_salt);
      await User.findByIdAndUpdate(userObj.id, {
        password: hashed_password,
      });

      res.json({
        success: true,
        data: null,
        message: lang.PASSWORD_UPDATED_SUCCESSFULLY.PR,
      });
    } else {
      res.json({
        success: false,
        data: null,
        message: lang.FOR_YOUR_SAFETY_CONTACT_THE_INOVA_TEAM.PR,
      });
    }
  },
);

router.post("/sign-up", validator.signUpValidator, async (req, res) => {
  const { name, email, password, code, companyName, designation } = req.body;
  console.log("req.body", req.body);
  if (companyName) {

    const newCompany = {
      uuid: uuidv4(),
      companyName: companyName
    }

    const companyNameData = await new Company(newCompany).save();

    const password_salt = bcrypt.genSaltSync(parseInt(config.passwordSalt));

    const hashed_password = await bcrypt.hash(password, password_salt);

    const addObj = {
      uuid: uuidv4(),
      company: companyNameData.id,
      name,
      email,
      password: hashed_password,
      permissions: {
        insights: true,
        clients: true,
        newUser: true,
        document: true,
        permissions: true,
        contract: true
      },
      isMainUser: true
    };

    const newAdmin = await new User(addObj).save();

    if (_.isEmpty(newAdmin)) {
      // set jwt token
      res.json({
        success: false,
        message: lang.SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN_LATER.PR,
      });
    }

    res.json({
      success: true,
      data: newAdmin,
      message: lang.REGISTERED_SUCCESSFULLY.PR,
    });

  } else {

    const password_salt = bcrypt.genSaltSync(parseInt(config.passwordSalt));

    const hashed_password = await bcrypt.hash(password, password_salt);

    const codeInvitation = await UserInvitation.findOne({ code });

    if (!codeInvitation) {
      res.json({
        success: false,
        message: lang.CODE_IS_INVALID.PR,
      });
    }

    const findInvite = await User.findOne({ invitation: codeInvitation.id });

    if (findInvite != null) {
      res.json({
        success: false,
        message: lang.CODE_IS_ALREADY_USED.PR,
      });
    }

    const addObj = {
      uuid: uuidv4(),
      company: codeInvitation.company,
      name,
      email,
      password: hashed_password,
      code,
      designation,
      invitation: codeInvitation.id,
      permissions: codeInvitation.permissions,
    };
    const newAdmin = await new User(addObj).save();

    if (_.isEmpty(newAdmin)) {
      // set jwt token
      res.json({
        success: false,
        message: lang.SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN_LATER.PR,
      });
    }

    res.json({
      success: true,
      data: newAdmin,
      message: lang.REGISTERED_SUCCESSFULLY.PR,
    });

  }
});

export default router;
