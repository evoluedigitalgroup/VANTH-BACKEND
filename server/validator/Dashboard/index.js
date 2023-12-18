import { userInviteValidator, adminInviteValidator } from "./invitation";
import { generateDocumentValidator, approveVisitorValidator } from "./contact";
import { documentStatusValidator } from "./documentStatus";
import {
  weekValidation,
  monthlyValidation,
  yearlyValidation,
  customDateValidation,
} from "./home";

export default {
  userInviteValidator,
  adminInviteValidator,
  generateDocumentValidator,
  documentStatusValidator,
  weekValidation,
  monthlyValidation,
  yearlyValidation,
  customDateValidation,
  approveVisitorValidator,
};
