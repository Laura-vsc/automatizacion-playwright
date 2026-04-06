const { test, expect } = require('@playwright/test');
const testData = require('../data/testData.json');
const {
  getTCsPorSeccion,
  validarPasajeros,
  prepararPaginaInicial,
  completarBusqueda
} = require('../utils/helpers');

test.beforeEach(async ({ page }) => {
  await prepararPaginaInicial(page);
});

// TESTS

for (const tc of getTCsPorSeccion(testData, 'roundtrip')) {
  test(`[${tc.id}] Roundtrip - ${tc.proveedorNombre} - ${tc.tipoRuta}`, async ({ page }) => {
    const { valido, errores } = validarPasajeros(tc.pasajeros);
    if (!valido) throw new Error(`Pasajeros inválidos en ${tc.id}: ${errores.join(', ')}`);

    await completarBusqueda(page, tc);
    await expect(page).not.toHaveURL(/error/);
  });
}

// ONEWAY

for (const tc of getTCsPorSeccion(testData, 'oneway')) {
  test(`[${tc.id}] Oneway - ${tc.proveedorNombre} - ${tc.tipoRuta}`, async ({ page }) => {
    const { valido, errores } = validarPasajeros(tc.pasajeros);
    if (!valido) throw new Error(`Pasajeros inválidos en ${tc.id}: ${errores.join(', ')}`);

    await completarBusqueda(page, tc);
    await expect(page).not.toHaveURL(/error/);
  });
}

// MULTIDESTINO

for (const tc of getTCsPorSeccion(testData, 'multidestino')) {
  test(`[${tc.id}] Multidestino - ${tc.proveedorNombre} - ${tc.tipoRuta}`, async ({ page }) => {
    const { valido, errores } = validarPasajeros(tc.pasajeros);
    if (!valido) throw new Error(`Pasajeros inválidos en ${tc.id}: ${errores.join(', ')}`);

    await completarBusqueda(page, tc);
    await expect(page).not.toHaveURL(/error/);
  });
}