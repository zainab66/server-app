const express = require('express');
const router = express.Router();
const expressAsyncHandler = require('express-async-handler');
const authorize = require('../../middleware/authorize');
const isPrinciple = require('../../middleware/principleAuthorize');
const schoolEvent = require('../../models/schoolModels/schoolEventModel.js');

router.post(
  '/addEvent',
  authorize,
  isPrinciple,
  expressAsyncHandler(async (req, res) => {
    const { eventTitle, eventDescription, startDate, endDate } = req.body;

    const event = new schoolEvent({
      start: req.body.startDate,
      end: req.body.endDate,
      title: req.body.eventTitle,
      describe: req.body.eventDescription,
    });
    const createdEvent = await event.save();
    res.status(200).json({
      createdEvent,
      message: 'Event create successfully',
    });
  })
);

router.get(
  '/getEvents',
  authorize,
  isPrinciple,
  expressAsyncHandler(async (req, res) => {
    const events = await schoolEvent.find({});
    res.status(200).json({ events });
  })
);

router.delete(
  '/:eventId',
  authorize,
  isPrinciple,
  expressAsyncHandler(async (req, res) => {
    const event = await schoolEvent.findOne({
      eventId: req.params.eventId,
    });
    if (event) {
      const deleteEvent = await event.remove();
      res.send({ message: 'Event Deleted', deleteEvent });
    } else {
      res.status(404).send({ message: 'Event Not Found' });
    }
  })
);

router.put(
  '/edit/:eventId',
  authorize,
  isPrinciple,

  expressAsyncHandler(async (req, res) => {
    const event = await schoolEvent.findById(req.params.eventId);
    console.log('user', req.params.eventId);
    if (event) {
      event.end = req.body.endDate || event.end;
      event.start = req.body.startDate || event.start;
      event.describe = req.body.eventDescription || event.describe;
      event.title = req.body.eventTitle || event.title;
      const updatedEvent = await event.save();
      res.send({ message: 'Event Updated', event: updatedEvent });
    } else {
      res.status(404).send({ message: 'Event Not Found' });
    }
  })
);

module.exports = router;
