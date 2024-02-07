import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;


const ContractDocumentSchema = mongoose.Schema({
  template: {
    type: mongoose.Schema.ObjectId,
    ref: "ContractTemplate"
  },
  documentId: {
    type: String,
    required: true
  },
  recipientId: {
    type: String,
    required: true
  }
});

const ContractSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    identifier: {
      type: String,
      required: true,
      unique: true,
    },
    verifier: {
      type: String,
      default: null,
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: "Company",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    recipient: {
      type: mongoose.Schema.ObjectId,
      ref: "Contact",
    },
    contractTemplates: {
      type: [mongoose.Schema.ObjectId],
      ref: "ContractTemplate"
    },
    contractDocumentIds: {
      type: [ContractDocumentSchema],
      default: []
    },
    docusignEnvelopeId: {
      type: String,
      default: null
    },
    docusignData: {
      type: Object,
      default: null
    },
    signedDocument: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ["pending", "signed", "rejected"],
      default: "pending",
    },
    isApproved: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);
ContractSchema.set("toJSON", toJSONOpt);
ContractSchema.set("toObject", toObjectOpt);
export default mongoose.model("Contract", ContractSchema);