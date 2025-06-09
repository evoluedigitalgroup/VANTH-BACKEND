import express from "express";
import Users from "../../models/users";
import Subscription from "../../models/subscription";
import UnExpectedWebHookEvent from "../../models/UnExpectedWebHookEvent";
import Plan from '../../models/plan';
import Company from '../../models/Company'

const router = express.Router();

router.post("/webhook/credit-card", async (req, res) => {

    console.log('Request', req);
    console.log('Response', res);
    
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

router.post("/webhook/pix", async (req, res) => {
    const code = req.body?.data?.items[0]?.code;
    const status = req.body?.data?.status;
    
    const codeArray = code.split("##"); 
 
    const userId = codeArray[0];
    const planId = codeArray[1];
    
    const userDetails = await Users.findById(userId);
    const planDetails = await Plan.findById(planId);
    const companyDetails = await Company.findById(userDetails.company);
    console.log(companyDetails)

    if (status === 'paid') {
        const insertSubscription = {
            plan: planId,
            planDetails: planDetails,
            user: userId,
            company: companyDetails.id, 
            events: [req.body]
        };
    
        const subscription = await Subscription.findOne({ company: userDetails.company });
        
            if (subscription) {
                await Subscription.findByIdAndUpdate(subscription._id, {
                     $push: {
                        events: req.body
                    }
                });

                await Company.findByIdAndUpdate(userDetails.company, {
                    selectedPlan: planDetails._id,
                    subscription: subscription._id
                });

                res.json({
                    success: true,
                    message: 'ok'
                });
 
            } else {
                const subscriptionValue = await new Subscription(insertSubscription).save();
                await Company.findByIdAndUpdate(userDetails.company, {
                    selectedPlan: planDetails._id,
                    subscription: subscription._id
                });

                res.json({
                    success: true,
                    message: 'ok'
                });
            }
    } else {
        res.json({
            sucess: false
        })
    }
});


router.get("/teste", (req, res) => {
    console.log('bateu')
    res.end('deu')
}

)


export default router;
