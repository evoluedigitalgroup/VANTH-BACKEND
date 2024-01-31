import express from "express";
import Users from "../../models/users";
import Subscription from "../../models/subscription";
import UnExpectedWebHookEvent from "../../models/UnExpectedWebHookEvent";

const router = express.Router();

router.post("/webhook", async (req, res) => {

    const code = req.body?.data?.code;

    const codeArray = code.split("##");

    const userId = codeArray[0];
    const planId = codeArray[1];

    const userDetails = await Users.findById(userId);
    const subscription = await Subscription.findOne({ company: userDetails.company });


    if (subscription?.plan?.toString() === planId) {

        const subscriptionData = await Subscription.findByIdAndUpdate(subscription.id, {
            $push: {
                events: req.body
            }
        });

        res.json({
            success: true,
            message: "ok",
        });

    } else {

        const unExpectedWebHookEventObj = {
            event: req.body
        }

        const unExpectedWebHookEventValue = await new UnExpectedWebHookEvent(unExpectedWebHookEventObj).save();

        res.json({
            success: true,
            message: "ok",
        });

    }

});


export default router;
