import express from "express";
import Contacts from "../../models/Contacts";
import lang from "./../../helpers/locale/lang";
import authentication from "../../services/authentication";
import validator from "../../validator/Dashboard";
import moment from "moment";
import _ from "lodash";
import DocumentFile from "../../models/documentFile";
import sendMail from "../../services/nodemailer";
import { twilioClientSenderSMS, twilioClientSenderWhatsApp } from "../../services/twilioSender";
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

    if (validType) {
      if (action === "approved") {
        let docStatus = data.docStatus;

        const response = {
          url: data.docs[validType.type]?.url ? data.docs[validType.type]?.url : docStatus[validType.type],
          approved: true,
          approvedBy: userObj.id,
          approvedDate: new Date(),
        };

        docStatus = _.omit(docStatus, validType.type);

        const docs = data.docs;
        docs[validType.type] = response;

        const updateVal = await Contacts.findByIdAndUpdate(id, { docs, docStatus }).populate("documentRequest");

        const requiredDocuments = Object.keys(updateVal.documentRequest.requiredPermission)
          .filter((key) => {
            return updateVal.documentRequest.requiredPermission[key];
          });

        const isReceived = requiredDocuments.every((key) => {
          return updateVal.docs.hasOwnProperty(key) && updateVal.docs[key] !== null;
        });

        const isApproved = requiredDocuments.every((key) => {
          const isReceived = updateVal.docs.hasOwnProperty(key) && updateVal.docs[key] !== null;

          if (!isReceived) {
            return false;
          }

          const document = updateVal.docs[key];

          return document.approved;
        });

        if (isReceived && !isApproved) {
          try {
            const htmlAprove = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #0068FF; font-size: 28px; margin-bottom: 20px;">Vanth Docs System</h1>
              <h2 style="color: #0068FF; font-size: 24px; margin-bottom: 20px;">Documentos Aprovados!</h2>
              <p style="font-size: 16px;">Este e-mail é para informar que seus documentos foram aprovados.</p>
              <p style="font-size: 16px;">Estamos felizes em informar que os documentos foram revisados e aprovados com sucesso.</p>
              <p style="font-size: 16px;">Por favor, sinta-se à vontade para entrar em contato conosco caso tenha alguma dúvida ou precise de assistência adicional.</p>
              <p style="font-size: 16px;">Atenciosamente,<br />Equipe Vanth Docs</p>
            </div>`;

            const message = `Olá, ${data.name}! Seus documentos foram aprovados com sucesso!`;
            await sendMail(updateVal.email, 'Aprovação de Documentos- Vanth Docs System', htmlAprove);
            await twilioClientSenderSMS(message, updateVal.phone);
            await twilioClientSenderWhatsApp(message, updateVal.phone);
          } catch (err) {
            console.log('Erro ao enviar confirmação de documentos', err);
          }
        }

        res.json({
          success: true,
          data: updateVal,
          message: lang.SOCIAL_CONTRACT_SUCCESSFULLY.PR,
        });
      } else if (action === "reject") {
        let docStatus = data.docStatus;

        const response = {
          url: data.docs[validType.type]?.url ? data.docs[validType.type]?.url : docStatus[validType.type],
          rejected: true,
          approvedBy: userObj.id,
          approvedDate: new Date(),
        };

        docStatus = _.omit(docStatus, validType.type);

        const docs = data.docs;
        docs[validType.type] = response;

        const updateVal = await Contacts.findByIdAndUpdate(id, { docs, docStatus });

        res.json({
          success: true,
          data: updateVal,
          message: lang.SOCIAL_CONTRACT_SUCCESSFULLY.PR,
        });
      } else {
        const dataStatus = data.docStatus;

        const docs = data.docs;
        dataStatus[validType.type] = data.docs[validType.type]?.url

        docs[validType.type] = null;

        const updateVal = await Contacts.findByIdAndUpdate(
          id,
          {
            docs,
            docStatus: {
              ...dataStatus,
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
    const { start, limit, status = "all", search = "" } = req.body;
    const { company } = req.user;

    if (!req.user.permissions.document) {
      res.json({
        success: false,
        message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
      });
    }

    let filters = [
      {
        contactApprove: "approved",
      },
      {
        company,
      },
      {
        visitor: false
      }
    ];

    const contacts = await Contacts
      .find({
        $and: filters,
      })
      .populate("documentRequest")
      .sort({ id: -1 });

    const formatDateAndTime = (date) => {
      const formattedDate = moment(date).locale("pt-br").format("DD MMM YYYY");
      const formattedTime = moment(date).locale("pt-br").format("h:mm");
      return { formattedDate, formattedTime };
    };

    const processContact = (contact) => {
      const { formattedDate, formattedTime } = formatDateAndTime(contact.updatedAt);

      contact._doc["date"] = formattedDate;
      contact._doc["time"] = formattedTime;

      if (!contact.documentRequest.isGenerated) {
        contact._doc["allStatus"] = "pending";

        return contact;
      }

      const requiredDocuments = Object.keys(contact.documentRequest.requiredPermission)
        .filter((key) => {
          return contact.documentRequest.requiredPermission[key];
        });

      const isReceived = requiredDocuments.every((key) => {
        return contact.docs.hasOwnProperty(key) && contact.docs[key] !== null;
      });

      const isApproved = requiredDocuments.every((key) => {
        const isReceived = contact.docs.hasOwnProperty(key) && contact.docs[key] !== null;

        if (!isReceived) {
          return false;
        }

        const document = contact.docs[key];

        return document.approved;
      });

      const existsRejected = requiredDocuments.some((key) => {
        const isReceived = contact.docs.hasOwnProperty(key) && contact.docs[key] !== null;

        if (!isReceived) {
          return false
        }

        const document = contact.docs[key];

        return document.rejected;
      });

      if (isReceived && !isApproved) {
        contact._doc["allStatus"] = "wait-review";
      }

      if (!isReceived || existsRejected) {
        contact._doc["allStatus"] = "wait-documents";
      }

      if (isReceived && isApproved) {
        contact._doc["allStatus"] = "approved";
      }

      return contact;
    };

    const contactsProcessed = _.compact(contacts.map(processContact));

    const contactsFiltered = contactsProcessed.filter((contact) => {
      const searchMatch = search ? contact.name.toLowerCase().includes(search.toLowerCase()) : true;

      const statusMatch = status === "all" || contact._doc.allStatus === status;

      return searchMatch && statusMatch;
    });

    const count = contactsFiltered.length;

    const contactsPaginated = contactsFiltered.slice(start, start + limit);

    res.json({
      success: true,
      data: {
        contacts: contactsPaginated,
        count,
      },
      message: lang.RECORD_FOUND.PR,
    });
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

router.post('/remove-document-type',
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
    const { key, title } = req.body;

    try {
      const keyExist = await DocumentFile.findOne({ type: key, company: req.user.company });
      const documentFileSize = DocumentFile.countDocuments({ company: req.user.company })

      if (documentFileSize <= 1) {
        return res.json({
          success: true,
          data: null,
          message: 'Você não pode remover mais items!'
        });
      }

      if (keyExist) {
        const deletedDocument = await DocumentFile.findOneAndDelete({ type: key, company: req.user.company });

        return res.json({
          success: true,
          data: deletedDocument,
          message: lang.DOCUMENT_TYPE_REMOVED.PR
        });
      } else {
        return res.json({
          success: false,
          data: null,
          message: lang.DOCUMENT_TYPE_NOT_FOUND.PR
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        data: null,
        message: 'Internal Server Error'
      });
    }
  }
);



export default router;
