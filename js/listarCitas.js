//Recogemos los nodos
var nodoNombreUsuario;
var nombreUsuario;
var nodolbEspecialidad;
var nodolbMedico;
var nodolbDia;
var nodolbHora;
var nodoBtnCancelar;
var nodoLbProceso;
var nodoContenedorCita;
var nodoSection;
var key;

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
    nodoNombreUsuario = document.getElementById('nombUsuario');
    nodolbEspecialidad = document.getElementById('lbEspecialidad');
    nodolbMedico = document.getElementById('lbMedico');
    nodolbDia = document.getElementById('lbDia'); 
    nodolbHora = document.getElementById('lbHora'); 
    nodoLbProceso = document.getElementById('msgProceso');
    nodoContenedorCita = document.getElementById('contenedor-cita');
    nodoContendorCitas= document.getElementById('contenedor-citas');
    nombreUsuario = obtenerNombreUsuario();
    nodoNombreUsuario.textContent = "Usuario: " + obtenerNombreUsuario();
    key = localStorage.getItem(prefijoKey + nombreUsuario);

    listarCitas(key);
    
    //if(debug2) clonarContendor(nodoContenedorCita);

    document.body.addEventListener('click', function (e) {
        if (e.target.className == 'btnCancelar') {
            if (confirm('Vas a cancelar esta cita. Pulsa para confirmar.')) {
                cancelarCita(localStorage.getItem(prefijoKey + nombreUsuario), e.target.id);
                while (nodoContendorCitas.firstChild) {
                    nodoContendorCitas.removeChild(nodoContendorCitas.firstChild);
                };
                setTimeout(() => {nodoLbProceso.classList.replace('visible', 'oculto'); }, 2000);
                setTimeout(() => { location.assign('paciente.html')}, 2000);
            }
        }
    });
}

function clonarContendor(nodo){
    let clon = nodo.cloneNode("contenedor-cita");
    nodoContendorCitas.appendChild(clon);
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
 * Hacemos la llamada AJAX para obtener las citas de un paciente através de su key.
 * @param {string} key
 * @returns nada, pasamos ejecución. 
 */
function Cita(idCita, especialidad, medico, dia, hora){
    var idCita = idCita;
    this.especialidad = especialidad;
    this.medico = medico;
    this.dia = dia;
    this.hora = hora;
    var validarNum = new RegExp('\d');
    var validarCadena = new RegExp('\D');
    var validarDia = new RegExp('[20]\d{2}[-][1|0][0-9][-][0-3][0-9]');
    var validarHora = new RegExp('[0-2][0-9][:][0-6][0-9]');

    //idCita
    Cita.prototype.getidCita = function() {
        return this.idCita;
    }

    Cita.prototype.setidCita = function() {
        
        if (idCita != undefined && validarNum.test(idCita))
            this.idCita = idCita;
        else {
            nodoLbProceso.textContent = '¡ERROR! Los datos no son válidos';
            nodoLbProceso.classList.replace('oculto', 'visible');
        }
    }

    //Especialidad
    Cita.prototype.getEspecialidad = function() {
        return this.especialidad;
    }

    Cita.prototype.setEspecialidad = function() {
        if (especialidad != undefined && validarCadena.test(especialidad))
            this.especialidad = especialidad;
        else {
            nodoLbProceso.textContent = '¡ERROR! Los datos no son válidos';
            nodoLbProceso.classList.replace('oculto', 'visible');
        }
    }

    //Médico
    Cita.prototype.getMedico = function() {
        return this.medico;
    }

    Cita.prototype.setMedico = function() {
        if (medico != undefined && validarCadena.test(medico))
            this.medico = medico;
        else {
            nodoLbProceso.textContent = '¡ERROR! Los datos no son válidos';
            nodoLbProceso.classList.replace('oculto', 'visible');
        }
    }

    //Día
    Cita.prototype.getDia = function() {
        return this.dia;
    }

    Cita.prototype.setDia = function() {
        if (dia != undefined && validarDia.test(dia))
            this.dia = dia;
        else {
            nodoLbProceso.textContent = '¡ERROR! Los datos no son válidos';
            nodoLbProceso.classList.replace('oculto', 'visible');
        }
    }

    //Hora
    Cita.prototype.getHora = function() {
        return this.hora;
    }

    Cita.prototype.setHora = function() {
        if (hora != undefined && validarHora.test(hora))
            this.hora = hora;
        else {
            nodoLbProceso.textContent = '¡ERROR! Los datos no son válidos';
            nodoLbProceso.classList.replace('oculto', 'visible');
        }
    }

}

 /**
 * Hacemos la llamada AJAX para obtener las citas de un paciente através de su key.
 * @param {string} key
 * @returns {int} contador de las citas que tiene ese paciente 
 * En el caso de que sea correcta la petición, nos puede devolver 0, 1 o más citas
 */
function listarCitas(key) {
    var conexion = new XMLHttpRequest();
    var respuesta;
    let contador = 0;
    if(debug) console.log("En funcion");
    conexion.open('POST', urlServidor + urlCitasPaciente);
    conexion.setRequestHeader('Content-Type', 'application/json');
    conexion.send(JSON.stringify({key: key}));

    conexion.addEventListener('load', function () {
        respuesta = JSON.parse(this.responseText);
        contador = 0;
        
        if (this.status == 200 && this.readyState == 4) {
            if(debug) console.log(respuesta);
            respuesta.forEach(cita => {
                // contador++;
                //let claseCita = new Cita(cita.id, cita.especialidad, cita.doctor, cita.dia, cita.hora);
                //let miCita = rellenarCita(claseCita);
                let claseCita = rellenarCita(cita.id, 'Medico: ' + cita.doctor, 'Especialidad: ' + cita.especialidad, 'Día: ' + cita.dia, 'Hora: ' + cita.hora);
                nodoContendorCitas.appendChild(claseCita);
                //nodoContendorCitas.appendChild(miCita);
            });
            
        } else {
            nodoLbProceso.textContent = '¡ERROR! ' + respuesta.message;
            nodoLbProceso.classList.replace('oculto', 'visible');
        }
    });
    //if(debug) console.log("numCitasFuera:" + contador);
}

/**
 * Creamos un contenedor para generar cada cita que tenga un paciente
 * @param {int} idCita
 * @param {object} datos
 * @returns {object} cita 
 */
 function rellenarCita(idCita, ...datos) {

    let cita = document.createElement('div');
    let botonCancelar = document.createElement('button');
    cita.setAttribute('class', 'oculto');
    cita.setAttribute('class', 'visible');
    cita.setAttribute('class', 'listarCitas');
    botonCancelar.setAttribute('type', 'button');
    botonCancelar.setAttribute('id', idCita);
    botonCancelar.setAttribute('class', 'btnCancelar')
    botonCancelar.textContent = 'Cancelar Cita';

    datos.forEach(dato => {
        let label = document.createElement('label');
        let texto = document.createTextNode(dato);

        label.appendChild(texto);
        cita.appendChild(label);
    });

    cita.appendChild(botonCancelar);
    if(debug) console.log("Cita: " + cita);
    return cita;
 }

  /**
 * Hacemos la llamada AJAX para cancelar la cita de un paciente.
 * @param {string} key
 * @param {int} idCita
 * @returns {} nada
 */
 function cancelarCita(key, idCita) {

    let conexion = new XMLHttpRequest();
    let respuesta;

    conexion.open('POST', urlServidor + urlCancelarCita);
    conexion.setRequestHeader('Content-Type', 'application/json');
    conexion.send(JSON.stringify({ key: key, id: idCita }));

    conexion.addEventListener('load', function () {

        respuesta = JSON.parse(this.responseText);
        nodoContendorCitas.classList.replace('visible', 'oculto');
        nodoLbProceso.classList.replace('oculto', 'visible');
        if (this.status == 200 && this.readyState == 4) {
            nodoLbProceso.textContent = 'Su cita ha sido cancelada';
        } else {
            nodoLbProceso.textContent = respuesta.message;
        }
    });
}