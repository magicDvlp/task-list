const multer  = require('multer');
const storage = multer.diskStorage({
    destination(req, file, cb){
        cb(null, 'uploads')
    },
    filename(req, file, cb) {
        const date = Date.now();
        cb(null, `${date}-${file.originalname}`)
    }
});
module.exports = multer({storage}).fields([
    {
        name: 'avatar',
        maxCount: 1
    },
    {
        name: 'categoryThumbnail',
        maxCount: 1
    }
]);