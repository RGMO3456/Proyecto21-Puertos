/* Controlador principal: conecta la interfaz con los módulos de js/. */
(function (P) {
  const $ = P.$, rnd = n => Math.floor(Math.random() * n), nsDe = ms => Math.round(ms * 1e6);
  const E = { registros: [], orden: null, campo: null, metodo: null, ultima: null };

  function estados() { // única fuente de verdad para habilitar/deshabilitar controles
    const hay = E.registros.length > 0;
    $('btn-orden').disabled = !hay; $('btn-metodo').disabled = !E.orden;
    $('csv2').disabled = !hay; $('lbl-csv2').classList.toggle('off', !hay);
    $('form-busq').hidden = true; E.metodo = null; $('res-busq').replaceChildren(); $('t-hallados').replaceChildren();
    P.msg('info-metodo', E.orden ? 'Pulsa el botón para elegir el método de búsqueda.' : 'Primero ejecuta un ordenamiento.');
  }
  function vaciar() {
    E.registros = []; E.orden = E.campo = E.ultima = null;
    ['t-primeros', 't-ultimos', 't-ordenados'].forEach(i => $(i).replaceChildren());
    $('k-total').textContent = '0'; $('k-carga').textContent = $('k-orden').textContent = '—';
    P.msg('res-orden', 'Carga datos válidos para habilitar el ordenamiento.'); P.panorama(null);
  }

  async function leer(ev, agregar) {
    const f = ev.target.files[0]; ev.target.value = ''; if (!f) return;
    const t0 = performance.now(); procesar(await f.text(), agregar, t0);
  }
  function procesar(texto, agregar, t0 = performance.now()) {
    P.msg('estado-carga', 'Leyendo archivo…');
    const r = P.cargarCSV(texto);
    if (!r.registros) {
      const txt = `Archivo rechazado: ${P.fmt(r.total)} error(es). Primeros ${r.errores.length}:\n` + r.errores.join('\n');
      if (agregar) P.msg('estado-carga', txt + '\nSe conservan los datos cargados antes.', 'err');
      else { vaciar(); $('k-estado').textContent = 'Con errores'; P.msg('estado-carga', txt, 'err'); }
      return estados();
    }
    let regs = r.registros, extra = '';
    if (agregar) {
      const c = P.combinar(E.registros, r.registros); regs = c.registros;
      extra = ` Lote nuevo: ${P.fmt(r.registros.length)} leídos, ${P.fmt(c.agregados)} agregados y ${P.fmt(c.duplicados)} omitidos por duplicar registros ya cargados.`;
    }
    const ms = performance.now() - t0;                    // lectura + validación + conversión (+ combinación)
    E.registros = regs; E.orden = E.campo = E.ultima = null; const n = regs.length;
    $('k-total').textContent = P.fmt(n); $('k-estado').textContent = 'Cargado en RAM';
    $('k-carga').textContent = P.fmt(nsDe(ms)); $('k-orden').textContent = '—'; $('t-ordenados').replaceChildren();
    P.msg('estado-carga', `Carga correcta: ${P.fmt(n)} registros con 10 columnas en ${P.fmt(nsDe(ms))} ns (${ms.toFixed(3)} ms, conversión de performance.now()).${extra}`, 'ok');
    P.msg('res-orden', 'Datos listos. Ejecuta el ordenamiento aleatorio.');
    P.tablaRegistros($('t-primeros'), regs.slice(0, 30), 1);   // el dibujo queda fuera del cronómetro
    P.tablaRegistros($('t-ultimos'), n > 30 ? regs.slice(Math.max(30, n - 30)) : [], Math.max(31, n - 29));
    P.panorama(regs); P.contar($('k-total'), n);
    estados();
  }
  $('btn-demo').addEventListener('click', () => procesar(P.DATOS_CSV, false));
  $('csv').addEventListener('change', ev => leer(ev, false));
  $('csv2').addEventListener('change', ev => leer(ev, true));

  $('btn-orden').addEventListener('click', () => {
    const por = {}; Object.keys(P.CLAVES).forEach(c => por[c] = P.candidatos(c, E.registros));
    const total = Object.keys(por).reduce((s, c) => s + por[c].length, 0), ult = total > 1 ? E.ultima : null;
    const libres = c => por[c].filter(a => !(ult && ult.campo === c && ult.algoritmo === a));
    const campos = Object.keys(por).filter(c => libres(c).length);      // 1.º campo clave, 2.º algoritmo compatible
    const campo = campos[rnd(campos.length)], lista = libres(campo), alg = lista[rnd(lista.length)];
    E.ultima = { campo, algoritmo: alg };
    const r = P.ordenar(alg, E.registros, campo);          // trabaja sobre una copia; el original no se toca
    E.orden = r.orden; E.campo = campo; const k = P.CLAVES[campo].clave;
    P.msg('res-orden', `Se ordenaron ${P.fmt(E.orden.length)} registros por el campo ${campo} (clave ${k}) usando el método ${alg} en ${P.fmt(r.ns)} nanosegundos. Comparaciones: ${P.fmt(r.cmp)}. Intercambios/Movimientos: ${P.fmt(r.mov)}`, 'ok');
    P.registrarOrden({ clave: k, campo, algoritmo: alg, ns: r.ns, cmp: r.cmp, mov: r.mov });
    $('k-orden').textContent = campo; P.tablaRegistros($('t-ordenados'), E.orden.slice(0, 30), 1);
    estados(); P.pintarHistorial();
  });

  $('btn-metodo').addEventListener('click', () => {
    E.metodo = ['Búsqueda Lineal', 'Búsqueda Binaria'][rnd(2)];
    const sel = $('campo-busq'), bin = E.metodo === 'Búsqueda Binaria';
    sel.replaceChildren(...P.CAMPOS.map(c => new Option(c.n, c.n)));
    $('form-busq').hidden = false; $('res-busq').replaceChildren(); $('t-hallados').replaceChildren();
    if (bin) {
      sel.value = E.campo; sel.disabled = true;
      if (!P.estaOrdenado(E.orden, E.campo)) { P.msg('info-metodo', 'La estructura no está ordenada por el campo requerido: no se ejecutará la búsqueda binaria.', 'err'); $('btn-buscar').disabled = true; return; }
      P.msg('info-metodo', `Método seleccionado: ${E.metodo}. Campo ordenado verificado: ${E.campo}.`, 'ok');
    } else { sel.disabled = false; P.msg('info-metodo', `Método seleccionado: ${E.metodo}. Elige cualquiera de los 10 campos.`, 'ok'); }
    $('btn-buscar').disabled = false; P.sugerir(sel.value, E.orden);
  });
  $('campo-busq').addEventListener('change', e => P.sugerir(e.target.value, E.orden));

  $('btn-buscar').addEventListener('click', () => {
    const campo = $('campo-busq').value, bin = E.metodo === 'Búsqueda Binaria', txt = $('valor-busq').value;
    if (bin && (campo !== E.campo || !P.estaOrdenado(E.orden, campo))) return P.msg('res-busq', 'Búsqueda binaria bloqueada: los datos no están ordenados por ese campo.', 'err');
    const v = P.parseValor(campo, txt);
    if (v === null) return P.msg('res-busq', 'Escribe un valor válido (en campos numéricos, solo dígitos y punto decimal).', 'err');
    const r = (bin ? P.buscarBinaria : P.buscarLineal)(E.orden, campo, v);
    P.msg('res-busq', `Se realizó la búsqueda en ${P.fmt(E.orden.length)} registros por el campo ${campo} usando el método ${E.metodo} en ${P.fmt(r.ns)} nanosegundos. Comparaciones: ${P.fmt(r.cmp)}. Coincidencias: ${P.fmt(r.pos.length)}`, r.pos.length ? 'ok' : '');
    P.tabla($('t-hallados'), ['Fila', ...P.CAMPOS.map(c => c.n)], r.pos.slice(0, 100).map(i => [i + 1, ...P.CAMPOS.map(c => E.orden[i][c.n])]));
    P.registrarBusq({ campo, metodo: E.metodo, valor: txt.trim(), ns: r.ns, cmp: r.cmp, hallados: r.pos.length }); P.pintarHistorial();
  });

  $('exp-orden').addEventListener('click', P.exportarOrden);
  $('exp-busq').addEventListener('click', P.exportarBusq);
  estados(); P.pintarHistorial();
})(window.P21);
