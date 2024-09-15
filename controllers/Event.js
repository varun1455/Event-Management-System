const Event = require('../models/event')

exports.createEvent = async (req, res) => {

   try {
    
       const event = new Event(req.body);
       const response = await event.save();
       res.status(201).json(response);
   } catch (error) {
            res.status(401).json(error);
   }
  };


  exports.getAllEvents = async (req, res) => {


    try {
        
        const event = await Event.findById(req.params.id);
        res.status(201).json(event);
    } catch (error) {
        res.status(404).send('Event not found');
        
    }
  };

  exports.getEventbyId = async (req, res) =>{

    try {
        const event = await Event.findById(req.params.id);
        res.status(201).json(event);
        
    } catch (error) {   

        res.status(401).json(error);
        
    }

  }

  exports.deleteEvent = async (req, res) =>{

        try {

            const eventDelete = await Event.findByIdAndDelete(id);
            res.status(201).json(eventDelete)
            
        } catch (error) {
            res.status(401).json(error);
        }
  }


  //RSVP
  exports.eventAttending = async (req, res) =>{
        try {
            const event = await Event.findById(req.params.id);
            if (!event) return res.status(404).json({ message: 'Event not found' });
            const alreadyRSVPd = event.attendees.includes(req.user.id);
            if (alreadyRSVPd) return res.status(400).json({ error: "You have already RSVP'd" });
            event.attendees.push(req.user.id);
            const response = await event.save();
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }

  }