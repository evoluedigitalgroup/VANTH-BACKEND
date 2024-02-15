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
    company: {
      type: mongoose.Schema.ObjectId,
      ref: "Company",
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
      default: ''
    },
    CNPJ: {
      type: String,
      default: ''
    },
    documentRequest: {
      type: mongoose.Schema.ObjectId,
      ref: "DocumentRequest",
    },
    otherInformation: {
      type: [Object],
      default: []
    },
    docs: {
      type: Object,
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
