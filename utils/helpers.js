const routes = require('../data/routes.json');

// General logging function
function log(message) {
  console.log(message);
}

// COOKIES

async function aceptarCookies(page) {
  try {
    const boton = page.locator('#js-buttonAcceptCookies');
    if (await boton.isVisible({ timeout: 5000 })) {
      await boton.click();
      log('Cookies aceptadas');
    }
  } catch {
    log('No apareció el modal de cookies');
  }
}

async function prepararPaginaInicial(page, baseURL = 'https://aurorapru-qa.grupoaviatur.com') {
  await page.goto(baseURL);
  await aceptarCookies(page);
  await page.waitForTimeout(5000);
}

async function llenarCiudad(page, selector, codigoIata, nombreCiudad) {
  console.log(`Llenando campo ${selector} con código: ${codigoIata}, ciudad: ${nombreCiudad}`);
  
  const campo = page.locator(selector);
  
  try {
    // Esperar a que el campo sea visible e interactuable
    // campo.waitFor({ state: 'visible' });
    log(`Campo ${selector} visible`);
    
    campo.click();
    log(`Click en ${selector}`);
    await page.waitForTimeout(5000);

    // // Limpiar el campo
    // await campo.fill('');
    // log(`Campo ${selector} limpiado`);
    // await page.waitForTimeout(300);

    // Escribir el código IATA
    await campo.type(codigoIata, { delay: 100 });
    log(`Texto escrito en ${selector}: ${codigoIata}`);
    await page.waitForTimeout(300);

    // Esperar a que aparezca la lista de opciones
    const lista = page.locator('.text-secondary');
    log(`Esperando lista de opciones...`);
    await lista.first().waitFor({ state: 'visible', timeout: 10000 });
    log(`Lista de opciones visible`);

    // Contar opciones disponibles
    const count = await lista.count();
    log(`${count} opciones encontradas`);

    // Buscar y seleccionar la opción exacta
    const opcionExacta = lista.filter({ hasText: nombreCiudad }).first();
    log(`Buscando opción exacta: ${nombreCiudad}`);
    
    await opcionExacta.waitFor({ state: 'visible', timeout: 10000 });
    log(`Opción encontrada: ${nombreCiudad}`);
    
    await opcionExacta.click();
    log(`Opción seleccionada: ${nombreCiudad}`);
    await page.waitForTimeout(500);
    
  } catch (error) {
    log(`Error en llenarCiudad para ${selector}: ${error.message}`);
    throw error;
  }
}

async function seleccionarFechaCalendario(page, fecha) {
  const [dia] = fecha.split('/');
  const diaNum = parseInt(dia, 10);

  const diasCalendario = page.locator('.js-day-in-calendar');
  await diasCalendario.first().waitFor({ state: 'visible', timeout: 5000 });

  const diaTarget = diasCalendario.filter({ hasText: new RegExp(`^${diaNum}$`) }).first();
  await diaTarget.waitFor({ state: 'visible', timeout: 5000 });
  await diaTarget.click();
  await page.waitForTimeout(5000);
}

async function completarBusqueda(page, tc) {
  const ruta = getRouteForTC(tc);
  const fechas = getFechasForTC(tc);

  await llenarCiudad(page, '#js-iata-code-origin', ruta.origen, ruta.nombreOrigen);
  await llenarCiudad(page, '#js-iata-code-destination', ruta.destino, ruta.nombreDestino);

  if (tc.tipoViaje === 'roundtrip') {
    await seleccionarFechaCalendario(page, fechas.fechaSalida);
    await seleccionarFechaCalendario(page, fechas.fechaRegreso);
  } else if (tc.tipoViaje === 'oneway') {
    await seleccionarFechaCalendario(page, fechas.fechaSalida);
  } else if (tc.tipoViaje === 'multidestino') {
    for (const tramo of fechas) {
      await llenarCiudad(page, '#js-origin-input', tramo.origen, tramo.nombreOrigen);
      await llenarCiudad(page, '#js-destination-input-iata', tramo.destino, tramo.nombreDestino);
      await seleccionarFechaCalendario(page, tramo.fecha);
      await page.waitForTimeout(500);
    }
  }

  await buscarVuelos(page);
  await seleccionarProveedor(page, tc.proveedor);
}
async function buscarVuelos(page) {
  await page.click('#js-button-search-flights');
  await page.waitForTimeout(5000);
}

// RUTAS

/**
 * Retorna una ruta según el TC:
 * - Si usarRutaAleatoria es true → saca una ruta random del JSON
 * - Si es false → usa origen/destino definidos en el TC
 */
function getRouteForTC(tc) {
  const rutas = routes[tc.tipoRuta] || [];

  if (tc.usarRutaAleatoria) {
    const idx = Math.floor(Math.random() * rutas.length);
    return rutas[idx];
  }

  const ruta = rutas.find(r => r.origen === tc.origen && r.destino === tc.destino)
    || rutas.find(r => r.origen === tc.destino && r.destino === tc.origen);

  return ruta || {
    origen: tc.origen,
    destino: tc.destino,
    nombreOrigen: tc.origen,
    nombreDestino: tc.destino
  };
}

function getTramosForTC(tc) {
  return tc.tramos || [];
}

// FECHAS

 //Convierte un offset en días a una fecha real (dd/mm/yyyy)
 
function offsetToDate(offsetDias) {
  if (offsetDias === null || offsetDias === undefined) return null;

  const diasFinal = Math.max(20, Math.min(30, offsetDias));

  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diasFinal);

  const dia  = String(fecha.getDate()).padStart(2, '0');
  const mes  = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

function getFechasForTC(tc) {
  if (tc.tipoViaje === 'multidestino') {
    return tc.tramos.map(tramo => ({
      origen:        tramo.origen,
      nombreOrigen:  tramo.nombreOrigen,
      destino:       tramo.destino,
      nombreDestino: tramo.nombreDestino,
      fecha:         offsetToDate(tramo.fechaSalidaOffset)
    }));
  }

  return {
    fechaSalida:  offsetToDate(tc.fechas.fechaSalidaOffset),
    fechaRegreso: offsetToDate(tc.fechas.fechaRegresoOffset)
  };
}

// PASAJEROS

/**
 * Valida que los pasajeros del TC cumplen las reglas:
 * - Total máximo 9 pasajeros
 * - Adultos: 12 años o más
 * - Niños: 2 a 11 años
 * - Infantes: menores de 2 años (requieren un adulto cada uno)
 */
function validarPasajeros(pasajeros) {
  const { adultos, ninos = [], infantes = [] } = pasajeros;
  const total = adultos + ninos.length + infantes.length;
  const errores = [];

  if (total > 9)
    errores.push(`Total de pasajeros (${total}) supera el máximo de 9`);

  if (infantes.length > adultos)
    errores.push(`Infantes (${infantes.length}) superan el número de adultos (${adultos}). Se requiere 1 adulto por infante`);

  ninos.forEach((n, i) => {
    if (n.edad < 2 || n.edad > 11)
      errores.push(`Niño [${i}] tiene edad inválida: ${n.edad}. Debe ser entre 2 y 11 años`);
  });

  infantes.forEach((inf, i) => {
    if (inf.edad >= 2)
      errores.push(`Infante [${i}] tiene edad inválida: ${inf.edad}. Debe ser menor de 2 años`);
  });

  return { valido: errores.length === 0, errores, total };
}

/**
 * Genera un objeto de pasajeros aleatorio respetando todas las reglas
 * @param {number} maxTotal
 */
function generarPasajerosAleatorios(maxTotal = 9) {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const numInfantes = rand(0, 1);
  const numAdultosMinimos = Math.max(1, numInfantes);
  const presupuestoRestante = maxTotal - numInfantes;
  const numAdultos = rand(numAdultosMinimos, Math.min(6, presupuestoRestante));
  const maxNinos = presupuestoRestante - numAdultos;
  const numNinos = rand(0, Math.min(3, maxNinos));

  const ninos    = Array.from({ length: numNinos },    () => ({ edad: rand(2, 11) }));
  const infantes = Array.from({ length: numInfantes }, () => ({ edad: rand(0, 1) }));

  return { adultos: numAdultos, ninos, infantes };
}


function getTotalPasajeros(tc) {
  const { adultos, ninos = [], infantes = [] } = tc.pasajeros;
  return adultos + ninos.length + infantes.length;
}

// UTILIDADES GENERALES

/**
 * Carga los TCs de una sección específica del testData
 * @param {object} testData
 * @param {'roundtrip'|'oneway'|'multidestino'} seccion
 */
function getTCsPorSeccion(testData, seccion) {
  return testData[seccion] || [];
}

 //Busca un TC específico por ID en todo el testData
 
function getTCById(testData, id) {
  const secciones = ['roundtrip', 'oneway', 'multidestino'];
  for (const seccion of secciones) {
    const tc = (testData[seccion] || []).find(t => t.id === id);
    if (tc) return tc;
  }
  return null;
}

module.exports = {
  aceptarCookies,
  getRouteForTC,
  getTramosForTC,
  offsetToDate,
  getFechasForTC,
  validarPasajeros,
  generarPasajerosAleatorios,
  getTotalPasajeros,
  getTCsPorSeccion,
  getTCById,
  prepararPaginaInicial,
  buscarVuelos,
  llenarCiudad,
  seleccionarFechaCalendario,
  completarBusqueda
};