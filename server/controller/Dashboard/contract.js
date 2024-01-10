import express from "express";
import multiparty from "multiparty";
import { v4 as uuidv4 } from "uuid";
import Contacts from "../../models/Contacts";
import validator from "../../validator/public/";
import lang from "./../../helpers/locale/lang";
import utility from "../../helpers/utility";
import aws from "../../services/aws";
import path from "path";
import DocumentFile from "../../models/documentFile";
import authentication from "../../services/authentication";
import ContractTemplates from "../../models/contractTemplates";

const awsUploadFile = aws.uploadFile;

const router = express();

router.post("/create-contract", authentication.UserAuthValidateMiddleware, async (req, res) => {
  const form = new multiparty.Form();

  const { id, company } = req.user;

  console.log('id : ', id);

  form.parse(req, async (err, fields, files) => {
    const contact = fields.user[0];
    const originalFileName = fields.originalFileName[0];
    const templateSchema = fields.schema[0] ? JSON.parse(fields.schema[0]) : null;
    const contractPreviewFile = fields.previewFile[0];
    const contractUsableFile = fields.usableFile[0];


    const contractPreviewFilename = contact + '-' + '-' + Date.now() + '-' + contractPreviewFile.originalFilename;
    const contractUsableFilename = contact + '-' + '-' + Date.now() + '-' + contractUsableFile.originalFilename;

    const previewPathToTempFile = path.resolve("public", "temp", contractPreviewFilename);
    const usablePathToTempFile = path.resolve("public", "temp", contractUsableFilename);

    const uploadPreviewFile = await utility.uploadFile(files, "previewFile", previewPathToTempFile)

    if (!uploadPreviewFile) {
      res.json({
        success: true,
        data: null,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }

    const previewFileAwsRecord = await awsUploadFile(
      previewPathToTempFile,
      `contract-templates/${id}/${previewPathToTempFile}`,
    )

    if (!previewFileAwsRecord.Location) {
      res.json({
        success: true,
        data: null,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }
    await utility.deleteImage(previewPathToTempFile);

    const uploadUsableFile = await utility.uploadFile(files, "usableFile", usablePathToTempFile)

    if (!uploadUsableFile) {
      res.json({
        success: true,
        data: null,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }
    const usableFileAwsRecord = await awsUploadFile(
      usablePathToTempFile,
      `contract-templates/${id}/${usablePathToTempFile}`,
    )

    if (!usableFileAwsRecord.Location) {
      res.json({
        success: true,
        data: null,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }

    await utility.deleteImage(usablePathToTempFile);

    const createTemplate = await ContractTemplates.create({
      uuid: uuidv4(),
      company,
      user: id,
      originalFileName,
      templateSchema,
      templatePreviewFile: previewFileAwsRecord.Location,
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

export default router;
