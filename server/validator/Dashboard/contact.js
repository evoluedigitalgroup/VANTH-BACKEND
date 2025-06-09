import lang from "../../helpers/locale/lang";

const generateDocumentValidator = async (req, res, next) => {
  const { contactId, requestId, permission } = req.body;
  if (req.user.permissions.clients) {
    if (contactId && requestId && permission) {
      next();
    } else if (!contactId) {
      res.json({
        success: false,
        message: lang.PLEASE_SELECT_PARTICULAR_USER.PR,
      });
    } else if (!requestId) {
      res.json({
        success: false,
        message: lang.PLEASE_SELECT_PARTICULAR_USER.PR,
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
};

const approveVisitorValidator = async (req, res, next) => {
  const { id, action } = req.body;

  if (id && action) {
    next();
  } else if (!id) {
    res.json({
      success: false,
      message: lang.PLEASE_SELECT_PARTICULAR_USER.PR,
    });
  } else {
    res.json({
      success: false,
      message: lang.PLEASE_SELECT_ACTION.PR,
    });
  }
};

export { generateDocumentValidator, approveVisitorValidator };
