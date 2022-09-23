const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//REGISTER
router.post("/register", async (req,res)=>{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    try {
        const { username, email, password } = req.body;
        const usernameCheck = await User.findOne({ username });
        if (usernameCheck)
          return res.json({ msg: "Username already used", status: false });
        const emailCheck = await User.findOne({ email });
        if (emailCheck)
          return res.json({ msg: "Email already used", status: false });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const user = await User.create({
          email,
          username,
          password: hashedPassword,
        });
        delete user.password;
        return res.json({ status: true, user:user });
      } catch (ex) {
        return res.json({ status: false, msg:ex })
      }
})

//login
router.post("/login", async (req,res)=>{
    try{
        const user = await User.findOne({
            email: req.body.email
        })
        if(!user)
          return res.json({msg: "Incorrect Email or Password1", status: false});
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword)
          return res.json({msg: "Incorrect Email or Password2", status: false});
        delete user.password
        return res.json({ status: true, user:user });
    }catch (ex) {
      return res.json({ status: false, msg:ex })
    }
})

//avatar
router.post("/setavatar/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    return res.json({ status: false, msg:ex })
  }
});


module.exports = router;