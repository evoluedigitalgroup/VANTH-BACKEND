import mongoose from "mongoose";
import config from "../config";

const onConnect = () => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(config.mongoHost, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
};

export default {
  onConnect,
};
