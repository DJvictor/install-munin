# Configuraciones básicas y creación de dockers de prueba

## Primer paso
Debes construir un docker personalizado que incluye el servidor openssh

-Con nuestro Dockerfile construiremos la imagen de nuestros dockers. 

Usamos el siguiente comando en nuestra consola: 
               
               docker build -t server:16.04 .

## Segundo paso, despliege

Ahora debes crear dos maquinas para el despliegue.

una que servira de nodo y la otra que sera el munin master.

Usamos los siguientes comandos en nuestra consola: 

docker run -d -P --name munin_node_web_server -p 2221:22 -p 80:80 server:16.04 

docker run -d -P --name munin_master_web_server -p 2222:22 -p 8000:80 server:16.04


#Tercer paso, configuración de alias


Opción 1: edita el archivo /etc/hosts y adiciona 2 alias a localhost

127.0.0.1 munin_node_web_server munin_master_web_server

Opción 2: adición automática en el archivo de hosts del sistema

Usamos el siguiente comando en nuestra consola:

echo "127.0.0.1 munin_node_web_server munin_master_web_server" | sudo tee -a /etc/hosts



# cuarto paso,Adicionar las llaves ssh</h3>

Usamos los siguientes comandos en nuestra consola: 

ssh -o StrictHostKeyChecking=no root@munin_node_web_server -p 2221 -i key.private hostname

ssh -o StrictHostKeyChecking=no root@munin_master_web_server -p 2222 -i key.private hostname


## Cuarto paso, confirmación
Realiza una prueba de conexión a la maquina que se creó recientemente.

    ssh root@munin_node_web_server -p 2221 -i ../key.private
    ssh root@munin_master_web_server -p 2222 -i ../key.private

Si la conexión se establece, ya está listo el banco de pruebas y puedes ingresar a ansible.




