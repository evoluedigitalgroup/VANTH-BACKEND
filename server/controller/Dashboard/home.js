import express from "express";
import moment from "moment";
import Contacts from "../../models/Contacts";
import Visitors from "../../models/visitors";
import authentication from "../../services/authentication";
import lang from "../../helpers/locale/lang";
import validator from "../../validator/Dashboard";
import "moment-timezone";

const router = express.Router();

router.post(
  "/insights-with-filter",
  authentication.AdminAuthValidateMiddleware,
  async (req, res) => {
    const { filter } = req.body;

    let condition, start, end;
    const date = new Date();

    if (filter == "monthly") {
      start = moment().startOf("month").toDate();
      end = moment().endOf("month").toDate();

      start = new Date(start.setHours(0, 0, 0, 1));

      end = new Date(end.setHours(23, 59, 59, 999));

      const previousStart = moment()
        .subtract(1, "months")
        .startOf("month")
        .toDate();

      const previousEnd = moment()
        .subtract(1, "months")
        .endOf("month")
        .toDate();

      new Date(previousStart.setHours(0, 0, 0, 1));

      new Date(previousEnd.setHours(23, 59, 59, 999));

      condition = {
        $gte: start,
        $lt: end,
      };
      const preCondition = { $gte: previousStart, $lt: previousEnd };

      const validMonth = await validator.monthlyValidation(
        condition,
        preCondition,
      );

      return res.json({
        success: true,
        data: validMonth.data,
      });
    } else if (filter == "week") {
      (start = moment().clone().weekday(0).toDate()),
        (end = moment().clone().weekday(6).toDate());
      console.log("start", start);
      console.log("end", end);
      // new Date(start.setHours(0, 0, 0, 1));
      console.log("start", start);

      new Date(end.setHours(23, 59, 59, 999));

      const previousStart = moment()
        .tz("America/Sao_Paulo")
        .clone()
        .weekday(-7)
        .toDate();
      // .subtract(1, "weeks");
      // .startOf("week")

      const previousEnd = moment()
        .tz("America/Sao_Paulo")
        .clone()
        .weekday(-1)
        .toDate();
      // .subtract(1, "weeks");
      // .endOf("week")

      new Date(previousStart.setHours(0, 0, 0, 0));
      new Date(previousEnd.setHours(23, 59, 59, 999));

      condition = {
        $gte: start,
        $lt: end,
      };
      const preCondition = { $gte: previousStart, $lt: previousEnd };

      const validWeek = await validator.weekValidation(condition, preCondition);

      return res.json({
        success: true,
        data: validWeek.data,
      });
    } else if (filter == "yearly") {
      let firstDay = new Date(new Date().getFullYear(), 0, 1);
      let lastDay = new Date(new Date().getFullYear(), 12, 1);
      // start = firstDay.setHours(0, 0, 0, 0);
      // start = moment(start).format();
      start = firstDay;
      end = lastDay.setHours(23, 59, 59, 999);
      end = moment(end).format();
      end = lastDay;

      const previousStart = moment()
        .subtract(1, "years")
        .startOf("year")
        .toDate();

      const previousEnd = moment().subtract(1, "years").endOf("year").toDate();

      condition = {
        $gte: start,
        $lt: end,
      };

      const preCondition = { $gte: previousStart, $lt: previousEnd };

      const validYear = await validator.yearlyValidation(
        condition,
        preCondition,
      );

      return res.json({
        success: true,
        data: validYear.data,
      });
    } else if (filter.startDate && filter.endDate) {
      let startDate = new Date(filter.startDate);
      let endDate = new Date(filter.endDate);

      let end = endDate.setHours(23, 59, 59, 999);
      end = moment(end).format();
      end = endDate;

      // let ab = moment(endDate).add(1, "day").toDate();

      const diffTime = Math.abs(startDate - endDate);

      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      var previousStart = new Date(
        startDate.setDate(startDate.getDate() - diffDays),
      );
      console.log("previousStart", previousStart);
      startDate = new Date(filter.startDate);

      const condition = {
        $gte: startDate,
        $lt: endDate,
      };

      const preCondition = { $gte: previousStart, $lt: startDate };

      const validCustomDate = await validator.customDateValidation(
        condition,
        preCondition,
      );

      return res.json({
        success: true,
        data: validCustomDate.data,
      });
    } else {
      return res.json({
        success: false,
        message: lang.PLEASE_SELECT_PROPER_FIELD.PR,
      });
    }
  },
);

export default router;
