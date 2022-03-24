//Recogemos los nodos
var nodoBtnSalir;
var nodotexto;

//Declaramos debug para depurar 
var debug = true; //console
var debug2 = false; //probar funciones


/*
* Comprobamos al entrar en la página si ha entrado alguien para mantener la sesión abierta
*/
if (document.readyState == 'loading') {
    if(localStorage.length == 0)
        location.assign('index.html')
    else 
        document.addEventListener('DOMContentLoaded', main);
}

function main (){
    //Recogemos los nodos
    nodoBtnSalir = document.getElementById('btnSalir');
    nodotexto = document.querySelector('p');

    if(debug) console.log(nodotexto);

    //Añadimos evento al botón para cerrar la sesión
    nodoBtnSalir.addEventListener('click', function(){
        nodotexto.innerHTML = "Gracias por usar nuestra aplicación";
        setInterval(function(){
            localStorage.clear();
            location.assign('index.html');
        }, 2000);
    });
}
