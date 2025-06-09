import JWT from "jsonwebtoken";
import config from "../config";
import Admin from "../models/admin";
import User from "../models/users";

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

const generateObjForJwt = ({ id, email }, browserId) => ({
  id,
  email,
  browserId,
});

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
            tokenExpired: true,
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

    resolve({
      accessToken,
      refreshToken,
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
            tokenExpired: true,
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

const revalidateToken = refreshToken => {
  return new Promise((resolve, reject) => {
    if (!refreshToken) {
      reject({
        success: false,
        message: 'Por favor, informe um Refresh Token',
      });
    }

    JWT.verify(refreshToken, config.jwtSecretRefreshUser, async (err, decoded) => {
      if (err) {
        reject({
          success: false,
          message: 'Erro ao verificar o Token',
        });
      }

      if (!decoded.id || !decoded.browserId) {
        reject({
          success: false,
          message: 'Token inválido',
        });
      }

      const browserIdIsValid = await User.exists({
        id: decoded.id,
        browserId: decoded.browserId,
      });

      if (!browserIdIsValid) {
        reject({
          success: false,
          message: 'Browser Id inválido',
        });
      }

      const accessToken = JWT.sign({
        id: decoded.id,
        email: decoded.email,
        browserId: decoded.browserId,
      }, config.jwtSecretAccessUser, {
        expiresIn: config.jwtAccessTimeout,
      });

      resolve(accessToken);
    });
  });
};

export default {
  generateObjForJwt,
  AdminSignInJwt,
  getUserObjForResponse,
  AdminAuthValidateMiddleware,
  UserSignInJwt,
  UserAuthValidateMiddleware,
  revalidateToken,
};
