/**
 * @fileoverview Schema MongoDB | Schema para la tabla Files
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

// Incluimos controladores, modelos, schemas y modulos
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

var tempurls = new Schema({
    fileId: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    deletedAfterDownload: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('tempurls',tempurls);