/* Panorama visual de los datos y efectos (conteo animado, aparición al desplazar, progreso). */
(function (P) {
  const $ = P.$, NS = 'http://www.w3.org/2000/svg', PAL = ['#14b8b0', '#2f6fed', '#f5a524', '#e5484d', '#8e4ec6', '#30a46c'];
  const calma = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const sv = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const num = (v, d) => v.toLocaleString('es-MX', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  const fecha = n => { const s = String(n); return s.slice(6) + '/' + s.slice(4, 6) + '/' + s.slice(0, 4); };
  P.contar = (e, fin, d) => {
    if (calma) { e.textContent = num(fin, d); return; }
    const t0 = performance.now();
    (function f(t) { const p = Math.min(1, (t - t0) / 1100); e.textContent = num(fin * (1 - Math.pow(1 - p, 3)), d); if (p < 1) requestAnimationFrame(f); })(t0);
  };
  const agr = (rs, c, v) => {
    const m = new Map();
    for (const r of rs) { const a = m.get(r[c]) || [0, 0]; a[0]++; a[1] += v ? r[v] : 0; m.set(r[c], a); }
    return [...m].map(([k, a]) => ({ k, n: a[0], s: a[1] }));
  };
  function barras(id, it, fv) { // it: [{k, v, t}] ordenado de mayor a menor
    const c = $(id); c.replaceChildren(); it.sort((a, b) => b.v - a.v); const mx = it[0].v || 1;
    it.forEach((x, i) => {
      const f = el('div', 'fila'), w = el('div', 'barra'), b = el('i');
      f.title = x.t || x.k; b.style.background = PAL[i % PAL.length]; b.style.transitionDelay = i * 70 + 'ms';
      w.appendChild(b); f.append(el('span', null, x.k), w, el('span', null, fv(x.v))); c.appendChild(f);
      setTimeout(() => { b.style.width = x.v / mx * 100 + '%'; }, 60);
    });
  }
  function dona(id, it) {
    const c = $(id); c.replaceChildren(); it.sort((a, b) => b.n - a.n); const tot = it.reduce((s, x) => s + x.n, 0); let acc = 0;
    const s = sv('svg', { viewBox: '0 0 42 42', class: 'dona', role: 'img', 'aria-label': 'Gráfica de dona' }), lg = el('ul', 'leyenda');
    s.appendChild(sv('circle', { cx: 21, cy: 21, r: 15.9155, fill: 'none', stroke: '#e4ecf3', 'stroke-width': 6 }));
    it.forEach((x, i) => {
      const p = x.n / tot * 100, k = sv('circle', { cx: 21, cy: 21, r: 15.9155, fill: 'none', stroke: PAL[i % 6], 'stroke-width': 6, transform: 'rotate(-90 21 21)' }), t = sv('title', {});
      t.textContent = `${x.k}: ${num(x.n)}`; k.appendChild(t); k.style.strokeDasharray = '0 100'; k.style.strokeDashoffset = -acc; s.appendChild(k);
      setTimeout(() => { k.style.strokeDasharray = `${Math.max(0, p - 0.5)} ${100 - p + 0.5}`; }, 80 + i * 160); acc += p;
      const li = el('li'), sw = el('span', 'sw'); sw.style.background = PAL[i % 6];
      li.append(sw, el('span', null, `${x.k} · ${num(x.n)} (${num(p, 1)} %)`)); lg.appendChild(li);
    });
    const tx = sv('text', { x: 21, y: 22.5, 'text-anchor': 'middle', class: 'dtx' }); tx.textContent = num(tot); s.appendChild(tx);
    c.append(s, lg);
  }
  function linea(id, pts) {
    const W = 600, H = 220, L = 44, B = 26, T = 14, n = pts.length, mx = Math.max(...pts.map(p => p.v)) || 1;
    const X = i => L + i * (W - L - 10) / Math.max(1, n - 1), Y = v => T + (H - T - B) * (1 - v / mx);
    const s = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'linea', role: 'img', 'aria-label': 'Operaciones por mes' });
    for (let g = 0; g <= 4; g++) {
      const y = T + (H - T - B) * g / 4, tx = sv('text', { x: L - 6, y: y + 3, 'text-anchor': 'end' }); tx.textContent = num(Math.round(mx * (1 - g / 4)));
      s.append(sv('line', { x1: L, x2: W - 10, y1: y, y2: y, class: 'gr' }), tx);
    }
    const d = pts.map((p, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p.v).toFixed(1)).join('');
    s.append(sv('path', { d: `${d}L${X(n - 1)} ${H - B}L${X(0)} ${H - B}Z`, class: 'area' }), sv('path', { d, class: 'trazo', pathLength: 1 }));
    pts.forEach((p, i) => { const k = sv('circle', { cx: X(i), cy: Y(p.v), r: 3, class: 'pt' }), t = sv('title', {}); t.textContent = `${p.k}: ${num(p.v)}`; k.appendChild(t); s.appendChild(k); });
    [0, Math.floor((n - 1) / 2), n - 1].forEach(i => { const tx = sv('text', { x: X(i), y: H - 8, 'text-anchor': 'middle' }); tx.textContent = pts[i].k; s.appendChild(tx); });
    $(id).replaceChildren(s);
  }
  P.panorama = function (rs) {
    $('pan').hidden = !rs; $('pan-vacio').hidden = !!rs; if (!rs) return;
    const n = rs.length, kg = rs.reduce((s, r) => s + r.peso_bruto_kg, 0), usd = rs.reduce((s, r) => s + r.costo_maniobra_usd, 0);
    let f0 = Infinity, f1 = 0; for (const r of rs) { if (r.fecha_atracadero < f0) f0 = r.fecha_atracadero; if (r.fecha_atracadero > f1) f1 = r.fecha_atracadero; }
    const puertos = agr(rs, 'puerto_operacion'), edo = {}; rs.forEach(r => { edo[r.puerto_operacion] = r.estado; });
    const K = $('pan-kpis'); K.replaceChildren();
    [['Registros', n, 0, ''], ['Puertos', puertos.length, 0, ''], ['Peso bruto total (t)', kg / 1000, 0, ''], ['Costo total de maniobra', usd, 0, 'USD '], ['Costo promedio por contenedor', usd / n, 2, 'USD ']].forEach(([l, v, d, p]) => {
      const c = el('div', 'card pop'), b = el('b'); c.appendChild(el('span', null, l)); c.appendChild(b); K.appendChild(c);
      const t = el('em', null, p); b.append(t); const q = el('span', 'cn'); b.appendChild(q); P.contar(q, v, d);
    });
    const c = el('div', 'card pop'); c.append(el('span', null, 'Periodo de atraque'), el('b', 'peq', `${fecha(f0)} – ${fecha(f1)}`)); K.appendChild(c);
    barras('g-puerto', puertos.map(x => ({ k: x.k.replace('Puerto de ', ''), v: x.n, t: `${x.k} (${edo[x.k]})` })), num);
    barras('g-naviera', agr(rs, 'linea_naviera').map(x => ({ k: x.k.replace(' (Ocean Network Express)', ''), v: x.n, t: x.k })), num);
    dona('g-estatus', agr(rs, 'estatus_aduanal')); dona('g-carga', agr(rs, 'tipo_carga'));
    const mes = new Map();
    for (const r of rs) { const k = String(Math.floor(r.fecha_atracadero / 100)).replace(/(\d{4})(\d\d)/, '$1-$2'); mes.set(k, (mes.get(k) || 0) + 1); }
    linea('g-mes', [...mes].sort((a, b) => a[0] < b[0] ? -1 : 1).map(([k, v]) => ({ k, v })));
    barras('g-costo', agr(rs, 'tipo_carga', 'costo_maniobra_usd').map(x => ({ k: x.k, v: x.s / x.n })), v => num(v, 2));
  };
  P.sugerir = (campo, rs) => {
    const dl = $('sug'), c = P.CAMPOS.find(x => x.n === campo); dl.replaceChildren();
    if (!c || c.t !== 'str' || !rs || !rs.length) return;
    const u = [...new Set(rs.map(r => r[campo]))]; if (u.length > 60) return;
    u.sort().forEach(v => dl.appendChild(new Option(v)));
  };
  // Efectos: aparición al desplazar, barra de progreso y menú activo.
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.06 }) : null;
  document.querySelectorAll('section, .card, .panel').forEach(e => { e.classList.add('rv'); if (io) io.observe(e); else e.classList.add('in'); });
  const bar = $('prog'), links = [...document.querySelectorAll('.top nav a')], secs = links.map(a => $(a.hash.slice(1)));
  const alMover = () => {
    const h = document.documentElement; bar.style.width = scrollY / Math.max(1, h.scrollHeight - innerHeight) * 100 + '%'; let a = 0;
    secs.forEach((x, i) => { if (x && x.getBoundingClientRect().top < 140) a = i; }); links.forEach((l, i) => l.classList.toggle('act', i === a));
  };
  addEventListener('scroll', alMover, { passive: true }); alMover();
})(window.P21);
