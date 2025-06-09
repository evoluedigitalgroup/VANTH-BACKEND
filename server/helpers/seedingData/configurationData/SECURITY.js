import utility from "../../utility";

export const EMAIL_VERIFICATION_CODE_EXPIRE_TIME =
  "EMAIL_VERIFICATION_CODE_EXPIRE_TIME";
export const ACCESS_TOKEN_TIMEOUT = "ACCESS_TOKEN_TIMEOUT";
export const REFRESH_TOKEN_TIMEOUT = "REFRESH_TOKEN_TIMEOUT";
export const ADMIN_ACCESS_TOKEN_TIMEOUT = "ADMIN_ACCESS_TOKEN_TIMEOUT";
export const ADMIN_REFRESH_TOKEN_TIMEOUT = "ADMIN_REFRESH_TOKEN_TIMEOUT";
export const CHECK_UNIQUE_DEVICE_ID = "CHECK_UNIQUE_DEVICE_ID";
export const RESEND_FORGOT_PIN_TIMEOUT = "RESEND_FORGOT_PIN_TIMEOUT";
export const RESEND_MOBILE_OTP_TIMEOUT = "RESEND_MOBILE_OTP_TIMEOUT";
export const SAME_DEVICE_SIGNUP_FLAG_EMAIL = "SAME_DEVICE_SIGNUP_FLAG_EMAIL";

export const NO_OF_ATTEMPTS_LOGIN = "NO_OF_ATTEMPTS_LOGIN";
export const NO_OF_ATTEMPTS_ADMIN_LOGIN = "NO_OF_ATTEMPTS_ADMIN_LOGIN";
export const NO_OF_ATTEMPTS_MOBILE_OTP_VERIFY =
  "NO_OF_ATTEMPTS_MOBILE_OTP_VERIFY";
export const NO_OF_ATTEMPTS_EMAIL_VERIFY_LINK =
  "NO_OF_ATTEMPTS_EMAIL_VERIFY_LINK";
export const NO_OF_ATTEMPTS_FORGOT_OTP_VERIFY =
  "NO_OF_ATTEMPTS_FORGOT_OTP_VERIFY";
export const NO_OF_ATTEMPTS_UPDATE_PIN_EMAIL_OTP_VERIFY =
  "NO_OF_ATTEMPTS_UPDATE_PIN_EMAIL_OTP_VERIFY";
export const FORGOT_OTP_TIMEOUT = "FORGOT_OTP_TIMEOUT";

export const BLOCK_USER_TIME_FOR_MAX_ATTEMPT_LOGIN =
  "BLOCK_USER_TIME_FOR_MAX_ATTEMPT_LOGIN";
export const BLOCK_USER_TIME_FOR_MAX_ATTEMPT_MOBILE_OTP =
  "BLOCK_USER_TIME_FOR_MAX_ATTEMPT_MOBILE_OTP";
export const BLOCK_USER_TIME_FOR_MAX_ATTEMPT_EMAIL_LINK =
  "BLOCK_USER_TIME_FOR_MAX_ATTEMPT_EMAIL_LINK";
export const BLOCK_USER_TIME_FOR_MAX_ATTEMPT_EMAIL_OTP =
  "BLOCK_USER_TIME_FOR_MAX_ATTEMPT_EMAIL_OTP";
export const BLOCK_USER_TIME_FOR_UPDATE_PIN_EMAIL_OTP =
  "BLOCK_USER_TIME_FOR_UPDATE_PIN_EMAIL_OTP";

export const VERIFIED_OTP_ACCESS_TOKEN_TIMEOUT =
  "VERIFIED_OTP_ACCESS_TOKEN_TIMEOUT";
export const VERIFIED_OTP_REFRESH_TOKEN_TIMEOUT =
  "VERIFIED_OTP_REFRESH_TOKEN_TIMEOUT";
export const BLOCK_FOR_TOO_MANY_ATTEMPTS = "BLOCK_FOR_TOO_MANY_ATTEMPTS";

const securityConfigurations = [
  {
    configType: "SECURITY",
    key: BLOCK_FOR_TOO_MANY_ATTEMPTS,
    label: "Block for too many attemps",
    value: "TOO_MANY_ATTEMPS",
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: FORGOT_OTP_TIMEOUT,
    label: "Forgot password otp timeout",
    value: utility.timer().MINUTE_30,
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: VERIFIED_OTP_ACCESS_TOKEN_TIMEOUT,
    label: "Verified otp Access token timeout",
    value: utility.timer().MINUTE_5,
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: VERIFIED_OTP_REFRESH_TOKEN_TIMEOUT,
    label: "Verified otp Refresh token timeout",
    value: utility.timer().MINUTE_5,
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: EMAIL_VERIFICATION_CODE_EXPIRE_TIME, // ONLY FOR FORGOT PIN
    label: "Email verification code expire time",
    value: utility.timer().MINUTE_30,
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: ACCESS_TOKEN_TIMEOUT,
    label: "Access token timeout",
    value: utility.timer().MINUTE_15,
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: REFRESH_TOKEN_TIMEOUT,
    label: "Refresh token timeout",
    value: utility.timer().DAY,
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: ADMIN_ACCESS_TOKEN_TIMEOUT,
    label: "Admin Access token timeout",
    value: utility.timer().MINUTE_15,
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: ADMIN_ACCESS_TOKEN_TIMEOUT,
    label: "Admin Refresh token timeout",
    value: utility.timer().DAY * 365,
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: CHECK_UNIQUE_DEVICE_ID,
    label: "Check unique device id",
    value: true,
    valueType: "boolean",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: RESEND_FORGOT_PIN_TIMEOUT,
    label: "Resend forgot Pin Timeout",
    value: utility.timer().MINUTE * 2,
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: RESEND_MOBILE_OTP_TIMEOUT,
    label: "Resend Mobile OTP Timeout",
    value: utility.timer().MINUTE * 2,
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: SAME_DEVICE_SIGNUP_FLAG_EMAIL,
    label: "Same Device Signup Flag Email",
    value: "chirag@vanceh.com.br",
    valueType: "string",
    isPublic: false,
  },

  {
    configType: "SECURITY",
    key: NO_OF_ATTEMPTS_LOGIN,
    label: "Total no. of attempts allowed to login",
    value: "5",
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: NO_OF_ATTEMPTS_ADMIN_LOGIN,
    label: "Total no. of attempts Admin allowed to login",
    value: "5",
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: NO_OF_ATTEMPTS_MOBILE_OTP_VERIFY,
    label: "Total no. of attempts allowed to verify mobile via SMS OTP",
    value: "5",
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: NO_OF_ATTEMPTS_EMAIL_VERIFY_LINK,
    label:
      "Total no. of attempts allowed to verify email via verification link",
    value: "5",
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: NO_OF_ATTEMPTS_FORGOT_OTP_VERIFY,
    label: "Total no. of attempts allowed to verify forgot OTP via email OTP",
    value: "5",
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: NO_OF_ATTEMPTS_UPDATE_PIN_EMAIL_OTP_VERIFY,
    label:
      "Total no. of attempts allowed to verify update pin OTP via email OTP",
    value: "5",
    valueType: "string",
    isPublic: false,
  },

  {
    configType: "SECURITY",
    key: BLOCK_USER_TIME_FOR_MAX_ATTEMPT_LOGIN,
    label: "Block user time for max attempt login",
    value: utility.timer().SECOND,
    valueType: "string",
    isPublic: false,
  },

  {
    configType: "SECURITY",
    key: BLOCK_USER_TIME_FOR_MAX_ATTEMPT_EMAIL_OTP,
    label: "Block user time for max attempt email otp",
    value: utility.timer().HOUR,
    valueType: "string",
    isPublic: false,
  },
  {
    configType: "SECURITY",
    key: BLOCK_USER_TIME_FOR_UPDATE_PIN_EMAIL_OTP,
    label: "Block user time for max attempt update pin email otp",
    value: utility.timer().HOUR,
    valueType: "string",
    isPublic: false,
  },
];

export default securityConfigurations;
