import express from "express";
const router = express();
import authentication from "../../services/authentication";
import Plan from "../../models/plan";
import Company from "../../models/Company";

router.post("/get-plans-list", authentication.UserAuthValidateMiddleware, async (req, res) => {
    const userObj = req.user;
    const companyData = await Company.findById(userObj.company);

    const usersList = await Plan.find({}).sort({ sequence: 1 });

    usersList.map((item, index) => {
        if (item._id.toString() === companyData?.selectedPlan?.toString()) {
            usersList[index]._doc["selected"] = true;
        } else {
            usersList[index]._doc["selected"] = false;
        }
    });

    res.json({
        success: true,
        data: usersList,
        message: null,
    });

});

export default router;
