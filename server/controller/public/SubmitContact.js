import express from "express";
const router = express();
import Contact from "../../models/Contacts";
import validator from "../../validator/public";
import { v4 as uuidv4 } from "uuid";
import Document_Request from "../../models/documentRequest";
import lang from "../../helpers/locale/lang";

router.post("/submit-contact", validator.ValidContact, async (req, res) => {
  const ConId = uuidv4();
  const Reqid = uuidv4();
  const { name, emailOrPhone, CPF, CNPJ } = req.body;
  // if (("" + emailOrPhone).includes("@")) {
  //   const Obj = {
  //     uuid: ConId,
  //     name: name,
  //     email: emailOrPhone.toLowerCase().trim(),
  //     CPF,
  //     CNPJ,
  //   };
  //   const permission = {
  //     CPF: true,
  //     socialContract: true,
  //     addressProof: true,
  //     CNPJ: true,
  //     balanceIncome: true,
  //     balanceSheet: true,
  //     partnerIncome: true,
  //     billingCustomer: true,
  //     partnerDocument: true,
  //     updatedBankDebt: true,
  //     spouseDocument: true,
  //     extractBusiestBank: true,
  //     companyPhotos: true,
  //     abcCurve: true,
  //   };
  //   await new Contact(Obj)
  //     .save()
  //     .then(async val => {
  //       const DocReq = {
  //         uuid: Reqid,
  //         contacts: val.id,
  //         requiredPermission: permission,
  //       };
  //       res.json({
  //         success: true,
  //         data: val,
  //         message: lang.FORM_FILL_UP_SUCCESSFULLY.PR,
  //       });
  //       await new Document_Request(DocReq).save().then(async vals => {
  //         await Contact.findByIdAndUpdate(
  //           vals.contacts,
  //           {
  //             documentRequest: vals.id,
  //           },
  //           { new: true },
  //         );
  //       });
  //     })
  //     .catch(err => {
  //       res.json({
  //         success: false,
  //         message: lang.SOMETHING_WENT_WRONG.PR,
  //       });
  //     })
  //     .catch(err => {
  //       res.json({
  //         success: false,
  //         message: lang.SOMETHING_WENT_WRONG.PR,
  //       });
  //     });
  // }

  const Obj = {
    uuid: ConId,
    name: name,
    phone: emailOrPhone,
    CPF,
    CNPJ,
  };

  const permission = {
    CPFDOC: false,
    socialContract: false,
    addressProof: false,
    CNPJDOC: false,
    balanceIncome: false,
    balanceSheet: false,
    partnerIncome: false,
    billingCustomer: false,
    partnerDocument: false,
    updatedBankDebt: false,
    spouseDocument: false,
    extractBusiestBank: false,
    companyPhotos: false,
    abcCurve: false,
  };

  await new Contact(Obj)
    .save()
    .then(async val => {
      const DocReq = {
        uuid: Reqid,
        contacts: val.id,
        requiredPermission: permission,
      };

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
});
// {
//     "name": "John Doe",
//     "emailOrPhone": "9876543210", // OR abc@def.com
//     "cpfOrCnpj": "413.814.666-05"   // Generate it at https://www.freetool.dev/cpf-generator-validator
// }
export default router;
