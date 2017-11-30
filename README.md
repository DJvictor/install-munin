# install-munin
instalacion de munin
Para desplegar una servidor con una pagina web monitoreada con munin debemos hacer unas configuraciones como s elas explicaremos
una de las heramientas a utilizar es docker para instalar una imagen y crear un servidor
creamos un archivo dockerfile configurado
luego en la maquina le damos el siguiente comando para crear una imagen

docker build -t "nombre"server:16.04 . sin las comillas

el paso a seguir es utilizar el siguiente comando para desplegar la imagen como se debe desplegar dos servidores uno para munin master y otro para munin demo 


docker run -d -P --name "nombre"server -p 2221:22 -p 80:80 nameserver:16.04

docker run -d -P --name “nombre”server -p 2222:22 -p 8000:80 server:16.04


al desplegar la imagen podemos ver si se creo con el comando

docker ps -a

le damos permisos a las llaves y adicionamos los alias a la consola


Usamos el siguiente comando en nuestra consola:

echo "127.0.0.1 munin_node munin_master" | sudo tee -a /etc/hosts



ssh -o StrictHostKeyChecking=no root@munin_node -p 2221 -i key.private hostname

ssh -o StrictHostKeyChecking=no root@munin_masterr -p 2222 -i key.private hostname




ya habiendo salido y entrado al servidor salimos y nos seguimos con la instalacion del apache y el munin

con ansible que es la segunda herramienta a utilizar 

primero debemos crear los archivos y configurarlos

este archivo lo utilizamos para la instalacion de apache su configuracion seria la siquiente
apache.yml

# el nodo que esta al lado de web es para indicar que es un nodo de la web

---
- name: Configuracion de apache

  hosts: web, node
  remote_user: root
  roles:
    - apache



configuracion de munin 
munin.yml


---
- name: Munin master installation
  hosts: web
  remote_user: root

# esto mandara a la carpeta de munin en los roles para seguir la instaclacion
  roles:
    - munin


# debemos configurar tambien el nodo  para que pueda funcionar ya que se necesita para la monotizar el servidor
munin-mode.yml

---
- name: Configuracion de apache
  hosts: node
  remote_user: root
  roles:
    - munin-node


 

# en los hosts es que declaramos como se debe conectar para instalar en el servidor el apache o el munin 

hosts

[webN]
munin_node ansible_port=2221 ansible_ssh_private_key_file=../Dockerfile/key.private

[webM]
munin_master ansible_port=2222 ansible_ssh_private_key_file=../Dockerfile/key.private


en ansible en la carpeta roles podemos crear otra carpeta llamada apache para la configuracion 
final pues anteriormente solo creamos las rutas para llegar a donde estara la configuracion del 
apache

dentro de la carpeta apache creamos una carpeta llamada tasks y creamos un archivo main.yml donde pondremos la sigueiente
configuracion.


---
- name: Installing php librerias
  apt:
    name: "{{ item }}"
    state: present
    update_cache: yes
  with_items:
    - php7.0-json
    - php7.0-mbstring
    - php7.0-intl
    - php7.0-xml
    - php7.0-mysql
    - libapache2-mod-php7.0

- name: Installing apache
  apt:
    name: apache2
    state: present

- name: Initializing apache service
  service:
    name: apache2
    state: started
    enabled: yes

ya configurado cerramos el archivo y salimos de la carpeta hacemos una carpeta llamada munin-node en tasks creamos un 
archivo llamado 

manin.yml


---
# tasks file for munin-node
- name: Include OS-specific variables.
  include_vars: Ubuntu.yml

- name: Ensure munin-node is installed.
  apt: name=munin-node state=installed

- name: Copy munin-node configuration.
  template:
    src: munin-node.conf.j2
    dest: /etc/munin/munin-node.conf
    owner: root
    group: root
    mode: 0644
  notify: restart munin-node

- name: Generate plugin configuration.
  template:
    src: plugin-conf.j2
    dest: /etc/munin/plugin-conf.d/ansible.conf
    owner: root
    group: root
    mode: 0644
  notify: restart munin-node

- name: Enable additional plugins.
  file:
    path: "{{ munin_plugin_dest_path }}{{ item.name }}"
    src: "{{ munin_plugin_src_path }}{{ item.plugin | default( item.name ) }}"
    state: link
  with_items: "{{ munin_node_plugins }}"
  notify: restart munin-node

- name: Ensure munin-node is running.
  service: name=munin-node state=started enabled=yes


salimos y creamos otra carpeta llamada handlers

creamos otro archivo main.yml y copiamos el siguiente codigo

---
# handlers file for munin-node
- name: restart munin-node
  service: name=munin-node state=restarted


en la carpeta vars creamos un archivo Ubuntu.yml y copiamos el siguiente codigo

---
munin_node_log: /var/log/munin/munin-node.log
munin_node_pid: /var/run/munin/munin-node.pid





salimos del archivos nos devolvemos a la carpeta roles y entramos a la carpeta munin y entramos al tasks y creamos 
el archivo main.yml  y le copiamos el siguiente texto donde esta la configuracion de la instalacion.

---
# tasks file for munin
- name: Include OS-specific variables.
  include_vars: Ubuntu.yml

- name: Install required packages for munin (Ubuntu).
  apt: "name={{ item }} state=present"
  with_items: "{{ munin_packages }}"

- name: Copy munin configurations.
  template:
    src: "{{ item.src }}"
    dest: "{{ item.dest }}"
    owner: root
    group: root
    mode: 0644
  with_items:
    - src: munin.conf.j2
      dest: /etc/munin/munin.conf
    - src: hosts.conf.j2
      dest: "{{ munin_conf_d_directory }}/hosts.conf"

- name: Create munin user via htpasswd.
  htpasswd:
    create: yes
    name: "{{ munin_admin_user }}"
    password: "{{ munin_admin_password }}"
    path: /etc/munin/munin-htpasswd
    state: present

- name: Enable or disable the munin cron job.
  lineinfile:
    dest: /etc/cron.d/munin
    state: "{{ munin_cron_job }}"
    regexp: "^\\*/5 \\* \\* \\* \\*"
    line: "*/5 * * * *     munin test -x /usr/bin/munin-cron && /usr/bin/munin-cron"



creamos la carpeta defaults y el archivo main.yml

y copiamos el siguiente codigo

---
# defaults file for munin
munin_packages:
  - python-passlib
  - munin

munin_conf_d_directory: /etc/munin/conf.d

munin_dbdir: /var/lib/munin
munin_htmldir: /var/www/html/munin
munin_logdir: /var/log/munin
munin_rundir: /var/run/munin

munin_includedir: /etc/munin/conf.d

munin_html_strategy: cron
munin_graph_strategy: cron
munin_cron_job: present

munin_max_processes: 12

munin_admin_user: munin
munin_admin_password: munin

munin_hosts:
  - {
    name: "localhost",
    address: "127.0.0.1",
    extra: ["use_node_name yes"]
  }

munin_alerts: []












