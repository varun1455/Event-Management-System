const User = require("../models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const passport = require('passport');

const privateKey = fs.readFileSync(
  path.resolve(__dirname, "../private.key"),
  "utf-8"
);
const { SanitizedUser } = require("../services/common");



exports.createUser = async (req, res) => {
    try {
      const salt = crypto.randomBytes(16);
      crypto.pbkdf2(
        req.body.password,
        salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          const user = new User({ ...req.body, password: hashedPassword, salt });
  
          const response = await user.save();
  
          req.login(SanitizedUser(response), (err) => {
            if (err) {
              res.status(400).json(err);
            } else {
              const token = jwt.sign(SanitizedUser(response), privateKey, {
                algorithm: "RS256",
              });
              res
                .cookie("jwt", token, {
                  expires: new Date(Date.now() + 3600000),
                  secure: false,
                  httpOnly: true
                })
                .status(201)
                .json(token);
            }
          });
         
        }
      );
    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  };

  exports.loginUser = async (req, res, next) => {
    

    passport.authenticate('local', async ( err, user, info)=>{
  
      if (err) {
        
        return res.status(500).json({ message: 'Server error' });
      }
  
      if(!user){
        return res.status(401).json({message: info.message});
      }
  
  
      
          const token = jwt.sign(SanitizedUser(user), privateKey, {
            algorithm: "RS256",
          });
          res
            .cookie("jwt", token, {
              expires: new Date(Date.now() + 3600000),
              secure: false,
              httpOnly: true
            })
            .status(201)
            .json(token);
        }
      )(req, res, next);
      
   
  };
  

