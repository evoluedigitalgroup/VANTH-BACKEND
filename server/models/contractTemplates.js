import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;

const Schema = mongoose.Schema;

const ContractTemplateSchema = new Schema(
  {
    uuid: {
      type: String,
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: "Company",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    originalFileName: {
      type: String,
      required: true,
    },
    templateSchema: {
      type: [Object],
      required: true,
    },
    templatePreviewFile: {
      type: String,
      required: true
    },
    templateFile: {
      type: String,
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

ContractTemplateSchema.index({
  id: 1,
  uuid: 1
});

ContractTemplateSchema.set("toJSON", toJSONOpt);
ContractTemplateSchema.set("toObject", toObjectOpt);

export default mongoose.model("ContractTemplate", ContractTemplateSchema);
