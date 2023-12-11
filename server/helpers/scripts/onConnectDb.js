import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

//  MODELS
import config from "../../config/index";
import Admin from "../../models/admin";
import DocumentFile from "../../models/documentFile";
// import Configuration from "../../models/configuration";

// //  SEEDING DATA
import seedingDocumentFile from "../seedingData/documentFIle";

const seedAdminUser = () => {
  return new Promise(async (resolve, reject) => {
    const totalAdmins = await Admin.find({}).countDocuments();

    if (totalAdmins === 0) {
      const pin = config.defaultAdminPassword;

      const pin_salt = bcrypt.genSaltSync(parseInt(config.passwordSalt));
      const hashed_pin = await bcrypt.hash(pin, pin_salt);

      const insertAdmin = {
        name: config.defaultAdminName,
        email: config.defaultAdminEmail,
        password: hashed_pin,
        permissions: {
          contact: true,
          document: true,
          newAdmin: true,
        },
        isMainAdmin: true,
        uuid: uuidv4(),
      };

      await new Admin(insertAdmin).save();

      resolve();
    } else {
      resolve();
    }
  });
};

const seedDocument = () => {
  return new Promise(async (resolve, reject) => {
    const documentFileList = await DocumentFile.find({});
    if (documentFileList.length) {
      const documentLabel = documentFileList.map(obj => obj.type);

      seedingDocumentFile.map(async obj => {
        if (documentLabel.indexOf(obj.type) < 0) {
          await new DocumentFile(obj).save();
        }
      });
      resolve();
    } else {
      await DocumentFile.insertMany(seedingDocumentFile);
      resolve();
    }
  });
};

// const seedPermission = () => {
//   return new Promise(async (resolve, reject) => {
//     const permissionList = await Permission.find({});
//     if (permissionList.length) {
//       const permissionLabel = permissionList.map(obj => obj.label);

//       permissionSeeding.permissionSeeding.map(async obj => {
//         if (permissionLabel.indexOf(obj.label) < 0) {
//           await new Permission(obj).save();
//         }
//       });
//       resolve();
//     } else {
//       await Permission.insertMany(permissionSeeding.permissionSeeding);
//       resolve();
//     }
//   });
// };

// // const seedConstantList = () => {
// //   return new Promise(async (resolve, reject) => {
// //     const totalConstantList = await ConstantList.find({}).countDocuments();
// //     if (totalConstantList === 0) {
// //       await ConstantList.insertMany(constantListSeedingData);
// //       resolve();
// //     } else {
// //       resolve();
// //     }
// //   });
// // };
// const seedConfigurations = () => {
//   return new Promise(async (resolve, reject) => {
//     const ConfigurationList = await Configuration.find({});

//     if (ConfigurationList.length) {
//       const configurationKeys = ConfigurationList.map(obj => obj.key);
//       const configurationValues = ConfigurationList.map(obj => obj.value);

//       ConfigurationSeedingData.map(async obj => {
//         if (configurationKeys.indexOf(obj.key) < 0) {
//           //  OBJ Configuration not exists in database.
//           await new Configuration(obj).save();
//         } else {
//           //exits then update
//           if (configurationValues.indexOf(obj.value) < 0) {
//             // console.log("configurationValues", ConfigurationList);
//             const foundItem = ConfigurationList.find(
//               item => item.key === obj.key,
//             );
//             if (foundItem) {
//               await Configuration.findByIdAndUpdate(foundItem.id, {
//                 value: obj.value,
//               });
//             }
//           }
//         }
//       });
//       resolve();
//     } else {
//       await Configuration.insertMany(ConfigurationSeedingData);
//       resolve();
//     }
//   });
// };

// //for payment type : Advocate APp
// const seedPaymentType = () => {
//   return new Promise(async (resolve, reject) => {
//     const typeList = await PaymentType.find({});
//     if (typeList.length) {
//       const label = typeList.map(obj => obj.label);

//       addPaymentType.PaymentType.map(async obj => {
//         if (label.indexOf(obj.label) < 0) {
//           await new PaymentType(obj).save();
//         }
//       });
//       resolve();
//     } else {
//       await PaymentType.insertMany(addPaymentType.PaymentType);
//       resolve();
//     }
//   });
// };

// //for payment Name : Advocate APp
// const seedPaymentName = () => {
//   return new Promise(async (resolve, reject) => {
//     const list = await PaymentName.find({});
//     if (list.length) {
//       const label = list.map(obj => obj.label);

//       addPaymentName.PaymentName.map(async obj => {
//         if (label.indexOf(obj.label) < 0) {
//           await new PaymentName(obj).save();
//         }
//       });
//       resolve();
//     } else {
//       await PaymentName.insertMany(addPaymentName.PaymentName);
//       resolve();
//     }
//   });
// };

// //for payment Office : Advocate APp
// const seedPaymentOffice = () => {
//   return new Promise(async (resolve, reject) => {
//     const list = await PaymentOffice.find({});
//     if (list.length) {
//       const label = list.map(obj => obj.label);

//       addPaymentOffice.PaymentOffice.map(async obj => {
//         if (label.indexOf(obj.label) < 0) {
//           await new PaymentOffice(obj).save();
//         }
//       });
//       resolve();
//     } else {
//       await PaymentOffice.insertMany(addPaymentOffice.PaymentOffice);
//       resolve();
//     }
//   });
// };

// //for Process Status : Advocate APp
// const seedProcessStatus = () => {
//   return new Promise(async (resolve, reject) => {
//     const list = await ProcessStatus.find({});
//     if (list.length) {
//       const label = list.map(obj => obj.label);

//       addProcessStatus.ProcessStatus.map(async obj => {
//         if (label.indexOf(obj.label) < 0) {
//           await new ProcessStatus(obj).save();
//         }
//       });
//       resolve();
//     } else {
//       await ProcessStatus.insertMany(addProcessStatus.ProcessStatus);
//       resolve();
//     }
//   });
// };
const init = async () => {
  seedAdminUser().then(() => {
    console.log("✅ Seed Admin");
    seedDocument().then(() => {
      console.log("✅ Seed Document");
    });
  });
};

export default {
  init,
};
