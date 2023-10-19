import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;

const Schema = mongoose.Schema;

const InviteSchema = new Schema(
  {
    uuid: {
      type: String,
    },
    designation: {
      type: String,
    },
    permissions: {
      type: Object,
    },
    code: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

InviteSchema.index({
  id: 1,
});

InviteSchema.set("toJSON", toJSONOpt);
InviteSchema.set("toObject", toObjectOpt);

export default mongoose.model("Invite", InviteSchema);
