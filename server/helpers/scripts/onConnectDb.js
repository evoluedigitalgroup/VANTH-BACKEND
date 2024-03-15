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
import seedingDocumentFile from "../seedingData/documentFile";
import Plan from "../../models/plan";

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

const seedPlans = () => {

  const initialPlans = [
    {
      planName: "Personal",
      monthlyPlanPrice: 99,
      allowedTotalUsers: 1,
      storageUnit: "GB",
      totalStorageAllowed: 10,
      digitalContractSignatures: 10,
      sequence: 1,
      pagarMeProductionPlanId: "plan_ZRDxXP5IyIG4JAEr",
      pagarMeTestingPlanId: "plan_N8Z79AvT1Tb4D2Er"
    },
    {
      planName: "Standard",
      monthlyPlanPrice: 359,
      allowedTotalUsers: 5,
      storageUnit: "GB",
      totalStorageAllowed: 25,
      digitalContractSignatures: 25,
      sequence: 2,
      pagarMeProductionPlanId: "plan_WZ9Nb30fpf52nGX6",
      pagarMeTestingPlanId: "plan_dE0lyOEHgHAqDbga"
    },
    {
      planName: "Premium",
      monthlyPlanPrice: 699,
      allowedTotalUsers: 10,
      storageUnit: "GB",
      totalStorageAllowed: 50,
      digitalContractSignatures: 50,
      sequence: 3,
      pagarMeProductionPlanId: "plan_qGY57ErHaHM9OW0K",
      pagarMeTestingPlanId: "plan_O7NGk0MsRsxVv4z1"
    }
  ];

  return new Promise(async (resolve, reject) => {
    const plansList = await Plan.find({});

    if (!plansList.length) {
      await Plan.insertMany(initialPlans);
      resolve();
    } else {
      resolve();
    }
  });
}

const init = async () => {
  seedAdminUser().then(() => {
    console.log("✅ Seed Admin");
    seedDocument().then(() => {
      console.log("✅ Seed Document");
      seedPlans().then(() => {
        console.log("✅ Seed Plan");
      })
    });
  });
};

export default {
  init,
};
