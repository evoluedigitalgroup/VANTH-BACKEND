import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;

const Schema = mongoose.Schema;

const AdminInviteSchema = new Schema(
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

AdminInviteSchema.index({
  id: 1,
  uuid: 1
});

AdminInviteSchema.set("toJSON", toJSONOpt);
AdminInviteSchema.set("toObject", toObjectOpt);

export default mongoose.model("AdminInvite", AdminInviteSchema);
