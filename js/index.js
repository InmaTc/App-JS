//Declaramos debug para depurar
var debug = true;

//Recoger direcciones del servidor
var urlServidor = 'http://ws.iesoretania.es';

/**
 * Para guardar la C_key de paciente
 * @method POST
 * @returns {string}
 */
var urlKey = '/paciente/key';


/*
* Comprobamos al entrar en la página si ha entrado alguien para mantener la sesión abierta
*/
if (document.readyState == 'loading') {
    if(localStorage.length > 0)
        location.assign('paciente.html')
    else 
        document.addEventListener('DOMContentLoaded', main);
}

/**
 * Recoge los datos de inicio de sesión (input-text) usuario y clave
 * @param {*} vacío
 * @returns nada
 */
function main() {
    //Recogemos los nodos 
    var nodoUsuario = document.getElementById('usuario');
    var nodoClave = document.getElementById('clave');
    var nodoBtn = document.getElementById('btnEntrar');
    var nodoError = document.getElementById('msgError');

    nodoBtn.addEventListener('click',  function () {
        if(comprobarCadena(nodoUsuario.value) && comprobarCadena(nodoClave.value))
            guardarClave(nodoUsuario.value, nodoClave.value);
        else {
            nodoError.textContent = "¡ERROR! Debe introducir datos";
            nodoError.classList.add('visible');
        }
    });

}

/**
 * Comprueba que el valor de la cadena no esté vacío
 * @param {*} cadena
 * @returns true/false
 */
 function comprobarCadena(cadena = '') {
    return cadena !== null && cadena.length > 0 && typeof (cadena) === 'string' ? true : false;
}

/**
 * Realizamos mediante ajax una petición al servidor para obtener la C_key de paciente 
 * @param {String} usuario
 * @param {String} clave
 * Respuesta válida -- Grabamos la key con prefijo, para localizarla posteriormente
 * @returns {String}
 * Respuesta errónea -- Recibimos objeto json con mensaje de error
 * @returns {Object}
 */
function guardarClave(usuario, clave) {
    //Prefijo para guardar la key en LocalStorage
    var prefijoKey = "inmapaciente-";
    //Cargamos los nodos necesarios
    var nodoError = document.getElementById('msgError');
    //Realizamos la conexión
    var conexion = new XMLHttpRequest();
    var resultado;
    
    //Usamos método POST 
    conexion.open('POST', urlServidor + urlKey);
    conexion.setRequestHeader('Content-Type', 'application/json');
    conexion.send(JSON.stringify({
        login: usuario, 
        password: clave
    }));

    conexion.addEventListener('load', function() {
        resultado = this.responseText;

        // Comprobamos que la operación es correcta y está preparada
        // TRUE: Graba la key de paciente en LocalStorage y redireccionamos a la página de paciente
        // FALSE: Mostramos mensaje de error
        if(this.status == 200 && this.readyState == 4) {
            localStorage.setItem(`${prefijoKey + usuario}`, resultado);
            location.assign('paciente.html');
        } else { 
            nodoError.textContent = "¡ERROR! Usuario y/o contraseña incorrectos";
            nodoError.classList.add('visible'); //Añadimos la clase mostrar para que sea visible el error
        }
    });
}
