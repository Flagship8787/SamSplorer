var express = require('express');
var router = express.Router();

router.use('/addresses', require('./addresses'));

module.exports = router;
