import aws from "aws-sdk";
import fs from "fs";
import path from "path";
import config from "../config";

aws.config.update({
  secretAccessKey: config.aws.secretAccessKey,
  accessKeyId: config.aws.accessKeyId,
  region: config.aws.awsRegion,
});

const s3 = new aws.S3();

const uploadFile = (fileNameInFolder, fileNameSave) => {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(
      path.resolve("public", "temp", fileNameInFolder),
    );
    s3.upload(
      {
        Bucket: config.aws.bucketName,
        Key: fileNameSave,
        Body: fileContent,
        // ACL: "public-read",
      },
      (err, data) => {
        console.log("err : ", err);
        if (err) {
          reject(err);
        }
        resolve(data);
      },
    );
  });
};

const deleteFile = fileName => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(
      { Bucket: config.aws.bucketName, Key: fileName },
      (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      },
    );
  });
};

export default {
  uploadFile,
  deleteFile,
};
