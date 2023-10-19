import express from "express";

// 	Controllers
import IncreamentVisitor from "./controller/public/IncreamentVisitor";
import SubmitContact from "./controller/public/SubmitContact";
import GetDocumentDetails from "./controller/public/GetDocumentDetails";
import SubmitDocuments from "./controller/public/SubmitDocuments";
import GetContactDetails from "./controller/Dashboard/GetContactDetails";
import contactController from "./controller/Dashboard/contact";
const router = express.Router();

/**
 * PUBLIC ROUTES
 */
router.use("/", IncreamentVisitor);
router.use("/", SubmitContact);
router.use("/", GetDocumentDetails);
router.use("/doc", SubmitDocuments);
router.use("/contacts", contactController);

/**
 * ADMIN ROUTES
 */
import adminAuthController from "./controller/Admin/adminAuth";
import invitationController from "./controller/Dashboard/invitation";
import profileController from "./controller/Dashboard/profile";
import permissionController from "./controller/Dashboard/permission";
import documentStatusController from "./controller/Dashboard/documentStatus";
import homeController from "./controller/Dashboard/home";

router.use("/auth", adminAuthController);
router.use("/invite", invitationController);
router.use("/profile", profileController);
router.use("/permissions", permissionController);
router.use("/document", documentStatusController);
router.use("/home", homeController);
/**
 * ADVOCATE ROUTES
 */

/**
 * USER ROUTES
 */

export default router;
