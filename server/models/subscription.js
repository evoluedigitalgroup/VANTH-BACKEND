import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;

const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema(
  {
    plan: {
      type: mongoose.Types.ObjectId,
      ref: "Plan",
    },
    planDetails: {
      type: Object,
      required: true
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    company: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
    },
    events: {
      type: [Object],
      default: []
    }
  },
  {
    timestamps: true,
  },
);

SubscriptionSchema.index({
  id: 1,
});

SubscriptionSchema.set("toJSON", toJSONOpt);
SubscriptionSchema.set("toObject", toObjectOpt);

export default mongoose.model("Subscription", SubscriptionSchema);
