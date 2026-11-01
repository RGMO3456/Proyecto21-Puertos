/* Algoritmos de ordenamiento. Cada uno recibe (arreglo, función-clave, contadores)
   y devuelve el arreglo ordenado. cmp = comparaciones entre claves; mov = escrituras
   de registros (o intercambios). Búsqueda de mínimo/máximo y accesos a la clave NO se cuentan. */
(function (P) {
  const swap = (a, i, j, c) => { if (i !== j) { const t = a[i]; a[i] = a[j]; a[j] = t; c.mov++; } };
  const rango = (a, k) => { let mn = Infinity, mx = -Infinity; for (const r of a) { const v = k(r); if (v < mn) mn = v; if (v > mx) mx = v; } return [mn, mx]; };

  function radix(a, k, c) { // LSD, base 256, estable; solo enteros >= 0. cmp = 0.
    let src = a, dst = new Array(a.length), mx = a.length ? rango(a, k)[1] : 0;
    for (let e = 1; Math.floor(mx / e) > 0; e *= 256) {
      const cnt = new Int32Array(257);
      for (const r of src) cnt[Math.floor(k(r) / e) % 256 + 1]++;
      for (let i = 0; i < 256; i++) cnt[i + 1] += cnt[i];
      for (const r of src) { dst[cnt[Math.floor(k(r) / e) % 256]++] = r; c.mov++; }
      [src, dst] = [dst, src];
    }
    return src;
  }
  function counting(a, k, c) { // estable; cmp = 0
    if (!a.length) return a;
    const [mn, mx] = rango(a, k), R = mx - mn + 1, cnt = new Int32Array(R + 1), out = new Array(a.length);
    for (const r of a) cnt[k(r) - mn + 1]++;
    for (let i = 0; i < R; i++) cnt[i + 1] += cnt[i];
    for (const r of a) { out[cnt[k(r) - mn]++] = r; c.mov++; }
    return out;
  }
  function bucket(a, k, c) { // n cubetas; orden interno por inserción
    const n = a.length; if (!n) return a;
    const [mn, mx] = rango(a, k), rg = mx - mn, B = Array.from({ length: n }, () => []);
    for (const r of a) { B[rg === 0 ? 0 : Math.min(n - 1, Math.floor((k(r) - mn) / rg * n))].push(r); c.mov++; }
    const out = [];
    for (const b of B) {
      for (let i = 1; i < b.length; i++) {
        const x = b[i], kx = k(x); let j = i - 1;
        while (j >= 0) { c.cmp++; if (k(b[j]) > kx) { b[j + 1] = b[j]; c.mov++; j--; } else break; }
        b[j + 1] = x; c.mov++;
      }
      for (const r of b) { out.push(r); c.mov++; }
    }
    return out;
  }
  function quick(a, k, c) { // pivote aleatorio, partición de 3 vías (soporta claves repetidas)
    const st = [[0, a.length - 1]];
    while (st.length) {
      let [lo, hi] = st.pop();
      while (lo < hi) {
        const p = k(a[lo + Math.floor(Math.random() * (hi - lo + 1))]);
        let lt = lo, i = lo, gt = hi;
        while (i <= gt) {
          const v = k(a[i]); c.cmp++;
          if (v < p) swap(a, lt++, i++, c);
          else { c.cmp++; if (v > p) swap(a, i, gt--, c); else i++; }
        }
        st.push([lo, lt - 1]); lo = gt + 1;
      }
    }
    return a;
  }
  function merge(a, k, c) { // ascendente (iterativo), con arreglo auxiliar
    const n = a.length; let src = a, dst = new Array(n);
    for (let w = 1; w < n; w *= 2) {
      for (let lo = 0; lo < n; lo += 2 * w) {
        const mid = Math.min(lo + w, n), hi = Math.min(lo + 2 * w, n); let i = lo, j = mid, x = lo;
        while (i < mid && j < hi) { c.cmp++; dst[x++] = k(src[j]) < k(src[i]) ? src[j++] : src[i++]; c.mov++; }
        while (i < mid) { dst[x++] = src[i++]; c.mov++; }
        while (j < hi) { dst[x++] = src[j++]; c.mov++; }
      }
      [src, dst] = [dst, src];
    }
    return src;
  }
  function heap(a, k, c) {
    const n = a.length;
    const sift = (i, m) => {
      for (;;) {
        const l = 2 * i + 1; let g = i;
        if (l < m) { c.cmp++; if (k(a[l]) > k(a[g])) g = l; }
        if (l + 1 < m) { c.cmp++; if (k(a[l + 1]) > k(a[g])) g = l + 1; }
        if (g === i) return;
        swap(a, i, g, c); i = g;
      }
    };
    for (let i = (n >> 1) - 1; i >= 0; i--) sift(i, n);
    for (let e = n - 1; e > 0; e--) { swap(a, 0, e, c); sift(0, e); }
    return a;
  }
  const ALG = { 'Radix Sort': radix, 'Counting Sort': counting, 'Bucket Sort': bucket, 'Quick Sort': quick, 'Merge Sort': merge, 'Heap Sort': heap };

  // Algoritmos válidos para el campo; Counting se descarta si el rango es demasiado grande.
  P.candidatos = function (campo, datos) {
    let l = P.CLAVES[campo].algos.slice();
    if (l.includes('Counting Sort')) {
      const [mn, mx] = rango(datos, r => r[campo]);
      if (mx - mn + 1 > P.LIMITE_COUNTING) l = l.filter(x => x !== 'Counting Sort');
    }
    return l;
  };
  // La copia del arreglo se hace ANTES de iniciar el cronómetro.
  P.ordenar = function (nombre, datos, campo) {
    const a = datos.slice(), c = { cmp: 0, mov: 0 }, k = r => r[campo];
    const t0 = performance.now(), orden = ALG[nombre](a, k, c), ms = performance.now() - t0;
    return { orden, cmp: c.cmp, mov: c.mov, ms, ns: Math.round(ms * 1e6) };
  };
  P.estaOrdenado = (a, campo) => { for (let i = 1; i < a.length; i++) if (a[i - 1][campo] > a[i][campo]) return false; return true; };
})(window.P21);
