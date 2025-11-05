const express = require('express');
const router = express.Router();
const User = require('../models/user');

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

        const users = await User.find(where || {})
            .sort(sort || {})
                .select(select || {})
                .skip(skip)
                .limit(limit);

        res.json({
            message: 'OK',
            data: users
        });
    } catch(err) {
        res.status(500).json({message:err.message});
    }
});



// router.post('/', async(req, res)=>{
//     try {
//         const newUser = new User(req.body);
//         await newUser.save();
//         //res.json({data:newUser});
//         res.status(201).json(newUser);

//     } catch(err) {
//         res.status(400).json({message: err.message});
//     }
// });
router.post('/', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({
            message: 'User created successfully',
            data: newUser
        });
    } catch(err) {
        res.status(400).json({
            message: err.message,
            data: null
        });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                data: null
            });
        }
        res.json({
            message: 'User updated successfully',
            data: user
        });
    } catch(err) {
        res.status(400).json({
            message: err.message,
            data: null
        });
    }
});


module.exports = router;