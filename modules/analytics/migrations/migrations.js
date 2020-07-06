/**
 * @fileoverview Modulo Programs
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


// Tables 
const instancesOfPartitures         = require('./instancesOfPartitures.table');
const partituresModels              = require('./parituresModels.table');
const partitures                    = require('./partitures.table');
const partituresInfoByUsers         = require('./partituresInfoByUsers.table');
const stepsOfInstances              = require('./stepsOfInstances.table');
const filesbypartitures             = require('./filesByPartitures.table');

module.exports = function() {
    instancesOfPartitures();
    partituresModels();
    partitures();
    partituresInfoByUsers();
    stepsOfInstances();
    filesbypartitures();
}();