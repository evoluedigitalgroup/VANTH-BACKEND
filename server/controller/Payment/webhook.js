import express from "express";
const router = express.Router();


router.post("/webhook", async (req, res) => {

    console.log("webhook : req.body.type", req.body.type);

    res.json({
        success: true,
        message: "ok",
    });

});


export default router;
