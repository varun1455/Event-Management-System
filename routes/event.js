const express = require('express')
const {createEvent, getAllEvents, getEventbyId, deleteEvent } = require('../controllers/Event');
const router = express.Router();

router.post('/create', createEvent).get('/', getAllEvents).get('/id', getEventbyId).delete('/delete/:id', deleteEvent )


exports.router = router;