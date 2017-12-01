# install-munin
instalacion de munin
Para desplegar una servidor con una pagina web monitoreada con munin debemos hacer unas configuraciones como s elas explicaremos
una de las heramientas a utilizar es docker para instalar una imagen y crear un servidor
creamos un archivo dockerfile configurado
luego en la maquina le damos el siguiente comando para crear una imagen

docker build -t server:16.04 . 

el paso a seguir es utilizar el siguiente comando para desplegar la imagen como se debe desplegar dos servidores uno para munin master y otro para munin demo 


docker run -d -P --name Server01 -p 2221:22 -p 80:80 server:16.04

docker run -d -P --name Server02 -p 2222:22 -p 8000:80 server:16.04


al desplegar la imagen podemos ver si se creo con el comando

docker ps -a

le damos permisos a las llaves y adicionamos los alias a la consola


Usamos el siguiente comando en nuestra consola:

echo "127.0.0.1 Server01 Server02" | sudo tee -a /etc/hosts



ssh -o StrictHostKeyChecking=no root@Server01 -p 2221 -i key.private hostname

ssh -o StrictHostKeyChecking=no root@Server02 -p 2222 -i key.private hostname









