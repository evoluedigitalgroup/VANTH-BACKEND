import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;
const CompanySchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    selectedPlan: {
      type: mongoose.Types.ObjectId,
      default: null
    },
    approveStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

CompanySchema.set("toJSON", toJSONOpt);
CompanySchema.set("toObject", toObjectOpt);


export default mongoose.model("Company", CompanySchema);
