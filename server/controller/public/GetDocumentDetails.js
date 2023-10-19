import express from "express";
const router = express();
import Contacts from "../../models/Contacts";
import validator from "../../validator/public/";
import lang from "../../helpers/locale/lang";

router.post("/get-document-details", validator.ValidId, async (req, res) => {
  const { contactId, requestId } = req.body;
  const contactDetails = await Contacts.findOne({
    _id: contactId,
    documentRequest: requestId,
  }).populate("documentRequest");

  if (contactDetails) {
    const response = {
      ...contactDetails._doc,
      ...contactDetails.documentRequest._doc,
      documentRequest: contactDetails.documentRequest.id,
      id: contactDetails.id,
      uuidOfContact: contactDetails.uuid,
      uuidOfRequestDoc: contactDetails.documentRequest.uuid,
    };

    // delete response.documentRequest;
    delete response.contacts;
    delete response._id;
    delete response.__v;
    delete response.uuid;

    // .then(() => {
    res.json({
      success: true,
      data: response,
      message: lang.RECORD_FOUND.PR,
    });
    // })
    // .catch(err => {
    //   res.json({
    //     success: false,
    //     data: null,
    //     message: lang.RECORD_NOT_FOUND.PR,
    //   });
    // });
    // .then(val => {
    //   const { name, email, phone, cpfOrCnpj, SocialContract, AddressProof } =
    //     val;
    //   res.json({
    //     success: true,
    //     data: {
    //       name: name,
    //       email: email,
    //       phone: phone,
    //       cpfOrCnpj: cpfOrCnpj,
    //       SocialContract: SocialContract,
    //       AddressProof: AddressProof,
    //     },
    //     message: lang.RECORD_FOUND.PR,
    //   });
    // })
    // .catch(err => {
    //   res.json({
    //     success: false,
    //     data: null,
    //     message: lang.RECORD_NOT_FOUND.PR,
    //   });
    // });
  }
});

export default router;
