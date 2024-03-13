import express from "express";
import authentication from "../../services/authentication";
import validator from "../../validator/Dashboard";
import DocumentRequest from "../../models/documentRequest";
import lang from "../../helpers/locale/lang";
import Contacts from "../../models/Contacts";
import moment from "moment";
import DocumentFile from "../../models/documentFile";
const router = express.Router();

router.post(
  "/generate-document-request-link",
  authentication.UserAuthValidateMiddleware,
  validator.generateDocumentValidator,
  async (req, res) => {
    const { contactId, requestId, permission, generateLink } = req.body;

    const filterData = await DocumentRequest.findByIdAndUpdate(
      requestId,
      { requiredPermission: permission, generateLink, isGenerated: true },
      { new: true },
    );

    const findData = await Contacts.findById({ _id: contactId }).populate("documentRequest");
    const filterDocs = findData?.documentRequest;
    const filterDocStatus = findData?.docs;

    var result = {};
    var resultData = {};
    // const findData = {};

    var keys = Object.keys(filterDocStatus);

    for (var [key, value] of Object.entries(permission)) {
      if (value) {
        if (!keys.includes(key)) {
          result[key] = null;
        } else {
          result[key] = filterDocStatus[key];
        }
      }
    }

    await Contacts.findByIdAndUpdate(
      contactId,
      { docs: result },
      { new: true },
    );

    res.json({
      success: true,
      data: filterData,
      message: lang.GENERATE_LINK_SUCCESSFULLY.PR,
    });
  },
);

router.post("/get-document-file",
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
    const { company } = req.user;
    const documentFileList = await DocumentFile.find({
      $or: [{
        isPublic: true
      }, {
        company
      }]
    });

    res.json({
      success: true,
      data: documentFileList,
    });
  });

router.post("/get-document-file-public",
  async (req, res) => {
    const { company } = req.body;
    const documentFileList = await DocumentFile.find({
      $or: [{
        isPublic: true
      }, {
        company
      }]
    });

    res.json({
      success: true,
      data: documentFileList,
    });
  });

router.post(
  "/filter-contacts",
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
    console.log('req.user : ', req.user);
    const { search = "", filter, startFrom, totalFetchRecords } = req.body;

    let searchObj = {
      company: req.user.company,
    };
    let filterSearchName = {};
    if (req.user.permissions.clients) {
      if (search) {
        const regExpression = new RegExp(search, "i");

        searchObj.name = regExpression;
      }

      const totalFindData = await Contacts.find(searchObj).countDocuments();
      const findData = await Contacts.find(searchObj)
        .populate("documentRequest")
        .sort({ _id: -1 })
        .skip(startFrom)
        .limit(totalFetchRecords);

      const ContactData = await Promise.all(
        findData.map(async obj => {
          const date = moment(obj.createdAt)
            .locale("pt-br")
            .format("DD MMM YYYY");

          const time = moment(obj.createdAt).locale("pt-br").format("h:mm");
          obj._doc["date"] = date;
          obj._doc["time"] = time;
        }),
      );
      res.json({
        success: true,
        data: { findData, totalFindData },
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

router.post(
  "/approve-visitor",
  validator.approveVisitorValidator,
  async (req, res) => {
    const { id, action } = req.body;

    const findContact = await Contacts.findById({ _id: id });

    //  check if contact found
    if (findContact !== null) {
      //  For approve action
      if (action === "approved") {
        await Contacts.findByIdAndUpdate(
          id,
          { contactApprove: "approved" },
          { new: true },
        );

        res.json({
          success: true,
          message: lang.VISITOR_APPROVED_SUCCESSFULLY.PR,
        });
      } else if (action === 'rejected') {

         await Contacts.findByIdAndUpdate(
          id,
          { contactApprove: "rejected" },
          { new: true },
        );

        res.json({
          success: true,
          message: lang.VISITOR_REJECTED_SUCCESSFULLY.PR,
        });
      } else {
        await Contacts.findByIdAndDelete(id);

        res.json({
          success: true,
          message: lang.VISITOR_REMOVED_SUCCESSFULLY.PR,
        });
      }
    }
  },
);

export default router;
