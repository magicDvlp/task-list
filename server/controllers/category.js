const Category = require('../models/category');
const {validationResult} = require('express-validator');

const createCategory = async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({success: false, error: errors.array()})
    }
    const {body} = req;
    const category = new Category({
        ...body,
        userId: req.user._id,
        categoryThumbnail: req.files ? req.files.categoryThumbnail[0].path : ''
    });
    if(!category){
        return res.status(400).json({success: false, error: 'Category not created!'});
    }
    try{
        await category.save();
        return res.status(200).json({success: true, data: category});
    }catch(error){
        console.log(error);
        return res.status(400).json({success: false, error: error.message});
    }
}

const updateCategory = async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(422).json({success: false, error: errors.array()});
    }
    const body = req.body;
    const categoryId = req.params.id;
    const categoryThumbnail = req.files.categoryThumbnail;
    if(categoryThumbnail){
        body.categoryThumbnail = categoryThumbnail[0].path;
    }
    try{
        const category = await Category.findOneAndUpdate({
            _id: categoryId,
            userId: req.user._id
        }, body, {new: true});
        if(!category){
            return res.status(400).json({success: false, error: 'Category update failed!'})
        }
        return res.status(200).json({success: true, data: category});
    }catch(error){
        console.log(error);
        return res.status(400).json({success: false, error: error.message});
    }
}

const deleteCategory = async(req, res) => {
    const {id} = req.params;
    try{
        const category = await Category.findOneAndDelete({_id: id, userId: req.user._id});
        if(!category){
            return res.status(400).json({success: false, error: 'Failed to delete category!'})
        }
        return res.status(200).json({success: true, data: category});
    }catch(error){
        console.log(error);
        return res.status(400).json({success: false, error: error.message})
    }
}

const getCategorys = async(req, res) => {
    const {
        perPage:limit = 10,
        page = 1
    } = req.query;
    const sort = {};
    if(req.query.sortBy && req.query.orderBy){
        sort[req.query.sortBy] = req.query.orderBy === 'desc' ? -1 : 1;
    }
    try{
        const categorys = await Category.aggregate([
            {$facet: {
                data: [
                    {$match: {userId: req.user._id}},
                    {$sort: Object.keys(sort).length ? sort : {_id: 1}},
                    {$skip: page > 0 ? ((page - 1) * limit) : 0},
                    {$limit: +limit},
                ],
                pagination: [
                    {$match: {userId: req.user._id}},
                    {$count: 'totalResults'},
                ]
            }}
        ]);
        const {
            data, 
            pagination: [{totalResults} = {totalResults: 0}]
        } = categorys[0];
        return res.status(200).json({
            data,
            pagination: {
                page,
                totalPages: Math.ceil(totalResults/limit),
                totalResults
            },
            success: true, 
        });
    }catch(error){
        console.log(error);
        return res.status(400).json({success: false, error: error.message})
    }
}

const getCategoryById = async (req, res) => {

    const {id} = req.params;
    
    try{
        const category = await Category.findOne({_id: id, userId: req.user._id});
        if(!category){
            return res.status(400).json({success: false, error: 'Категория не найдена'})
        }
        return res.status(200).json({success: true, data: category});
    }catch(error){
        console.log(error);
        return res.status(400).json({success: false, error: error.message})
    }

}

module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategorys,
    getCategoryById
};