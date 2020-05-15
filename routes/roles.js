const express           = require('express');
const roles             = require('../controllers/roles');
let router = express.Router();

router.route("/:id?")
            .get(roles.get)
            .post(roles.new)
            .delete(roles.delete)
            .put( roles.update);

module.exports = router;