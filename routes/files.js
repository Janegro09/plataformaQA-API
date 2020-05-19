const express           = require('express');
const files          = require('../controllers/files');


let router = express.Router();

router.route('/:section?/:id?')
                .post(files.upload)


module.exports = router;