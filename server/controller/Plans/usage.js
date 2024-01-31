import express from "express";
import Company from "../../models/Company";
import authentication from "../../services/authentication";
import Users from "../../models/users";
import { getCurrentCycle } from "../../helpers/payment";
import aws from "../../services/aws";
import Contracts from "../../models/Contracts";
const router = express();

router.post("/usage", authentication.UserAuthValidateMiddleware, async (req, res) => {
    const userObj = req.user;
    const companyData = await Company.findById(userObj.company).populate("selectedPlan").populate("subscription");


    const planDetails = companyData?.subscription?.planDetails;

    if (planDetails) {


        const existingTotalUsers = await Users.find({ company: userObj.company }).countDocuments();

        const currentCycle = getCurrentCycle(companyData.subscription.createdAt);

        let signaturesInCurrentBillingCycle = 0;
        let storageInCurrentBillingCycle = 0;

        const totalContracts = await Contracts.find({
            company: userObj.company,
            createdAt: {
                $gte: currentCycle.startDate,
                $lte: currentCycle.endDate
            }
        }).countDocuments();

        signaturesInCurrentBillingCycle = totalContracts;

        storageInCurrentBillingCycle = await aws.calculateFileSizeCreated(
            companyData.id,
            currentCycle.startDate,
            currentCycle.endDate
        );

        const totalUserPercentage = parseFloat(parseFloat((existingTotalUsers / planDetails.allowedTotalUsers) * 100).toFixed(2));

        const totalSignaturesPercentage = parseFloat(parseFloat((signaturesInCurrentBillingCycle / planDetails.digitalContractSignatures) * 100).toFixed(2));

        const allowedStorage = planDetails.storageUnit === 'TB' ? planDetails.totalStorageAllowed * 1000 * 1000 : planDetails.totalStorageAllowed * 1000;

        const storagePercentage = parseFloat(parseFloat((storageInCurrentBillingCycle / allowedStorage) * 100).toFixed(2));

        const planUsage = {
            cycle: currentCycle,
            totalUsers: {
                allowed: planDetails.allowedTotalUsers,
                existing: existingTotalUsers,
                percent: totalUserPercentage > 100 ? 100 : totalUserPercentage,
            },
            digitalSignatures: {
                allowed: planDetails.digitalContractSignatures,
                existing: signaturesInCurrentBillingCycle,
                percent: totalSignaturesPercentage > 100 ? 100 : totalSignaturesPercentage,
            },
            storage: {
                allowed: planDetails.storageUnit === 'TB'
                    ? planDetails.totalStorageAllowed * 1000 * 1000
                    : planDetails.totalStorageAllowed * 1000,
                existing: storageInCurrentBillingCycle,
                percent: storagePercentage > 100 ? 100 : storagePercentage,
                storageUnit: planDetails.storageUnit,
                totalStorageAllowed: planDetails.totalStorageAllowed
            }
        };

        res.json({
            success: true,
            data: planUsage,
            message: null,
        });

    } else {

        res.json({
            success: false,
            data: null,
            message: "No plan found",
        });

    }
});

export default router;