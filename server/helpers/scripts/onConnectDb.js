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
      planName: "Basic",
      monthlyPlanPrice: 359,
      allowedTotalUsers: 5,
      storageUnit: "GB",
      totalStorageAllowed: 25,
      digitalContractSignatures: 25,
      sequence: 1,
      pagarMeProductionPlanId: "plan_DjgRoVBTmTko6E9V",
      pagarMeTestingPlanId: "plan_wGy5j07fLfEMY3v0"
    },
    {
      planName: "Standard",
      monthlyPlanPrice: 699,
      allowedTotalUsers: 10,
      storageUnit: "GB",
      totalStorageAllowed: 50,
      digitalContractSignatures: 50,
      sequence: 2,
      pagarMeProductionPlanId: "plan_JBWpl4WFQFoEbVYG",
      pagarMeTestingPlanId: "plan_GqD1mLEfvfKenaW2"
    },
    {
      planName: "Premium",
      monthlyPlanPrice: 1459,
      allowedTotalUsers: 10,
      storageUnit: "TB",
      totalStorageAllowed: 1,
      digitalContractSignatures: 100,
      sequence: 3,
      pagarMeProductionPlanId: "plan_DovP3L2CmCexVnmJ",
      pagarMeTestingPlanId: "plan_bPaLXxwTGTpO60pj"
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
