import JWT from "jsonwebtoken";
import config from "../config";
import Admin from "../models/admin";
import User from "../models/users";
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

const UserSignInJwt = userData => {
  return new Promise(async (resolve, reject) => {
    const accessToken = JWT.sign(userData, config.jwtSecretAccessUser, {
      expiresIn: config.jwtAccessTimeout,
    });
    const refreshToken = JWT.sign(userData, config.jwtSecretRefreshUser, {
      expiresIn: config.jwtRefreshTimeout,
    });

    // store jwt refresh token in database
    User.findByIdAndUpdate(
      userData.id,
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

const UserAuthValidateMiddleware = (req, res, next) => {
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
          User.findById(decoded.id).then(userObj => {
            req.user = userObj;
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

export default {
  generateObjForJwt,
  AdminSignInJwt,
  getUserObjForResponse,
  AdminAuthValidateMiddleware,
  UserSignInJwt,
  UserAuthValidateMiddleware
};
