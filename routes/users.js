const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

//update user
router.put("/:id", async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch(err){
                return res.status(500).json(err)
            }
        }
        try{
            const user = await User.findByIdAndUpdate(req.params.id, {$set: req.body});
            res.status(200).json("Account has been updated");
        }catch(err){
            return res.status(500).json(err)
        }
    } else {
        return res.status(403).json("You can update only your account")
    }
})
//delete user
router.delete("/:id", async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
        try{
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");
        }catch(err){
            return res.status(500).json(err)
        }
    } else {
        return res.status(403).json("You can delete only your account")
    }
})
//get a user
router.get("/:id", async(req,res)=>{
    try{
        const user =  await User.findById(req.params.id)
        const {password,updateAt, ...other} = user._doc;
        return res.json({ status: true, user:other });
    }catch(err){
        return res.json({ status: false, user: err });
    }
})

//get a post by name
router.get("/search/:name",async (req,res)=>{
    try{
        const user = await User.find({username:{$regex:req.params.name}});
        return res.json({status: true, users: user});
    }catch (ex) {
        return res.json({status: false, msg: ex});
      }
})

//follow a user
router.put("/follow/:id", async(req,res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({$push:{followers: req.body.userId}})
                await currentUser.updateOne({$push:{followings: req.params.id}})
                return res.json({ status: true, msg:"user has been followed" });

            }else{
                return res.json({ status: false, msg:"you already follow this user" });

            }
        }catch(err){
            res.status(500).json(err);
        }
    }else{
        return res.json({ status: false, msg:"you cant follow yourself" });
    }
})
//unfollow a user
router.put("/unfollow/:id", async(req,res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull:{followers: req.body.userId}})
                await currentUser.updateOne({$pull:{followings: req.params.id}})
                return res.json({ status: true, msg:"user has been unfollowed" });
            }else{
                return res.json({ status: false, msg:"you have not follow this user" });
            }
        }catch(err){
            res.status(500).json(err);
        }
    }else{
        return res.json({ status: false, msg:"you cant unfollow yourself" });
    }
})

module.exports = router;