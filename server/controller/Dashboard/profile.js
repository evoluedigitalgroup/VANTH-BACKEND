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

        console.log("upload: ", uploaded);

        const fileNameInTemp = `${imageName}`;

        console.log("fileNameInTemp ::", fileNameInTemp);

        if (!uploaded) {
          uploaded = null;
        }

        if (uploaded) {
          const data = await awsUploadFile(
            fileNameInTemp,
            `${userObj.company}/user/${userObj.id}/${imageName}`,
          );

          console.log("data: ", data);

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

    const { search = "" } = req.body;

    if (userObj.permissions.document) {
      let searchObj = {};
      if (search) {
        const regExpression = new RegExp(search, "i");
        searchObj.name = regExpression;
      }

      const findUser = await Contacts.find({
        $and: [searchObj, { contactApprove: "approved" }],
      })
        .populate("documentRequest")
        .sort({ _id: -1 });

      const documentType = await DocumentFile.find({});
      console.log("documentType", documentType);

      let arr = [];
      let findVal = [];

      const tempApproved = findUser.map(obj => {
        const date = moment(obj.updatedAt)
          .locale("pt-br")
          .format("DD MMM YYYY");
        const time = moment(obj.updatedAt).locale("pt-br").format("h:mm");

        Object.keys(obj.documentRequest.requiredPermission).map(i => {
          if (i != "CNPJ" && i != "CPF") {
            arr.push({
              type: i,
              permission: obj.documentRequest.requiredPermission[i],
              approved: obj[i]?.approved || false,
              user: obj.email || obj.phone,
            });
          }
        });

        findVal.push(arr);
        arr = [];

        let lengthCount = 0;
        let lengthData = 0;
        findVal.map((val, j) => {
          val.map(i => {
            if ((obj.email || obj.phone) == i.user) {
              if (i.permission === true) {
                lengthData += 1;
                if (i.approved === true) {
                  lengthCount += 1;
                }
              }
            }
          });
        });

        const findDoc = documentType.map(ele => {
          if (lengthData === lengthCount) {
            if (
              obj[ele.type]?.approvedBy == userObj.id
            ) {
              obj._doc["date"] = date;
              obj._doc["time"] = time;

              return obj;
            } else {
              return false;
            }
          } else {
            return false;
          }
        });

        return findDoc;
      });
      const tempData = tempApproved.flat(1);
      const approvedByUser = _.compact(tempData);
      const ids = approvedByUser.map(o => o.id);
      const filteredData = approvedByUser.filter(
        ({ id }, index) => !ids.includes(id, index + 1),
      );

      res.json({
        success: true,
        data: filteredData,
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
