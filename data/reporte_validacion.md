# Reporte de validación — Proyecto 21 (PORT DATA MX)

*Fiscalización y registro de tráfico y contenedores en puertos marítimos nacionales.*
Generado el 30/10/2026 con los archivos finales del proyecto. Las fechas de este reporte se muestran como DD/MM/YYYY; en `data/*.csv` y `js/data.js` se guardan como AAAAMMDD (8 dígitos), formato que exige `js/csv.js`.

## 1. Resumen

| Verificación | Resultado | Detalle |
|---|---|---|
| Filas de datos (sin encabezado) en el CSV | ✅ Cumple | 15,000 |
| Filas en `js/data.js` | ✅ Cumple | 15,000 |
| Filas en el XLSX (hoja `registros_puertos`) | ✅ Cumple | 15,000 |
| 10 campos con los nombres y el orden requeridos | ✅ Cumple | `id_contenedor_teu` … `costo_maniobra_usd` |
| Identificadores duplicados | ✅ Cumple | 15,000 ids únicos, 0 duplicados |
| Filas completas duplicadas | ✅ Cumple | 0 |
| Valores faltantes o vacíos | ✅ Cumple | 0 |
| Tipos de datos válidos (enteros, fecha AAAAMMDD real, costo con 2 decimales) | ✅ Cumple | 0 errores |
| Puerto ↔ estado ↔ municipio coherentes | ✅ Cumple | 0 incoherencias, 11 puertos |
| Navieras, tipos de carga y estatus dentro del catálogo del Excel | ✅ Cumple | sin valores fuera de catálogo |
| Registros originales del Excel conservados íntegros | ✅ Cumple | 100 de 100, mismos ids y valores |
| Registros sintéticos añadidos | ✅ Cumple | 14,900 (= 15,000 − 100) |
| `js/data.js` idéntico al CSV | ✅ Cumple | contenido exacto |
| XLSX idéntico al CSV (valores) | ✅ Cumple | 0 diferencias |

## 2. Origen de los datos

- **Fuente obligatoria:** `Datos_para_el_csv_en_cloud.xlsx`, hoja `catalogo_puertos`: 101 filas, de las cuales 1 es el encabezado y **100 son registros**.
- Los 100 registros se conservaron **sin renumerar ids ni modificar valores**. Incluyen 39 ids de 7,000,000 o más.
- Faltaban 15,000 − 100 = **14,900** registros, y solo se generaron esos.
- Los registros sintéticos usan únicamente los 11 puertos, 8 navieras, 6 tipos de carga y 4 estatus aduanales del Excel, con la relación puerto–estado–municipio del propio Excel.
- Parámetros de la generación (semilla fija, reproducible):
  - Fechas: del 01/12/2025 al 31/01/2026, el mismo periodo del Excel.
  - Peso: 5,000 a 28,000 kg, con distribución triangular; el Excel va de 5,149 a 27,996.
  - Costo: 150 a 850 USD, creciente con el peso, con un recargo moderado en carga refrigerada y química; el Excel va de 151.89 a 847.96. Los valores fuera de rango se vuelven a muestrear, no se recortan.
  - Ids: aleatorios únicos dentro del rango del Excel (2,105,120 a 9,932,704).
  - Peso por puerto, naviera, carga y estatus: proporcional a la frecuencia del Excel, suavizada con +3.
- Los registros quedaron mezclados (originales y sintéticos revueltos), por lo que la base no está ordenada de antemano.
- Los datos sintéticos **no son registros reales**.

## 3. Rangos obtenidos

| Campo | Mínimo | Máximo |
|---|---|---|
| id_contenedor_teu | 2,105,120 | 9,932,704 (rango de 7,827,585 valores) |
| peso_bruto_kg | 5,149 | 27,996 |
| fecha_atracadero | 01/12/2025 | 31/01/2026 |
| costo_maniobra_usd | 150.01 | 847.96 |

## 4. Puertos, estados y municipios

| puerto_operacion | estado | municipio | registros |
|---|---|---|---|
| ALTAMIRA, TAMPS. | Tamaulipas | Altamira | 2,263 |
| COATZACOALCOS, VER. | Veracruz | Coatzacoalcos | 775 |
| ENSENADA, B.C. | Baja California | Ensenada | 1,390 |
| GUAYMAS, SON. | Sonora | Guaymas | 1,240 |
| LAZARO CARDENAS, MICH. | Michoacán | Lázaro Cárdenas | 2,135 |
| MANZANILLO, COL. | Colima | Manzanillo | 2,542 |
| MAZATLAN, SIN. | Sinaloa | Mazatlán | 1,032 |
| PICHILINGUE, B.C.S. | Baja California Sur | La Paz | 820 |
| PROGRESO, YUC. | Yucatán | Progreso | 1,208 |
| PUERTO CHIAPAS, CHIS. | Chiapas | Tapachula | 819 |
| PUERTO MORELOS, Q. ROO | Quintana Roo | Puerto Morelos | 776 |

## 5. Cambio en el código (único)

| Archivo | Cambio | Motivo |
|---|---|---|
| `js/config.js` | `P.LIMITE_COUNTING`: 5,000,000 → 10,000,000 | Los ids originales del Excel abarcan 7,827,585 valores y Counting Sort se habría descartado con el límite anterior. Memoria máxima ≈ 40 MB. |
| `index.html` (texto de la lista de algoritmos) y `README.md` | Se actualiza el número 5,000,000 → 10,000,000 y se menciona este reporte | Mantener la documentación coherente con `config.js`. |

No se modificaron diseño, algoritmos, búsquedas, estadísticas, gráficas ni la carga de CSV. Datos actualizados: `data/registros_puertos_15000.csv`, `data/registros_puertos_15000.xlsx`, `js/data.js` (generado a partir del CSV).

## 6. Pruebas ejecutadas (Chromium 141 sin interfaz, abriendo `index.html` desde `file://`)

| Prueba | Resultado |
|---|---|
| El HTML carga los 9 scripts sin errores de consola ni solicitudes fallidas | ✅ 0 errores |
| Botón «Cargar los 15,000 registros incluidos» | ✅ Indicador «15,000», 30 + 30 filas mostradas |
| Panorama: indicadores y 6 gráficas con contenido | ✅ g-puerto, g-naviera, g-estatus, g-carga, g-mes, g-costo |
| Carga del CSV definitivo con el selector de archivos | ✅ 15,000 registros |
| «Agregar segundo lote» con el mismo CSV | ✅ Omite 15,000 duplicados y conserva 15,000 |
| Ordenamiento aleatorio por la interfaz (6 ejecuciones): historial, estadísticas, gráfica y Método Alfa | ✅ 6 filas en el historial |
| Selección de método y búsqueda por la interfaz | ✅ 00,000 nanosegundos. Comparaciones: 15,000. Coincidencias: 1 |
| Búsqueda lineal vs. binaria (id original 9,932,704 y peso) | ✅ 1 coincidencia en ambas; lineal 15,000 comparaciones, binaria 15 |
| Búsqueda de texto lineal («manzanillo, col.») | ✅ 2,542 coincidencias |

### Algoritmos sobre los 15,000 registros

| Algoritmo | Campo | Registros | ¿Ordenado? | ¿Mismos registros? | Tiempo |
|---|---|---|---|---|---|
| Radix Sort | id_contenedor_teu | 15,000 | sí | sí | 17.8 ms |
| Counting Sort | id_contenedor_teu | 15,000 | sí | sí | 152 ms |
| Bucket Sort | peso_bruto_kg | 15,000 | sí | sí | 18.8 ms |
| Quick Sort | fecha_atracadero | 15,000 | sí | sí | 8.3 ms |
| Merge Sort | fecha_atracadero | 15,000 | sí | sí | 38.5 ms |
| Heap Sort | fecha_atracadero | 15,000 | sí | sí | 29.1 ms |

Counting Sort sigue disponible para `id_contenedor_teu` con el nuevo límite. Los demás algoritmos no se tocaron y se ejecutaron correctamente.

## 7. Muestra de registros originales del Excel (8 de 100)

| id_contenedor_teu | peso_bruto_kg | fecha_atracadero | puerto_operacion | linea_naviera | estado | municipio | tipo_carga | estatus_aduanal | costo_maniobra_usd |
|---|---|---|---|---|---|---|---|---|---|
| 9453538 | 15715 | 12/12/2025 | PROGRESO, YUC. | HMM | Yucatán | Progreso | Carga General Contenerizada | En Reconocimiento Aduanero | 509.86 |
| 6060642 | 5552 | 22/01/2026 | ENSENADA, B.C. | HMM | Baja California | Ensenada | Carga Industrial | En Revisión Documental | 199.29 |
| 6447245 | 24890 | 18/01/2026 | PUERTO MORELOS, Q. ROO | CMA CGM | Quintana Roo | Puerto Morelos | Productos Químicos | En Reconocimiento Aduanero | 534.38 |
| 2105120 | 6929 | 24/01/2026 | ALTAMIRA, TAMPS. | Maersk | Tamaulipas | Altamira | Granel Agrícola | En Revisión Documental | 378.65 |
| 9932704 | 11250 | 18/01/2026 | PUERTO MORELOS, Q. ROO | ONE | Quintana Roo | Puerto Morelos | Granel Agrícola | En Revisión Documental | 709.74 |
| 5316727 | 19656 | 25/01/2026 | PUERTO CHIAPAS, CHIS. | HMM | Chiapas | Tapachula | Automotriz | En Revisión Documental | 469.26 |
| 4163799 | 26278 | 20/12/2025 | ENSENADA, B.C. | HMM | Baja California | Ensenada | Carga Industrial | En Revisión Documental | 476.88 |
| 6544265 | 25575 | 26/01/2026 | LAZARO CARDENAS, MICH. | CMA CGM | Michoacán | Lázaro Cárdenas | Carga Refrigerada | En Revisión Documental | 815.89 |

## 8. Limitaciones

- Las pruebas se ejecutaron en Chromium sin interfaz, no en otros navegadores.
- El XLSX se generó y se verificó con `openpyxl`; no se abrió en Microsoft Excel. Guarda las fechas como fecha de Excel con formato DD/MM/YYYY.
- Los ordenamientos aleatorios de la interfaz eligen combinaciones al azar; la prueba por interfaz ejecutó 6 de ellas, y los 6 algoritmos se ejecutaron todos por separado.
