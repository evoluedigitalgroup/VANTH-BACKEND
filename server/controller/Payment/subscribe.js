import express from "express";
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { subscribePlan } from "../../helpers/pagarMe";
import authentication from "../../services/authentication";
import Plan from "../../models/plan";
import config from "../../config";
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
    if (config.env === "production") {
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

            res.json({
                success: true,
                message: "ok",
                data: result,
            });

        })
        .catch((err) => {
            console.log('err : ', err);
        })

});


export default router;
