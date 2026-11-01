/* Lectura, validación y conversión del CSV. */
(function (P) {
  function parsear(t) {
    if (t.charCodeAt(0) === 0xFEFF) t = t.slice(1);
    const nl = t.indexOf('\n'), p = t.slice(0, nl > 0 ? nl : t.length);
    const d = p.split(';').length > p.split(',').length ? ';' : ',';
    const filas = []; let r = [], f = '', q = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === d) { r.push(f); f = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && t[i + 1] === '\n') i++;
        r.push(f); f = '';
        if (r.length > 1 || r[0] !== '') filas.push(r);
        r = [];
      } else f += c;
    }
    if (f !== '' || r.length) { r.push(f); filas.push(r); }
    return filas;
  }
  function fechaValida(n) {
    const a = Math.floor(n / 10000), m = Math.floor(n / 100) % 100, d = n % 100;
    return a >= 1900 && m >= 1 && m <= 12 && d >= 1 && d <= new Date(a, m, 0).getDate();
  }
  // Devuelve {registros} si todo es válido, o {errores,total} si hay problemas.
  P.cargarCSV = function (texto) {
    const filas = parsear(texto), errores = []; let total = 0;
    const err = m => { total++; if (errores.length < 20) errores.push(m); };
    if (filas.length < 2) return { errores: ['El archivo no tiene encabezado y registros.'], total: 1 };
    const enc = filas[0].map(h => h.trim().toLowerCase()), idx = {};
    const faltan = P.CAMPOS.filter(c => (idx[c.n] = enc.indexOf(c.n)) < 0).map(c => c.n);
    if (faltan.length) return { errores: ['Faltan columnas requeridas: ' + faltan.join(', ')], total: 1 };
    const regs = [];
    for (let i = 1; i < filas.length; i++) {
      const f = filas[i];
      if (f.length !== enc.length) { err(`Fila ${i + 1}: tiene ${f.length} columnas y se esperaban ${enc.length}.`); continue; }
      const o = {};
      for (const c of P.CAMPOS) {
        const v = f[idx[c.n]].trim();
        if (c.t === 'str') { if (!v) { err(`Fila ${i + 1}: «${c.n}» está vacío.`); break; } o[c.n] = v; continue; }
        const ok = c.t === 'float' ? /^\d+(\.\d+)?$/.test(v) : /^\d+$/.test(v);
        const x = ok ? Number(v) : NaN;
        if (!ok || (c.t !== 'float' && !Number.isSafeInteger(x)) || (c.t === 'fecha' && (v.length !== 8 || !fechaValida(x)))) {
          err(`Fila ${i + 1}: «${c.n}» tiene un valor no válido («${v}»).`); break;
        }
        o[c.n] = x;
      }
      if (Object.keys(o).length === 10) regs.push(o);
    }
    return total ? { errores, total } : { registros: regs };
  };
  // Segundo lote: agrega solo registros cuya fila completa (10 campos) no exista ya.
  // No se eliminan repetidos dentro del mismo lote ni se modifican los datos originales.
  const firma = r => P.CAMPOS.map(c => r[c.n]).join('\u0001');
  P.combinar = function (actuales, nuevos) {
    const vistos = new Set(actuales.map(firma)), res = actuales.slice(); let dup = 0;
    for (const r of nuevos) { if (vistos.has(firma(r))) dup++; else res.push(r); }
    return { registros: res, agregados: res.length - actuales.length, duplicados: dup };
  };
})(window.P21);
