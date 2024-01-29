import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;

const Schema = mongoose.Schema;

const PlanSchema = new Schema(
  {
    planName: {
      type: String,
      required: true,
    },
    monthlyPlanPrice: {
      type: Number,
      required: true
    },
    allowedTotalUsers: {
      type: Number,
      required: true,
    },
    storageUnit: {
      type: String,
      enum: ["GB", "TB"],
      default: "GB",
    },
    totalStorageAllowed: {
      type: Number,
      default: 0
    },
    digitalContractSignatures: {
      type: Number,
      required: true,
    },
    userManagementAndPermission: {
      type: Boolean,
      default: true
    },
    performanceDashboard: {
      type: Boolean,
      default: true,
    },
    dataExport: {
      type: Boolean,
      default: true,
    },
    approvalOrAutomationWorkflow: {
      type: Boolean,
      default: true,
    },
    effectiveStatus: {
      type: Boolean,
      default: true,
    },
    createUnlimitedContractTemplates: {
      type: Boolean,
      default: true,
    },
    templateLibrary: {
      type: Boolean,
      default: true,
    },
    notificationViaSmsEmailAndWhatsApp: {
      type: Boolean,
      default: true,
    },
    smartFilters: {
      type: Boolean,
      default: true,
    },
    customerSupport: {
      type: Boolean,
      default: true,
    },
    sequence: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true,
  },
);

PlanSchema.index({
  id: 1,
});

PlanSchema.set("toJSON", toJSONOpt);
PlanSchema.set("toObject", toObjectOpt);

export default mongoose.model("Plan", PlanSchema);
