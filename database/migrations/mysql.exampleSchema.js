// const helper        = require('../../controllers/helper');
// const db            = require('../../controllers/db');
// const password_hash = require('password-hash');

// let migration = () => {

//     let adminUser = {
//         name: 'Admin',
//         lastName: 'Admin',
//         email: 'ramimacciuci@gmail.com.ar',
//         password: password_hash.generate('admin'),
//         level: 1
//     }

//     db.mysql.createTable('users',{
//         id: {
//             type: 'int',
//             notNull: true,
//             AI: true,
//             PK: true
//         },
//         name: {
//             type: 'varchar|60',
//             notNull: true
//         },
//         lastName: {
//             type: 'varchar|60',
//             notNull: true
//         },
//         dni: {
//             type: 'int'
//         },
//         password: {
//             type: 'varchar|255',
//             notNull: true
//         },
//         email: {
//             type: 'varchar|100',
//             notNull: true,
//             unique: true
//         },
//         phone: {
//             type: 'int'
//         },
//         level: {
//             type: 'int'
//         },
//         userDelete: {
//             type: 'boolean',
//             default: 'false'
//         },
//         userActive: {
//             type: 'boolean',
//             default: 'true'
//         },
//         imagen: {
//             type: 'varchar|255',
//         },
//         createdAt: {
//             type: 'timestamp',
//             update: false
//         },
//         updatedAt: {
//             type: 'timestamp',
//             update: true
//         }
//     }).then((v) => {
//         if(v.warningCount == 0){
//             db.mysql.insertOn('users',adminUser);
//         }else{
//             db.mysql.selectOn('users','*',` WHERE email = '${adminUser.email}'`).then((res) => {
//                 if(res.length == 0){
//                     db.mysql.insertOn('users',adminUser);
//                 }
//             })
//         }

//     })
// }

// module.exports = migration;