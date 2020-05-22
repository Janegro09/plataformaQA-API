/**
 * @fileoverview Middleware | Middleware de headers
 * 
 * @version 1.0
 * 
 * @author Soluciones Digitales - Telecom Argentina S.A.
 * @author Ramiro Macciuci <rmacciucivicente@teco.com.ar>
 * @copyright Soluciones Digitales - Telecom Argentina
 * 
 * History:
 * 1.0 - Version principal
 */
/**
 * Middleware general para todos los request
 */
let headers = (req, res, next) => {
    global.completeUrl = req.protocol + '://' + req.get('host');

    next();
}

module.exports = headers;
