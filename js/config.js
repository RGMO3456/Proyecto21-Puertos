/* Configuración global: campos, compatibilidad campo→algoritmo. */
window.P21 = window.P21 || {};
(function (P) {
  P.CAMPOS = [
    { n: 'id_contenedor_teu', t: 'int' }, { n: 'peso_bruto_kg', t: 'int' },
    { n: 'fecha_atracadero', t: 'fecha' }, { n: 'puerto_operacion', t: 'str' },
    { n: 'linea_naviera', t: 'str' }, { n: 'estado', t: 'str' },
    { n: 'municipio', t: 'str' }, { n: 'tipo_carga', t: 'str' },
    { n: 'estatus_aduanal', t: 'str' }, { n: 'costo_maniobra_usd', t: 'float' }
  ];
  // Campos clave de ordenamiento (número de clave) y algoritmos compatibles.
  P.CLAVES = {
    id_contenedor_teu: { clave: 1, algos: ['Radix Sort', 'Counting Sort'] },
    peso_bruto_kg: { clave: 2, algos: ['Bucket Sort'] },
    fecha_atracadero: { clave: 3, algos: ['Quick Sort', 'Merge Sort', 'Heap Sort'] }
  };
  P.ALGOS = ['Radix Sort', 'Counting Sort', 'Bucket Sort', 'Quick Sort', 'Merge Sort', 'Heap Sort'];
  P.LIMITE_COUNTING = 10000000; // rango máximo permitido (Int32Array ≈ 40 MB); los ids del Excel abarcan 7,827,586 valores
})(window.P21);
