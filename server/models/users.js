import mongoose from "mongoose";
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toObjectOpt;

const Schema = mongoose.Schema;

const UsersSchema = new Schema(
  {
    uuid: {
      type: String,
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: "Company",
    },
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
    isMainUser: {
      type: Boolean,
      default: false,
    },
    invitation: {
      type: Schema.Types.ObjectId,
      ref: "Invite",
    },
    designation: {
      type: String,
      default: null
    },
    profileImage: {
      type: String,
      default: null,
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

UsersSchema.index({
  email: 1,
  id: 1,
  uuid: 1
});

UsersSchema.set("toJSON", toJSONOpt);
UsersSchema.set("toObject", toObjectOpt);

export default mongoose.model("User", UsersSchema);
