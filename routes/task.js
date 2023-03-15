const express = require('express');
const router = express.Router();
const Task = require('../models/taskModel.js');
const expressAsyncHandler = require('express-async-handler');
const authorize = require('../middleware/authorize');
const List = require('../models/listModel.js');

router.post('/addList', async (req, res) => {
  const { title, createdBy } = req.body;
  const list = new List({ title, createdBy, cards: [] });
  await list.save();
  // res.json(list);

  res.status(200).json({
    list,
    message: 'List create successfully',
  });
});

router.get(
  '/getLists',
  authorize,
  expressAsyncHandler(async (req, res) => {
    //console.log(req.user._id);
    // const patients = await Patient.find({ createdBy: req.user._id });
    const lists = await List.find().populate('cards');

    res.status(200).json({ lists });
    //console.log(patients, patients[0]._id);
  })
);
router.patch(
  '/:cardId',
  authorize,
  expressAsyncHandler(async (req, res) => {
    const { cardId } = req.params;
    const { listId, source } = req.body;

    const card = await Task.findOne({ _id: req.params.cardId });
    if (card) {
      card.listId = req.body.listId || card.listId;
    }
    const updatedCard = await card.save();

    // res.json(updatedCard);

    const list = await List.findById(listId);
    list.cards.push(card);
    await list.save();
    // res.json(card);

    const newList = await List.findOne({ _id: source }).populate('cards');

    // Remove old card IDs from the list's cards array
    newList.cards = newList.cards.filter((item) => item._id === cardId);

    // Save the updated list document
    const updatedList = await newList.save();

    res.status(200).json({ updatedList, message: 'Updated successfully' });
  })
);

router.post(
  '/addTask',
  authorize,
  expressAsyncHandler(async (req, res) => {
    const { title, description, createdBy, listId } = req.body;

    const card = new Task({
      title: req.body.title,
      description: req.body.description,
      createdBy: req.body.createdBy,
      listId: req.body.listId,
    });
    const createdTask = await card.save();
    res.status(200).json({
      createdTask,
      message: 'Task create successfully',
    });

    const list = await List.findById(listId);
    list.cards.push(card);
    await list.save();
    res.json(card);
  })
);

router.get(
  '/getTasks',
  authorize,
  expressAsyncHandler(async (req, res) => {
    //console.log(req.user._id);
    // const patients = await Patient.find({ createdBy: req.user._id });
    const tasks = await Task.find({});

    res.status(200).json({ tasks });
    //console.log(patients, patients[0]._id);
  })
);

router.delete(
  '/delete/:taskId',
  authorize,
  expressAsyncHandler(async (req, res) => {
    const task = await Task.findOne({ _id: req.params.taskId });
    console.log(req.params.taskId, task);
    if (task) {
      const deleteTask = await task.remove();
      res.send({ message: 'Task Deleted', deleteTask });
    } else {
      res.status(404).send({ message: 'Task Not Found' });
    }
  })
);

module.exports = router;
