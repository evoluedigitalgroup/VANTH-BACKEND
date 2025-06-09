import express from "express";
import authentication from "../../services/authentication";
import validator from "../../validator/Dashboard";
import DocumentRequest from "../../models/documentRequest";
import lang from "../../helpers/locale/lang";
import Contacts from "../../models/Contacts";
import moment from "moment";
import DocumentFile from "../../models/documentFile";
import { twilioClientSenderSMS, twilioClientSenderWhatsApp } from "../../services/twilioSender";
import sendMail from "../../services/nodemailer";
import _ from "lodash";

const router = express.Router();

router.post(
  "/generate-document-request-link",
  authentication.UserAuthValidateMiddleware,
  validator.generateDocumentValidator,
  async (req, res) => {
    const { contactId, requestId, permission, generateLink } = req.body;

    const atLeastOneDoc = Object.keys(permission).every(key => !permission[key])   

    const filterData = await DocumentRequest.findByIdAndUpdate(
      requestId,
      { requiredPermission: permission, generateLink, isGenerated: !atLeastOneDoc },
      { new: true },
    );

    const findData = await Contacts.findById({ _id: contactId, visitor: false }).populate("documentRequest");
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
    const { search = "", status = "", start, limit } = req.body;

    let searchObj = {
      company: req.user.company,
      visitor: false
    };

    if (req.user.permissions.clients) {
      if (search) {
        const regExpression = new RegExp(search, "i");

        searchObj.name = regExpression;
      }

      if (status && status !== "all") {
        searchObj.contactApprove = status;
      }

      const count = await Contacts.find(searchObj).countDocuments();
      const clients = await Contacts.find(searchObj)
        .sort({ createdAt: -1 })
        .skip(start)
        .limit(limit)
        .exec();

      const formatDateAndTime = (date) => {
        const formattedDate = moment(date).locale("pt-br").format("DD MMM YYYY");
        const formattedTime = moment(date).locale("pt-br").format("h:mm");
        return { formattedDate, formattedTime };
      };

      const processClient = (client) => {
        const { formattedDate, formattedTime } = formatDateAndTime(client.updatedAt);

        client._doc["date"] = formattedDate;
        client._doc["time"] = formattedTime;

        return client;
      };

      const clientProcessed = _.compact(clients.map(processClient));

      res.json({
        success: true,
        data: { clients: clientProcessed, count },
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

router.post(
  "/send-links",
  async (req, res) => {
    const { type } = req.body;

    if (type === 'sms') {
      const { link, phone: number } = req.body;
      const body = `Este é seu link para enviar os documentos ${link}`;

      try {
        twilioClientSenderSMS(body, number);
      } catch (err) {
        console.log(err)
        res.json({
          success: false,
          message: 'Não foi possivel enviar o sms para o cliente!'
        })
      }

      res.json({
        success: true,
        message: 'Mensagem SMS enviada para o cliente!'
      })
    } else if (type === 'whatsapp') {
      const { link, phone: number } = req.body;
    
      twilioClientSenderWhatsApp(number, link);

      res.json({
        success: true,
        message: 'Mensagem no WhatsApp enviada para o cliente!'
      })
    } else if (type === 'email') {
      const { link, email } = req.body;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0068FF; font-size: 28px; margin-bottom: 20px;">Vanth Docs System</h1>
          <h2 style="color: #0068FF; font-size: 24px; margin-bottom: 20px;">Por favor, envie seus documentos!</h2>
          <p style="font-size: 16px;">Este email contém um link seguro da Vanth Docs System. Não compartilhe este email, link ou código de acesso com outras pessoas.</p>
          <p style="font-size: 16px;">Envie seus documentos eletronicamente em minutos. É seguro, protegido e legalmente vinculativo. Esteja você em um escritório, em casa ou em outro lugar, ou mesmo em outro país.</p>
          <p style="font-size: 16px;">Tem alguma dúvida sobre o documento? Se você precisar modificar o documento ou tiver dúvidas sobre os detalhes do documento, entre em contato com o remetente enviando um email diretamente para ele.</p>
          <p style="font-size: 16px;">Se você tiver problemas para enviar os documentos, visite a página <a href="https://vanthdocs.com.br" style="color: #0068FF; text-decoration: none;">Ajuda com a assinatura</a> em nosso Centro de suporte.</p>
          <p style="font-size: 16px;">Acesse o site <a href="https://vanthdocs.com.br" style="color: #0068FF; text-decoration: none;">vanthdocs.com.br</a>.</p>
          <p style="font-size: 16px;">Atenciosamente,<br/>Equipe Vanth Docs</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${link}" style="display: inline-block; background-color: #0068FF; color: #ffffff; font-size: 18px; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Clique aqui para enviar seus documentos!</a>
          </div>
        </div>
        `;

      try {
        sendMail(email, 'Por favor, envie seus documentos - Vanth Docs System', htmlContent)

        return res.json({
          success: true,
          message: 'O email foi enviado para o cliente!'
        })
      } catch (err) {
        return res.json({
          success: false,
          message: 'Não foi possível enviar o link para o cliente!'
        })
      }


    } else {
      return res.json({
        success: false,
        message: 'Tipo informado inválido!'
      })
    }

  }
)


export default router;
