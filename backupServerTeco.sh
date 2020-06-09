#!/bin/bash

ruta="/home/user/"

folder="plataformaQA"

rutaBackup="https://click.telecom.com.ar/customer/condiciones/condiciones/APPS/backupPlataformaQA/uploadsfiles.php"

token="7894398574387VB59357BV937B59V37B95V73B985B98V3"

echo "Creamos el backup y lo almacenamos en la ruta del usuario $ruta"
mongodump -u root -p root --authenticationDatabase $folder -d plataformaQA -o $ruta

echo "ejecutamos el script que realiza el backup al servidor"

sudo chmod 777 -R $ruta$folder

#curl --form "filebackup=@example.txt" $rutaBackup

for f in $(ls $ruta$folder); do
    sudo curl --form "filebackup=@$ruta$folder/$f" $rutaBackup
done

sudo rm -R $ruta$folder