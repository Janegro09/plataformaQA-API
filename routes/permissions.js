const express       = require('express');
const controller    = require('../controllers/roles');
let router          = express.Router();

router.get("/",controller.getPermissions);

module.exports = router;