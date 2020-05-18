const express       = require('express');
const controller    = require('../controllers/groups');
let router          = express.Router();

router.route("/:id?")
            .get(controller.get)
            .post(controller.new)
            .delete(controller.delete)
            .put( controller.update);

module.exports = router;