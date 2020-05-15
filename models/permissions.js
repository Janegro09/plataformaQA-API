const helper            = require('../controllers/helper');
const files             = require('../database/migrations/Files');
const PermissionSchema  = require('../database/migrations/Permissions');

/**
 * Clase para registrar una ruta y crear un permiso para esa ruta en particular
 */
let Permit = {
    checkPermit: async function (req, name){
        let consulta = await Permit.getorAdd(req, name);
        if(!req.authUser[0].role) return false;
        else if(req.authUser[0].role == 'Develop') return true;
        
    },
    getorAdd: async function(req, name) {
        // Generamos el string de la ruta
        let section = req.originalUrl.split('/')[3];
        let route = req.method + "|" + section;
        for(let params in req.params){
            route += `/${params}`;
        }

        // Consultamos si existe registrada esa ruta en la base de datos
        let consulta = await PermissionSchema.find({route: route});
        let PermitId;
        if(!consulta.length){
            // Registramos la ruta
            let Permit = new PermissionSchema({
                name: name,
                group: section,
                route: route
            });
            Permit.save();
            PermitId = Permit._id;
        }else{
            PermitId = consulta[0]._id;
        }
        return PermitId;
    }
}

module.exports = Permit;