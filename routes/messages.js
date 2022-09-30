const MessageM = require("../models/Message");
const router = require("express").Router();

router.post("/getMsg", async (req, res) => {
    try{
        const { from, to } = req.body;
        const messages = await MessageM.find({
            user:{
                $all: [from, to],
            },
        }).sort({ updatedAt: 1});

        const data = messages.map((msg) => {
            return {
                isFromSelf: msg.sender.toString() === from,
                message: msg.message.text
            }
        })
        return res.json({ status: true, data: data });
    }catch(err){
        return res.json({status: false, msg: err});
    }
});


router.post("/addMsg", async (req, res) => {
    try{
        const { from, to, message } = req.body;
        const data = await MessageM.create({
            message: { text: message},
            user: [from, to],
            sender: from,
        });
        if(data){
            return res.json({ status: true, msg: "send successfully" });
        }else{
            return res.json({status: false, msg: "send error"});
        }
    }catch(err){
        return res.json({status: false, msg: err});
    }
});

module.exports = router;