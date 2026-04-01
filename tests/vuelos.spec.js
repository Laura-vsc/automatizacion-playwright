const { test, expect } = require('@playwright/test');
const testData = require('../data/testData.json');
const {
  aceptarCookies,
  getRouteForTC,
  getTramosForTC,
  getFechasForTC,
  validarPasajeros
} = require('../utils/helpers');

// Seleccion origen y destino

async function llenarCiudad(page, selector, codigoIata, nombreCiudad) {
  await page.click(selector);
  await page.waitForTimeout(500);

  // Escribir el código IATA para filtrar la lista
  await page.fill(selector, codigoIata);
  await page.waitForTimeout(1500);

  const lista = page.locator('.text-secondary');
  await lista.first().waitFor({ state: 'visible', timeout: 5000 });

  const opcionExacta = lista.filter({ hasText: nombreCiudad }).first();
  await opcionExacta.waitFor({ state: 'visible', timeout: 5000 });
  await opcionExacta.click();
  await page.waitForTimeout(500);
}

// Seleccion fecha calendario
async function seleccionarFechaCalendario(page, fecha) {
  const [dia] = fecha.split('/');
  const diaNum = parseInt(dia, 10);

  const diasCalendario = page.locator('.js-day-in-calendar');
  await diasCalendario.first().waitFor({ state: 'visible', timeout: 5000 });

  // Regex exacto para evitar ambigüedad entre ej: 1 y 11, 2 y 12
  const diaTarget = diasCalendario.filter({ hasText: new RegExp(`^${diaNum}$`) }).first();
  await diaTarget.waitFor({ state: 'visible', timeout: 5000 });
  await diaTarget.click();
  await page.waitForTimeout(500);
}

// ROUNDTRIP

for (const tc of testData.roundtrip) {
  test(`[${tc.id}] Roundtrip - ${tc.proveedorNombre} - ${tc.tipoRuta}`, async ({ page }) => {

    const { valido, errores } = validarPasajeros(tc.pasajeros);
    if (!valido) throw new Error(`Pasajeros inválidos en ${tc.id}: ${errores.join(', ')}`);

    const ruta   = getRouteForTC(tc);
    const fechas = getFechasForTC(tc);

    console.log(`\n [${tc.id}] ${ruta.origen} → ${ruta.destino}`);
    console.log(`Salida: ${fechas.fechaSalida} | Regreso: ${fechas.fechaRegreso}`);
    console.log(`Adultos: ${tc.pasajeros.adultos} | Niños: ${tc.pasajeros.ninos.length} | Infantes: ${tc.pasajeros.infantes.length}`);

    await page.goto('https://aurorapru-qa.grupoaviatur.com');
    await aceptarCookies(page);
    await page.waitForTimeout(2000);

    // Origen — busca por IATA y valida nombre exacto en lista
    await llenarCiudad(page, '#js-origin-input', ruta.origen, ruta.nombreOrigen);

    // Destino
    await llenarCiudad(page, '#js-iata-code-destination', ruta.destino, ruta.nombreDestino);

    // Fechas — mismo calendario: primero salida, luego regreso
    await seleccionarFechaCalendario(page, fechas.fechaSalida);
    await seleccionarFechaCalendario(page, fechas.fechaRegreso);

    // ─── PASAJEROS ───────────────────────────────────────────
    // 
    // await page.click('#selector-boton-pasajeros');
    // await page.waitForTimeout(500);
    //
    // // Adultos (base 1, sumar los adicionales)
    // for (let i = 1; i < tc.pasajeros.adultos; i++) {
    //   await page.click('#selector-sumar-adultos');
    //   await page.waitForTimeout(300);
    // }
    //
    // // Niños
    // for (const nino of tc.pasajeros.ninos) {
    //   await page.click('#selector-sumar-ninos');
    //   await page.waitForTimeout(300);
    //   await page.selectOption('#selector-edad-nino', nino.edad.toString());
    // }
    //
    // // Infantes
    // for (const infante of tc.pasajeros.infantes) {
    //   await page.click('#selector-sumar-infantes');
    //   await page.waitForTimeout(300);
    // }
    //
    // await page.click('#selector-cerrar-modal-pasajeros');
    // ─────────────────────────────────────────────────────────

    // Buscar vuelos
    await page.click('#js-button-search-flights');
    await page.waitForTimeout(5000);

    // Seleccionar proveedor
    await page.keyboard.press('Shift+P');
    await page.waitForTimeout(2000);
    await page.click(`text=${tc.proveedor}`);
    await page.waitForTimeout(3000);

    await expect(page).not.toHaveURL(/error/);
  });
}

// ONEWAY

for (const tc of testData.oneway) {
  test(`[${tc.id}] Oneway - ${tc.proveedorNombre} - ${tc.tipoRuta}`, async ({ page }) => {

    const { valido, errores } = validarPasajeros(tc.pasajeros);
    if (!valido) throw new Error(`Pasajeros inválidos en ${tc.id}: ${errores.join(', ')}`);

    const ruta   = getRouteForTC(tc);
    const fechas = getFechasForTC(tc);

    console.log(`\n🛫 [${tc.id}] ${ruta.origen} → ${ruta.destino}`);
    console.log(`📅 Salida: ${fechas.fechaSalida}`);
    console.log(`👥 Adultos: ${tc.pasajeros.adultos} | Niños: ${tc.pasajeros.ninos.length} | Infantes: ${tc.pasajeros.infantes.length}`);

    await page.goto('https://aurorapru-qa.grupoaviatur.com');
    await aceptarCookies(page);
    await page.waitForTimeout(2000);

    // TODO: Seleccionar radio button "Solo ida" 
    // await page.click('#selector-radio-oneway');
    // await page.waitForTimeout(500);

    // Origen
    await llenarCiudad(page, '#js-origin-input', ruta.origen, ruta.nombreOrigen);

    // Destino
    await llenarCiudad(page, '#js-iata-code-destination', ruta.destino, ruta.nombreDestino);

    // Fecha salida (solo una para oneway)
    await seleccionarFechaCalendario(page, fechas.fechaSalida);

    // ─── PASAJEROS ───────────────────────────────────────────
    // TODO: pendiente selectores reales
    // ─────────────────────────────────────────────────────────

    // Buscar vuelos
    await page.click('#js-button-search-flights');
    await page.waitForTimeout(5000);

    // Seleccionar proveedor
    await page.keyboard.press('Shift+P');
    await page.waitForTimeout(2000);
    await page.click(`text=${tc.proveedor}`);
    await page.waitForTimeout(3000);

    await expect(page).not.toHaveURL(/error/);
  });
}

// MULTIDESTINO

for (const tc of testData.multidestino) {
  test(`[${tc.id}] Multidestino - ${tc.proveedorNombre} - ${tc.tipoRuta}`, async ({ page }) => {

    const { valido, errores } = validarPasajeros(tc.pasajeros);
    if (!valido) throw new Error(`Pasajeros inválidos en ${tc.id}: ${errores.join(', ')}`);

    const fechasTramos = getFechasForTC(tc);

    console.log(`\n🛫 [${tc.id}] Multidestino - ${fechasTramos.length} tramos`);
    fechasTramos.forEach((t, i) =>
      console.log(`  Tramo ${i + 1}: ${t.origen} → ${t.destino} | Fecha: ${t.fecha}`)
    );

    await page.goto('https://aurorapru-qa.grupoaviatur.com');
    await aceptarCookies(page);
    await page.waitForTimeout(2000);

    // TODO: Seleccionar radio button "Multidestino" — agregar selector cuando esté disponible
    // await page.click('#selector-radio-multidestino');
    // await page.waitForTimeout(500);

    for (let i = 0; i < fechasTramos.length; i++) {
      const tramo = fechasTramos[i];

      // TODO: confirmar si los campos tienen selectores indexados en el DOM
      // ej: `#js-origin-input-${i}`
      await llenarCiudad(page, '#js-origin-input', tramo.origen, tramo.nombreOrigen);
      await llenarCiudad(page, '#js-iata-code-destination', tramo.destino, tramo.nombreDestino);
      await seleccionarFechaCalendario(page, tramo.fecha);
      await page.waitForTimeout(500);

      // TODO: botón "Agregar tramo" entre tramos
      // if (i < fechasTramos.length - 1) {
      //   await page.click('#selector-agregar-tramo');
      //   await page.waitForTimeout(500);
      // }
    }

    // ─── PASAJEROS 
    

    // Buscar vuelos
    await page.click('#js-button-search-flights');
    await page.waitForTimeout(5000);

    // Seleccionar proveedor
    await page.keyboard.press('Shift+P');
    await page.waitForTimeout(2000);
    await page.click(`text=${tc.proveedor}`);
    await page.waitForTimeout(3000);

    await expect(page).not.toHaveURL(/error/);
  });
}