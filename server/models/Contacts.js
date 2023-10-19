import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;
const ContactSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    CPF: {
      type: String,
      required: true,
    },
    CNPJ: {
      type: String,
      required: true,
    },
    documentRequest: {
      type: mongoose.Schema.ObjectId,
      ref: "DocumentRequest",
    },
    socialContract: {
      type: Object,
      default: null,
    },
    addressProof: {
      type: Object,
      default: null,
    },
    balanceIncome: {
      type: Object,
      default: null,
    },
    balanceSheet: {
      type: Object,
      default: null,
    },
    partnerIncome: {
      type: Object,
      default: null,
    },
    billingCustomer: {
      type: Object,
      default: null,
    },
    partnerDocument: {
      type: Object,
      default: null,
    },
    updatedBankDebt: {
      type: Object,
      default: null,
    },
    spouseDocument: {
      type: Object,
      default: null,
    },
    extractBusiestBank: {
      type: Object,
      default: null,
    },
    companyPhotos: {
      type: Object,
      default: null,
    },
    abcCurve: {
      type: Object,
      default: null,
    },
    CNPJDOC: {
      type: Object,
      default: null,
    },
    CPFDOC: {
      type: Object,
      default: null,
    },
    docStatus: {
      type: Object,
    },
    // allStatus: {
    //   type: String,
    //   enum: ["pending", "approved", "reject"],
    //   default: "pending",
    // },
    contactApprove: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);
ContactSchema.set("toJSON", toJSONOpt);
ContactSchema.set("toObject", toObjectOpt);
export default mongoose.model("Contact", ContactSchema);

// Url: {
//   type: String,
// },
// approved: {
//   type: Boolean,
// },
// approvedBy: {
//   type: String,
// },
// approvedDate: {
//   type: Date,
// },
