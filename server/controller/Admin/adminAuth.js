import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import authentication from "../../services/authentication";

import validator from "../../validator/Admin";
import lang from "../../helpers/locale/lang";
import Admin from "../../models/admin";
import AdminInvitation from "../../models/adminInvitation";
import _ from "lodash";
import config from "../../config";

const router = express.Router();

router.post("/login", validator.adminLoginValidator, async (req, res) => {
  const { email, password } = req.body;

  const verifyEmail = await Admin.findOne({ email });

  if (verifyEmail) {
    const validPassword = await bcrypt.compare(password, verifyEmail.password);
    if (validPassword) {
      const jwtAdminObj = authentication.generateObjForJwt(verifyEmail);
      console.log("jwtAdminObj", jwtAdminObj);
      const jwtTokens = await authentication.AdminSignInJwt(jwtAdminObj);
      console.log("jwtTokens", jwtTokens);

      let responseAdminObj = authentication.getUserObjForResponse(verifyEmail);

      const response = {
        ...responseAdminObj._doc,
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
  authentication.AdminAuthValidateMiddleware,
  validator.changePasswordValidator,
  async (req, res) => {
    const adminObj = req.admin;
    const { newPassword } = req.body;
    if (adminObj) {
      const password_salt = bcrypt.genSaltSync(parseInt(config.passwordSalt));

      const hashed_password = await bcrypt.hash(newPassword, password_salt);
      await Admin.findByIdAndUpdate(adminObj.id, {
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
  const { name, email, password, code, designation } = req.body;

  const password_salt = bcrypt.genSaltSync(parseInt(config.passwordSalt));

  const hashed_password = await bcrypt.hash(password, password_salt);

  const codeInvitation = await AdminInvitation.findOne({ code });
  if (codeInvitation) {
    const findInvite = await Admin.findOne({ invitation: codeInvitation.id });

    if (findInvite === null) {
      const addObj = {
        uuid: uuidv4(),
        name,
        email,
        password: hashed_password,
        code,
        designation,
        invitation: codeInvitation.id,
        permissions: codeInvitation.permissions,
      };
      const newAdmin = await new Admin(addObj).save();

      if (!_.isEmpty(newAdmin)) {
        // set jwt token

        res.json({
          success: true,
          data: newAdmin,
          message: lang.REGISTERED_SUCCESSFULLY.PR,
        });
      } else {
        res.json({
          success: false,
          message: lang.SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN_LATER.PR,
        });
      }
    } else {
      res.json({
        success: false,
        message: lang.CODE_IS_ALREADY_USED.PR,
      });
    }
  } else {
    res.json({
      success: false,
      message: lang.CODE_IS_INVALID.PR,
    });
  }
});

export default router;
