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
  authentication.AdminAuthValidateMiddleware,
  validator.generateDocumentValidator,
  async (req, res) => {
    const { contactId, requestId, permission, generateLink } = req.body;

    const filterData = await DocumentRequest.findByIdAndUpdate(
      requestId,
      { requiredPermission: permission, generateLink, isGenerated: true },
      { new: true },
    );

    const findData = await Contacts.findById({ _id: contactId });
    console.log("findData", findData);
    const filterDocStatus = findData?.docStatus;
    console.log("filterDocStatus", filterDocStatus);

    var result = {};
    // const findData = {};

    var keys = Object.keys(permission);

    for (var key in filterDocStatus) {
      if (keys.includes(key)) {
        result[key] = false;
      } else if (!keys.includes(key)) {
        result[key] = filterDocStatus[key];
      }
    }

    await Contacts.findByIdAndUpdate(
      contactId,
      { docStatus: result },
      { new: true },
    );

    res.json({
      success: true,
      data: filterData,
      message: lang.GENERATE_LINK_SUCCESSFULLY.PR,
    });
  },
);

router.post("/get-document-file", async (req, res) => {
  const documentFileList = await DocumentFile.find({});

  res.json({
    success: true,
    data: documentFileList,
  });
});

router.post(
  "/filter-contacts",
  authentication.AdminAuthValidateMiddleware,
  async (req, res) => {
    const { search = "", filter, startFrom, totalFetchRecords } = req.body;

    let searchObj = {};
    let filterSearchName = {};
    if (req.admin.permissions.contact) {
      if (search) {
        const regExpression = new RegExp(search, "i");

        searchObj.name = regExpression;
      }

      // if(filter.approved=="approved"){
      //   filterSearchName={
      //     approved:
      //   }
      // }

      // if (filter) {
      //   if (filter?.approved == "approved") {
      //     filterSearchName["socialContract.approved"] = true;
      //     filterSearchName["addressProof.approved"] = true;
      //   } else if (filter.transaction == "pending") {
      //     filterSearchName["socialContract.approved"] = false;
      //     filterSearchName["addressProof.approved"] = false;
      //   } else {
      //     filterSearchName["socialContract.approved"] = true && false;
      //     filterSearchName["addressProof.approved"] = true && false;
      //   }
      // }

      // console.log("filterSearchName", filterSearchName);

      // let arr = [];
      // let findVal = [];

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
          // console.log(
          //   "obj.documentRequest.requiredPermission",
          //   obj.documentRequest.requiredPermission,
          // );

          // Object.keys(obj.documentRequest.requiredPermission).map(i => {
          //   if (i != "CNPJ" && i != "CPF") {
          //     arr.push({
          //       type: i,
          //       permission: obj.documentRequest.requiredPermission[i],
          //     });
          //   }
          // });

          // findVal.push(arr);
          // arr = [];
          // let lengthData = 0;
          // let lengthCount = 0;
          // findVal.map(val => {
          //   val.map(i => {
          //     if (i.permission === true) {
          //       lengthData += 1;

          //       if (obj[i.type] !== null) {
          //         lengthCount += 1;
          //       }
          //     }
          //   });
          // });

          // if (lengthCount === lengthData) {
          //   await Contacts.updateMany(
          //     { _id: { $in: obj.id } },
          //     { docStatus: "approved" },
          //   );

          //   obj._doc["status"] = "approved";
          //   obj._doc["date"] = date;
          //   obj._doc["time"] = time;

          //   return obj;
          // } else {
          //   obj._doc["status"] = "pending";
          //   obj._doc["date"] = date;
          //   obj._doc["time"] = time;

          //   return obj;
          // }
        }),
      );
      // console.log("arr", arr);
      // console.log("findVal", findVal);
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
    if (findContact !== null) {
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
      } else {
        await Contacts.findByIdAndUpdate(
          id,
          { contactApprove: "rejected" },
          { new: true },
        );

        res.json({
          success: true,
          message: lang.VISITOR_REJECTED_SUCCESSFULLY.PR,
        });
      }
    }
  },
);

export default router;
