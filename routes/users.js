const express = require('express');
const router = express.Router();
const User = require('../models/user');

function parseJsonParam(param) {
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

        const users = await User.find(where || {})
            .sort(sort || {})
                .select(select || {})
                .skip(skip)
                .limit(limit);

                res.json(users);
    } catch(err) {
        res.status(500).json({message:err.message});
    }
});

router.post('/', async(req, res)=>{
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);

    } catch(err) {
        res.status(400).json({message: err.message});
    }
});

module.exports = router;