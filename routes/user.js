const express = require('express')
const { fetchUserById} = require('../controllers/user');
const router = express.Router();

router.get('/myself', fetchUserById);


exports.router = router;