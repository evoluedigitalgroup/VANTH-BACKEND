import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;

const Schema = mongoose.Schema;

const VisitorSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true
    }
  },
  {
    timestamps: true,
  },
);

VisitorSchema.index({
  id: 1,
});

VisitorSchema.set("toJSON", toJSONOpt);
VisitorSchema.set("toObject", toObjectOpt);

export default mongoose.model("Visitor", VisitorSchema);
