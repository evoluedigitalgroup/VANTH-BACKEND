import express from "express";

// 	Controllers
import IncreamentVisitor from "./controller/public/IncreamentVisitor";
import GetDocumentDetails from "./controller/public/GetDocumentDetails";
import SubmitDocuments from "./controller/public/SubmitDocuments";
import GetContactDetails from "./controller/Dashboard/GetContactDetails";
import contactController from "./controller/Dashboard/contact";
const router = express.Router();

/**
 * PUBLIC ROUTES
*/
router.use("/", IncreamentVisitor);
router.use("/", GetDocumentDetails);
router.use("/doc", SubmitDocuments);
router.use("/contacts", contactController);

/**
 * ADMIN ROUTES
*/
import adminAuthController from "./controller/Admin/adminAuth";
import userAuthController from "./controller/User/userAuth";
import userInvitationController from "./controller/Dashboard/userInvitation";
import adminInvitationController from "./controller/Dashboard/adminInvitation";
import profileController from "./controller/Dashboard/profile";
import permissionController from "./controller/Dashboard/permission";
import SubmitContact from "./controller/Dashboard/SubmitContact";

import documentStatusController from "./controller/Dashboard/documentStatus";
import homeController from "./controller/Dashboard/home";

import contractController from "./controller/Dashboard/contract";


import planController from "./controller/Plans/list";
import usageController from "./controller/Plans/usage";

import paymentController from "./controller/Payment/subscribe";
import webhookController from "./controller/Payment/webhook";

router.use("/admin-auth", adminAuthController);
router.use("/auth", userAuthController);

router.use("/invite", userInvitationController);
router.use("/invite-admin", adminInvitationController);

router.use("/profile", profileController);

router.use("/permissions", permissionController);

router.use("/document", documentStatusController);

router.use("/contract", contractController);

router.use("/contact", SubmitContact);

router.use("/home", homeController);

router.use("/plans", planController)

router.use("/plans", usageController);

router.use("/payment", paymentController);

router.use("/payment", webhookController);


/**
 * ADVOCATE ROUTES
 */

/**
 * USER ROUTES
 */

export default router;
