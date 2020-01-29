const User = require('../models/user');
const {validationResult} = require('express-validator');

const updateUser = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({success: false, error: errors.array()})
    }
    try{
        const {newPassword, ...rest} = req.body;
        const newUserData = {
            ...rest
        }
        if(newPassword){
            newUserData.psw = await User.hashPassword(newPassword);
        }
        if(req.files.avatar){
            newUserData.avatar = req.files.avatar[0].path
        }
        const newUser = await User.findByIdAndUpdate(req.user._id, newUserData, {new: true});
        req.user = newUser;
        return res.status(200).json({success: true, data: newUser, message: 'User updated!'})
    }catch(error){
        console.log(error);
        return res.status(400).json({success: false, error, message: 'User not update!'});
    }
}

const deleteUser = async (req, res) => {
    try{
        const user = await User.findByIdAndDelete(req.user._id);
        return res.status(200).json({success: true, message: 'User deleted!', data: user})
    }catch(error){
        return res.status(400).json({success: false, error});
    }
}

const getUsers = async (req, res) => {
    const {
        perPage: limit = 10,
        page = 1,
        sortBy = null,
        orderBy = null
    } = req.query;
    const sort = {};
    if(sortBy && orderBy){
        sort[sortBy] = orderBy === 'desc' ? -1 : 1;
    }
    try{
        console.log(1);
        const users = await User.aggregate([
            {
                $facet: {
                    data: [
                        {$sort: Object.keys(sort).length ? sort : {_id: 1}},
                        {$skip: page > 0 ? ((page - 1) * limit) : 0},
                        {$limit: +limit}
                    ],
                    pagination: [
                        {$count: 'totalResults'}
                    ]
                }
            }
        ]);
        if(!users){
            return res.status(400).json({success: false, error: 'Get users failed!'});
        }
        const {
            data, 
            pagination: [{totalResults} = {totalResults: 0}]
        } = users[0];
        console.log(totalResults);
        return res.status(200).json({
            success: true, 
            data: data,
            pagination: {
                totalResults,
                page,
                totalPages: Math.ceil(totalResults/limit)
            }
        });
    }catch(error){
        return res.status(400).json({success: false, error});
    }
};

const getUserById = async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        return res.status(200).json({success: true, data: user});
    }catch(error){
        return res.status(400).json({success: false, error});
    }
}

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
}