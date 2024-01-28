import express from "express";
import User from "../../models/users";
import authentication from "../../services/authentication";
import lang from "../../helpers/locale/lang";

const router = express.Router();

router.post(
  "/change-permission",
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
    const userObj = req.user;
    if (userObj.permissions.newUser) {
      const { permissions, id } = req.body;
      if (permissions) {
        const changePermission = await User.findByIdAndUpdate(
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
  "/filter-users-list",
  authentication.UserAuthValidateMiddleware,
  async (req, res) => {
    const userObj = req.user;

    const { startFrom, totalFetchRecords, search = "" } = req.body;

    let searchObj = {};
    if (search) {
      const regExpValue = new RegExp(search, "i");

      searchObj = {
        company: userObj.company,
        name: regExpValue,
      };
    }

    if (userObj.permissions.newUser) {
      const totalUserList = await User.find({
        $and: [
          { isMainUser: false },
          searchObj,
          { _id: { $ne: userObj.id } },
        ],
      }).countDocuments();

      const userList = await User.find({
        $and: [
          { isMainUser: false },
          searchObj,
          { _id: { $ne: userObj.id } },
        ],
      })
        .sort({ _id: "desc" })
        .skip(startFrom)
        .limit(totalFetchRecords);

      const response = {
        userList,
        totalUserList,
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
