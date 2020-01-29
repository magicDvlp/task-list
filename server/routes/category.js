const route = require('express').Router();
const {multerLoader, checkToken, newCategoryValidator} = require('../middleware');
const {
    createCategory, 
    updateCategory, 
    deleteCategory,
    getCategorys,
    getCategoryById
} = require('../controllers/category')

route.post('/category', [
    checkToken, 
    multerLoader,
    newCategoryValidator
], createCategory);
route.get('/category', checkToken, getCategorys);
route.put('/category/:id', [
    checkToken,
    multerLoader
], updateCategory);
route.get('/category/:id', checkToken, getCategoryById);
route.delete('/category/:id', checkToken, deleteCategory);


module.exports = route;