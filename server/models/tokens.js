import mongoose from 'mongoose';
import mongoosePlugins from "../helpers/mongoose-plugins/options";

const toJSONOpt = mongoosePlugins.toJSONOpt;
const toObjectOpt = mongoosePlugins.toJSONOpt;

const Schema = mongoose.Schema;

const TokensSchema = new Schema ({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
    },

    token: {
        type: String,
        required: true
    }
});

TokensSchema.set("toJSON", toJSONOpt);
TokensSchema.set("toObject", toObjectOpt);


export default mongoose.model("Tokens", TokensSchema);
