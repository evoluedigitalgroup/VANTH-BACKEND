import config from "../../../config";

const staticPath = "/temp/";

const default_avatar = config.host + staticPath + "default_avatar.jpeg"; //path.resolve("public", "images", "BeachUmbrella.png");
const default_bank = config.host + staticPath + "default_bank.png";
const default_food = config.host + staticPath + "default_food.png";
const default_res = config.host + staticPath + "default_res.png";
const logo = config.host + staticPath + "logo.jpg";

export const WHATSAPP_SUPPORT = "WHATSAPP_SUPPORT";
export const USER_POLICY = "USER_POLICY";
export const USER_TERMS = "USER_TERMS";
export const ADVOCATE_POLICY = "ADVOCATE_POLICY";
export const ADVOCATE_CONTRACT = "ADVOCATE_CONTRACT";
export const ALLOW_FREE_TRIAL = "ALLOW_FREE_TRIAL";
export const ALLOW_GOOGLE_PAY = "ALLOW_GOOGLE_PAY";
export const ALLOW_APPLE_PAY = "ALLOW_APPLE_PAY";
export const SHOW_FACEBOOK = "SHOW_FACEBOOK";
export const SHOW_GOOGLE = "SHOW_GOOGLE";
export const SHOW_APPLE = "SHOW_APPLE";

export const SUBSCRIPTION_EXP_DAYS = "SUBSCRIPTION_EXP_DAYS";
export const TRIAL_EXP_DAYS = "TRIAL_EXP_DAYS";
export const DEFAULT_AVATAR = "DEFAULT_AVATAR";
// export const DEFAULT_PRODUCT = "DEFAULT_PRODUCT";
// export const DEFAULT_RESTAURANT_IMG = "DEFAULT_RESTAURANT_IMG";
// export const DEFAULT_BANK_IMG = "DEFAULT_BANK_IMG";

export const LOGO_IMG = "LOGO_IMG";

const configures = [
  {
    configType: "CONFIGURE",
    key: SUBSCRIPTION_EXP_DAYS,
    label: "Subscription expire days",
    value: 30,
    valueType: "string",
    isPublic: true,
  },
  {
    configType: "CONFIGURE",
    key: TRIAL_EXP_DAYS,
    label: "Trial expire days",
    value: 7,
    valueType: "string",
    isPublic: true,
  },
  {
    configType: "CONFIGURE",
    key: LOGO_IMG,
    label: "Site Logo",
    value: logo,
    valueType: "string",
    isPublic: true,
  },

  {
    configType: "CONFIGURE",
    key: WHATSAPP_SUPPORT,
    label: "WhatsApp Support",
    value: "000-1234-56789",
    valueType: "string",
    isPublic: true,
  },
  {
    configType: "CONFIGURE",
    key: USER_POLICY,
    label: "User Policy",
    value: "text text",
    valueType: "string",
    isPublic: true,
  },
  {
    configType: "CONFIGURE",
    key: ADVOCATE_POLICY,
    label: "Advocate Policy",
    value: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishi
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.ng software like Aldus PageMaker including versions 
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
    and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.`,
    valueType: "string",
    isPublic: true,
  },
  {
    configType: "CONFIGURE",
    key: ADVOCATE_CONTRACT,
    label: "Advocate Contract",
    value: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishi
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.ng software like Aldus PageMaker including versions 
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
    and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.`,
    valueType: "string",
    isPublic: true,
  },
  {
    configType: "CONFIGURE",
    key: USER_TERMS,
    label: "User Terms and conditions",
    value: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishi
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.ng software like Aldus PageMaker including versions 
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
    and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.`,
    valueType: "string",
    isPublic: true,
  },
  {
    configType: "CONFIGURE",
    key: SHOW_FACEBOOK,
    label: "Show Facebook button",
    value: false,
    valueType: "boolean",
    isPublic: true,
  },

  {
    configType: "CONFIGURE",
    key: ALLOW_FREE_TRIAL,
    label: "Allow Free Trial",
    value: false,
    valueType: "boolean",
    isPublic: true,
  },
  {
    configType: "CONFIGURE",
    key: ALLOW_GOOGLE_PAY,
    label: "Allow Google Pay",
    value: false,
    valueType: "boolean",
    isPublic: true,
  },
  {
    configType: "CONFIGURE",
    key: ALLOW_APPLE_PAY,
    label: "Allow Apple Pay",
    value: false,
    valueType: "boolean",
    isPublic: true,
  },
  {
    configType: "CONFIGURE",
    key: SHOW_GOOGLE,
    label: "Show Google button",
    value: false,
    valueType: "boolean",
    isPublic: true,
  },
  {
    configType: "CONFIGURE",
    key: SHOW_APPLE,
    label: "Show Apple button",
    value: false,
    valueType: "boolean",
    isPublic: true,
  },
  // {
  // 	configType: "CONFIGURE",
  // 	key: DEFAULT_PRODUCT,
  // 	label: "Default Product Picture",
  // 	value: default_food,
  // 	valueType: "string",
  // 	isPublic: true,
  // },
  {
    configType: "CONFIGURE",
    key: DEFAULT_AVATAR,
    label: "Default Profile Picture",
    value: default_avatar,
    valueType: "string",
    isPublic: true,
  },
  // {
  // 	configType: "CONFIGURE",
  // 	key: DEFAULT_RESTAURANT_IMG,
  // 	label: "Default Restaurant Picture",
  // 	value: default_res,
  // 	valueType: "string",
  // 	isPublic: true,
  // },
  // {
  // 	configType: "CONFIGURE",
  // 	key: DEFAULT_BANK_IMG,
  // 	label: "Default Bank Picture",
  // 	value: default_bank,
  // 	valueType: "string",
  // 	isPublic: true,
  // },
];

export default configures;
