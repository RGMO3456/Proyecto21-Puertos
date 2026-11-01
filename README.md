# Proyecto 21: Fiscalización y registro de tráfico y contenedores en puertos marítimos nacionales

Aplicación web estática (HTML, CSS y JavaScript puro; sin frameworks, dependencias ni servidor). Compara algoritmos de ordenamiento y búsqueda sobre registros en la memoria RAM del navegador. Incluye los 15,000 registros de práctica (100 originales del Excel del autor + 14,900 sintéticos; ver `data/reporte_validacion.md`) (`data/` y botón «Cargar los 15,000 registros incluidos»). Cualquier CSV propio se procesa en tu equipo y no se envía a ningún servidor.

## Estructura
```
index.html  styles.css  app.js  README.md
data/  registros_puertos_15000.csv  registros_puertos_15000.xlsx  reporte_validacion.md
js/  config.js  data.js  csv.js  sorts.js  search.js  log.js  ui.js  dash.js
```
Scripts clásicos (no módulos ES), cargados en este orden desde `index.html`: config, data, csv, sorts, search, log, ui, dash, app. `dash.js` dibuja el panorama (indicadores y gráficas), los conteos animados y los efectos al desplazar; `data.js` contiene el CSV incluido para que funcione con doble clic.

## Abrir y usar
1. Descomprime el ZIP y abre `index.html` con doble clic.
2. «Cargar los 15,000 registros incluidos» (un clic) o «Seleccionar archivo CSV» (15,000 registros o más). Se muestran los primeros 30 y los últimos 30, en el orden de carga.
3. «Agregar segundo lote (CSV)» (activo tras una carga válida) suma los 15,000 nuevos. Se omiten filas idénticas en los 10 campos a las ya cargadas y se informa cuántas se agregaron y cuántas se omitieron. Al agregar, el ordenamiento anterior se invalida y hay que ordenar de nuevo.
4. «Ejecutar ordenamiento aleatorio». Cada pulsación elige campo clave y algoritmo compatible; si hay otra combinación válida, no repite la anterior de inmediato. Trabaja sobre una copia.
5. «Seleccionar método aleatorio» y «Buscar». La binaria solo se ejecuta sobre el campo ordenado, tras verificar el orden.
6. Sección 4: gráfica, Método Alfa (algoritmo más usado, no el más rápido), historiales y exportación a CSV.

## Encabezados esperados del CSV
`id_contenedor_teu, peso_bruto_kg, fecha_atracadero, puerto_operacion, linea_naviera, estado, municipio, tipo_carga, estatus_aduanal, costo_maniobra_usd`
Cualquier orden de columnas; separador coma o punto y coma. Enteros no negativos (hasta 9,007,199,254,740,991); fecha AAAAMMDD válida; costo decimal con punto; textos no vacíos. Si hay errores no se carga nada y se muestran los primeros 20.

## Novedades v4
Portada animada, panorama de datos (KPIs, barras por puerto y naviera, donas de estatus y carga, línea mensual, costo promedio), conteos animados, aparición al desplazar, barra de progreso, sugerencias de valores en la búsqueda de texto, créditos completados y datos incluidos. Respeta «reducir movimiento» del sistema.

## Mediciones
`performance.now()` mide tiempo transcurrido de alta resolución, no solo CPU; los nanosegundos son ms × 1,000,000 y no implican precisión real de 1 ns.
- Carga: leer + validar + convertir (+ combinar en el segundo lote); no incluye dibujar tablas.
- Ordenamiento: solo el algoritmo (la copia previa y el dibujo quedan fuera). Búsqueda: solo la búsqueda (la verificación de orden queda fuera).
- Comparaciones = comparaciones entre claves (Radix y Counting: 0). Movimientos = intercambios (Quick, Heap) o escrituras de registros (Radix, Counting, Merge, Bucket).

## Limitaciones conocidas
- Counting Sort se descarta si el rango de ids supera 10,000,000. Bucket Sort es lento si casi todos los pesos caen en una cubeta.
- Duplicado = los 10 campos iguales; solo se compara contra lo ya cargado, no dentro del mismo lote.
- La búsqueda de texto ignora mayúsculas/minúsculas; la binaria solo opera sobre los 3 campos numéricos clave.
- Las tablas muestran como máximo 30 + 30 registros y 100 coincidencias.
- Con archivos muy grandes el navegador puede tardar unos segundos en leer el CSV.

## Publicar en GitHub Pages
1. Repositorio público nuevo. 2. Sube `index.html`, `styles.css`, `app.js`, `README.md` y la carpeta `js/` (sin CSV privados, contraseñas ni claves). 3. **Settings → Pages → Deploy from a branch**, rama `main`, carpeta `/ (root)`. 4. URL: `https://TU-USUARIO.github.io/NOMBRE-REPO/`.
