import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;

const Schema = mongoose.Schema;

const AdminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    permissions: {
      type: Object,
    },
    isMainAdmin: {
      type: Boolean,
      default: false,
    },
    invitation: {
      type: Schema.Types.ObjectId,
      ref: "Invite",
    },
    designation: {
      type: String,
    },
    profileImage: {
      type: String,
      default: null,
    },
    uuid: {
      type: String,
    },
    jwtRefreshSecret: {
      private: true,
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

AdminSchema.index({
  email: 1,
  id: 1,
});

AdminSchema.set("toJSON", toJSONOpt);
AdminSchema.set("toObject", toObjectOpt);

export default mongoose.model("Admin", AdminSchema);
