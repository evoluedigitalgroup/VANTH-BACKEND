import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import authentication from "../../services/authentication";
import validator from "../../validator/Dashboard";
import Invitation from "../../models/invitation";
import lang from "../../helpers/locale/lang";
import utility from "../../helpers/utility";

const router = express.Router();

router.post(
  "/invite-new-admin",
  authentication.AdminAuthValidateMiddleware,
  validator.invitationValidator,
  async (req, res) => {
    const { designation, permissions, code } = req.body;

    const AddData = {
      uuid: uuidv4(),
      designation,
      permissions,
      code,
    };

    const savedData = await new Invitation(AddData).save();
    res.json({
      success: true,
      data: savedData,
      message: lang.INVITATION_SENT.PR,
    });
  },
);

router.post("/generate-random-code", async (req, res) => {
  const generateCode = async () => {
    const code = utility.generateCharter(13);

    const uniqueCode = await Invitation.find({
      code,
    }).countDocuments();

    if (uniqueCode) {
      return generateCode();
    } else {
      return code;
    }
  };
  const randomCode = await generateCode();
  res.json({
    success: true,
    data: randomCode,
  });
});

router.post("/get-code", async (req, res) => {
  const { code } = req.body;
  if (code) {
    const findCode = await Invitation.findOne({ code });
    if (findCode) {
      res.json({
        success: true,
        data: findCode,
      });
    } else {
      res.json({
        success: false,
        message: lang.CODE_IS_INVALID.PR,
      });
    }
  } else {
    res.json({
      success: false,
      message: lang.PLEASE_ENTER_CODE.PR,
    });
  }
});

export default router;
