const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//create a post
router.post("/",async (req,res)=>{
    const newPost = new Post(req.body)
    try{
        if(!req.body.img){
            return res.json({ msg: "please upload photo", status: false });
        }else{
            const savePost = await newPost.save();
            return res.json({ status: true, savePost });
        }
    }catch (err) {
        return res.json({status: false, msg: err});
    }
})

//update a post
router.put("/:id",async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            await post.updateOne({$set:req.body});
            return res.json({status: true, msg: "the post has been updated"});
        }else{
            return res.json({status: false, msg: "you can update only your post"});
        }
    // }catch(err){
    //     res.status(500).json(err);
    // }
    } catch (err) {
        return res.json({status: false, msg: err});
    }
})

//delete a post
router.delete("/:id",async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            await post.deleteOne();
            return res.json({status: true, msg: "the post has been deleted"});
        }else{
            return res.json({status: false, msg: "you can delete only your post"});
        }
    }catch (err) {
        return res.json({status: false, msg: err});
      }
})

//like/unlike a post
router.put("/like/:id",async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({$push:{likes: req.body.userId}});
            return res.json({ status: true, msg:"The post has been liked" });
        }else{
            await post.updateOne({$pull:{likes: req.body.userId}})
            return res.json({ status: true, msg:"The post has been disliked" });
        }
    }catch (err) {
        return res.json({ status: false, msg: err.msg });
      }
})
//get a post by Id
router.get("/:id",async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(post)
    }catch (err) {
        return res.json({status: false, msg: err});
      }
})

//get a post by name
router.get("/search/:desc",async (req,res)=>{
    try{
        const post = await Post.find({desc:{$regex:req.params.desc}});
        return res.json({status: true, posts: post});
    }catch (err) {
        return res.json({status: false, msg: err});
      }
})
//get timeline posts
router.get("/timeline/:userId",async (req,res)=>{
    try{
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId)=>{
                return Post.find({userId: friendId});
            })
        );
        return res.json({status: true, posts: userPosts.concat(...friendPosts)});
    }catch (err) {
        return res.json({status: false, msg: err});
      }
})

module.exports = router;