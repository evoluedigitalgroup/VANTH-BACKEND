import express from "express";
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { subscribePlan } from "../../helpers/pagarMe";
import authentication from "../../services/authentication";
import Plan from "../../models/plan";
import config from "../../config";
import Company from '../../models/Company';
import Subscription from "../../models/subscription";
const router = express.Router();


const getPaymentData = async (type, id) => {
    if (type === "plan") {
        const planData = await Plan.findById(id);
        return {
            interval: 12,
            plan: planData
        };
    } else if (type === "package") {
        const planData = await Plan.findById(id);
        return {
            interval: 1,
            plan: planData
        };;
    }
}


const getPlanId = (planDetails) => {
    if (config.env === "prod") {
        return planDetails.plan?.pagarMeProductionPlanId;
    } else {
        return planDetails.plan?.pagarMeTestingPlanId;
    }
}

router.post("/subscribe-plan", authentication.UserAuthValidateMiddleware, async (req, res) => {

    const userObj = req.user;

    const { customerData, cardData, purchaseType, purchaseId } = req.body;

    console.log('req.body : ', req.body)


    const planDetails = await getPaymentData(purchaseType, purchaseId);


    if (!planDetails.plan) {
        return res.json({
            success: false,
            message: "Plano não encontrado",
        });
    }

    if (!customerData.cpf) {
        return res.json({
            success: false,
            message: "Número de cpf/cnpj inválido",
        });
    }

    const documentType = cpf.isValid(customerData.cpf) ? 'cpf' : cnpj.isValid(customerData.cpf) ? 'cnpj' : false;


    if (!documentType) {
        return res.json({
            success: false,
            message: "Número de cpf/cnpj inválido",
        });
    }

    const planPrice = parseFloat(parseFloat(Math.round(planDetails?.plan?.monthlyPlanPrice) * 100).toFixed(2));

    console.log('planPrice : ', planPrice);



    const subscriptionObj = {
        customer: {
            address: {
                country: 'BR',
                state: customerData.state,
                city: customerData.city,
                zip_code: customerData.zipCode,
                line_1: customerData.addressLine1,
                line_2: customerData.addressLine2
            },
            name: customerData.fullName,
            type: documentType === 'cpf' ? "individual" : 'company',
            email: customerData.email,
            document: customerData.cpf,
            document_type: documentType
        },
        card: {
            number: cardData.cardNumber,
            holder_name: cardData.nameOnCard,
            exp_month: cardData.cardMonth,
            exp_year: cardData.cardYear,
            cvv: cardData.cvc
        },
        installments: 1,
        code: userObj.id + "##" + planDetails.plan.id,
        plan_id: getPlanId(planDetails),
        payment_method: 'credit_card'
    };

    await subscribePlan(subscriptionObj)
        .then(async result => {
            console.log('result : ', result);

            const insertSubscription = {
                plan: planDetails.plan._id,
                planDetails: planDetails.plan,
                user: userObj._id,
                company: userObj.company,
                events: [result]
            }


            const checkAlreadySubscribed = await Subscription.findOne({ company: userObj.company });

            if (checkAlreadySubscribed) {
                Subscription.findByIdAndUpdate(checkAlreadySubscribed._id, {
                    $push: {
                        events: result
                    }
                });

                await Company.findByIdAndUpdate(userObj.company, {
                    selectedPlan: planDetails.plan._id,
                    subscription: checkAlreadySubscribed._id
                });

                res.json({
                    success: true,
                    message: "ok",
                    data: result,
                });
            } else {
                const subscriptionValue = await new Subscription(insertSubscription).save();
                await Company.findByIdAndUpdate(userObj.company, {
                    selectedPlan: planDetails.plan._id,
                    subscription: subscriptionValue._id
                });

                res.json({
                    success: true,
                    message: "ok",
                    data: result,
                });
            }



        })
        .catch((err) => {
            console.log('err in subscribePlan : ', err);
            res.json({
                success: false,
                message: err.message,
                data: null,
            });

        })

});


export default router;
