import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;

const Schema = mongoose.Schema;

const DocumentFileSchema = new Schema(
  {
    type: {
      type: String,
    },
    label: {
      type: String,
    },
    title: {
      type: String,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

DocumentFileSchema.index({
  id: 1,
});

DocumentFileSchema.set("toJSON", toJSONOpt);
DocumentFileSchema.set("toObject", toObjectOpt);

export default mongoose.model("DocumentFile", DocumentFileSchema);
