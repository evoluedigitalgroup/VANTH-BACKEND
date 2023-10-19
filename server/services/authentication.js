import JWT from "jsonwebtoken";
import config from "../config";
import Admin from "../models/admin";
import lang from "../helpers/locale/lang";
const getUserObjForResponse = data => {
  if (data.password) {
    delete data.password;
    data.password = undefined;
  }
  if (data.jwtRefreshSecret) {
    delete data.jwtRefreshSecret;
    data.jwtRefreshSecret = undefined;
  }
  return data;
};

const generateObjForJwt = data => {
  const { id, email } = data;
  return { id, email };
};

const AdminSignInJwt = adminData => {
  return new Promise(async (resolve, reject) => {
    const accessToken = JWT.sign(adminData, config.jwtSecretAccessUser, {
      expiresIn: config.jwtAccessTimeout,
    });
    const refreshToken = JWT.sign(adminData, config.jwtSecretRefreshUser, {
      expiresIn: config.jwtRefreshTimeout,
    });

    // store jwt refresh token in database
    Admin.findByIdAndUpdate(
      adminData.id,
      {
        jwtRefreshSecret: refreshToken,
      },
      { new: true },
    ).then(() => {
      resolve({
        accessToken,
        refreshToken,
      });
    });
  });
};

const AdminAuthValidateMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const headerAuthArray = authHeader.split(" ");
    if (headerAuthArray.length) {
      const token = headerAuthArray[1];
      JWT.verify(token, config.jwtSecretAccessUser, async (err, decoded) => {
        if (err) {
          res.status(403).json({
            success: false,
          });
        } else {
          Admin.findById(decoded.id).then(adminObj => {
            req.admin = adminObj;
            next();
          });
        }
      });
    } else {
      res.status(403).json({
        success: false,
      });
    }
  } else {
    res.status(403).json({
      success: false,
    });
  }
};
/**
 * @param Advocate : Advocate Object to encrypt inside JWT tokens
 * @returns : accessToken & refreshToken
 */
/**
 * Get Advocate Object For Response
 */

const generateAdvocateObjForDatabase = obj => {
  const { name, email, password, permissions, telephone } = obj;

  return {
    name,
    email,
    password,
    permissions,
    telephone,
  };
};
const getAdvocateObjForResponse = advocateObj => {
  if (advocateObj._doc?.password) {
    delete advocateObj._doc?.password;
    advocateObj._doc["password"] = true;
  }
  if (advocateObj._doc?.device) {
    delete advocateObj._doc?.device;
    advocateObj._doc["device"] = true;
  }
  if (advocateObj._doc?.forgot) {
    advocateObj._doc["forgot"] = undefined;
    delete advocateObj._doc?.forgot;
  }

  if (advocateObj._doc?.wrongAttemptsForgotMailOtp) {
    advocateObj._doc["wrongAttemptsForgotMailOtp"] = undefined;
    delete advocateObj._doc?.wrongAttemptsForgotMailOtp;
  }

  if (advocateObj._doc?.wrongAttemptsLogin) {
    advocateObj._doc["wrongAttemptsLogin"] = undefined;
    delete advocateObj._doc?.wrongAttemptsLogin;
  }
  if (advocateObj._doc?.socialLink) {
    advocateObj._doc["socialLink"] = undefined;
    delete advocateObj._doc?.socialLink;
  }
  if (advocateObj._doc?.taskCategory) {
    advocateObj._doc["taskCategory"] = undefined;
    delete advocateObj._doc?.taskCategory;
  }
  if (advocateObj._doc?.processes) {
    advocateObj._doc["processes"] = undefined;
    delete advocateObj._doc?.processes;
  }
  if (advocateObj._doc?.fcm) {
    advocateObj._doc["fcm"] = undefined;
    delete advocateObj._doc?.fcm;
  }
  delete advocateObj._doc?.__v;
  delete advocateObj._doc?.createdAt;

  return advocateObj._doc;
};
const GenerateAdvocateObjForJwt = advocateObj => {
  const {
    id,
    office,
    name,
    email,
    telephone,
    isOwner,
    isSubscribed,
    isActive,
    isRestaurantSet,
  } = advocateObj;

  return {
    id,
    office,
    name,
    email,
    telephone,
    isOwner,
    isSubscribed,
    isActive,
    isRestaurantSet,
  };
};
const AdvocateSignInJwt = advocateObj => {
  return new Promise(async (resolve, reject) => {
    const allConfigurationsData = await allConfigurations();

    //  Access Token will expire after [jwtExpAccess] time.
    const accessToken = JWT.sign(advocateObj, config.jwtSecretAccessUser, {
      expiresIn: allConfigurationsData.ACCESS_TOKEN_TIMEOUT,
    });

    //  Secret Token will never expired, it will be use to generate new access token.
    const refreshToken = JWT.sign(advocateObj, config.jwtSecretRefreshUser, {
      expiresIn: allConfigurationsData.REFRESH_TOKEN_TIMEOUT,
    });

    //  Storing JWT Secret in Database
    Advocate.findByIdAndUpdate(advocateObj.id, {
      jwtRefreshSecret: refreshToken,
    })
      .then(() => {
        resolve({
          accessToken,
          refreshToken,
        });
      })
      .catch(err => console.log("PROMISE err :: ", err));
  });
};
const AdvocateAuthValidateMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (authHeader) {
    const headerAuthArray = authHeader.split(" ");
    if (headerAuthArray.length) {
      const token = headerAuthArray[1];

      JWT.verify(token, config.jwtSecretAccessUser, async (err, decoded) => {
        if (err) {
          console.log("err", err);
          res.status(403).json({
            success: false,
            message: lang.TOKEN_EXPIRED.PR,
          });
        } else {
          Advocate.findById(decoded.id)
            .select({
              name: 1,
              email: 1,
              isSubscribed: 1,
              isActive: 1,
              isOwner: 1,
              id: 1,
              isRegistered: 1,
              addedBy: 1,
            })
            .exec()
            .then(data => {
              if (data) {
                req["advocate"] = data;
                next();
              } else {
                res.status(403).json({
                  success: false,
                  message: lang.ACCOUNT_NOT_FOUND.PR,
                });
              }
            })
            .catch(err => {
              res.status(500).json({
                success: false,
                message: lang.SOMETHING_WENT_WRONG.PR,
              });
            });
        }
      });
    } else {
      res.status(403).json({
        success: false,
        message: lang.TOKEN_EXPIRED.PR,
      });
    }
  } else {
    res.status(403).json({
      success: false,
      message: lang.TOKEN_EXPIRED.PR,
    });
  }
};

const getClientObjForResponse = clientObj => {
  if (clientObj._doc?.password) {
    delete clientObj?._doc?.password;
    clientObj._doc["password"] = true;
  }
  if (clientObj._doc?.device) {
    delete clientObj._doc?.device;
    clientObj._doc["device"] = true;
  }
  if (clientObj._doc?.forgot) {
    clientObj._doc["forgot"] = undefined;
    delete clientObj._doc?.forgot;
  }

  if (clientObj._doc?.wrongAttemptsForgotMailOtp) {
    clientObj._doc["wrongAttemptsForgotMailOtp"] = undefined;
    delete clientObj._doc?.wrongAttemptsForgotMailOtp;
  }

  if (clientObj._doc?.wrongAttemptsLogin) {
    clientObj._doc["wrongAttemptsLogin"] = undefined;
    delete clientObj._doc?.wrongAttemptsLogin;
  }
  if (clientObj._doc?.socialLink) {
    clientObj._doc["socialLink"] = undefined;
    delete clientObj._doc?.socialLink;
  }

  if (clientObj._doc?.fcm) {
    clientObj._doc["fcm"] = undefined;
    delete clientObj._doc?.fcm;
  }
  if (clientObj._doc?.jwtRefreshSecret) {
    clientObj._doc["jwtRefreshSecret"] = undefined;
    delete clientObj._doc?.jwtRefreshSecret;
  }
  delete clientObj._doc?.__v;
  delete clientObj._doc?.createdAt;
  // console.log("clientObj._doc :: ", clientObj);
  return clientObj._doc;
};

const GenerateClientObjForJwt = clientObj => {
  const { id, email } = clientObj;

  return {
    id,
    email,
  };
};

const ClientSignInJwt = clientObj => {
  return new Promise(async (resolve, reject) => {
    const allConfigurationsData = await allConfigurations();

    //  Access Token will expire after [jwtExpAccess] time.
    const accessToken = JWT.sign(clientObj, config.jwtSecretAccessUser, {
      expiresIn: allConfigurationsData.ACCESS_TOKEN_TIMEOUT,
    });

    //  Secret Token will never expired, it will be use to generate new access token.
    const refreshToken = JWT.sign(clientObj, config.jwtSecretRefreshUser, {
      expiresIn: allConfigurationsData.REFRESH_TOKEN_TIMEOUT,
    });

    //  Storing JWT Secret in Database
    Client.findByIdAndUpdate(clientObj.id, {
      jwtRefreshSecret: refreshToken,
    })
      .then(() => {
        resolve({
          accessToken,
          refreshToken,
        });
      })
      .catch(err => console.log("PROMISE err :: ", err));
  });
};

const ClientAuthValidateMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (authHeader) {
    const headerAuthArray = authHeader.split(" ");
    if (headerAuthArray.length) {
      const token = headerAuthArray[1];

      JWT.verify(token, config.jwtSecretAccessUser, async (err, decoded) => {
        if (err) {
          console.log("err", err);
          res.status(403).json({
            success: false,
            message: lang.TOKEN_EXPIRED.PR,
          });
        } else {
          Client.findById(decoded.id)
            .exec()
            .then(data => {
              if (data) {
                req["client"] = data;
                next();
              } else {
                res.status(403).json({
                  success: false,
                  message: lang.ACCOUNT_NOT_FOUND.PR,
                });
              }
            })
            .catch(err => {
              res.status(500).json({
                success: false,
                message: lang.SOMETHING_WENT_WRONG.PR,
              });
            });
        }
      });
    } else {
      res.status(403).json({
        success: false,
        message: lang.SOMETHING_WENT_WRONG.PR,
      });
    }
  } else {
    res.status(403).json({
      success: false,
      message: lang.SOMETHING_WENT_WRONG.PR,
    });
  }
};

export default {
  generateObjForJwt,
  AdminSignInJwt,
  getUserObjForResponse,
  AdminAuthValidateMiddleware,
  getAdvocateObjForResponse,
  GenerateAdvocateObjForJwt,
  AdvocateAuthValidateMiddleware,
  AdvocateSignInJwt,
  GenerateClientObjForJwt,
  getClientObjForResponse,
  ClientSignInJwt,
  ClientAuthValidateMiddleware,
};
