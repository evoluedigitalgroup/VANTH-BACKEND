import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;
const DocRequest = mongoose.Schema(
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
    contacts: {
      type: mongoose.Schema.ObjectId,
      ref: "Contact",
    },
    requiredPermission: {
      type: Object,
    },
    generateLink: {
      type: String,
    },
    isGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
DocRequest.set("toJSON", toJSONOpt);
DocRequest.set("toObject", toObjectOpt);
export default mongoose.model("DocumentRequest", DocRequest);
