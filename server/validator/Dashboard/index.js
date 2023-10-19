import { invitationValidator } from "./invitation";
import { generateDocumentValidator, approveVisitorValidator } from "./contact";
import { documentStatusValidator } from "./documentStatus";
import {
  weekValidation,
  monthlyValidation,
  yearlyValidation,
  customDateValidation,
} from "./home";

export default {
  invitationValidator,
  generateDocumentValidator,
  documentStatusValidator,
  weekValidation,
  monthlyValidation,
  yearlyValidation,
  customDateValidation,
  approveVisitorValidator,
};
