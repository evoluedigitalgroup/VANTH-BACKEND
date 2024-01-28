import express from "express";
import Visitors from "../../models/visitors";
import lang from "./../../helpers/locale/lang";
const router = express();
// router.post("/visitor-increment", async (req, res) => {
//   const visitorInc = await new Visitors().save();
//   res.json({
//     success: true,
//     data: null,
//     message: "New Visitor Counted",
//   });
// });
router.post("/visitor-increment", async (req, res) => {
  const { company } = req.body;
  const visitorInc = await new Visitors({ company }).save();
  res.json({
    success: true,
    data: null,
    message: lang.NEW_VISITOR_COUNTED.PR,
  });
});
export default router;
