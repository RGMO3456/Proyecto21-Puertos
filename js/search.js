/* Búsquedas. Devuelven posiciones (0-based) de todas las coincidencias. */
(function (P) {
  P.parseValor = function (campo, t) {
    t = t.trim(); if (!t) return null;
    if (P.CAMPOS.find(c => c.n === campo).t === 'str') return t.toLowerCase();
    return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
  };
  P.buscarLineal = function (datos, campo, v) {
    const pos = []; let cmp = 0, str = typeof v === 'string';
    const t0 = performance.now();
    for (let i = 0; i < datos.length; i++) { cmp++; if ((str ? datos[i][campo].toLowerCase() : datos[i][campo]) === v) pos.push(i); }
    const ms = performance.now() - t0;
    return { pos, cmp, ms, ns: Math.round(ms * 1e6) };
  };
  // Límite inferior + recorrido de repetidos. Solo para el campo ya ordenado.
  P.buscarBinaria = function (datos, campo, v) {
    const pos = []; let lo = 0, hi = datos.length, cmp = 0;
    const t0 = performance.now();
    while (lo < hi) { const m = (lo + hi) >> 1; cmp++; if (datos[m][campo] < v) lo = m + 1; else hi = m; }
    for (let i = lo; i < datos.length; i++) { cmp++; if (datos[i][campo] === v) pos.push(i); else break; }
    const ms = performance.now() - t0;
    return { pos, cmp, ms, ns: Math.round(ms * 1e6) };
  };
})(window.P21);
