/* Historial, estadísticas y exportación a CSV. */
(function (P) {
  const H = P.historial = { orden: [], busq: [] };
  P.registrarOrden = e => { e.n = H.orden.length + 1; H.orden.push(e); };
  P.registrarBusq = e => { e.n = H.busq.length + 1; H.busq.push(e); };
  P.estadisticas = () => P.ALGOS.map(a => {
    const u = H.orden.filter(e => e.algoritmo === a).length;
    return [a, u, H.orden.length ? (u / H.orden.length * 100).toFixed(1) + ' %' : '0.0 %'];
  });
  P.masUsado = () => { // método Alfa: algoritmo(s) más usado(s); no es el más rápido
    const e = P.estadisticas(), mx = Math.max(...e.map(x => x[1]));
    return mx ? { n: mx, nombres: e.filter(x => x[1] === mx).map(x => x[0]) } : null;
  };
  const esc = v => '"' + String(v).replace(/"/g, '""') + '"';
  function descargar(nombre, cab, filas) {
    const csv = '\uFEFF' + [cab, ...filas].map(f => f.map(esc).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = nombre; a.click(); URL.revokeObjectURL(a.href);
  }
  P.exportarOrden = () => descargar('historial_ordenamiento.csv',
    ['ejecucion', 'clave', 'campo', 'algoritmo', 'tiempo_ns', 'comparaciones', 'movimientos'],
    H.orden.map(e => [e.n, e.clave, e.campo, e.algoritmo, e.ns, e.cmp, e.mov]));
  P.exportarBusq = () => descargar('historial_busqueda.csv',
    ['ejecucion', 'campo', 'metodo', 'valor', 'tiempo_ns', 'comparaciones', 'coincidencias'],
    H.busq.map(e => [e.n, e.campo, e.metodo, e.valor, e.ns, e.cmp, e.hallados]));
})(window.P21);
