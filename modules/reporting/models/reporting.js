/**
 * @fileoverview Modulo QA
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
const includes = require('../../includes');

const sectionPermitted = ["analytics"]

const Schemas = {
    partitures: {
        partitures:     require('../../analytics/migrations/partitures.table'),
        infoByUsers:    require('../../analytics/migrations/partituresInfoByUsers.table'),
        instances:      require('../../analytics/migrations/instancesOfPartitures.table'),
        steps:          require('../../analytics/migrations/stepsOfInstances.table')
    }
}


class Reporting {
    constructor(section, { partitureId, clusters, instances }, AuthUser) {
        this.section            = sectionPermitted.includes(section) ? section : false;
        this.id                 = partitureId   || false;
        this.partiture          = partitureId   || false;
        this.clusters           = clusters      || false;
        this.instances          = instances     || false;
        this.authUser           = AuthUser[0]   || false;
        this.users              = [];
        this.usersIds           = [];
        this.viewPermissions    = { company: false, role: false };
    }

    async check_values() {
        const notEmptyValues = ["section", "partiture", "authUser", "id"];

        if(this.partiture) {
            let partiture = await Schemas.partitures.partitures.find({ _id: this.partiture });
            if(partiture.length === 0) throw new Error("Partitura inexistente");
            this.partiture = partiture[0] || false;
        } else throw new Error('Error en los parametros enviados');

        if(this.clusters) {
            let clusters = await Schemas.partitures.infoByUsers.find().where({ detallePA: { $in: this.clusters } });
            for(let { userId } of clusters) {
                if(this.usersIds.includes(userId)) continue;
                this.usersIds.push(userId);
            }
            this.users = clusters;
        } else throw new Error('Error en los parametros enviados');

        if(this.instances) {
            let instances = await Schemas.partitures.instances.find().where({ _id: { $in: this.instances }, partitureId: this.id });
            this.instances = [];

            for(let i = 0; i < instances.length; i++) {
                let temp = {
                    id: instances[i]._id,
                    partitureId: instances[i].partitureId,
                    name: instances[i].name,
                    createdAt: instances[i].createdAt,
                    steps: []
                }
                temp.steps = await Schemas.partitures.steps.find({ partitureId: this.id, instanceId: instances[i]._id, userId: { $in: this.usersIds } });
                this.instances.push(temp);
            }
        } else throw new Error('Error en los parametros enviados');

        if(this.authUser) {
            const { role, razonSocial } = this.authUser;

            this.viewPermissions.company = razonSocial || false;
            this.viewPermissions.role    = role.role   || false;
        }


    }

    async create() {
        await this.check_values();

        console.log(this.viewPermissions)
        return true;

    }
}

module.exports = Reporting;