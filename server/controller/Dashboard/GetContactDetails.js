import express from "express";
const router = express();
import validator from "../../validator/public/";
import lang from "../../helpers/locale/lang";
import authentication from "../../services/authentication";

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
export default router;
