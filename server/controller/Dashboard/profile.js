import validator from "../../validator/public";
import express from "express";
import utility from "../../helpers/utility";
import User from '../../models/users';
import authentication from "../../services/authentication";
import aws from "../../services/aws";
import path from "path";
import multiparty from "multiparty";
import lang from "./../../helpers/locale/lang";
import Contacts from "../../models/Contacts";
import _ from "lodash";
import moment from "moment";
import DocumentFile from "../../models/documentFile";
import Company from "../../models/Company";

const router = express.Router();
const awsUploadFile = aws.uploadFile;
router.post(
  "/get-profile",
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
    const userObj = req.user;

    const findUser = await User.findById({ _id: userObj.id });

    const companyDetails = await Company.findById(findUser.company);

    findUser._doc["companyData"] = companyDetails;

    res.json({
      success: true,
      data: findUser,
      message: null,
    });
  },
);

router.post(
  "/edit-profile",
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {

    const form = new multiparty.Form();

    const userObj = req.user;

    form.parse(req, async (err, fields, files) => {
      const validation = await validator.EditProfileValidator(fields, files);

      const name = fields["name"][0];

      const avatar = Array.isArray(files?.avatar) ? files["avatar"][0] : null;

      if (validation.success) {
        const imageName = Date.now().toString() + ".png";
        const pathToTempFile = path.resolve("public", "temp", imageName);

        let uploaded = await utility.uploadFile(
          files,
          "avatar",
          pathToTempFile,
        );

        const fileNameInTemp = `${imageName}`;

        if (!uploaded) {
          uploaded = null;
        }

        if (uploaded) {
          const data = await awsUploadFile(
            fileNameInTemp,
            `${userObj.company}/user/${userObj.id}/${imageName}`,
          );

          if (data.Location) {
            utility.deleteImage(pathToTempFile).then(async () => {
              const updateProfile = await User.findByIdAndUpdate(
                userObj.id,
                { name: name, profileImage: data.Location },
                { new: true },
              );

              res.json({
                success: true,
                data: updateProfile,
                message: lang.PROFILE_UPDATED_SUCCESSFULLY.PR,
              });
            });
          } else {
            res.json({
              success: false,
              message: lang.WRONG_ATTACHMENT.PR,
            });
          }
        } else {
          const updateProfile = await User.findByIdAndUpdate(
            userObj.id,
            { name: name },
            { new: true },
          );

          res.json({
            success: true,
            data: null,
            message: lang.PROFILE_UPDATED_SUCCESSFULLY.PR,
          });
        }
      }
    });
  },
);

router.post(
  "/filter-history",
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
    const userObj = req.user;
    
    if (userObj.permissions.newUser) {
      let searchObj = {
        company: userObj.company,
        visitor: false
      };

      const findUser = await Contacts
        .find({
          $and: [searchObj, { contactApprove: "approved" }],
        })
        .populate("documentRequest")
        .sort({ _id: -1 });

      res.json({
        success: true,
        data: findUser,
      });

    } else {
      res.json({
        success: false,
        message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
      });
    }
  },
);
export default router;
