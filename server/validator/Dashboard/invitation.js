import lang from "../../helpers/locale/lang";

const invitationValidator = async (req, res, next) => {
  const { designation, permissions, code } = req.body;
  if (req.admin.permissions.newAdmin) {
    if (designation && permissions && code) {
      next();
    } else if (!designation) {
      res.json({
        success: false,
        message: lang.PLEASE_ENTER_DESIGNATION.PR,
      });
    } else if (!permissions) {
      res.json({
        success: false,
        message: lang.PLEASE_SELECT_PERMISSION.PR,
      });
    } else {
      res.json({
        success: false,
        message: lang.PLEASE_ENTER_CODE.PR,
      });
    }
  } else {
    res.json({
      success: false,
      message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
    });
  }
};

export { invitationValidator };
