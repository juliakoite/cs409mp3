const express = require('express');
const router = express.Router();
const Task = require('../models/task')
const User = require('../models/user')

function parseJSONParam(param) {
    try {
        return param ? JSON.parse(param) : undefined;
    } catch (err) {
        console.warn('Invalid JSON: ', param);
        return undefined;
    }
}

router.get('/', async (req, res) => {
    try {
        const where = parseJSONParam(req.query.where);
        const sort = parseJSONParam(req.query.sort);
        const select = parseJSONParam(req.query.select);
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 0;

        const tasks = await Task.find(where || {})
            .sort(sort || {})
            .select(select || {})
            .skip(skip)
            .limit(limit);

            res.json(tasks);
    } catch(err) {
        res.status(500).json({message:err.message});
    }
});

router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({message: 'Task not found'});
        }
        res.json(task);
    } catch(err) {
        res.status(500).json({message: err.message});
    }
});

router.post('/', async(req, res)=>{
    try {
        const newTask = new Task(req.body);
        await newTask.save();

        if (newTask.assignedUser) {
            await User.findByIdAndUpdate(
                newTask.assignedUser,
                { $addToSet: { pendingTasks: newTask._id } }
            );
        }

        res.status(201).json({
            message: 'Task created successfully',
            data: newTask
        });
    } catch(err) {
        res.status(400).json({message: err.message});
    }
});

router.put('/:id', async (req, res) => {
    try {
        const oldTask = await Task.findById(req.params.id);
        if (!oldTask) {
            return res.status(404).json({message: 'Task not found'});
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        const oldUserId = oldTask.assignedUser;
        const newUserId = updatedTask.assignedUser;

        if (oldUserId !== newUserId) {
            if (oldUserId) {
                await User.findByIdAndUpdate(
                    oldUserId,
                    { $pull: { pendingTasks: req.params.id } }
                );
            }
            if (newUserId) {
                await User.findByIdAndUpdate(
                    newUserId,
                    { $addToSet: { pendingTasks: req.params.id } }
                );
            }
        }

        res.json(updatedTask);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
});

module.exports = router;