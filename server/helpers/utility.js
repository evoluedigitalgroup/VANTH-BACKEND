import mongoose from "mongoose";
import fs from "fs";
import request from "request";
import moment from "moment";

const timer = () => {
  const SECOND = 1000;
  const SECOND_5 = 5000;
  const MINUTE = SECOND * 60;
  const MINUTE_5 = MINUTE * 5;
  const MINUTE_10 = MINUTE * 10;
  const MINUTE_15 = MINUTE * 15;
  const MINUTE_20 = MINUTE * 20;
  const MINUTE_25 = MINUTE * 25;
  const MINUTE_30 = MINUTE * 30;
  const MINUTE_35 = MINUTE * 35;
  const MINUTE_40 = MINUTE * 40;
  const MINUTE_45 = MINUTE * 45;
  const MINUTE_50 = MINUTE * 50;
  const MINUTE_55 = MINUTE * 55;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;
  const WEEK = DAY * 7;
  const MONTH = WEEK * 4;
  const YEAR = MONTH * 12;
  return {
    SECOND,
    SECOND_5,
    MINUTE,
    MINUTE_5,
    MINUTE_10,
    MINUTE_15,
    MINUTE_20,
    MINUTE_25,
    MINUTE_30,
    MINUTE_35,
    MINUTE_40,
    MINUTE_45,
    MINUTE_50,
    MINUTE_55,
    HOUR,
    DAY,
    WEEK,
    MONTH,
    YEAR,
  };
};

const time = () => {
  const data = {};
  const currentData = new Date();
  data.currentTime = currentData.getHours() + ":" + currentData.getMinutes();
  return data;
};

const convertTimer = timeVal => {
  const { SECOND, MINUTE, HOUR, DAY, WEEK } = timer();

  if (timeVal > WEEK) {
    const weeksTime = parseInt(timeVal / WEEK);
    return weeksTime > 1 ? `${weeksTime} weeks` : `${weeksTime} week`;
  } else if (timeVal > DAY) {
    const daysTime = parseInt(timeVal / DAY);
    return daysTime > 1 ? `${daysTime} days` : `${daysTime} day`;
  } else if (timeVal > HOUR) {
    const hoursTime = parseInt(timeVal / HOUR);
    return hoursTime > 1 ? `${hoursTime} hours` : `${hoursTime} hour`;
  } else if (timeVal > MINUTE) {
    const minutesTime = parseInt(timeVal / MINUTE);
    return minutesTime > 1 ? `${minutesTime} minutes` : `${minutesTime} minute`;
  } else if (SECOND > SECOND) {
    const secondsTime = parseInt(timeVal / SECOND);
    return secondsTime > 1 ? `${secondsTime} seconds` : `${secondsTime} second`;
  }
};

const generateRandomCode = (len, prefix = "") => {
  if (len === prefix.length) {
    return prefix;
  } else {
    return generateRandomCode(len, `${prefix}${Math.round(Math.random() * 9)}`);
  }
};

const giveMe100RandomCode = (len, prefix = "") => {
  return [
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),

    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),

    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),

    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),

    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),

    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),

    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),

    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),

    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),

    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
    generateRandomCode(len, prefix),
  ];
};

const generateCharter = length => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".toUpperCase();
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const checkValidEmail = email => {
  var re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const validateTimePeriod = (start, end) => {
  const start_time_part_array = start.split(":");
  const end_time_part_array = end.split(":");
  if (parseInt(end_time_part_array[0]) >= parseInt(start_time_part_array[0])) {
    return true;
  } else {
    return false;
  }
};

const checkValidTime = time => {
  const re = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/;
  return re.test(time);
};

const checkValidMobile = mobileNumber => {
  const mobileNumberInt = parseInt(mobileNumber);
  console.log("mobileNumberInt", mobileNumberInt);
  if (mobileNumberInt) {
    if (
      mobileNumber.toString().length >= 8 &&
      mobileNumber.toString().length <= 12
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

const downloadFileFromUrl = (uri, filename) => {
  return new Promise((resolve, reject) => {
    request.head(uri, (err, res, body) => {
      request(uri)
        .pipe(fs.createWriteStream(filename))
        .on("close", () => resolve());
    });
  });
};

const deleteImage = fileName => {
  return new Promise((resolve, reject) => {
    fs.unlinkSync(fileName);
    resolve();
  });
};

const copyFile = (srcPath, destPath) => {
  return new Promise(resolve => {
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

const uploadFile = (files, fieldNameInFiles, imageStorePath, index = 0) => {
  return new Promise(resolve => {
    // console.log("files:", files);
    // console.log("fieldNameInFiles", fieldNameInFiles);
    // console.log("imageStorePath:", imageStorePath);
    console.log(index, "index");
    //  1st,  Check if File Object is empty or not & field name is actually provided in parameter
    if (Object.keys(files).length && files[fieldNameInFiles].length) {
      //  2nd, get temp path name of field name
      const srcPath = files[fieldNameInFiles][index].path;
      // //  3rd, get extension of temp file
      // let extension = srcPath.split(".").pop();
      // //  4th, create name for new file to upload
      // const currentTime = new Date().getTime() + generateUniqueString(8);
      // //  5th, add extension to new file name
      // const fileName = currentTime + "." + extension;
      // //  6th, setups destination full path with new image name
      const destPath = imageStorePath;
      console.log("destPath:", destPath);
      //  7th Copy file from temp folder to destination folder

      copyFile(srcPath, destPath).then(ans => {
        if (ans) {
          //  8th, if file uploaded, return new filename
          resolve(true);
        } else {
          //  else return false
          resolve(false);
        }
      });
    } else {
      resolve(false);
    }
  });
};

const multipleImageUpload = (
  files,
  fieldNameInFiles,
  imageStorePath,
  index = 0,
) => {
  return new Promise(resolve => {
    //  1st,  Check if File Object is empty or not & field name is actually provided in parameter
    if (Object.keys(files).length && files[fieldNameInFiles].length) {
      //  2nd, get temp path name of field name
      const srcPath = files[fieldNameInFiles][index].path;
      // //  3rd, get extension of temp file
      let extension = srcPath.split(".").pop();
      // //  4th, create name for new file to upload
      // const currentTime = new Date().getTime() + generateUniqueString(8);
      // //  5th, add extension to new file name
      // const fileName = currentTime + "." + extension;
      // //  6th, setups destination full path with new image name
      const destPath = imageStorePath;
      //  7th Copy file from temp folder to destination folder

      copyFile(srcPath, destPath).then(ans => {
        if (ans) {
          //  8th, if file uploaded, return new filename
          if (files.backImage) {
            if (files.backImage[0]) {
              if (files.backImage[0].size) {
                resolve({ uploaded: true, extension, backUploaded: true });
              } else {
                resolve({ uploaded: true, extension });
              }
            } else {
              resolve({ uploaded: true, extension });
            }
          } else {
            resolve({ uploaded: true, extension });
          }
        } else {
          //  else return false
          resolve({ uploaded: false, extension: null, backUploaded: false });
        }
      });
    } else {
      resolve({ uploaded: false, extension: null });
    }
  });
};

const base64 = {
  decode: encodedString => Buffer.from(encodedString, "base64"),
  encode: string => Buffer.from(string).toString("base64"),
};

export const giveMeOnlyFromObject = (obj, keyArray) => {
  const newObj = new Object();

  Object.keys(obj).map(key => {
    if (keyArray.indexOf(key) > -1) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

export const toFloat = (val, fixed = 2) => {
  return parseFloat(parseFloat(val).toFixed(fixed));
};

export const checkMongoId = id => mongoose.Types.ObjectId.isValid(id);

export const toMongooseId = id => mongoose.Types.ObjectId(id);

export const checkPrice = val => {
  const re = /^\d{1,8}(\.\d*)?$/g;
  return re.test(val);
};
export const checkOnlyNumber = val => {
  const re = /[^0-9-]/g;
  return !re.test(val);
};
export const checkBoolean = val => {
  if (typeof val === "boolean") return true;
  else return false;
};
const getDomain = url => {
  try {
    let domain = new URL(url);
    domain = domain.hostname;
    domain = domain.split(".")[1];
    return domain;
  } catch (err) {
    return null;
  }
};
const validatePostalCode = code => {
  let re = /^\d{5}-?\d{3}$/g;
  return re.test(code);
};
const validateCpfOrCnpj = code => {
  let re =
    /^(\d{3})\.?(\d{3})\.?(\d{3})\-?(\d{2}$)$|^(\d{2})\.?(\d{3})\.?(\d{3})\/?([0-1]{4})\-?(\d{2})$/g;
  return re.test(code);
};
const getAreaCode = number => {
  let result = number.toString().slice(0, 2);
  return result;
};
const getMobileNumber = number => {
  let result = number.toString().slice(2, 11);
  return result;
};
const getDayDifference = time => {
  const currentTime = new Date().getTime();
  const date = new Date(time);
  const timestamp = date.getTime();
  // console.log("currentTime, time", new Date(), time);
  // console.log("currentTime, time", currentTime, timestamp);
  const difference = currentTime - timestamp;

  // const diffTime = Math.abs(today - formatedData);
  const diffDays = Math.ceil(difference / (1000 * 60 * 60 * 24));
  return diffDays;
};
const checkIntDecimalNumber = val => {
  const re = /^\d{1,8}(\.\d*)?$/g;
  return re.test(val);
};
const checkInteger = val => {
  const re = /[^0-9-]/g;
  return !re.test(val);
};
const getFinanceTotal = array => {
  let newList = array.map(obj => {
    if (obj?.period == "") {
      obj._doc.count = obj.amount;

      var date = moment(obj.createdAt, "DD-MM-YYYY");
      obj._doc.month = date.format("MM");
    }
    if (obj?.period == "daily") {
      const diff = getDayDifference(obj.createdAt);
      // diff = 6
      // amount = 100;
      // f = 2;
      // diff / f = 3
      // 100*3 = 300

      if (parseInt(diff) > 0) {
        obj._doc.calculateCount = parseFloat(
          diff * (obj.amount * obj.frequency),
        ).toFixed(2);
        const iteration = parseInt(diff / obj.frequency);
        if (iteration >= 1) {
          obj._doc.count = parseInt(iteration) * obj.amount;
          obj._doc.iteration = iteration;
          obj._doc.dayDiff = diff;
          var date = moment(obj.createdAt, "DD-MM-YYYY");
          obj._doc.month = date.format("MM");
        } else {
          obj._doc.count = obj.amount;
          obj._doc.iteration = iteration;
          obj._doc.dayDiff = diff;
          var date = moment(obj.createdAt, "DD-MM-YYYY");
          obj._doc.month = date.format("MM");
        }
      } else {
        obj._doc.calculateCount = parseFloat(
          diff * (obj.amount * obj.frequency),
        ).toFixed(2);
        const data = parseInt(diff / obj.frequency);

        obj._doc.count = obj.amount;
        obj._doc.dayDiff = diff;
        var date = moment(obj.createdAt, "DD-MM-YYYY");
        obj._doc.month = date.format("MM");
      }
    }
    if (obj?.period == "weekly") {
      const diff = getDayDifference(obj.createdAt);
      const week = diff / 7;
      const iteration = parseInt(week / obj.frequency);

      if (diff > 0) {
        if (iteration >= 1) {
          const count = iteration * obj.amount;
          obj._doc.weekDiff = week;
          obj._doc.iteration = iteration;
          obj._doc.count = count;
          var date = moment(obj.createdAt, "DD-MM-YYYY");
          obj._doc.month = date.format("MM");
        } else {
          const count = obj.amount;
          obj._doc.calculateCount = parseFloat(count).toFixed(2);
          obj._doc.iteration = iteration;
          obj._doc.weekDiff = week;
          obj._doc.count = count;
          var date = moment(obj.createdAt, "DD-MM-YYYY");
          obj._doc.month = date.format("MM");
        }
      }
    }
    if (obj?.period == "monthly") {
      const diff = getDayDifference(obj.createdAt);
      const month = diff / 30;
      const iteration = parseInt(month / obj.frequency);
      if (diff > 0) {
        if (iteration >= 1) {
          const count = iteration * obj.amount;
          obj._doc.calculateCount = parseFloat(count).toFixed(2);
          obj._doc.monthDiff = month;
          obj._doc.count = count;
          obj._doc.iteration = iteration;
          var date = moment(obj.createdAt, "DD-MM-YYYY");
          obj._doc.month = date.format("MM");
        } else {
          const count = obj.amount;
          obj._doc.calculateCount = parseFloat(count).toFixed(2);
          obj._doc.monthDiff = month;
          obj._doc.iteration = iteration;
          obj._doc.count = count;
          var date = moment(obj.createdAt, "DD-MM-YYYY");
          obj._doc.month = date.format("MM");
        }
      }
    }
    return obj;
  });
  var result = newList.reduce(function (acc, obj) {
    return acc + obj._doc.count;
  }, 0);
  return { result, newList };
};
export default {
  timer,
  time,
  convertTimer,
  generateRandomCode,
  giveMe100RandomCode,
  checkValidEmail,
  checkValidTime,
  validateTimePeriod,
  checkValidMobile,
  downloadFileFromUrl,
  deleteImage,
  uploadFile,
  copyFile,
  base64,
  giveMeOnlyFromObject,
  toMongooseId,
  checkPrice,
  checkOnlyNumber,
  checkBoolean,
  getDomain,
  validatePostalCode,
  validateCpfOrCnpj,
  getAreaCode,
  getMobileNumber,
  getDayDifference,
  checkIntDecimalNumber,
  checkInteger,
  getFinanceTotal,
  multipleImageUpload,
  generateCharter,
};
