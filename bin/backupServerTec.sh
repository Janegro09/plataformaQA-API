#!/bin/bash

ruta="/home/rm/"

folder="plataformaQA"

rutaBackup="https://click.telecom.com.ar/customer/condiciones/condiciones/APPS/backupPlataformaQA/uploadsfiles.php"

dbuser = "apiprincipal"
dbpass = "Recursos2020!"

token="7894398574387VB59357BV937B59V37B95V73B985B98V3"

echo "Creamos el backup y lo almacenamos en la ruta del usuario $ruta"
mongodump -u apiprincipal -p Recursos2020! --authenticationDatabase $folder -d plataformaQA -o $ruta

echo "ejecutamos el script que realiza el backup al servidor"

sudo chmod 777 -R $ruta$folder

#curl --form "filebackup=@example.txt" $rutaBackup

zip archivoComprimido $ruta$folder/*

curl --form "filebackup=@archivoComprimido.zip" $rutaBackup

sudo rm archivoComprimido.zip

sudo rm -R $ruta$folder
