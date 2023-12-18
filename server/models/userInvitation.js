import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;

const Schema = mongoose.Schema;

const UserInviteSchema = new Schema(
  {
    uuid: {
      type: String,
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: "Company",
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

UserInviteSchema.index({
  id: 1,
  uuid: 1
});

UserInviteSchema.set("toJSON", toJSONOpt);
UserInviteSchema.set("toObject", toObjectOpt);

export default mongoose.model("UserInviteSchema", UserInviteSchema);
