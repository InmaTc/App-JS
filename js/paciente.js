//Recogemos los nodos
var nodoSelectEspecialidades; 
var nodoSelectMedicos;
var nodoInputFecha; 
var nodoInputFecha;
var nodoSelectHoras;
var nodoBtnConfirmar;
var nodoLbProceso;
var nodoNombreUsuario;
var elementoSeleccionado;
var nombreUsuario;

//Declaramos debug para depurar 
var debug = true; //console
var debug2 = false; //probar funciones

//Prefijo para guardar la key en LocalStorage
var prefijoKey = "inmapaciente-";

//Recoger direcciones del servidor
var urlServidor = 'http://ws.iesoretania.es';

    //URLs para acceder a los servicios//
/**
 * Obtener las especialidades 
 * @method GET
 * @returns {array} [{id, denominacion}]
 */
var urlEspecialidades = '/especialidades'; 

/**
 * Obtener los médicos que hay en esa especialidad 
 * @method GET
 * @returns {array} [{colegiado, nombre}]
 */
 var urlMedicos = '/especialistas';

/**
 * Obtener el cuadrante del médico seleccionado
 * @method GET
 * @returns {array} [{id, dia}]
 */
 var urlCuadranteMedico = '/cuadrante';

 /**
 * Dar de alta la cita seleccionada al paciente que ha iniciado sesión
 * @method POST
 * @param {string, int} (key -> paciente, id -> médico)
 * @returns {boolean/JSON} True -> alta realizada ; objeto JSON -> msgError
 */
  var urlAlta = '/cita/alta';

 /**
 * Recuperar las citas que tiene un paciente para después listarlas
 * @method POST
 * @param {string} (key)
 * @returns {array/JSON} Si tiene 1 o + citas: array -> [{id, dia, hora, nombreMedico, especialidad}] ; Si no tiene citas: objeto JSON -> msgError
 */
  var urlCitasPaciente = '/paciente/citas';

   /**
 * Realizar la cancelación de una cita del paciente que ha iniciado sesión
 * @method POST
 * @param {string, int} (key, id)
 * @returns {boolean/JSON} True -> cancelada correctamente ; objeto JSON -> msgError
 */
    var urlCancelarCita = '/cita/cancelar';


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
    nodoSelectEspecialidades = document.getElementById('selectEspecialidad');
    nodoSelectMedicos = document.getElementById('selectMedicos');
    nodoInputFecha = document.getElementById('inputFecha'); 
    nodoBtnFecha = document.getElementById('btnHoras'); 
    nodoSelectHoras = document.getElementById('selectHoras');
    nodoBtnConfirmar = document.getElementById('btnConfirmar');
    nodoLbProceso = document.getElementById('msgProceso');
    nodoNombreUsuario = document.getElementById('nombUsuario');
    nombreUsuario = obtenerNombreUsuario();
    

    if(debug) console.log("Nombre1:" + obtenerNombreUsuario());
    if(debug) console.log(obtenerEspecialidades());
    if(debug2) obtenerEspecialidades();
    if(debug2) obtenerMedicos('3');
    if(debug2) obtenerHorasMedico('2022-03-10', 'MA-4000');

    nodoNombreUsuario.textContent = "Usuario: " + obtenerNombreUsuario();
    

    obtenerEspecialidades();

    //Añadimos evento cuando cambie el select de Especialistas
    nodoSelectEspecialidades.addEventListener('change', function(){
        if(this.value)
            obtenerMedicos(this.value);
    });

    //Añadimos evento al botón para buscar las horas
    nodoBtnFecha.addEventListener('click', function(){
        obtenerHorasMedico(nodoInputFecha.value, nodoSelectMedicos.value);
        if(debug) console.log(nodoInputFecha.value);
        if(debug) console.log(nodoSelectMedicos.value);
    });

    //Añadimos evento al botón para guardar la cita con los datos seleccionados
    nodoBtnConfirmar.addEventListener('click', function(){
        let claveLocalStorage = prefijoKey + nombreUsuario;
        if(debug) console.log("key-clave: " + claveLocalStorage);
        let key = localStorage.getItem(claveLocalStorage);
        let idMedico = nodoSelectHoras.value;
        if(debug) console.log("key: " + key);
        if(debug) console.log("idMedico: " + idMedico);
        guardarCita(key, idMedico);
    });

}

/**
 * Recuperamos el nombre del usuario que ha iniciado sesión através de la key guardada en LocalStorage
 * @returns {string} nombreUsuario
 */
function obtenerNombreUsuario() {
    var claveSalud = Object.keys(localStorage).filter(clave => clave.indexOf(prefijoKey) != -1);
    var nombreUsuario = claveSalud[0].substring(prefijoKey.length);
    if(debug) console.log("Nombre usuario: " + nombreUsuario);
    return nombreUsuario;
}

/**
 * Hacemos la llamada AJAX para obtener las especialidades del servicio
 * @returns nada, pasamos ejecución
 */
 function obtenerEspecialidades() {
    var conexion = new XMLHttpRequest();
    var respuesta;

    conexion.open('GET', urlServidor + urlEspecialidades);
    conexion.send();

    conexion.addEventListener('load', function () {
        if (this.status == 200 && this.readyState == 4) {
            respuesta = JSON.parse(this.responseText);
            if(debug) console.log(respuesta);
            cargarSelect(nodoSelectEspecialidades, respuesta);
        } else 
            nodoLbProceso.textContent = '¡ERROR! No se ha podido recuperar los datos';
    });
 }

 /**
 * Hacemos la llamada AJAX para obtener los médicos de la especialidad seleccionada del servicio
 * @param {int} idEspecialidad
 * @returns nada, pasamos ejecución
 */
  function obtenerMedicos(idEspecialidad) {
    var conexion = new XMLHttpRequest();
    var respuesta;

    conexion.open('GET', `${ urlServidor + urlMedicos}/${idEspecialidad}`);
    conexion.setRequestHeader('Content-Type', 'application/json');
    conexion.send();

    conexion.addEventListener('load', function () {
        respuesta = JSON.parse(this.responseText);
        limpiarSelect(nodoSelectMedicos);
        if (this.status == 200 && this.readyState == 4) {
            if(debug) console.log(respuesta);
            cargarSelect(nodoSelectMedicos, respuesta);
            nodoLbProceso.classList.replace('visible', 'oculto');
        } else if (this.status == 404) {
            nodoLbProceso.textContent = '¡ERROR! ' + respuesta.message;
            nodoLbProceso.classList.replace('oculto', 'visible');
        } else {
            nodoLbProceso.textContent = '¡ERROR! ' + respuesta.message;
            nodoLbProceso.classList.replace('oculto', 'visible');
        }
    });
 }

/**
 * Hacemos la llamada AJAX para obtener las horas de un médico para tener una cita.
 * @param {date} dia
 * @param {string} colegiado
 * @returns nada, pasamos ejecución
 */
 function obtenerHorasMedico(dia, colegiado) {
    var conexion = new XMLHttpRequest();
    var respuesta;

    conexion.open('GET', `${ urlServidor + urlCuadranteMedico}/?dia=${dia}&colegiado=${colegiado}`);
    conexion.setRequestHeader('Content-Type', 'application/json');
    conexion.send();

    conexion.addEventListener('load', function () {
        respuesta = JSON.parse(this.responseText);
        limpiarSelect(nodoSelectHoras);
        if (this.status == 200 && this.readyState == 4) {
            if(debug) console.log("HORAS: " +respuesta);
            cargarSelect(nodoSelectHoras, respuesta);
            nodoLbProceso.classList.replace('visible', 'oculto');
        } else {
            nodoLbProceso.textContent = '¡ERROR! ' + respuesta.message;
            nodoLbProceso.classList.replace('oculto', 'visible');
        }
    });
 }

 /**
 * Hacemos la llamada AJAX para guardar en la base de datos la nueva cita
 * @param {string} key
 * @param {int} idMedico
 * @returns nada, pasamos ejecución
 */
function guardarCita(key, idMedico) {
    var conexion = new XMLHttpRequest();
    var respuesta;

    conexion.open('POST', urlServidor + urlAlta);
    conexion.setRequestHeader('Content-Type', 'application/json');
    conexion.send(JSON.stringify({key: key, id: idMedico}));

    conexion.addEventListener('load', function () {
        respuesta = JSON.parse(this.responseText);
        nodoLbProceso.classList.replace('oculto', 'visible');
        if (this.status == 200 && this.readyState == 4) {

            if(debug) console.log("Cita: " +respuesta);

            nodoLbProceso.textContent = "Cita confirmada";
            setTimeout(() => { location.assign('paciente.html')}, 2000);

        } else {
            nodoLbProceso.textContent = '¡ERROR! ' + respuesta.message;
        }
    });
}

 /**
 * Cargamos los valores del select. Datos-> respuesta servidor en JSON
 * Para saber que datos hay que cargar, comprobaremos la key del objeto y sabremos a que select pertenece
 * @param {select} nodo
 *  @param {object JSON} datos
 * @returns {boolean} True/False 
 */
function cargarSelect(nodoSelect, datos = [{}]) {
    var isOk = false;
    var arrayKeys;
    var arrayParametro;
    var opcion;
    var parametro = "";

    //Comprobamos que tenga contenido el objeto datos
    if (datos.length > 0 && Object.keys(datos[0]).length > 0) {
        nodoSelect.options.length = 1;
        arrayKeys = Object.keys(datos[0]);
        arrayParametro = Object.keys(datos[1]);
        if(debug) console.log("Array parametros: " + arrayParametro);
        parametro = arrayParametro[1];        
        if(debug) console.log("Parametro: " + parametro);
        
        datos.forEach(dato => {
            switch(parametro) {
                case 'denominacion':
                    opcion = new Option(dato.denominacion, dato.id);
                    break;
                case 'nombre':
                    opcion = new Option(dato.nombre, dato.colegiado);
                    break;
                case 'hora':
                    opcion = new Option(dato.hora, dato.id);
                    break;
                default:
                    nodoLbProceso.textContent = '¡ERROR! ';
                    nodoLbProceso.classList.replace('oculto', 'visible');
            }
            nodoSelect.appendChild(opcion); 
        }); 
        isOk = true;
    } else {
        nodoLbProceso.textContent = '¡ERROR! ' + respuesta.message;
        nodoLbProceso.classList.replace('oculto', 'visible');
    }

    return isOk;
}

  /**
 * Vaciamos cualquier select que nos pasen
 * @param {select} nodo
 * @returns nada, pasamos ejecución
 */
 function limpiarSelect(nodoSelect) {
    nodoSelect.options.length = 1;
}