import axios from "axios";
import express from "express";
import mongoose from "mongoose";
import multiparty from "multiparty";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import config from "../../config";
import { generateUrlPdfToBase64 } from "../../helpers/base64helper";
import utility from "../../helpers/utility";
import Contacts from "../../models/Contacts";
import Contracts from "../../models/Contracts";
import ContractTemplates from "../../models/contractTemplates";
import authentication from "../../services/authentication";
import aws from "../../services/aws";
import sendMail from "../../services/nodemailer";
import {
  twilioClientSenderSMS,
  twilioClientSenderWhatsApp,
} from "../../services/twilioSender";
import { getContractDetail } from "../../services/zapsign";
import lang from "./../../helpers/locale/lang";

const awsUploadFile = aws.uploadFile;

const router = express();

router.post(
  "/filter-contracts",
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
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

      const contactIds = contactsData.map(item =>
        mongoose.Types.ObjectId(item._id),
      );

      const filter = {
        recipient: {
          $in: contactIds,
        },
      };

      const totalFindData = await Contracts.find(filter).countDocuments();
      const findData = await Contracts.find(filter)
        .populate("recipient")
        .populate("contractDocumentIds.template")
        .sort({ _id: -1 })
        .skip(startFrom)
        .limit(totalFetchRecords);

      const findDataWithSignedUrl = await Promise.all(
        findData.map(async (item, index) => {
          try {
            const signedFileUrl = await getContractDetail(
              item.signatureEnvelopeId,
            );
            return {
              ...item._doc,
              signedDocumentUrl: signedFileUrl.signed_file + "&locale=pt_BR",
            };
          } catch (error) {
            console.log("Error fetching signed document URL:", error);
            return item;
          }
        }),
      );

      const countItemsWithSignedUrl = findDataWithSignedUrl.reduce(
        (acc, item) => {
          if (item.signedDocumentUrl) {
            acc++;
          }
          return acc;
        },
        0,
      );

      res.json({
        success: true,
        data: {
          findData: findDataWithSignedUrl,
          totalFindData,
          countItemsWithSignedUrl,
        },
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
  "/create-template",
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
    const form = new multiparty.Form();

    const { id, company } = req.user;

    form.parse(req, async (err, fields, files) => {
      const contact = fields.user[0];
      const originalFileName = fields.originalFileName[0];
      const templateSchema = fields.schema[0]
        ? JSON.parse(fields.schema[0])
        : null;
      const contractPreviewFile = files.previewFile[0];
      const contractUsableFile = files.usableFile[0];
      const contractOriginalFile = files.originalFile[0];

      const contractPreviewFilename =
        uuidv4() +
        "-" +
        Date.now() +
        "-" +
        contractPreviewFile.originalFilename;
      const contractUsableFilename =
        uuidv4() + "-" + Date.now() + "-" + contractUsableFile.originalFilename;
      const contractOriginalFilename =
        uuidv4() +
        "-" +
        Date.now() +
        "-" +
        contractOriginalFile.originalFilename;

      const previewPathToTempFile = path.resolve(
        "public",
        "temp",
        contractPreviewFilename,
      );
      const usablePathToTempFile = path.resolve(
        "public",
        "temp",
        contractUsableFilename,
      );
      const originalPathToTempFile = path.resolve(
        "public",
        "temp",
        contractOriginalFilename,
      );
      const originalPathToTempFileImg = path.resolve(
        "public",
        "temp",
        contractOriginalFilename + ".png",
      );

      //  Upload preview file to temp folder
      const uploadPreviewFile = await utility.uploadFile(
        files,
        "previewFile",
        previewPathToTempFile,
      );

      if (!uploadPreviewFile) {
        res.json({
          success: true,
          data: null,
          message: lang.SOMETHING_WENT_WRONG.PR,
        });
      }

      //  Upload preview file to aws folder
      const previewFileAwsRecord = await awsUploadFile(
        previewPathToTempFile,
        `${company}/contract-templates/${id}/${contractPreviewFilename}`,
      );

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
      const uploadUsableFile = await utility.uploadFile(
        files,
        "usableFile",
        usablePathToTempFile,
      );

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
      );

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
      const uploadOriginalFile = await utility.uploadFile(
        files,
        "originalFile",
        originalPathToTempFile,
      );

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
      );

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
        templatePreviewImageFile:
          "https://fastly.picsum.photos/id/180/367/267.jpg?hmac=XAmHD3CeF1SZodNhSTtrCVFsSUnlee5bjFyJsrqxyCM",
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
  },
);

router.post(
  "/get-templates",
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
    const { id, company } = req.user;

    const getTemplates = await ContractTemplates.find({
      company,
      user: id,
      isDeleted: false,
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
  },
);

router.post(
  "/create-contract",
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
    try {
      const { id, company } = req.user;
      const { selectedTemplates, selectedContacts, visitorsBody } = req.body;

      if (visitorsBody) {
        const visitors = visitorsBody.map(async visitor => {
          let obj = {
            uuid: uuidv4(),
            company: company,
            name: visitor.name,
            email: visitor.email,
            phone: "",
            visitor: true,
            contactApprove: "approved",
          };

          const newVisitor = await new Contacts(obj).save();
          selectedContacts.push(newVisitor._id);

          return newVisitor._id;
        });
        const resolvedVisitors = await Promise.all(visitors);
      }
      const contactPromises = selectedContacts.map(item =>
        Contacts.findById(item),
      );
      const contactDetailsList = await Promise.all(contactPromises);

      //  Finding the selected contract templates

      const templates = await ContractTemplates.find({
        _id: {
          $in: selectedTemplates,
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
          recipientId,
        });

        templateBase64Data.push({
          documentId,
          recipientId,
          documentBase64: base64Data,
          name: obj.originalFileName,
          uuid: obj.uuid,
          id: obj.id,
        });
      }

      contractRequest.contractDocumentIds = contractDocumentIds;
      await contractRequest.save();
      // TODO Send doc to sign and send e-mail.
      //Mapear dados e enviar para ZapSign
      const redirectLink = `${config.contract_host}/requested-signature/${contractRequest?.company}/${contractRequest?.uuid}`;
      const signers = contactDetailsList.map(contact => ({
        name: contact.name,
        email: contact.email,
        send_automatic_email: true,
        send_automatic_whatsapp: false,
        external_id: contact.uuid,
        phone_country: "55",
        phone_number: contact.phone,
        cpf: contact.CPF || "",
        require_selfie_photo: false,
        require_document_photo: false,
      }));

      const zapSignPayload = {
        name: templates[0].originalFileName,
        url_pdf: templates[0].templateFile, // Assumindo que o primeiro PDF é o principal
        external_id: contractRequest.uuid,
        signers: signers,
        lang: "pt-br",
        disable_signer_emails: false,
        brand_logo: "https://vanthdocs.com.br/logo.png",
        brand_primary_color: "#0068ff",
        brand_name: "Vanth Docs System",
        folder_path: "/",
        date_limit_to_sign: null,
        signature_order_active: false,
        observers: [], // Caso queira incluir observadores
        reminder_every_n_days: 0,
        allow_refuse_signature: false,
        disable_signers_get_original_file: false,
      };

      // Enviar requisição para ZapSign
      const zapSignResponse = await axios.post(
        config.zapsignUrl + "docs/",
        zapSignPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + config.zapsignToken,
          },
        },
      );

      // Atualizar contrato com os dados da ZapSign
      contractRequest.verifier = uuidv4();
      contractRequest.ableToSign = selectedContacts[0];
      contractRequest.signatureEnvelopeId = zapSignResponse.data?.token;
      contractRequest.signatureProviderData = zapSignResponse.data;
      await contractRequest.save();

      res.json({
        success: true,
        data: contractRequest,
        contacts: contactDetailsList,
        message: "Contract request generated successfully",
      });
    } catch (error) {
      console.log("Error creating contract:", error);

      res.json({
        success: false,
        data: null,
        message: "Something went wrong",
      });
    }
  },
);

router.post("/get-contract-details", async (req, res) => {
  const { companyId, contractId, signatureEnvelopeId, recipientViwer } =
    req.body;

  const contractRequest = await Contracts.findOne({
    company: companyId,
    uuid: contractId,
    signatureEnvelopeId,
  })
    .populate("company")
    .populate("recipient");

  if (
    contractRequest.status === "signed" ||
    contractRequest.status === "rejected"
  ) {
    res.json({
      success: true,
      data: contractRequest,
      message: null,
    });
  } else {
    const returnUrl = `${config.frontendUrl}/contract/signed-document/return-url`;

    const args = {};
    args.dsReturnUrl = `${returnUrl}?requestId=${contractRequest.uuid}&contractIdentifier=${contractRequest.identifier}&verifier=${contractRequest.verifier}&recipientViwer=${recipientViwer}`;

    let signerEmail = null;
    let signerName = null;
    let signerClientId = null;

    const matchingRecipient = contractRequest.recipient.find(
      contact => contact.id == recipientViwer,
    );

    if (matchingRecipient) {
      signerEmail = matchingRecipient.email;
      signerName = matchingRecipient.name;
      signerClientId = matchingRecipient.uuid;
    }

    args.signerEmail = signerEmail;
    args.signerName = signerName;
    args.signerClientId = signerClientId;

    args.envelopeId = contractRequest.signatureEnvelopeId;

    // TODO get URL from signed document
    const results = await getContractDetail(
      contractRequest.signatureEnvelopeId,
    );

    const returnData = {
      results,
      ...contractRequest._doc,
    };
    // valid link only for 60 min.
    returnData.signedDocumentUrl = results.signed_file + "&locale=pt_BR";

    res.json({
      success: true,
      data: returnData,
      message: null,
    });
  }
});
router.post("/receive-webhook-zapsign", async (req, res) => {
  try {
    const queryData = req.body;
    const external_id = queryData["external_id"];
    const event = queryData["event_type"];
    const zapsig_status = queryData["status"];
    let status = zapsig_status;
    if (event === "doc_refused" || event === "email_bounce") {
      status = "rejected";
    }
    if (external_id) {
      const contractRequest = await Contracts.findOne({ uuid: external_id });
      if (contractRequest) {
        contractRequest.status = status;
        await contractRequest.save();
        res.json({
          success: true,
          data: status,
          message: "It`s all right",
        });
      } else {
        res.status(404).json("I dont have that external_id");
      }
    } else {
      res.status(404).json("I dont have that external_id");
    }
  } catch (error) {
    res.status(500).json("Internal server error");
  }
});

router.post("/update-contract-status", async (req, res) => {
  const { query } = req.body;
  const queryData = new URLSearchParams(query);
  const requestId = queryData.get("requestId");

  const contractIdentifier = queryData.get("contractIdentifier");

  const verifier = queryData.get("verifier");

  const event = queryData.get("event");

  const recipientViwer = queryData.get("recipientViwer");

  let status =
    event === "signing_complete" || event === "viewing_complete"
      ? "signed"
      : "rejected";

  const contractRequest = await Contracts.findOne({
    uuid: requestId,
    identifier: contractIdentifier,
    verifier,
  }).populate("contractDocumentIds.template");

  if (contractRequest) {
    const updatedContractDocumentIds = [];

    for (let i = 0; i < contractRequest.contractDocumentIds.length; i++) {
      const doc = contractRequest.contractDocumentIds[i];
      // TODO get signed documents
      const signedFileUrl = await getContractDetail(
        contractRequest.signatureEnvelopeId,
      );
      contractRequest.status = signedFileUrl.status;
      updatedContractDocumentIds.push({
        ...doc,
        signedDocument: signedFileUrl.signed_file,
      });
    }

    let allRecipientsSigned = true;
    let recipientFound = false;

    // 'signed' is the correct status!
    contractRequest.recipientsStatus.forEach((r, i) => {
      if (r.recipient === recipientViwer) {
        recipientFound = true;
        if (r.status !== "signed") {
          allRecipientsSigned = false;
        }
      }
    });

    if (!recipientFound) {
      allRecipientsSigned = false;
    }

    const updatedRecipientsStatus = [...contractRequest.recipientsStatus];

    const recipientIndex = updatedRecipientsStatus.findIndex(
      recipient => recipient.recipient === recipientViwer,
    );

    if (recipientIndex !== -1) {
      updatedRecipientsStatus[recipientIndex].status = status;
    } else {
      updatedRecipientsStatus.push({
        recipient: recipientViwer,
        status: status,
      });
    }

    contractRequest.recipientsStatus = updatedRecipientsStatus;

    if (contractRequest.ableToSign == recipientViwer) {
      contractRequest.recipientsStatus.forEach((item, i) => {
        if (item.status == "pending") {
          contractRequest.ableToSign = item.recipient;
          return;
        }
      });
    }

    if (
      contractRequest.recipientsStatus.length !==
      contractRequest.recipient.length
    ) {
      allRecipientsSigned = false;
    } else {
      allRecipientsSigned = true;

      contractRequest.recipientsStatus.forEach((r, i) => {
        if (!(r.status == "signed")) {
          allRecipientsSigned = false;
        }
      });
    }

    status = allRecipientsSigned ? "signed" : "pending_others";
    contractRequest.status = status;

    res.json({
      success: true,
      data: status,
      message: null,
    });

    contractRequest.contractDocumentIds = updatedContractDocumentIds;

    await contractRequest.save();
  } else {
    res.json({
      success: true,
      data: "not-found",
      message: null,
    });
  }
});

// TODO verify this flow, it`s bad idea and complex
router.post(
  "/update-contract-approval-status",
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
    const htmlAprove = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #0068FF; font-size: 28px; margin-bottom: 20px;">Vanth Docs System</h1>
    <h2 style="color: #0068FF; font-size: 24px; margin-bottom: 20px;">Contrato Aprovado!</h2>
    <p style="font-size: 16px;">Este email é para informar que seu contrato foi aprovado com sucesso.</p>
    <p style="font-size: 16px;">Agora você pode acessar o documento assinado em nossa plataforma.</p>
    <p style="font-size: 16px;">Se você tiver alguma dúvida ou precisar de assistência adicional, entre em contato conosco respondendo a este email.</p>
    <p style="font-size: 16px;">Atenciosamente,<br/>Equipe Vanth Docs</p>
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://vanthdocs.com.br" style="display: inline-block; background-color: #0068FF; color: #ffffff; font-size: 18px; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Acessar Documento Assinado</a>
    </div>
  </div>
  `;

    const htmlReject = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #0068FF; font-size: 28px; margin-bottom: 20px;">Vanth Docs System</h1>
    <h2 style="color: #0068FF; font-size: 24px; margin-bottom: 20px;">Contrato Negado!</h2>
    <p style="font-size: 16px;">Este email é para informar que seu contrato foi negado.</p>
    <p style="font-size: 16px;">Se necessário, entre em contato conosco para discutir os motivos da negação ou para fazer alterações no documento.</p>
    <p style="font-size: 16px;">Atenciosamente,<br/>Equipe Vanth Docs</p>
  </div>
  `;

    const userObj = req.user;
    const { documentId, uuid, action } = req.body;

    const contractRequest = await Contracts.findOne({
      uuid: uuid,
      company: userObj.company,
    }).populate("recipient");

    const signerEmail = contractRequest.recipient[0].email;
    const signerPhone = contractRequest.recipient[0].phone;

    if (!contractRequest) {
      res.json({
        success: false,
        message: lang.RECORD_NOT_FOUND.PR,
      });
    }

    const updatedContractDocumentIds = contractRequest.contractDocumentIds.map(
      (item, index) => {
        if (item.documentId === documentId) {
          item.isApproved = action;
        }
        return item;
      },
    );

    const updateStatus = await Contracts.findOneAndUpdate(
      { uuid: uuid },
      { contractDocumentIds: updatedContractDocumentIds },
      { new: true },
    );

    if (!updateStatus) {
      res.json({
        success: false,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }
    const mensagem =
      "O contrato foi aceito com sucesso. A assinatura foi validada pelo sistema Vanth Docs. Obrigado por confiar em nossos serviços.";
    if (updateStatus.contractDocumentIds[0].isApproved === "approved") {
      try {
        await sendMail(
          signerEmail,
          "Status de Aprovação do Contrato - Vanth Docs System",
          htmlAprove,
        );
        await twilioClientSenderSMS(mensagem, signerPhone);
        await twilioClientSenderWhatsApp(mensagem, signerPhone);
      } catch (err) {
        console.log(err);
      }
    } else if (updateStatus.contractDocumentIds[0].isApproved === "reproved") {
      try {
        await sendMail(
          signerEmail,
          "Status de Aprovação do Contrato - Vanth Docs System",
          htmlReject,
        );
        await twilioClientSenderSMS(mensagem, signerPhone);
        await twilioClientSenderWhatsApp(mensagem, signerPhone);
      } catch (err) {
        console.log(err);
      }
    }

    res.json({
      success: true,
      message: lang.RECORD_UPDATED_SUCCESSFULLY.PR,
    });
  },
);

export default router;
