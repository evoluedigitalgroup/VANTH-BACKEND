import validator from "../../validator/public";
import express from "express";
import utility from "../../helpers/utility";
import Admin from "../../models/admin";
import authentication from "../../services/authentication";
import aws from "../../services/aws";
import path from "path";
import multiparty from "multiparty";
import lang from "./../../helpers/locale/lang";
import Contacts from "../../models/Contacts";
import _ from "lodash";
import moment from "moment";
import DocumentFile from "../../models/documentFile";

const router = express.Router();
const awsUploadFile = aws.uploadFile;
router.post(
  "/get-profile",
  authentication.AdminAuthValidateMiddleware,
  async (req, res) => {
    const adminObj = req.admin;

    const findAdmin = await Admin.findById({ _id: adminObj.id });
    res.json({
      success: true,
      data: findAdmin,
      message: null,
    });
  },
);

router.post(
  "/edit-profile",
  authentication.AdminAuthValidateMiddleware,
  async (req, res) => {
    const form = new multiparty.Form();
    const adminObj = req.admin;
    form.parse(req, async (err, fields, files) => {
      const validation = await validator.EditProfileValidator(fields, files);
      console.log("valid: ", validation);
      const name = fields["name"][0];
      const avatar = Array.isArray(files?.avatar) ? files["avatar"][0] : null;
      console.log("field: ", fields);
      console.log("file: ", files);
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
            `admin/${adminObj.id}/${imageName}`,
          );

          console.log("data: ", data);

          if (data.Location) {
            utility.deleteImage(pathToTempFile).then(async () => {
              const updateProfile = await Admin.findByIdAndUpdate(
                adminObj.id,
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
          const updateProfile = await Admin.findByIdAndUpdate(
            adminObj.id,
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
  authentication.AdminAuthValidateMiddleware,
  async (req, res) => {
    const adminObj = req.admin;

    const { search = "" } = req.body;

    if (adminObj.permissions.document) {
      let searchObj = {};
      if (search) {
        const regExpression = new RegExp(search, "i");
        searchObj.name = regExpression;
      }

      const findAdmin = await Contacts.find({
        $and: [searchObj, { contactApprove: "approved" }],
      })
        .populate("documentRequest")
        .sort({ _id: -1 });
      // console.log("findAdmin", findAdmin);

      const documentType = await DocumentFile.find({});
      console.log("documentType", documentType);

      let arr = [];
      let findVal = [];

      const tempApproved = findAdmin.map(obj => {
        const date = moment(obj.updatedAt)
          .locale("pt-br")
          .format("DD MMM YYYY");
        const time = moment(obj.updatedAt).locale("pt-br").format("h:mm");
        // if (
        //   i.socialContract?.approved === true &&
        //   i.addressProof?.approved === true
        // ) {

        Object.keys(obj.documentRequest.requiredPermission).map(i => {
          if (i != "CNPJ" && i != "CPF") {
            // console.log("email ::: ", obj.email);
            // console.log(
            //   " type ::: ",
            //   i,
            //   "permission ::: ",
            //   obj.documentRequest.requiredPermission[i],
            // );
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

        // const findData = findVal.flat(1);

        let lengthCount = 0;
        let lengthData = 0;
        findVal.map((val, j) => {
          val.map(i => {
            if ((obj.email || obj.phone) == i.user) {
              if (i.permission === true) {
                lengthData += 1;
                console.log(`iiiiiiii ::: `, i);

                // console.log(`${val.user}`, obj[val.type]);
                // console.log(`${val.user}`, val.permission);
                // if (obj[val.type]?.approved === true) {
                //   lengthCount += 1;
                // }
                if (i.approved === true) {
                  lengthCount += 1;
                }
              }
            }
          });
        });

        console.log("lengthData", lengthData);
        console.log("lengthCount", lengthCount);

        const findDoc = documentType.map(ele => {
          if (lengthData === lengthCount) {
            // if (obj[ele.type]?.approvedBy != undefined) {
            if (
              obj[ele.type]?.approvedBy == adminObj.id
              // i.addressProof.approvedBy === adminObj.id
            ) {
              obj._doc["date"] = date;
              obj._doc["time"] = time;

              return obj;
            } else {
              return false;
            }
            // } else {
            //   return false;
            // }
          } else {
            return false;
          }
        });

        return findDoc;
        // } else {
        //   return false;
        // }
      });
      const tempData = tempApproved.flat(1);
      const approvedByAdmin = _.compact(tempData);
      const ids = approvedByAdmin.map(o => o.id);
      const filteredData = approvedByAdmin.filter(
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
