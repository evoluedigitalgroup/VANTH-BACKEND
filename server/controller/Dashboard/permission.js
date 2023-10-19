import express from "express";
import Admin from "../../models/admin";
import authentication from "../../services/authentication";
import lang from "../../helpers/locale/lang";

const router = express.Router();

router.post(
  "/change-permission",
  authentication.AdminAuthValidateMiddleware,
  async (req, res) => {
    const adminObj = req.admin;
    if (adminObj.permissions.newAdmin) {
      const { permissions, id } = req.body;
      if (permissions) {
        const changePermission = await Admin.findByIdAndUpdate(
          id,
          { permissions },
          { new: true },
        );
        res.json({
          success: true,
          data: changePermission,
          message: lang.PERMISSION_CHANGE_SUCCESSFULLY.PR,
        });
      } else {
        res.json({
          success: false,
          message: lang.PLEASE_SELECT_PERMISSION.PR,
        });
      }
    } else {
      res.json({
        success: false,
        message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
      });
    }
  },
);

router.post(
  "/filter-admins-list",
  authentication.AdminAuthValidateMiddleware,
  async (req, res) => {
    const adminObj = req.admin;

    const { startFrom, totalFetchRecords, search = "" } = req.body;

    let searchObj = {};
    if (search) {
      const regExpValue = new RegExp(search, "i");

      searchObj = {
        name: regExpValue,
      };
    }

    if (adminObj.permissions.newAdmin) {
      const totalAdminList = await Admin.find({
        $and: [
          { isMainAdmin: false },
          searchObj,
          { _id: { $ne: adminObj.id } },
        ],
      }).countDocuments();

      const adminList = await Admin.find({
        $and: [
          { isMainAdmin: false },
          searchObj,
          { _id: { $ne: adminObj.id } },
        ],
      })
        .sort({ _id: "desc" })
        .skip(startFrom)
        .limit(totalFetchRecords);

      const response = {
        adminList,
        totalAdminList,
      };

      res.json({
        success: true,
        data: response,
        message: null,
      });
    } else {
      res.json({
        success: false,
        message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
      });
    }
  },
);

export default router;
