import express from "express";
import multiparty from "multiparty";
import Contacts from "../../models/Contacts";
import lang from "./../../helpers/locale/lang";
import utility from "../../helpers/utility";
import authentication from "../../services/authentication";
import validator from "../../validator/Dashboard";
import moment from "moment";
import _ from "lodash";
import DocumentFile from "../../models/documentFile";
import User from "../../models/users";

const router = express();

router.post(
  "/approved-document",
  authentication.UserAuthValidateMiddleware,
  validator.documentStatusValidator,
  async (req, res) => {
    const userObj = req.user;
    const { id, type, action } = req.body;

    const data = await Contacts.findById({ _id: id });

    const documentType = await DocumentFile.find({});

    const validType = documentType.find(i => i.type === type);
    console.log("validType", validType);

    if (validType) {
      if (action === "approved") {
        const response = {
          url: data.docs[validType.type].url,
          approved: true,
          approvedBy: userObj.id,
          approvedDate: new Date(),
        };
        console.log("response", response);

        const docs = data.docs;
        docs[validType.type] = response;

        console.log("docs", docs);

        const updateVal = await Contacts.findByIdAndUpdate(id, { docs });

        res.json({
          success: true,
          data: updateVal,
          message: lang.SOCIAL_CONTRACT_SUCCESSFULLY.PR,
        });
      } else {
        const dataStatus = data.docStatus;

        const docs = data.docs;
        docs[validType.type] = null;

        const updateVal = await Contacts.findByIdAndUpdate(
          id,
          {
            docs,
            docStatus: {
              ...dataStatus,
              [`${validType.type}`]: true,
            },
          },
          { new: true },
        );

        res.json({
          success: true,
          data: updateVal,
          message: lang.SOCIAL_CONTRACT_REJECTED.PR,
        });
      }
    } else {
      res.json({
        success: false,
        message: lang.TYPE_IS_INVALID.PR,
      });
    }
  },
);

router.post(
  "/get-all-document-details",
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
    const { startFrom, totalFetchRecords, search = "" } = req.body;
    console.log("req.body :: ", req.body);
    const { company } = req.user;
    if (req.user.permissions.document) {
      let searchObj = {
        company
      };
      if (search) {
        const regExpValue = new RegExp(search, "i");

        searchObj = {
          name: regExpValue,
        };
      }
      const tempUser = {};
      const user = await User.find({});
      const filterUser = user.map(i => {
        return (tempUser[i.id] = i.name);
      });

      const totalContactDetails = await Contacts.find(
        { contactApprove: "approved" },
        searchObj,
      ).countDocuments();

      const contactDetails = await Contacts.find({
        $and: [{ contactApprove: "approved" }, searchObj],
      })
        .populate("documentRequest")
        .sort({ _id: -1 })
        .skip(startFrom)
        .limit(totalFetchRecords);

      const tempContact = {};

      const filterContact = contactDetails.map(i => {
        Object.keys(i.documentRequest.requiredPermission).map(i => {
          return (tempContact[i] = i);
        });
      });
      let arr = [];
      let findVal = [];
      // console.log("tempContact ::: ", tempContact);
      const ContactData = await Promise.all(
        contactDetails.map(async obj => {
          const date = moment(obj.updatedAt)
            .locale("pt-br")
            .format("DD MMM YYYY");
          const time = moment(obj.updatedAt).locale("pt-br").format("h:mm");

          if (obj.documentRequest.isGenerated) {
            Object.keys(obj.documentRequest.requiredPermission).map(i => {
              if (i != "CNPJ" && i != "CPF") {
                arr.push({
                  type: i,
                  permission: obj.documentRequest.requiredPermission[i],
                  approved: obj.docs[i]?.approved || false,
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

            console.log("lengthData", lengthData);
            console.log("lengthCount", lengthCount);

            if (lengthCount === lengthData) {
              console.log("1");

              const ab = [Object.keys(obj._doc).map(i => tempContact[i])];

              ab.flat(1).map(ele => {
                if (ele !== undefined) {
                  let approvedUser = obj._doc[ele]?.approvedBy;
                  approvedUser = tempAdmin[obj[ele]?.approvedBy];

                  Object.assign(obj._doc[ele] ? obj._doc[ele] : {}, {
                    approvedByName: approvedUser,
                  });
                }
              });

              obj._doc["allStatus"] = "approved";
              obj._doc["date"] = date;
              obj._doc["time"] = time;
              obj._doc;
              return obj;
            } else {
              obj._doc["allStatus"] = "pending";
              obj._doc["date"] = date;
              obj._doc["time"] = time;
              return obj;
            }
          } else {
            obj._doc["allStatus"] = "wait";
            obj._doc["date"] = date;
            obj._doc["time"] = time;
            return obj;
          }
        }),
      );

      const findContactData = _.compact(ContactData);

      res.json({
        success: true,
        data: { findContactData, totalContactDetails },
        message: lang.RECORD_FOUND.PR,
      });
    } else {
      res.json({
        success: false,
        message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
      });
    }
  },
);

router.post('/add-new-document-type',
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
    const { key, title } = req.body;

    const newKeyData = {
      company: req.user.company,
      type: key,
      label: key,
      title,
      isPublic: false
    };

    // Check if same key exist
    const keyExist = await DocumentFile.findOne({ type: key, company: req.user.company });

    if (keyExist) {
      return res.json({
        success: false,
        data: null,
        message: lang.DOCUMENT_TYPE_ALREADY_EXIST.PR
      });
    }

    const newDocumentType = await DocumentFile.create(newKeyData);

    return res.json({
      success: true,
      data: newDocumentType,
      message: lang.NEW_DOCUMENT_TYPE_ADDED.PR
    })
  }
);

export default router;
