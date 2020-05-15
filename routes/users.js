const express           = require('express');
const users             = require('../controllers/users');


let router = express.Router();

router.post('/new',users.new);
router.post('/passchange/:id?',users.passchange);

router.route("/:id?")
            .get(users.get)
            .post(users.update)
            .delete(users.delete)
            .put( users.diabled);

module.exports = router;