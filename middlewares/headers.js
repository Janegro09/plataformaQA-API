let headers = (req, res, next) => {
    global.completeUrl = req.protocol + '://' + req.get('host');

    next();
}

module.exports = headers;
