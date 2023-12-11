import express from "express";
import multiparty from "multiparty";
import Contacts from "../../models/Contacts";
import validator from "../../validator/public/";
import lang from "./../../helpers/locale/lang";
import utility from "../../helpers/utility";
import aws from "../../services/aws";
import path from "path";
import DocumentFile from "../../models/documentFile";

const awsUploadFile = aws.uploadFile;

const router = express();

router.post("/submit-documents", async (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    console.log("fields", fields);
    console.log("files", files);

    const id = fields["id"][0];
    const socialContract = Array.isArray(files?.socialContract)
      ? files["socialContract"][0]
      : null;
    // const addressProof = Array.isArray(files?.addressProof)
    //   ? files["addressProof"][0]
    //   : null;
    // let type = fields["type"][0];

    if (id) {
      const imageName =
        Date.now().toString() + files.socialContract[0].originalFilename;

      const pathToTempFile = path.resolve("public", "temp", imageName);

      utility
        .uploadFile(files, "socialContract", pathToTempFile)
        .then(async upload => {
          const fileNameInStamp = imageName;
          if (upload) {
            awsUploadFile(
              fileNameInStamp,
              `social-contract/${id}/${imageName}`,
            ).then(awsRec => {
              if (awsRec.Location) {
                utility.deleteImage(pathToTempFile).then(async () => {
                  const data = { url: awsRec.Location, approved: false };
                  const submitData = await Contacts.findByIdAndUpdate(
                    id,
                    {
                      socialContract: data,
                    },
                    { new: true },
                  );

                  res.json({
                    success: true,
                    data: null,
                    message: lang.ATTACHMENT_ADDED.PR,
                  });
                });
              } else {
                res.json({
                  success: false,
                  message: lang.WRONG_ATTACHMENT.PR,
                });
              }
            });
          } else {
            res.json({
              success: false,
              message: lang.WRONG_ATTACHMENT.PR,
            });
          }
        });
      //  else {
      //   const imageName =
      //     Date.now().toString() + files.addressProof[0].originalFilename;

      //   const pathToTempFile = path.resolve("public", "temp", imageName);

      //   utility
      //     .uploadFile(files, "addressProof", pathToTempFile)
      //     .then(async upload => {
      //       const fileNameInStamp = imageName;
      //       if (upload) {
      //         awsUploadFile(
      //           fileNameInStamp,
      //           `address-proof/${id}/${imageName}`,
      //         ).then(awsRec => {
      //           if (awsRec.Location) {
      //             utility.deleteImage(pathToTempFile).then(async () => {
      //               const data = { url: awsRec.Location, approved: false };
      //               const submitData = await Contacts.findByIdAndUpdate(
      //                 id,
      //                 {
      //                   addressProof: data,
      //                 },
      //                 { new: true },
      //               );

      //               res.json({
      //                 success: true,
      //                 data: null,
      //                 message: lang.ATTACHMENT_ADDED.PR,
      //               });
      //             });
      //           } else {
      //             res.json({
      //               success: false,
      //               message: lang.WRONG_ATTACHMENT.PR,
      //             });
      //           }
      //         });
      //       } else {
      //         res.json({
      //           success: false,
      //           message: lang.WRONG_ATTACHMENT.PR,
      //         });
      //       }
      //     });
      // }
    } else {
      res.json({
        success: false,
        message: lang.PLEASE_SELECT_PROPER_USER.PR,
      });
    }
  });
});

router.post("/address-proof", async (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    console.log("fields", fields);
    console.log("files", files);

    const id = fields["id"][0];

    const addressProof = Array.isArray(files?.addressProof)
      ? files["addressProof"][0]
      : null;

    if (id) {
      // const imageName =
      //   Date.now().toString() + files.socialContract[0].originalFilename;

      // const pathToTempFile = path.resolve("public", "temp", imageName);

      // utility
      //   .uploadFile(files, "socialContract", pathToTempFile)
      //   .then(async upload => {
      //     const fileNameInStamp = imageName;
      //     if (upload) {
      //       awsUploadFile(
      //         fileNameInStamp,
      //         `social-contract/${id}/${imageName}`,
      //       ).then(awsRec => {
      //         if (awsRec.Location) {
      //           utility.deleteImage(pathToTempFile).then(async () => {
      //             const data = { url: awsRec.Location, approved: false };
      //             const submitData = await Contacts.findByIdAndUpdate(
      //               id,
      //               {
      //                 socialContract: data,
      //               },
      //               { new: true },
      //             );

      //             res.json({
      //               success: true,
      //               data: null,
      //               message: lang.ATTACHMENT_ADDED.PR,
      //             });
      //           });
      //         } else {
      //           res.json({
      //             success: false,
      //             message: lang.WRONG_ATTACHMENT.PR,
      //           });
      //         }
      //       });
      //     } else {
      //       res.json({
      //         success: false,
      //         message: lang.WRONG_ATTACHMENT.PR,
      //       });
      //     }
      //   });
      //  else {
      const imageName =
        Date.now().toString() + files.addressProof[0].originalFilename;

      const pathToTempFile = path.resolve("public", "temp", imageName);

      utility
        .uploadFile(files, "addressProof", pathToTempFile)
        .then(async upload => {
          const fileNameInStamp = imageName;
          if (upload) {
            awsUploadFile(
              fileNameInStamp,
              `address-proof/${id}/${imageName}`,
            ).then(awsRec => {
              if (awsRec.Location) {
                utility.deleteImage(pathToTempFile).then(async () => {
                  const data = { url: awsRec.Location, approved: false };
                  const submitData = await Contacts.findByIdAndUpdate(
                    id,
                    {
                      addressProof: data,
                    },
                    { new: true },
                  );

                  res.json({
                    success: true,
                    data: null,
                    message: lang.ATTACHMENT_ADDED.PR,
                  });
                });
              } else {
                res.json({
                  success: false,
                  message: lang.WRONG_ATTACHMENT.PR,
                });
              }
            });
          } else {
            res.json({
              success: false,
              message: lang.WRONG_ATTACHMENT.PR,
            });
          }
        });
      // }
    } else {
      res.json({
        success: false,
        message: lang.PLEASE_SELECT_PROPER_USER.PR,
      });
    }
  });
});

router.post("/attachment-document", async (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    console.log("fields", fields);
    console.log("files", files);

    const id = fields["id"][0];
    const type = fields["type"][0];

    const addressProof = Array.isArray(files?.addressProof)
      ? files["addressProof"][0]
      : null;

    const validContactData = await Contacts.findById({ _id: id });

    const documentType = await DocumentFile.find({});

    console.log("type", type);

    const validType = documentType.find(i => i.type === type);
    console.log("validType", validType.type);

    if (id) {
      if (validContactData !== null) {
        if (validType) {
          const imageName =
            Date.now().toString() + files.addressProof[0].originalFilename;

          const pathToTempFile = path.resolve("public", "temp", imageName);

          utility
            .uploadFile(files, "addressProof", pathToTempFile)
            .then(async upload => {
              const fileNameInStamp = imageName;
              if (upload) {
                awsUploadFile(
                  fileNameInStamp,
                  `${validType.type}/${id}/${imageName}`,
                ).then(awsRec => {
                  if (awsRec.Location) {
                    utility.deleteImage(pathToTempFile).then(async () => {
                      const data = { url: awsRec.Location, approved: false };
                      console.log("data", data);

                      const contactFound = await Contacts.findById(id);
                      contactFound.docs[validType.type] = data;
                      const updatedContact = await Contacts.findByIdAndUpdate(
                        id,
                        contactFound,
                        { new: true },
                      );

                      res.json({
                        success: true,
                        data: null,
                        message: lang.ATTACHMENT_ADDED.PR,
                      });
                    });
                  } else {
                    res.json({
                      success: false,
                      message: lang.WRONG_ATTACHMENT.PR,
                    });
                  }
                });
              } else {
                res.json({
                  success: false,
                  message: lang.WRONG_ATTACHMENT.PR,
                });
              }
            });
          // }
        } else {
          res.json({
            success: false,
            message: lang.TYPE_IS_INVALID.PR,
          });
        }
      } else {
        res.json({
          success: false,
          message: lang.DATA_NOT_FOUND.PR,
        });
      }
      // const imageName =
      //   Date.now().toString() + files.socialContract[0].originalFilename;

      // const pathToTempFile = path.resolve("public", "temp", imageName);

      // utility
      //   .uploadFile(files, "socialContract", pathToTempFile)
      //   .then(async upload => {
      //     const fileNameInStamp = imageName;
      //     if (upload) {
      //       awsUploadFile(
      //         fileNameInStamp,
      //         `social-contract/${id}/${imageName}`,
      //       ).then(awsRec => {
      //         if (awsRec.Location) {
      //           utility.deleteImage(pathToTempFile).then(async () => {
      //             const data = { url: awsRec.Location, approved: false };
      //             const submitData = await Contacts.findByIdAndUpdate(
      //               id,
      //               {
      //                 socialContract: data,
      //               },
      //               { new: true },
      //             );

      //             res.json({
      //               success: true,
      //               data: null,
      //               message: lang.ATTACHMENT_ADDED.PR,
      //             });
      //           });
      //         } else {
      //           res.json({
      //             success: false,
      //             message: lang.WRONG_ATTACHMENT.PR,
      //           });
      //         }
      //       });
      //     } else {
      //       res.json({
      //         success: false,
      //         message: lang.WRONG_ATTACHMENT.PR,
      //       });
      //     }
      //   });
      //  else {
    } else {
      res.json({
        success: false,
        message: lang.PLEASE_SELECT_PROPER_USER.PR,
      });
    }
  });
});
export default router;
