import configureConfig from "./configurationData/CONFIGURE";
import securityConfig from "./configurationData/SECURITY";

const configurations = [
  //  CONFIGURE
  ...configureConfig,
  //  SECURITY
  ...securityConfig,
];

export default configurations;

/**
 * ADD NEW RECORDS DYNAMICALLY
 * -> Support Email
 */
