import lang from "../helpers/locale/lang";

export const USER_RIGHTS_ACTIONS = {
  OFFICE_TYPE: "office_type",
  OCCUPATION_AREA: "occupation_area",
  NOTES_TYPE: "notes_type",
  PLAN: "plan",
  MANAGE_ADMINS: "manage_admins",
  MANAGE_ADVOCATES: "manage_advocate",
  DASHBOARD: "dashboard",
  NOTIFICATIONS: "notification",
};

const officeTypePermissionHelper = (req, type) => {
  console.log("req.admin :: ", req.admin);
  const findPermission = req.admin.permission.find(ele => {
    return ele.label === type;
  });
  return findPermission;
};
const occupationAreaPermissionHelper = (req, type) => {
  console.log("req.admin :: ", req.admin);
  const findPermission = req.admin.permission.find(ele => {
    return ele.label === type;
  });
  return findPermission;
};
const notesTypePermissionHelper = (req, type) => {
  console.log("req.admin :: ", req.admin);
  const findPermission = req.admin.permission.find(ele => {
    return ele.label === type;
  });
  return findPermission;
};
const planPermissionHelper = (req, type) => {
  console.log("req.admin :: ", req.admin);
  const findPermission = req.admin.permission.find(ele => {
    return ele.label === type;
  });
  return findPermission;
};
const manageAdminsPermissionHelper = (req, type) => {
  console.log("req.admin :: ", req.admin);
  const findPermission = req.admin.permission.find(ele => {
    return ele.label === type;
  });
  return findPermission;
};
const manageAdvocatePermissionHelper = (req, type) => {
  console.log("req.admin :: ", req.admin);
  const findPermission = req.admin.permission.find(ele => {
    return ele.label === type;
  });
  return findPermission;
};
const dashboardPermissionHelper = (req, type) => {
  console.log("req.admin :: ", req.admin);
  const findPermission = req.admin.permission.find(ele => {
    return ele.label === type;
  });
  return findPermission;
};
const notificationPermissionHelper = (req, type) => {
  console.log("req.admin :: ", req.admin);
  const findPermission = req.admin.permission.find(ele => {
    return ele.label === type;
  });
  return findPermission;
};

const officeTypePermissionChecker = (req, res, next, type) => {
  if (officeTypePermissionHelper(req, type)) {
    next();
  } else {
    res.json({
      success: false,
      message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
    });
  }
};
const occupationAreaPermissionChecker = (req, res, next, type) => {
  if (occupationAreaPermissionHelper(req, type)) {
    next();
  } else {
    res.json({
      success: false,
      message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
    });
  }
};

const notesTypePermissionChecker = (req, res, next, type) => {
  if (notesTypePermissionHelper(req, type)) {
    next();
  } else {
    res.json({
      success: false,
      message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
    });
  }
};

const planPermissionChecker = (req, res, next, type) => {
  if (planPermissionHelper(req, type)) {
    next();
  } else {
    res.json({
      success: false,
      message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
    });
  }
};

const manageAdminsPermissionChecker = (req, res, next, type) => {
  if (manageAdminsPermissionHelper(req, type)) {
    next();
  } else {
    res.json({
      success: false,
      message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
    });
  }
};

const manageAdvocatePermissionChecker = (req, res, next, type) => {
  if (manageAdvocatePermissionHelper(req, type)) {
    next();
  } else {
    res.json({
      success: false,
      message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
    });
  }
};

const dashboardPermissionChecker = (req, res, next, type) => {
  if (dashboardPermissionHelper(req, type)) {
    next();
  } else {
    res.json({
      success: false,
      message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
    });
  }
};
const notificationPermissionChecker = (req, res, next, type) => {
  if (notificationPermissionHelper(req, type)) {
    next();
  } else {
    res.json({
      success: false,
      message: lang.YOU_DON_T_HAVE_THIS_PERMISSION.PR,
    });
  }
};

const checkUserRights = action => (req, res, next) => {
  if (action === USER_RIGHTS_ACTIONS.OFFICE_TYPE) {
    officeTypePermissionChecker(req, res, next, "office_type");
  } else if (action === USER_RIGHTS_ACTIONS.OCCUPATION_AREA) {
    occupationAreaPermissionChecker(req, res, next, "occupation_area");
  } else if (action === USER_RIGHTS_ACTIONS.NOTES_TYPE) {
    notesTypePermissionChecker(req, res, next, "notes_type");
  } else if (action === USER_RIGHTS_ACTIONS.PLAN) {
    planPermissionChecker(req, res, next, "plan");
  } else if (action === USER_RIGHTS_ACTIONS.MANAGE_ADMINS) {
    manageAdminsPermissionChecker(req, res, next, "manage_admins");
  } else if (action === USER_RIGHTS_ACTIONS.MANAGE_ADVOCATES) {
    manageAdvocatePermissionChecker(req, res, next, "manage_advocate");
  } else if (action === USER_RIGHTS_ACTIONS.DASHBOARD) {
    dashboardPermissionChecker(req, res, next, "dashboard");
  } else if (action === USER_RIGHTS_ACTIONS.NOTIFICATIONS) {
    notificationPermissionChecker(req, res, next, "notification");
  }
};

export default checkUserRights;
