const Task = require('../models/task');
const {validationResult} = require('express-validator');
const Category = require('../models/category');

const createTask = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({success: false, error: errors.array()});
    }
    const {body:{
        categoryId,
        ...rest
    }} = req;

    try{
        const cateogrysArray = typeof categoryId == 'string' ? [categoryId] : categoryId;
        const categorys = await Category.find(
            {userId: req.user._id, _id: {$in: cateogrysArray}}
        );
        const task = new Task({
            ...rest,
            userId: req.user._id,
            categoryId: categorys
        });
        await task.save();
        return res.status(200).json({
            data: task
        });
    }catch(error){
        console.log(error);
        return res.status(400).json({error: error.message});
    }    
    
}

const updateTask = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({success: false, error: errors.array()});
    }

    const {id} = req.params;
    const {
        body: {
            categoryId,
            ...rest
        }
    } = req;

    try{
        const categorysArray = typeof catgoryId == 'string' ? [categoryId] : categoryId;
        const categorys = await Category.find({userId: req.user._id, _id: {$in: categorysArray}});
        const updatedTask = await Task.findOneAndUpdate({
            userId: req.user._id,
            _id: id
        },{
            ...rest,
            categoryId: categorys,
            userId: req.user._id
        });
        if(!updatedTask){
            return res.status(400).json({success: false, error: 'Task update failed!'})
        }
        return res.status(200).json({success: true, data: updatedTask});
    }catch(error){
        console.log(error);
        return res.status(400).json({success: false, error: error.message});
    }

}

const deletTask = async (req, res) => {

    const {id} = req.query;
    try{
        const deletedTask = await Task.findOneAndDelete({
            userId: req.user._id,
            _id: id
        });
        if(!deletedTask){
            return res.status(400).json({success: false, error: 'Failed to delete task'})
        }
        return res.status(200).json({success: true, data: deletedTask});
    }catch(error){
        console.log(error);
        return res.status(400).json({success: false, error: error.message});
    }

}

const getTasks = async (req, res) => {

    const {
        perPage:limit = 10,
        page = 1,
        sortBy = null,
        orderBy = null
    } = req.query;
    const sort = {};
    if(sortBy && orderBy){
        sort[sortBy] = orderBy == 'desc' ? -1 : 1;
    }
    try{
        const tasks = await Task.aggregate([
            {
                $facet: {
                    data: [
                        {$match: {userId: req.user._id}},
                        {$sort: Object.keys(sort).length ? sort : {_id: 1}},
                        {$skip: page > 0 ? ((page - 1) * limit) : 0},
                        {$limit: +limit}
                    ],
                    pagination: [
                        {$match: {userId: req.user._id}},
                        {$count: 'totalResults'}
                    ]
                }
            }
        ]);
        if(!tasks.length){
            return res.status(400).json({success: false, error: 'Get tasks failed!'});
        }
        console.log(tasks[0]);
        const {
            data,
            pagination: [{totalResults} = {totalResults: 0}]
        } = tasks[0];
        return res.status(200).json(
            {success: true,
            data,
            pagination: {
                page,
                totalPages: Math.ceil(totalResults/limit),
                totalResults
            }}
        );
    }catch(error){
        console.log(error);
        return res.status(400).json({success: false, error: error.message})
    }

}

const getTaskById = async (req, res) => {

    const {id} = req.params;

    try{
        const task = await Task.findOne({_id: id, userId: req.user._id});
        if(!task){
            return res.status(400).json({success: false, error: 'Запрошенная задача не найдена'});
        }
        return res.status(200).json({success: true, data: task});
    }catch(error){
        console.log(error);
        return res.status(400).json({success: false, error: error.message});
    }

}

module.exports = {
    createTask,
    deletTask,
    updateTask,
    getTasks,
    getTaskById
}