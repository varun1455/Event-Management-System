const express = require('express')
const {createUser, loginUser} = require('../controllers/Auth');
const router = express.Router();
const passport = require('passport')

router.post('/signup', createUser).post('/login',passport.authenticate('local'), loginUser)

exports.router = router;