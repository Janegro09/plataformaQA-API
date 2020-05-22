const helper = require('./controllers/helper');



module.exports = function() {
    let mail = new helper.sender('ramimacciuci@gmail.com');
    mail.send().then(v => {
        console.log(v);
    })
}();