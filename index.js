const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users")
const authRoute = require("./routes/auths")
const postRoute = require("./routes/posts")
const messageRoute = require("./routes/messages")
const multer = require("multer");
const path = require("path")
const socket = require("socket.io");

dotenv.config();

mongoose.connect(
    process.env.MONGO_URL, 
    {useNewUrlParser: true, useUnifiedTopology: true}, 
    (err) => {
        if(err) console.log(err) 
        else console.log("mongdb is connected");
       }
);

app.use("/images", express.static(path.join(__dirname, "public/images")))

//middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.all('*', function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
    if (req.method === 'OPTIONS') {
      res.sendStatus(200)
    } else {
      next()
    }
  });

  

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"public/images")
    },
    filename: (req,file,cb)=>{
        cb(null, req.body.name);
    }
})


const upload = multer({storage});
app.post("/api/upload",upload.single("file"),(req,res) => {
    try{
        return res.status(200).json("File uploaded successfully");
    }catch(err){
        console.log(err)
    }
}
)

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/message", messageRoute);


const server = app.listen(8800, ()=> {
    console.log("Backend Server is running!");
})

const io = socket(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  global.onlineUsers = new Map();
  io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });
  
    socket.on("send-msg", (data) => {
      console.log(data);
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data);
      }
    });
  });