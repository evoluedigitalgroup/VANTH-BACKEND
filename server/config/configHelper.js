/* eslint-disable global-require */
import dotEnv from "dotenv";
dotEnv.config();

export const credentials = env => {
  const {
    PORT,
    TEST_PORT,
    PRODUCTION_PORT,

    LOCAL_HOST,

    JWT_SECRET_ACCESS_USER,
    JWT_SECRET_REFRESH_USER,
    JWT_ACCESS_TIMEOUT,
    JWT_REFRESH_TIMEOUT,

    LOCAL_MONGO_HOST,

    DEFAULT_ADMIN_NAME,
    DEFAULT_ADMIN_EMAIL,
    DEFAULT_ADMIN_PASSWORD,
    DEFAULT_ADMIN_MOBILE_NUMBER,

    TESTING_AWS_ACCESS_KEY_ID,
    TESTING_AWS_SECRET_ACCESS_KEY,
    TESTING_AWS_REGION,
    TESTING_AWS_BUCKET_NAME,

    PRODUCTION_AWS_ACCESS_KEY_ID,
    PRODUCTION_AWS_SECRET_ACCESS_KEY,
    PRODUCTION_AWS_REGION,
    PRODUCTION_AWS_BUCKET_NAME,

    CONTRACT_PRODUCTION_HOST,
    PRODUCTION_HOST,
    PRODUCTION_MONGO_HOST,

    PAGARME_SECRET_KEY_TEST,
    PAGARME_SECRET_KEY,
    PAGARME_API_URI,

    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    TWILIO_PHONE_NUMBER_WHATSAPP,

    NODEMAILER_USERID,
    NODEMAILER_PASSWORD,
    TIMEZONE,

    FRONTEND_URL_LOCAL,
    FRONTEND_URL_PRODUCTION,
    ZAPSIGN_API_TOKEN,
    TESTING_ZAPSIGN_API_URI, 
    PRODUCTION_ZAPSIGN_API_URI,
  } = process.env;

  const config = {};
  config.env = env;

  config.jwtSecretRefreshUser = JWT_SECRET_REFRESH_USER;

  config.jwtSecretAccessUser = JWT_SECRET_ACCESS_USER;

  config.jwtAccessTimeout = JWT_ACCESS_TIMEOUT;
  config.jwtRefreshTimeout = JWT_REFRESH_TIMEOUT;

  config.defaultAdminName = DEFAULT_ADMIN_NAME;
  config.defaultAdminEmail = DEFAULT_ADMIN_EMAIL;
  config.defaultAdminPassword = DEFAULT_ADMIN_PASSWORD;
  config.defaultAdminMobileNumber = DEFAULT_ADMIN_MOBILE_NUMBER;
  config.pagarMeSecretKey = PAGARME_SECRET_KEY;


  config.passwordSalt = 12;
 
  config.pagarMeBaseUrl = PAGARME_API_URI;

  config.nodemailerUserId = NODEMAILER_USERID;
  config.nodemailerPassword = NODEMAILER_PASSWORD;
  config.defaultImage = `${LOCAL_HOST}/temp/default_image.webp`;

  config.twilioAccountSid = TWILIO_ACCOUNT_SID
  config.twilioAuthToken = TWILIO_AUTH_TOKEN
  config.twilioPhoneNumber = TWILIO_PHONE_NUMBER
  config.twilioPhoneNumberWhatsApp = TWILIO_PHONE_NUMBER_WHATSAPP

  config.timeZone = TIMEZONE;
  config.zapsignToken = ZAPSIGN_API_TOKEN;

  if (env === "local") {
    config.port = PORT;
    config.mongoHost = LOCAL_MONGO_HOST;

    config.frontendUrl = FRONTEND_URL_LOCAL

    config.contract_host = LOCAL_HOST;
    config.host = LOCAL_HOST;

    config.baseUrl = config.host + "/api/v1";

    config.aws = {};
    config.aws.accessKeyId = TESTING_AWS_ACCESS_KEY_ID;
    config.aws.secretAccessKey = TESTING_AWS_SECRET_ACCESS_KEY;
    config.aws.region = TESTING_AWS_REGION;
    config.aws.bucketName = TESTING_AWS_BUCKET_NAME;
    config.pagarMeSecretKey = PAGARME_SECRET_KEY_TEST;
    
    config.zapsignUrl = TESTING_ZAPSIGN_API_URI;

    console.log("config", config);
    return config;
  } else if (env === "test") {
    config.port = TEST_PORT;
    config.mongoHost = TEST_MONGO_HOST;

    config.host = TESTING_HOST;

    config.aws = {};
    config.aws.accessKeyId = TESTING_AWS_ACCESS_KEY_ID;
    config.aws.secretAccessKey = TESTING_AWS_SECRET_ACCESS_KEY;
    config.aws.region = TESTING_AWS_REGION;
    config.aws.bucketName = TESTING_AWS_BUCKET_NAME;

    config.zapsignUrl = TESTING_ZAPSIGN_API_URI;

    console.log("config", config);
    return config;
  } else {
    config.port = PRODUCTION_PORT;
    config.mongoHost = PRODUCTION_MONGO_HOST;

    config.frontendUrl = FRONTEND_URL_PRODUCTION

    config.contract_host = CONTRACT_PRODUCTION_HOST;
    config.host = PRODUCTION_HOST;

    config.aws = {};
    config.aws.accessKeyId = PRODUCTION_AWS_ACCESS_KEY_ID;
    config.aws.secretAccessKey = PRODUCTION_AWS_SECRET_ACCESS_KEY;
    config.aws.region = PRODUCTION_AWS_REGION;
    config.aws.bucketName = PRODUCTION_AWS_BUCKET_NAME;

    config.zapsignUrl = PRODUCTION_ZAPSIGN_API_URI;

    console.log("config", config);
    return config;
  }
};
