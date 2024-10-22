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
//import * as pdf2img from 'pdf-img-convert';

import * as docusign from "../../services/docusign";
import { generateUrlPdfToBase64 } from "../../helpers/docusign";
import Contracts from "../../models/Contracts";
import mongoose from "mongoose";
import config from "../../config";
import { forEach } from "lodash";
import sendMail from "../../services/nodemailer";

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
      .populate("contractDocumentIds.template")
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
      templatePreviewImageFile: "https://fastly.picsum.photos/id/180/367/267.jpg?hmac=XAmHD3CeF1SZodNhSTtrCVFsSUnlee5bjFyJsrqxyCM",
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
    const { selectedTemplates, selectedContacts } = req.body;
    console.log(selectedContacts)

    const contactPromises = selectedContacts.map(item => Contacts.findById(item))
    const contactDetailsList = await Promise.all(contactPromises)

    //  Finding the selected contract templates
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
      recipient: contactDetailsList,
      contractTemplates: selectedTemplates,
    };

    const contractRequest = await Contracts.create(insertedData);

    const contractDocumentIds = [];

    let templateBase64Data = [];
    for (let i = 0; i < templates.length; i++) {
      const obj = templates[i];
      const base64Data = await generateUrlPdfToBase64(obj.templateFile);

      const documentId = Math.floor(100000000 + Math.random() * 900000000);
      const recipientId = Math.floor(100000000 + Math.random() * 900000000);

      contractDocumentIds.push({
        template: obj.id,
        documentId,
        recipientId
      });

      templateBase64Data.push({
        documentId,
        recipientId,
        documentBase64: base64Data,
        name: obj.originalFileName,
        uuid: obj.uuid,
        id: obj.id
      });
    }

    contractRequest.contractDocumentIds = contractDocumentIds;
    await contractRequest.save();

    const token = await docusign.getDocuSignJwtToken()

    const signersEmail = contactDetailsList.map(contact => contact.email)
    const signersName = contactDetailsList.map(contact => contact.name)
    const signersClientId = contactDetailsList.map(contact => contact.uuid)

    const args = {};
    args.accessToken = token;
    args.signersEmail = signersEmail;
    args.signersName = signersName;
    args.signersClientId = signersClientId;
    args.dsPingUrl = null;

    args.envelopeArgs = [];

    for (let i = 0; i < templateBase64Data.length; i++) {
      const obj = templateBase64Data[i];

      const envelopeArgs = {};
      envelopeArgs.documentId = obj.documentId;
      envelopeArgs.signersEmail = signersEmail;
      envelopeArgs.signersName = signersName;
      envelopeArgs.recipientId = signersClientId;
      envelopeArgs.documentName = obj.name; //
      envelopeArgs.signersClientId = signersClientId; //
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
    
    contractRequest.recipient.map((val, i) => {
      contractRequest.recipientsStatus.push({
        recipient: val,
        status: 'pending'
      });

      const sentEmail = contactDetailsList.filter((item) => item.id == val).map(item => item.email);

      sentEmail.forEach((email, _) => {
        const redirectLink = `${config.host}/requested-signature/${contractRequest?.company}/${contractRequest?.uuid}/${contractRequest?.docusignEnvelopeId}/${val}`;
      
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0068FF; font-size: 28px; margin-bottom: 20px;">Vanth Docs System & Docusign</h1>
          <h2 style="color: #0068FF; font-size: 24px; margin-bottom: 20px;">Por favor, assine seu contrato!</h2>
          <p style="font-size: 16px;">Este email contém um link seguro da Vanth Docs System. Não compartilhe este email, link ou código de acesso com outras pessoas.</p>
          <p style="font-size: 16px;">Assine documentos eletronicamente em minutos. É seguro, protegido e legalmente vinculativo. Esteja você em um escritório, em casa ou em outro lugar, ou mesmo em outro país, o nosso parceiro DocuSign fornece uma solução profissional confiável de gerenciamento de transações digitais (Digital Transaction Management™).</p>
          <p style="font-size: 16px;">Tem alguma dúvida sobre o documento? Se você precisar modificar o documento ou tiver dúvidas sobre os detalhes do documento, entre em contato com o remetente enviando um email diretamente para ele.</p>
          <p style="font-size: 16px;">Se você tiver problemas para assinar o documento, visite a página <a href="https://vanthdocs.com.br/help" style="color: #0068FF; text-decoration: none;">Ajuda com a assinatura</a> em nosso Centro de suporte.</p>
          <p style="font-size: 16px;">Acesse o site <a href="https://vanthdocs.com.br" style="color: #0068FF; text-decoration: none;">vanthdocs.com.br</a>.</p>
          <p style="font-size: 16px;">Atenciosamente,<br/>Equipe Vanth Docs</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${redirectLink}" style="display: inline-block; background-color: #0068FF; color: #ffffff; font-size: 18px; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Clique aqui para assinar o contrato!</a>
          </div>
        </div>
        `;  
    
        sendMail(email, 'Assinatura de Contrato - Vanth Docs System', htmlContent);
      })
    })

    contractRequest.ableToSign = selectedContacts[0]
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
  
  const { companyId, contractId, docusignEnvelopeId, recipientViwer } = req.body;

  const contractRequest = await Contracts.findOne({
    company: companyId,
    uuid: contractId,
    docusignEnvelopeId
  }).populate("company").populate("recipient");

  if (contractRequest.ableToSign != recipientViwer) {
    return res.json({
      data: {
        message: 'Not able to sign!',
        ableRecipient: contractRequest.recipient.filter((item) => { if (item.id == contractRequest.ableToSign) { return item } }),
        success: false
      },
    })
  }

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
    args.dsReturnUrl = `${returnUrl}?requestId=${contractRequest.uuid}&contractIdentifier=${contractRequest.identifier}&verifier=${contractRequest.verifier}&recipientViwer=${recipientViwer}`;

    console.log('args.dsReturnUrl : ', args.dsReturnUrl);

    let signerEmail = null;
    let signerName = null;
    let signerClientId = null;

    const matchingRecipient = contractRequest.recipient.find(contact => contact.id == recipientViwer);

    if (matchingRecipient) {
        signerEmail = matchingRecipient.email;
        signerName = matchingRecipient.name;
        signerClientId = matchingRecipient.uuid;
    } else {
        console.log("Erro: Nenhum contato correspondente encontrado para o recipientViwer fornecido.");
    }
    
    args.signerEmail = signerEmail;
    args.signerName = signerName;
    args.signerClientId = signerClientId;

    args.envelopeId = contractRequest.docusignEnvelopeId;

    console.log(args)

    // Making the view
    const view = docusign.makeRecipientViewRequest(args);

    //  Generating the recipient view (Embedded signing view)
    const token = await docusign.getDocuSignJwtToken();
    const results = await docusign.generateRecipientViewRequest(token, args.envelopeId, view);

    console.log('results : ', results);

    const returnData = {
      ...contractRequest._doc,
    }

    returnData.docusignUrl = results.url + '&locale=pt_BR';

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

  const contractIdentifier = queryData.get('contractIdentifier');

  const verifier = queryData.get('verifier');

  const event = queryData.get('event');

  const recipientViwer = queryData.get('recipientViwer')

  let status = event === 'signing_complete' || event === 'viewing_complete' ? 'signed' : 'rejected';

  const contractRequest = await Contracts.findOne({
    uuid: requestId,
    identifier: contractIdentifier,
    verifier,
  }).populate("contractDocumentIds.template");

  if (contractRequest) {
    console.log('Started working on downloading & storing the document on the cloud');

    const token = await docusign.getDocuSignJwtToken();

    const updatedContractDocumentIds = [];

    for (let i = 0; i < contractRequest.contractDocumentIds.length; i++) {
      const doc = contractRequest.contractDocumentIds[i];

      console.log('doc : ', doc);

      const documentId = doc.documentId;
      const originalFileName = doc.template.originalFileName;


      const fileNameArray = originalFileName.split('.');
      const fileNameValue = originalFileName.split(' ').join('_').split('.').filter((item, index) => index < fileNameArray.length - 1).join('_');
      const fileExt = originalFileName.split('.').pop();

      const signedFileName = `${fileNameValue}_signed.${fileExt}`;

      const signedFileUrl = await docusign.downloadDocument(
        token,
        contractRequest.company,
        contractRequest.docusignEnvelopeId,
        documentId,
        signedFileName
      );

      updatedContractDocumentIds.push({
        ...doc,
        signedDocument: signedFileUrl
      });

    }

    let allRecipientsSigned = true;
    let recipientFound = false;
    
    contractRequest.recipientsStatus.forEach((r, i) => {
      if (r.recipient === recipientViwer) {
        recipientFound = true;
        if (r.status !== 'signed') {
          allRecipientsSigned = false;
        }
      }
    });
    
    if (!recipientFound) {
      allRecipientsSigned = false;
    }

    const updatedRecipientsStatus = [...contractRequest.recipientsStatus];

    const recipientIndex = updatedRecipientsStatus.findIndex(
      recipient => recipient.recipient === recipientViwer
    );

    if (recipientIndex !== -1) {
      updatedRecipientsStatus[recipientIndex].status = status;
    } else {
      updatedRecipientsStatus.push({
        recipient: recipientViwer,
        status: status
      });
    }

    contractRequest.recipientsStatus = updatedRecipientsStatus
    
    if (contractRequest.ableToSign == recipientViwer) {
      contractRequest.recipientsStatus.forEach((item, i) => {
        if (item.status == 'pending') {
          contractRequest.ableToSign = item.recipient
          return
        }
      })
    }

    if (contractRequest.recipientsStatus.length !== contractRequest.recipient.length) {
      allRecipientsSigned = false;
    } else {
      allRecipientsSigned = true

      contractRequest.recipientsStatus.forEach((r, i) => {
        if(!(r.status == 'signed')) {
          allRecipientsSigned = false
        }
      })
    }
    
    status = allRecipientsSigned ? 'signed' : 'pending_others';
    contractRequest.status = status;
    
    res.json({
      success: true,
      data: status,
      message: null
    });
    
    contractRequest.contractDocumentIds = updatedContractDocumentIds;

    await contractRequest.save();

  } else {
    res.json({
      success: true,
      data: 'not-found',
      message: null
    });
  }
});

router.post("/update-contract-approval-status", authentication.UserAuthValidateMiddleware, async (req, res) => {
  const userObj = req.user;

  const { contractId, documentId, uuid, action } = req.body;

  console.log('req.body : ', req.body, userObj);

  const contractRequest = await Contracts.findOne({
    uuid: uuid,
    company: userObj.company,
  });

  if (!contractRequest) {
    res.json({
      success: false,
      message: lang.RECORD_NOT_FOUND.PR
    });
  }

  console.log('contract request: ', contractRequest)

  const updatedContractDocumentIds = contractRequest.contractDocumentIds.map((item, index) => {
    if (item.documentId === documentId) {
      item.isApproved = action;
      console.log("IS APPROVED? SENDS", item.isApproved, action)
    }
    return item;
  });

  console.log('Updated Contract DocumentId: ', updatedContractDocumentIds)

  const updateStatus = await Contracts.findOneAndUpdate(
    {uuid: uuid},
    {contractDocumentIds: updatedContractDocumentIds},
    {new: true}
  );

  if (!updateStatus) {
    res.json({
      success: false,
      message: lang.SOMETHING_WENT_WRONG.PR
    });
  }

  res.json({
    success: true,
    message: lang.RECORD_UPDATED_SUCCESSFULLY.PR
  });

});

export default router;
