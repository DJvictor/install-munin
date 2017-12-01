$(function(){  
  
/* Definimos variables que utilizaremos 

   valor: En ella almacenaremos cuantos caracteres hay en el 
          área de texto. 

   contador: Almacenará el número de caracteres restantes, 
             descontando el valor actual desde el máximo (150). 

   parrafo: Almacenará en que tipo de clase (estilo) se mostrará el 
            mensaje (verde si no se ha pasado el límite, rojo si se 
            sobrepasado). 

*/  
  
var valor, contador, parrafo;  
  
// Mostramos un mensaje inicial y lo añadimos al div de id contador.  
$('<p class="indicador">Tienes 150 caracteres restantes</p>').appendTo('#contador');  
  
// Definimos el evento para que detecte cada vez que se presione una tecla.  
$('#mensaje').keydown(function(){  
  
// Redefinimos el valor de contador al máximo permitido (150).  
contador = 150;  
  
/* Quitamos el párrafo con clase advertencia o indicador, en caso de que ya se 
   haya mostrado un mensaje */  
$('.advertencia').remove();  
$('.indicador').remove();  
  
// Tomamos el valor actual del contenido del área de texto  
valor = $('#mensaje').val().length;  
  
// Descontamos ese valor al máximo.  
contador = contador - valor;  
  
/* Dependiendo de cuantos caracteres quedan, mostraremos el mensaje de una 
   u otra forma (lo definiremos a continuación mediante CSS */  
if(contador < 0) {  
   parrafo = '<p class="advertencia">';  
}  
else {  
   parrafo = '<p class="indicador">';  
}  
  
// Mostramos el mensaje con el número de caracteres restantes.  
$('#contador').append(parrafo + 'Tienes ' + contador + ' caracteres restantes</p>');  
  
});  
  

}); 