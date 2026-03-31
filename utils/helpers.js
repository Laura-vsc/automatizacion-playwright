
//Funcion aceptar cookies

async function aceptarCookies(page) {
  try {
    const boton = page.locator('#js-buttonAcceptCookies');

    // Espera a que aparezca (máximo 5s)
    if (await boton.isVisible({ timeout: 5000 })) {
      await boton.click();
      console.log('Cookies aceptadas');
    }
  } catch (error) {
    console.log('No apareció el modal de cookies');
  }
}

// obtener ruta random
const routes = require('../data/routes.json');

function getRandomRoute(tipoRuta) {
  const rutas = routes[tipoRuta];
  const randomIndex = Math.floor(Math.random() * rutas.length);
  return rutas[randomIndex];
}

module.exports = { getRandomRoute, aceptarCookies };
