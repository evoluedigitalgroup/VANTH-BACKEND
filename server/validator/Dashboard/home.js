import moment from "moment";
import _ from "lodash";
import Contacts from "../../models/Contacts";
import Visitors from "../../models/visitors";
import utility from "../../helpers/utility";
import { toFloat } from "../../helpers/utility";

export const weekValidation = async (condition, preCondition) => {
  return new Promise(async (resolve, reject) => {
    console.log("condition ::::: ", condition);
    console.log("preCondition ::::: ", preCondition);

    var getDaysArray = function (s, e) {
      let i = 0;
      for (
        var a = {}, d = new Date(s);
        d <= new Date(e);
        d.setDate(d.getDate() + 1)
      ) {
        a[moment(new Date(d)).format("YYYY-MM-DD")] = i;

        // a.push(new Date(d));
      }
      return a;
    };

    var daylist = getDaysArray(
      new Date(condition.$gte),
      new Date(condition.$lt),
    );

    const visitorData = await Visitors.aggregate([
      {
        $match: {
          createdAt: condition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          // list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          //   list: { name: 1, email: 1, isOwner: 1 },
          count: 1,
        },
      },
    ]);

    let visitorObj = {};
    visitorData.map(i => {
      visitorObj[i._id] = i;
      i["week"] = moment(i._id).locale("pt-br").format("dddd");
      i["sortWeek"] = moment(i._id).locale("pt-br").format("ddd");
      i["month"] = moment(i._id).locale("pt-br").format("MMMM");
      return i;
    });
    const finalVisitor = Object.keys(daylist).map(dateVal => {
      return {
        _id: dateVal,
        count: 0,
        week: moment(dateVal).locale("pt-br").format("dddd"),
        sortWeek: moment(dateVal).locale("pt-br").format("ddd"),
        month: moment(dateVal).locale("pt-br").format("MMMM"),
        ...(visitorObj[dateVal] ? visitorObj[dateVal] : {}),
      };
    });

    const contactData = await Contacts.aggregate([
      {
        $match: {
          createdAt: condition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          // list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          list: 1,
          count: 1,
        },
      },
    ]);

    const contactObj = {};

    contactData.map(i => {
      (contactObj[i._id] = i),
        (i["week"] = moment(i._id).locale("pt-br").format("dddd"));
      i["sortWeek"] = moment(i._id).locale("pt-br").format("ddd");
      i["month"] = moment(i._id).locale("pt-br").format("MMMM");
      return i;
    });

    const finalContact = Object.keys(daylist).map(dateVal => {
      return {
        _id: dateVal,
        count: 0,
        week: moment(dateVal).locale("pt-br").format("dddd"),
        sortWeek: moment(dateVal).locale("pt-br").format("ddd"),
        month: moment(dateVal).locale("pt-br").format("MMMM"),
        ...(contactObj[dateVal] ? contactObj[dateVal] : {}),
      };
    });

    const preVisitorData = await Visitors.aggregate([
      {
        $match: {
          createdAt: preCondition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          // list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          //   list: { name: 1, email: 1, isOwner: 1 },
          count: 1,
        },
      },
    ]);

    const preContactData = await Contacts.aggregate([
      {
        $match: {
          createdAt: preCondition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          // list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          // list: 1,
          count: 1,
        },
      },
    ]);

    const data = [...visitorData, ...contactData];

    let currentVisitor = _.sumBy(visitorData, function (obj) {
      return obj.count;
    });

    let preVisitor = _.sumBy(preVisitorData, function (obj) {
      return obj.count;
    });

    let currentContact = _.sumBy(contactData, function (obj) {
      return obj.count;
    });
    let preContact = _.sumBy(preContactData, function (obj) {
      return obj.count;
    });

    const growthOfContact = toFloat(
      (100 * (toFloat(currentContact) - toFloat(preContact))) /
        toFloat(preContact),
    );

    const growthOfVisitor = toFloat(
      (100 * (toFloat(currentVisitor) - toFloat(preVisitor))) /
        toFloat(preVisitor),
    );

    let tempVal = {};
    if (growthOfContact >= 0) {
      tempVal.contact = `${
        growthOfContact == "Infinity" ? 100 : growthOfContact
      }% nessa semana`;
      tempVal.contactIndication = "increment";
    } else {
      tempVal.contact = `${Math.abs(
        growthOfContact == "Infinity" ? 100 : growthOfContact,
      )}% nessa semana`;
      tempVal.contactIndication = "decrement";
    }

    if (growthOfVisitor >= 0) {
      tempVal.visitor = `${
        growthOfVisitor == "Infinity" ? 100 : growthOfVisitor
      }% nessa semana`;
      tempVal.visitorIndication = "increment";
    } else {
      tempVal.visitor = `${Math.abs(
        growthOfVisitor == "Infinity" ? 100 : growthOfVisitor,
      )}% nessa semana`;
      tempVal.visitorIndication = "decrement";
    }

    visitorData.sort(function (a, b) {
      var c = new Date(a._id);
      var d = new Date(b._id);
      return c - d;
    });

    contactData.sort(function (a, b) {
      var c = new Date(a._id);
      var d = new Date(b._id);
      return c - d;
    });

    const reqDate = {
      startingDate: moment(condition.$gte).locale("pt-br").format("DD MMM"),
      endingDate: moment(new Date(condition.$lt.setUTCHours(0, 0, 0, 0)))
        .locale("pt-br")
        .format("DD MMM"),
    };
    console.log("reqDate", reqDate);

    const response = {
      visitorData: finalVisitor,
      contactData: finalContact,
      totalVisitor: currentVisitor,
      totalContact: currentContact,
      growth: tempVal,
      growthOfVisitor: preVisitor == 0 ? 100 : growthOfVisitor,
      growthOfContact: preContact == 0 ? 100 : growthOfContact,
      reqDate,
    };

    resolve({
      success: true,
      data: response,
    });
  });
};

export const monthlyValidation = async (condition, preCondition) => {
  return new Promise(async (resolve, reject) => {
    console.log("condition ::::: ", condition);
    console.log("preCondition ::::: ", preCondition);
    const reqDate = {
      startingDate: moment(condition.$gte).locale("pt-br").format("DD MMM"),
      endingDate: moment(condition.$lt).locale("pt-br").format("DD MMM"),
    };

    var getDaysArray = function (s, e) {
      let i = 0;
      for (
        var a = {}, d = new Date(s);
        d <= new Date(e);
        d.setDate(d.getDate() + 1)
      ) {
        a[moment(new Date(d)).format("YYYY-MM-DD")] = i;

        // a.push(new Date(d));
      }
      return a;
    };

    var daylist = getDaysArray(
      new Date(condition.$gte),
      new Date(condition.$lt),
    );

    const visitorData = await Visitors.aggregate([
      {
        $match: {
          createdAt: condition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          //   list: { name: 1, email: 1, isOwner: 1 },
          count: 1,
        },
      },
    ]);

    let visitorObj = {};
    visitorData.map(i => {
      visitorObj[i._id] = i;
      i["week"] = moment(i._id).locale("pt-br").format("dddd");
      i["sortWeek"] = moment(i._id).locale("pt-br").format("ddd");
      i["month"] = moment(i._id).locale("pt-br").format("MMMM");
      return i;
    });

    const finalVisitor = Object.keys(daylist).map(dateVal => {
      return {
        _id: dateVal,
        count: 0,
        week: moment(dateVal).locale("pt-br").format("dddd"),
        sortWeek: moment(dateVal).locale("pt-br").format("ddd"),
        month: moment(dateVal).locale("pt-br").format("MMMM"),
        ...(visitorObj[dateVal] ? visitorObj[dateVal] : {}),
      };
    });

    const contactData = await Contacts.aggregate([
      {
        $match: {
          createdAt: condition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          // list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          list: 1,
          count: 1,
        },
      },
    ]);

    const contactObj = {};

    contactData.map(i => {
      (contactObj[i._id] = i),
        (i["week"] = moment(i._id).locale("pt-br").format("dddd"));
      i["sortWeek"] = moment(i._id).locale("pt-br").format("ddd");
      i["month"] = moment(i._id).locale("pt-br").format("MMMM");
      return i;
    });

    const finalContact = Object.keys(daylist).map(dateVal => {
      return {
        _id: dateVal,
        count: 0,
        week: moment(dateVal).locale("pt-br").format("dddd"),
        sortWeek: moment(dateVal).locale("pt-br").format("ddd"),
        month: moment(dateVal).locale("pt-br").format("MMMM"),
        ...(contactObj[dateVal] ? contactObj[dateVal] : {}),
      };
    });

    const preVisitorData = await Visitors.aggregate([
      {
        $match: {
          createdAt: preCondition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          //   list: { name: 1, email: 1, isOwner: 1 },
          count: 1,
        },
      },
    ]);

    const preContactData = await Contacts.aggregate([
      {
        $match: {
          createdAt: preCondition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          // list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          // list: 1,
          count: 1,
        },
      },
    ]);

    const data = [...visitorData, ...contactData];

    let currentVisitor = _.sumBy(visitorData, function (obj) {
      return obj.count;
    });

    let preVisitor = _.sumBy(preVisitorData, function (obj) {
      return obj.count;
    });

    let currentContact = _.sumBy(contactData, function (obj) {
      return obj.count;
    });
    let preContact = _.sumBy(preContactData, function (obj) {
      return obj.count;
    });

    const growthOfContact = toFloat(
      (100 * (toFloat(currentContact) - toFloat(preContact))) /
        toFloat(preContact),
    );

    const growthOfVisitor = toFloat(
      (100 * (toFloat(currentVisitor) - toFloat(preVisitor))) /
        toFloat(preVisitor),
    );

    let tempVal = {};
    if (growthOfContact >= 0) {
      tempVal.contact = `${
        growthOfContact == "Infinity" ? 100 : growthOfContact
      }% nessa Mês`;
      tempVal.contactIndication = "increment";
    } else {
      tempVal.contact = `${Math.abs(
        growthOfContact == "Infinity" ? 100 : growthOfContact,
      )}% nessa Mês`;
      tempVal.contactIndication = "decrement";
    }

    if (growthOfVisitor >= 0) {
      tempVal.visitor = `${
        growthOfVisitor == "Infinity" ? 100 : growthOfVisitor
      }% nessa Mês`;
      tempVal.visitorIndication = "increment";
    } else {
      tempVal.visitor = `${Math.abs(
        growthOfVisitor == "Infinity" ? 100 : growthOfVisitor,
      )}% nessa Mês`;
      tempVal.visitorIndication = "decrement";
    }

    visitorData.sort(function (a, b) {
      var c = new Date(a._id);
      var d = new Date(b._id);
      return c - d;
    });

    contactData.sort(function (a, b) {
      var c = new Date(a._id);
      var d = new Date(b._id);
      return c - d;
    });

    const response = {
      visitorData: finalVisitor,
      contactData: finalContact,
      totalVisitor: currentVisitor,
      totalContact: currentContact,
      growth: tempVal,
      growthOfVisitor: preVisitor == 0 ? 100 : growthOfVisitor,
      growthOfContact: preContact == 0 ? 100 : growthOfContact,
      reqDate,
    };

    resolve({
      success: true,
      data: response,
    });
  });
};

export const yearlyValidation = async (condition, preCondition) => {
  return new Promise(async (resolve, reject) => {
    console.log("condition ::::: ", condition);
    console.log("preCondition ::::: ", preCondition);

    const reqDate = {
      startingDate: moment(condition.$gte)
        .locale("pt-br")
        .format("DD MMM YYYY"),
      endingDate: moment(condition.$lt).locale("pt-br").format("DD MMM YYYY"),
    };

    var getDaysArray = function (s, e) {
      let i = 0;
      for (
        var a = {}, d = new Date(s);
        d <= new Date(e);
        d.setDate(d.getDate() + 1)
      ) {
        a[moment(new Date(d)).format("YYYY-MM")] = i;

        // a.push(new Date(d));
      }
      return a;
    };

    var daylist = getDaysArray(
      new Date(condition.$gte),
      new Date(condition.$lt),
    );

    const visitorData = await Visitors.aggregate([
      {
        $match: {
          createdAt: condition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          //   list: { name: 1, email: 1, isOwner: 1 },
          count: 1,
        },
      },
    ]);

    let visitorObj = {};
    const ab = visitorData.map(i => {
      visitorObj[i._id] = i;
      i["week"] = moment(i._id).locale("pt-br").format("dddd");
      i["sortWeek"] = moment(i._id).locale("pt-br").format("ddd");
      i["month"] = moment(i._id).locale("pt-br").format("MMM");
      return i;
    });
    const finalVisitor = Object.keys(daylist).map(dateVal => {
      return {
        _id: dateVal,
        count: 0,
        week: moment(dateVal).locale("pt-br").format("dddd"),
        sortWeek: moment(dateVal).locale("pt-br").format("ddd"),
        month: moment(dateVal).locale("pt-br").format("MMM"),
        ...(visitorObj[dateVal] ? visitorObj[dateVal] : {}),
      };
    });

    const contactData = await Contacts.aggregate([
      {
        $match: {
          createdAt: condition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          // list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          list: 1,
          count: 1,
        },
      },
    ]);

    const contactObj = {};

    contactData.map(i => {
      (contactObj[i._id] = i),
        (i["week"] = moment(i._id).locale("pt-br").format("dddd"));
      i["sortWeek"] = moment(i._id).locale("pt-br").format("ddd");
      i["month"] = moment(i._id).locale("pt-br").format("MMM");
      return i;
    });

    const finalContact = Object.keys(daylist).map(dateVal => {
      return {
        _id: dateVal,
        count: 0,
        week: moment(dateVal).locale("pt-br").format("dddd"),
        sortWeek: moment(dateVal).locale("pt-br").format("ddd"),
        month: moment(dateVal).locale("pt-br").format("MMM"),
        ...(contactObj[dateVal] ? contactObj[dateVal] : {}),
      };
    });

    const preVisitorData = await Visitors.aggregate([
      {
        $match: {
          createdAt: preCondition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          //   list: { name: 1, email: 1, isOwner: 1 },
          count: 1,
        },
      },
    ]);

    const preContactData = await Contacts.aggregate([
      {
        $match: {
          createdAt: preCondition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          // list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          // list: 1,
          count: 1,
        },
      },
    ]);

    const data = [...visitorData, ...contactData];

    let currentVisitor = _.sumBy(visitorData, function (obj) {
      return obj.count;
    });

    let preVisitor = _.sumBy(preVisitorData, function (obj) {
      return obj.count;
    });

    let currentContact = _.sumBy(contactData, function (obj) {
      return obj.count;
    });
    let preContact = _.sumBy(preContactData, function (obj) {
      return obj.count;
    });

    const growthOfContact = toFloat(
      (100 * (toFloat(currentContact) - toFloat(preContact))) /
        toFloat(preContact),
    );

    const growthOfVisitor = toFloat(
      (100 * (toFloat(currentVisitor) - toFloat(preVisitor))) /
        toFloat(preVisitor),
    );

    let tempVal = {};
    if (growthOfContact >= 0) {
      tempVal.contact = `${
        growthOfContact == "Infinity" ? 100 : growthOfContact
      }% nessa Ano`;
      tempVal.contactIndication = "increment";
    } else {
      tempVal.contact = `${Math.abs(
        growthOfContact == "Infinity" ? 100 : growthOfContact,
      )}% nessa Ano`;
      tempVal.contactIndication = "decrement";
    }

    if (growthOfVisitor >= 0) {
      tempVal.visitor = `${
        growthOfVisitor == "Infinity" ? 100 : growthOfVisitor
      }% nessa Ano`;
      tempVal.visitorIndication = "increment";
    } else {
      tempVal.visitor = `${Math.abs(
        growthOfVisitor == "Infinity" ? 100 : growthOfVisitor,
      )}% nessa Ano`;
      tempVal.visitorIndication = "decrement";
    }

    visitorData.sort(function (a, b) {
      var c = new Date(a._id);
      var d = new Date(b._id);
      return c - d;
    });

    contactData.sort(function (a, b) {
      var c = new Date(a._id);
      var d = new Date(b._id);
      return c - d;
    });

    const response = {
      visitorData: finalVisitor,
      contactData: finalContact,
      totalVisitor: currentVisitor,
      totalContact: currentContact,
      growth: tempVal,
      growthOfVisitor: preVisitor == 0 ? 100 : growthOfVisitor,
      growthOfContact: preContact == 0 ? 100 : growthOfContact,
      reqDate,
    };

    // data.map(i => {
    //   i["week"] = moment(i._id).locale("pt-br").format("dddd");
    //   i["sortWeek"] = moment(i._id).locale("pt-br").format("ddd");
    //   i["month"] = moment(i._id).locale("pt-br").format("MMMM");
    //   return i;
    // });
    resolve({
      success: true,
      data: response,
    });
  });
};

export const customDateValidation = async (condition, preCondition) => {
  return new Promise(async (resolve, reject) => {
    console.log("condition ::::: ", condition);
    console.log("preCondition ::::: ", preCondition);

    const reqDate = {
      startingDate: moment(condition.$gte).locale("pt-br").format("DD MMM"),
      endingDate: moment(condition.$lt).locale("pt-br").format("DD MMM"),
    };

    var getDaysArray = function (s, e) {
      let i = 0;
      for (
        var a = {}, d = new Date(s);
        d <= new Date(e);
        d.setDate(d.getDate() + 1)
      ) {
        a[moment(new Date(d)).format("YYYY-MM-DD")] = i;

        // a.push(new Date(d));
      }
      return a;
    };

    var daylist = getDaysArray(
      new Date(condition.$gte),
      new Date(condition.$lt),
    );

    const visitorData = await Visitors.aggregate([
      {
        $match: {
          createdAt: condition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          // list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          //   list: { name: 1, email: 1, isOwner: 1 },
          count: 1,
        },
      },
    ]);

    let visitorObj = {};
    visitorData.map(i => {
      visitorObj[i._id] = i;
      i["week"] = moment(i._id).locale("pt-br").format("dddd");
      i["sortWeek"] = moment(i._id).locale("pt-br").format("ddd");
      i["month"] = moment(i._id).locale("pt-br").format("MMMM");
      return i;
    });
    const finalVisitor = Object.keys(daylist).map(dateVal => {
      return {
        _id: dateVal,
        count: 0,
        week: moment(dateVal).locale("pt-br").format("dddd"),
        sortWeek: moment(dateVal).locale("pt-br").format("ddd"),
        month: moment(dateVal).locale("pt-br").format("MMMM"),
        ...(visitorObj[dateVal] ? visitorObj[dateVal] : {}),
      };
    });

    const contactData = await Contacts.aggregate([
      {
        $match: {
          createdAt: condition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          // list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          list: 1,
          count: 1,
        },
      },
    ]);

    const contactObj = {};

    contactData.map(i => {
      (contactObj[i._id] = i),
        (i["week"] = moment(i._id).locale("pt-br").format("dddd"));
      i["sortWeek"] = moment(i._id).locale("pt-br").format("ddd");
      i["month"] = moment(i._id).locale("pt-br").format("MMMM");
      return i;
    });

    const finalContact = Object.keys(daylist).map(dateVal => {
      return {
        _id: dateVal,
        count: 0,
        week: moment(dateVal).locale("pt-br").format("dddd"),
        sortWeek: moment(dateVal).locale("pt-br").format("ddd"),
        month: moment(dateVal).locale("pt-br").format("MMMM"),
        ...(contactObj[dateVal] ? contactObj[dateVal] : {}),
      };
    });

    let visitorGroup = _.groupBy(visitorData, b =>
      moment(b._id).startOf("month").format("MMMM"),
    );

    let contactGroup = _.groupBy(contactData, b =>
      moment(b._id).startOf("month").format("MMMM"),
    );

    const preVisitorData = await Visitors.aggregate([
      {
        $match: {
          createdAt: preCondition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          // list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          //   list: { name: 1, email: 1, isOwner: 1 },
          count: 1,
        },
      },
    ]);

    const preContactData = await Contacts.aggregate([
      {
        $match: {
          createdAt: preCondition,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          // list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: 1,
          // list: 1,
          count: 1,
        },
      },
    ]);

    const data = [...visitorData, ...contactData];

    let currentVisitor = _.sumBy(visitorData, function (obj) {
      return obj.count;
    });

    // console.log("currentVisitor", currentVisitor);

    let preVisitor = _.sumBy(preVisitorData, function (obj) {
      return obj.count;
    });
    // console.log("preVisitor", preVisitor);

    let currentContact = _.sumBy(contactData, function (obj) {
      return obj.count;
    });
    // console.log("currentContact", currentContact);

    let preContact = _.sumBy(preContactData, function (obj) {
      return obj.count;
    });
    // console.log("preContact", preContact);

    const growthOfContact = toFloat(
      (100 * (toFloat(currentContact) - toFloat(preContact))) /
        toFloat(preContact),
    );
    // console.log("growthOfContact", growthOfContact);

    const growthOfVisitor = toFloat(
      (100 * (toFloat(currentVisitor) - toFloat(preVisitor))) /
        toFloat(preVisitor),
    );
    // console.log("growthOfVisitor", growthOfVisitor);

    let tempVal = {};
    if (growthOfContact >= 0) {
      tempVal.contact = `${
        growthOfContact == "Infinity" ? 100 : growthOfContact
      }% nessa Ano`;
      tempVal.contactIndication = "increment";
    } else {
      tempVal.contact = `${Math.abs(
        growthOfContact == "Infinity" ? 100 : growthOfContact,
      )}% nessa Ano`;
      tempVal.contactIndication = "decrement";
    }

    if (growthOfVisitor >= 0) {
      tempVal.visitor = `${
        growthOfVisitor == "Infinity" ? 100 : growthOfVisitor
      }% nessa Ano`;
      tempVal.visitorIndication = "increment";
    } else {
      tempVal.visitor = `${Math.abs(
        growthOfVisitor == "Infinity" ? 100 : growthOfVisitor,
      )}% nessa Ano`;
      tempVal.visitorIndication = "decrement";
    }

    visitorData.sort(function (a, b) {
      var c = new Date(a._id);
      var d = new Date(b._id);
      return c - d;
    });

    contactData.sort(function (a, b) {
      var c = new Date(a._id);
      var d = new Date(b._id);
      return c - d;
    });

    const response = {
      // visitorGroup,
      // contactGroup,
      visitorData: finalVisitor,
      contactData: finalContact,
      totalVisitor: currentVisitor,
      totalContact: currentContact,
      // growth: tempVal,
      growthOfVisitor: preVisitor == 0 ? 100 : growthOfVisitor,
      growthOfContact: preContact == 0 ? 100 : growthOfContact,
      reqDate,
    };

    data.map(i => {
      i["week"] = moment(i._id).locale("pt-br").format("dddd");
      i["sortWeek"] = moment(i._id).locale("pt-br").format("ddd");
      i["month"] = moment(i._id).locale("pt-br").format("MMMM");
      return i;
    });
    resolve({
      success: true,
      data: response,
    });
  });
};
