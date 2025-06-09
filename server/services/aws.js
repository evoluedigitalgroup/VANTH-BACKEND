import aws from "aws-sdk";
import fs from "fs";
import path from "path";
import config from "../config";
import utility from "../helpers/utility";

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

const calculateFileSizeCreated = async (company, startDate, endDate) => {

  const startDateValue = new Date(startDate);
  const endDateValue = new Date(endDate);

  const fromDate = startDateValue;
  const toDate = endDateValue;


  console.log("fromDate : ", fromDate);
  console.log("toDate : ", toDate);

  const params = {
    Bucket: config.aws.bucketName,
    Prefix: company,
  };

  const objects = await s3.listObjectsV2(params).promise();

  const filteredObjects = objects.Contents.filter(obj => {
    const lastModified = new Date(obj.LastModified);
    return lastModified >= fromDate && lastModified <= toDate;
  });

  const totalSize = filteredObjects.reduce((acc, obj) => acc + obj.Size, 0);

  const humanReadableSize = utility.bytesToSizeMB(totalSize);

  return humanReadableSize;
};

export default {
  uploadFile,
  deleteFile,
  calculateFileSizeCreated
};
