import express from "express";
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { cancelSubscriptionsCards, subscribePlan, pixPayment } from "../../helpers/pagarMe";
import authentication from "../../services/authentication";
import Plan from "../../models/plan";
import config from "../../config";
import Company from '../../models/Company';
import Subscription from "../../models/subscription";
const   router = express.Router();


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
        };
    }
}


const getPlanId = (planDetails) => {
    if (config.env === "PRODUCTION") {
        return planDetails.plan?.pagarMeProductionPlanId;
    } else {
        return planDetails.plan?.pagarMeTestingPlanId;
    }
}

router.post("/remove-subscribe-plan", authentication.UserAuthValidateMiddleware, async (req, res) => {
    const { id: companyId, subscription } = req.body
    const sub = await Subscription.findOne({ company: companyId })

    if (sub) {
        let subscriptionItem = null
        const events = sub.events;

        events.map((item, _) => {
            if (item.id.match(/sub/)) {
                subscriptionItem = item
            }
        })

        if (subscriptionItem.id == null) {
            return res.json({
                success: false,
                message: 'Não foi possível encontrar o plano!'
            })
        }

        try {
            const { success, data } = await cancelSubscriptionsCards(subscriptionItem.id);

            if (success) {
                const update = await Subscription.findOneAndUpdate(
                    {company: companyId},
                    {events: [data]},
                    {new: true})
    
                    if(update) {
                        res.json({
                            success: true,
                            message: 'O Plano foi cancelado com sucesso!'
                        });   
                    } else {
                        res.json({
                            success: false,
                            message: 'Não foi possível cancelar o plano!'
                        });
                    }
        
            } else {
                res.json({
                    success: false,
                    message: 'Não foi possível cancelar o Plano, entre em contato com o suporte!'
                });
            }
        } catch(err) {
            console.log(err)

            if (sub.events[sub.events.length - 1].status) {
                return res.json({
                    succes: false, 
                    message: 'Seu plano já foi cancelado, mas ainda está no período de vigência.'
                })
            }
            res.json({
                success: false, 
                message: 'Erro!' 
            });
        }
    
    } else {
        return (
            res.json({
                success: false,
                message: 'Não possível encontrar uma empresa com esse ID!'
            })
        )
    }
});

router.post("/subscribe-plan", authentication.UserAuthValidateMiddleware, async (req, res) => {

    const userObj = req.user;

    const { customerData, cardData, purchaseType, purchaseId } = req.body;

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

    const subscriptionObj = {
        customer: {
            address: {
                country: 'BR',
                state: customerData.state,
                city: customerData.city,
                zip_code: customerData.zipCode,
                line_1: customerData.addressLine1,
                line_2: customerData.addressLine2 || '' // Usar string vazia se undefined
            },
            phones: {
                mobile_phone: {
                    country_code: '55',
                    area_code: customerData.phoneNumber.substring(0, 2),
                    number: customerData.phoneNumber.substring(2),
                }
            },
            name: customerData.fullName,
            type: documentType === 'cpf' ? "individual" : 'company',
            email: customerData.email,
            document: customerData.cpf,
            document_type: documentType
        },
        card: {
            number: cardData.cardNumber.replace(/\s+/g, ''), // Remover espaços
            holder_name: cardData.nameOnCard,
            exp_month: cardData.cardMonth,
            exp_year: cardData.cardYear,
            cvv: cardData.cvc,
            billing_address: {
                country: 'BR',
                state: customerData.state,
                city: customerData.city,
                zip_code: customerData.zipCode,
                line_1: customerData.addressLine1,
                line_2: customerData.addressLine2 || '' // Usar string vazia se undefined
            }
        },
        installments: 1,
        code: `${userObj.id}##${planDetails.plan.id}`,
        plan_id: getPlanId(planDetails),
        payment_method: 'credit_card'
    };
    

    await subscribePlan(subscriptionObj)
        .then(async result => {

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
            console.log('err:', err)
            res.json({
                success: false,
                message: err.message,
                data: null,
            });

        })

});


router.post('/pix-payment', authentication.UserAuthValidateMiddleware, async (req, res) => {
    const userObj = req.user;
    
    const { customerData, purchaseType, purchaseId } = req.body;
    const planDetails = await getPaymentData(purchaseType, purchaseId);

    if (!planDetails.plan) {
        return res.json({
            succes: false,
            message: 'Plano não encontrado',
        })
    };

    if (!customerData.cpf) {
        return res.json({
            success: false,
            message: 'Número de cpf/cnpj inválido',
        })
    };

    const documentType = cpf.isValid(customerData.cpf) ? 'cpf' : cnpj.isValid(customerData.cpf) ? 'cnpj' : false;

    if (!documentType) {
        return res.json({
            success: false,
            message: "Número de cpf/cnpj inválido",
        });
    };
    
    const subscriptionObj = {
        customer: {
            address: {
                country: 'BR',
                state: customerData.address.state,
                city: customerData.address.city,
                zip_code: customerData.address.zip_code,
                line_1: customerData.address.line_1,
                line_2: customerData.line_2 ?? null 
            },
            phones: {
                home_phone: {
                    country_code: customerData.phone.country_code,
                    area_code: customerData.phone.area_code,
                    number: customerData.phone.number
                }
            },
            name: customerData.fullName,
            type: documentType === 'cpf' ? "individual" : 'company',
            email: customerData.email,
            document: customerData.cpf,
            document_type: documentType
        },
        items: [ {
            amount: planDetails.plan.monthlyPlanPrice * 100,
            description: planDetails.plan.planName,
            quantity: 1,
            code: userObj.id + "##" + planDetails.plan.id 
        } ],
        payments: [
            {
                payment_method: "Pix",
                pix: {
                    expires_in: "500",
                    additional_information: [
                        {
                            name: "Quantidade",
                            value: "1"
                        }
                    ]
                }
            }
        ]
    }

    console.log("subscriptionObj", subscriptionObj.customer)

    try {
        const paymentReturn = await pixPayment(subscriptionObj);
        console.log('paymentReturn', paymentReturn)
        console.log('paymentReturn gateway', paymentReturn.charges[0].last_transaction.gateway_response)
        
        res.json({
            succes:true,
        })
} catch(e) {
    res.json({
        success: false,
        message: e.message,
        data: null,
    });
}


})

router.post("/pix", (req, res) => {
    console.log(bateu)
    res.end('deu')
}

)



export default router;
 