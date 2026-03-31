DESCRIPCION
Este proyecto contiene la automatización de pruebas end-to-end para la búsqueda y validación de vuelos utilizando Playwright con JavaScript.
La automatización simula el flujo real de un usuario:

Búsqueda de vuelos (oneway / roundtrip)
Selección de rutas (manual o aleatoria)
Selección de pasajeros
Navegación hasta disponibilidad y detalle
Diligenciamiento de datos de pasajeros (dinámico o controlado)
Tecnologías utilizadas:
- Playwright
- JavaScript (Node.js)
- JSON (manejo de datos de prueba)
- Testing estructurado por specs
- Generación de datos dinámicos
- Estructura del proyecto
  proyecto-automatizacion
 ┣ 📂 tests
 ┃ ┗ 📜 vuelos.spec.js
 ┣ 📂 data
 ┃ ┗ 📜 testData.json
 ┣ 📂 utils
 ┃ ┗ 📜 helpers.js
 ┣ 📂 pages (opcional si usas POM)
 ┣ 📜 playwright.config.js
 ┣ 📜 package.json
 ┗ 📜 README.md
Instalación:
Clonar el repositorio:
git clone https://github.com/tu-usuario/tu-repo.git
Entrar al proyecto:
cd tu-repo
Instalar dependencias:
npm install
Instalar Playwright:
npx playwright install
Ejecución de pruebas:
Ejecutar todas las pruebas:
Npx playwright test
Modo UI (recomendado para debugging):
npx playwright test --ui
Ejecutar una prueba específica:
npx playwright test tests/vuelos.spec.js
Manejo de datos de prueba
Los datos se configuran en:
/data/testData.json
Características:
- Rutas aleatorias o definidas
- Generación automática de edades
- Control manual de pasajeros
- Datos reutilizables
- Funcionalidades implementadas
- Selección de tipo de viaje (oneway / roundtrip)
- Manejo de rutas nacionales/internacionalesGeneración de rutas aleatorias
- Automatización de contadores de pasajeros
- Llenado automático de formularios
- Flujo completo hasta detalle de vuelo
- Buenas prácticas aplicadas
Separación de datos (JSON)
Uso de helpers reutilizables
Código modular y escalable
Logs para debugging
Preparado para integración CI/CD
Reportes
Playwright genera reportes automáticamente:
npx playwright show-report




Laura Valentina Segura Carrasquilla
