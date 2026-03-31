const { test, expect } = require('@playwright/test');
const testData = require('../data/testData.json');
const { aceptarCookies, getRandomRoute } = require('../utils/helpers');

test('Automatización vuelos', async ({ page }) => {

  const ruta = getRandomRoute(testData.tipoRuta);

  console.log('Ruta seleccionada:', ruta);

  await page.goto('https://aurorapru-qa.grupoaviatur.com');
  await aceptarCookies(page);

  // Espera tipo humano
  await page.waitForTimeout(2000);

  // Ejemplo llenar origen
  await page.fill('#js-iata-code-origin', ruta.origen );
  await page.waitForTimeout(1000);

  await page.fill('#js-iata-code-destination', ruta.destino);
  await page.waitForTimeout(1000);

  // Pasajeros
  await page.fill('#pasajeros', testData.pasajeros.toString());

  // Buscar vuelos
  await page.click('#js-button-search-flights');

  // Espera resultados
  await page.waitForTimeout(5000);

  // Validación proveedor
  await page.keyboard.press('Shift+P');

  // Espera que aparezca lista
  await page.waitForTimeout(2000);

  // Aquí debes inspeccionar el selector real
  const proveedor = testData.proveedor;

  await page.click(`text=${proveedor}`);


});