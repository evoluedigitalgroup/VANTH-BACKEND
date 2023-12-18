import lang from "../../helpers/locale/lang";

const documentStatusValidator = (req, res, next) => {
  const { id, type, action } = req.body;
  if (req.user?.permissions.document) {
    if (id && type && action) {
      next();
    } else if (!id) {
      res.json({
        success: false,
        message: lang.PLEASE_SELECT_USER_PROPERLY.PR,
      });
    } else if (!type) {
      res.json({
        success: false,
        message: lang.PLEASE_SELECT_TYPE.PR,
      });
    } else {
      res.json({
        success: false,
        message: lang.PLEASE_SELECT_ACTION.PR,
      });
    }
  } else {
    res.json({
      success: false,
      message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
    });
  }
};

export { documentStatusValidator };
