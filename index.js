const express = require("express");
const http = require('http');
const app = express();
const server = http.createServer(app);
const mongoose = require('mongoose');
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const socketIo = require('socket.io');
const io = socketIo(server);
const nodemailer = require('nodemailer');




const JwtStrategy = require('passport-jwt').Strategy;
const User = require('./models/user');
const Event = require('./models/event');
const fs = require('fs');
const path = require('path');
const publicKey = fs.readFileSync(path.resolve(__dirname, './public.key'), 'utf-8');
const { isAuth,SanitizedUser, cookieExtractor } = require("./services/common");
const mongoURL = 'mongodb://127.0.0.1:27017/eventManagement';

const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const eventRoute = require('./routes/event');

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('MongoDB connected successfully!'))
    .catch((err) => console.error('MongoDB connection error:', err));
  


const opts = {}

opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = publicKey;
opts.algorithm = ['RS256'];

app.use(cookieParser());
app.use(express.json());
app.use(
  session({ secret: "keyboard cat", resave: true, saveUninitialized: true })
);
app.use(passport.authenticate("session"));


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'your-email@gmail.com', 
      pass: 'your-email-password',   
    },
  });

io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Store socket ID and user ID mapping
    socket.on('register', (userId) => {
      socket.userId = userId;
    });
  
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

app.use("/auth", authRoute.router);
app.use("/users",isAuth(), userRoute.router);
app.use("/events",isAuth(), eventRoute.router);
passport.use(
    new LocalStrategy(
      {usernameField:'email'},
      async function (email, password, done) {
      try {
        const user = await User.findOne({ email: email }).exec();
        if (!user) {
          done(null, false, { message: "User not Exist" });
        
        }
  
        crypto.pbkdf2(
          password,
          user.salt,  
          310000,
          32,
          "sha256",
          async function (err, hashedPassword) {
            if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
             
              done(null, false, { message: "Password is incorrect" });
             
            } else {
          
              done(null, user);
            }
          }
        );
        
      } catch (err) {
        
        done(err);
      }
    })
  );
  
  
  passport.use('jwt',
    new JwtStrategy(opts,async function(jwt_payload, done) {
  
  
    try {
      
      
      const user = await User.findOne({_id:jwt_payload.id}) 
      if (user) {
          return done(null, SanitizedUser(user));
      } else {
          return done(null, false);
        
      }
    } catch (err) {
      
      return done(err, false);
    }
      
    ;
  }));
  
  passport.serializeUser(function (user, cb) {
    console.log("serialize, user");
    process.nextTick(function () {
      return cb(null, {
        id: user.id,
        email: user.email,
        name: user.name,
      });
    });
  });
  
  passport.deserializeUser(function (user, cb) {
    console.log("deserialize", user);
    process.nextTick(function () {
      return cb(null, user);
    });
  });
  


  app.post('/notify-event', async (req, res) => {
    const { eventId } = req.body;
  
    try {
     
      const event = await Event.findById(eventId).populate('attendees');
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      
      event.attendees.forEach((user) => {
       
        io.emit(`notification-${user._id}`, { message: `New event scheduled: ${event.title}` });
      });
  
      res.status(200).json({ message: 'Notifications sent' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send notifications' });
    }
  });

  app.post('/notify-mail', async (req, res) => {
    const { eventId } = req.body;
  
    try {
      
      const event = await Event.findById(eventId).populate('attendees');
  
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      
      const mailOptions = {
        from: 'your-email@gmail.com',
        subject: `New Event: ${event.title}`,
        text: `You have a new event scheduled: ${event.title} on ${event.date}. `,
      };
  
      // Send email to each attendee
      await Promise.all(event.attendees.map(async (user) => {
        mailOptions.to = user.email;
        await transporter.sendMail(mailOptions);
      }));
  
      res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send emails' });
    }
  });






app.listen(5000, () => {
    console.log("server started successfully");
  });
  