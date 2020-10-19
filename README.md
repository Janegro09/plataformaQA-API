# Plataforma QA

Plataforma QA fue desarrollada especificamente para el uso de Telecom Argentina S.A.

Plataforma QA es un servicio REST utilizado para:
- Realizar control de calidad de los agentes tanto internos como externos que representan a la compañia, por los distintos medios de comunicación disponibles (telefonico, RRSS, Oficinas comerciales)

### Servers
* [production](https://api_plataformaqa.solucionesdigitalesteco.com.ar)
* [testing](https://testingapi_plataformaqa.solucionesdigitalesteco.com.ar)

### Tech

Plataforma QA API usa las siguientes tecnologias:

* [Node.JS]
* [APIREST] 
* [MongoDB]
* [ExpressJS]

### Install

- Requiere [Node.js](https://nodejs.org/) v10+ to run.
- Requiere de una base de datos MongoDB.
- Requiere un archivo .env con los valores de las variables de entorno
- Todas las configuracion de conexiones se encuentran en config.json
 correctamente seteadas.
    **.env**
    ```sh
    ENVRIORMENT=<production>
    PORT=<specificPortforDevelopment>
    ```
options for .env file:

**.env**
    ```sh
    ENVRIORMENT= production | development
    ```

```sh
$ npm install
```

#### Building
Para el servidor install MongoDB 
```sh
$ mongo
>> use plataformaQA      (production)
>> use plataformaQADev   (development)
>> db.createUser({
        user: 'root',
        pwd: 'root',
        roles: ['readWrite']
    })
```

Para el servidor - Run API:
```sh
$ sudo npm install -g pm2
$ cd ./plataformaQA-API/backend/
$ sudo pm2 start index.js --name plataformaQA-API
```