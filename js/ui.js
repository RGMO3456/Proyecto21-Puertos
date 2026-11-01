/* Utilidades de interfaz (todo el texto se inserta con textContent). */
(function (P) {
  P.$ = id => document.getElementById(id);
  P.fmt = n => Number(n).toLocaleString('es-MX');
  P.msg = (id, t, cls) => { const e = P.$(id); e.textContent = t; e.className = 'msg ' + (cls || ''); };
  P.tabla = function (cont, cab, filas) {
    cont.replaceChildren();
    if (!filas.length) return;
    const t = document.createElement('table'), h = t.createTHead().insertRow();
    cab.forEach(x => { const th = document.createElement('th'); th.textContent = x; h.appendChild(th); });
    const b = t.createTBody();
    filas.forEach(f => { const tr = b.insertRow(); f.forEach(v => tr.insertCell().textContent = v); });
    cont.appendChild(t);
  };
  P.tablaRegistros = (cont, regs, desde) =>
    P.tabla(cont, ['Reg#', ...P.CAMPOS.map(c => c.n)], regs.map((r, i) => [desde + i, ...P.CAMPOS.map(c => r[c.n])]));
  P.pintarHistorial = function () {
    P.tabla(P.$('t-hist'), ['Ejec.', 'Clave', 'Campo', 'Algoritmo', 'Tiempo (ns)', 'Comparaciones', 'Mov./Intercambios'],
      P.historial.orden.map(e => [e.n, e.clave, e.campo, e.algoritmo, P.fmt(e.ns), P.fmt(e.cmp), P.fmt(e.mov)]));
    P.tabla(P.$('t-stats'), ['Método', 'Veces usado', '% de uso'], P.estadisticas());
    P.pintarGrafica();
    P.$('exp-orden').disabled = !P.historial.orden.length; P.$('exp-busq').disabled = !P.historial.busq.length;
    P.tabla(P.$('t-busq'), ['Ejec.', 'Campo', 'Método', 'Valor', 'Tiempo (ns)', 'Comparaciones', 'Coincidencias'],
      P.historial.busq.map(e => [e.n, e.campo, e.metodo, e.valor, P.fmt(e.ns), P.fmt(e.cmp), P.fmt(e.hallados)]));
  };
  P.pintarGrafica = function () {
    const est = P.estadisticas(), tot = est.reduce((s, e) => s + e[1], 0), g = P.$('grafica'); g.replaceChildren();
    if (!tot) {
      const m = document.createElement('p'); m.className = 'nota';
      m.textContent = 'La gráfica estará disponible después de la primera ejecución de ordenamiento.'; g.appendChild(m);
    } else est.forEach(([a, u, p]) => {
      const f = document.createElement('div'), l = document.createElement('span'), w = document.createElement('div'),
        b = document.createElement('i'), v = document.createElement('span');
      f.className = 'fila'; w.className = 'barra'; l.textContent = a; v.textContent = `${u} (${p})`;
      b.style.width = (tot ? u / tot * 100 : 0) + '%'; w.appendChild(b); f.append(l, w, v); g.appendChild(f);
    });
    const m = P.masUsado();
    P.msg('alfa', m ? `Método Alfa (más utilizado): ${m.nombres.join(' y ')} con ${m.n} uso(s)${m.nombres.length > 1 ? ' cada uno (empate)' : ''}. Este dato mide frecuencia de uso, no velocidad.`
      : 'Método Alfa: esperando ejecuciones. Ejecuta un ordenamiento para comenzar las estadísticas', 'ok');
  };
})(window.P21);
