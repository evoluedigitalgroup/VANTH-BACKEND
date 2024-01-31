import express from "express";
import axios from "axios";
import multiparty from "multiparty";
import { v4 as uuidv4 } from "uuid";
import Contacts from "../../models/Contacts";
import lang from "./../../helpers/locale/lang";
import utility from "../../helpers/utility";
import aws from "../../services/aws";
import path from "path";
import DocumentFile from "../../models/documentFile";
import authentication from "../../services/authentication";
import ContractTemplates from "../../models/contractTemplates";
import fs from 'fs';
import * as pdf2img from 'pdf-img-convert';

import * as docusign from "../../services/docusign";
import { generateUrlPdfToBase64 } from "../../helpers/docusign";
import Contracts from "../../models/Contracts";
import mongoose from "mongoose";
import config from "../../config";

const awsUploadFile = aws.uploadFile;

const router = express();

router.post("/filter-contracts", authentication.UserAuthValidateMiddleware, async (req, res) => {
  console.log('req.body : ', req.body);

  const { search = "", filter, startFrom, totalFetchRecords } = req.body;

  let searchObj = {
    company: req.user.company,
  };
  let filterSearchName = {};
  if (req.user.permissions.contract) {

    if (search) {
      const regExpression = new RegExp(search, "i");

      searchObj.name = regExpression;
    }

    const contactsData = await Contacts.find(searchObj);

    const contactIds = contactsData.map((item) => mongoose.Types.ObjectId(item._id));

    const filter = {
      recipient: {
        $in: contactIds
      }
    }

    const totalFindData = await Contracts.find(filter).countDocuments();
    const findData = await Contracts.find(filter)
      .populate("recipient")
      .sort({ _id: -1 })
      .skip(startFrom)
      .limit(totalFetchRecords);

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

});

router.post("/create-template", authentication.UserAuthValidateMiddleware, async (req, res) => {
  const form = new multiparty.Form();

  const { id, company } = req.user;

  console.log('id : ', id);

  form.parse(req, async (err, fields, files) => {
    console.log('fields : ', fields);
    console.log('files : ', files);
    const contact = fields.user[0];
    const originalFileName = fields.originalFileName[0];
    const templateSchema = fields.schema[0] ? JSON.parse(fields.schema[0]) : null;
    const contractPreviewFile = files.previewFile[0];
    const contractUsableFile = files.usableFile[0];
    const contractOriginalFile = files.originalFile[0];
    console.log('templateSchema : ', templateSchema);

    const contractPreviewFilename = uuidv4() + '-' + Date.now() + '-' + contractPreviewFile.originalFilename;
    const contractUsableFilename = uuidv4() + '-' + Date.now() + '-' + contractUsableFile.originalFilename;
    const contractOriginalFilename = uuidv4() + '-' + Date.now() + '-' + contractOriginalFile.originalFilename;

    const previewPathToTempFile = path.resolve("public", "temp", contractPreviewFilename);
    const usablePathToTempFile = path.resolve("public", "temp", contractUsableFilename);
    const originalPathToTempFile = path.resolve("public", "temp", contractOriginalFilename);
    const originalPathToTempFileImg = path.resolve("public", "temp", contractOriginalFilename + '.png');

    //  Upload preview file to temp folder
    const uploadPreviewFile = await utility.uploadFile(files, "previewFile", previewPathToTempFile)

    if (!uploadPreviewFile) {
      res.json({
        success: true,
        data: null,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }

    console.log('uploadPreviewFile : ', uploadPreviewFile);

    var outputImages = await pdf2img.convert(previewPathToTempFile);

    if (outputImages.length === 0) {
      res.json({
        success: true,
        data: null,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }

    fs.writeFileSync(originalPathToTempFileImg, outputImages[0]);


    const filePathValue = originalPathToTempFileImg;

    const imgPath = filePathValue;
    const imgName = filePathValue.split('/').pop();


    //  Upload preview image file to aws folder
    const previewImageFileAwsRecord = await awsUploadFile(
      imgPath,
      `${company}/contract-templates/${id}/${imgName}`,
    )

    //  Delete the uploaded preview image file
    await utility.deleteImage(imgPath);

    //  Upload preview file to aws folder
    const previewFileAwsRecord = await awsUploadFile(
      previewPathToTempFile,
      `${company}/contract-templates/${id}/${contractPreviewFilename}`,
    )

    if (!previewFileAwsRecord.Location) {
      res.json({
        success: true,
        data: null,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }

    //  Delete the uploaded preview file
    await utility.deleteImage(previewPathToTempFile);

    //  Upload usable file to temp folder
    const uploadUsableFile = await utility.uploadFile(files, "usableFile", usablePathToTempFile)

    if (!uploadUsableFile) {
      res.json({
        success: true,
        data: null,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }

    //  Upload usable file to aws folder
    const usableFileAwsRecord = await awsUploadFile(
      usablePathToTempFile,
      `${company}/contract-templates/${id}/${contractUsableFilename}`,
    )

    if (!usableFileAwsRecord.Location) {
      res.json({
        success: true,
        data: null,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }

    //  Delete the uploaded usable file
    await utility.deleteImage(usablePathToTempFile);


    //  Upload usable file to temp folder
    const uploadOriginalFile = await utility.uploadFile(files, "originalFile", originalPathToTempFile)

    if (!uploadOriginalFile) {
      res.json({
        success: true,
        data: null,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }

    //  Upload usable file to aws folder
    const originalFileAwsRecord = await awsUploadFile(
      originalPathToTempFile,
      `${company}/contract-templates/${id}/${contractOriginalFilename}`,
    )

    if (!originalFileAwsRecord.Location) {
      res.json({
        success: true,
        data: null,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }

    //  Delete the uploaded usable file
    await utility.deleteImage(originalPathToTempFile);


    const createTemplate = await ContractTemplates.create({
      uuid: uuidv4(),
      company,
      user: id,
      originalFileName,
      templateSchema,
      originalFile: originalFileAwsRecord.Location,
      templatePreviewFile: previewFileAwsRecord.Location,
      templatePreviewImageFile: previewImageFileAwsRecord.Location,
      templateFile: usableFileAwsRecord.Location,
    });

    if (!createTemplate) {
      res.json({
        success: true,
        data: null,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }

    res.json({
      success: true,
      data: createTemplate,
      message: lang.CONTRACT_TEMPLATE_CREATED_SUCCESSFULLY.PR,
    });
  });
});

router.post("/get-templates", authentication.UserAuthValidateMiddleware, async (req, res) => {
  const { id, company } = req.user;

  const getTemplates = await ContractTemplates.find({
    company,
    user: id,
    isDeleted: false
  });

  if (!getTemplates) {
    res.json({
      success: true,
      data: [],
      message: null,
    });
  }

  res.json({
    success: true,
    data: getTemplates,
    message: null,
  });
});

router.post("/create-contract", authentication.UserAuthValidateMiddleware, async (req, res) => {
  try {
    const { id, company } = req.user;
    const { selectedTemplates, selectedContact } = req.body;

    const contactDetails = await Contacts.findById(selectedContact);

    const templates = await ContractTemplates.find({
      _id: {
        $in: selectedTemplates
      },
      company,
    });

    const insertedData = {
      uuid: uuidv4(),
      identifier: uuidv4(),
      company,
      user: id,
      recipient: selectedContact,
      contractTemplates: selectedTemplates,
    };

    const contractRequest = await Contracts.create(insertedData);

    console.log('contractRequest : ', contractRequest)

    let templateBase64Data = [];
    for (let i = 0; i < templates.length; i++) {
      const obj = templates[i];
      const base64Data = await generateUrlPdfToBase64(obj.templateFile);
      templateBase64Data.push({
        documentBase64: base64Data,
        name: obj.originalFileName,
        uuid: obj.uuid,
        id: obj.id
      });
    }

    const token = await docusign.getDocuSignJwtToken()

    console.log('token : ', token)

    const signerEmail = contactDetails.email;
    const signerName = contactDetails.name;
    const signerClientId = contactDetails.uuid;

    const args = {};
    args.accessToken = token;
    args.signerEmail = signerEmail;
    args.signerName = signerName;
    args.signerClientId = signerClientId;
    args.dsPingUrl = null;

    args.envelopeArgs = [];

    for (let i = 0; i < templateBase64Data.length; i++) {
      const obj = templateBase64Data[i];

      const envelopeArgs = {};
      envelopeArgs.documentId = Math.floor(100000000 + Math.random() * 900000000);
      envelopeArgs.signerEmail = signerEmail;
      envelopeArgs.signerName = signerName;
      envelopeArgs.recipientId = Math.floor(100000000 + Math.random() * 900000000);
      envelopeArgs.documentName = obj.name; //
      envelopeArgs.signerClientId = signerClientId; //
      envelopeArgs.documentBase64 = obj.documentBase64; //
      args.envelopeArgs.push(envelopeArgs);
    }

    const resultsData = await docusign.createEnvelopes(args);

    console.log('resultsData : ', resultsData);

    // args.envelopeId = resultsData.envelopeId;
    // const view = docusign.makeRecipientViewRequest(args);
    // console.log('view : ', view);
    // const results = await docusign.generateRecipientViewRequest(token, args.envelopeId, view)
    // console.log('results : ', results);

    contractRequest.docusignEnvelopeId = resultsData.envelopeId;
    await contractRequest.save();


    res.json({
      success: true,
      data: contractRequest,
      message: 'Contract request generated successfully',
    });

  } catch (error) {

    console.log('error : ', error)

    res.json({
      success: false,
      data: null,
      message: 'Something went wrong'
    });
  }
});

router.post("/get-contract-details", async (req, res) => {
  console.log('req.body : ', req.body);

  const { companyId, contractId, docusignEnvelopeId } = req.body;

  const contractRequest = await Contracts.findOne({
    company: companyId,
    uuid: contractId,
    docusignEnvelopeId
  }).populate("company").populate("recipient");

  console.log('contractRequest : ', contractRequest);

  if (contractRequest.status === 'signed' || contractRequest.status === 'rejected') {
    res.json({
      success: true,
      data: contractRequest,
      message: null
    });
  } else {

    contractRequest.verifier = uuidv4();
    await contractRequest.save();

    const returnUrl = `${config.frontendUrl}/contract/docusign/return-url`;

    const args = {};
    args.dsReturnUrl = `${returnUrl}?requestId=${contractRequest.uuid}&contractIdentifier=${contractRequest.identifier}&verifier=${contractRequest.verifier}`;
    args.signerEmail = contractRequest.recipient.email;
    args.signerName = contractRequest.recipient.name;
    args.signerClientId = contractRequest.recipient.uuid;
    args.envelopeId = contractRequest.docusignEnvelopeId;

    // Making the view
    const view = docusign.makeRecipientViewRequest(args);
    console.log('view : ', view);

    //  Generating the recipient view (Embedded signing view)
    const token = await docusign.getDocuSignJwtToken();
    const results = await docusign.generateRecipientViewRequest(token, args.envelopeId, view);

    console.log('results : ', results);

    const returnData = {
      ...contractRequest._doc,
    }

    returnData.docusignUrl = results.url;

    console.log('returnData : ', returnData);

    res.json({
      success: true,
      data: returnData,
      message: null
    });

    // console.log('view : ', view);
    // const results = await docusign.generateRecipientViewRequest(token, args.envelopeId, view)
    // console.log('results : ', results);

  }
});

router.post("/update-contract-status", async (req, res) => {
  console.log('req.body : ', req.body);
  const { query } = req.body;
  const queryData = new URLSearchParams(query);
  const requestId = queryData.get('requestId');
  console.log('requestId : ', requestId);
  const contractIdentifier = queryData.get('contractIdentifier');
  console.log('contractIdentifier : ', contractIdentifier);
  const verifier = queryData.get('verifier');
  console.log('verifier : ', verifier);
  const event = queryData.get('event');
  console.log('event : ', event);

  const successEvents = ['signing_complete', 'viewing_complete'];
  const failedEvents = [''];

  const status = event === 'signing_complete' || event === 'viewing_complete' ? 'signed' : 'rejected';

  const contractRequest = await Contracts.findOne({
    uuid: requestId,
    identifier: contractIdentifier,
    verifier,
  });


  if (contractRequest) {
    contractRequest.status = status;
    await contractRequest.save();

    res.json({
      success: true,
      data: status,
      message: null
    });
  } else {
    res.json({
      success: true,
      data: 'not-found',
      message: null
    });
  }


});

export default router;
