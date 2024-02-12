import express from "express";
const router = express();
import Contact from "../../models/Contacts";
import validator from "../../validator/public";
import { v4 as uuidv4 } from "uuid";
import Document_Request from "../../models/documentRequest";
import lang from "../../helpers/locale/lang";
import documentFile from "../../models/documentFile";
import authentication from "../../services/authentication";

router.post("/submit-contact",
  authentication.UserAuthValidateMiddleware,
  validator.ValidContact, async (req, res) => {

    const { company } = req.user;

    const ConId = uuidv4();
    const Reqid = uuidv4();
    const { name, email, phone, CPF, CNPJ, otherInformation = [] } = req.body;

    const Obj = {
      uuid: ConId,
      company,
      name: name,
      phone: phone,
      email: email,
      CPF,
      CNPJ,
      docs: {},
      otherInformation
    };

    const DocumentFileData = await documentFile.find({});

    const permission = {};

    DocumentFileData.map(i => {
      permission[i.type] = false;
      Obj["docs"][i.type] = null;
    });

    console.log("permission", permission);

    await new Contact(Obj)
      .save()
      .then(async val => {
        const DocReq = {
          uuid: Reqid,
          contacts: val.id,
          requiredPermission: permission,
        };

        console.log("DocReq", DocReq);

        await new Document_Request(DocReq).save().then(async vals => {
          const contactData = await Contact.findByIdAndUpdate(
            vals.contacts,
            {
              documentRequest: vals.id,
            },
            { new: true },
          );
          res.json({
            success: true,
            data: contactData,
            message: lang.FORM_FILL_UP_SUCCESSFULLY.PR,
          });
        });
      })
      .catch(err => {
        res.json({
          success: false,
          message: lang.SOMETHING_WENT_WRONG.PR,
        });
      });
  }
);

export default router;
