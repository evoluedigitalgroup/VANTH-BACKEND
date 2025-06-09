import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;

const Schema = mongoose.Schema;

const UnExpectedWebHookEventSchema = new Schema(
  {
    event: {
      type: Object,
      required: true
    }
  },
  {
    timestamps: true,
  },
);

UnExpectedWebHookEventSchema.index({
  id: 1,
});

UnExpectedWebHookEventSchema.set("toJSON", toJSONOpt);
UnExpectedWebHookEventSchema.set("toObject", toObjectOpt);

export default mongoose.model("UnExpectedWebHookEvent", UnExpectedWebHookEventSchema);
