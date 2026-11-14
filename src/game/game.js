var Sv = {};
br(Sv, { create: () => Cf, showcase: () => JR });
function yv(i) {
  let n = new Float32Array(4096),
    s = i >>> 0,
    o = () => {
      (s |= 0), (s = (s + 1831565813) | 0);
      let l = Math.imul(s ^ (s >>> 15), 1 | s);
      return (
        (l = (l + Math.imul(l ^ (l >>> 7), 61 | l)) ^ l), ((l ^ (l >>> 14)) >>> 0) / 4294967296
      );
    };
  for (let l = 0; l < 4096; l++) n[l] = o();
  let r = (l, c) => {
    let u = Math.floor(l),
      h = Math.floor(c),
      f = l - u,
      p = c - h;
    (f = f * f * (3 - 2 * f)), (p = p * p * (3 - 2 * p));
    let d = u & 63,
      v = (u + 1) & 63,
      g = (h & 63) * 64,
      x = ((h + 1) & 63) * 64,
      y = n[g + d],
      b = n[g + v],
      m = n[x + d],
      A = n[x + v];
    return y + (b - y) * f + (m - y + (y - b - m + A) * f) * p;
  };
  return {
    noise: r,
    fbm: (l, c, u = 4) => {
      let h = 0,
        f = 0.5,
        p = 0;
      for (let d = 0; d < u; d++)
        (h += r(l, c) * f), (p += f), (l = l * 2.03 + 17.1), (c = c * 2.03 + 9.7), (f *= 0.5);
      return h / p;
    },
    rnd: o,
  };
}
var To = (i, e, t) => {
    let n = (t - i) / (e - i);
    return (n = n < 0 ? 0 : n > 1 ? 1 : n), n * n * (3 - 2 * n);
  },
  Wc = 4,
  H1 = 2;
function Bb(i = 128) {
  let e = i * Wc,
    t = i * H1,
    n = new Uint8Array(e * t * 4),
    s = yv(9173),
    o = new Float32Array(i * i),
    r = new Float32Array(i * i),
    a = new Float32Array(i * i);
  for (let c = 0; c < Wc * H1; c++) {
    let u = c % Wc,
      h = Math.floor(c / Wc),
      f = c * 13.37 + 3.1,
      p = c * 7.77 + 1.3;
    for (let d = 0; d < i; d++)
      for (let v = 0; v < i; v++) {
        let g = ((v + 0.5) / i) * 2 - 1,
          x = ((d + 0.5) / i) * 2 - 1,
          y = 1 - To(0.78, 0.98, Math.max(Math.abs(g), Math.abs(x))),
          b,
          m,
          A;
        if (c === 6) {
          let M = x * 0.5 + 0.5,
            E = 0.16 + 0.5 * M * M,
            w = (s.fbm(g * 2 + f, M * 2 + p, 3) - 0.5) * 0.25,
            S = 1 - To(E * 0.3, E, Math.abs(g + w * M)),
            z = s.fbm(g * 9 + f, M * 2.2 + p, 4),
            H = 1 - To(0.55, 0.95, M - (s.noise(g * 6 + f, 3.3) - 0.5) * 0.35),
            O = To(0, 0.12, M);
          (b = S * H * O * To(0.22, 0.7, z + 0.25 * (1 - M))), (m = S * H), (A = b * 0.5);
        } else {
          let M = c === 7,
            E = M ? 0.3 : 0.6,
            w = (s.fbm(g * 1.4 + f, x * 1.4 + p, 3) - 0.5) * E,
            S = (s.fbm(g * 1.4 + p + 5.2, x * 1.4 + f + 1.7, 3) - 0.5) * E,
            z = g + w,
            H = x + S,
            O = Math.sqrt(z * z + H * H),
            q = (s.fbm(z * 2.2 + f, H * 2.2 + p, 3) - 0.5) * 0.6,
            U = 1 - To(0, M ? 0.84 : 0.8, O + q),
            T = s.fbm(z * 4.2 + f * 2, H * 4.2 + p * 2, 5),
            D = U * (M ? 0.8 + 0.7 * T : 0.25 + 1.5 * T);
          (b = To(M ? 0.02 : 0.06, M ? 0.7 : 0.95, D)),
            (m = U),
            (A = U * 0.55 + U * s.fbm(z * 3.1 + f * 3, H * 3.1 + p * 3, 3) * 0.9);
        }
        let _ = d * i + v;
        (r[_] = b * y), (a[_] = m), (o[_] = A * y);
      }
    for (let d = 0; d < i; d++)
      for (let v = 0; v < i; v++) {
        let g = Math.max(0, v - 2),
          x = Math.min(i - 1, v + 2),
          y = Math.max(0, d - 2),
          b = Math.min(i - 1, d + 2),
          m = ((o[d * i + x] - o[d * i + g]) * i) / 8,
          A = ((o[b * i + v] - o[y * i + v]) * i) / 8,
          _ = 0.55,
          M = -m * _,
          E = -A * _,
          w = 1 / Math.sqrt(M * M + E * E + 1);
        (M *= w), (E *= w);
        let S = ((h * i + d) * e + u * i + v) * 4,
          z = d * i + v;
        (n[S] = Math.round((M * 0.5 + 0.5) * 255)),
          (n[S + 1] = Math.round((E * 0.5 + 0.5) * 255)),
          (n[S + 2] = Math.min(255, a[z] * 255)),
          (n[S + 3] = Math.min(255, r[z] * 255));
      }
  }
  let l = new ui(n, e, t, _n, yi);
  return (
    (l.magFilter = Zt),
    (l.minFilter = Ln),
    (l.generateMipmaps = !0),
    (l.wrapS = l.wrapT = Bi),
    (l.colorSpace = hi),
    (l.needsUpdate = !0),
    l
  );
}
var Af = 4,
  bv = 2,
  oo = 0,
  _v = 1,
  n0 = 2,
  OR = 3,
  Mv = 4,
  V1 = 5,
  Gc = 6,
  W1 = 7;
function Ob(i = 128) {
  let e = i * Af,
    t = i * bv,
    n = new Uint8Array(e * t * 4),
    s = yv(4441),
    o = [0, 1].map(() => {
      let a = 7 + Math.floor(s.rnd() * 4),
        l = [];
      for (let c = 0; c < a; c++)
        l.push({
          a: (c / a + (s.rnd() - 0.5) * 0.12) * Math.PI * 2,
          l: 0.35 + s.rnd() * 0.6,
          w: 0.018 + s.rnd() * 0.05,
          g: 0.5 + s.rnd() * 0.5,
        });
      return l;
    });
  for (let a = 0; a < 8; a++) {
    let l = a % Af,
      c = Math.floor(a / Af);
    for (let u = 0; u < i; u++)
      for (let h = 0; h < i; h++) {
        let f = ((h + 0.5) / i) * 2 - 1,
          p = ((u + 0.5) / i) * 2 - 1,
          d = Math.sqrt(f * f + p * p),
          v = 1 - To(0.86, 0.99, Math.max(Math.abs(f), Math.abs(p))),
          g = 0;
        if (a === oo) {
          let b = Math.max(0, 1 - d);
          g = b * b * b * 0.75 + Math.exp(-d * d * 22) * 0.5;
        } else if (a === _v) {
          let b = Math.pow(Math.max(0, 1 - f * f), 1.5);
          g = Math.exp(-(p * p) / (0.42 * 0.42)) * b;
        } else if (a === n0 || a === OR) {
          let b = o[a - n0],
            m = Math.atan2(p, f);
          for (let A of b) {
            let _ = Math.abs(m - A.a) % (Math.PI * 2);
            _ > Math.PI && (_ = Math.PI * 2 - _);
            let M = Math.sin(Math.min(_, 1.5)) * d;
            _ < 1.5 &&
              (g +=
                A.g *
                Math.exp(-(M * M) / (A.w * A.w * (0.4 + d))) *
                Math.pow(Math.max(0, 1 - d / A.l), 1.4));
          }
          g =
            g * (0.7 + 0.6 * s.fbm(f * 5 + a * 9, p * 5, 3)) +
            Math.exp(-d * d * 70) * 1.2 +
            Math.max(0, 1 - d * 2.2) * 0.06;
        } else if (a === Mv) {
          let b = Math.atan2(p, f),
            m = 0.78 + (s.noise(Math.cos(b) * 2 + 5, Math.sin(b) * 2 + 5) - 0.5) * 0.04;
          g =
            Math.exp(-((d - m) * (d - m)) / (0.03 * 0.03)) *
              (0.6 + 0.4 * s.noise(Math.cos(b) * 5 + 9, Math.sin(b) * 5 + 9)) +
            0.05 * To(0.2, 0.78, d) * (1 - To(0.78, 0.8, d));
        } else if (a === V1) {
          let b = (s.fbm(f * 1.6 + 3.3, p * 1.6 + 8.1, 3) - 0.5) * 0.5,
            m = (s.fbm(f * 1.6 + 7.7, p * 1.6 + 2.2, 3) - 0.5) * 0.5,
            A = f + b,
            _ = p + m,
            M = Math.sqrt(A * A + _ * _),
            E = 1 - To(0, 0.84, M),
            w = s.fbm(A * 4 + 1.1, _ * 4 + 6.6, 5);
          g = To(0.04, 0.9, E * (0.3 + 1.4 * w)) * (0.45 + 0.75 * E);
        } else if (a === Gc) g = 1 - To(0.3, 0.62, d);
        else if (a === W1) {
          let b = f * 0.5 + 0.5,
            m = 0.22 + 0.3 * b,
            A = Math.exp(-(p * p) / (m * m)) * Math.pow(b, 1.8),
            _ = (f - 0.8) / 0.16;
          f > 0.8 && (A *= Math.max(0, 1 - _ * _)), (g = A * 1.15);
        }
        g *= v;
        let x = Math.max(0, Math.min(255, g * 255)),
          y = ((c * i + u) * e + l * i + h) * 4;
        (n[y] = n[y + 1] = n[y + 2] = x), (n[y + 3] = 255);
      }
  }
  let r = new ui(n, e, t, _n, yi);
  return (
    (r.magFilter = Zt),
    (r.minFilter = Ln),
    (r.generateMipmaps = !0),
    (r.wrapS = r.wrapT = Bi),
    (r.colorSpace = hi),
    (r.needsUpdate = !0),
    r
  );
}
var dl = 4,
  xv = 2,
  da = {
    bullet_metal: [0, 1],
    bullet_concrete: [2, 3],
    bullet_wood: [4],
    scorch: [5],
    soot: [6],
    bullet_glass: [7],
  };
function Hb(i = 256) {
  let e = i * dl,
    t = i * xv,
    n = document.createElement("canvas");
  (n.width = e), (n.height = t);
  let s = document.createElement("canvas");
  (s.width = e), (s.height = t);
  let o = document.createElement("canvas");
  (o.width = e), (o.height = t);
  let r = n.getContext("2d"),
    a = s.getContext("2d"),
    l = o.getContext("2d", { willReadFrequently: !0 });
  (l.fillStyle = "rgb(128,128,128)"), l.fillRect(0, 0, e, t);
  let c = (_, M) => {
      let E = l.createRadialGradient(0, 0, 0, 0, 0, M);
      for (let [w, S] of _) E.addColorStop(w, `rgb(${S},${S},${S})`);
      (l.fillStyle = E), l.beginPath(), l.arc(0, 0, M, 0, Math.PI * 2), l.fill();
    },
    h = yv(77123).rnd;
  (a.fillStyle = "rgb(0,235,0)"), a.fillRect(0, 0, e, t);
  let f = Math.PI * 2,
    p = (_, M, E, w = 22, S = 1) => {
      _.beginPath();
      for (let z = 0; z < w; z++) {
        let H = (z / w) * f,
          O = M * (1 + (h() - 0.5) * E),
          q = Math.cos(H) * O,
          U = Math.sin(H) * O * S;
        z ? _.lineTo(q, U) : _.moveTo(q, U);
      }
      _.closePath();
    },
    d = (_, M, E, w, S, z, H) => {
      _.beginPath();
      let O = E,
        q = M;
      _.moveTo(Math.cos(q) * O, Math.sin(q) * O);
      let U = 5 + Math.floor(h() * 4);
      for (let T = 1; T <= U; T++)
        (O = E + ((w - E) * T) / U),
          (q += (h() - 0.5) * S),
          _.lineTo(Math.cos(q) * O, Math.sin(q) * O);
      (_.strokeStyle = H),
        (_.lineWidth = z),
        (_.lineCap = "round"),
        (_.lineJoin = "round"),
        _.stroke();
    },
    v = (_, M) => {
      let E = ((_ % dl) + 0.5) * i,
        w = (Math.floor(_ / dl) + 0.5) * i,
        S = i / 2;
      for (let z of [r, a, l])
        z.save(), z.beginPath(), z.rect(E - S, w - S, i, i), z.clip(), z.translate(E, w);
      M(S), r.restore(), a.restore(), l.restore();
    },
    g = (_, M, E, w) => {
      let S = _.createRadialGradient(0, 0, M, 0, 0, E);
      for (let [z, H] of w) S.addColorStop(z, H);
      return S;
    };
  for (let _ of da.bullet_metal)
    v(_, (M) => {
      (r.fillStyle = g(r, M * 0.1, M * 0.6, [
        [0, "rgba(14,13,12,0.4)"],
        [0.5, "rgba(18,17,16,0.14)"],
        [1, "rgba(20,20,20,0)"],
      ])),
        r.fillRect(-M, -M, 2 * M, 2 * M);
      let E = 6 + Math.floor(h() * 5);
      for (let T = 0; T < E; T++) {
        let D = h() * f;
        d(r, D, M * 0.2, M * (0.38 + h() * 0.45), 0.3, 0.8 + h() * 1, "rgba(8,8,8,0.55)");
      }
      let w = M * (0.24 + h() * 0.08),
        S = 0.7 + h() * 0.5,
        z = h() * f,
        H = (T, D, C, G, j, N) => {
          for (let F of [r, a]) F.save(), F.translate(T, D), F.rotate(G);
          let Q = [];
          for (let F = 0; F < N; F++) Q.push(1 + (h() - 0.5) * j);
          let K = (F, X) => {
            F.beginPath();
            for (let ne = 0; ne < N; ne++) {
              let re = (ne / N) * f,
                $ = C * Q[ne] * X,
                ue = Math.cos(re) * $,
                me = Math.sin(re) * $ * S;
              ne ? F.lineTo(ue, me) : F.moveTo(ue, me);
            }
            F.closePath();
          };
          K(r, 1),
            (r.lineJoin = "miter"),
            (r.strokeStyle = "rgba(92,54,36,0.95)"),
            (r.lineWidth = Math.max(1.5, C * 0.14)),
            r.stroke();
          let ie = 150 + Math.floor(h() * 50);
          K(r, 1),
            (r.fillStyle = g(r, 0, C * 1.2, [
              [0, `rgb(${ie - 30},${ie - 26},${ie - 20})`],
              [0.7, `rgb(${ie + 30},${ie + 33},${ie + 36})`],
              [1, `rgb(${ie},${ie + 3},${ie + 6})`],
            ])),
            r.fill(),
            K(a, 1),
            (a.fillStyle = "rgb(0,85,255)"),
            a.fill(),
            r.restore(),
            a.restore();
        };
      H(0, 0, w, z, 0.75, 11);
      let O = 2 + Math.floor(h() * 4);
      for (let T = 0; T < O; T++) {
        let D = h() * f,
          C = w * (1 + h() * 0.7);
        H(Math.cos(D) * C, Math.sin(D) * C, w * (0.15 + h() * 0.3), h() * f, 0.8, 7);
      }
      for (let T = 0; T < 9; T++) {
        let D = h() * f,
          C = w * 0.3,
          G = w * (0.6 + h() * 0.3);
        r.beginPath(),
          r.moveTo(Math.cos(D) * C, Math.sin(D) * C),
          r.lineTo(Math.cos(D + 0.1) * G, Math.sin(D + 0.1) * G),
          (r.strokeStyle = h() < 0.5 ? "rgba(245,246,248,0.7)" : "rgba(70,72,76,0.5)"),
          (r.lineWidth = 0.8),
          r.stroke();
      }
      let q = M * (0.1 + h() * 0.025),
        U = 8 + Math.floor(h() * 5);
      for (let T = 0; T < U; T++) {
        if (h() < 0.15) continue;
        let D = ((T + (h() - 0.5) * 0.6) / U) * f,
          C = q * (1.25 + h() * 0.9),
          G = 0.16 + h() * 0.16,
          j = 205 + Math.floor(h() * 50);
        r.beginPath(),
          r.moveTo(Math.cos(D - G) * q * 0.9, Math.sin(D - G) * q * 0.9),
          r.lineTo(Math.cos(D) * C, Math.sin(D) * C),
          r.lineTo(Math.cos(D + G) * q * 0.9, Math.sin(D + G) * q * 0.9),
          r.closePath(),
          (r.fillStyle = `rgb(${j},${j},${Math.min(255, j + 4)})`),
          r.fill(),
          (r.strokeStyle = "rgba(40,40,42,0.6)"),
          (r.lineWidth = 0.7),
          r.stroke();
      }
      a.beginPath(),
        a.arc(0, 0, q * 1.8, 0, f),
        (a.fillStyle = "rgb(0,60,255)"),
        a.fill(),
        p(r, q, 0.3, 11),
        (r.fillStyle = g(r, 0, q, [
          [0, "#000000"],
          [0.8, "#040404"],
          [1, "#141414"],
        ])),
        r.fill(),
        c(
          [
            [0, 0],
            [0.26, 10],
            [0.36, 240],
            [0.5, 200],
            [0.62, 100],
            [1, 128],
          ],
          q * 3.4,
        ),
        p(a, q, 0.1, 11),
        (a.fillStyle = "rgb(0,250,0)"),
        a.fill();
    });
  for (let _ of da.bullet_concrete)
    v(_, (M) => {
      (r.fillStyle = g(r, M * 0.2, M * 0.9, [
        [0, "rgba(186,180,168,0.22)"],
        [0.6, "rgba(180,175,165,0.07)"],
        [1, "rgba(170,165,155,0)"],
      ])),
        r.fillRect(-M, -M, 2 * M, 2 * M);
      let E = 4 + Math.floor(h() * 4);
      for (let O = 0; O < E; O++) {
        let q = h() * f,
          U = M * (0.5 + h() * 0.42);
        d(r, q, M * 0.25, U, 0.35, 1.3 + h() * 1.3, "rgba(20,19,18,0.75)"),
          h() < 0.5 &&
            d(r, q + (h() - 0.5) * 0.6, U * 0.7, U * 1.05, 0.6, 0.9, "rgba(20,19,18,0.5)");
      }
      let w = M * (0.33 + h() * 0.09),
        S = 12,
        z = [];
      for (let O = 0; O < S; O++) z.push(1 + (h() - 0.5) * 0.6);
      let H = (O, q, U, T) => {
        O.beginPath();
        for (let D = 0; D < S; D++) {
          let C = (D / S) * f,
            G = w * z[D] * q;
          D
            ? O.lineTo(Math.cos(C) * G + U, Math.sin(C) * G + T)
            : O.moveTo(Math.cos(C) * G + U, Math.sin(C) * G + T);
        }
        O.closePath();
      };
      H(r, 1.05, 1.5, 1.5),
        (r.fillStyle = "rgba(22,21,20,0.8)"),
        r.fill(),
        H(r, 1, 0, 0),
        (r.fillStyle = g(r, w * 0.1, w * 1.1, [
          [0, "#35332f"],
          [0.4, "#6f6b63"],
          [0.8, "#8f8b82"],
          [1, "#9a968c"],
        ])),
        r.fill(),
        H(r, 0.97, -1, -1),
        (r.strokeStyle = "rgba(206,201,190,0.55)"),
        (r.lineWidth = 1.2),
        r.stroke();
      for (let O = 0; O < 6; O++) {
        let q = h() * f;
        d(r, q, w * 0.2, w * 0.9, 0.5, 1, "rgba(28,27,25,0.5)");
      }
      for (let O = 0; O < 60; O++) {
        let q = h() * f,
          U = Math.sqrt(h()) * w * 0.85;
        (r.fillStyle = h() < 0.55 ? "rgba(36,34,32,0.6)" : "rgba(196,191,180,0.6)"),
          r.beginPath(),
          r.arc(Math.cos(q) * U, Math.sin(q) * U, 0.7 + h() * 2, 0, f),
          r.fill();
      }
      p(r, w * 0.3, 0.45, 9),
        (r.fillStyle = g(r, 0, w * 0.33, [
          [0, "#060606"],
          [0.7, "#161514"],
          [1, "#2c2a27"],
        ])),
        r.fill(),
        c(
          [
            [0, 0],
            [0.24, 20],
            [0.3, 70],
            [0.8, 112],
            [0.88, 150],
            [1, 128],
          ],
          w * 1.15,
        );
      for (let O = 0; O < 22; O++) {
        let q = h() * f,
          U = w * (1.15 + h() * 1.3);
        (r.fillStyle = h() < 0.5 ? "rgba(190,185,175,0.45)" : "rgba(30,29,27,0.45)"),
          r.beginPath(),
          r.arc(Math.cos(q) * U, Math.sin(q) * U, 0.6 + h() * 1.6, 0, f),
          r.fill();
      }
    });
  for (let _ of da.bullet_wood)
    v(_, (M) => {
      p(r, M * 0.27, 0.7, 11, 1.45), (r.fillStyle = "rgba(206,182,140,0.85)"), r.fill();
      for (let E = 0; E < 46; E++) {
        let w = (h() - 0.5) * M * 0.62,
          S = M * (0.25 + h() * 0.6) * (1 - Math.abs(w) / (M * 0.4)),
          z = (h() - 0.5) * M * 0.2;
        r.beginPath(),
          r.moveTo(w, z - S),
          r.lineTo(w + (h() - 0.5) * 5, z + S),
          (r.strokeStyle = h() < 0.5 ? "rgba(236,216,172,0.85)" : "rgba(88,62,38,0.7)"),
          (r.lineWidth = 0.8 + h() * 2.2),
          r.stroke();
      }
      p(r, M * 0.1, 0.5, 9, 1.1),
        (r.fillStyle = g(r, 0, M * 0.12, [
          [0, "#050403"],
          [0.8, "#140f0a"],
          [1, "#3a2a1a"],
        ])),
        r.fill(),
        c(
          [
            [0, 0],
            [0.5, 30],
            [0.8, 140],
            [1, 128],
          ],
          M * 0.17,
        );
    });
  for (let _ of da.scorch)
    v(_, (M) => {
      (r.fillStyle = g(r, 0, M * 0.98, [
        [0, "rgba(6,5,5,0.92)"],
        [0.3, "rgba(10,9,8,0.85)"],
        [0.55, "rgba(22,18,15,0.5)"],
        [0.8, "rgba(30,24,20,0.16)"],
        [1, "rgba(30,24,20,0)"],
      ])),
        r.fillRect(-M, -M, 2 * M, 2 * M);
      for (let E = 0; E < 90; E++) {
        let w = h() * f,
          S = M * (0.1 + h() * 0.3),
          z = M * (0.5 + h() * 0.46);
        r.beginPath(),
          r.moveTo(Math.cos(w - 0.03) * S, Math.sin(w - 0.03) * S),
          r.lineTo(Math.cos(w) * z, Math.sin(w) * z),
          r.lineTo(Math.cos(w + 0.03) * S, Math.sin(w + 0.03) * S),
          r.closePath(),
          (r.fillStyle = `rgba(8,7,6,${0.12 + h() * 0.3})`),
          r.fill();
      }
      for (let E = 0; E < 60; E++) {
        let w = h() * f,
          S = M * (0.15 + h() * 0.6);
        (r.fillStyle = h() < 0.3 ? "rgba(150,140,128,0.25)" : "rgba(0,0,0,0.4)"),
          r.beginPath(),
          r.arc(Math.cos(w) * S, Math.sin(w) * S, 1 + h() * 4, 0, f),
          r.fill();
      }
    });
  for (let _ of da.soot)
    v(_, (M) => {
      for (let E = 0; E < 14; E++) {
        let w = h() * f,
          S = h() * M * 0.3,
          z = M * (0.15 + h() * 0.3),
          H = Math.cos(w) * S,
          O = Math.sin(w) * S,
          q = r.createRadialGradient(H, O, 0, H, O, z);
        q.addColorStop(0, "rgba(8,8,8,0.4)"),
          q.addColorStop(1, "rgba(8,8,8,0)"),
          (r.fillStyle = q),
          r.fillRect(-M, -M, 2 * M, 2 * M);
      }
      p(r, M * 0.1, 0.4, 12), (r.fillStyle = "rgba(0,0,0,0.9)"), r.fill();
    });
  for (let _ of da.bullet_glass)
    v(_, (M) => {
      (r.fillStyle = g(r, 0, M * 0.5, [
        [0, "rgba(235,240,242,0.55)"],
        [1, "rgba(235,240,242,0)"],
      ])),
        r.fillRect(-M, -M, 2 * M, 2 * M);
      for (let E = 0; E < 13; E++) {
        let w = ((E + h() * 0.6) / 13) * f;
        d(r, w, M * 0.07, M * (0.5 + h() * 0.45), 0.12, 0.9 + h(), "rgba(240,246,248,0.85)");
      }
      for (let E = 0; E < 3; E++) {
        let w = M * (0.2 + E * 0.17 + h() * 0.05);
        for (let S = 0; S < 9; S++) {
          if (h() < 0.45) continue;
          let z = (S / 9) * f;
          r.beginPath(),
            r.arc(0, 0, w, z, z + 0.5),
            (r.strokeStyle = "rgba(240,246,248,0.6)"),
            (r.lineWidth = 1),
            r.stroke();
        }
      }
      p(r, M * 0.07, 0.3, 10), (r.fillStyle = "#060606"), r.fill();
    });
  let x = new xs(n);
  (x.colorSpace = Vn), (x.anisotropy = 4);
  let y = new xs(s);
  y.colorSpace = hi;
  let b = 2 / i,
    m = (_) => {
      let M = _ % dl,
        E = Math.floor(_ / dl);
      return [(M + b) / dl, 1 - (E + 1 - b) / xv, (M + 1 - b) / dl, 1 - (E + b) / xv];
    },
    A = null;
  try {
    let _ = l.getImageData(0, 0, e, t),
      M = _.data;
    if (M && M.length === e * t * 4) {
      let E = l.createImageData(e, t),
        w = E.data,
        S = 5 / 255;
      for (let z = 0; z < t; z++) {
        let H = Math.max(0, z - 1) * e,
          O = Math.min(t - 1, z + 1) * e;
        for (let q = 0; q < e; q++) {
          let U = Math.max(0, q - 1),
            T = Math.min(e - 1, q + 1),
            D = (M[(z * e + T) * 4] - M[(z * e + U) * 4]) * S,
            C = (M[(O + q) * 4] - M[(H + q) * 4]) * S,
            G = 1 / Math.sqrt(D * D + C * C + 1),
            j = (z * e + q) * 4;
          (w[j] = (-D * G * 0.5 + 0.5) * 255),
            (w[j + 1] = (C * G * 0.5 + 0.5) * 255),
            (w[j + 2] = (G * 0.5 + 0.5) * 255),
            (w[j + 3] = 255);
        }
      }
      l.putImageData(E, 0, 0), (A = new xs(o)), (A.colorSpace = hi);
    }
  } catch {
    A = null;
  }
  return { map: x, orm: y, nrm: A, uv: m };
}
var HR = `
attribute vec4 aPos;    // xyz centre, w size (m)
attribute vec4 aAxis;   // mode 1: stretch axis (length = streak length); mode 2: plane normal; w = roll (rad)
attribute vec4 aCol;    // rgb (HDR), a
attribute vec4 aMisc;   // x atlas frame, y mode (0 billboard, 1 velocity-stretched, 2 surface-aligned), z age 0..1, w sun visibility
uniform vec2 uAtlas;
uniform float uPx;      // world size of one pixel at distance 1
varying vec2 vUv;
varying vec4 vCol;
varying vec3 vOff;
varying vec3 vToCam;
varying vec3 vInfo;     // view z, age, shade
varying float vSoftD;
varying vec3 vT;
varying vec3 vB;
void main() {
vec2 c = position.xy;
vec3 center = aPos.xyz; float size = aPos.w; float mode = aMisc.y;
vec3 camR = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
vec3 camU = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
vec3 toCam = cameraPosition - center; float dist = length(toCam); toCam /= max(dist, 1e-4);
float sn = sin(aAxis.w), cs = cos(aAxis.w);
vec2 rc = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs);
vec3 off; float comp = 1.0;
if (mode < 0.5) {
  off = (camR * rc.x + camU * rc.y) * size;
  vT = camR * cs + camU * sn; vB = camU * cs - camR * sn;
} else if (mode < 1.5) {
  float len = length(aAxis.xyz); vec3 d = aAxis.xyz / max(len, 1e-5);
  vec3 side = cross(d, toCam); float sl = length(side); side = sl > 1e-3 ? side / sl : camR;
  float w = max(size, dist * uPx * 1.4); comp = size / w;
  if (aMisc.w > 1.5) w = min(w, dist * uPx * aMisc.w);       // additive only: cap on-screen width (tracers near the lens)
  off = d * (c.x * max(len, w)) + side * (c.y * w);
  vT = d; vB = side;
} else {
  vec3 n = normalize(aAxis.xyz);
  vec3 t = normalize(abs(n.y) > 0.9 ? cross(n, vec3(1.0, 0.0, 0.0)) : cross(vec3(0.0, 1.0, 0.0), n));
  vec3 b = cross(n, t);
  off = (t * rc.x + b * rc.y) * size;
  vT = t * cs + b * sn; vB = b * cs - t * sn;
}
vec4 mv = viewMatrix * vec4(center + off, 1.0);
gl_Position = projectionMatrix * mv;
float f = floor(aMisc.x + 0.5);
float col = mod(f, uAtlas.x), row = floor(f / uAtlas.x);
vUv = (vec2(col, row) + c + 0.5) / uAtlas;
vCol = vec4(aCol.rgb * comp, aCol.a);
vOff = off / max(size, 1e-4);
vToCam = toCam;
vInfo = vec3(mv.z, aMisc.z, aMisc.w);
vSoftD = clamp(size * 0.4, 0.04, 0.7);
}`,
  Xb = `
uniform sampler2D uTex;
uniform sampler2D uDepth;
uniform vec2 uRes;
uniform vec2 uNearFar;
uniform float uSoft;
varying vec2 vUv;
varying vec4 vCol;
varying vec3 vOff;
varying vec3 vToCam;
varying vec3 vInfo;
varying float vSoftD;
varying vec3 vT;
varying vec3 vB;
float softFade() {
float s = 1.0;
if (uSoft > 0.5) {
  float d = texture2D(uDepth, gl_FragCoord.xy / uRes).x;
  float zs = (uNearFar.x * uNearFar.y) / ((uNearFar.y - uNearFar.x) * d - uNearFar.y);
  s = clamp((vInfo.x - zs) / vSoftD, 0.0, 1.0);
}
return s;
}`,
  VR =
    Xb +
    `
uniform vec3 uSun, uSunDir, uAmbLo, uAmbHi;
void main() {
vec4 t = texture2D(uTex, vUv);
float er = vInfo.y * 0.45;                                  // wisps erode as the puff ages
float a = smoothstep(er, er + (vInfo.z > 1.5 ? 0.38 : 0.6), t.a) * vCol.a;   // fire lobes: denser body, crisper edge
a *= softFade() * smoothstep(0.2, 0.9, -vInfo.x);           // soft intersection + fade right at the lens
if (a < 0.004) discard;
vec3 V = normalize(vToCam);
vec3 q = vOff * 2.0; float r2 = min(dot(q, q), 1.0);
vec3 Ns = q + V * (sqrt(1.0 - r2) * 0.9 + 0.05);            // overall sphere normal
vec2 tn = t.rg * 2.0 - 1.0;                                 // billow normal from the flipbook
vec3 Nb = vT * tn.x + vB * tn.y + V * sqrt(max(1.0 - dot(tn, tn), 0.0));
vec3 N = normalize(Ns * 0.55 + Nb);
float wrap = clamp((dot(N, uSunDir) + 0.45) / 1.45, 0.0, 1.0);
float back = pow(clamp(dot(-V, uSunDir), 0.0, 1.0), 5.0);   // looking into the sun: forward scatter through thin edges
float thin = 1.0 - t.b * smoothstep(0.0, 0.5, a);
float hot = step(1.5, vInfo.z), shade = vInfo.z - 2.0 * hot;      // aMisc.w >= 2: emissive fire lobe (colour = emission)
vec3 sun = uSun * (wrap * wrap * 0.85 + back * (0.15 + 1.3 * thin)) * shade;
vec3 amb = mix(uAmbLo, uAmbHi, N.y * 0.5 + 0.5) * (1.0 - 0.35 * t.b);
vec3 col = vCol.rgb * (amb + sun);
if (hot > 0.5) {
  // alpha-blended fire: hot dense cores, dim orange skin, soot underneath. Because it is NOT additive, overlapping lobes
  // keep their shape and smoke in front can occlude them.
  float lump = clamp(dot(tn, vec2(0.6, 0.8)) * 0.6 + 0.5, 0.0, 1.0);
  float core = t.b * t.b * smoothstep(0.15, 0.9, t.a);
  vec3 fire = vCol.rgb * (0.10 + 1.7 * core) * (0.45 + 1.1 * lump);
  col = vec3(0.045, 0.042, 0.04) * (amb + sun) + fire;
}
gl_FragColor = vec4(col, a);
#include <tonemapping_fragment>
#include <colorspace_fragment>
gl_FragColor.rgb *= gl_FragColor.a;                         // premultiply after the (possibly no-op) output transform
}`,
  WR =
    Xb +
    `
void main() {
float t = texture2D(uTex, vUv).r;
float k = t * vCol.a * softFade();
if (k < 0.002) discard;
gl_FragColor = vec4(vCol.rgb * k, 1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
  Vb = new Ae();
function Ev(
  i,
  e,
  { lit: t, tex: n, cols: s, rows: o, renderOrder: r, sun: a, sunDir: l, ambLo: c, ambHi: u },
) {
  let h = new ea();
  h.setAttribute(
    "position",
    new et(new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]), 3),
  ),
    h.setIndex([0, 1, 2, 0, 2, 3]);
  let f = (S) => {
      let z = new zs(new Float32Array(e * 4), 4);
      return z.setUsage(bo), h.setAttribute(S, z), z;
    },
    p = f("aPos"),
    d = f("aAxis"),
    v = f("aCol"),
    g = f("aMisc");
  h.instanceCount = 0;
  let x = {
    uTex: { value: n },
    uAtlas: { value: new Ae(s, o) },
    uPx: { value: 0.001 },
    uDepth: { value: null },
    uRes: { value: new Ae(1, 1) },
    uNearFar: { value: new Ae(0.08, 900) },
    uSoft: { value: 0 },
  };
  t &&
    Object.assign(x, {
      uSun: { value: a },
      uSunDir: { value: l },
      uAmbLo: { value: c },
      uAmbHi: { value: u },
    });
  let y = new zn({
    uniforms: x,
    vertexShader: HR,
    fragmentShader: t ? VR : WR,
    transparent: !0,
    depthWrite: !1,
    depthTest: !0,
    side: Sn,
    fog: !1,
    blending: Sh,
    blendEquation: nr,
    blendSrc: G0,
    blendDst: t ? w0 : G0,
    blendSrcAlpha: Th,
    blendDstAlpha: G0,
  });
  y.name = t ? "fx_lit" : "fx_add";
  let b = new Qe(h, y);
  (b.frustumCulled = !1),
    (b.renderOrder = r),
    (b.castShadow = !1),
    (b.receiveShadow = !1),
    (b.matrixAutoUpdate = !1),
    (b.name = y.name),
    (b.onBeforeRender = (S, z, H) => {
      let O = S.getRenderTarget(),
        q;
      O ? (q = O.height) : (S.getDrawingBufferSize(Vb), (q = Vb.y));
      let U = H.projectionMatrix.elements;
      x.uPx.value = 2 / (Math.max(U[5], 0.001) * Math.max(q, 1));
      let T = i.render,
        D = T && T.depthTexture;
      D && D.image && H === i.camera && T.depthTextureIsLive !== !0 && i.params.fxsoft !== "0"
        ? ((x.uDepth.value = D),
          (x.uSoft.value = 1),
          T.resolution && T.resolution.x > 0
            ? x.uRes.value.set(T.resolution.x, T.resolution.y)
            : x.uRes.value.set(D.image.width || 1, D.image.height || 1),
          x.uNearFar.value.set(H.near, H.far))
        : ((x.uDepth.value = null), (x.uSoft.value = 0));
    });
  let m = p.array,
    A = d.array,
    _ = v.array,
    M = g.array,
    E = {
      mesh: b,
      cap: e,
      n: 0,
      P: m,
      A,
      C: _,
      M,
      begin() {
        E.n = 0;
      },
      push(S, z, H, O, q, U, T, D, C, G, j, N, Q, K, ie, F) {
        let X = E.n;
        if (X >= e) return !1;
        let ne = X * 4;
        return (
          (m[ne] = S),
          (m[ne + 1] = z),
          (m[ne + 2] = H),
          (m[ne + 3] = O),
          (A[ne] = q),
          (A[ne + 1] = U),
          (A[ne + 2] = T),
          (A[ne + 3] = D),
          (_[ne] = C),
          (_[ne + 1] = G),
          (_[ne + 2] = j),
          (_[ne + 3] = N),
          (M[ne] = Q),
          (M[ne + 1] = K),
          (M[ne + 2] = ie),
          (M[ne + 3] = F),
          (E.n = X + 1),
          !0
        );
      },
      end: null,
    },
    w = [p, d, v, g];
  return (
    (E.end = () => {
      let S = E.n;
      if (((h.instanceCount = S), (b.visible = S > 0), !!S))
        for (let z = 0; z < 4; z++) {
          let H = w[z];
          H.clearUpdateRanges(), H.addUpdateRange(0, S * 4), (H.needsUpdate = !0);
        }
    }),
    E
  );
}
var qc = 1,
  Xc = 2,
  GR = 4,
  Rf = class {
    constructor(e, t) {
      (this.cap = e), (this.sorted = t), (this.n = 0), (this.freeTop = e);
      let n = () => new Float32Array(e);
      (this.px = n()),
        (this.py = n()),
        (this.pz = n()),
        (this.vx = n()),
        (this.vy = n()),
        (this.vz = n()),
        (this.age = n()),
        (this.life = n()),
        (this.s0 = n()),
        (this.s1 = n()),
        (this.sk = n()),
        (this.rot = n()),
        (this.rotv = n()),
        (this.r = n()),
        (this.g = n()),
        (this.b = n()),
        (this.a = n()),
        (this.drag = n()),
        (this.grav = n()),
        (this.wind = n()),
        (this.turb = n()),
        (this.seed = n()),
        (this.fin = n()),
        (this.fout = n()),
        (this.stretch = n()),
        (this.shade = n()),
        (this.key = n()),
        (this.gy = n()),
        (this.frame = new Uint8Array(e)),
        (this.mode = new Uint8Array(e)),
        (this.flags = new Uint8Array(e)),
        (this.ramp = new Uint8Array(e)),
        (this.order = new Uint16Array(e)),
        (this.free = new Uint16Array(e));
      for (let s = 0; s < e; s++) this.free[s] = e - 1 - s;
    }
    clear() {
      (this.n = 0), (this.freeTop = this.cap);
      for (let e = 0; e < this.cap; e++) this.free[e] = this.cap - 1 - e;
    }
    emit(e, t, n, s, o, r, a, l, c) {
      if (this.freeTop === 0) return -1;
      let u = this.free[--this.freeTop];
      return (
        (this.order[this.n++] = u),
        (this.px[u] = e),
        (this.py[u] = t),
        (this.pz[u] = n),
        (this.vx[u] = s),
        (this.vy[u] = o),
        (this.vz[u] = r),
        (this.age[u] = -1),
        (this.life[u] = a),
        (this.s0[u] = l),
        (this.s1[u] = c),
        (this.sk[u] = 2),
        (this.rot[u] = 0),
        (this.rotv[u] = 0),
        (this.r[u] = 1),
        (this.g[u] = 1),
        (this.b[u] = 1),
        (this.a[u] = 1),
        (this.drag[u] = 0),
        (this.grav[u] = 0),
        (this.wind[u] = 0),
        (this.turb[u] = 0),
        (this.seed[u] = Math.random() * 100),
        (this.fin[u] = 0),
        (this.fout[u] = 0.5),
        (this.stretch[u] = 0.02),
        (this.shade[u] = 1),
        (this.key[u] = 0),
        (this.gy[u] = 0),
        (this.frame[u] = 0),
        (this.mode[u] = 0),
        (this.flags[u] = 0),
        (this.ramp[u] = 0),
        u
      );
    }
    update(e, t, n, s, o) {
      let {
          px: r,
          py: a,
          pz: l,
          vx: c,
          vy: u,
          vz: h,
          age: f,
          life: p,
          order: d,
          flags: v,
        } = this,
        g = n.x,
        x = n.y,
        y = n.z,
        b = 0,
        m = this.n;
      for (let A = 0; A < m; A++) {
        let _ = d[A];
        if (f[_] < 0) f[_] = 0;
        else {
          if (((f[_] += e), f[_] >= p[_])) {
            this.free[this.freeTop++] = _;
            continue;
          }
          let M = 1 - Math.exp(-this.drag[_] * e),
            E = this.wind[_];
          (c[_] += (s.x * E - c[_]) * M),
            (u[_] += (s.y * E - u[_]) * M),
            (h[_] += (s.z * E - h[_]) * M),
            (u[_] -= this.grav[_] * e);
          let w = this.turb[_];
          if (w > 0) {
            let H = this.seed[_];
            (c[_] += Math.sin(a[_] * 2.3 + H + o * 1.7) * w * e),
              (h[_] += Math.cos(r[_] * 1.9 + H * 1.3 + o * 1.3) * w * e),
              (u[_] += Math.sin(l[_] * 2.1 + H * 0.7 + o * 2.1) * w * 0.4 * e);
          }
          (r[_] += c[_] * e),
            (a[_] += u[_] * e),
            (l[_] += h[_] * e),
            (this.rot[_] += this.rotv[_] * e);
          let S = v[_],
            z = this.gy[_] + 0.012;
          if (S && a[_] < z) {
            if (S & Xc) {
              this.free[this.freeTop++] = _;
              continue;
            }
            S & qc
              ? ((a[_] = z),
                u[_] < 0 &&
                  ((u[_] = -u[_] * (0.25 + (this.seed[_] % 1) * 0.3)),
                  (c[_] *= 0.65),
                  (h[_] *= 0.65)))
              : S & GR && ((a[_] = z), (c[_] = u[_] = h[_] = 0));
          }
        }
        if (this.sorted) {
          let M = r[_] - g,
            E = a[_] - x,
            w = l[_] - y;
          this.key[_] = M * M + E * E + w * w;
        }
        d[b++] = _;
      }
      if (((this.n = b), this.sorted && b > 1)) {
        let A = this.key;
        for (let _ = 1; _ < b; _++) {
          let M = d[_],
            E = A[M],
            w = _ - 1;
          for (; w >= 0 && A[d[w]] < E; ) (d[w + 1] = d[w]), w--;
          d[w + 1] = M;
        }
      }
      for (let A = 0; A < b; A++) {
        let _ = d[A],
          M = f[_] / p[_],
          E = 1 - M,
          w = 1 - Math.pow(E, this.sk[_]),
          S = this.s0[_] + (this.s1[_] - this.s0[_]) * w,
          z = this.a[_],
          H = this.fin[_],
          O = this.fout[_];
        if ((H > 0 && M < H && (z *= M / H), M > O)) {
          let Q = 1 - (M - O) / (1 - O);
          z *= Q * Q * (3 - 2 * Q);
        }
        let q = this.r[_],
          U = this.g[_],
          T = this.b[_],
          D = this.ramp[_];
        if (D === 1) (q *= Math.pow(E, 0.5)), (U *= Math.pow(E, 1.4)), (T *= Math.pow(E, 3));
        else if (D === 2) {
          let Q = 1 - Math.pow(M, 1.6),
            K = Q * Math.sqrt(Q);
          (q *= K),
            (U *= (0.22 + 0.78 * Math.pow(Q, 1.3)) * K),
            (T *= (0.04 + 0.96 * Math.pow(Q, 3.5)) * K);
        } else if (D === 3) {
          let Q = 0.55 + 0.45 * Math.sin(o * 17 + this.seed[_] * 9);
          (q *= Q), (U *= Q * (0.6 + 0.4 * E)), (T *= Q * E);
        }
        let C = this.mode[_],
          G = 0,
          j = 1,
          N = 0;
        if (C === 1) {
          let Q = this.stretch[_];
          (G = c[_] * Q), (j = u[_] * Q), (N = h[_] * Q);
        }
        if (
          !t.push(
            r[_],
            a[_],
            l[_],
            S,
            G,
            j,
            N,
            this.rot[_],
            q,
            U,
            T,
            z,
            this.frame[_],
            C,
            M,
            this.shade[_],
          )
        )
          break;
      }
    }
  },
  q1 = class {
    constructor(e = 48) {
      (this.cap = e), (this.n = 0);
      let t = () => new Float32Array(e);
      (this.fx = t()),
        (this.fy = t()),
        (this.fz = t()),
        (this.dx = t()),
        (this.dy = t()),
        (this.dz = t()),
        (this.dist = t()),
        (this.speed = t()),
        (this.trav = t()),
        (this.len = t()),
        (this.width = t()),
        (this.r = t()),
        (this.g = t()),
        (this.b = t()),
        (this.frames = new Uint8Array(e));
    }
    clear() {
      this.n = 0;
    }
    add(e, t, n, s, o, r, a) {
      let l = this.n;
      l >= this.cap ? (l = 0) : this.n++;
      let c = t.x - e.x,
        u = t.y - e.y,
        h = t.z - e.z,
        f = Math.sqrt(c * c + u * u + h * h);
      if (f < 0.001) {
        l === this.n - 1 && this.n--;
        return;
      }
      (this.fx[l] = e.x),
        (this.fy[l] = e.y),
        (this.fz[l] = e.z),
        (this.dx[l] = c / f),
        (this.dy[l] = u / f),
        (this.dz[l] = h / f),
        (this.dist[l] = f),
        (this.speed[l] = r),
        (this.trav[l] = 0),
        (this.len[l] = Math.min(Math.max(r * 0.022, 2), 7)),
        (this.width[l] = a),
        (this.r[l] = n),
        (this.g[l] = s),
        (this.b[l] = o),
        (this.frames[l] = 0);
    }
    update(e, t, n, s) {
      let o = this.n;
      for (let r = 0; r < o; r++) {
        let a = this.speed[r],
          l = this.dist[r],
          c = this.len[r];
        this.frames[r] === 0
          ? (this.trav[r] = Math.min(l, a * Math.max(e, 0.008) * (0.35 + Math.random() * 0.4)))
          : (this.trav[r] += a * e);
        let u = Math.min(this.trav[r], l),
          h = Math.max(0, this.trav[r] - c);
        if (h >= l) {
          if (this.frames[r] >= 2) {
            if ((o--, r !== o)) {
              for (let E of qR) this[E][r] = this[E][o];
              this.frames[r] = this.frames[o];
            }
            r--;
            continue;
          }
          (h = Math.max(0, l - c * 0.5)), (u = l);
        }
        this.frames[r] = Math.min(250, this.frames[r] + 1);
        let f = (u + h) * 0.5,
          p = Math.max(u - h, 0.05),
          d = this.dx[r],
          v = this.dy[r],
          g = this.dz[r],
          x = this.width[r],
          y = this.fx[r] + d * f,
          b = this.fy[r] + v * f,
          m = this.fz[r] + g * f,
          A = this.r[r],
          _ = this.g[r],
          M = this.b[r];
        t.push(y, b, m, x, d * p, v * p, g * p, 0, A, _, M, 1, n, 1, 0, 5),
          t.push(
            y,
            b,
            m,
            x * 6,
            d * p * 1.05,
            v * p * 1.05,
            g * p * 1.05,
            0,
            A * 0.04,
            _ * 0.032,
            M * 0.028,
            1,
            n,
            1,
            0,
            28,
          ),
          t.push(
            this.fx[r] + d * u,
            this.fy[r] + v * u,
            this.fz[r] + g * u,
            x * 5,
            0,
            1,
            0,
            0,
            A * 0.2,
            _ * 0.16,
            M * 0.12,
            1,
            s,
            0,
            0,
            1,
          );
      }
      this.n = o;
    }
  },
  qR = [
    "fx",
    "fy",
    "fz",
    "dx",
    "dy",
    "dz",
    "dist",
    "speed",
    "trav",
    "len",
    "width",
    "r",
    "g",
    "b",
  ],
  ws = new Ye(),
  Oo = new Lt(),
  X1 = new W(),
  Y1 = new W(),
  Wb = new W();
function XR() {
  let i = new un(1, 1, 1, 2, 1, 2),
    e = i.attributes.position,
    t = 1234.5,
    n = () => ((t = Math.sin(t * 12.9898 + 78.233) * 43758.5453), (t -= Math.floor(t)), t),
    s = new Map();
  for (let o = 0; o < e.count; o++) {
    let r = e.getX(o).toFixed(3) + "," + e.getY(o).toFixed(3) + "," + e.getZ(o).toFixed(3),
      a = s.get(r);
    if (!a) {
      let l = e.getX(o),
        c = e.getY(o),
        u = e.getZ(o),
        f = Math.abs(l) > 0.49 && Math.abs(u) > 0.49 ? 0.72 + n() * 0.2 : 1;
      (l = l * f + (n() - 0.5) * 0.14),
        (u = u * f + (n() - 0.5) * 0.14),
        (c = c * (0.8 + n() * 0.3) + (n() - 0.5) * 0.1),
        (a = [l, c, u]),
        s.set(r, a);
    }
    e.setXYZ(o, a[0], a[1], a[2]);
  }
  return (i = i.toNonIndexed()), i.computeVertexNormals(), i;
}
var $1 = class {
    constructor(e, t = 256) {
      (this.G = e), (this.cap = t), (this.next = 0), (this.live = 0);
      let n = new Qt({ color: 16777215, roughness: 0.82, metalness: 0.05 });
      n.name = "fx_debris";
      let s = (this.mesh = new Sr(XR(), n, t));
      s.instanceMatrix.setUsage(bo),
        (s.instanceColor = new zs(new Float32Array(t * 3).fill(1), 3)),
        (s.frustumCulled = !1),
        (s.castShadow = !1),
        (s.receiveShadow = !0),
        (s.name = "fx_debris");
      let o = () => new Float32Array(t);
      (this.px = o()),
        (this.py = o()),
        (this.pz = o()),
        (this.vx = o()),
        (this.vy = o()),
        (this.vz = o()),
        (this.ax = o()),
        (this.ay = o()),
        (this.az = o()),
        (this.ang = o()),
        (this.spin = o()),
        (this.sx = o()),
        (this.sy = o()),
        (this.sz = o()),
        (this.age = o()),
        (this.life = o()),
        (this.floor = o()),
        (this.state = new Uint8Array(t)),
        ws.makeScale(0, 0, 0);
      for (let r = 0; r < t; r++) ws.toArray(s.instanceMatrix.array, r * 16);
      s.visible = !1;
    }
    clear() {
      this.state.fill(0), ws.makeScale(0, 0, 0);
      for (let e = 0; e < this.cap; e++) ws.toArray(this.mesh.instanceMatrix.array, e * 16);
      (this.mesh.instanceMatrix.needsUpdate = !0), (this.live = 0), (this.mesh.visible = !1);
    }
    add(e, t, n, s, o, r, a, l, c, u, h, f, p, d) {
      let v = this.next;
      (this.next = (v + 1) % this.cap),
        (this.px[v] = e),
        (this.py[v] = t),
        (this.pz[v] = n),
        (this.vx[v] = s),
        (this.vy[v] = o),
        (this.vz[v] = r);
      let g = Math.random() - 0.5,
        x = Math.random() - 0.5,
        y = Math.random() - 0.5,
        b = Math.hypot(g, x, y) || 1;
      (this.ax[v] = g / b),
        (this.ay[v] = x / b),
        (this.az[v] = y / b),
        (this.ang[v] = Math.random() * 6.28),
        (this.spin[v] = (Math.random() - 0.5) * 50),
        (this.sx[v] = a),
        (this.sy[v] = l),
        (this.sz[v] = c),
        (this.age[v] = 0),
        (this.life[v] = p),
        (this.floor[v] = d),
        (this.state[v] = 1);
      let m = this.mesh.instanceColor.array;
      (m[v * 3] = u),
        (m[v * 3 + 1] = h),
        (m[v * 3 + 2] = f),
        (this.mesh.instanceColor.needsUpdate = !0);
    }
    update(e) {
      let t = this.state,
        n = this.mesh.instanceMatrix.array,
        s = 0,
        o = !1;
      for (let r = 0; r < this.cap; r++) {
        let a = t[r];
        if (!a) continue;
        this.age[r] += e;
        let l = this.life[r] - this.age[r];
        if (l <= 0) {
          (t[r] = 0), ws.makeScale(0, 0, 0), ws.toArray(n, r * 16), (o = !0);
          continue;
        }
        if ((s++, a === 2 && l > 0.5)) continue;
        if (a === 1) {
          (this.vy[r] -= 9.81 * e),
            (this.px[r] += this.vx[r] * e),
            (this.py[r] += this.vy[r] * e),
            (this.pz[r] += this.vz[r] * e),
            (this.ang[r] += this.spin[r] * e);
          let u = this.floor[r] + Math.min(this.sx[r], this.sy[r], this.sz[r]) * 0.5;
          this.py[r] < u &&
            this.vy[r] < 0 &&
            ((this.py[r] = u),
            this.vy[r] > -1.2
              ? ((t[r] = 2), (this.vx[r] = this.vy[r] = this.vz[r] = 0))
              : ((this.vy[r] = -this.vy[r] * 0.32),
                (this.vx[r] *= 0.55),
                (this.vz[r] *= 0.55),
                (this.spin[r] *= 0.5)));
        }
        let c = l < 0.5 ? l / 0.5 : 1;
        Wb.set(this.ax[r], this.ay[r], this.az[r]),
          Oo.setFromAxisAngle(Wb, this.ang[r]),
          X1.set(this.px[r], this.py[r], this.pz[r]),
          Y1.set(this.sx[r] * c, this.sy[r] * c, this.sz[r] * c),
          ws.compose(X1, Oo, Y1),
          ws.toArray(n, r * 16),
          (o = !0);
      }
      (this.live = s),
        (this.mesh.visible = s > 0),
        o && (this.mesh.instanceMatrix.needsUpdate = !0);
    }
  },
  wv = { pos: new W(), surface: "concrete" },
  YR = new W(0, -1, 0),
  Gb = new W(),
  qb = new Lt(),
  G1 = new In();
function $R() {
  let t = [
      [0, 0],
      [0.006076, 0],
      [0.0062, 0.0012],
      [0.005083999999999999, 0.0022],
      [0.005083999999999999, 0.0034],
      [0.006013999999999999, 0.0046],
      [0.005889999999999999, 0.036399999999999995],
      [0.004092, 0.0416],
      [0.003968, 0.052],
      [0.003224, 0.052],
      [0.0031, 0.044719999999999996],
    ],
    n = new ar(
      t.map((s) => new Ae(s[0], s[1] - 0.052 / 2)),
      10,
    );
  return n.computeVertexNormals(), n;
}
var Z1 = class {
  constructor(e, t = 60) {
    (this.G = e), (this.cap = t), (this.next = 0);
    let n;
    try {
      n = e.mats.get("brass");
    } catch {
      n = null;
    }
    (!n || !n.isMaterial) && (n = new Qt({ color: 11570492, roughness: 0.3, metalness: 1 }));
    let s = (this.mesh = new Sr($R(), n, t));
    s.instanceMatrix.setUsage(bo),
      (s.frustumCulled = !1),
      (s.castShadow = !1),
      (s.receiveShadow = !0),
      (s.name = "fx_shells");
    let o = () => new Float32Array(t);
    (this.px = o()),
      (this.py = o()),
      (this.pz = o()),
      (this.vx = o()),
      (this.vy = o()),
      (this.vz = o()),
      (this.qx = o()),
      (this.qy = o()),
      (this.qz = o()),
      (this.qw = o().fill(1)),
      (this.wx = o()),
      (this.wy = o()),
      (this.wz = o()),
      (this.age = o()),
      (this.rest = o()),
      (this.floor = o()),
      (this.state = new Uint8Array(t)),
      (this.bounces = new Uint8Array(t)),
      ws.makeScale(0, 0, 0);
    for (let r = 0; r < t; r++) ws.toArray(s.instanceMatrix.array, r * 16);
    (s.visible = !1), (this.surface = new Array(t).fill("concrete"));
  }
  clear() {
    this.state.fill(0), ws.makeScale(0, 0, 0);
    for (let e = 0; e < this.cap; e++) ws.toArray(this.mesh.instanceMatrix.array, e * 16);
    (this.mesh.instanceMatrix.needsUpdate = !0), (this.mesh.visible = !1);
  }
  _floorAt(e) {
    let t = this.G.physics;
    if (((this.floor[e] = 0), (this.surface[e] = "concrete"), t && t.raycast)) {
      Gb.set(this.px[e], this.py[e] + 0.25, this.pz[e]);
      let n = t.raycast(Gb, YR, 6);
      n
        ? ((this.floor[e] = n.point.y), (this.surface[e] = n.surface || "concrete"))
        : (this.floor[e] = -50);
    }
  }
  add(e, t) {
    let n = this.next;
    (this.next = (n + 1) % this.cap),
      (this.px[n] = e.x),
      (this.py[n] = e.y),
      (this.pz[n] = e.z),
      (this.vx[n] = t.x),
      (this.vy[n] = t.y),
      (this.vz[n] = t.z),
      G1.set(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28),
      Oo.setFromEuler(G1),
      (this.qx[n] = Oo.x),
      (this.qy[n] = Oo.y),
      (this.qz[n] = Oo.z),
      (this.qw[n] = Oo.w),
      (this.wx[n] = (Math.random() - 0.5) * 40),
      (this.wy[n] = (Math.random() - 0.5) * 20),
      (this.wz[n] = (Math.random() - 0.5) * 40),
      (this.age[n] = 0),
      (this.rest[n] = 0),
      (this.state[n] = 1),
      (this.bounces[n] = 0),
      this._floorAt(n);
  }
  update(e) {
    let t = this.state,
      n = this.mesh.instanceMatrix.array,
      s = 0,
      o = !1;
    for (let r = 0; r < this.cap; r++) {
      let a = t[r];
      if (!a) continue;
      s++, (this.age[r] += e);
      let l = 1;
      if (a === 1) {
        (this.vy[r] -= 9.81 * e),
          (this.px[r] += this.vx[r] * e),
          (this.py[r] += this.vy[r] * e),
          (this.pz[r] += this.vz[r] * e);
        let c = this.wx[r],
          u = this.wy[r],
          h = this.wz[r],
          f = this.qx[r],
          p = this.qy[r],
          d = this.qz[r],
          v = this.qw[r],
          g = 0.5 * e,
          x = f + g * (c * v + u * d - h * p),
          y = p + g * (u * v + h * f - c * d),
          b = d + g * (h * v + c * p - u * f),
          m = v - g * (c * f + u * p + h * d),
          A = 1 / (Math.hypot(x, y, b, m) || 1);
        (this.qx[r] = x * A), (this.qy[r] = y * A), (this.qz[r] = b * A), (this.qw[r] = m * A);
        let _ = this.floor[r] + 0.0065;
        if (this.py[r] < _ && this.vy[r] < 0) {
          this.py[r] = _;
          let M = this.bounces[r]++;
          M < 2 &&
            (wv.pos.set(this.px[r], this.py[r], this.pz[r]),
            (wv.surface = this.surface[r]),
            this.G.events.emit("shell:bounce", wv)),
            this.vy[r] > -0.9 || M >= 4
              ? ((t[r] = 2),
                (this.vx[r] = this.vy[r] = this.vz[r] = 0),
                G1.set(Math.PI / 2, 0, Math.random() * 6.28, "ZXY"),
                Oo.setFromEuler(G1),
                (this.qx[r] = Oo.x),
                (this.qy[r] = Oo.y),
                (this.qz[r] = Oo.z),
                (this.qw[r] = Oo.w))
              : ((this.vy[r] = -this.vy[r] * (0.32 + Math.random() * 0.16)),
                (this.vx[r] = this.vx[r] * 0.6 + (Math.random() - 0.5) * 0.6),
                (this.vz[r] = this.vz[r] * 0.6 + (Math.random() - 0.5) * 0.6),
                (this.wx[r] = (Math.random() - 0.5) * 50),
                (this.wy[r] = (Math.random() - 0.5) * 30),
                (this.wz[r] = (Math.random() - 0.5) * 50),
                M === 0 && this._floorAt(r));
        }
        this.age[r] > 8 && (t[r] = 2);
      } else {
        if (((this.rest[r] += e), this.rest[r] < 4 && this.rest[r] > e * 1.5)) continue;
        if (this.rest[r] >= 4.7) {
          (t[r] = 0), ws.makeScale(0, 0, 0), ws.toArray(n, r * 16), (o = !0);
          continue;
        }
        this.rest[r] >= 4 && (l = 1 - (this.rest[r] - 4) / 0.7);
      }
      qb.set(this.qx[r], this.qy[r], this.qz[r], this.qw[r]),
        X1.set(this.px[r], this.py[r], this.pz[r]),
        Y1.set(l, l, l),
        ws.compose(X1, qb, Y1),
        ws.toArray(n, r * 16),
        (o = !0);
    }
    (this.mesh.visible = s > 0), o && (this.mesh.instanceMatrix.needsUpdate = !0);
  }
};
var ZR = {
    bullet_metal: 0.25,
    bullet_concrete: 0.34,
    bullet_wood: 0.24,
    scorch: 2.4,
    soot: 0.3,
    bullet_glass: 0.3,
  },
  Yb = 14,
  j1 = class {
    constructor(e, t = 160) {
      (this.cap = t), (this.next = 0), (this.count = 0);
      let n = (this.atlas = Hb(256)),
        s = new nt();
      (this.pos = new et(new Float32Array(t * 12), 3)),
        this.pos.setUsage(bo),
        (this.nor = new et(new Float32Array(t * 12), 3)),
        this.nor.setUsage(bo),
        (this.uv = new et(new Float32Array(t * 8), 2)),
        this.uv.setUsage(bo),
        (this.col = new et(new Float32Array(t * 16), 4)),
        this.col.setUsage(bo),
        (this.baseA = new Float32Array(t)),
        s.setAttribute("position", this.pos),
        s.setAttribute("normal", this.nor),
        s.setAttribute("uv", this.uv),
        s.setAttribute("color", this.col);
      let o = new Uint16Array(t * 6);
      for (let l = 0; l < t; l++) {
        let c = l * 4,
          u = l * 6;
        (o[u] = c),
          (o[u + 1] = c + 1),
          (o[u + 2] = c + 2),
          (o[u + 3] = c),
          (o[u + 4] = c + 2),
          (o[u + 5] = c + 3);
      }
      s.setIndex(new et(o, 1));
      let r = new Qt({
        map: n.map,
        roughnessMap: n.orm,
        metalnessMap: n.orm,
        roughness: 1,
        metalness: 1,
        transparent: !0,
        vertexColors: !0,
        depthWrite: !1,
        polygonOffset: !0,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      });
      n.nrm && ((r.normalMap = n.nrm), (r.normalScale = new Ae(1, 1))), (r.name = "fx_decals");
      let a = (this.mesh = new Qe(s, r));
      (a.frustumCulled = !1),
        (a.castShadow = !1),
        (a.receiveShadow = !0),
        (a.renderOrder = -5),
        (a.matrixAutoUpdate = !1),
        (a.name = "fx_decals"),
        (a.visible = !1),
        (this.uvs = {});
      for (let l in da) this.uvs[l] = da[l].map((c) => n.uv(c));
    }
    clear() {
      this.col.array.fill(0),
        this.pos.array.fill(0),
        (this.col.needsUpdate = this.pos.needsUpdate = !0),
        (this.next = 0),
        (this.count = 0),
        (this.mesh.visible = !1);
    }
    add(e, t, n, s, o = 1, r = 1) {
      let a = this.uvs[n] || this.uvs.bullet_concrete,
        l = a[(Math.random() * a.length) | 0],
        c = (s || ZR[n] || 0.25) * (0.85 + Math.random() * 0.3) * 0.5,
        u = this.next;
      (this.next = (u + 1) % this.cap), this.count < this.cap && this.count++;
      let h = t.x,
        f = t.y,
        p = t.z,
        d = Math.hypot(h, f, p) || 1;
      (h /= d), (f /= d), (p /= d);
      let v, g, x;
      Math.abs(f) > 0.9 ? ((v = 1), (g = 0), (x = 0)) : ((v = -p), (g = 0), (x = h));
      let y = v * h + g * f + x * p;
      (v -= h * y), (g -= f * y), (x -= p * y);
      let b = Math.hypot(v, g, x) || 1;
      (v /= b), (g /= b), (x /= b);
      let m = f * x - p * g,
        A = p * v - h * x,
        _ = h * g - f * v,
        M = n === "bullet_wood" ? (Math.random() - 0.5) * 0.3 : Math.random() * 6.283,
        E = Math.cos(M),
        w = Math.sin(M),
        S = (v * E + m * w) * c,
        z = (g * E + A * w) * c,
        H = (x * E + _ * w) * c,
        O = (m * E - v * w) * c,
        q = (A * E - g * w) * c,
        U = (_ * E - x * w) * c,
        T = 0.004 + (u % 7) * 3e-4,
        D = e.x + h * T,
        C = e.y + f * T,
        G = e.z + p * T,
        j = this.pos.array,
        N = this.nor.array,
        Q = this.uv.array,
        K = this.col.array,
        ie = u * 12;
      (j[ie] = D - S - O),
        (j[ie + 1] = C - z - q),
        (j[ie + 2] = G - H - U),
        (j[ie + 3] = D + S - O),
        (j[ie + 4] = C + z - q),
        (j[ie + 5] = G + H - U),
        (j[ie + 6] = D + S + O),
        (j[ie + 7] = C + z + q),
        (j[ie + 8] = G + H + U),
        (j[ie + 9] = D - S + O),
        (j[ie + 10] = C - z + q),
        (j[ie + 11] = G - H + U);
      for (let F = 0; F < 4; F++)
        (N[ie + F * 3] = h), (N[ie + F * 3 + 1] = f), (N[ie + F * 3 + 2] = p);
      (ie = u * 8),
        (Q[ie] = l[0]),
        (Q[ie + 1] = l[1]),
        (Q[ie + 2] = l[2]),
        (Q[ie + 3] = l[1]),
        (Q[ie + 4] = l[2]),
        (Q[ie + 5] = l[3]),
        (Q[ie + 6] = l[0]),
        (Q[ie + 7] = l[3]),
        (ie = u * 16),
        (this.baseA[u] = r);
      for (let F = 0; F < 4; F++)
        (K[ie + F * 4] = o),
          (K[ie + F * 4 + 1] = o),
          (K[ie + F * 4 + 2] = o),
          (K[ie + F * 4 + 3] = r);
      if (this.count >= this.cap)
        for (let F = 0; F < Yb; F++) {
          let X = (this.next + F) % this.cap,
            ne = (this.baseA[X] * (F + 1)) / (Yb + 1),
            re = X * 16;
          K[re + 3] = K[re + 7] = K[re + 11] = K[re + 15] = ne;
        }
      (this.pos.needsUpdate =
        this.nor.needsUpdate =
        this.uv.needsUpdate =
        this.col.needsUpdate =
          !0),
        (this.mesh.visible = !0);
    }
  };
var $b = 1400,
  Zb = 3200,
  ht = Math.random,
  Ze = (i, e) => i + (e - i) * Math.random(),
  Et = new W(),
  zt = new W(),
  J1 = new W(),
  qe = new W(),
  Es = new W(),
  Ho = new W(),
  Ei = new W(0, 1, 0),
  jR = new W(0, -1, 0),
  K1 = new Ve(),
  Ao = [1, 1, 1];
function Yc(i, e, t, n) {
  return (
    i == null
      ? ((Ao[0] = e), (Ao[1] = t), (Ao[2] = n))
      : Array.isArray(i)
        ? ((Ao[0] = i[0]), (Ao[1] = i[1]), (Ao[2] = i[2]))
        : i.isColor
          ? ((Ao[0] = i.r), (Ao[1] = i.g), (Ao[2] = i.b))
          : (K1.set(i), (Ao[0] = K1.r), (Ao[1] = K1.g), (Ao[2] = K1.b)),
    Ao
  );
}
function ro(i, e, t) {
  let n = ht() * 2 - 1,
    s = ht() * 2 - 1,
    o = ht() * 2 - 1,
    r = Math.hypot(n, s, o) || 1,
    a = (e * Math.cbrt(ht())) / r;
  t.set(i.x + n * a, i.y + s * a, i.z + o * a);
  let l = t.length();
  return l < 1e-4 ? t.copy(i) : t.multiplyScalar(1 / l), t;
}
async function Cf(i) {
  let e = i.scene || (i.render && i.render.scene),
    t = new W(-0.8, 0, 0.3),
    n = new W(Mn.color.r, Mn.color.g, Mn.color.b).multiplyScalar((Mn.intensity / Math.PI) * 0.9),
    s = new W(
      en.zenith.r * 0.6 + en.horizonAway.r * 0.5 + en.fog.r * 0.25,
      en.zenith.g * 0.6 + en.horizonAway.g * 0.5 + en.fog.g * 0.25,
      en.zenith.b * 0.6 + en.horizonAway.b * 0.5 + en.fog.b * 0.25,
    ),
    o = new W(
      en.horizonAway.r * 0.3 + en.fog.r * 0.14,
      en.horizonAway.g * 0.3 + en.fog.g * 0.14,
      en.horizonAway.b * 0.3 + en.fog.b * 0.14,
    ),
    r = Ev(i, $b, {
      lit: !0,
      tex: Bb(128),
      cols: Wc,
      rows: H1,
      renderOrder: 10,
      sun: n,
      sunDir: Mn.dir.clone().normalize(),
      ambLo: o,
      ambHi: s,
    }),
    a = Ev(i, Zb, { lit: !1, tex: Ob(128), cols: Af, rows: bv, renderOrder: 20 }),
    l = new Rf($b, !0),
    c = new Rf(Zb - 160, !1),
    u = new q1(48),
    h = new $1(i, 256),
    f = new Z1(i, 60),
    p = new j1(i, 160),
    d = new wt();
  (d.name = "fx"), d.add(p.mesh, h.mesh, f.mesh, r.mesh, a.mesh), e.add(d);
  let v = 0,
    g = -1,
    x = -1,
    y = () => i.render && i.render.lightPool,
    b = (ee, B, P, V, Y) => {
      let L = y();
      L && L.flash(ee, B, P, V, Y);
    };
  function m(ee, B) {
    let P = i.physics;
    if (!P || !P.raycast) return 1;
    Es.copy(ee), B && Es.addScaledVector(B, 0.08), (Es.y += 0.03);
    let V = null;
    try {
      V = P.raycast(Es, Mn.dir, 90);
    } catch {
      V = null;
    }
    return V ? 0.2 : 1;
  }
  function A(ee) {
    let B = i.physics;
    if (!B || !B.raycast) return 0;
    Es.copy(ee), (Es.y += 0.1);
    let P = null;
    try {
      P = B.raycast(Es, jR, 12);
    } catch {
      P = null;
    }
    return P ? P.point.y : -50;
  }
  function _(ee, B, P, V, Y, L, Z, J, oe, fe, le, R, I, se, ae, k, ce, ve) {
    let _e = l.emit(ee, B, P, V, Y, L, Z, J, oe);
    return _e < 0
      ? -1
      : ((l.r[_e] = fe),
        (l.g[_e] = le),
        (l.b[_e] = R),
        (l.a[_e] = I),
        (l.shade[_e] = se),
        (l.drag[_e] = ae),
        (l.grav[_e] = -k),
        (l.wind[_e] = ce),
        (l.turb[_e] = 0.5),
        (l.rot[_e] = ht() * 6.283),
        (l.rotv[_e] = (ht() - 0.5) * 1.2),
        (l.frame[_e] = ve < 0 ? (ht() * 6) | 0 : ve),
        (l.fin[_e] = 0.06),
        (l.fout[_e] = 0.3),
        (l.sk[_e] = 2.5),
        _e);
  }
  function M(ee, B, P, V, Y, L, Z, J, oe, fe, le, R) {
    let I = c.emit(ee, B, P, V, Y, L, Z, J, J * 0.5);
    return I < 0
      ? -1
      : ((c.mode[I] = 1),
        (c.frame[I] = _v),
        (c.stretch[I] = 0.03),
        (c.grav[I] = 9.81),
        (c.drag[I] = 0.9),
        (c.ramp[I] = 1),
        (c.r[I] = oe * 0.6),
        (c.g[I] = fe * 0.6),
        (c.b[I] = le * 0.6),
        (c.fout[I] = 0.55),
        (c.flags[I] = R),
        (c.sk[I] = 1),
        I);
  }
  function E(ee, B, P, V, Y, L, Z, J, oe, fe, le, R) {
    for (let I = 0; I < P; I++) {
      ro(B, L, qe);
      let se = Ze(V, Y) * (0.35 + 0.65 * ht());
      M(
        ee.x,
        ee.y,
        ee.z,
        qe.x * se,
        qe.y * se,
        qe.z * se,
        Ze(Z, J),
        Ze(0.01, 0.02),
        oe * Ze(0.6, 1.2),
        fe * Ze(0.6, 1.2),
        le,
        R,
      );
    }
  }
  function w(ee, B, P, V, Y, L, Z, J, oe, fe) {
    let le = c.emit(ee, B, P, 0, 0, 0, V, Y, L);
    return le < 0
      ? -1
      : ((c.frame[le] = fe),
        (c.r[le] = Z),
        (c.g[le] = J),
        (c.b[le] = oe),
        (c.fout[le] = 0.2),
        (c.rot[le] = ht() * 6.283),
        (c.sk[le] = 1.5),
        le);
  }
  function S(ee, B, P, V, Y, L, Z, J, oe) {
    let fe = c.emit(ee, B, P, 0, 0, 0, V, Y, L);
    return fe < 0
      ? -1
      : ((c.mode[fe] = 2),
        (c.frame[fe] = Mv),
        (c.r[fe] = Z),
        (c.g[fe] = J),
        (c.b[fe] = oe),
        (c.fout[fe] = 0.15),
        (c.fin[fe] = 0.08),
        (c.sk[fe] = 2.2),
        (c.rot[fe] = ht() * 6.283),
        fe);
  }
  function z(ee, B, P, V, Y, L, Z, J, oe, fe, le, R, I, se, ae, k) {
    for (let ce = 0; ce < P; ce++) {
      ro(B, ae, qe);
      let ve = Ze(V, Y),
        _e = Ze(0.8, 1.15);
      h.add(
        ee.x + qe.x * 0.02,
        ee.y + qe.y * 0.02,
        ee.z + qe.z * 0.02,
        qe.x * ve,
        qe.y * ve + 0.8,
        qe.z * ve,
        Ze(L, Z),
        Ze(J, oe),
        Ze(fe, le),
        R * _e,
        I * _e,
        se * _e,
        Ze(3.5, 6),
        k,
      );
    }
  }
  function H(ee, B, P = 12) {
    zt.copy(B || Ei),
      zt.lengthSq() < 1e-6 && zt.copy(Ei),
      zt.normalize(),
      E(ee, zt, P, 5, 18, 0.6, 0.15, 0.5, 36, 22, 9, qc),
      w(ee.x, ee.y, ee.z, 0.05, 0.2, 0.35, 10, 6.5, 3, oo);
  }
  function O(ee, B = {}) {
    let P = B.size || 1,
      V = B.life || 2.5,
      Y = B.rise === void 0 ? 0.6 : B.rise,
      L = Yc(B.color, 0.32, 0.32, 0.33),
      Z = B.vel,
      J = m(ee, null),
      oe = B.count || 3;
    for (let fe = 0; fe < oe; fe++)
      _(
        ee.x + (ht() - 0.5) * 0.2 * P,
        ee.y + (ht() - 0.5) * 0.2 * P,
        ee.z + (ht() - 0.5) * 0.2 * P,
        (Z ? Z.x : 0) + (ht() - 0.5) * 0.4,
        (Z ? Z.y : 0) + ht() * 0.3,
        (Z ? Z.z : 0) + (ht() - 0.5) * 0.4,
        V * Ze(0.75, 1.2),
        P * 0.3,
        P * Ze(1, 1.5),
        L[0],
        L[1],
        L[2],
        B.alpha || 0.4,
        J,
        1.2,
        Y,
        1,
        -1,
      );
  }
  function q(ee, B, P = 1, V = 0.5, Y = 0.48, L = 0.45) {
    Et.copy(B || Ei), Et.lengthSq() < 1e-6 && Et.copy(Ei), Et.normalize();
    let Z = m(ee, Et);
    for (let J = 0; J < 8; J++) {
      ro(Et, 0.5, qe);
      let oe = Ze(1, 4.5) * P,
        fe = Ze(0.85, 1.1);
      _(
        ee.x + Et.x * 0.03,
        ee.y + Et.y * 0.03,
        ee.z + Et.z * 0.03,
        qe.x * oe,
        qe.y * oe,
        qe.z * oe,
        Ze(0.5, 1.1),
        0.08 * P,
        Ze(0.35, 0.7) * P,
        V * fe,
        Y * fe,
        L * fe,
        0.9,
        Z,
        3.5,
        0.15,
        0.6,
        J < 3 ? 7 : -1,
      );
    }
    for (let J = 0; J < 2; J++)
      _(
        ee.x + Et.x * 0.15,
        ee.y + Et.y * 0.15,
        ee.z + Et.z * 0.15,
        Et.x * 0.5 + (ht() - 0.5) * 0.3,
        Et.y * 0.5 + 0.1,
        Et.z * 0.5 + (ht() - 0.5) * 0.3,
        Ze(2.2, 3.6),
        0.25 * P,
        Ze(0.9, 1.5) * P,
        V,
        Y,
        L,
        0.28,
        Z,
        1.5,
        0.1,
        1,
        -1,
      );
    return Z;
  }
  function U(ee, B = {}) {
    let P;
    if (B.color !== void 0) P = Yc(B.color, 0.4, 0.4, 0.4);
    else if (B.mat) {
      let oe = null;
      try {
        oe = typeof B.mat == "string" ? i.mats.get(B.mat) : B.mat;
      } catch {
        oe = null;
      }
      P = Yc(oe && oe.color ? oe.color : null, 0.4, 0.4, 0.4);
    } else P = Yc(null, 0.4, 0.39, 0.37);
    let V = P[0],
      Y = P[1],
      L = P[2],
      Z = B.size || 0.06,
      J = B.speed || 5;
    Et.copy(B.normal || Ei).normalize(),
      z(
        ee,
        Et,
        Math.min(B.count || 6, 40),
        J * 0.4,
        J * 1.3,
        Z * 0.4,
        Z * 1.2,
        Z * 0.3,
        Z * 0.9,
        Z * 0.4,
        Z * 1.2,
        V,
        Y,
        L,
        B.spread || 1,
        A(ee),
      );
  }
  function T(ee, B = 1) {
    let P = m(ee, Ei),
      V = ee.y;
    for (let fe = 0; fe < 5; fe++) {
      let le = Ze(0.35, 0.6) * B,
        R = _(
          ee.x + (ht() - 0.5) * 0.08 * B,
          V + 0.1 * B,
          ee.z + (ht() - 0.5) * 0.08 * B,
          (ht() - 0.5) * 0.5,
          Ze(1.6, 2.8) * Math.sqrt(B),
          (ht() - 0.5) * 0.5,
          Ze(0.4, 0.65),
          le * 0.3,
          le,
          0.72,
          0.78,
          0.84,
          0.95,
          P,
          0.5,
          -7,
          0,
          6,
        );
      R >= 0 &&
        ((l.rot[R] = (ht() - 0.5) * 0.3),
        (l.rotv[R] = 0),
        (l.turb[R] = 0),
        (l.sk[R] = 3),
        (l.fout[R] = 0.4));
    }
    for (let fe = 0; fe < 2; fe++)
      _(
        ee.x,
        V + 0.15 * B,
        ee.z,
        (ht() - 0.5) * 0.6,
        0.5,
        (ht() - 0.5) * 0.6,
        Ze(0.7, 1.1),
        0.2 * B,
        0.7 * B,
        0.7,
        0.75,
        0.8,
        0.14,
        P,
        2,
        0,
        0.8,
        -1,
      );
    let Y = 1.9 * P + 0.35,
      L = 1.5 * P + 0.45,
      Z = 1.05 * P + 0.55,
      J = Math.round(14 * Math.min(B, 1.6));
    for (let fe = 0; fe < J; fe++) {
      ro(Ei, 0.75, qe);
      let le = Ze(1.5, 4.8) * Math.sqrt(B),
        R = c.emit(
          ee.x,
          V + 0.03,
          ee.z,
          qe.x * le,
          Math.abs(qe.y) * le,
          qe.z * le,
          Ze(0.5, 1),
          Ze(0.012, 0.024),
          0.01,
        );
      R >= 0 &&
        ((c.mode[R] = 1),
        (c.frame[R] = Gc),
        (c.stretch[R] = 0.012),
        (c.grav[R] = 9.81),
        (c.drag[R] = 0.4),
        (c.r[R] = Y),
        (c.g[R] = L),
        (c.b[R] = Z),
        (c.fout[R] = 0.7),
        (c.flags[R] = Xc),
        (c.sk[R] = 1),
        (c.gy[R] = V));
    }
    S(
      ee.x,
      V + 0.012,
      ee.z,
      0.9,
      0.12 * B,
      1.5 * B,
      0.3 * P + 0.08,
      0.27 * P + 0.09,
      0.22 * P + 0.1,
    );
    let oe = S(
      ee.x,
      V + 0.012,
      ee.z,
      1.3,
      0.05 * B,
      1 * B,
      0.2 * P + 0.05,
      0.18 * P + 0.06,
      0.15 * P + 0.07,
    );
    oe >= 0 && (c.fin[oe] = 0.35);
  }
  let D = { p: new W() };
  function C(ee, B, P, V, Y) {
    Et.copy(B || Ei),
      Et.lengthSq() < 1e-6 && Et.copy(Ei),
      Et.normalize(),
      V && V.lengthSq() > 1e-6 ? zt.copy(V).normalize() : zt.copy(Et).negate(),
      J1.copy(zt)
        .addScaledVector(Et, -2 * zt.dot(Et))
        .normalize();
    let L = D.p.copy(ee);
    if (
      (Y && (P = "enemy"),
      P !== "enemy" && P !== "water" && Et.y > 0.7 && i.ground && i.ground.isPuddle)
    )
      try {
        i.ground.isPuddle(L.x, L.z) && L.y < 0.08 && (P = "water");
      } catch {}
    let J = (i.camera ? i.camera.position : Es.set(0, 0, 0)).distanceToSquared(L) > 3025,
      oe = J ? 0.5 : 1,
      fe = Et.x,
      le = Et.y,
      R = Et.z;
    switch (P) {
      case "metal": {
        qe.copy(J1).addScaledVector(Et, 0.6).normalize(),
          zt.copy(qe),
          E(L, zt, Math.round(18 * oe), 6, 24, 0.55, 0.1, 0.38, 40, 25, 10.5, 0),
          E(L, zt, 2 + ((ht() * 2) | 0), 9, 18, 0.9, 0.7, 1.3, 32, 18, 7, qc),
          w(L.x + fe * 0.03, L.y + le * 0.03, L.z + R * 0.03, 0.05, 0.25, 0.45, 16, 11, 5.5, oo),
          w(
            L.x + fe * 0.04,
            L.y + le * 0.04,
            L.z + R * 0.04,
            0.04,
            0.35,
            0.5,
            9,
            6,
            2.6,
            n0 + ((ht() * 2) | 0),
          ),
          v - g > 0.09 &&
            ((g = v), Es.copy(L).addScaledVector(Et, 0.12), b(Es, 16760944, 10, 5, 0.05));
        let I = m(L, Et);
        for (let se = 0; se < 2; se++)
          _(
            L.x + fe * 0.04,
            L.y + le * 0.04,
            L.z + R * 0.04,
            fe * 0.8 + (ht() - 0.5) * 0.5,
            le * 0.8 + 0.2,
            R * 0.8 + (ht() - 0.5) * 0.5,
            Ze(0.5, 0.9),
            0.06,
            Ze(0.3, 0.5),
            0.4,
            0.4,
            0.41,
            0.4,
            I,
            2.5,
            0.3,
            0.8,
            -1,
          );
        J ||
          z(L, Et, 2, 1.5, 4, 0.012, 0.03, 0.003, 0.005, 0.01, 0.025, 0.2, 0.21, 0.23, 0.8, A(L)),
          p.add(L, Et, "bullet_metal");
        break;
      }
      case "wood": {
        let I = q(L, Et, 0.75, 0.5, 0.42, 0.32);
        z(
          L,
          Et,
          J ? 3 : 7,
          2,
          6,
          0.004,
          0.009,
          0.03,
          0.1,
          0.004,
          0.012,
          0.62,
          0.5,
          0.33,
          0.7,
          A(L),
        ),
          I > 0.5 && ht() < 0.3 && w(L.x, L.y, L.z, 0.04, 0.1, 0.2, 3, 2, 1, oo),
          p.add(L, Et, "bullet_wood");
        break;
      }
      case "water": {
        T(L, 1);
        break;
      }
      case "rubber":
      case "dirt": {
        let I = m(L, Et),
          se = P === "dirt",
          ae = se ? 0.3 : 0.14,
          k = se ? 0.25 : 0.14,
          ce = se ? 0.19 : 0.14;
        for (let ve = 0; ve < 5; ve++) {
          ro(Et, 0.6, qe);
          let _e = Ze(0.6, 2.6);
          _(
            L.x + fe * 0.03,
            L.y + le * 0.03,
            L.z + R * 0.03,
            qe.x * _e,
            qe.y * _e,
            qe.z * _e,
            Ze(0.5, 1),
            0.07,
            Ze(0.3, 0.55),
            ae,
            k,
            ce,
            0.85,
            I,
            3.5,
            0.1,
            0.6,
            ve < 2 ? 7 : -1,
          );
        }
        z(
          L,
          Et,
          3,
          1.5,
          4,
          0.01,
          0.03,
          0.008,
          0.02,
          0.01,
          0.03,
          ae * 0.8,
          k * 0.8,
          ce * 0.8,
          0.7,
          A(L),
        ),
          p.add(L, Et, "soot", 0.2, 1, 0.8);
        break;
      }
      case "glass": {
        for (let I = 0; I < 12; I++) {
          ro(Et, 0.9, qe);
          let se = Ze(1.5, 6),
            ae = c.emit(
              L.x,
              L.y,
              L.z,
              qe.x * se,
              qe.y * se,
              qe.z * se,
              Ze(0.4, 0.9),
              Ze(0.012, 0.02),
              0.008,
            );
          ae >= 0 &&
            ((c.mode[ae] = 1),
            (c.frame[ae] = Gc),
            (c.stretch[ae] = 0.01),
            (c.grav[ae] = 9.81),
            (c.r[ae] = 2.6),
            (c.g[ae] = 2.7),
            (c.b[ae] = 2.8),
            (c.flags[ae] = Xc),
            (c.ramp[ae] = 3));
        }
        z(L, Et, 4, 1.5, 5, 0.01, 0.03, 0.002, 0.004, 0.01, 0.03, 0.62, 0.72, 0.74, 0.8, A(L)),
          _(
            L.x,
            L.y,
            L.z,
            fe * 0.6,
            le * 0.6 + 0.2,
            R * 0.6,
            0.6,
            0.08,
            0.4,
            0.75,
            0.8,
            0.82,
            0.2,
            m(L, Et),
            2.5,
            0.2,
            0.8,
            -1,
          ),
          p.add(L, Et, "bullet_glass");
        break;
      }
      case "enemy": {
        qe.copy(J1).addScaledVector(Et, 0.8).normalize(),
          zt.copy(qe),
          E(L, zt, Math.round(13 * oe), 5, 20, 0.9, 0.12, 0.45, 42, 29, 14, 0),
          E(L, zt, 2, 6, 12, 1, 0.6, 1.1, 32, 18, 7, qc),
          w(L.x, L.y, L.z, 0.06, 0.3, 0.55, 18, 12, 6, oo),
          w(L.x, L.y, L.z, 0.04, 0.3, 0.45, 8, 5, 2.4, n0 + ((ht() * 2) | 0)),
          v - g > 0.09 && ((g = v), b(L, 16756832, 8, 4.5, 0.05));
        let I = m(L, Et);
        for (let se = 0; se < 2; se++)
          _(
            L.x,
            L.y,
            L.z,
            fe * 0.5 + (ht() - 0.5) * 0.4,
            le * 0.5 + 0.3,
            R * 0.5 + (ht() - 0.5) * 0.4,
            Ze(0.6, 1.1),
            0.06,
            Ze(0.3, 0.5),
            0.13,
            0.13,
            0.14,
            0.65,
            I,
            2.2,
            0.5,
            0.9,
            -1,
          );
        if (!J) {
          let se = ht() < 0.35;
          z(
            L,
            Et,
            3,
            2,
            6,
            0.012,
            0.035,
            0.004,
            0.008,
            0.012,
            0.03,
            0.6,
            se ? 0.2 : 0.62,
            se ? 0.05 : 0.64,
            0.8,
            A(L),
          );
        }
        break;
      }
      default: {
        q(L, Et, 1, 0.52, 0.5, 0.47),
          z(
            L,
            Et,
            J ? 2 : 4,
            1.5,
            5.5,
            0.012,
            0.035,
            0.008,
            0.02,
            0.012,
            0.035,
            0.42,
            0.41,
            0.39,
            0.7,
            A(L),
          ),
          qe.copy(J1).addScaledVector(Et, 0.7).normalize(),
          zt.copy(qe);
        for (let I = 0; I < 4; I++) {
          ro(zt, 0.5, qe);
          let se = Ze(3, 9),
            ae = _(
              L.x,
              L.y,
              L.z,
              qe.x * se,
              qe.y * se,
              qe.z * se,
              Ze(0.25, 0.45),
              0.03,
              0.09,
              0.6,
              0.58,
              0.54,
              0.7,
              1,
              2,
              -6,
              0.2,
              7,
            );
          ae >= 0 && (l.turb[ae] = 0);
        }
        ht() < 0.3 && E(L, zt, 3, 4, 10, 0.6, 0.08, 0.2, 26, 15, 6, 0),
          p.add(L, Et, "bullet_concrete");
      }
    }
  }
  function G(ee, B, P = {}) {
    let V = Yc(P.color, 1, 0.8, 0.46),
      Y = P.intensity || 16;
    if (
      (u.add(ee, B, V[0] * Y, V[1] * Y, V[2] * Y, P.speed || 260, P.width || 0.024),
      v - x > 0.07 && P.trail !== !1)
    ) {
      (x = v), qe.subVectors(B, ee);
      let L = qe.length();
      if (L > 2) {
        qe.multiplyScalar(1 / L);
        let Z = 5,
          J = Math.min(L, 7),
          oe = m(ee, null);
        for (let fe = 0; fe < Z; fe++) {
          let le = 0.6 + ((fe + ht()) / Z) * (J - 0.6),
            R = _(
              ee.x + qe.x * le,
              ee.y + qe.y * le,
              ee.z + qe.z * le,
              qe.x * 0.6,
              0.05,
              qe.z * 0.6,
              Ze(0.45, 0.8),
              0.04,
              Ze(0.12, 0.2),
              0.6,
              0.6,
              0.62,
              0.1,
              oe,
              2,
              0.1,
              0.7,
              -1,
            );
          R >= 0 && (l.fin[R] = 0.25);
        }
      }
    }
  }
  function j(ee, B, P = {}) {
    let V = P.scale || 1;
    zt.copy(B || Ei), zt.lengthSq() < 1e-6 && zt.set(0, 0, -1), zt.normalize();
    let Y = Yc(P.color, 1, 0.68, 0.32),
      L = ee.x,
      Z = ee.y,
      J = ee.z,
      oe = Y[0],
      fe = Y[1],
      le = Y[2];
    w(
      L + zt.x * 0.1 * V,
      Z + zt.y * 0.1 * V,
      J + zt.z * 0.1 * V,
      0.045,
      0.75 * V,
      1.15 * V,
      34 * oe,
      34 * fe,
      34 * le,
      n0,
    ),
      w(
        L + zt.x * 0.14 * V,
        Z + zt.y * 0.14 * V,
        J + zt.z * 0.14 * V,
        0.035,
        0.5 * V,
        0.85 * V,
        22 * oe,
        22 * fe,
        22 * le,
        n0 + 1,
      ),
      w(
        L + zt.x * 0.05 * V,
        Z + zt.y * 0.05 * V,
        J + zt.z * 0.05 * V,
        0.045,
        0.13 * V,
        0.2 * V,
        22,
        22 * (fe + 0.25),
        22 * (le + 0.3),
        oo,
      ),
      w(L, Z, J, 0.05, 0.8 * V, 1.1 * V, 0.4 * oe, 0.4 * fe, 0.4 * le, oo);
    let R = c.emit(
      L + zt.x * 0.4 * V,
      Z + zt.y * 0.4 * V,
      J + zt.z * 0.4 * V,
      -zt.x,
      -zt.y,
      -zt.z,
      0.04,
      0.11 * V,
      0.14 * V,
    );
    R >= 0 &&
      ((c.mode[R] = 1),
      (c.frame[R] = W1),
      (c.stretch[R] = 0.9 * V),
      (c.r[R] = 18 * oe),
      (c.g[R] = 18 * fe),
      (c.b[R] = 18 * le),
      (c.fout[R] = 0.3));
    for (let I = 0; I < 3; I++) {
      ro(zt, 0.25, qe);
      let se = Ze(8, 22);
      M(L, Z, J, qe.x * se, qe.y * se, qe.z * se, Ze(0.08, 0.22), 0.012, 30, 18, 7, 0);
    }
    _(
      L + zt.x * 0.2,
      Z + zt.y * 0.2,
      J + zt.z * 0.2,
      zt.x * 1.5,
      zt.y * 1.5 + 0.2,
      zt.z * 1.5,
      Ze(0.5, 0.9),
      0.08 * V,
      0.45 * V,
      0.5,
      0.5,
      0.52,
      0.16,
      1,
      3,
      0.3,
      0.8,
      -1,
    ),
      Es.copy(ee).addScaledVector(zt, 0.25),
      b(Es, 16756832, 16 * V, 7 * V, 0.05);
  }
  function N(ee, B) {
    f.add(ee, B);
  }
  let Q = { pos: new W(), size: 1 };
  function K(ee, B = 1) {
    let P = Math.max(0.4, Math.min(B, 4)),
      V = ee.x,
      Y = ee.y,
      L = ee.z,
      Z = Math.sqrt(P),
      J = A(ee),
      oe = Y - J < 1.4 * P,
      fe = m(ee, Ei);
    Es.set(V, Y + 0.4, L),
      b(Es, 16769712, 320 * P, 10 + 9 * P, 0.08),
      b(Es, 16747056, 55 * P, 8 + 6 * P, 0.45);
    let le = Y + 0.35 * P;
    w(V, le, L, 0.055, 1.5 * P, 2.3 * P, 16, 13.5, 9.5, oo),
      w(V, le, L, 0.05, 2.6 * P, 4.2 * P, 7, 5, 2.4, n0 + ((ht() * 2) | 0)),
      w(V, le, L, 0.3, 3.5 * P, 5.5 * P, 0.35, 0.2, 0.08, oo);
    let R = Math.round(13 + 5 * P);
    for (let ae = 0; ae < R; ae++) {
      ro(Ei, 1.6, qe), oe && qe.y < -0.1 && (qe.y = -qe.y * 0.5);
      let k = Ze(2.2, 7.5) * Z,
        ce = Ze(0.7, 1.15),
        ve = l.emit(
          V + qe.x * 0.3 * P,
          le + qe.y * 0.3 * P,
          L + qe.z * 0.3 * P,
          qe.x * k,
          qe.y * k + 1.4,
          qe.z * k,
          Ze(0.55, 1.05),
          0.85 * P,
          Ze(1.8, 2.7) * P,
        );
      ve >= 0 &&
        ((l.frame[ve] = ae % 4 === 0 ? 7 : (ht() * 6) | 0),
        (l.ramp[ve] = 2),
        (l.r[ve] = 5.8 * ce),
        (l.g[ve] = 2.4 * ce),
        (l.b[ve] = 0.5 * ce),
        (l.a[ve] = 0.96),
        (l.shade[ve] = 2 + fe),
        (l.drag[ve] = 4),
        (l.grav[ve] = -2.6),
        (l.wind[ve] = 0.6),
        (l.turb[ve] = 1.5),
        (l.rot[ve] = ht() * 6.283),
        (l.rotv[ve] = (ht() - 0.5) * 2.5),
        (l.sk[ve] = 3),
        (l.fin[ve] = 0),
        (l.fout[ve] = 0.6));
    }
    for (let ae = 0; ae < 5; ae++) {
      ro(Ei, 1.4, qe);
      let k = Ze(2, 5) * Z,
        ce = c.emit(
          V + qe.x * 0.3 * P,
          le + qe.y * 0.3 * P,
          L + qe.z * 0.3 * P,
          qe.x * k,
          Math.abs(qe.y) * k + 1.2,
          qe.z * k,
          Ze(0.3, 0.55),
          0.6 * P,
          Ze(1.2, 1.8) * P,
        );
      ce >= 0 &&
        ((c.frame[ce] = V1),
        (c.ramp[ce] = 2),
        (c.r[ce] = 2.4),
        (c.g[ce] = 1.1),
        (c.b[ce] = 0.3),
        (c.drag[ce] = 4),
        (c.grav[ce] = -2.5),
        (c.rot[ce] = ht() * 6.283),
        (c.sk[ce] = 3),
        (c.fout[ce] = 0.4));
    }
    let I = Math.round(11 + 5 * P);
    for (let ae = 0; ae < I; ae++) {
      let k = ae % 2 === 0;
      ro(Ei, 1.4, qe), oe && qe.y < 0 && (qe.y = -qe.y * 0.4);
      let ce = (k ? Ze(4.5, 9) : Ze(1.5, 5)) * Z,
        ve = Ze(0.04, 0.1),
        _e = k ? 0.75 : 0.3,
        Te = _(
          V + qe.x * _e * P,
          le + qe.y * _e * P,
          L + qe.z * _e * P,
          qe.x * ce,
          qe.y * ce + 0.8,
          qe.z * ce,
          Ze(2.8, 4.8),
          (k ? 0.8 : 1.2) * P,
          Ze(2.6, 4.2) * P,
          ve,
          ve * 0.95,
          ve * 0.9,
          k ? 0.7 : 0.8,
          fe,
          3.4,
          Ze(0.8, 1.7),
          1,
          ae % 3 === 0 ? 7 : -1,
        );
      Te >= 0 && ((l.fin[Te] = k ? 0.025 : 0.16), (l.fout[Te] = 0.35), (l.turb[Te] = 1.2));
    }
    X(V, Y + 0.3 * P, L, "smolder", 1.3 + 0.3 * P, P, fe);
    let se = Math.min(90, Math.round(34 * P));
    for (let ae = 0; ae < se; ae++) {
      ro(Ei, 1.5, qe), oe && qe.y < 0 && (qe.y = -qe.y);
      let k = Ze(6, 26) * Z,
        ce = M(
          V,
          Y + 0.05,
          L,
          qe.x * k,
          qe.y * k,
          qe.z * k,
          Ze(0.5, 1.5),
          Ze(0.014, 0.028),
          40,
          23,
          8,
          qc,
        );
      ce >= 0 && ((c.drag[ce] = 1.4), (c.stretch[ce] = 0.035));
    }
    for (let ae = 0; ae < 10 * P; ae++) {
      ro(Ei, 1.2, qe);
      let k = Ze(1, 5),
        ce = c.emit(
          V,
          Y + 0.3,
          L,
          qe.x * k,
          Math.abs(qe.y) * k + 1,
          qe.z * k,
          Ze(1.4, 3),
          0.035,
          0.02,
        );
      ce >= 0 &&
        ((c.frame[ce] = oo),
        (c.ramp[ce] = 3),
        (c.r[ce] = 9),
        (c.g[ce] = 4),
        (c.b[ce] = 1),
        (c.drag[ce] = 1.2),
        (c.grav[ce] = 0.6),
        (c.turb[ce] = 3),
        (c.wind[ce] = 1),
        (c.fout[ce] = 0.5));
    }
    if (oe) {
      let ae = J + 0.015;
      S(V, ae, L, 0.32, 0.6 * P, 9 * P, 1.6, 1.2, 0.75);
      let k = Math.round(12 + 3 * P);
      for (let ce = 0; ce < k; ce++) {
        let ve = ((ce + ht()) / k) * 6.283,
          _e = Ze(5, 10) * Z,
          Te = Ze(0.42, 0.55),
          Pe = _(
            V + Math.cos(ve) * 0.4 * P,
            ae + 0.2,
            L + Math.sin(ve) * 0.4 * P,
            Math.cos(ve) * _e,
            Ze(0.2, 0.9),
            Math.sin(ve) * _e,
            Ze(1.2, 2.2),
            0.4 * P,
            Ze(1.2, 1.9) * P,
            Te,
            Te * 0.96,
            Te * 0.9,
            0.26,
            fe,
            3,
            0.15,
            0.7,
            -1,
          );
        Pe >= 0 && (l.fin[Pe] = 0.1);
      }
      Ho.set(V, J, L), p.add(Ho, Ei, "scorch", 2.3 * P, 1, 0.92);
    }
    Ho.set(V, Math.max(Y, J + 0.1), L),
      z(
        Ho,
        Ei,
        Math.round(13 + 6 * P),
        4,
        13 * Z,
        0.04,
        0.13,
        0.025,
        0.08,
        0.04,
        0.13,
        0.07,
        0.066,
        0.062,
        1.1,
        J,
      ),
      Q.pos.copy(ee),
      (Q.size = B),
      i.events.emit("explosion", Q);
  }
  let ie = [];
  for (let ee = 0; ee < 24; ee++) {
    let B = {
      active: !1,
      kind: "steam",
      pos: new W(),
      acc: 0,
      acc2: 0,
      ttl: 1 / 0,
      scale: 1,
      shade: 1,
      t: 0,
      light: null,
      drop: -1,
    };
    (B.stop = () => {
      (B.active = !1), B.light && (B.light.release(), (B.light = null));
    }),
      (B.setPos = (P) => {
        B.pos.copy(P);
      }),
      ie.push(B);
  }
  let F = { active: !1, pos: new W(), stop() {}, setPos() {} };
  function X(ee, B, P, V, Y, L, Z) {
    let J = null;
    for (let oe = 0; oe < ie.length; oe++)
      if (!ie[oe].active) {
        J = ie[oe];
        break;
      }
    if (!J) return F;
    if (
      ((J.active = !0),
      (J.kind = V),
      J.pos.set(ee, B, P),
      (J.acc = 0),
      (J.acc2 = 0),
      (J.ttl = Y),
      (J.scale = L),
      (J.t = 0),
      (J.drop = -1),
      (J.shade = Z === void 0 ? m(J.pos, null) : Z),
      V === "fire")
    ) {
      let oe = y();
      (J.light = oe && oe.acquire ? oe.acquire() : null),
        J.light &&
          (J.light.light.color.set(16747066),
          (J.light.light.distance = 9),
          J.light.light.position.set(ee, B + 0.5, P));
    }
    return J;
  }
  function ne(ee, B = "steam", P = {}) {
    return X(ee.x, ee.y, ee.z, B, P.ttl || 1 / 0, P.scale || 1, void 0);
  }
  function re(ee) {
    for (let B = 0; B < ie.length; B++) {
      let P = ie[B];
      if (!P.active) continue;
      if (((P.t += ee), P.t > P.ttl)) {
        P.stop();
        continue;
      }
      let V = P.pos.x,
        Y = P.pos.y,
        L = P.pos.z,
        Z = P.scale;
      if (P.kind === "steam")
        for (P.acc += ee * 13; P.acc > 1; ) {
          P.acc -= 1;
          let J = _(
            V + (ht() - 0.5) * 0.08,
            Y,
            L + (ht() - 0.5) * 0.08,
            (ht() - 0.5) * 0.4,
            Ze(1.4, 2.4),
            (ht() - 0.5) * 0.4,
            Ze(1.8, 3),
            0.12 * Z,
            Ze(0.8, 1.3) * Z,
            0.8,
            0.82,
            0.85,
            0.2,
            P.shade,
            1.3,
            0.5,
            1,
            -1,
          );
          J >= 0 && ((l.fin[J] = 0.12), (l.turb[J] = 0.9));
        }
      else if (P.kind === "smolder")
        for (P.acc += ee * 9 * (1 - P.t / P.ttl); P.acc > 1; ) {
          P.acc -= 1;
          let J = Ze(0.05, 0.11),
            oe = _(
              V + (ht() - 0.5) * 0.5 * Z,
              Y,
              L + (ht() - 0.5) * 0.5 * Z,
              (ht() - 0.5) * 0.6,
              Ze(1.2, 2.4),
              (ht() - 0.5) * 0.6,
              Ze(2.4, 3.8),
              0.5 * Z,
              Ze(1.6, 2.6) * Z,
              J,
              J,
              J,
              0.6,
              P.shade,
              1,
              0.9,
              1,
              -1,
            );
          oe >= 0 && ((l.fin[oe] = 0.12), (l.turb[oe] = 1));
        }
      else if (P.kind === "embers")
        for (P.acc += ee * 8; P.acc > 1; ) {
          P.acc -= 1;
          let J = c.emit(
            V + (ht() - 0.5) * 0.4 * Z,
            Y,
            L + (ht() - 0.5) * 0.4 * Z,
            (ht() - 0.5) * 0.6,
            Ze(0.6, 1.8),
            (ht() - 0.5) * 0.6,
            Ze(1.5, 3.2),
            Ze(0.02, 0.04),
            0.012,
          );
          J >= 0 &&
            ((c.frame[J] = oo),
            (c.ramp[J] = 3),
            (c.r[J] = 10),
            (c.g[J] = 4.2),
            (c.b[J] = 1),
            (c.drag[J] = 0.8),
            (c.grav[J] = -0.5),
            (c.turb[J] = 3.5),
            (c.wind[J] = 1),
            (c.fout[J] = 0.5));
        }
      else if (P.kind === "fire") {
        for (P.acc += ee * 24; P.acc > 1; ) {
          P.acc -= 1;
          let J = c.emit(
            V + (ht() - 0.5) * 0.3 * Z,
            Y + 0.1 * Z,
            L + (ht() - 0.5) * 0.3 * Z,
            (ht() - 0.5) * 0.5,
            Ze(1.2, 2.6) * Z,
            (ht() - 0.5) * 0.5,
            Ze(0.35, 0.65),
            0.45 * Z,
            Ze(0.2, 0.35) * Z,
          );
          J >= 0 &&
            ((c.frame[J] = V1),
            (c.ramp[J] = 2),
            (c.r[J] = 9),
            (c.g[J] = 5.5),
            (c.b[J] = 2.2),
            (c.drag[J] = 1),
            (c.rot[J] = ht() * 6.283),
            (c.rotv[J] = (ht() - 0.5) * 4),
            (c.fin[J] = 0.12),
            (c.fout[J] = 0.4),
            (c.wind[J] = 1),
            (c.turb[J] = 2));
        }
        for (P.acc2 += ee * 4; P.acc2 > 1; ) {
          P.acc2 -= 1;
          let J = Ze(0.05, 0.1),
            oe = _(
              V,
              Y + 0.8 * Z,
              L,
              (ht() - 0.5) * 0.4,
              Ze(1.2, 2),
              (ht() - 0.5) * 0.4,
              Ze(2.2, 3.4),
              0.3 * Z,
              Ze(1.1, 1.8) * Z,
              J,
              J,
              J,
              0.5,
              P.shade,
              0.9,
              0.8,
              1,
              -1,
            );
          oe >= 0 && ((l.fin[oe] = 0.2), (l.turb[oe] = 1));
          let fe = c.emit(
            V + (ht() - 0.5) * 0.3,
            Y + 0.3,
            L + (ht() - 0.5) * 0.3,
            ht() - 0.5,
            Ze(1.5, 3),
            ht() - 0.5,
            Ze(1, 2.2),
            0.03,
            0.012,
          );
          fe >= 0 &&
            ((c.frame[fe] = oo),
            (c.ramp[fe] = 3),
            (c.r[fe] = 10),
            (c.g[fe] = 4.2),
            (c.b[fe] = 1),
            (c.drag[fe] = 0.8),
            (c.grav[fe] = -0.6),
            (c.turb[fe] = 4),
            (c.wind[fe] = 1));
        }
        P.light &&
          (P.light.light.intensity =
            (14 + 6 * Math.sin(P.t * 23) + 4 * Math.sin(P.t * 37.7)) * Z);
      } else if (P.kind === "drip") {
        if (((P.acc += ee * 1.6), P.drop >= 0 && ((P.drop -= ee), P.drop < 0))) {
          let J = P.shade;
          S(V, 0.014, L, 0.8, 0.05, 0.55, 0.4 * J + 0.14, 0.36 * J + 0.16, 0.3 * J + 0.18);
          for (let oe = 0; oe < 3; oe++) {
            ro(Ei, 0.7, qe);
            let fe = c.emit(
              V,
              0.03,
              L,
              qe.x * 1.2,
              Math.abs(qe.y) * 1.6,
              qe.z * 1.2,
              0.35,
              0.012,
              0.008,
            );
            fe >= 0 &&
              ((c.mode[fe] = 1),
              (c.frame[fe] = Gc),
              (c.stretch[fe] = 0.012),
              (c.grav[fe] = 9.81),
              (c.r[fe] = 1.6 * J + 0.3),
              (c.g[fe] = 1.3 * J + 0.4),
              (c.b[fe] = 0.9 * J + 0.5),
              (c.flags[fe] = Xc));
          }
        }
        for (; P.acc > 1; ) {
          P.acc -= 1 + ht() * 0.6;
          let J = Math.sqrt((2 * Math.max(Y, 0.05)) / 9.81),
            oe = c.emit(V, Y, L, 0, -0.2, 0, J + 0.05, 0.014, 0.014);
          oe >= 0 &&
            ((c.mode[oe] = 1),
            (c.frame[oe] = Gc),
            (c.stretch[oe] = 0.02),
            (c.grav[oe] = 9.81),
            (c.r[oe] = 1.4 * P.shade + 0.4),
            (c.g[oe] = 1.2 * P.shade + 0.5),
            (c.b[oe] = 0.9 * P.shade + 0.6),
            (c.flags[oe] = Xc),
            (c.fout[oe] = 0.98)),
            (P.drop = J);
        }
      }
    }
  }
  i.events.on("impact", (ee) => {
    !ee || !ee.point || C(ee.point, ee.normal, ee.surface, ee.dir, ee.enemy);
  });
  let $ = (ee, B) => {
    try {
      return !!(i.ground && i.ground.isPuddle && i.ground.isPuddle(ee, B));
    } catch {
      return !1;
    }
  };
  i.events.on("player:step", (ee) => {
    let B = (ee && ee.pos) || (i.player && i.player.pos);
    B &&
      ((ee && ee.surface === "water") || $(B.x, B.z)) &&
      (Ho.set(B.x, Math.max(0, B.y), B.z), T(Ho, ee && ee.sprint ? 0.55 : 0.4));
  }),
    i.events.on("player:land", (ee) => {
      let B = i.player && i.player.pos;
      if (B) {
        if ((Ho.set(B.x, Math.max(0, B.y), B.z), (ee && ee.surface === "water") || $(B.x, B.z)))
          T(Ho, 0.9);
        else if (ee && ee.speed > 5) {
          let P = m(Ho, Ei);
          for (let V = 0; V < 6; V++) {
            let Y = ht() * 6.283;
            _(
              Ho.x + Math.cos(Y) * 0.2,
              Ho.y + 0.08,
              Ho.z + Math.sin(Y) * 0.2,
              Math.cos(Y) * 1.6,
              0.3,
              Math.sin(Y) * 1.6,
              Ze(0.7, 1.2),
              0.15,
              Ze(0.5, 0.8),
              0.45,
              0.44,
              0.42,
              0.22,
              P,
              3,
              0.1,
              0.8,
              -1,
            );
          }
        }
      }
    });
  function ue(ee) {
    ee > 0 || (ee = 0), (v += ee), re(ee);
    let B = i.camera ? i.camera.position : Es.set(0, 0, 0);
    r.begin(),
      l.update(ee, r, B, t, v),
      r.end(),
      a.begin(),
      c.update(ee, a, B, t, v),
      u.update(ee, a, W1, oo),
      a.end(),
      h.update(ee),
      f.update(ee);
  }
  function me() {
    l.clear(), c.clear(), u.clear(), h.clear(), f.clear(), p.clear();
    for (let ee of ie) ee.active && ee.stop();
    r.begin(), r.end(), a.begin(), a.end();
  }
  return {
    update: ue,
    clear: me,
    muzzleFlash: j,
    tracer: G,
    impact: C,
    sparks: H,
    smoke: O,
    dust: q,
    explosion: K,
    shell: N,
    splash: T,
    addEmitter: ne,
    debris: U,
    decal(ee, B, P = "bullet_concrete", V) {
      Et.copy(B || Ei), p.add(ee, Et, P, V);
    },
    wind: t,
    root: d,
    stats() {
      return { lit: l.n, add: c.n, tracers: u.n, debris: h.live, drawCalls: 5 };
    },
  };
}
function JR(i) {
  let e = i.fx,
    t = i.params.fxshow || "all",
    n = new wt(),
    s = (N, Q, K, ie, F) => {
      let X = new Qe(N, i.mats.get(Q));
      return X.position.set(K, ie, F), (X.castShadow = X.receiveShadow = !0), n.add(X), X;
    };
  s(Wi(2.6, 2.2, 0.3, 0.02), "concrete", -3.2, 1.1, 0),
    s(Wi(2.2, 2, 0.08, 0.01), "paint_blue", 0, 1, 0),
    s(Wi(1.2, 1.2, 1.2, 0.015), "wood_pallet", 3.2, 0.6, 0),
    i.scene.add(n),
    i.physics.addBox([-4.5, 0, -0.15], [-1.9, 2.2, 0.15], { surface: "concrete" }),
    i.physics.addBox([-1.1, 0, -0.04], [1.1, 2, 0.04], { surface: "metal" }),
    i.physics.addBox([2.6, 0, -0.6], [3.8, 1.2, 0.6], { surface: "wood" });
  let o = (N, Q, K) => new W(N, Q, K),
    r = o(-6.5, 1.5, 7),
    a = o(6.5, 1.4, 7),
    l = o(5.2, 1.3, 3.2),
    c = o(-4.6, 1.35, 4.2),
    u = o(0, 0, 0),
    h = o(0, 0, 0),
    f = o(0, 0, 0),
    p = o(0, 1, 0),
    d = {
      point: o(0, 0, 0),
      normal: o(0, 1, 0),
      surface: "concrete",
      dir: o(0, 0, 0),
      enemy: null,
      from: "player",
    },
    v = Math.random,
    g = 0,
    x = 0,
    y = 0,
    b = 0,
    m = 0,
    A = 0.2,
    _ = 0,
    M = 3.4,
    E = !1,
    w = t === "all" || t === "impact",
    S = t === "all" || t === "explosion",
    z = t === "all" || t === "tracer",
    H = t === "explosion" ? 2.4 : 3.5;
  t === "explosion" && (M = 0.6),
    (t === "all" || t === "impact") &&
      (e.addEmitter(o(-6.2, 0.05, -1.5), "steam"),
      e.addEmitter(o(5.6, 0, 1.6), "fire"),
      e.addEmitter(o(0.4, 2.6, 1.6), "drip"));
  function O(N) {
    let Q = y++ % 2 ? a : r;
    if (((d.enemy = null), (d.from = "player"), N === 5)) {
      d.point.set(-1.5 + v() * 0.3, 2.5 + v() * 0.3, 0.8),
        d.normal.copy(Q).sub(d.point).normalize(),
        (d.surface = "enemy"),
        (d.enemy = {}),
        d.dir.copy(d.point).sub(Q).normalize(),
        e.tracer(Q, d.point),
        i.events.emit("impact", d);
      return;
    }
    N === 0
      ? u.set(-3.2 + (v() - 0.5) * 2, 0.4 + v() * 1.5, 0)
      : N === 1 || N === 7
        ? u.set((v() - 0.5) * 1.8, 0.3 + v() * 1.5, 0)
        : N === 2
          ? u.set(3.2 + (v() - 0.5) * 0.9, 0.2 + v() * 0.9, 0.6)
          : N === 3
            ? u.set(-1.6 + (v() - 0.5) * 1.2, 0, 2.2 + v())
            : N === 4
              ? u.set(1.5 + (v() - 0.5) * 0.8, 0, 2.6 + v() * 0.8)
              : u.set(3.4 + (v() - 0.5), 0, 2.4 + v() * 0.6),
      h.copy(u).sub(Q).normalize();
    let K = i.physics.raycast(Q, h, 100);
    K &&
      (d.point.copy(K.point),
      d.normal.copy(K.normal),
      d.dir.copy(h),
      (d.surface = N === 4 ? "water" : N === 6 ? "dirt" : K.surface),
      e.tracer(Q, d.point),
      i.events.emit("impact", d));
  }
  let q = i.params.fxhold,
    U = o(0, 1.3, 3),
    T = o(1, 0, 0);
  function D(N) {
    if (
      ((g += N),
      q === "muzzle" &&
        (e.muzzleFlash(U, T, { scale: 1 }),
        (U.x = 2.5),
        T.set(-0.5, 0, 0.86),
        e.muzzleFlash(U, T, { scale: 1.6 }),
        (U.x = 0),
        T.set(1, 0, 0)),
      w)
    )
      for (m -= N; m <= 0; ) (m += t === "impact" ? 0.09 : 0.13), O(x++ % 8);
    if (
      (z &&
        ((A -= N),
        A <= 0 &&
          ((A += t === "tracer" ? 0.16 : 0.45),
          f.set(-5 + v() * 3, 1.2 + v() * 0.8, 6 + v() * 2),
          h.copy(f).sub(l).normalize(),
          e.muzzleFlash(l, h, { scale: 1 }),
          e.tracer(l, f, { color: 16730658, speed: 120 }),
          t === "tracer" &&
            (f.set(6, 1 + v() * 1.5, -6 - v() * 6),
            u.set(-7, 1.6, 6.5),
            e.tracer(u, f, { speed: 200 }))),
        (_ -= N),
        _ <= 0 &&
          ((_ += 0.22),
          f.set(1.6 + v() * 0.8, 1.6 + v() * 0.8, 0.4 + (v() - 0.5) * 0.8),
          e.shell(c, f))),
      S && ((M -= N), M <= 0))
    ) {
      M += H;
      let Q = +(i.params.fxsize || 0) || 1 + (b++ % 3);
      f.set(t === "explosion" ? 0 : 7, 0.25, t === "explosion" ? 3.5 : -3.5), e.explosion(f, Q);
    }
  }
  let C = !1,
    G = e.update;
  e.update = (N) => {
    C || G(N);
  };
  let j = window.__setShot;
  return (
    j &&
      (window.__setShot = (N) => {
        if (N && N.fxage !== void 0) {
          e.clear(), f.set(0, 0.25, 3.5), e.explosion(f, +(N.fxsize || 1.2));
          let Q = +N.fxage;
          for (let K = 0; K < Q - 1e-6; K += 1 / 60) G(1 / 60);
          G(0), (C = !0);
        }
        j(N);
      }),
    {
      cam: t === "explosion" ? [0, 2, 12.5] : [0.3, 1.6, 7.2],
      target: t === "explosion" ? [0, 2.2, 3.5] : [0.2, 1, 0],
      update(N) {
        if (!E) {
          E = !0;
          let Q = +(i.params.fxt || 0);
          for (let K = 0; K < Q; K += 1 / 30) D(1 / 30), e.update(1 / 30);
        }
        C || D(N);
      },
    }
  );
}
var h_ = {
    KeyW: "forward",
    KeyS: "back",
    KeyA: "left",
    KeyD: "right",
    Space: "jump",
    ShiftLeft: "sprint",
    ShiftRight: "sprint",
    KeyC: "crouch",
    ControlLeft: "crouch",
    ControlRight: "crouch",
    KeyR: "reload",
    Digit1: "wep1",
    Digit2: "wep2",
    KeyE: "interact",
    KeyF: "melee",
    KeyV: "melee",
    Escape: "pause",
    KeyP: "pause",
    KeyQ: "alt",
    Enter: "fire",
    NumpadEnter: "fire",
    ArrowLeft: "turnL",
    ArrowRight: "turnR",
    ArrowUp: "turnU",
    ArrowDown: "turnD",
    KeyJ: "turnL",
    KeyL: "turnR",
    KeyI: "turnU",
    KeyK: "turnD",
  },
  f_ = 0.0021,
  d_ = 0.0052,
  p_ = 2.1,
  m_ = 3,
  If = 58,
  g_ = { pause: 1 };
var Mt = {
    walk: 3.8,
    sprint: 6.4,
    crouch: 1.9,
    ads: 2.4,
    accelGround: 34,
    decelGround: 26,
    accelAir: 9,
    gravity: 21,
    jumpApex: 1,
    coyote: 0.12,
    jumpBuffer: 0.13,
    standHeight: Pi.height,
    crouchHeight: 1.15,
    eyeRate: 11,
    stride: { walk: 1.55, sprint: 2.1, crouch: 1.05 },
    bobY: 0.024,
    bobX: 0.013,
    bobSprint: 1.9,
    bobAds: 0.22,
    rollStrafe: 0.02,
    landDip: 0.36,
    landDipMax: 0.2,
    fovSprint: 6,
    fovAds: 52,
    adsLook: 0.6,
    regenDelay: 4,
    regenRate: 25,
    recoilKeep: 0.35,
    recoilApply: 34,
    recoilRecover: 6.5,
    recoilHold: 0.09,
    shakeDecay: 1.7,
    shakePitch: 0.03,
    shakeYaw: 0.03,
    shakeRoll: 0.045,
    pitchLimit: 1.5,
  },
  rC = Math.sqrt(2 * Mt.gravity * Mt.jumpApex);
function x_(i) {
  let e = i.camera,
    t = () => (i.render && i.render.post) || n,
    n = {},
    s = Pi.eye,
    o = Mt.standHeight,
    r = 0,
    a = 0,
    l = !0,
    c = 0,
    u = 0,
    h = 0,
    f = 0,
    p = 0,
    d = 0,
    v = 0,
    g = { x: 0, v: 0 },
    x = 0,
    y = 0,
    b = 0,
    m = 0,
    A = 0,
    _ = 0,
    M = 0,
    E = 99,
    w = 0,
    S = 0,
    z = 0,
    H = Pi.fov,
    O = 0,
    q = "concrete",
    U = new W(),
    T = new In(0, 0, 0, "YXZ"),
    D = new W(),
    C = {
      pos: new W(),
      eye: new W(),
      vel: new W(),
      forward: new W(0, 0, -1),
      yaw: 0,
      pitch: 0,
      health: 100,
      maxHealth: 100,
      alive: !0,
      onGround: !0,
      sprinting: !1,
      crouching: !1,
      ads: 0,
      speed: 0,
      enabled: !0,
      invulnerable: !1,
      baseFov: Pi.fov,
      hurtPulse: 0,
      lookScale: 1,
      lastSafe: D,
      tuning: Mt,
      reset(F) {
        let X = F || (i.level && i.level.playerStart) || { pos: new W(), yaw: 0 };
        C.pos.copy(X.pos),
          (C.yaw = X.yaw || 0),
          (C.pitch = 0),
          C.vel.set(0, 0, 0),
          (C.health = C.maxHealth),
          (C.alive = !0),
          (C.onGround = !0),
          (C.sprinting = !1),
          (C.crouching = !1),
          (C.invulnerable = !1),
          (C.speed = 0),
          (s = Pi.eye),
          (o = Mt.standHeight),
          (r = 0),
          (a = 0),
          (l = !0),
          (c = 0),
          (u = 0),
          (h = 0),
          (f = 0),
          (p = d = 0),
          (v = 0),
          (g.x = g.v = 0),
          (x = y = b = m = 0),
          (A = 0),
          (_ = 0),
          (E = 99),
          (w = 0),
          (S = 0),
          (z = 0),
          (C.hurtPulse = 0),
          D.copy(C.pos);
        let ne = t();
        (ne.damage = 0), (ne.lowHealth = 0), (ne.ads = 0), K(0);
      },
      damage(F, X) {
        !C.alive ||
          C.invulnerable ||
          !(F > 0) ||
          ((C.health = Math.max(0, C.health - F)),
          (E = 0),
          (w = Math.min(1, w + 0.35 + F / 40)),
          C.addShake(0.22 + F / 70),
          i.events.emit("player:hit", { amount: F, fromPos: X }),
          C.health <= 0 &&
            ((C.alive = !1), (z = 0), (C.sprinting = !1), i.events.emit("player:dead", {})));
      },
      heal(F) {
        C.alive && (C.health = Math.min(C.maxHealth, C.health + F));
      },
      addRecoil(F = 0, X = 0) {
        let ne = Mt.recoilKeep;
        (C.pitch = Zn(C.pitch + F * ne, -Mt.pitchLimit, Mt.pitchLimit)),
          (C.yaw += X * ne),
          (x += F * (1 - ne)),
          (y += X * (1 - ne)),
          (x = Zn(x, -0.3, 0.3)),
          (y = Zn(y, -0.2, 0.2)),
          (A = Mt.recoilHold);
      },
      addShake(F = 0.3) {
        _ = Math.min(1, _ + F);
      },
      setFov(F) {
        C.baseFov = Zn(+F || Pi.fov, 55, 100);
      },
      update: N,
    };
  i.events.on("explosion", (F) => {
    if (!F || !F.pos) return;
    let X = C.eye.distanceTo(F.pos),
      ne = F.size || 1,
      re = Fo(1 - X / (14 + ne * 10)) * (0.35 + 0.35 * ne);
    re > 0.01 && C.addShake(re);
  });
  function G() {
    let F = i.physics && i.physics.boxes;
    if (!F) return !0;
    let X = Pi.radius * 0.9,
      ne = C.pos.y + Mt.crouchHeight - 0.05,
      re = C.pos.y + Mt.standHeight;
    for (let $ = 0; $ < F.length; $++) {
      let ue = F[$];
      if (
        !ue.bulletOnly &&
        !(
          C.pos.x + X < ue.min.x ||
          C.pos.x - X > ue.max.x ||
          C.pos.z + X < ue.min.z ||
          C.pos.z - X > ue.max.z
        ) &&
        ue.min.y < re &&
        ue.max.y > ne
      )
        return !1;
    }
    return !0;
  }
  function j() {
    let F = C.pos.x,
      X = C.pos.z;
    try {
      if (i.ground && i.ground.isPuddle && C.pos.y < 0.05 && i.ground.isPuddle(F, X))
        return "water";
    } catch {}
    if (q && q !== "concrete") return q;
    try {
      return (
        (i.level && i.level.groundSurfaceAt && i.level.groundSurfaceAt(F, X)) || q || "concrete"
      );
    } catch {
      return q || "concrete";
    }
  }
  function N(F) {
    let X = i.input,
      ne = i.weapon || {};
    if (
      (ne.stub || typeof ne.ads != "number"
        ? ((O = kn(O, C.enabled && X.ads ? 1 : 0, 14, F)), (C.ads = O))
        : (C.ads = Fo(ne.ads)),
      !C.alive)
    ) {
      (z += F), Q(F), K(F), ie(F);
      return;
    }
    let re = C.enabled;
    (C.lookScale = bi(1, Mt.adsLook, C.ads)),
      re &&
        ((C.yaw -= X.look.dx * C.lookScale),
        (C.pitch = Zn(C.pitch - X.look.dy * C.lookScale, -Mt.pitchLimit, Mt.pitchLimit)),
        (C.yaw > Math.PI * 4 || C.yaw < -Math.PI * 4) && (C.yaw = C.yaw % (Math.PI * 2))),
      re && X.crouch ? (C.crouching = !0) : C.crouching && G() && (C.crouching = !1),
      (o = C.crouching ? Mt.crouchHeight : Mt.standHeight);
    let ue = re ? X.move.x : 0,
      me = re ? X.move.y : 0,
      ee = ue * ue + me * me > 0.01,
      B =
        re &&
        X.sprint &&
        me > 0.55 &&
        Math.abs(ue) < 0.6 &&
        !C.crouching &&
        C.ads < 0.35 &&
        !X.fire;
    C.sprinting =
      (B && C.onGround && C.speed > Mt.walk * 0.6) || (B && !C.onGround && C.sprinting);
    let P = Mt.walk;
    C.crouching ? (P = Mt.crouch) : B && (P = Mt.sprint),
      (P = bi(P, Math.min(P, Mt.ads), C.ads)),
      me < 0 && (P *= bi(1, 0.82, -me));
    let V = Math.sin(C.yaw),
      Y = Math.cos(C.yaw);
    U.set(ue * Y - me * V, 0, -ue * V - me * Y).multiplyScalar(P);
    let L = C.onGround ? (ee ? Mt.accelGround : Mt.decelGround) : ee ? Mt.accelAir : 0.6,
      Z = U.x - C.vel.x,
      J = U.z - C.vel.z;
    !C.onGround && !ee && ((Z = -C.vel.x), (J = -C.vel.z));
    let oe = Math.hypot(Z, J),
      fe = L * F;
    oe <= fe || oe < 1e-6
      ? (C.onGround || ee) && ((C.vel.x = U.x), (C.vel.z = U.z))
      : ((C.vel.x += (Z / oe) * fe), (C.vel.z += (J / oe) * fe)),
      (r = C.onGround ? Mt.coyote : Math.max(0, r - F)),
      (a = re && X.pressed("jump") ? Mt.jumpBuffer : Math.max(0, a - F)),
      a > 0 &&
        r > 0 &&
        (!C.crouching || G()) &&
        ((C.vel.y = rC),
        (a = 0),
        (r = 0),
        (C.onGround = !1),
        (C.crouching = !1),
        (o = Mt.standHeight),
        i.events.emit("player:jump", { pos: C.pos })),
      (C.vel.y -= Mt.gravity * F * 0.5),
      C.vel.y < -40 && (C.vel.y = -40);
    let le = C.vel.y,
      R = i.physics.moveCapsule(C.pos, C.vel, F, Pi.radius, o, l) || {};
    R.onGround || (C.vel.y -= Mt.gravity * F * 0.5);
    let I = i.physics.bounds;
    if (
      (I &&
        ((C.pos.x = Zn(C.pos.x, I.min.x + 0.4, I.max.x - 0.4)),
        (C.pos.z = Zn(C.pos.z, I.min.z + 0.4, I.max.z - 0.4))),
      (C.onGround = !!R.onGround),
      R.surface && (q = R.surface),
      C.onGround)
    ) {
      if (!l && c > 0.12) {
        let ce = Math.max(0, -le, u);
        (g.v -= Math.min(ce * Mt.landDip, 3.2)),
          ce > 7.5 && C.addShake(Math.min(0.5, (ce - 7.5) * 0.06)),
          i.events.emit("player:land", { speed: ce, surface: j(), pos: C.pos }),
          ce > 13 && C.damage((ce - 13) * 7, null),
          (h = 0.35);
      }
      (c = 0), (u = 0), C.pos.x <= oi.quayX - 1.2 && C.pos.y > -0.5 && D.copy(C.pos);
    } else (c += F), (u = Math.max(u, -C.vel.y));
    (l = C.onGround),
      C.pos.y < oi.seaY - 2.2 &&
        (C.pos.copy(D),
        C.vel.set(0, 0, 0),
        (C.onGround = !0),
        (l = !0),
        (_ = 0.6),
        (C.yaw += Math.PI),
        C.damage(12, null),
        i.events.emit("player:rescued", {})),
      (C.speed = Math.hypot(C.vel.x, C.vel.z));
    let se = C.crouching ? Mt.stride.crouch : C.sprinting ? Mt.stride.sprint : Mt.stride.walk;
    if (C.onGround && C.speed > 0.5) {
      let ce = h;
      (h += (C.speed * F) / se),
        Math.floor(h) > Math.floor(ce) &&
          i.events.emit("player:step", { surface: j(), sprint: C.sprinting, pos: C.pos });
    } else C.onGround && (h = kn(h, Math.round(h), 8, F));
    let ae = C.onGround
      ? Fo(C.speed / Mt.walk) *
        (C.sprinting ? Mt.bobSprint : 1) *
        bi(1, Mt.bobAds, C.ads) *
        (C.crouching ? 0.7 : 1)
      : 0;
    (f = kn(f, ae, 9, F)),
      (d = -Math.cos(h * Math.PI * 2) * Mt.bobY * f),
      (p = Math.sin(h * Math.PI) * Mt.bobX * f);
    let k = C.vel.x * Y - C.vel.z * V;
    (v = kn(v, (-k / Mt.sprint) * Mt.rollStrafe * bi(1, 0.4, C.ads), 8, F)),
      (E += F),
      E > Mt.regenDelay &&
        C.health < C.maxHealth &&
        (C.health = Math.min(C.maxHealth, C.health + Mt.regenRate * F)),
      K(F),
      ie(F);
  }
  function Q(F) {
    (C.vel.x = kn(C.vel.x, 0, 5, F)),
      (C.vel.z = kn(C.vel.z, 0, 5, F)),
      (C.vel.y -= Mt.gravity * F);
    try {
      let X = i.physics.moveCapsule(C.pos, C.vel, F, Pi.radius, 0.6, l);
      l = !!(X && X.onGround);
    } catch {}
    C.pos.y < oi.seaY - 1 && ((C.pos.y = oi.seaY - 1), (C.vel.y = 0)),
      (C.speed = 0),
      (C.sprinting = !1),
      (f = kn(f, 0, 10, F)),
      (p *= 0.9),
      (d *= 0.9);
  }
  function K(F) {
    let X = C.crouching ? Pi.crouchEye : Pi.eye,
      ne = 0,
      re = 0;
    if (C.alive) F > 0 ? (s = kn(s, X, Mt.eyeRate, F)) : (s = X);
    else {
      let Z = sl(0, 0.85, z),
        J = Z * Z;
      (X = bi(Pi.eye, 0.22, J)),
        (s = kn(s, X, 18, F)),
        (ne = 1.15 * J),
        (re = -0.25 * Z + 0.12 * Math.sin(Z * Math.PI));
    }
    if (F > 0) {
      let Z = -g.x * 150 - g.v * 17;
      (g.v += Z * F),
        (g.x += g.v * F),
        (g.x = Zn(g.x, -Mt.landDipMax, 0.05)),
        (A -= F),
        A <= 0 && ((x = kn(x, 0, Mt.recoilRecover, F)), (y = kn(y, 0, Mt.recoilRecover, F))),
        (b = kn(b, x, Mt.recoilApply, F)),
        (m = kn(m, y, Mt.recoilApply, F)),
        (_ = Math.max(0, _ - Mt.shakeDecay * F)),
        (M += F);
    }
    let $ = Math.sin(C.yaw),
      ue = Math.cos(C.yaw);
    C.eye.set(C.pos.x + p * ue, C.pos.y + s + d + g.x, C.pos.z - p * $);
    let me = Zn(C.pitch + b, -1.55, 1.55),
      ee = C.yaw + m;
    T.set(me, ee, 0, "YXZ"), C.forward.set(0, 0, -1).applyEuler(T);
    let B = _ * _,
      P = M,
      V = B * Mt.shakePitch * (Math.sin(P * 43.1) + 0.6 * Math.sin(P * 71.7 + 1.3)),
      Y = B * Mt.shakeYaw * (Math.sin(P * 37.3 + 2.1) + 0.6 * Math.sin(P * 83.9)),
      L = B * Mt.shakeRoll * (Math.sin(P * 29.7 + 0.7) + 0.5 * Math.sin(P * 61.3 + 4));
    if (
      (e.position.copy(C.eye),
      e.rotation.set(me + V + re + g.x * 0.12, ee + Y, v + L + ne + p * 0.35, "YXZ"),
      !i.params || !i.params.fov)
    ) {
      let Z = bi(C.baseFov + (C.sprinting ? Mt.fovSprint : 0), Mt.fovAds, C.ads);
      (H = F > 0 ? kn(H, Z, C.ads > 0.02 && C.ads < 0.98 ? 30 : 7, F) : Z),
        Math.abs(e.fov - H) > 0.01 && ((e.fov = H), e.updateProjectionMatrix());
    }
  }
  function ie(F) {
    (w = Math.max(0, w - F * 1.9)), (C.hurtPulse = w);
    let X = C.alive ? sl(0.55, 0.12, C.health / C.maxHealth) : 1;
    S = kn(S, X, 4, F);
    let ne = t();
    (ne.damage = w), (ne.lowHealth = S), (ne.ads = C.ads);
  }
  return C;
}
function zv(i) {
  let e = { shots: 0, hits: 0, kills: 0 },
    A = [],
    C = new W(),
    U = new W();
  function AOE(n, s = 5, o = 80, r = "player") {
    for (let l of i.enemies.list) {
      if (!l.alive) continue;
      let c = l.pos.distanceTo(n);
      c < s &&
        i.physics.lineOfSight(n, nm.copy(l.pos).setY(l.pos.y + 0.5)) &&
        l.damage(o * (1 - c / s), l.pos, zf.copy(l.pos).sub(n).normalize(), "body");
    }
    let a = i.player;
    if (a && a.alive) {
      let l = nm
        .copy(a.pos)
        .setY(a.pos.y + 1)
        .distanceTo(n);
      l < s &&
        i.physics.lineOfSight(n, nm.copy(a.pos).setY(a.pos.y + 1)) &&
        a.damage(o * 0.5 * (1 - l / s), n);
    }
  }
  function boom(p, n) {
    try {
      AOE(n, p.radius, p.damage, p.source);
    } catch {}
    try {
      i.fx && i.fx.explosion && i.fx.explosion(n, p.radius);
    } catch {}
    if (p.mesh) {
      i.scene.remove(p.mesh);
      try {
        p.mesh.geometry && p.mesh.geometry.dispose(),
          p.mesh.material && p.mesh.material.dispose();
      } catch {}
    }
  }
  return (
    i.events.on("enemy:killed", () => {
      e.kills++;
    }),
    {
      stats: e,
      reset() {
        e.shots = e.hits = e.kills = 0;
        for (let p of A)
          p.mesh &&
            (i.scene.remove(p.mesh),
            (() => {
              try {
                p.mesh.geometry && p.mesh.geometry.dispose(),
                  p.mesh.material && p.mesh.material.dispose();
              } catch {}
            })());
        A.length = 0;
      },
      playerShot(n, s, { damage: o = 28, range: r = 300, impulse: a = 1 } = {}) {
        e.shots++;
        let l = i.physics.raycast(n, s, r),
          c = i.enemies.raycast(n, s, l ? l.dist : r);
        if (c) {
          e.hits++;
          let u = c.part === "weak" ? 2.2 : 1,
            h = c.enemy.damage(o * u, c.point, s, c.part) === !0,
            f = {
              point: c.point,
              normal: c.normal || s.clone().negate(),
              dist: c.dist,
              surface: "enemy",
              enemy: c.enemy,
              part: c.part,
              dir: s,
              from: "player",
              killed: h,
            };
          return (
            i.events.emit("impact", f),
            i.events.emit("player:hitEnemy", {
              enemy: c.enemy,
              part: c.part,
              killed: h,
              weak: c.part === "weak",
            }),
            f
          );
        }
        if (l) {
          let u = {
            point: l.point,
            normal: l.normal,
            dist: l.dist,
            surface: l.surface,
            enemy: null,
            dir: s,
            from: "player",
          };
          return i.events.emit("impact", u), u;
        }
        return null;
      },
      enemyShot(n, s, { damage: o = 6, range: r = 200 } = {}) {
        let a = i.physics.raycast(n, s, r),
          l = a ? a.dist : r,
          c = i.player;
        if (c && c.alive) {
          let u = nm.copy(c.pos);
          u.y += 1;
          let h = u.sub(n).dot(s);
          if (h > 0 && h < l) {
            zf.copy(n).addScaledVector(s, h);
            let f = Math.abs(zf.y - (c.pos.y + 0.95));
            if (Math.hypot(zf.x - c.pos.x, zf.z - c.pos.z) < 0.38 && f < 0.95)
              return c.damage(o, n), !0;
          }
        }
        return (
          a &&
            i.events.emit("impact", {
              point: a.point,
              normal: a.normal,
              dist: a.dist,
              surface: a.surface,
              enemy: null,
              dir: s,
              from: "enemy",
            }),
          !1
        );
      },
      explode: AOE,
      spawnProjectile({ from, dir, speed = 40, damage = 80, radius = 5, source = "player", tracking = null, life = 6 } = {}) {
        let p = {
          pos: new W().copy(from),
          dir: new W().copy(dir).normalize(),
          speed,
          damage,
          radius,
          source,
          tracking,
          life,
          age: 0,
          mesh: null,
        };
        try {
          let color = source === "enemy" ? 16733503 : 16762951,
            geo = source === "enemy" ? new ls(0.15, 8, 8) : new Ua(0.09, 0.5, 8),
            mat =
              i.mats && i.mats.emissive
                ? i.mats.emissive(color, 3.4)
                : new Nn({ color: new Ve(color) }),
            mesh = new Qe(geo, mat);
          (mesh.position.copy(p.pos),
          (mesh.castShadow = !1),
          (mesh.receiveShadow = !1),
          (mesh.frustumCulled = !1),
          (mesh.userData.projectile = !0),
          source === "player" && mesh.quaternion.setFromUnitVectors(new W(0, 1, 0), p.dir),
          i.scene.add(mesh)),
            (p.mesh = mesh);
        } catch {}
        return A.push(p), p;
      },
      update(dt) {
        if (!A.length) return;
        for (let k = A.length - 1; k >= 0; k--) {
          let p = A[k];
          p.age += dt;
          if (p.tracking && p.tracking.pos && (p.tracking.alive === void 0 || p.tracking.alive)) {
            C.copy(p.tracking.pos).setY(p.tracking.pos.y + 0.5).sub(p.pos).normalize();
            p.dir.lerp(C, Math.min(1, 3.4 * dt)).normalize();
          }
          p.pos.addScaledVector(p.dir, p.speed * dt);
          p.mesh &&
            (p.mesh.position.copy(p.pos),
            p.mesh.quaternion.setFromUnitVectors(U.set(0, 1, 0), p.dir));
          let hit = null;
          try {
            hit = i.physics.raycast(p.pos, p.dir, p.speed * dt + 0.25);
          } catch {}
          if (hit) {
            boom(p, hit.point);
            A.splice(k, 1);
            continue;
          }
          if (p.source === "player") {
            let en = null;
            try {
              en = i.enemies.raycast(p.pos, p.dir, p.speed * dt + p.radius);
            } catch {}
            if (en && en.enemy && en.enemy.alive) {
              boom(p, en.point || p.pos);
              A.splice(k, 1);
              continue;
            }
          } else if (i.player && i.player.alive) {
            C.copy(i.player.pos).setY(i.player.pos.y + 1);
            if (C.distanceTo(p.pos) < p.radius + 0.5) {
              boom(p, p.pos);
              A.splice(k, 1);
              continue;
            }
          }
          p.age >= p.life && (boom(p, p.pos), A.splice(k, 1));
        }
      },
    }
  );
}
var nm = new W(),
  zf = new W();
var Xv = {};
br(Xv, { create: () => dm, showcase: () => PC });
var im = (i, e, t) => {
    let n = Math.sin(i * 12.9898 + e * 78.233 + t * 37.719) * 43758.5453;
    return n - Math.floor(n);
  },
  cC = (i, e, t) => Math.max(Math.abs(i), Math.abs(e), Math.abs(t)) < 0.95,
  b_ = (i, e, t) => {
    let n = Math.abs(t);
    return n > 0.15 && n < 0.95;
  };
function sm(i, e, t = 0, n = null) {
  let s = i.attributes.position,
    o = i.attributes.normal,
    r = s.count,
    a = new Float32Array(r * 3);
  for (let l = 0; l < r; l++) {
    let c = s.getX(l),
      u = s.getY(l),
      h = s.getZ(l),
      f = 0.9 + 0.2 * im(Math.round(c * 70), Math.round(u * 70), Math.round(h * 70));
    if (t > 0 && n && n(o.getX(l), o.getY(l), o.getZ(l))) {
      let p = im(Math.round(c * 300), Math.round(u * 300), Math.round(h * 300));
      {
        let d = Math.max(0, p - 0.84) / 0.16;
        f *= 1 + t * 1.6 * d * d;
      }
    }
    (a[l * 3] = e[0] * f), (a[l * 3 + 1] = e[1] * f), (a[l * 3 + 2] = e[2] * f);
  }
  return i.setAttribute("color", new et(a, 3)), i;
}
var y_ = new In(),
  uC = new Ye();
function Rt(i, e, t, n, s, o, r, a, l = 0, c = null) {
  let u = Wi(i, e, t, n);
  return (
    sm(u, a, l, cC),
    c && (y_.set(c[0], c[1], c[2]), u.applyMatrix4(uC.makeRotationFromEuler(y_))),
    u.translate(s, o, -r),
    u
  );
}
function hC(i, e) {
  let t = new ji();
  if ((i.forEach((n, s) => (s ? t.lineTo(n[0], n[1]) : t.moveTo(n[0], n[1]))), t.closePath(), e))
    for (let n of e) t.holes.push(new or(n.map((s) => new Ae(s[0], s[1]))));
  return t;
}
function __(i, e, t, n) {
  return new rr(hC(i, n), {
    depth: Math.max(1e-4, e - 2 * t),
    bevelEnabled: t > 0,
    bevelThickness: t,
    bevelSize: t,
    bevelOffset: -t,
    bevelSegments: 1,
    steps: 1,
    curveSegments: 6,
  });
}
function M_(i) {
  i.computeBoundingBox();
  let e = i.boundingBox.min.z,
    t = i.boundingBox.max.z,
    n = i.attributes.position,
    s = i.attributes.normal;
  for (let o = 0; o < n.count; o++) {
    let r = s.getZ(o),
      a = Math.abs(r);
    if (a < 0.15 || a > 0.95) continue;
    let l = n.getZ(o);
    if (Math.abs(l - e) < 1e-6 || Math.abs(l - t) < 1e-6) s.setXYZ(o, 0, 0, Math.sign(r));
    else {
      let c = Math.hypot(s.getX(o), s.getY(o)) || 1;
      s.setXYZ(o, s.getX(o) / c, s.getY(o) / c, 0);
    }
  }
  return i;
}
function xr(i, e, t, n, s, o = 0, r = null) {
  let a = __(i, t - e, n, r);
  return sm(a, s, o, b_), M_(a), a.translate(0, 0, e + n), a.rotateY(Math.PI / 2), a;
}
function qo(i, e, t, n, s, o = 0, r = null) {
  let a = __(i, t - e, n, r);
  return sm(a, s, o, b_), M_(a), a.translate(0, 0, -t + n), a;
}
function Cn(i, e, t, n = 0, s = 0, o = 0, r = null) {
  let a = [],
    l = [],
    c = [],
    u = [],
    h = 0;
  for (let p = 0; p < i.length - 1; p++) {
    let [d, v] = i[p],
      [g, x] = i[p + 1],
      y = g - d,
      b = x - v,
      m = Math.hypot(y, b);
    if (m < 1e-7) continue;
    let A = b / m,
      _ = -y / m,
      M = Math.abs(A) > 0.25 && Math.abs(_) > 0.25;
    for (let E = 0; E <= e; E++) {
      let w = (E / e) * Math.PI * 2,
        S = Math.cos(w),
        z = Math.sin(w);
      for (let H = 0; H < 2; H++) {
        let O = H ? g : d,
          q = H ? x : v,
          U = s + O * S,
          T = o + O * z,
          D = -q;
        a.push(U, T, D), l.push(A * S, A * z, -_);
        let C = 0.9 + 0.2 * im(Math.round(q * 150), Math.round(w * 3), p);
        if (M && n > 0) {
          let j = im(E * 7.1, p * 3.3, q * 100);
          {
            let N = Math.max(0, j - 0.84) / 0.16;
            C *= 1 + n * 1.6 * N * N;
          }
        }
        let G = r ? r(O, q, t) : t;
        c.push(G[0] * C, G[1] * C, G[2] * C);
      }
    }
    for (let E = 0; E < e; E++) {
      let w = h + E * 2,
        S = w + 2,
        z = w + 1,
        H = w + 3;
      u.push(w, z, S, S, z, H);
    }
    h += (e + 1) * 2;
  }
  let f = new nt();
  return (
    f.setAttribute("position", new He(a, 3)),
    f.setAttribute("normal", new He(l, 3)),
    f.setAttribute("color", new He(c, 3)),
    f.setAttribute("uv", new He(new Float32Array((a.length / 3) * 2), 2)),
    f.setIndex(u),
    f
  );
}
function Fi(i, e, t, n, s, o, r = 12, a = 0) {
  let l = Math.min(i * 0.25, e * 0.25),
    c = e / 2,
    u = Cn(
      [
        [0, -c],
        [i - l, -c],
        [i, -c + l],
        [i, c - l],
        [i - l, c],
        [0, c],
      ],
      r,
      o,
      a,
    );
  return u.rotateY(Math.PI / 2), u.translate(t, n, -s), u;
}
function Dv(i, e, t, n, s = 4) {
  let o = [],
    r = n / 2,
    a = t / 2 - r;
  for (let l = 0; l <= s; l++) {
    let c = -Math.PI / 2 + (l / s) * Math.PI;
    o.push([i + a + Math.cos(c) * r, e + Math.sin(c) * r]);
  }
  for (let l = 0; l <= s; l++) {
    let c = Math.PI / 2 + (l / s) * Math.PI;
    o.push([i - a + Math.cos(c) * r, e + Math.sin(c) * r]);
  }
  return o;
}
var fC = (i, e, t, n, s) => [
    [i + s, e],
    [t - s, e],
    [t, e + s],
    [t, n - s],
    [t - s, n],
    [i + s, n],
    [i, n - s],
    [i, e + s],
  ],
  mi = {
    name: "玄鲸九式突击步枪",
    muzzle: [0, 0, -0.531],
    eject: [0.023, 0.004, -0.028],
    sightY: 0.069,
    lensF: 0.0285,
    window: [
      [-0.016, 0.057],
      [0.016, 0.057],
      [0.016, 0.0772],
      [0.0122, 0.081],
      [-0.0122, 0.081],
      [-0.016, 0.0772],
    ],
    magPos: [0, -0.02, -0.0665],
    boltTravel: 0.062,
    railTop: 0.0435,
    grip: [0, -0.1, 0.073],
    handguard: [0, 0, -0.255],
    handguardR: 0.021,
    handlePos: [-0.026, 0.007, -0.078],
    squeeze: 0.86,
  };
function w_() {
  let i = [1, 1, 1],
    e = [1, 1, 1],
    t = [5.5, 5.5, 5.7],
    n = [0.4, 0.4, 0.42],
    s = [1, 1, 1],
    o = [0.022, 0.022, 0.023],
    r = [],
    a = [],
    l = [],
    c = [],
    u = [],
    h = [],
    f = [],
    p = 9,
    d = 5,
    v = 0.6,
    g = [
      [-0.1, -0.02],
      [0.1, -0.02],
      [0.1, 0.027],
      [0.093, 0.034],
      [-0.088, 0.034],
      [-0.1, 0.024],
    ];
  r.push(xr(g, 0, 0.0205, 0.0014, i, p, [fC(-0.012, -0.01, 0.06, 0.012, 0.003)])),
    r.push(xr(g, -0.0205, 0, 0.0014, i, p, [Dv(0.032, 0.007, 0.112, 0.0075, 4)])),
    a.push(Rt(0.004, 0.036, 0.19, 5e-4, -0.0135, 0.006, 0, n)),
    a.push(Rt(0.004, 0.012, 0.19, 5e-4, 0.0145, 0.022, 0, n)),
    a.push(Rt(0.004, 0.008, 0.19, 5e-4, 0.0145, -0.014, 0, n)),
    a.push(
      Cn(
        [
          [0, 0.058],
          [0.0128, 0.058],
          [0.0128, 0.099],
          [0, 0.099],
        ],
        16,
        [0.8, 0.8, 0.82],
      ),
    ),
    r.push(Rt(0.009, 0.02, 0.018, 0.003, 0.0225, 0.004, -0.026, i, p, [0, -0.35, 0])),
    r.push(
      Cn(
        [
          [0, -0.086],
          [0.0062, -0.086],
          [0.0072, -0.084],
          [0.0072, -0.06],
          [0.0045, -0.057],
          [0, -0.057],
        ],
        12,
        i,
        p,
        0.0215,
        0.012,
      ),
    ),
    a.push(
      Cn(
        [
          [0, -0.094],
          [0.0048, -0.094],
          [0.0055, -0.092],
          [0.0055, -0.086],
          [0, -0.086],
        ],
        12,
        t,
        0,
        0.0215,
        0.012,
      ),
    ),
    r.push(Rt(0.004, 0.012, 0.05, 0.0015, -0.0212, -0.006, -0.055, i, p)),
    r.push(Rt(0.004, 0.006, 0.15, 0.0015, -0.0212, 0.0215, 0.012, i, p)),
    r.push(Rt(0.003, 0.01, 0.03, 0.001, 0.0212, 0.022, 0.075, i, p)),
    r.push(
      qo(
        [
          [-0.0078, 0.0335],
          [0.0078, 0.0335],
          [0.0106, 0.0402],
          [-0.0106, 0.0402],
        ],
        -0.096,
        0.397,
        5e-4,
        i,
        0,
      ),
    );
  let x = [
    [-0.0102, 0.0398],
    [0.0102, 0.0398],
    [0.0106, 0.0408],
    [0.0084, 0.0435],
    [-0.0084, 0.0435],
    [-0.0106, 0.0408],
  ];
  for (let F = 0; F < 49; F++) {
    let X = -0.094 + F * 0.01;
    r.push(qo(x, X, X + 0.0048, 8e-4, i, p));
  }
  let y = [
    [-0.1, -0.021],
    [0.099, -0.021],
    [0.101, -0.03],
    [0.098, -0.088],
    [0.036, -0.082],
    [0.031, -0.058],
    [-0.03, -0.058],
    [-0.04, -0.066],
    [-0.078, -0.055],
    [-0.1, -0.044],
  ];
  l.push(xr(y, -0.019, 0.019, 0.0014, s, v)),
    l.push(Rt(0.043, 0.01, 0.066, 0.002, 0, -0.0835, 0.0668, s, v, [-0.095, 0, 0])),
    l.push(Rt(0.0405, 0.052, 0.005, 8e-4, 0, -0.052, 0.0975, s, v)),
    l.push(Rt(0.0405, 0.04, 0.005, 8e-4, 0, -0.048, 0.0345, s, v)),
    a.push(Fi(0.0038, 0.0396, 0, -0.031, -0.086, t, 12)),
    a.push(Fi(0.0038, 0.0396, 0, -0.029, 0.087, t, 12)),
    a.push(Fi(0.0022, 0.0392, 0, -0.04, -0.012, t, 8)),
    a.push(Fi(0.0022, 0.0392, 0, -0.032, -0.032, t, 8));
  for (let F of [-1, 1])
    a.push(Fi(0.0068, 0.004, F * 0.0205, -0.036, -0.048, e, 14, d)),
      a.push(Rt(0.004, 0.006, 0.024, 0.0015, F * 0.0228, -0.036, -0.036, e, d, [0.5, 0, 0]));
  a.push(Rt(0.0045, 0.024, 0.013, 0.0015, -0.0212, -0.03, 0.022, e, d));
  for (let F = 0; F < 4; F++)
    a.push(Rt(0.0012, 0.002, 0.012, 5e-4, -0.0238, -0.021 - F * 0.0045, 0.022, e, d));
  a.push(Fi(0.0058, 0.005, 0.0205, -0.042, 0.016, e, 12, d)),
    l.push(Rt(0.004, 0.004, 0.026, 8e-4, 0.0205, -0.051, 0.016, s, v)),
    l.push(Rt(0.004, 0.02, 0.004, 8e-4, 0.0205, -0.043, 0.027, s, v)),
    l.push(
      xr(
        [
          [0.033, -0.056],
          [0.033, -0.093],
          [0.024, -0.1005],
          [-0.031, -0.1005],
          [-0.041, -0.09],
          [-0.041, -0.06],
        ],
        -0.0085,
        0.0085,
        8e-4,
        s,
        v,
        [
          [
            [0.028, -0.059],
            [0.028, -0.091],
            [0.022, -0.096],
            [-0.029, -0.096],
            [-0.036, -0.088],
            [-0.036, -0.061],
          ],
        ],
      ),
    ),
    a.push(
      xr(
        [
          [-0.006, -0.057],
          [0.004, -0.057],
          [0.003, -0.069],
          [0.0065, -0.079],
          [0.01, -0.086],
          [0.0065, -0.088],
          [0.001, -0.081],
          [-0.004, -0.07],
        ],
        -0.0032,
        0.0032,
        8e-4,
        t,
        0,
      ),
    ),
    l.push(
      xr(
        [
          [-0.038, -0.05],
          [-0.045, -0.074],
          [-0.049, -0.086],
          [-0.049, -0.1],
          [-0.054, -0.112],
          [-0.057, -0.13],
          [-0.064, -0.158],
          [-0.11, -0.152],
          [-0.102, -0.112],
          [-0.096, -0.082],
          [-0.095, -0.064],
          [-0.103, -0.046],
          [-0.08, -0.044],
        ],
        -0.0165,
        0.0165,
        0.005,
        s,
        v,
      ),
    );
  for (let F = 0; F < 9; F++) {
    let X = -0.078 - F * 0.0082,
      ne = -0.073 + (X + 0.078) * 0.26;
    l.push(Rt(0.0345, 0.0028, 0.03, 0.001, 0, X, ne, s, v, [-0.25, 0, 0]));
  }
  for (let F = 0; F < 7; F++) {
    let X = -0.078 - F * 0.01,
      ne = -0.098 + (X + 0.078) * 0.14;
    l.push(Rt(0.022, 0.0045, 0.006, 0.0015, 0, X, ne, s, v, [-0.14, 0, 0]));
  }
  l.push(Rt(0.035, 0.006, 0.05, 0.002, 0, -0.157, -0.087, s, v, [0.13, 0, 0])),
    a.push(Fi(0.003, 0.034, 0, -0.15, -0.085, t, 8));
  let b = mi.handguardR,
    m = 0.00885,
    A = 0.0028,
    _ = 0.101,
    M = 0.398,
    E = [
      [_, -m],
      [M, -m],
      [M, m],
      [_, m],
    ];
  for (let F = 0; F < 8; F++) {
    let X = [];
    if (F === 0 || F === 4 || F === 6)
      for (let $ = 0; $ < 6; $++) X.push(Dv(0.13 + $ * 0.047, 0, 0.032, 0.007, 4));
    else if (F !== 2)
      for (let $ = 0; $ < 10; $++) {
        let ue = 0.124 + $ * 0.027;
        (F === 3 && ue > 0.3) || X.push(Dv(ue, 0, 0.013, 0.0052, 3));
      }
    let ne = xr(E, b - A, b, 9e-4, i, p, X);
    ne.rotateZ((F * Math.PI) / 4), r.push(ne);
    let re = ((F + 0.5) * Math.PI) / 4;
    r.push(
      Cn(
        [
          [0, _],
          [0.003, _],
          [0.003, M],
          [0, M],
        ],
        8,
        i,
        0,
        Math.cos(re) * 0.0197,
        Math.sin(re) * 0.0197,
      ),
    );
  }
  r.push(
    qo(
      [
        [-0.0088, 0.02],
        [0.0088, 0.02],
        [0.0106, 0.029],
        [0.0082, 0.0338],
        [-0.0082, 0.0338],
        [-0.0106, 0.029],
      ],
      0.1012,
      0.3978,
      0.0012,
      i,
      p,
    ),
  ),
    r.push(
      Cn(
        [
          [0.016, 0.096],
          [0.0238, 0.096],
          [0.0243, 0.0966],
          [0.0243, 0.106],
          [0.0232, 0.1075],
          [0.016, 0.1075],
        ],
        24,
        i,
        p,
      ),
    ),
    r.push(
      Cn(
        [
          [0.018, 0.3985],
          [0.0224, 0.3985],
          [0.0224, 0.4003],
          [0.0218, 0.401],
          [0.018, 0.401],
          [0.018, 0.3985],
        ],
        8,
        i,
        p,
      ),
    );
  for (let F of [-1, 1])
    for (let X of [0.112, 0.126]) a.push(Fi(0.0024, 0.0024, F * 0.0212, -0.004, X, t, 10));
  for (let F of [0.115, 0.215, 0.3, 0.385])
    for (let X of [-1, 1])
      a.push(
        Cn(
          [
            [0, -8e-4],
            [0.0017, -8e-4],
            [0.002, -4e-4],
            [0.002, 6e-4],
            [0, 6e-4],
          ],
          8,
          t,
          0,
          0,
          0,
        )
          .rotateX(Math.PI / 2)
          .translate(X * 0.0098, 0.0312, -F),
      );
  {
    let X = [
      qo(
        [
          [-0.0078, 0.0206],
          [0.0078, 0.0206],
          [0.0106, 0.0242],
          [-0.0106, 0.0242],
        ],
        0.318,
        0.396,
        5e-4,
        i,
        0,
      ),
    ];
    for (let ne = 0; ne < 8; ne++) {
      let re = 0.319 + ne * 0.01;
      X.push(
        qo(
          x.map(($) => [$[0], $[1] - 0.016]),
          re,
          re + 0.0048,
          5e-4,
          i,
          p,
        ),
      );
    }
    for (let ne of X) ne.rotateZ(Math.PI / 4), r.push(ne);
  }
  {
    let F = [];
    for (let X = 0; X < 4; X++) {
      let ne = 0.352 + X * 0.01;
      F.push(
        qo(
          x.map((re) => [re[0], re[1] - 0.016]),
          ne,
          ne + 0.0048,
          5e-4,
          i,
          p,
        ),
      );
    }
    F.push(
      qo(
        [
          [-0.0078, 0.0206],
          [0.0078, 0.0206],
          [0.0106, 0.0242],
          [-0.0106, 0.0242],
        ],
        0.35,
        0.392,
        5e-4,
        i,
        0,
      ),
    );
    for (let X of F) X.rotateZ(Math.PI), r.push(X);
  }
  l.push(
    xr(
      [
        [0.35, -0.026],
        [0.392, -0.026],
        [0.388, -0.036],
        [0.372, -0.05],
        [0.362, -0.05],
        [0.354, -0.036],
      ],
      -0.011,
      0.011,
      0.003,
      s,
      v,
    ),
  ),
    l.push(
      xr(
        [
          [0.2395, -0.0215],
          [0.2725, -0.0215],
          [0.2725, -0.03],
          [0.27, -0.092],
          [0.2665, -0.0965],
          [0.2455, -0.0975],
          [0.242, -0.093],
          [0.2395, -0.03],
        ],
        -0.014,
        0.014,
        0.0045,
        s,
        v,
      ),
    );
  for (let F = 0; F < 6; F++)
    l.push(Rt(0.0292, 0.0022, 0.0315, 8e-4, 0, -0.04 - F * 0.0085, 0.256 - F * 3e-4, s, v));
  l.push(Rt(0.03, 0.005, 0.04, 0.0015, 0, -0.024, 0.256, s, v)),
    a.push(Fi(0.003, 0.031, 0, -0.025, 0.256, t, 10)),
    a.push(
      Cn(
        [
          [0.0115, 0.095],
          [0.0115, 0.15],
          [0.0095, 0.153],
          [0.0095, 0.285],
          [0.009, 0.288],
          [0.009, 0.322],
          [0.0086, 0.326],
          [0.0086, 0.435],
          [0.0092, 0.437],
          [0.0092, 0.453],
          [0.0075, 0.455],
          [0.0075, 0.461],
        ],
        20,
        e,
        d,
      ),
    ),
    a.push(
      Cn(
        [
          [0.0092, 0.286],
          [0.0135, 0.286],
          [0.0142, 0.2875],
          [0.0142, 0.3165],
          [0.0135, 0.318],
          [0.0092, 0.318],
        ],
        16,
        e,
        d,
      ),
    ),
    a.push(Rt(0.014, 0.009, 0.03, 0.002, 0, 0.0145, 0.302, e, d)),
    a.push(
      Cn(
        [
          [0, 0.1],
          [0.0026, 0.1],
          [0.0026, 0.3],
          [0, 0.3],
        ],
        8,
        t,
        0,
        0,
        0.0172,
      ),
    ),
    a.push(Fi(0.002, 0.0145, 0, 0.012, 0.308, t, 6)),
    a.push(
      Cn(
        [
          [0.0075, 0.459],
          [0.0108, 0.459],
          [0.0116, 0.4605],
          [0.0116, 0.477],
          [0.011, 0.478],
          [0.0052, 0.478],
        ],
        20,
        e,
        d,
      ),
    ),
    a.push(
      Cn(
        [
          [0.0052, 0.477],
          [0.0052, 0.517],
        ],
        12,
        n,
      ),
    );
  for (let F of [0.4865, 0.4965, 0.5065])
    a.push(
      Cn(
        [
          [0.0052, F - 0.0019],
          [0.011, F - 0.0019],
          [0.0116, F - 0.0012],
          [0.0116, F + 0.0012],
          [0.011, F + 0.0019],
          [0.0052, F + 0.0019],
        ],
        20,
        e,
        d,
      ),
    );
  a.push(
    Cn(
      [
        [0.0052, 0.5145],
        [0.011, 0.5145],
        [0.0116, 0.5155],
        [0.0116, 0.527],
        [0.0102, 0.5305],
        [0.0048, 0.5305],
        [0.0036, 0.526],
        [0.0036, 0.495],
      ],
      20,
      e,
      d,
      0,
      0,
      (F, X, ne) => (F < 0.0047 ? [0.25, 0.25, 0.25] : ne),
    ),
  );
  for (let F of [-1, 1]) a.push(Rt(0.0125, 0.0042, 0.042, 0.0012, 0, F * 0.0096, 0.496, e, d));
  for (let F = 0; F < 3; F++) a.push(Fi(0.0016, 0.0236, 0, 0, 0.4675 + F * 0.0035, n, 6));
  r.push(
    Cn(
      [
        [0, -0.292],
        [0.0142, -0.292],
        [0.0148, -0.2905],
        [0.0148, -0.1],
      ],
      20,
      i,
      p,
    ),
  ),
    r.push(
      Cn(
        [
          [0.0148, -0.122],
          [0.0185, -0.122],
          [0.0195, -0.1205],
          [0.0195, -0.1115],
          [0.0185, -0.11],
          [0.0148, -0.11],
        ],
        12,
        i,
        p * 1.5,
      ),
    );
  {
    let F = [
        [-0.019, -0.024],
        [0.019, -0.024],
        [0.021, -0.018],
        [0.021, 0.018],
        [0.016, 0.024],
        [-0.016, 0.024],
        [-0.021, 0.018],
        [-0.021, 0.006],
        [-0.036, 0.004],
        [-0.04, -0.002],
        [-0.04, -0.014],
        [-0.034, -0.02],
        [-0.021, -0.02],
      ],
      X = [
        [-0.025, -0.014],
        [-0.025, -0.002],
        [-0.033, -5e-4],
        [-0.036, -0.004],
        [-0.036, -0.012],
        [-0.032, -0.016],
      ];
    a.push(qo(F, -0.1095, -0.1045, 8e-4, [1.6, 1.6, 1.65], d, [X]));
  }
  l.push(
    xr(
      [
        [-0.146, 0.024],
        [-0.3, 0.024],
        [-0.331, 0.014],
        [-0.334, -0.086],
        [-0.318, -0.101],
        [-0.29, -0.096],
        [-0.232, -0.04],
        [-0.146, -0.024],
      ],
      -0.019,
      0.019,
      0.004,
      s,
      v,
      [
        [
          [-0.262, -0.036],
          [-0.306, -0.036],
          [-0.306, -0.074],
          [-0.292, -0.074],
        ],
      ],
    ),
  ),
    l.push(Rt(0.033, 0.016, 0.118, 0.006, 0, 0.031, -0.232, s, v));
  for (let F of [-0.196, -0.268]) a.push(Fi(0.0032, 0.035, 0, 0.03, F, t, 8));
  l.push(Rt(0.012, 0.012, 0.04, 0.003, 0, -0.033, -0.19, s, v, [0.2, 0, 0])),
    f.push(Rt(0.037, 0.12, 0.011, 0.004, 0, -0.04, -0.3395, o, 0));
  for (let F = 0; F < 9; F++)
    f.push(Rt(0.031, 0.004, 0.003, 0.001, 0, 0.004 - F * 0.011, -0.3455, o, 0));
  for (let F of [-1, 1]) a.push(Fi(0.0065, 0.003, F * 0.0195, -0.06, -0.318, t, 12));
  let w = mi.sightY,
    S = mi.window,
    z = [0.012, 0.012, 0.013];
  r.push(Rt(0.03, 0.0092, 0.04, 0.0016, 0, 0.048, 0.021, i, p)),
    r.push(Rt(0.0045, 0.0085, 0.034, 0.001, -0.0162, 0.0452, 0.021, i, p));
  for (let F of [0.009, 0.033])
    a.push(Fi(0.004, 0.0042, -0.02, 0.0452, F, t, 6)),
      a.push(Fi(0.003, 0.0022, 0.016, 0.0452, F, t, 10));
  let H = [
    [-0.0192, 0.0525],
    [0.0192, 0.0525],
    [0.0192, 0.0788],
    [0.0138, 0.0842],
    [-0.0138, 0.0842],
    [-0.0192, 0.0788],
  ];
  r.push(qo(H, 0.008, 0.034, 0.001, i, p, [S])),
    f.push(
      qo(
        S.map((F) => [F[0] * 1.004, (F[1] - w) * 1.004 + w]),
        0.0078,
        0.0342,
        0,
        z,
        0,
        [S.map((F) => [F[0] * 0.982, (F[1] - w) * 0.982 + w])],
      ),
    );
  let O = [
    [-0.0204, 0.06],
    [-0.0204, 0.0792],
    [-0.0143, 0.0854],
    [0.0143, 0.0854],
    [0.0204, 0.0792],
    [0.0204, 0.06],
    [0.0193, 0.06],
    [0.0193, 0.0788],
    [0.0138, 0.0843],
    [-0.0138, 0.0843],
    [-0.0193, 0.0788],
    [-0.0193, 0.06],
  ];
  r.push(qo(O, 0.029, 0.038, 3e-4, i, p)),
    a.push(
      Cn(
        [
          [0, -0.006],
          [0.0052, -0.006],
          [0.0058, -0.0054],
          [0.0058, 0.0036],
          [0.0052, 0.0042],
          [0, 0.0042],
        ],
        14,
        e,
        d,
        0,
        0,
      )
        .rotateY(Math.PI / 2)
        .translate(0.0222, 0.0625, -0.021),
    );
  for (let F of [0.0165, 0.0245])
    f.push(Rt(0.0022, 0.0055, 0.0055, 9e-4, -0.0196, 0.064, F, o, 0));
  for (let F of [0.012, 0.03])
    for (let X of [-1, 1]) a.push(Fi(0.0016, 0.0012, X * 0.0195, 0.0555, F, t, 8));
  f.push(Rt(0.009, 0.0026, 0.006, 6e-4, 0, 0.058, 0.0115, z));
  for (let [F, X] of [
    [0.0128, 0.0548],
    [-0.0128, 0.0548],
  ])
    a.push(
      Cn(
        [
          [0, -6e-4],
          [0.0019, -6e-4],
          [0.0022, -2e-4],
          [0.0022, 7e-4],
          [0, 7e-4],
        ],
        10,
        t,
        0,
        F,
        X,
      )
        .translate(0, 0, -0.008 + 1e-4)
        .rotateY(0),
    );
  a.push(
    Cn(
      [
        [0, -0.001],
        [0.0026, -0.001],
        [0.003, -5e-4],
        [0.003, 0.0012],
        [0, 0.0012],
      ],
      12,
      t,
      0,
      0,
      0,
    )
      .rotateX(Math.PI / 2)
      .translate(0.009, 0.0842, -0.014),
  ),
    f.push(Rt(0.0012, 2e-4, 0.0044, 5e-5, 0.009, 0.0855, 0.014, z)),
    f.push(
      qo(S, 0.0304, 0.0318, 0, z, 0, [S.map((F) => [F[0] * 0.955, (F[1] - w) * 0.955 + w])]),
    );
  for (let [F, X] of [
    [-0.03, 1],
    [0.372, -1],
  ])
    a.push(Rt(0.021, 0.0075, 0.03, 0.0015, 0, 0.0472, F, e, d)),
      a.push(Rt(0.0125, 0.004, 0.036, 0.001, 0, 0.0527, F + X * 0.004, e, d)),
      a.push(Fi(0.0028, 0.024, 0, 0.0505, F - X * 0.013, e, 8)),
      a.push(Rt(0.004, 0.006, 0.006, 0.001, X * 0.0125, 0.0475, F, e, d)),
      a.push(Fi(0.0042, 0.0045, -0.0125, 0.0475, F + 0.006, t, 8));
  a.push(
    Cn(
      [
        [0.0016, -0.0012],
        [0.0034, -0.0012],
        [0.0038, -8e-4],
        [0.0038, 8e-4],
        [0.0034, 0.0012],
        [0.0016, 0.0012],
        [0.0016, -0.0012],
      ],
      12,
      e,
      d,
      0,
      0,
    )
      .rotateX(Math.PI / 2)
      .translate(0, 0.0553, 0.016),
  ),
    a.push(Fi(0.0048, 0.005, 0.015, 0.049, -0.036, e, 12, d));
  for (let F = 0; F < 6; F++)
    a.push(
      Rt(
        0.0044,
        0.001,
        0.001,
        3e-4,
        0.015,
        0.049 + Math.sin(F * 1.047) * 0.0046,
        -0.036 + Math.cos(F * 1.047) * 0.0046,
        e,
        d,
      ),
    );
  r.push(Rt(0.016, 0.005, 0.02, 0.0012, 0, 0.0355, -0.098, i, p)),
    a.push(Rt(0.01, 0.003, 0.008, 8e-4, 0, 0.0392, -0.0985, e, d));
  for (let F = 0; F < 4; F++)
    a.push(Rt(0.0092, 8e-4, 0.001, 3e-4, 0, 0.0409, -0.0958 - F * 0.0018, e, d));
  let q = -0.0267,
    U = 0.0267;
  a.push(
    Cn(
      [
        [0, 0.308],
        [0.0095, 0.308],
        [0.0108, 0.3095],
        [0.0108, 0.322],
        [0.0118, 0.323],
        [0.0118, 0.378],
        [0.0128, 0.38],
        [0.0142, 0.382],
        [0.0142, 0.404],
        [0.0136, 0.406],
        [0.0142, 0.408],
        [0.0142, 0.412],
        [0.0128, 0.4135],
        [0.0118, 0.4135],
        [0.0112, 0.409],
      ],
      18,
      e,
      d,
      q,
      U,
    ),
  ),
    a.push(
      Cn(
        [
          [0.0112, 0.409],
          [0, 0.409],
        ],
        18,
        [0.35, 0.4, 0.45],
        0,
        q,
        U,
      ),
    );
  for (let F = 0; F < 5; F++)
    a.push(
      Cn(
        [
          [0.0118, 0.33 + F * 0.008],
          [0.0124, 0.3305 + F * 0.008],
          [0.0124, 0.3335 + F * 0.008],
          [0.0118, 0.334 + F * 0.008],
        ],
        18,
        e,
        d,
        q,
        U,
      ),
    );
  {
    let F = Rt(0.02, 0.008, 0.04, 0.0012, 0, 0.028, 0.352, e, d);
    F.rotateZ(Math.PI / 4), a.push(F);
  }
  {
    let F = Fi(0.004, 0.006, 0.0135, 0.028, 0.352, t, 8);
    F.rotateZ(Math.PI / 4), a.push(F);
  }
  f.push(Rt(0.0185, 0.0065, 0.07, 0.0025, 0, 0.0468, 0.214, o, 0));
  for (let F = 0; F < 6; F++)
    f.push(Rt(0.014, 0.0012, 0.004, 5e-4, 0, 0.0503, 0.192 + F * 0.009, o, 0));
  let T = Fn(
    [
      [q, U, -0.308],
      [q - 0.001, U + 0.002, -0.296],
      [-0.0265, 0.0235, -0.284],
      [-0.0255, 0.0215, -0.272],
      [-0.0235, 0.027, -0.262],
      [-0.016, 0.04, -0.256],
      [-0.007, 0.0465, -0.252],
      [-0.002, 0.047, -0.247],
    ],
    0.0018,
    6,
  );
  sm(T, o, 0), f.push(T);
  for (let F of [
    [-0.0262, 0.0228, 0.28],
    [-0.0242, 0.0255, 0.265],
  ]) {
    let X = Rt(0.0065, 0.0026, 0.0035, 8e-4, 0, 0, 0, [0.03, 0.03, 0.03], 0);
    X.rotateZ(Math.PI / 4), X.translate(F[0], F[1], -F[2]), f.push(X);
  }
  c.push(
    Cn(
      [
        [0, -0.058],
        [0.0118, -0.058],
        [0.0124, -0.057],
        [0.0124, -0.01],
        [0.0116, -0.008],
        [0.0116, -0.002],
        [0.0124, 0],
        [0.0124, 0.046],
        [0.0105, 0.048],
        [0.0105, 0.056],
        [0.0062, 0.056],
        [0.0062, 0.06],
        [0, 0.06],
      ],
      16,
      [7, 7, 7.2],
      0,
      0,
      0.001,
    ),
  );
  for (let F = 0; F < 5; F++)
    c.push(Rt(0.0015, 0.008, 0.003, 5e-4, 0.0122, 0.001, 0.01 + F * 0.007, [1.2, 1.2, 1.2], 0));
  c.push(Rt(0.012, 0.0055, 0.014, 0.0015, -0.0165, 0.007, 0.078, e, d));
  {
    let F = Cn(
      [
        [0, -0.009],
        [0.0045, -0.009],
        [0.0056, -0.0078],
        [0.0056, -0.003],
        [0.0048, -0.002],
        [0.0048, 0.002],
        [0.0056, 0.003],
        [0.0056, 0.0078],
        [0.0045, 0.009],
        [0, 0.009],
      ],
      12,
      e,
      d,
    );
    F.rotateY(Math.PI / 2), F.translate(-0.031, 0.007, -0.078), c.push(F);
  }
  let D = (F) => 1.5 * Math.pow(Math.max(0, F - 0.07), 2),
    C = (F) => 3 * Math.max(0, F - 0.07),
    G = [1, 1, 1],
    j = [],
    N = 0.212,
    Q = 12;
  for (let F = 0; F <= Q; F++) {
    let X = -0.004 + ((N + 0.004) * F) / Q;
    j.push([D(X) + 0.0298, -X]);
  }
  for (let F = Q; F >= 0; F--) {
    let X = -0.004 + ((N + 0.004) * F) / Q;
    j.push([D(X) - 0.0298, -X]);
  }
  u.push(xr(j, -0.0113, 0.0113, 0.002, G, 0.25));
  for (let F = 0; F < 8; F++) {
    let X = 0.082 + F * 0.0155;
    u.push(Rt(0.0246, 0.0058, 0.05, 0.0016, 0, -X, D(X), G, 0.3, [Math.atan(C(X)), 0, 0]));
  }
  for (let F = 0; F < 10; F++) {
    let X = 0.078 + F * 0.013;
    u.push(Rt(0.012, 0.011, 0.004, 0.001, 0, -X, D(X) + 0.0302, G, 0.3, [Math.atan(C(X)), 0, 0]));
  }
  u.push(
    Rt(0.027, 0.009, 0.068, 0.003, 0, -N - 0.003, D(N) + 0.001, G, 0.3, [Math.atan(C(N)), 0, 0]),
  ),
    u.push(
      Rt(0.01, 0.004, 0.012, 0.001, 0, -N - 0.008, D(N) - 0.01, [0.6, 0.6, 0.6], 0, [
        Math.atan(C(N)),
        0,
        0,
      ]),
    ),
    u.push(Rt(0.003, 0.006, 0.04, 0.001, -0.0085, 0.0045, 0.004, G, 0.3)),
    u.push(Rt(0.003, 0.006, 0.04, 0.001, 0.0085, 0.0045, 0.004, G, 0.3));
  let K = [1.25, 0.72, 0.5];
  h.push(
    Cn(
      [
        [0, -0.02],
        [0.004, -0.02],
        [0.0047, -0.019],
        [0.0047, 0.01],
        [0.0034, 0.014],
        [0.0034, 0.018],
      ],
      12,
      [1, 1, 1],
      0,
      0.002,
      0.0062,
    ),
  ),
    h.push(
      Cn(
        [
          [0.003, 0.018],
          [0.0029, 0.024],
          [0.0022, 0.03],
          [0.001, 0.0345],
          [0, 0.0352],
        ],
        12,
        K,
        0,
        0.002,
        0.0062,
      ),
    ),
    h.push(
      Cn(
        [
          [0, -0.02],
          [0.004, -0.02],
          [0.0047, -0.019],
          [0.0047, 0.01],
        ],
        10,
        [0.8, 0.8, 0.8],
        0,
        -0.003,
        5e-4,
      ),
    );
  let ie = {
    ano: Ii(r),
    gun: Ii(a),
    poly: Ii(l),
    plain: Ii(f),
    bolt: Ii(c),
    mag: Ii(u),
    round: Ii(h),
  };
  for (let F of ["ano", "gun", "poly", "plain", "bolt"]) {
    let X = ie[F].attributes.position;
    for (let ne = 0; ne < X.count; ne++)
      X.getZ(ne) > -0.1002 && X.getY(ne) < 0.0341 && X.setX(ne, X.getX(ne) * mi.squeeze);
  }
  for (let F in ie) ie[F].computeBoundingSphere();
  return ie;
}
var Kc = (i) => (i.index ? i.index.count : i.attributes.position.count) / 3;
var ti = W,
  vl = Lt,
  rm = Ye,
  Bv = [31, 21.5, 12.5],
  Fv = [5.6, 5.3, 5],
  Lv = [3.2, 3.1, 3],
  am = [12.5, 10, 7.6],
  lm = [16, 11, 6.6],
  dC = [3, 2.6, 2.2],
  kf = [36, 27, 16],
  gl = [20, 14, 8.4],
  Df = [4.8, 4.5, 4.2],
  pC = [30, 9.5, 2.2],
  E_ = [5, 6.9, 9],
  mC = [30, 9.5, 2.2],
  gC = [26, 26, 25],
  um = (i) => (i < 0 ? 0 : i > 1 ? 1 : i),
  xl = (i, e, t) => ((t = um((t - i) / (e - i))), t * t * (3 - 2 * t)),
  Ff = (i, e) => Math.sign(i) * Math.pow(Math.abs(i), e),
  vC = (i) => {
    let e = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return e - Math.floor(e);
  },
  Xo = new ti(),
  S_ = new ti(0, 0, -1),
  yl = class {
    constructor(e) {
      (this.N = e), (this.P = []), (this.C = []), (this.weld = []);
    }
    v(e, t, n = 1) {
      this.P.push(e.x, e.y, e.z), this.C.push(t[0] * n, t[1] * n, t[2] * n);
    }
    rings() {
      return this.P.length / 3 / this.N;
    }
    collapse() {
      this.weld.push(this.rings() - 1);
    }
    geo(e = !1) {
      let t = this.N,
        n = this.rings(),
        s = [];
      for (let a = 0; a < n - 1; a++)
        for (let l = 0; l < t; l++) {
          let c = a * t + l,
            u = a * t + ((l + 1) % t),
            h = c + t,
            f = u + t;
          e ? s.push(c, u, h, u, f, h) : s.push(c, h, u, u, h, f);
        }
      let o = new nt();
      o.setAttribute("position", new He(this.P, 3)),
        o.setAttribute("color", new He(this.C, 3)),
        o.setAttribute("uv", new He(new Float32Array((this.P.length / 3) * 2), 2)),
        o.setIndex(s),
        o.computeVertexNormals();
      let r = o.attributes.normal;
      for (let a of this.weld) {
        let l = 0,
          c = 0,
          u = 0;
        for (let f = 0; f < t; f++)
          (l += r.getX(a * t + f)), (c += r.getY(a * t + f)), (u += r.getZ(a * t + f));
        let h = Math.hypot(l, c, u) || 1;
        for (let f = 0; f < t; f++) r.setXYZ(a * t + f, l / h, c / h, u / h);
      }
      return o;
    }
  };
function I_(i, e, t) {
  let n = [],
    s = [],
    o = [],
    r = i.length,
    a = e.length;
  for (let c = 0; c < a; c++)
    for (let u = 0; u < r; u++) {
      let h = t(i[u], e[c], Xo);
      n.push(Xo.x, Xo.y, Xo.z), s.push(h[0], h[1], h[2]);
    }
  for (let c = 0; c < a - 1; c++)
    for (let u = 0; u < r - 1; u++) {
      let h = c * r + u,
        f = h + 1,
        p = h + r,
        d = p + 1;
      o.push(h, f, p, f, d, p);
    }
  let l = new nt();
  return (
    l.setAttribute("position", new He(n, 3)),
    l.setAttribute("color", new He(s, 3)),
    l.setAttribute("uv", new He(new Float32Array((n.length / 3) * 2), 2)),
    l.setIndex(o),
    l.computeVertexNormals(),
    l
  );
}
var Uv = [-1, -0.9, -0.5, 0, 0.5, 0.9, 1],
  cm = (i) => (Math.abs(i) > 0.95 ? -1 : Math.abs(i) > 0.8 ? 0.82 : 1);
function Lf(i, e, t, n, s, o, r, a = null, l = !1, c = Uv, u = Uv) {
  return I_(c, u, (h, f, p) => {
    let d = i + h * t,
      v = e + (l ? f : -f) * n,
      g = Math.min(cm(h), cm(f)),
      x = r(d, v) + (g < 0 ? -0.0022 : s * g);
    p.set(d, l ? -x : x, v), a && a(p);
    let y = typeof o == "function" ? o(h, f) : o,
      b = g < 0 ? 0.5 : g < 1 ? 0.8 : 1;
    return [y[0] * b, y[1] * b, y[2] * b];
  });
}
var om = [
    {
      base: [-0.031, 0, -0.094],
      len: [0.044, 0.026, 0.022],
      rad: [0.0096, 0.009, 0.0083, 0.0076],
    },
    {
      base: [-0.0105, 0.001, -0.099],
      len: [0.049, 0.03, 0.023],
      rad: [0.0097, 0.0091, 0.0084, 0.0077],
    },
    {
      base: [0.0105, 0, -0.095],
      len: [0.045, 0.028, 0.022],
      rad: [0.0094, 0.0088, 0.0081, 0.0074],
    },
    {
      base: [0.03, -0.002, -0.086],
      len: [0.035, 0.021, 0.02],
      rad: [0.0084, 0.0078, 0.0072, 0.0066],
    },
  ],
  Nv = [12, 34, 44, 68, 90, 112, 136, 146, 168, 192, 220, 245, 270, 295, 320, 348].map(
    (i) => (i * Math.PI) / 180,
  ),
  T_ = Nv.length,
  A_ = 0.0012,
  R_ = [0.14, 0.22, 0.27, 0.73, 0.78, 0.88],
  xC = [0.1, 0.17, 0.1];
function z_(i) {
  let e = new yl(T_),
    { base: t, qs: n, len: s, rad: o } = i,
    r = i.pads || [1, 1, 0],
    a = i.patchJ ?? 1,
    l = i.bump || xC,
    c = i.tipW || 1,
    u = i.tipH || 1,
    h = [],
    f = [],
    p = t.clone();
  for (let M = 0; M < 3; M++)
    h.push(p.clone()),
      f.push(S_.clone().applyQuaternion(n[M + 1])),
      p.addScaledVector(f[M], s[M]);
  let d = S_.clone().applyQuaternion(n[0]),
    v = (M) => (M ? f[M - 1] : d),
    g = [0, 1, 2].map((M) => new ti().addVectors(v(M), f[M]).normalize()),
    x = (M, E) => (M.x - h[E].x) * g[E].x + (M.y - h[E].y) * g[E].y + (M.z - h[E].z) * g[E].z,
    y = (M, E) => {
      let w = x(M, E);
      w > 0 && M.addScaledVector(v(E), -w / v(E).dot(g[E]));
    },
    b = (M, E) => {
      let w = x(M, E);
      w < 0 && M.addScaledVector(f[E], -w / f[E].dot(g[E]));
    },
    m = new ti(),
    A = new vl(),
    _ = (M, E, w, S) => {
      let z = S.kD || 1,
        H = S.kP || 1,
        O = S.ao || 1;
      for (let q = 0; q < T_; q++) {
        let U = Math.cos(Nv[q]),
          T = Math.sin(Nv[q]),
          D = q >= 1 && q <= 7,
          C = q >= 2 && q <= 6,
          G = w * U,
          j = T > 0 ? w * 0.96 * T * (C ? z : 1 + (z - 1) * 0.4) : w * 0.98 * T * H;
        S.pad && C && ((G += U * A_), (j += T * A_)),
          (G *= S.wx || 1),
          (j *= S.wy || 1),
          m.set(G, j, 0).applyQuaternion(M).add(E),
          S.a >= 0 && y(m, S.a),
          S.b >= 0 && b(m, S.b);
        let N = D ? Bv : q >= 10 && q <= 14 ? am : lm,
          Q = O;
        S.pad && C ? (N = Fv) : S.patch && C && ((N = lm), (Q *= 0.9)),
          ((S.pad && D && !C) || (S.edge && D)) && (N = dC),
          S.saddle && q >= 8 && ((N = am), (Q *= 0.9)),
          S.stitch && D && ((N = kf), (Q *= 0.8)),
          (q === 0 || q === 8 || q === 9 || q === 15) && (Q *= 0.72),
          q >= 9 && (Q *= S.aoP || 1),
          e.v(m, N, Q);
      }
    };
  _(n[0], Xo.copy(h[0]).addScaledVector(d, -(i.rootBack || 0.012) - 0.002), 1e-5, {
    a: 0,
    b: -1,
    ao: i.rootAo || 0.5,
  }),
    e.collapse(),
    _(n[0], Xo.copy(h[0]).addScaledVector(d, -(i.rootBack || 0.012)), o[0] * (i.rootK || 1), {
      a: 0,
      b: -1,
      ao: i.rootAo || 0.5,
      saddle: i.saddle,
    });
  for (let M = 0; M < 3; M++) {
    for (let E = 0; E < 4; E++) {
      let w = E / 3;
      A.slerpQuaternions(n[M], n[M + 1], w),
        _(A, Xo.copy(h[M]).addScaledVector(E < 2 ? v(M) : f[M], (E - 1.5) * 4e-4), o[M], {
          a: w < 0.5 ? M : -1,
          b: w < 0.5 ? -1 : M,
          kD: 1 + l[M] * (E === 0 || E === 3 ? 0.55 : 1),
          patch: M === a,
          saddle: i.saddle && M < 2,
          wx: M === 2 ? 1 + (c - 1) * 0.5 : 1,
          wy: M === 2 ? 1 + (u - 1) * 0.5 : 1,
          ao: M === 0 && !i.rootAo ? 0.62 + 0.1 * E : 1,
          aoP: E === 1 || E === 2 ? 0.55 : 0.8,
        });
    }
    if (M < 2)
      for (let E = 0; E < R_.length; E++) {
        let w = R_[E],
          S = (o[M] + (o[M + 1] - o[M]) * w) * (1 - 0.06 * Math.sin(Math.PI * w));
        _(n[M + 1], Xo.copy(h[M]).addScaledVector(f[M], s[M] * w), S, {
          a: M + 1,
          b: M,
          pad: r[M] && (E === 2 || E === 3),
          edge: r[M] && (E === 1 || E === 4),
          saddle: i.saddle && M === 0,
          ao: M === 0 && !i.rootAo ? 0.86 + 0.14 * xl(0, 0.5, w) : 1,
        });
      }
    else {
      let E = o[3],
        w = s[2] - E;
      _(n[3], Xo.copy(h[2]).addScaledVector(f[2], s[2] * 0.2), o[2] * 0.97, {
        a: -1,
        b: 2,
        stitch: 1,
        wx: c,
        wy: u,
      }),
        _(n[3], Xo.copy(h[2]).addScaledVector(f[2], s[2] * 0.42), (o[2] + E) * 0.5, {
          a: -1,
          b: 2,
          kP: 1.08,
          wx: c,
          wy: u,
        });
      for (let S of [0, 0.6, 1.05, 1.36])
        _(
          n[3],
          Xo.copy(h[2]).addScaledVector(f[2], w + E * 1.08 * Math.sin(S)),
          E * Math.cos(S),
          { a: -1, b: -1, kP: 1.06, wx: c, wy: u },
        );
      _(n[3], Xo.copy(h[2]).addScaledVector(f[2], w + E * 1.08), 1e-5, { a: -1, b: -1 }),
        e.collapse();
    }
  }
  return e.geo();
}
var yC = (i) => new vl().setFromAxisAngle(new ti(0, 1, 0), i),
  bC = (i) => new vl().setFromAxisAngle(new ti(1, 0, 0), i);
function C_(i, e) {
  let t = [yC(e[3] || 0)];
  for (let n = 0; n < 3; n++) t.push(t[n].clone().multiply(bC(-e[n])));
  return z_({ base: new ti(i.base[0], i.base[1], i.base[2]), qs: t, len: i.len, rad: i.rad });
}
function _C(i, e) {
  let t = i.clone().negate(),
    n = new ti().crossVectors(e, t);
  n.lengthSq() < 1e-6 && n.set(1, 0, 0), n.normalize();
  let s = new ti().crossVectors(t, n);
  return new vl().setFromRotationMatrix(new rm().makeBasis(n, s, t));
}
function MC(i) {
  let e = i.map((o) => new ti(o[0], o[1], o[2]).normalize()),
    t = new ti(-0.72, 0.69, 0),
    n = [],
    s = e[2].clone().sub(e[0]);
  s.length() > 0.12 && t.multiplyScalar(0.25).addScaledVector(s.normalize(), -1);
  for (let o = 0; o < 3; o++) n.push(_C(e[o], t));
  return (
    n.unshift(n[0].clone()),
    z_({
      base: new ti(-0.028, -0.007, -0.014),
      qs: n,
      len: [0.044, 0.031, 0.026],
      rad: [0.0165, 0.0118, 0.011, 0.01],
      pads: [0, 1, 0],
      patchJ: 2,
      bump: [0, 0.2, 0.2],
      tipW: 1.12,
      tipH: 0.86,
      saddle: 1,
      rootBack: 0.01,
      rootK: 0.72,
      rootAo: 0.9,
    })
  );
}
var Qc = 0.006,
  D_ = (i) => -0.0975 + 0.0125 * Math.pow((i + 0.008) / 0.04, 2),
  Ov = (i) => D_(i) + 0.006,
  Hv = (i) => 0.029 + 0.014 * xl(0.05, 0.85, i),
  L_ = (i) => 0.0185 - 0.0065 * xl(0.1, 1, i),
  k_ = (i) => 0.0185 + 0.003 * Math.sin(Math.PI * um(i * 1.6)) - 0.0055 * xl(0.3, 1, i);
function kv(i, e) {
  let t = um((Qc - e) / (Qc - Ov(i))),
    n = Math.min(0.999, Math.abs(i / Hv(t)));
  return L_(t) * Math.pow(1 - Math.pow(n, 2.5), 0.4);
}
function wC(i, e) {
  let t = um((Qc - e) / (Qc - Ov(i))),
    n = Hv(t),
    s = Math.min(0.999, Math.abs(i / n));
  return (
    k_(t) *
    Math.pow(1 - Math.pow(s, 2.5), 0.4) *
    (1 + 0.14 * Math.max(0, i / n) * Math.sin(Math.PI * t))
  );
}
function EC() {
  let e = new yl(24),
    t = new ti(),
    n = [
      [0, 0, 1, 1],
      [0.1, 0, 1, 1],
      [0.22, 0, 1, 1],
      [0.36, 0, 1, 1],
      [0.5, 0, 1, 1],
      [0.64, 0, 1, 1],
      [0.77, 0, 1, 1],
      [0.89, 0, 1, 1],
      [1, 0, 1, 1],
      [1, -0.005, 0.8, 1],
      [1, -0.009, 0.45, 0.985],
      [1, -0.0105, 0.04, 0.97],
    ];
  for (let [s, o, r, a] of n) {
    let l = Hv(s) * a,
      c = L_(s) * r,
      u = k_(s) * r;
    for (let h = 0; h < 24; h++) {
      let f = ((h + 0.5) / 24) * Math.PI * 2,
        p = Math.cos(f),
        d = Math.sin(f),
        v = l * Ff(p, 0.8),
        g =
          d >= 0
            ? c * Ff(d, 0.8)
            : u * Ff(d, 0.8) * (1 + 0.14 * Math.max(0, v / l) * Math.sin(Math.PI * s));
      t.set(v, g, Qc + (Ov(v) - Qc) * s + o);
      let x = d > 0.3 ? Bv : d < -0.3 ? am : lm,
        y = 1;
      s === 0.1 && d > 0.3 && ((x = kf), (y = 0.75)),
        o < 0 && ((x = lm), (y = 0.7 + o * 30)),
        d < -0.3 && (y *= 0.82 + 0.18 * Math.abs(p)),
        e.v(t, x, y);
    }
  }
  return e.geo();
}
function SC(i) {
  let t = new yl(12),
    n = new ti(),
    s = new ti(),
    o = new ti(),
    r = new ti(),
    a = new ti(),
    l = new ti(i.x, i.y, i.z - 1).normalize(),
    c = [-0.12, 0, 0.2, 0.4, 0.6, 0.78, 0.9];
  for (let d = 0; d < c.length; d++) {
    let v = c[d],
      g = d === 0 || d === c.length - 1;
    s.set(-0.028, -0.007, -0.014).addScaledVector(i, 0.044 * v),
      o.set(-0.03, -0.003, -0.022 - 0.06 * v),
      r.subVectors(s, o);
    let x = r.length() * 0.5 + 0.005;
    r.normalize(), a.crossVectors(r, l).normalize();
    let y = g ? 1e-5 : 0.0085 * (1 - 0.55 * v),
      b = g ? 1e-5 : x * (1 - 0.3 * v * v);
    for (let m = 0; m < 12; m++) {
      let A = ((m + 0.5) / 12) * Math.PI * 2,
        _ = Math.cos(A),
        M = Math.sin(A);
      n.copy(s)
        .add(o)
        .multiplyScalar(0.5)
        .addScaledVector(r, _ * b)
        .addScaledVector(a, M * y);
      let E = a.y * M < 0;
      t.v(n, E ? am : Bv, E ? 0.85 : 0.92);
    }
    g && t.collapse();
  }
  let u = t.geo(),
    h = u.attributes.position,
    f = u.index.array,
    p = 0;
  for (let d = 0; d < f.length; d += 3)
    s.fromBufferAttribute(h, f[d]),
      o.fromBufferAttribute(h, f[d + 1]),
      n.fromBufferAttribute(h, f[d + 2]),
      (p += s.dot(o.cross(n)));
  if (p < 0) {
    for (let d = 0; d < f.length; d += 3) {
      let v = f[d + 1];
      (f[d + 1] = f[d + 2]), (f[d + 2] = v);
    }
    u.computeVertexNormals();
  }
  return u;
}
function P_(i) {
  if ((i.scale(-1, 1, 1), !i.index)) {
    let t = i.attributes.position.count,
      n = new Uint32Array(t);
    for (let s = 0; s < t; s++) n[s] = s;
    i.setIndex(new et(n, 1));
  }
  let e = i.index.array;
  for (let t = 0; t < e.length; t += 3) {
    let n = e[t + 1];
    (e[t + 1] = e[t + 2]), (e[t + 2] = n);
  }
  return i;
}
function Vv(i) {
  let e = [],
    t = i.debugParts || null,
    n = (d, v) => (e.push(v), t && t.push([d, v]), v);
  n("palm", EC());
  {
    let d = [];
    for (let v = 0; v <= 30; v++) d.push(-1 + v / 15);
    n(
      "guard",
      I_(d, [-1, -0.9, -0.5, 0, 0.5, 0.9, 1], (v, g, x) => {
        let y = -5e-4 + v * 0.0405,
          b = D_(y) + 0.0045 - g * 0.011,
          m = Math.min(cm(v), cm(g)),
          A = 0;
        for (let M = 0; M < 4; M++) {
          let E = (y - om[M].base[0]) / 0.0058;
          A += (M === 3 ? 0.8 : 1) * Math.exp(-E * E);
        }
        (A = Math.min(1, A) * (1 - 0.55 * g * g)),
          x.set(
            y,
            kv(y, b) + (m < 0 ? (g > 0.95 ? -0.008 : -0.003) : (0.0016 + 0.006 * A) * m),
            b,
          );
        let _ = m < 0 ? 0.6 : 0.85 + 1.3 * A;
        return [Lv[0] * _, Lv[1] * _, Lv[2] * _];
      }),
    );
  }
  for (let d = 0; d < 3; d++)
    n("bar", Lf(0.001, -0.034 - d * 0.015, 0.023 + d * 0.0025, 0.0052, 0.0019, Fv, kv));
  n(
    "seam",
    Lf(
      0,
      -0.0225,
      0.027,
      0.0013,
      9e-4,
      kf.map((d) => d * 0.8),
      kv,
      null,
      !1,
      Uv,
      [-1, 0, 1].map((d) => d * 0.9),
    ),
  ),
    n("heelPad", Lf(0.013, -0.03, 0.0135, 0.017, 0.0017, Fv, wC, null, !0));
  let s = [];
  for (let d = 0; d < 4; d++) {
    if (d === 0 && i.indexPoses) {
      for (let v of i.indexPoses) s.push(C_(om[0], v));
      continue;
    }
    n("finger" + d, C_(om[d], i.fingers[d]));
  }
  n("thumb", MC(i.thumb)),
    n("web", SC(new ti(i.thumb[0][0], i.thumb[0][1], i.thumb[0][2]).normalize()));
  let o = new ti(i.forearm[0], i.forearm[1], i.forearm[2]).normalize(),
    r = i.sleeve || 0.36,
    a = 0.022,
    l = new vl().setFromUnitVectors(new ti(0, 0, 1), o),
    c = new vl(),
    u = new vl(),
    h = (d) => (
      u.slerpQuaternions(c, l, xl(0.002, 0.042, d.z)),
      (d.z -= a),
      d.applyQuaternion(u),
      (d.z += a),
      d
    );
  {
    let v = new yl(24),
      g = new ti(),
      x = [
        [-0.0085, -0.0015, Df, 0.6],
        [-0.009, 0.0022, Df, 1.3],
        [-0.006, 0.0026, Df, 1.3],
        [-0.0052, 0.002, gl, 0.75],
        [0.004, 0.0014, gl, 1],
        [0.011, 0.0016, gl, 0.7],
        [0.0122, 0.003, Df, 1.2],
        [0.0305, 0.0032, Df, 1.2],
        [0.0317, 0.0018, gl, 0.7],
        [0.04, 0.002, gl, 1],
        [0.054, 0.0024, gl, 1],
        [0.058, 0.0026, kf, 0.7],
        [0.058, -0.004, gl, 0.4],
      ];
    for (let [y, b, m, A] of x)
      for (let _ = 0; _ < 24; _++) {
        let M = ((_ + 0.5) / 24) * Math.PI * 2,
          E = Math.sin(M);
        v.v(
          h(
            g.set(
              (0.0296 + b) * Ff(Math.cos(M), 0.8),
              (E >= 0 ? 0.0185 + b : 0.0204 + b) * Ff(E, 0.8),
              y,
            ),
          ),
          m,
          A,
        );
      }
    n("cuff", v.geo(!0));
  }
  n(
    "strapTab",
    Lf(
      0.009,
      0.0215,
      0.0135,
      0.0076,
      0.0017,
      (d) => (d > 0.55 ? kf.map((v) => v * 0.75) : [9, 9, 9.6]),
      (d) => 0.0217 * Math.pow(1 - Math.pow(Math.min(0.999, Math.abs(d / 0.0328)), 2.5), 0.4),
      h,
    ),
  ),
    n(
      "pullTab",
      Lf(0.003, 0.004, 0.0065, 0.0115, 0.0022, pC, () => 0.022, h, !0),
    );
  {
    let d = [];
    for (let z = 0; z < 24; z++)
      d.push(z * 15),
        (z === 4 || z === 16) && d.push(z * 15 + 11.5),
        (z === 5 || z === 17) && d.push(z * 15 + 3.5);
    d.sort((z, H) => z - H);
    let v = d.length,
      g = d.indexOf(75),
      x = d.indexOf(255),
      y = new yl(v),
      b = new ti(),
      m = 0.04 + r,
      A = [
        [0.0415, 0],
        [0.04, 1],
        [0.044, 2],
        [0.049, 3],
        [0.055, 3],
        [0.061, 3],
        [0.0655, 4],
        [0.0685, 5],
      ],
      _ = [0.1415, 0.143, 0.157, 0.1582, 0.1662, 0.1674, 0.181, 0.1825],
      M = _.slice(),
      E = Math.ceil((m - 0.074) / 0.0052);
    for (let z = 0; z <= E; z++) {
      let H = 0.074 + ((m - 0.074) * z) / E;
      _.some((O) => Math.abs(O - H) < 0.0016) || M.push(H);
    }
    M.sort((z, H) => z - H);
    for (let z of M) A.push([z, 6]);
    let w = 0;
    for (let [z, H] of A)
      for (let O = 0; O < v; O++) {
        let q = (d[O] * Math.PI) / 180,
          U,
          T = 1,
          D = E_;
        if (H === 0) (U = 0.0292), (T = 0.4);
        else if (H === 1) (U = 0.0372), (T = 1.15);
        else if (H === 2) (U = 0.0377), (T = 1.1);
        else if (H === 3) {
          let C = Math.cos(q * 12);
          (U = 0.0368 + 0.0012 * C), (T = 0.62 + 0.26 * C);
        } else if (H === 4) (U = 0.0356), (T = 0.55);
        else if (H === 5) (U = 0.038), (T = 0.9);
        else {
          let C = (z - 0.0685) / (m - 0.0685),
            G = 0.0048 * Math.exp(-Math.pow((C - 0.13) / 0.11, 2)),
            j = 0.0048 * xl(0.62, 0.85, C),
            N =
              Math.pow(
                Math.abs(
                  Math.sin(
                    (Math.PI * z) / 0.027 + 1.7 * Math.sin(q + 0.5) + 0.8 * Math.sin(2 * q + 1.3),
                  ),
                ),
                0.6,
              ) *
                2 -
              1.25,
            Q =
              Math.pow(
                Math.abs(
                  Math.sin(
                    (Math.PI * z) / 0.034 + 1.9 * Math.sin(q - 0.8) + 0.7 * Math.sin(2 * q),
                  ),
                ),
                0.6,
              ) *
                2 -
              1.25,
            K = Math.sin(z * 40 + 2 * Math.sin(q * 2 + 1)) + 0.6 * Math.sin(3 * q + z * 25);
          (U =
            0.0405 +
            0.012 * Math.pow(C, 0.85) +
            0.0025 * Math.exp(-Math.pow((z - 0.082) / 0.012, 2)) +
            G * N +
            j * Q +
            0.0016 * K),
            (T = 0.78 + 0.26 * xl(-1.1, 0.5, (G * N + j * Q) / (G + j + 8e-4)) + 0.04 * K);
          let ie = vC(w);
          z > 0.1575 && z < 0.167
            ? ((D = gC), (T *= 0.85 + 0.25 * ie))
            : z > 0.1425 && z < 0.1815 && ((D = mC), (T *= 0.78 + 0.3 * ie));
        }
        H > 0 &&
          (O === g || O === x
            ? ((U += 0.0019), (T *= 1.3))
            : (Math.abs(O - g) === 1 || Math.abs(O - x) === 1) && (T *= 0.52)),
          b.set(Math.cos(q) * U, Math.sin(q) * U * 0.84, z),
          y.v(b, D, T),
          w++;
      }
    for (let z = 0; z < v; z++) y.v(b.set(0, 0, m + 0.006), E_, 0.3);
    y.collapse();
    let S = y.geo(!0);
    S.applyMatrix4(
      new rm()
        .makeTranslation(0, 0, a)
        .multiply(new rm().makeRotationFromQuaternion(l))
        .multiply(new rm().makeTranslation(0, 0, -a)),
    ),
      n("sleeve", S);
  }
  let p = {
    fabric: Ii(e),
    rubber: null,
    index: s.length ? s : null,
    knuckle: om[0].base.slice(),
  };
  return i.mirror && (P_(p.fabric), p.index && p.index.forEach(P_), (p.knuckle[0] *= -1)), p;
}
var hm = {
    model: [8, 8, 330, 84],
    maker: [8, 100, 560, 40],
    cal: [8, 146, 560, 40],
    prop: [8, 192, 700, 40],
    safe: [8, 240, 90, 34],
    semi: [110, 240, 90, 34],
    auto: [212, 240, 90, 34],
    rack: [8, 290, 300, 110],
    warn: [330, 290, 420, 110],
    optic: [580, 8, 300, 60],
    light: [580, 76, 300, 60],
    dots: [320, 240, 60, 34],
    r2: [8, 420, 56, 40],
    r4: [72, 420, 56, 40],
    r6: [136, 420, 56, 40],
    r8: [200, 420, 56, 40],
    r10: [264, 420, 56, 40],
    r12: [328, 420, 56, 40],
  },
  Uf = 1024,
  Nf = 512;
function TC() {
  let i = document.createElement("canvas");
  (i.width = Uf), (i.height = Nf);
  let e = i.getContext("2d");
  e.clearRect(0, 0, Uf, Nf), (e.textBaseline = "middle");
  let t = (u, h, f, p, d = "left") => {
      let [v, g, x, y] = hm[u];
      (e.font = f),
        (e.fillStyle = p),
        (e.textAlign = d),
        e.fillText(h, d === "left" ? v + 2 : v + x / 2, g + y / 2 + 1, x - 4);
    },
    n = '"PingFang SC", "PingFang SC", Arial, sans-serif',
    s = '"PingFang SC", "PingFang SC", monospace',
    o = '"PingFang SC", "PingFang SC", Impact, sans-serif',
    r = "rgba(196,198,194,0.92)";
  t("model", "PAC-9", `700 78px ${o}`, r),
    t("maker", "玄鲸兵工厂 · 港区装备", `600 30px ${n}`, r),
    t("cal", "CAL 5.8\xD740   SN PA-004217", `500 27px ${s}`, r),
    t("prop", "港务局装备 · 四号泊位武器库", `600 28px ${n}`, r),
    t("safe", "S", `700 30px ${n}`, r, "center"),
    t("semi", "1", `700 30px ${n}`, r, "center"),
    t("auto", "A", `700 30px ${n}`, "rgba(205,60,40,0.95)", "center"),
    t("rack", "B4-07", `800 104px ${o}`, "rgba(214,206,170,0.9)", "center");
  for (let u of [2, 4, 6, 8, 10, 12])
    t("r" + u, "T" + u, `600 30px ${s}`, "rgba(190,192,188,0.85)", "center");
  t("optic", "HX-2 反射瞄具", `700 44px ${n}`, r, "center"),
    t("light", "900 LM  IPX8", `600 40px ${n}`, r, "center");
  {
    let [u, h] = hm.warn;
    (e.fillStyle = r),
      (e.textAlign = "left"),
      (e.font = `600 24px ${n}`),
      ["警告：存放前必须清空弹膛", "仅限授权突击队员使用", "港务安全规程 44/7"].forEach((f, p) =>
        e.fillText(f, u + 2, h + 20 + p * 34),
      );
  }
  {
    let [u, h, f, p] = hm.dots;
    (e.fillStyle = r),
      e.beginPath(),
      e.arc(u + 12, h + p / 2, 7, 0, 7),
      e.fill(),
      (e.fillStyle = "rgba(205,60,40,0.95)"),
      e.beginPath(),
      e.arc(u + 40, h + p / 2, 7, 0, 7),
      e.fill();
  }
  e.globalCompositeOperation = "destination-out";
  let a = 7,
    l = () => ((a = (a * 16807) % 2147483647), a / 2147483647);
  for (let u = 0; u < 2600; u++) {
    e.fillStyle = `rgba(0,0,0,${0.25 + l() * 0.6})`;
    let h = l() < 0.9 ? 1 + l() * 1.5 : 2 + l() * 5;
    e.fillRect(l() * Uf, l() * Nf, h, h * (0.4 + l()));
  }
  let c = new xs(i);
  return (c.colorSpace = Vn), (c.anisotropy = 8), (c.generateMipmaps = !0), (c.minFilter = Ln), c;
}
function F_(i) {
  let e = [],
    t = [],
    n = [],
    s = [];
  for (let [l, c, u, h, f, p, d = 0] of i) {
    let [v, g, x, y] = hm[l],
      b = (f * x) / y,
      m = v / Uf,
      A = (v + x) / Uf,
      _ = 1 - g / Nf,
      M = 1 - (g + y) / Nf,
      E = e.length / 3,
      w;
    if (
      (p === "L"
        ? (w = [
            [c, u - f / 2, -(h + b / 2)],
            [c, u - f / 2, -(h - b / 2)],
            [c, u + f / 2, -(h - b / 2)],
            [c, u + f / 2, -(h + b / 2)],
          ])
        : p === "R"
          ? (w = [
              [c, u - f / 2, -(h - b / 2)],
              [c, u - f / 2, -(h + b / 2)],
              [c, u + f / 2, -(h + b / 2)],
              [c, u + f / 2, -(h - b / 2)],
            ])
          : (w = [
              [c - b / 2, u, -(h - f / 2)],
              [c + b / 2, u, -(h - f / 2)],
              [c + b / 2, u, -(h + f / 2)],
              [c - b / 2, u, -(h + f / 2)],
            ]),
      d)
    ) {
      let z = Math.cos(d),
        H = Math.sin(d),
        O = u,
        q = -h;
      for (let U of w) {
        let T = U[1] - O,
          D = U[2] - q;
        (U[1] = O + T * z - D * H), (U[2] = q + T * H + D * z);
      }
    }
    for (let z of w) e.push(z[0], z[1], z[2]);
    t.push(m, M, A, M, A, _, m, _);
    let S = p === "L" ? [-1, 0, 0] : p === "R" ? [1, 0, 0] : [0, 1, 0];
    for (let z = 0; z < 4; z++) n.push(S[0], S[1], S[2]);
    s.push(E, E + 1, E + 2, E, E + 2, E + 3);
  }
  let o = new nt();
  o.setAttribute("position", new He(e, 3)),
    o.setAttribute("uv", new He(t, 2)),
    o.setAttribute("normal", new He(n, 3)),
    o.setIndex(s);
  let r = new Qt({
      map: TC(),
      transparent: !0,
      roughness: 0.62,
      metalness: 0,
      depthWrite: !1,
      polygonOffset: !0,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
      side: Sn,
    }),
    a = new Qe(o, r);
  return (a.renderOrder = 2), a;
}
function U_(i, e) {
  let t = new ji();
  i.forEach((r, a) => (a ? t.lineTo(r[0], r[1]) : t.moveTo(r[0], r[1]))), t.closePath();
  let n = new H0(t);
  n.translate(0, 0, -e);
  {
    let r = 1e9,
      a = -1e9,
      l = 1e9,
      c = -1e9;
    for (let f of i)
      (r = Math.min(r, f[0])),
        (a = Math.max(a, f[0])),
        (l = Math.min(l, f[1])),
        (c = Math.max(c, f[1]));
    let u = n.attributes.position,
      h = n.attributes.uv;
    for (let f = 0; f < u.count; f++)
      h.setXY(f, (u.getX(f) - r) / (a - r), (u.getY(f) - l) / (c - l));
  }
  let s = new zn({
      transparent: !0,
      premultipliedAlpha: !0,
      depthWrite: !1,
      side: Sn,
      uniforms: {
        uBright: { value: 7 },
        uSun: { value: Mn.dir.clone() },
        uSunCol: { value: Mn.color.clone() },
        uZen: { value: en.zenith.clone() },
        uHor: { value: en.horizonAway.clone() },
        uTilt: { value: 0.1 },
      },
      vertexShader: `
    varying vec3 vView, vFwd, vRight, vUp, vWPos, vWN; varying vec2 vUv;
    uniform float uTilt;
    void main(){
      vUv = uv;
      vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = mv.xyz;
      vFwd = (modelViewMatrix * vec4(0.0, 0.0, -1.0, 0.0)).xyz; vRight = (modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz; vUp = (modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
      vWPos = (modelMatrix * vec4(position, 1.0)).xyz;
      vWN = normalize(mat3(modelMatrix) * normalize(vec3(0.0, -uTilt, 1.0)));   // real sights tilt the glass a few degrees
      gl_Position = projectionMatrix * mv;
    }`,
      fragmentShader: `
    varying vec3 vView, vFwd, vRight, vUp, vWPos, vWN; varying vec2 vUv;
    uniform float uBright; uniform vec3 uSun, uSunCol, uZen, uHor;
    void main(){
      vec3 d = normalize(vView), fw = normalize(vFwd);
      float k = max(dot(d, fw), 1e-3);
      vec2 a = vec2(dot(d, normalize(vRight)), dot(d, normalize(vUp))) / k;      // tangent of the angle off the bore axis
      float r = length(a), px = max(fwidth(r), 1e-5);
      float dotR = max(0.0011, px * 0.9), ringW = max(0.00045, px * 0.6);
      float dotI = 1.0 - smoothstep(dotR - px, dotR + px, r);
      float ring = 1.0 - smoothstep(ringW - px * 0.5, ringW + px, abs(r - 0.0128));
      float ang = atan(a.y, a.x);
      float tick = (1.0 - smoothstep(0.0, px * 1.2 + 0.0004, min(abs(a.x), abs(a.y)))) * step(0.0128, r) * (1.0 - smoothstep(0.0165, 0.0175, r));
      float ret = clamp(dotI + ring * 0.8 + tick * 0.8, 0.0, 1.0);
      // faint halo so the bloom has something to hold on to
      ret += 0.05 * exp(-r * r / 0.00002);
      vec3 retCol = vec3(1.0, 0.11, 0.045) * ret * uBright;
      // coated glass: sky/sun reflection through a ruby-teal dichroic coating, stronger at grazing angles
      vec3 wv = normalize(vWPos - cameraPosition); vec3 n = normalize(vWN); if (dot(n, wv) > 0.0) n = -n;
      vec3 rf = reflect(wv, n);
      float fres = pow(1.0 - abs(dot(wv, n)), 3.0);
      vec3 sky = mix(uHor, uZen, clamp(rf.y * 1.4 + 0.2, 0.0, 1.0));
      float sd = max(dot(rf, uSun), 0.0);
      sky += uSunCol * (pow(sd, 6.0) * 0.6 + pow(sd, 90.0) * 6.0);
      // blue -> amber dichroic coating across the glass, a soft diagonal sheen band, and a thin dark edge
      float band = smoothstep(0.25, 0.5, vUv.x * 0.6 + vUv.y) * (1.0 - smoothstep(0.62, 0.95, vUv.x * 0.6 + vUv.y));
      vec3 coat = mix(vec3(0.30, 0.50, 0.95), vec3(1.0, 0.62, 0.28), clamp(fres * 2.2 + vUv.y * 0.75 - 0.15, 0.0, 1.0));
      vec2 e = abs(vUv - 0.5) * 2.0; float edge = smoothstep(0.90, 1.0, max(e.x, e.y));
      float refl = 0.12 + 0.60 * fres + 0.07 * band;
      // faint emitter glow that stays visible off-axis (what you see of a powered sight from the hip)
      vec2 eg = (vUv - vec2(0.5, 0.16)) * vec2(1.0, 1.6); retCol += vec3(1.0, 0.10, 0.04) * 0.20 * exp(-dot(eg, eg) * 60.0) * (1.0 - smoothstep(0.985, 0.9995, k));
      vec3 col = (sky * 1.5 + vec3(0.03, 0.035, 0.045)) * coat * refl * (1.0 - edge) + retCol;
      float alpha = clamp(0.20 + 0.32 * fres + 0.05 * band + 0.6 * edge, 0.0, 0.94);
      gl_FragColor = vec4(col, alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
    }),
    o = new Qe(n, s);
  return (o.renderOrder = 5), o;
}
function N_() {
  let i = [],
    e = [],
    t = [],
    n = [],
    s = (d, v, g, x, y) => {
      let b = i.length / 3;
      for (let m of [d, v, g, x]) i.push(m[0], m[1], m[2]);
      e.push(0, 0, 1, 0, 1, 1, 0, 1);
      for (let m = 0; m < 4; m++) t.push(y);
      n.push(b, b + 1, b + 2, b, b + 2, b + 3);
    };
  s([-0.13, -0.13, -0.03], [0.13, -0.13, -0.03], [0.13, 0.13, -0.03], [-0.13, 0.13, -0.03], 0),
    s(
      [-0.13 * 0.7, -0.13 * 0.7, -0.09],
      [0.13 * 0.7, -0.13 * 0.7, -0.09],
      [0.13 * 0.7, 0.13 * 0.7, -0.09],
      [-0.13 * 0.7, 0.13 * 0.7, -0.09],
      0,
    );
  let r = 0.065,
    a = 0.34;
  s([-r, 0, 0.01], [r, 0, 0.01], [r, 0, -a], [-r, 0, -a], 1),
    s([0, -r, 0.01], [0, r, 0.01], [0, r, -a], [0, -r, -a], 1);
  let l = 0.17,
    c = 0.05,
    u = 0.035;
  s([-l, -c, u], [l, -c, u], [l, c, u], [-l, c, u], 2),
    s([-l, 0, u + c], [l, 0, u + c], [l, 0, u - c], [-l, 0, u - c], 2),
    s([-0.05, -0.05, -0.01], [0.05, -0.05, -0.01], [0.05, 0.05, -0.01], [-0.05, 0.05, -0.01], 3),
    s([-0.03, -0.03, 0.02], [0.03, -0.03, 0.02], [0.03, 0.03, 0.02], [-0.03, 0.03, 0.02], 4);
  let h = new nt();
  h.setAttribute("position", new He(i, 3)),
    h.setAttribute("uv", new He(e, 2)),
    h.setAttribute("aType", new He(t, 1)),
    h.setIndex(n);
  let f = new zn({
      transparent: !0,
      depthWrite: !1,
      blending: hr,
      side: Sn,
      uniforms: {
        uSeed: { value: 0 },
        uInt: { value: 0 },
        uHeat: { value: 0 },
        uJet: { value: 1 },
      },
      vertexShader: `attribute float aType; varying vec2 vUv; varying float vType;
    void main(){ vUv = uv; vType = aType; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec2 vUv; varying float vType; uniform float uSeed, uInt, uHeat, uJet;
    float h1(float n){ return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453); }
    void main(){
      vec2 p = vUv * 2.0 - 1.0; float r = length(p), a = atan(p.y, p.x); float I = 0.0; vec3 tintc = vec3(1.0, 0.50, 0.16);
      if (vType < 0.5) {
        float n1 = 3.0 + floor(h1(1.0) * 3.0), n2 = 5.0 + floor(h1(2.0) * 4.0);
        float pet = pow(abs(cos(a * n1 * 0.5 + h1(3.0) * 6.283)), 5.0) * (0.55 + 0.45 * h1(4.0));
        pet += pow(abs(cos(a * n2 * 0.5 + h1(5.0) * 6.283)), 14.0) * 0.55;
        float reach = 0.35 + 0.65 * pet;
        I = (0.25 + pet) * smoothstep(reach, reach * 0.15, r) * (0.75 + 0.25 * sin(r * 26.0 + h1(6.0) * 20.0));
      } else if (vType < 1.5) {
        float y = vUv.y, x = p.x * (1.0 + 0.5 * sin(y * 17.0 + h1(7.0) * 30.0) * y);
        float wdt = mix(0.20, 0.75, smoothstep(0.0, 0.35, y)) * (1.0 - y * 0.75);
        I = exp(-x * x / (wdt * wdt * 0.35)) * pow(1.0 - y, 1.4) * (0.7 + 0.3 * sin(y * 31.0 + h1(8.0) * 9.0)) * 0.9;
      } else if (vType < 2.5) {
        float u = abs(p.x), len = 0.55 + 0.45 * h1(9.0 + step(0.0, p.x));
        float wv = p.y * (1.0 + u * 3.0) + 0.12 * sin(u * 14.0 + h1(10.0) * 20.0) * u;
        I = exp(-wv * wv * 22.0) * smoothstep(len, 0.06, u) * smoothstep(0.02, 0.10, u) * 0.85 * uJet;
      } else if (vType < 3.5) {
        I = exp(-r * r * 5.0) * 2.4 * smoothstep(1.0, 0.6, r); tintc = vec3(1.0, 0.82, 0.58);
      } else {
        gl_FragColor = vec4(vec3(1.0, 0.28, 0.06) * exp(-r * r * 4.0) * smoothstep(1.0, 0.5, r) * uHeat, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        return;
      }
      vec3 col = mix(tintc, vec3(1.0, 0.90, 0.70), clamp(I * I * 0.7, 0.0, 1.0)) * I * uInt;
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
    }),
    p = new Qe(h, f);
  return (p.renderOrder = 10), (p.frustumCulled = !1), p;
}
var Wv = { value: 1 },
  AC = `
varying vec3 vObjP; varying vec3 vWNrm; varying vec3 vONrm; uniform float uKind; uniform float uRain;
float dh3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float dn3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
return mix(mix(mix(dh3(i), dh3(i + vec3(1,0,0)), f.x), mix(dh3(i + vec3(0,1,0)), dh3(i + vec3(1,1,0)), f.x), f.y),
           mix(mix(dh3(i + vec3(0,0,1)), dh3(i + vec3(1,0,1)), f.x), mix(dh3(i + vec3(0,1,1)), dh3(i + vec3(1,1,1)), f.x), f.y), f.z); }
vec2 dh2(vec2 p){ return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
vec2 dDrops(vec2 uv, float cell, float seed){ vec2 g = uv / cell, i = floor(g), f = fract(g); float best = 0.0;
for (int a = -1; a <= 1; a++) for (int b = -1; b <= 1; b++) { vec2 o = vec2(float(a), float(b)); vec2 r = dh2(i + o + seed);
  float keep = step(0.70, fract(r.x * 7.31 + r.y * 3.17)); vec2 c = o + 0.2 + 0.6 * r; float rad = (0.16 + 0.22 * fract(r.x * 13.7)) * keep;
  float d = length(f - c); best = max(best, sqrt(max(rad * rad - d * d, 0.0))); }
return vec2(best * cell, step(1e-6, best)); }
vec3 dBump(vec3 N, float h){ vec3 dpdx = dFdx(-vViewPosition), dpdy = dFdy(-vViewPosition); float dhx = dFdx(h), dhy = dFdy(h);
vec3 r1 = cross(dpdy, N), r2 = cross(N, dpdx); float det = dot(dpdx, r1); vec3 g = sign(det) * (dhx * r1 + dhy * r2);
return normalize(abs(det) * N - g); }
`,
  RC = `
vec3 dP = vObjP; vec3 dAn = abs(vONrm);
vec2 dUV = (dAn.y > dAn.x && dAn.y > dAn.z) ? dP.xz : (dAn.x > dAn.z ? dP.zy : dP.xy);
float dSm = dn3(dP * 36.0), dSm2 = dn3(dP * 150.0 + 7.0), dFine = dn3(dP * 2400.0);
float dHt = 0.0, dR = 0.0;
if (uKind < 0.5) {
float scuff = smoothstep(0.70, 0.9, dn3(dP * vec3(420.0, 420.0, 26.0) + 3.0));
float smudge = smoothstep(0.55, 0.8, dn3(dP * 55.0 + 11.0));
dR = (dSm - 0.5) * 0.20 + (dSm2 - 0.5) * 0.10 + (dFine - 0.5) * 0.08 + scuff * 0.18 - smudge * 0.12;
dHt = dFine * 0.000010 - scuff * 0.000015;
} else if (uKind < 1.5) {
float ring = sin(dP.z * 5200.0) * 0.5 + 0.5, streak = dn3(vec3(dP.z * 950.0, 1.0, 2.0));
dR = (streak - 0.5) * 0.26 + (dSm - 0.5) * 0.14 + (dFine - 0.5) * 0.10;
dHt = ring * 0.000014 + dFine * 0.000010;
} else {
float st = dn3(dP * 1500.0) * 0.6 + dn3(dP * 3100.0 + 5.0) * 0.4;
dR = (dSm - 0.5) * 0.18 + (st - 0.5) * 0.14 - smoothstep(0.6, 0.85, dSm2) * 0.10;
dHt = st * 0.000075;
}
float dUp = smoothstep(0.30, 0.75, vWNrm.y) * uRain;
vec2 dD1 = dDrops(dUV, 0.0046, 3.0), dD2 = dDrops(dUV + 0.31, 0.0023, 9.0);
float dDrop = max(dD1.y, dD2.y) * dUp, dDropH = max(dD1.x, dD2.x) * dUp;
float dWet = dUp * (0.5 + 0.5 * smoothstep(0.3, 0.7, dSm));
roughnessFactor = clamp(roughnessFactor + dR, 0.10, 1.0);
roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.5, dWet);
roughnessFactor = mix(roughnessFactor, 0.10, dDrop);
diffuseColor.rgb *= 1.0 - 0.18 * dWet;
`,
  CC = `
normal = dBump(normal, dHt + dDropH * 0.32);
`;
function Bf(i, e) {
  return (
    (i.onBeforeCompile = (t) => {
      (t.uniforms.uKind = { value: e }),
        (t.uniforms.uRain = Wv),
        (t.vertexShader = t.vertexShader
          .replace(
            "#include <common>",
            `#include <common>
varying vec3 vObjP; varying vec3 vWNrm; varying vec3 vONrm;`,
          )
          .replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
vObjP = position; vONrm = normal; vWNrm = normalize(mat3(modelMatrix) * normal);`,
          )),
        (t.fragmentShader = t.fragmentShader
          .replace(
            "#include <common>",
            `#include <common>
` + AC,
          )
          .replace(
            "#include <roughnessmap_fragment>",
            `#include <roughnessmap_fragment>
` + RC,
          )
          .replace(
            "#include <normal_fragment_maps>",
            `#include <normal_fragment_maps>
` + CC,
          ));
    }),
    (i.customProgramCacheKey = () => "pac9-detail-" + e),
    i
  );
}
var WEAPON_DEFS = {
    pac9: {
      id: "pac9",
      name: "PAC-9 冲锋枪",
      mode: "auto",
      damage: 26,
      rpm: 720,
      magSize: 30,
      reserve: 150,
      spreadBase: 0.0125,
      range: 300,
      pellets: 1,
      reloadTactical: 2.1,
      reloadEmpty: 2.72,
    },
    shotgun: {
      id: "shotgun",
      name: "玄鲸 M4 霰弹枪",
      mode: "pump",
      damage: 13,
      rpm: 68,
      magSize: 6,
      reserve: 36,
      spreadBase: 0.055,
      range: 60,
      pellets: 8,
      reloadTactical: 2.4,
      reloadEmpty: 3.1,
    },
    rifle: {
      id: "rifle",
      name: "玄鲸 DMR 精确步枪",
      mode: "semi",
      damage: 95,
      rpm: 150,
      magSize: 5,
      reserve: 30,
      spreadBase: 0.004,
      range: 600,
      pellets: 1,
      reloadTactical: 2.3,
      reloadEmpty: 2.9,
    },
    gatling: {
      id: "gatling",
      name: "玄鲸转管机枪",
      mode: "auto",
      damage: 20,
      rpm: 1200,
      magSize: 200,
      reserve: 600,
      spreadBase: 0.02,
      range: 250,
      pellets: 1,
      reloadTactical: 4.5,
      reloadEmpty: 5.5,
      spinUp: !0,
    },
    rocket: {
      id: "rocket",
      name: "玄鲸火箭筒",
      mode: "semi",
      damage: 150,
      rpm: 60,
      magSize: 4,
      reserve: 12,
      spreadBase: 0.002,
      range: 500,
      pellets: 1,
      reloadTactical: 2.8,
      reloadEmpty: 3.4,
      radius: 5,
      speed: 40,
      projectile: !0,
    },
  },
  DROP_TABLE = { hound: "shotgun", gull: "rifle", sentinel: "gatling" },
  loadoutState = {
    owned: ["pac9"],
    current: 0,
    pool: {
      pac9: { mag: 30, reserve: 150 },
      shotgun: { mag: 6, reserve: 0 },
      rifle: { mag: 5, reserve: 0 },
      gatling: { mag: 200, reserve: 0 },
      rocket: { mag: 4, reserve: 0 },
    },
    droppedFirst: {},
    pickups: [],
  };
var gi = W,
  fm = Lt,
  Gv = 30,
  B_ = 150,
  O_ = 720,
  H_ = 26,
  V_ = 300,
  eu = { p: [0.118, -0.122, -0.275], r: [0.034, 0.085, -0.03] },
  qv = { p: [0, -mi.sightY, -0.135], r: [0, 0, 0] },
  tu = { p: [-0.035, 0.004, 0.03], r: [-0.04, 0.62, 0.26] },
  nu = { p: [-0.03, 0.1, -0.02], r: [0.46, 0.22, -0.8] },
  W_ = 2.1,
  G_ = 2.72,
  Yo = (i) => ((i = Fo(i)), i * i * i * (i * (6 * i - 15) + 10)),
  pa = (i, e) => ({ x: 0, v: 0, k: i, c: e });
function ma(i, e, t) {
  let n = t > 0.012 ? Math.ceil(t / 0.008) : 1,
    s = t / n;
  for (let o = 0; o < n; o++) (i.v += ((e - i.x) * i.k - i.v * i.c) * s), (i.x += i.v * s);
  return i.x;
}
var i0 = (i, e, t, n = "XYZ") => new fm().setFromEuler(new In(i, e, t, n));
async function dm(i) {
  let e = new wt();
  e.name = "viewmodel-pac9";
  let ACT = null,
    vmVisible = !0,
    VIEWS = { pac9: null, shotgun: null, rifle: null };
  let t = w_(),
    n = { anodized_black: 2, gunmetal: 2, brass: 4, glove_fabric: 3, rubber: 4 },
    s = (Me) => i.mats.get(Me, { triplanar: !0, vertexColors: !0, scale: n[Me] || 1 }),
    o = (Me, we) => {
      let be = new Qe(Me, we);
      return (be.castShadow = !1), (be.receiveShadow = !0), (be.frustumCulled = !1), be;
    },
    r = new Qt({
      color: new Ve(0.0085, 0.009, 0.0105),
      roughness: 0.4,
      metalness: 0.45,
      vertexColors: !0,
    });
  (r.name = "pac9_anodised"), Bf(r, 0);
  let a = new Qt({ color: 16777215, roughness: 0.92, metalness: 0, vertexColors: !0 });
  a.name = "pac9_matte";
  let l = new Qt({
    color: new Ve(0.016, 0.016, 0.0165),
    roughness: 0.5,
    metalness: 0.7,
    vertexColors: !0,
  });
  (l.name = "pac9_phosphate"), Bf(l, 1);
  let c = new Qt({
    color: new Ve(0.0125, 0.0128, 0.0135),
    roughness: 0.62,
    metalness: 0,
    vertexColors: !0,
  });
  (c.name = "pac9_polymer"), Bf(c, 2);
  let u = new Qt({
    color: new Ve(0.105, 0.08, 0.05),
    roughness: 0.62,
    metalness: 0,
    vertexColors: !0,
  });
  (u.name = "pac9_polymer_tan"),
    Bf(u, 2),
    e.add(o(t.ano, r), o(t.gun, l), o(t.poly, c), o(t.plain, a));
  let h = o(t.bolt, l);
  e.add(h);
  let f = new wt(),
    p = new gi().fromArray(mi.magPos);
  f.position.copy(p);
  let d = o(t.round, s("brass"));
  f.add(o(t.mag, u), d), e.add(f);
  let v = null,
    g = null,
    x = null;
  try {
    (v = F_([
      ["model", -0.0168, -0.0315, 0.064, 0.0095, "L"],
      ["maker", -0.0168, -0.042, 0.064, 0.003, "L"],
      ["cal", -0.0168, -0.0465, 0.064, 0.0028, "L"],
      ["prop", -0.0168, -0.071, 0.066, 0.0026, "L"],
      ["auto", -0.0168, -0.027, -0.0335, 0.0036, "L"],
      ["semi", -0.0168, -0.0262, -0.049, 0.0036, "L"],
      ["safe", -0.0168, -0.0362, -0.062, 0.0036, "L"],
      ["rack", -0.0168, -0.004, -0.205, 0.02, "L"],
      ["warn", -0.0181, -0.01, 0.03, 0.0062, "L"],
      ["optic", -0.0195, 0.0735, 0.021, 0.0024, "L"],
      ["model", 0.0168, -0.0315, 0.068, 0.0095, "R"],
      ["warn", 0.0168, -0.066, 0.066, 0.0075, "R"],
      ["rack", 0.0168, -0.004, -0.205, 0.02, "R"],
      ["auto", 0.0168, -0.027, -0.0335, 0.0036, "R"],
      ["safe", 0.0168, -0.0362, -0.062, 0.0036, "R"],
      ["optic", 0.0195, 0.0735, 0.021, 0.0024, "R"],
      ["cal", 0.0181, 0.0245, -0.055, 0.0026, "R"],
      ["r2", 0, 0.04365, -0.0816, 0.003, "T"],
      ["r4", 0, 0.04365, -0.0616, 0.003, "T"],
      ["r6", 0, 0.04365, 0.0584, 0.003, "T"],
      ["r8", 0, 0.04365, 0.0784, 0.003, "T"],
      ["r10", 0, 0.04365, 0.0984, 0.003, "T"],
      ["r12", 0, 0.04365, 0.1184, 0.003, "T"],
    ])),
      (v.castShadow = !1),
      (v.receiveShadow = !0),
      (v.frustumCulled = !1),
      e.add(v);
  } catch (Me) {
    console.warn("[weapon] markings skipped: " + Me);
  }
  (g = U_(
    mi.window.map((Me) => [Me[0] * 1.01, (Me[1] - mi.sightY) * 1.01 + mi.sightY]),
    mi.lensF + 0.0025,
  )),
    (g.frustumCulled = !1),
    e.add(g),
    (x = N_()),
    x.position.fromArray(mi.muzzle),
    (x.visible = !1),
    e.add(x);
  let y = (Me, we, be) => {
      let Oe = new gi(we[0], we[1], we[2]).normalize().applyQuaternion(Me.clone().invert());
      return be && (Oe.x *= -1), [Oe.x, Oe.y, Oe.z];
    },
    b = i0(-0.24, 0, 0).multiply(i0(0, 0, -Math.PI / 2)),
    m = Vv({
      mirror: !1,
      fingers: [null, [0.62, 1.72, 0.8, 0], [0.68, 1.7, 0.8, -0.03], [0.74, 1.66, 0.8, -0.09]],
      indexPoses: [
        [0.1, 0.16, 0.1, 0.05],
        [0.46, 1.15, 0.5, 0],
      ],
      thumb: [y(b, [-0.85, 0.05, -0.5]), y(b, [-0.6, -0.05, -0.8]), y(b, [-0.05, -0.2, -0.97])],
      forearm: y(b, [0.27, -0.44, 0.86]),
      sleeve: 0.34,
    }),
    A = new wt();
  A.quaternion.copy(b),
    A.position.fromArray(mi.grip).sub(new gi(0.006, -0.031, -0.085).applyQuaternion(b));
  let _ = s("glove_fabric");
  A.add(o(m.fabric, _));
  let M = o(m.index[0].clone(), _);
  A.add(M), e.add(A);
  let E = m.index[0].attributes,
    w = m.index[1].attributes,
    S = -1;
  function z(Me) {
    if (Math.abs(Me - S) < 0.004) return;
    S = Me;
    let we = M.geometry.attributes.position,
      be = M.geometry.attributes.normal,
      Oe = E.position.array,
      pt = w.position.array,
      ut = E.normal.array,
      nn = w.normal.array;
    for (let bt = 0; bt < Oe.length; bt++)
      (we.array[bt] = Oe[bt] + (pt[bt] - Oe[bt]) * Me),
        (be.array[bt] = ut[bt] + (nn[bt] - ut[bt]) * Me);
    (we.needsUpdate = !0), (be.needsUpdate = !0);
  }
  let H = i0(0, 0, Math.PI / 2).multiply(i0(0.06, 0, 0)),
    O = Vv({
      mirror: !0,
      fingers: [
        [1.27, 1.42, 0.75, 0.02],
        [1.3, 1.45, 0.75, 0],
        [1.3, 1.45, 0.75, -0.02],
        [1.33, 1.45, 0.75, -0.05],
      ],
      thumb: [y(H, [0, 0.25, -0.97], !0), y(H, [0.05, 0.1, -0.99], !0), y(H, [0, 0, -1], !0)],
      forearm: y(H, [-0.5, -0.35, 0.79], !0),
      sleeve: 0.34,
    }),
    q = new wt();
  q.add(o(O.fabric, _)), e.add(q);
  let U = new gi(0, -0.015, -0.055),
    T = (Me, we, be = U) => ({
      q: Me.clone(),
      p: new gi(we[0], we[1], we[2]).sub(be.clone().applyQuaternion(Me)),
    }),
    D = (Me, we, be, Oe, pt = null) => ({
      q: pt ? pt.clone() : Me.q.clone(),
      p: Me.p.clone().add(new gi(we, be, Oe)),
    }),
    C = i0(0, 0, Math.PI / 2).multiply(i0(0.12, 0, 0)),
    G = T(H, [-0.015, -0.062, -0.236]),
    j = T(C, [-0.0135, -0.15, -0.0745]),
    N = D(j, -0.035, -0.02, 0.01),
    Q = D(j, -0.06, -0.3, 0.13, C.clone().multiply(i0(-0.5, 0, 0.25))),
    K = D(j, 0, -0.035, 0.004),
    ie = D(j, -0.004, -0.06, 0),
    F = D(j, 0, -0.012, 0),
    X = i0(-0.6, 0, 0).multiply(
      new fm().setFromRotationMatrix(
        new Ye().makeBasis(new gi(0, 0, 1), new gi(-1, 0, 0), new gi(0, -1, 0)),
      ),
    ),
    ne = T(
      X,
      [mi.handlePos[0] - 0.004, mi.handlePos[1], mi.handlePos[2]],
      new gi(0, -0.024, -0.118),
    ),
    re = D(ne, 0, 0, mi.boltTravel),
    $ = [
      [0, G],
      [0.1, G],
      [0.36, N],
      [0.44, j],
      [0.5, j],
      [0.8, Q],
      [0.98, Q],
      [1.28, K],
      [1.35, j],
      [1.45, ie],
      [1.52, F],
      [1.62, j],
      [1.7, N],
      [2.02, G],
      [9, G],
    ],
    ue = [
      ...$.slice(0, 12),
      [1.7, N],
      [1.96, ne],
      [2.02, ne],
      [2.14, re],
      [2.19, re],
      [2.26, ne],
      [2.36, ne],
      [2.66, G],
      [9, G],
    ],
    me = 0.47,
    ee = 1.345,
    B = 2.02,
    P = 2.14,
    V = 2.19,
    Y = new gi(),
    L = new fm(),
    Z = new fm(),
    J = new gi(),
    oe = new gi(),
    fe = new gi();
  function le(Me, we) {
    let be = 0;
    for (; be < Me.length - 2 && we > Me[be + 1][0]; ) be++;
    let Oe = Me[be],
      pt = Me[be + 1],
      ut = Yo((we - Oe[0]) / Math.max(1e-4, pt[0] - Oe[0]));
    Y.copy(Oe[1].p).lerp(pt[1].p, ut), L.copy(Oe[1].q).slerp(pt[1].q, ut);
  }
  q.position.copy(G.p), q.quaternion.copy(G.q);
  let R = C.clone().invert();
  ACT = {
    id: "pac9",
    root: e,
    flash: x,
    bolt: h,
    boltTravel: mi.boltTravel,
    mag: d,
    muzzle: mi.muzzle,
    eject: mi.eject,
    finger: z,
    reloadVisual(Pt, Je) {
      le(Je.empty ? ue : $, Pt),
        q.position.copy(Y),
        q.quaternion.copy(L),
        Pt >= me && Pt < ee
          ? (Z.copy(L).multiply(R),
            f.quaternion.copy(Z),
            f.position.copy(p).sub(j.p).applyQuaternion(Z).add(Y))
          : (f.quaternion.identity(), f.position.copy(p));
    },
    reloadDone() {
      q.position.copy(G.p), q.quaternion.copy(G.q);
    },
    resetVisual() {
      (d.visible = !0),
        (f.visible = !0),
        f.position.copy(p),
        f.quaternion.identity(),
        q.position.copy(G.p),
        q.quaternion.copy(G.q);
    },
  };
  function cloneHand(src, pos) {
    let g = new wt();
    for (let child of src.children)
      if (child.isMesh) {
        let mm = new Qe(child.geometry.clone(), child.material);
        (mm.castShadow = !1), (mm.receiveShadow = !0), (mm.frustumCulled = !1);
        g.add(mm);
      }
    return g.position.copy(pos), g;
  }
  function matBf(hex, rough, metal, kind, name) {
    let m = new Qt({ color: new Ve(hex), roughness: rough, metalness: metal, vertexColors: !0 });
    return (m.name = name), Bf(m, kind), m;
  }
  function bindFinger(hand, base, tip) {
    let idx = hand.children.length ? hand.children[hand.children.length - 1] : null;
    if (!idx || !idx.isMesh || !idx.geometry || idx.geometry.attributes.position.count !== base.attributes.position.count) return null;
    let E = base.attributes,
      w = tip.attributes,
      S = -1;
    return (Me) => {
      if (Math.abs(Me - S) < 0.004) return;
      S = Me;
      let we = idx.geometry.attributes.position,
        be = idx.geometry.attributes.normal,
        Oe = E.position.array,
        pt = w.position.array,
        ut = E.normal.array,
        nn = w.normal.array;
      for (let bt = 0; bt < Oe.length; bt++)
        (we.array[bt] = Oe[bt] + (pt[bt] - Oe[bt]) * Me),
          (be.array[bt] = ut[bt] + (nn[bt] - ut[bt]) * Me);
      (we.needsUpdate = !0), (be.needsUpdate = !0);
    };
  }
  function RB(w, h, d, r, x, y, z, mat, color, boost = 0, rot = null) {
    return o(Rt(w, h, d, r, x, y, -z, color, boost, rot), mat);
  }
  function TB(profile, seg, mat, color, boost = 0, x = 0, y = 0) {
    return o(Cn(profile, seg, color, boost, x, y), mat);
  }
  function railTooth(za, y, mat, color, boost) {
    return o(
      qo(
        [
          [-0.0106, y],
          [0.0106, y],
          [0.0106, y + 0.0016],
          [0.0065, y + 0.005],
          [-0.0065, y + 0.005],
          [-0.0106, y + 0.0016],
        ],
        -za,
        -za + 0.0046,
        5e-4,
        color,
        boost,
      ),
      mat,
    );
  }
  function buildShotgun() {
    let root = new wt();
    root.name = "viewmodel-shotgun";
    let steel = matBf(0x2c3138, 0.4, 0.84, 1, "shotgun_steel"),
      darkSteel = matBf(0x1c1f24, 0.5, 0.8, 0, "shotgun_dark"),
      wood = s("wood_dark"),
      rubber = s("rubber"),
      brass = s("brass"),
      gun = s("gunmetal");
    let Y0 = 0.03,
      ST = [1, 1, 1],
      WD = [1.18, 0.84, 0.52],
      GU = [0.9, 0.92, 0.98];
    // barrel (lathe, bore axis Y0)
    root.add(
      TB(
        [
          [0.014, 0.04],
          [0.0155, 0.04],
          [0.0155, 0.3],
          [0.0145, 0.43],
          [0.014, 0.44],
        ],
        20,
        gun,
        GU,
        0.2,
        0,
        Y0,
      ),
    );
    // barrel shank / chamber collar
    root.add(
      TB(
        [
          [0.011, 0.015],
          [0.017, 0.015],
          [0.018, 0.03],
          [0.018, 0.05],
          [0.017, 0.07],
          [0.011, 0.07],
        ],
        16,
        steel,
        ST,
        3,
        0,
        Y0,
      ),
    );
    // ventilated top rib
    root.add(o(qo([[-0.004, 0], [0.004, 0], [0.004, 0.0035], [-0.004, 0.0035]], 0.02, 0.4, 3e-4, ST, 0.2).translate(0, Y0 + 0.0135, 0), darkSteel));
    // magazine tube below barrel
    root.add(
      TB(
        [
          [0.011, -0.03],
          [0.0125, -0.03],
          [0.0125, 0.32],
          [0.012, 0.34],
          [0.011, 0.34],
        ],
        16,
        darkSteel,
        [0.85, 0.88, 0.95],
        0.15,
        0,
        -0.002,
      ),
    );
    // tube end cap (brass)
    root.add(
      TB(
        [
          [0.011, 0.335],
          [0.014, 0.335],
          [0.0145, 0.342],
          [0.013, 0.35],
          [0.0125, 0.352],
          [0.0115, 0.352],
        ],
        16,
        brass,
        [1.15, 0.95, 0.6],
        0.1,
        0,
        -0.002,
      ),
    );
    // barrel band
    root.add(
      TB(
        [
          [0.0125, 0.33],
          [0.0185, 0.33],
          [0.0195, 0.336],
          [0.0195, 0.348],
          [0.0185, 0.354],
          [0.0125, 0.354],
        ],
        16,
        steel,
        ST,
        2,
        0,
        0.012,
      ),
    );
    // receiver (side-profile extrusion, chamfered, barrel socket + loading port)
    root.add(
      o(
        xr(
          [
            [-0.2, -0.024],
            [-0.2, 0.016],
            [0.02, 0.016],
            [0.04, 0.024],
            [0.04, 0.03],
            [0.04, 0.01],
            [0.04, -0.02],
            [0.018, -0.034],
            [-0.02, -0.034],
            [-0.03, -0.05],
            [-0.11, -0.05],
            [-0.2, -0.024],
          ],
          -0.018,
          0.018,
          0.003,
          ST,
          3,
        ),
        steel,
      ),
    );
    // ejection port (right side inset)
    root.add(RB(0.003, 0.016, 0.05, 0.001, 0.0198, 0.003, -0.02, darkSteel, [0.35, 0.35, 0.4], 0));
    // loading port (bottom inset)
    root.add(RB(0.02, 0.004, 0.06, 0.0015, 0, -0.0345, -0.04, darkSteel, [0.35, 0.35, 0.4], 0));
    // top picatinny rail
    root.add(RB(0.022, 0.004, 0.09, 0.001, 0, 0.0185, 0.025, steel, ST, 2));
    for (let za = 0.06; za >= -0.015; za -= 0.0096) root.add(railTooth(za, 0.0205, steel, ST, 2));
    // bead sight (brass)
    let bead = o(new ls(0.0055, 10, 10), brass);
    bead.position.set(0, Y0 + 0.0165, -0.428), root.add(bead);
    // pump forend (wood) + action bars
    let pump = new wt();
    pump.add(
      o(
        qo(
          [
            [-0.024, -0.022],
            [0.024, -0.022],
            [0.027, -0.006],
            [0.024, 0.02],
            [-0.024, 0.02],
            [-0.027, -0.006],
          ],
          -0.105,
          0.105,
          0.004,
          WD,
          0.35,
        ),
        wood,
      ),
    );
    for (let zz = -0.06; zz <= 0.06; zz += 0.04) pump.add(RB(0.05, 0.003, 0.008, 0.001, 0, 0.0, zz, darkSteel, [0.3, 0.3, 0.34], 0));
    pump.add(RB(0.006, 0.004, 0.12, 0.001, -0.017, 0.006, 0.1, steel, ST, 2));
    pump.add(RB(0.006, 0.004, 0.12, 0.001, 0.017, 0.006, 0.1, steel, ST, 2));
    pump.position.set(0, -0.002, -0.22), root.add(pump);
    // wood stock (curved comb + integrated pistol grip)
    root.add(
      o(
        xr(
          [
            [-0.19, -0.028],
            [-0.19, 0.012],
            [-0.205, 0.013],
            [-0.26, 0.02],
            [-0.35, 0.016],
            [-0.405, 0.008],
            [-0.408, -0.01],
            [-0.405, -0.02],
            [-0.32, -0.028],
            [-0.245, -0.072],
            [-0.212, -0.085],
            [-0.202, -0.068],
            [-0.196, -0.044],
            [-0.19, -0.028],
          ],
          -0.02,
          0.02,
          0.004,
          WD,
          0.35,
        ),
        wood,
      ),
    );
    // rubber butt pad
    root.add(
      o(
        xr(
          [
            [-0.405, 0.008],
            [-0.408, -0.01],
            [-0.405, -0.02],
            [-0.402, 0.008],
          ],
          -0.0205,
          0.0205,
          0.001,
          [0.85, 0.85, 0.9],
          0.1,
        ),
        rubber,
      ),
    );
    // trigger guard (wire loop)
    root.add(
      o(
        sm(
          Fn(
            [
              [-0.03, -0.046, 0.12],
              [-0.012, -0.06, 0.12],
              [0.006, -0.062, 0.12],
              [0.022, -0.052, 0.12],
              [0.03, -0.038, 0.12],
            ],
            0.0026,
            10,
            true,
          ),
          ST,
          0,
        ),
        steel,
      ),
    );
    // trigger
    root.add(RB(0.006, 0.015, 0.004, 0.001, 0, -0.048, 0.12, steel, ST, 0, [0.2, 0, 0]));
    // receiver pins
    root.add(RB(0.004, 0.004, 0.004, 0.001, -0.02, 0.006, -0.02, steel, ST, 0));
    root.add(RB(0.004, 0.004, 0.004, 0.001, 0.02, 0.006, -0.02, steel, ST, 0));
    // muzzle flash
    let flash = N_();
    (flash.position.fromArray([0, Y0, -0.45]), (flash.visible = !1), root.add(flash));
    // hands (trigger hand on grip, support hand on pump)
    let gp = new gi(0, -0.075, 0.22),
      lh = cloneHand(A, gp.clone().sub(new gi(0.006, -0.031, -0.085).applyQuaternion(b)));
    lh.quaternion.copy(b), root.add(lh);
    let pac9Forend = new gi(-0.015, -0.062, -0.236),
      fp = new gi(0, -0.06, -0.22),
      rh = cloneHand(q, G.p.clone().add(fp).sub(pac9Forend));
    rh.quaternion.copy(G.q), root.add(rh);
    let rhRest = rh.position.clone(),
      rhQ = rh.quaternion.clone(),
      shellPort = new gi(0.02, -0.07, 0),
      shellKeys = [
        [0, { p: rhRest.clone(), q: rhQ.clone() }],
        [0.3, { p: rhRest.clone(), q: rhQ.clone() }],
        [0.55, { p: shellPort.clone(), q: rhQ.clone() }],
        [0.8, { p: shellPort.clone().add(new gi(0, -0.012, 0.012)), q: rhQ.clone() }],
        [1.05, { p: shellPort.clone(), q: rhQ.clone() }],
        [1.3, { p: shellPort.clone().add(new gi(0, -0.012, 0.012)), q: rhQ.clone() }],
        [1.45, { p: shellPort.clone(), q: rhQ.clone() }],
        [1.75, { p: rhRest.clone(), q: rhQ.clone() }],
        [9, { p: rhRest.clone(), q: rhQ.clone() }],
      ];
    let finger = bindFinger(lh, m.index[0], m.index[1]);
    root.traverse((x) => x.layers.set(zc));
    return {
      id: "shotgun",
      root,
      flash,
      bolt: null,
      boltTravel: 0,
      mag: null,
      muzzle: [0, Y0, -0.45],
      eject: [0.022, 0.008, -0.05],
      finger,
      reloadVisual(Pt, Je) {
        let pz = -0.22;
        if (Pt >= 1.75 && Pt < 2) pz = -0.22 + Yo((Pt - 1.75) / 0.25) * 0.09;
        else if (Pt >= 2 && Pt < 2.2) pz = -0.13 - Yo((Pt - 2) / 0.2) * 0.09;
        pump.position.z = pz;
        le(shellKeys, Pt);
        rh.position.copy(Y);
        rh.quaternion.copy(L);
        Pt >= 1.75 && (rh.position.z += pz + 0.22);
      },
      reloadDone() {
        pump.position.z = -0.22;
        rh.position.copy(rhRest);
        rh.quaternion.copy(rhQ);
      },
      resetVisual() {
        pump.position.z = -0.22;
        rh.position.copy(rhRest);
        rh.quaternion.copy(rhQ);
      },
    };
  }
  function buildRifle() {
    let root = new wt();
    root.name = "viewmodel-rifle";
    let steel = matBf(0x2a2e35, 0.4, 0.85, 1, "rifle_steel"),
      dark = matBf(0x17191d, 0.62, 0.55, 0, "rifle_dark"),
      poly = matBf(0x23262c, 0.6, 0.15, 2, "rifle_poly"),
      gun = s("gunmetal"),
      rubber = s("rubber");
    let glass = new Qt({
      color: new Ve(0x0a1418),
      roughness: 0.12,
      metalness: 0.1,
      emissive: new Ve(0x061018),
      emissiveIntensity: 0.5,
    });
    glass.name = "rifle_glass";
    let Y0 = 0.03,
      ST = [1, 1, 1],
      CG = [0.9, 0.92, 0.98];
    // long barrel (lathe)
    root.add(
      TB(
        [
          [0.011, 0.06],
          [0.012, 0.06],
          [0.012, 0.52],
          [0.0115, 0.56],
          [0.011, 0.56],
        ],
        24,
        gun,
        CG,
        0.15,
        0,
        Y0,
      ),
    );
    // muzzle brake
    root.add(
      TB(
        [
          [0.011, 0.53],
          [0.017, 0.53],
          [0.0175, 0.545],
          [0.0175, 0.555],
          [0.016, 0.562],
          [0.011, 0.562],
        ],
        20,
        steel,
        ST,
        2,
        0,
        Y0,
      ),
    );
    // gas block
    root.add(RB(0.024, 0.02, 0.03, 0.002, 0, Y0, -0.11, steel, ST, 2));
    // handguard (octagonal extrusion) + M-LOK slots
    root.add(
      o(
        qo(
          [
            [-0.024, -0.018],
            [0.024, -0.018],
            [0.027, -0.004],
            [0.024, 0.014],
            [-0.024, 0.014],
            [-0.027, -0.004],
          ],
          0.08,
          0.35,
          0.003,
          [0.55, 0.55, 0.58],
          0.2,
        ),
        dark,
      ),
    );
    for (let zz = -0.3; zz <= -0.13; zz += 0.06)
      root.add(RB(0.004, 0.011, 0.04, 0.001, 0.0275, 0.0, zz, dark, [0.2, 0.2, 0.22], 0)),
        root.add(RB(0.004, 0.011, 0.04, 0.001, -0.0275, 0.0, zz, dark, [0.2, 0.2, 0.22], 0));
    // receiver (side-profile extrusion with barrel socket bump)
    root.add(
      o(
        xr(
          [
            [-0.13, -0.026],
            [-0.13, 0.012],
            [0.02, 0.012],
            [0.05, 0.02],
            [0.05, 0.028],
            [0.05, 0.012],
            [0.05, -0.024],
            [0.02, -0.034],
            [-0.02, -0.034],
            [-0.03, -0.05],
            [-0.11, -0.05],
            [-0.13, -0.026],
          ],
          -0.02,
          0.02,
          0.003,
          [0.8, 0.8, 0.85],
          2,
        ),
        poly,
      ),
    );
    // ejection port
    root.add(RB(0.003, 0.014, 0.05, 0.001, 0.0208, 0.002, -0.01, dark, [0.2, 0.2, 0.22], 0));
    // top picatinny rail
    root.add(RB(0.022, 0.004, 0.15, 0.001, 0, 0.0185, 0.055, steel, ST, 2));
    for (let za = 0.12; za >= -0.015; za -= 0.0096) root.add(railTooth(za, 0.0205, steel, ST, 2));
    // scope (lathe body + lenses + rings + turrets)
    root.add(
      o(
        Cn(
          [
            [0.016, -0.115],
            [0.02, -0.115],
            [0.02, -0.085],
            [0.016, -0.08],
            [0.016, 0.08],
            [0.024, 0.08],
            [0.024, 0.115],
            [0.016, 0.115],
          ],
          24,
          ST,
          2,
          0,
          0.075,
        ),
        steel,
      ),
    );
    let objLens = o(new Ys(0.023, 0.023, 0.004, 20), glass);
    (objLens.rotation.x = Math.PI / 2), objLens.position.set(0, 0.075, -0.116), root.add(objLens);
    let ocuLens = o(new Ys(0.019, 0.019, 0.004, 20), glass);
    (ocuLens.rotation.x = Math.PI / 2), ocuLens.position.set(0, 0.075, 0.116), root.add(ocuLens);
    for (let [za, rz] of [[0.05, -0.05], [-0.01, 0.01]])
      root.add(o(Cn([[0.0165, -rz - 0.006], [0.03, -rz - 0.006], [0.03, -rz + 0.006], [0.0165, -rz + 0.006]], 20, ST, 2, 0, 0.05), steel));
    root.add(RB(0.012, 0.016, 0.012, 0.004, 0, 0.097, 0.0, steel, ST, 2));
    root.add(RB(0.016, 0.012, 0.012, 0.004, 0.026, 0.075, -0.02, steel, ST, 2));
    // polymer stock (integrated pistol grip + cheek riser)
    root.add(
      o(
        xr(
          [
            [-0.52, -0.02],
            [-0.52, 0.01],
            [-0.44, 0.035],
            [-0.34, 0.03],
            [-0.26, 0.012],
            [-0.13, 0.012],
            [-0.13, -0.03],
            [-0.18, -0.075],
            [-0.215, -0.085],
            [-0.24, -0.05],
            [-0.28, -0.028],
            [-0.36, -0.024],
            [-0.52, -0.02],
          ],
          -0.021,
          0.021,
          0.004,
          [0.55, 0.55, 0.58],
          0.2,
        ),
        poly,
      ),
    );
    // rubber butt pad + cheek riser
    root.add(
      o(
        xr(
          [
            [-0.52, 0.01],
            [-0.52, -0.02],
            [-0.535, -0.02],
            [-0.535, 0.01],
          ],
          -0.022,
          0.022,
          0.001,
          [0.85, 0.85, 0.9],
          0.1,
        ),
        rubber,
      ),
    );
    root.add(RB(0.02, 0.02, 0.07, 0.006, 0, 0.045, 0.41, rubber, [0.7, 0.7, 0.75], 0));
    // magazine (body + floor plate)
    let mag = new wt();
    mag.add(RB(0.03, 0.09, 0.05, 0.004, 0, -0.02, 0.01, poly, [0.5, 0.5, 0.54], 0));
    mag.add(RB(0.032, 0.008, 0.054, 0.002, 0, -0.065, 0.01, dark, [0.3, 0.3, 0.34], 0));
    root.add(mag);
    // bolt (group, geometry baked at rest; position.z overwritten per-frame)
    let bolt = new wt();
    bolt.add(RB(0.028, 0.01, 0.01, 0.003, 0.032, 0.014, 0.0, steel, ST, 2));
    let boltKnob = o(new ls(0.006, 10, 10), steel);
    boltKnob.position.set(0.048, 0.014, 0.0), bolt.add(boltKnob);
    root.add(bolt);
    // trigger guard + trigger
    root.add(
      o(
        sm(
          Fn(
            [
              [-0.02, -0.05, 0.06],
              [0.0, -0.062, 0.06],
              [0.02, -0.055, 0.06],
              [0.03, -0.04, 0.06],
            ],
            0.0026,
            10,
            true,
          ),
          ST,
          0,
        ),
        steel,
      ),
    );
    root.add(RB(0.006, 0.015, 0.004, 0.001, 0, -0.045, 0.06, steel, ST, 0, [0.2, 0, 0]));
    // muzzle flash
    let flash = N_();
    (flash.position.fromArray([0, Y0, -0.6]), (flash.visible = !1), root.add(flash));
    // hands (trigger hand on grip, support hand on handguard)
    let gp = new gi(0, -0.075, 0.2),
      lh = cloneHand(A, gp.clone().sub(new gi(0.006, -0.031, -0.085).applyQuaternion(b)));
    lh.quaternion.copy(b), root.add(lh);
    let pac9Forend = new gi(-0.015, -0.062, -0.236),
      fp = new gi(0, -0.03, -0.22),
      rh = cloneHand(q, G.p.clone().add(fp).sub(pac9Forend));
    rh.quaternion.copy(G.q), root.add(rh);
    let rhRest = rh.position.clone(),
      rhQ = rh.quaternion.clone(),
      magRest = new gi(0, 0, 0),
      magGrip = new gi(0, -0.05, 0),
      H_REST = { p: rhRest.clone(), q: rhQ.clone() },
      H_NEAR = { p: rhRest.clone().add(new gi(0, -0.05, 0.03)), q: rhQ.clone() },
      H_MAG = { p: magGrip.clone(), q: C.clone() },
      H_OUT = { p: new gi(0, -0.26, 0.08), q: C.clone().multiply(i0(-0.35, 0, 0.2)) },
      H_TAP = { p: new gi(0, -0.06, 0), q: C.clone() },
      H_RACK = { p: new gi(0.05, 0.02, 0), q: X.clone() },
      H_RACKB = { p: new gi(0.05, 0.02, 0.055), q: X.clone() },
      rifleTact = [
        [0, H_REST],
        [0.1, H_REST],
        [0.36, H_NEAR],
        [0.44, H_MAG],
        [0.5, H_MAG],
        [0.8, H_OUT],
        [0.98, H_OUT],
        [1.28, H_MAG],
        [1.35, H_MAG],
        [1.45, H_TAP],
        [1.52, H_TAP],
        [1.62, H_MAG],
        [1.7, H_NEAR],
        [2.02, H_REST],
        [9, H_REST],
      ],
      rifleEmpty = [
        ...rifleTact.slice(0, 12),
        [1.7, H_NEAR],
        [1.96, H_RACK],
        [2.02, H_RACK],
        [2.14, H_RACKB],
        [2.19, H_RACKB],
        [2.26, H_RACK],
        [2.36, H_RACK],
        [2.66, H_REST],
        [9, H_REST],
      ],
      Rin = C.clone().invert();
    let finger = bindFinger(lh, m.index[0], m.index[1]);
    root.traverse((x) => x.layers.set(zc));
    return {
      id: "rifle",
      root,
      flash,
      bolt,
      boltTravel: 0.055,
      mag,
      muzzle: [0, Y0, -0.6],
      eject: [0.022, 0.012, -0.05],
      finger,
      reloadVisual(Pt, Je) {
        le(Je.empty ? rifleEmpty : rifleTact, Pt);
        rh.position.copy(Y);
        rh.quaternion.copy(L);
        Pt >= me && Pt < ee
          ? (Z.copy(L).multiply(Rin),
            mag.quaternion.copy(Z),
            mag.position.copy(magRest).sub(magGrip).applyQuaternion(Z).add(Y))
          : (mag.quaternion.identity(), mag.position.copy(magRest));
      },
      reloadDone() {
        mag.quaternion.identity();
        mag.position.copy(magRest);
        rh.position.copy(rhRest);
        rh.quaternion.copy(rhQ);
      },
      resetVisual() {
        (mag.visible = !0),
          mag.quaternion.identity(),
          mag.position.copy(magRest),
          (bolt.position.z = 0),
          rh.position.copy(rhRest),
          rh.quaternion.copy(rhQ);
      },
    };
  }
  function buildGatling() {
    let root = new wt();
    root.name = "viewmodel-gatling";
    let steel = matBf(0x272b31, 0.42, 0.86, 1, "gatling_steel"),
      dark = matBf(0x14171b, 0.62, 0.58, 0, "gatling_dark"),
      poly = matBf(0x1d2025, 0.6, 0.2, 2, "gatling_poly"),
      gun = s("gunmetal"),
      rubber = s("rubber");
    let Y0 = 0.03,
      ST = [1, 1, 1],
      CG = [0.9, 0.92, 0.98];
    let barrels = new wt();
    barrels.name = "gatling_barrels";
    for (let k = 0; k < 3; k++) {
      let ang = (k / 3) * Math.PI * 2,
        bx = Math.cos(ang) * 0.024,
        by = Math.sin(ang) * 0.024 + Y0;
      barrels.add(
        TB(
          [
            [0.0085, 0.12],
            [0.01, 0.12],
            [0.01, 0.52],
            [0.009, 0.56],
            [0.0085, 0.56],
          ],
          12,
          gun,
          CG,
          0.15,
          bx,
          by,
        ),
      );
    }
    barrels.add(
      TB(
        [
          [0.011, 0.1],
          [0.02, 0.1],
          [0.021, 0.115],
          [0.021, 0.135],
          [0.011, 0.135],
        ],
        18,
        steel,
        ST,
        2,
        0,
        Y0,
      ),
    );
    barrels.add(
      TB(
        [
          [0.011, 0.53],
          [0.023, 0.53],
          [0.024, 0.55],
          [0.022, 0.57],
          [0.011, 0.57],
        ],
        18,
        steel,
        ST,
        2,
        0,
        Y0,
      ),
    );
    root.add(barrels);
    // perforated shroud over the barrel cluster
    root.add(
      TB(
        [
          [0.027, 0.14],
          [0.03, 0.14],
          [0.03, 0.5],
          [0.029, 0.52],
          [0.027, 0.52],
        ],
        24,
        dark,
        [0.45, 0.47, 0.52],
        0.2,
        0,
        Y0,
      ),
    );
    // receiver (side-profile extrusion)
    root.add(
      o(
        xr(
          [
            [-0.14, -0.028],
            [-0.14, 0.02],
            [0.03, 0.02],
            [0.05, 0.034],
            [0.05, 0.05],
            [0.05, 0.028],
            [0.05, -0.03],
            [0.03, -0.04],
            [-0.02, -0.04],
            [-0.03, -0.06],
            [-0.12, -0.06],
            [-0.14, -0.028],
          ],
          -0.026,
          0.026,
          0.004,
          ST,
          2,
        ),
        steel,
      ),
    );
    // carry handle / rail
    root.add(RB(0.022, 0.006, 0.12, 0.002, 0, 0.036, 0.02, dark, [0.5, 0.5, 0.54], 0));
    // ammo box + feed chute
    root.add(RB(0.05, 0.05, 0.09, 0.004, -0.042, -0.02, 0.02, poly, [0.5, 0.52, 0.56], 0));
    root.add(RB(0.02, 0.02, 0.05, 0.003, -0.03, 0.0, -0.01, dark, [0.3, 0.3, 0.34], 0));
    // rear grips + hands
    let gp = new gi(0, -0.07, 0.12),
      lh = cloneHand(A, gp.clone().sub(new gi(0.006, -0.031, -0.085).applyQuaternion(b)));
    lh.quaternion.copy(b), root.add(lh);
    let pac9Forend = new gi(-0.015, -0.062, -0.236),
      fp = new gi(0, -0.04, -0.06),
      rh = cloneHand(q, G.p.clone().add(fp).sub(pac9Forend));
    rh.quaternion.copy(G.q), root.add(rh);
    let finger = bindFinger(lh, m.index[0], m.index[1]);
    // muzzle flash
    let flash = N_();
    (flash.position.fromArray([0, Y0, -0.58]), (flash.visible = !1), root.add(flash));
    root.traverse((x) => x.layers.set(zc));
    return {
      id: "gatling",
      root,
      flash,
      bolt: null,
      boltTravel: 0,
      mag: null,
      muzzle: [0, Y0, -0.58],
      eject: [0.03, 0.012, -0.02],
      finger,
      spin(speed, dt, firing) {
        barrels.rotation.z -= (firing ? 55 + speed * 30 : speed * 14) * dt;
      },
      reloadVisual(Pt, Je) {},
      reloadDone() {},
      resetVisual() {
        barrels.rotation.z = 0;
      },
    };
  }
  function buildRocket() {
    let root = new wt();
    root.name = "viewmodel-rocket";
    let steel = matBf(0x2a2f36, 0.42, 0.85, 1, "rocket_steel"),
      dark = matBf(0x16181c, 0.62, 0.58, 0, "rocket_dark"),
      poly = matBf(0x1f2328, 0.6, 0.2, 2, "rocket_poly"),
      gun = s("gunmetal"),
      rubber = s("rubber");
    let Y0 = 0.03,
      ST = [1, 1, 1],
      CG = [0.9, 0.92, 0.98];
    // fat launch tube
    root.add(
      TB(
        [
          [0.042, 0.02],
          [0.048, 0.02],
          [0.048, 0.5],
          [0.046, 0.54],
          [0.042, 0.54],
        ],
        24,
        steel,
        ST,
        0.2,
        0,
        Y0,
      ),
    );
    // muzzle ring
    root.add(
      TB(
        [
          [0.042, 0.53],
          [0.056, 0.53],
          [0.057, 0.545],
          [0.055, 0.56],
          [0.042, 0.56],
        ],
        24,
        dark,
        [0.6, 0.62, 0.66],
        1,
        0,
        Y0,
      ),
    );
    // rear exhaust cone
    root.add(
      TB(
        [
          [0.028, -0.05],
          [0.05, -0.05],
          [0.052, -0.03],
          [0.048, -0.02],
          [0.028, -0.02],
        ],
        24,
        dark,
        [0.5, 0.5, 0.54],
        0,
        0,
        Y0,
      ),
    );
    // body (side-profile extrusion)
    root.add(
      o(
        xr(
          [
            [-0.16, -0.03],
            [-0.16, 0.016],
            [0.02, 0.016],
            [0.04, 0.028],
            [0.04, 0.04],
            [0.04, 0.012],
            [0.04, -0.028],
            [0.02, -0.04],
            [-0.02, -0.04],
            [-0.03, -0.06],
            [-0.14, -0.06],
            [-0.16, -0.03],
          ],
          -0.028,
          0.028,
          0.004,
          ST,
          2,
        ),
        poly,
      ),
    );
    // simple flip sight
    root.add(RB(0.012, 0.02, 0.03, 0.002, 0, 0.045, 0.03, dark, [0.4, 0.4, 0.44], 0));
    // grip + hands
    let gp = new gi(0, -0.075, 0.16),
      lh = cloneHand(A, gp.clone().sub(new gi(0.006, -0.031, -0.085).applyQuaternion(b)));
    lh.quaternion.copy(b), root.add(lh);
    let pac9Forend = new gi(-0.015, -0.062, -0.236),
      fp = new gi(0, -0.02, -0.14),
      rh = cloneHand(q, G.p.clone().add(fp).sub(pac9Forend));
    rh.quaternion.copy(G.q), root.add(rh);
    let finger = bindFinger(lh, m.index[0], m.index[1]);
    // muzzle flash
    let flash = N_();
    (flash.position.fromArray([0, Y0, -0.56]), (flash.visible = !1), root.add(flash));
    root.traverse((x) => x.layers.set(zc));
    return {
      id: "rocket",
      root,
      flash,
      bolt: null,
      boltTravel: 0,
      mag: null,
      muzzle: [0, Y0, -0.56],
      eject: [0, 0, 0],
      finger,
      reloadVisual(Pt, Je) {},
      reloadDone() {},
      resetVisual() {},
    };
  }
  function setActiveView(id) {
    let view = VIEWS[id];
    if (!view || view === ACT) return;
    let prev = ACT,
      host = prev && prev.root.parent ? prev.root.parent : i.camera;
    prev && prev.root.parent && prev.root.parent.remove(prev.root);
    ACT = view;
    ve.root = ACT.root;
    ACT.root.visible = vmVisible;
    host.add(ACT.root);
  }
  VIEWS.pac9 = ACT;
  VIEWS.shotgun = buildShotgun();
  VIEWS.rifle = buildRifle();
  VIEWS.gatling = buildGatling();
  VIEWS.rocket = buildRocket();
  window.__weaponView = (Me) => VIEWS[Me] && setActiveView(Me);
  e.traverse((Me) => {
    Me.layers.set(zc);
  }),
    i.camera.add(e);
  let I =
      Object.values(t).reduce((Me, we) => Me + Kc(we), 0) +
      Kc(m.fabric) +
      Kc(m.index[0]) +
      Kc(O.fabric) +
      (v ? Kc(v.geometry) : 0) +
      2,
    se = 0;
  e.traverse((Me) => {
    Me.isMesh && se++;
  }),
    console.log(
      `[weapon] ${mi.name}: ${Math.round(I)} tris, ${se} meshes (flash only while firing)`,
    );
  let ae = i.rng && i.rng.fork ? i.rng.fork() : Math.random,
    k = {
      t: 0,
      cooldown: 0,
      prevFire: !1,
      dryDone: !1,
      autoReload: -1,
      reload: null,
      equip: null,
      burst: 0,
      lastShot: -9,
      bloom: 0,
      heat: 0,
      smoke: 0,
      smokeTick: 0,
      adsLin: 0,
      adsE: 0,
      sprintT: 0,
      reloadW: 0,
      rackW: 0,
      bobPhase: 0,
      bobAmt: 0,
      finger: 0,
      boltT: 9,
      boltLocked: !1,
      flashT: 0,
      flashDur: 0.05,
      recPhase: 0,
      wasGround: !0,
      lastVy: 0,
      spreadS: 0.0125,
      spin: 0,
      idleT: 0,
      inspect: -1,
      kZ: pa(520, 30),
      kP: pa(380, 26),
      kY: pa(300, 22),
      kR: pa(300, 20),
      swY: pa(110, 15),
      swP: pa(110, 15),
      jY: pa(140, 13),
      jP: pa(140, 13),
      bump: pa(600, 30),
    },
    ce = { freeze: !1, reloadT: null, empty: !1, flash: !1, noFire: !1 },
    ve = {
      name: mi.name,
      ammo: Gv,
      magSize: Gv,
      reserve: B_,
      state: "idle",
      ads: 0,
      spread: 0.0125,
      damage: H_,
      rpm: O_,
      mode: "auto",
      pellets: 1,
      spreadBase: 0.0125,
      radius: 0,
      speed: 0,
      projectile: !1,
      spinUp: !1,
      root: ACT.root,
      debug: ce,
      info: { tris: Math.round(I), meshes: se },
      update: Xe,
      reset: resetLoadout,
      setVisible(Me) {
        (vmVisible = !!Me), (ACT.root.visible = vmVisible);
      },
      muzzleWorld: Re,
      reloadNow: Fe,
      addAmmo(Me) {
        ve.reserve += Me;
      },
      spawnPickup(Me, we, be, Oe) {
        return spawnPickup(Me, we, be, Oe);
      },
      setWetness(Me) {
        Wv.value = Math.max(0, Math.min(1, +Me || 0));
      },
      snap() {
        k.adsLin = i.input.ads ? 1 : 0;
        for (let Me of ["kZ", "kP", "kY", "kR", "swY", "swP", "jY", "jP", "bump"])
          (k[Me].x = 0), (k[Me].v = 0);
        k.sprintT = i.player.sprinting ? 1 : 0;
      },
      nextWeapon() {
        cycleWeapon(1);
      },
      prevWeapon() {
        cycleWeapon(-1);
      },
      equip(slot) {
        return equipWeapon(slot);
      },
      currentId,
    };
  function _e() {
    (ve.ammo = Gv),
      (ve.reserve = B_),
      (ve.state = "idle"),
      (ve.ads = 0),
      Object.assign(k, {
        cooldown: 0,
        prevFire: !1,
        dryDone: !1,
        autoReload: -1,
        reload: null,
        equip: null,
        burst: 0,
        lastShot: -9,
        bloom: 0,
        heat: 0,
        smoke: 0,
        spin: 0,
        adsLin: 0,
        adsE: 0,
        sprintT: 0,
        reloadW: 0,
        boltT: 9,
        boltLocked: !1,
        flashT: 0,
        idleT: 0,
        inspect: -1,
      });
    for (let Me of ["kZ", "kP", "kY", "kR", "swY", "swP", "jY", "jP", "bump"])
      (k[Me].x = 0), (k[Me].v = 0);
    (ce.noFire = !1), ACT.resetVisual();
  }
  function applyStats(id) {
    let def = WEAPON_DEFS[id];
    if (!def) return;
    (Gv = def.magSize),
      (B_ = def.reserve),
      (O_ = def.rpm),
      (H_ = def.damage),
      (V_ = def.range),
      (W_ = def.reloadTactical),
      (G_ = def.reloadEmpty);
  }
  function saveCurrent() {
    let id = loadoutState.owned[loadoutState.current];
    if (!id) return;
    loadoutState.pool[id] = { mag: ve.ammo, reserve: ve.reserve };
  }
  function resetLoadout() {
    loadoutState.owned = ["pac9"];
    loadoutState.current = 0;
    loadoutState.pool = {
      pac9: { mag: WEAPON_DEFS.pac9.magSize, reserve: WEAPON_DEFS.pac9.reserve },
      shotgun: { mag: WEAPON_DEFS.shotgun.magSize, reserve: 0 },
      rifle: { mag: WEAPON_DEFS.rifle.magSize, reserve: 0 },
      gatling: { mag: WEAPON_DEFS.gatling.magSize, reserve: 0 },
      rocket: { mag: WEAPON_DEFS.rocket.magSize, reserve: 0 },
    };
    loadoutState.droppedFirst = {};
    for (let pk of loadoutState.pickups) pk.mesh && i.scene.remove(pk.mesh);
    loadoutState.pickups.length = 0;
    applyStats("pac9");
    setActiveView("pac9");
    _e();
    (ve.name = WEAPON_DEFS.pac9.name),
      (ve.mode = "auto"),
      (ve.pellets = 1),
      (ve.spreadBase = WEAPON_DEFS.pac9.spreadBase),
      (ve.radius = 0),
      (ve.speed = 0),
      (ve.projectile = !1),
      (ve.spinUp = !1),
      (ve.magSize = Gv),
      (ve.damage = H_),
      (ve.rpm = O_),
      (ve.spread = WEAPON_DEFS.pac9.spreadBase);
  }
  function equipWeapon(slot) {
    let id = loadoutState.owned[slot],
      from = loadoutState.owned[loadoutState.current];
    if (!id || slot === loadoutState.current || !from || k.equip) return !1;
    saveCurrent();
    loadoutState.current = slot;
    applyStats(id);
    _e();
    let pool = loadoutState.pool[id] || { mag: WEAPON_DEFS[id].magSize, reserve: 0 };
    (ve.ammo = pool.mag),
      (ve.reserve = pool.reserve),
      (ve.name = WEAPON_DEFS[id].name),
      (ve.magSize = Gv),
      (ve.damage = H_),
      (ve.rpm = O_),
      (ve.mode = WEAPON_DEFS[id].mode),
      (ve.pellets = WEAPON_DEFS[id].pellets),
      (ve.spreadBase = WEAPON_DEFS[id].spreadBase),
      (ve.radius = WEAPON_DEFS[id].radius || 0),
      (ve.speed = WEAPON_DEFS[id].speed || 0),
      (ve.projectile = !!WEAPON_DEFS[id].projectile),
      (ve.spinUp = !!WEAPON_DEFS[id].spinUp);
    i.events.emit("weapon:switch", { from: from, to: id });
    (k.equip = { target: id, t: 0, phase: "holster" }), (ce.noFire = !0);
    return !0;
  }
  function cycleWeapon(dir) {
    if (loadoutState.owned.length < 2) return;
    equipWeapon((loadoutState.current + dir + loadoutState.owned.length) % loadoutState.owned.length);
  }
  function currentId() {
    return loadoutState.owned[loadoutState.current] || "pac9";
  }
  function grantAmmo(weaponId, amount) {
    let def = WEAPON_DEFS[weaponId];
    if (!def) return;
    let pool = loadoutState.pool[weaponId];
    if (!pool) pool = loadoutState.pool[weaponId] = { mag: def.magSize, reserve: 0 };
    let cap = def.magSize * 3;
    pool.reserve = Math.min(cap, pool.reserve + amount);
    if (loadoutState.owned[loadoutState.current] === weaponId) ve.reserve = pool.reserve;
  }
  function pickupWeapon(weaponId, ammo, kind) {
    let def = WEAPON_DEFS[weaponId];
    if (!def) return;
    let ownedIdx = loadoutState.owned.indexOf(weaponId);
    if (ownedIdx >= 0) {
      grantAmmo(weaponId, ammo);
      i.events.emit("weapon:pickup", { kind: kind === "ammo" ? "ammo" : weaponId, weapon: weaponId });
      return;
    }
    if (loadoutState.owned.length < 2) {
      loadoutState.owned.push(weaponId);
      loadoutState.pool[weaponId] = { mag: def.magSize, reserve: ammo };
      equipWeapon(loadoutState.owned.length - 1);
    } else {
      loadoutState.owned[1] = weaponId;
      loadoutState.pool[weaponId] = { mag: def.magSize, reserve: ammo };
      equipWeapon(1);
    }
    i.events.emit("weapon:pickup", { kind: weaponId, weapon: weaponId });
  }
  function spawnPickup(weaponId, ammo, pos, kind) {
    let mesh = null;
    try {
      let color = kind === "ammo" ? 0xffee66 : weaponId === "shotgun" ? 0xffaa33 : 0x55ccff,
        geo = kind === "ammo" ? new un(0.34, 0.2, 0.34) : new Na(0.36, 0),
        mat = i.mats && i.mats.emissive ? i.mats.emissive(color, 2.6) : new Nn({ color: new Ve(color) });
      mesh = new Qe(geo, mat);
      mesh.position.set(pos.x, pos.y + 0.85, pos.z);
      (mesh.castShadow = !1), (mesh.receiveShadow = !1), (mesh.frustumCulled = !1);
      mesh.userData.weaponPickup = weaponId;
      i.scene.add(mesh);
    } catch (err) {
      console.warn("[weapon] spawnPickup failed: " + (err && err.message));
    }
    loadoutState.pickups.push({ mesh, weaponId, kind, ammo, pos: { x: pos.x, y: pos.y, z: pos.z }, t: 0 });
  }
  function rollDrop(type, pos) {
    let weaponId = DROP_TABLE[type];
    if (!weaponId || !pos) return;
    let first = !loadoutState.droppedFirst[type];
    loadoutState.droppedFirst[type] = !0;
    if (!first && i.rng() > 0.4) return;
    let def = WEAPON_DEFS[weaponId],
      owned = loadoutState.owned.indexOf(weaponId) >= 0;
    if (owned) {
      spawnPickup(weaponId, def.magSize * 2, pos, "ammo");
      i.events.emit("weapon:drop", { kind: type, pos: pos, weapon: weaponId, ammo: !0 });
    } else {
      let ammo = weaponId === "shotgun" ? 12 : weaponId === "rifle" ? 20 : def.magSize;
      spawnPickup(weaponId, ammo, pos, "weapon");
      i.events.emit("weapon:drop", { kind: type, pos: pos, weapon: weaponId });
    }
  }
  function updatePickups(dt) {
    let p = i.player;
    if (!p || !p.alive) return;
    for (let j = loadoutState.pickups.length - 1; j >= 0; j--) {
      let pk = loadoutState.pickups[j];
      if (pk.mesh) {
        pk.t += dt;
        pk.mesh.rotation.y += dt * 2.4;
        pk.mesh.position.y = pk.pos.y + 0.85 + Math.sin(pk.t * 2.2) * 0.12;
      }
      if (Math.hypot(pk.pos.x - p.pos.x, pk.pos.z - p.pos.z) < 2 && Math.abs(pk.pos.y - p.pos.y) < 3) {
        pickupWeapon(pk.weaponId, pk.ammo, pk.kind);
        pk.mesh && i.scene.remove(pk.mesh);
        loadoutState.pickups.splice(j, 1);
      }
    }
  }
  i.events.on("enemy:killed", (k) => {
    if (!k) return;
    rollDrop(k.type || (k.enemy && k.enemy.type), k.pos || (k.enemy && k.enemy.pos));
  });
  let Te = new Ye();
  function Pe(Me, we) {
    ACT.root.updateMatrix(), we.fromArray(Me).applyMatrix4(ACT.root.matrix);
    let be = i.camera,
      Oe = Math.tan((be.fov * Math.PI) / 360) / Math.tan((i.viewCamera.fov * Math.PI) / 360);
    return (we.x *= Oe), (we.y *= Oe), we.applyQuaternion(be.quaternion).add(be.position);
  }
  function Re(Me = new gi()) {
    return Pe(ACT.muzzle, Me);
  }
  function Fe() {
    if (k.reload || k.equip || ve.ammo >= ve.magSize || ve.reserve <= 0) return !1;
    let Me = ve.ammo <= 0;
    return (
      (k.reload = { t: 0, T: Me ? G_ : W_, empty: Me, f: {} }),
      (k.autoReload = -1),
      i.events.emit("weapon:reload", { phase: "start", empty: Me }),
      !0
    );
  }
  let ze = new gi(),
    We = new gi(),
    Ne = new gi(),
    dt = new gi(),
    xe = new gi(),
    Ie = new gi();
  function Be() {
    let Me = i.player,
      we = i.camera;
    ve.ammo--, k.burst++, (k.lastShot = k.t), (k.heat = Math.min(1.3, k.heat + 0.05));
    let be = ve.spread,
      Oe = ae() * Math.PI * 2,
      pt = Math.tan(be) * Math.sqrt(ae());
    ze
      .set(Math.cos(Oe) * pt, Math.sin(Oe) * pt, -1)
      .normalize()
      .applyQuaternion(we.quaternion),
      Ie.copy(Me.eye || we.position);
    let ut = null,
      rk = ve.projectile ? 3.4 : 1;
    if (ve.projectile) {
      Re(We);
      try {
        ut = i.combat.spawnProjectile({
          from: We.clone(),
          dir: ze.clone(),
          speed: ve.speed || 40,
          damage: ve.damage || 150,
          radius: ve.radius || 5,
          source: "player",
          tracking: null,
          life: 6,
        });
      } catch {}
      Ne.copy(We).addScaledVector(ze, 3);
    } else if ((ve.pellets || 1) <= 1) {
      try {
        ut = i.combat.playerShot(Ie, ze, { damage: H_, range: V_ });
      } catch {}
    } else
      for (let pe = 0; pe < ve.pellets; pe++) {
        let be2 = ae() * Math.PI * 2,
          pt2 = Math.tan(ve.spread) * Math.sqrt(ae());
        dt
          .set(Math.cos(be2) * pt2, Math.sin(be2) * pt2, -1)
          .normalize()
          .applyQuaternion(we.quaternion);
        try {
          ut = i.combat.playerShot(Ie, dt, { damage: H_, range: V_ }) || ut;
        } catch {}
      }
    ut && ut.point ? Ne.copy(ut.point) : Ne.copy(Ie).addScaledVector(ze, V_), Re(We);
    let nn = i.fx;
    if (nn && !ve.projectile) {
      nn.tracer && nn.tracer(We, Ne);
      nn.shell &&
        (Pe(ACT.eject, dt),
        xe.set(2 + ae() * 1.2, 1.2 + ae() * 0.8, 0.5 - ae() * 0.6).applyQuaternion(we.quaternion),
        Me.vel && xe.add(Me.vel),
        nn.shell(dt, xe));
    }
    i.render && i.render.lightPool && i.render.lightPool.flash(We, 16756832, 45, 9, 0.05),
      i.events.emit("weapon:fire", { origin: Ie, dir: ze, muzzle: We, ads: k.adsE });
    let bt = bi(1, 0.55, k.adsE) * (Me.crouching ? 0.85 : 1),
      Os = k.burst,
      pn = Os <= 9 ? 1 : 0.38,
      Ti =
        (Os < 4
          ? (ae() - 0.5) * 0.0022
          : Math.sin(Os * 0.57 + k.recPhase) * 0.0042 + (ae() - 0.5) * 0.002) * bt;
    Me.addRecoil && Me.addRecoil(0.0068 * pn * bt * rk * (0.85 + ae() * 0.3), Ti),
      Me.addShake && Me.addShake(0.12 * bt),
      (k.kZ.v += 1.5 * bi(1, 0.6, k.adsE)),
      (k.kP.v += 1.5 * bt),
      (k.kY.v += (ae() - 0.5) * 1 * bt),
      (k.kR.v += (ae() - 0.5) * 1.8 * bt),
      (k.bloom = Math.min(1, k.bloom + 0.17)),
      (k.flashT = k.flashDur = 0.036 + ae() * 0.02);
    let ho = ACT.flash.material.uniforms;
    (ho.uSeed.value = ae() * 100),
      (ho.uJet.value = 0.6 + ae() * 0.6),
      (ACT.flash.rotation.z = (ae() - 0.5) * 0.4);
    let Rs = (0.8 + ae() * 0.5) * bi(1, 0.62, k.adsE);
    ACT.flash.scale.set(Rs, Rs, Rs * (0.8 + ae() * 0.5)),
      (k.boltT = 0),
      ve.ammo <= 0 && ((k.boltLocked = !0), ACT.mag && (ACT.mag.visible = !1));
  }
  function Xe(Me) {
    i.combat && i.combat.update && i.combat.update(Me);
    let we = i.player,
      be = i.input;
    if (!we || !be || !we.alive) {
      (k.prevFire = !1), ACT.flash && (ACT.flash.visible = !1);
      (k.equip = null), (ce.noFire = !1);
      return;
    }
    k.t += Me;
    updatePickups(Me);
    let eqO = 0;
    if (k.equip) {
      let Eq = k.equip;
      (Eq.t += Me);
      if (Eq.phase === "holster") {
        eqO = Yo(Math.min(1, Eq.t / 0.22));
        if (Eq.t >= 0.22) (setActiveView(Eq.target), (Eq.phase = "draw"), (Eq.t = 0), (k.bump.v -= 0.6));
      } else {
        eqO = 1 - Yo(Math.min(1, Eq.t / 0.35));
        if (Eq.t >= 0.35) (k.equip = null), (ce.noFire = !1);
      }
    }
    if (be.pressed) {
      if (be.pressed("wep1")) equipWeapon(0);
      else if (be.pressed("wep2")) equipWeapon(1);
    }
    let Oe = !!be.fire && ACT.root.visible && !ce.noFire && !k.equip,
      pt = Oe && !k.prevFire;
    (k.prevFire = Oe), Oe || (k.dryDone = !1);
    let ut = !!we.sprinting && !Oe && !be.ads && !k.reload && !k.equip;
    (k.sprintT = kn(k.sprintT, ut ? 1 : 0, 9, Me)),
      be.pressed && be.pressed("reload") && Fe(),
      k.autoReload >= 0 && ((k.autoReload -= Me), k.autoReload < 0 && Fe());
    let nn = 0;
    if (
      (ce.reloadT != null &&
        !k.reload &&
        (k.reload = { t: 0, T: ce.empty ? G_ : W_, empty: ce.empty, f: {} }),
      k.reload)
    ) {
      let Je = k.reload;
      ce.reloadT != null ? (Je.t = ce.reloadT) : (Je.t += Me);
      let Pt = Je.t,
        Vt = (Tt, Ai) =>
          Pt >= Ai && !Je.f[Tt]
            ? ((Je.f[Tt] = 1), i.events.emit("weapon:reload", { phase: Tt, empty: Je.empty }), !0)
            : !1;
      if (
        (Vt("magout", me) && (k.bump.v -= 0.25),
        Pt > 0.86 && !Je.f.fresh && ((Je.f.fresh = 1), ACT.mag && (ACT.mag.visible = !0)),
        Vt("magin", ee))
      ) {
        k.bump.v += 0.55;
        let Tt = Math.min(ve.magSize - ve.ammo, ve.reserve);
        (ve.ammo += Tt), (ve.reserve -= Tt), Je.empty || (k.boltLocked = !1);
      }
      Pt >= 1.5 && !Je.f.tap && ((Je.f.tap = 1), (k.bump.v += 0.4)),
        Je.empty &&
          (Pt >= B &&
            (nn =
              Pt < P ? Yo((Pt - B) / (P - B)) : Pt < V ? 1 : Math.max(0, 1 - (Pt - V) / 0.035)),
          Vt("bolt", V) && ((k.boltLocked = !1), (k.bump.v += 0.3), (k.kZ.v -= 0.5))),
        ACT.reloadVisual(Pt, Je);
      let ss = Yo(Pt / 0.3),
        Hs = 1 - Yo((Pt - (Je.T - 0.46)) / 0.4);
      (k.reloadW = Math.min(ss, Hs)),
        (k.rackW = Je.empty ? Yo((Pt - 1.62) / 0.3) * Hs : 0),
        Pt >= Je.T &&
          ce.reloadT == null &&
          ((k.reload = null),
          (k.reloadW = 0),
          (k.rackW = 0),
          i.events.emit("weapon:reload", { phase: "done" }),
          ACT.reloadDone());
    }
    k.cooldown -= Me;
    let bt = !k.reload && k.sprintT < 0.45,
      semi = ve.mode === "semi" || ve.mode === "pump",
      trigger0 = Oe && bt;
    k.spin = kn(k.spin, ve.spinUp && trigger0 ? 1 : 0, 4, Me);
      trigger = semi ? pt : Oe,
      burstCap = semi ? 1 : 3;
    if (Oe && bt)
      if (trigger && ve.ammo > 0) {
        let Je = 0;
        for (; k.cooldown <= 0 && ve.ammo > 0 && Je < burstCap; ) Be(), (k.cooldown += 60 / O_), Je++;
      } else
        trigger &&
          !k.dryDone &&
          ((k.dryDone = !0),
          i.events.emit("weapon:dry", {}),
          (k.bump.v -= 0.08),
          ve.reserve > 0 && (k.autoReload = 0.32));
    k.cooldown < 0 && (k.cooldown = Math.max(k.cooldown, -0.001)),
      k.t - k.lastShot > 0.24 && (k.burst > 0 && (k.recPhase = ae() * 6.28), (k.burst = 0)),
      (k.bloom = Math.max(0, k.bloom - Me * 1.5)),
      k.t - k.lastShot > 0.11 &&
        k.t - k.lastShot < 0.11 + Me * 1.5 &&
        k.heat > 0.4 &&
        (k.smoke = Math.min(1.6, k.heat * 1.3)),
      k.smoke > 0 &&
        ((k.smoke -= Me),
        (k.smokeTick -= Me),
        k.smokeTick <= 0 &&
          i.fx &&
          i.fx.smoke &&
          ((k.smokeTick = 0.085),
          Re(We),
          i.fx.smoke(We, {
            size: 0.1 + k.smoke * 0.06,
            life: 1.3,
            rise: 0.5,
            count: 1,
            alpha: 0.22,
          }))),
      (k.heat = Math.max(0, k.heat - Me * 0.2));
    let Os = !!be.ads && !k.reload && k.sprintT < 0.35 && !k.equip;
    (k.adsLin = Zn(k.adsLin + (Os ? Me : -Me) / 0.18, 0, 1)),
      (k.adsE = Yo(k.adsLin)),
      (ve.ads = k.adsE);
    let pn = we.speed || 0,
      Ti = Fo(pn / 6),
      ho =
        bi(ve.spreadBase || 0.0125, (ve.spreadBase || 0.0125) * 0.096, k.adsE) *
          (ve.spinUp ? 1 + 1.5 * (1 - k.spin) : 1) +
        Ti * bi(0.013, 0.004, k.adsE) +
        k.bloom * bi(0.0065, 0.0022, k.adsE) +
        (we.onGround === !1 ? 0.022 : 0) -
        (we.crouching ? 0.002 * (1 - k.adsE) : 0);
    (k.spreadS = kn(k.spreadS, ho, 18, Me)),
      (ve.spread = k.spreadS),
      Oe ||
      !!be.ads ||
      !!k.reload ||
      pn > 0.2 ||
      (be.look && Math.abs(be.look.dx) + Math.abs(be.look.dy) > 0.002) ||
      k.sprintT > 0.1
        ? ((k.idleT = 0), k.inspect >= 0 && (k.inspect = Math.max(k.inspect, 2.9)))
        : (k.idleT += Me),
      k.inspect < 0 && k.idleT > 24 && (k.inspect = 0);
    let Un = 0,
      zo = 0,
      $i = 0;
    if (k.inspect >= 0) {
      let Je = (k.inspect += Me);
      (Un = Yo(Je / 0.5) * (1 - Yo((Je - 1.4) / 0.5))),
        (zo = Yo((Je - 1.5) / 0.5) * (1 - Yo((Je - 2.8) / 0.5))),
        ($i = Yo(Je / 0.5) * (1 - Yo((Je - 2.9) / 0.5))),
        Je > 3.5 && ((k.inspect = -1), (k.idleT = 0));
    }
    (ve.state = k.reload
      ? "reloading"
      : k.inspect >= 0
        ? "inspect"
        : k.sprintT > 0.5
          ? "sprinting"
          : k.t - k.lastShot < 0.14
            ? "firing"
            : "idle"),
      (k.boltT += Me);
    let ya = 0.072,
      ba = k.boltT < ya ? Math.sin((Math.PI * k.boltT) / ya) : 0;
    k.boltLocked && k.boltT > ya * 0.5 && (ba = Math.max(ba, 0.86)),
      ACT.bolt && (ACT.bolt.position.z = ACT.boltTravel * Math.max(ba * 0.95, nn)),
      (k.finger = kn(k.finger, (Oe && bt) || ce.flash ? 1 : 0, 30, Me)),
      ACT.finger && ACT.finger(k.finger),
      ACT.spin && ACT.spin(k.heat, Me, Oe && bt);
    let Hn = ACT.flash.material.uniforms;
    if (
      (ce.flash && ((k.flashT = k.flashDur = 0.05), (Hn.uSeed.value = 3.7)),
      (k.flashT -= Me),
      (Hn.uInt.value = k.flashT > 0 ? 9.5 * Math.sqrt(Math.max(0, k.flashT / k.flashDur)) : 0),
      (Hn.uHeat.value = Fo((k.heat - 0.45) / 0.8) * 2.2),
      (ACT.flash.visible = Hn.uInt.value > 0 || Hn.uHeat.value > 0.02),
      ce.freeze)
    )
      return;
    let fo = we.onGround !== !1,
      ln = we.vel ? we.vel.y : 0;
    (k.bobAmt = kn(k.bobAmt, fo ? Fo(pn / 3.6) : 0, 8, Me)),
      (k.bobPhase += Me * (pn > 0.3 && fo ? 5.2 + pn * 1.55 : 0));
    let Zo = k.bobPhase,
      yr = k.bobAmt * bi(1, 0.12, k.adsE) * (1 + k.sprintT * 1.4),
      lu = Math.sin(Zo) * 0.006 * yr,
      de =
        (Math.sin(2 * Zo) * 0.0042 - Math.pow(0.5 + 0.5 * Math.cos(2 * Zo + 0.6), 4) * 0.0048) *
        yr,
      te = bi(1, 0.3, k.adsE),
      he = k.t,
      pe = bi(1, 0.4, k.adsE);
    if (
      ((k.swY.v += Zn(be.look ? be.look.dx : 0, -0.2, 0.2) * 3.2 * pe),
      (k.swP.v += Zn(be.look ? be.look.dy : 0, -0.2, 0.2) * 2.6 * pe),
      ma(k.swY, 0, Me),
      ma(k.swP, 0, Me),
      (k.swY.x = Zn(k.swY.x, -0.09, 0.09)),
      (k.swP.x = Zn(k.swP.x, -0.07, 0.07)),
      k.wasGround && !fo && ln > 1 && ((k.jY.v -= 0.22), (k.jP.v += 0.7)),
      !k.wasGround && fo)
    ) {
      let Je = Zn(-k.lastVy * 0.06, 0, 0.6);
      (k.jY.v -= Je), (k.jP.v -= Je * 3.2), (k.kR.v += (ae() - 0.5) * Je * 2);
    }
    (k.wasGround = fo),
      fo || (k.lastVy = ln),
      ma(k.jY, fo ? 0 : Zn(-ln * 0.0045, -0.02, 0.024), Me),
      ma(k.jP, fo ? 0 : Zn(ln * 0.012, -0.06, 0.06), Me),
      ma(k.kZ, 0, Me),
      ma(k.kP, 0, Me),
      ma(k.kY, 0, Me),
      ma(k.kR, 0, Me),
      ma(k.bump, 0, Me);
    let ge = be.move ? be.move.x : 0,
      ye = be.move ? be.move.y : 0,
      Le = 1 - k.adsE,
      ke = k.adsE,
      Ue = k.sprintT,
      ct = k.reloadW,
      De = k.rackW,
      it =
        bi(eu.p[0], qv.p[0], ke) +
        tu.p[0] * Ue +
        nu.p[0] * ct +
        lu +
        Math.sin(he * 0.85 + 1) * 0.0012 * te -
        k.swY.x * 0.06 -
        ge * 0.004 * Le -
        0.035 * $i,
      gt =
        bi(eu.p[1], qv.p[1], ke) +
        tu.p[1] * Ue +
        nu.p[1] * ct +
        de +
        Math.sin(he * 1.7) * 0.0016 * te +
        k.swP.x * 0.05 +
        k.jY.x +
        k.bump.x * 0.6 +
        0.045 * $i,
      Ot =
        bi(eu.p[2], qv.p[2], ke) +
        tu.p[2] * Ue +
        nu.p[2] * ct +
        k.kZ.x * 0.55 +
        ye * 0.004 * Le * (1 - Ue),
      xn =
        eu.r[0] * Le +
        tu.r[0] * Ue +
        nu.r[0] * ct -
        0.16 * De +
        Math.sin(he * 1.7 + 0.8) * 0.0035 * te +
        Math.sin(2 * Zo + 0.5) * 0.008 * yr +
        k.swP.x +
        k.jP.x +
        k.kP.x +
        k.bump.x * 1.5 +
        0.3 * $i,
      $t =
        eu.r[1] * Le +
        tu.r[1] * Ue +
        nu.r[1] * ct +
        Math.sin(he * 0.6) * 0.002 * te +
        Math.sin(Zo) * 0.01 * yr +
        k.swY.x +
        k.kY.x +
        0.18 * $i +
        0.25 * zo,
      Ht =
        eu.r[2] * Le +
        tu.r[2] * Ue +
        nu.r[2] * ct +
        0.62 * De +
        Math.sin(Zo) * 0.014 * yr +
        k.swY.x * 0.7 -
        ge * 0.035 * Le +
        k.kR.x -
        0.75 * Un +
        0.55 * zo +
        Math.sin(he * 0.5) * 0.004 * te;
    ACT.root.position.set(it, gt - 0.22 * eqO, Ot + 0.15 * eqO), ACT.root.rotation.set(xn - 0.5 * eqO, $t - 0.3 * eqO, Ht + 0.1 * eqO, "YXZ");
  }
  return _e(), ve;
}
async function PC(i) {
  let e = await dm(i);
  i.weapon = e;
  let t = e.root,
    n = new gi(0, 1.68, 4),
    s = {
      south: [0.28, -0.01, 1],
      east: [1, 0, 0.25],
      north: [-0.2, -0.01, -1],
      west: [-1, 0, 0.1],
      nw: [-0.75, -0.01, -0.65],
    },
    o = {
      side: [Math.PI, [1.12, 1.3, 0.11], [0, 1.235, 0.11], 30],
      right: [0, [1.12, 1.3, -0.11], [0, 1.235, -0.11], 30],
      top: [Math.PI * 0.86, [0.62, 1.8, -0.42], [0, 1.24, 0.12], 32],
      hands: [Math.PI, [0.4, 1.4, 0.02], [0.02, 1.215, 0.25], 30],
      rhand: [0, [0.36, 1.22, 0.27], [0.03, 1.16, 0.09], 30],
      muzzle: [Math.PI, [0.26, 1.37, 0.98], [0, 1.262, 0.44], 30],
      optic: [Math.PI, [0.2, 1.4, -0.26], [0, 1.31, 0.02], 30],
      lower: [Math.PI, [0.34, 1.26, 0.04], [0, 1.2, 0.03], 30],
    },
    r = window.__setShot,
    a = null;
  function l(u, h = {}) {
    a = u;
    let f = o[u],
      p = i.input,
      d = i.player;
    (p.ads = !1),
      (p.fire = !1),
      (d.sprinting = !1),
      (d.speed = 0),
      (e.debug.reloadT = null),
      (e.debug.flash = !1),
      (e.debug.empty = !1),
      (e.debug.freeze = !!f),
      e.reset();
    let v, g, x;
    if (f)
      i.scene.add(t),
        t.position.set(0, 1.25, 0),
        t.rotation.set(0, f[0], 0, "YXZ"),
        t.traverse((y) => y.layers.set(vf)),
        (v = f[1]),
        (g = f[2]),
        (x = f[3]),
        h.wt != null && ((e.debug.reloadT = +h.wt), (e.debug.empty = !!h.wempty));
    else {
      i.camera.add(t), t.traverse((b) => b.layers.set(zc));
      let y = s[h.wlook] || s.south;
      (v = [n.x, n.y, n.z]),
        (g = [n.x + y[0] * 50, n.y + y[1] * 50, n.z + y[2] * 50]),
        (x = 74),
        u === "ads" && ((p.ads = !0), (x = 52)),
        u === "sprint" && ((d.sprinting = !0), (d.speed = 6)),
        u === "fire" && ((e.debug.flash = !0), h.wads && ((p.ads = !0), (x = 52))),
        (u === "reload" || u === "empty") &&
          ((e.debug.reloadT = h.wt != null ? +h.wt : 0.62), (e.debug.empty = u === "empty")),
        u === "empty" && (e.ammo = 0);
    }
    return (
      e.snap(),
      e.update(0.016),
      e.snap(),
      r && r({ cam: h.cam || [...v, ...g].join(","), fov: h.fov || x, exposure: h.exposure }),
      { cam: v, target: g }
    );
  }
  window.__setShot = (u) => {
    u && u.wpose ? l(u.wpose, u) : r && r(u);
  };
  let c = l(i.params.wpose || "hip", i.params);
  return {
    cam: c.cam,
    target: c.target,
    update(u) {
      e.update(u), a === "fire" && (e.debug.flash = !0);
    },
  };
}
var ex = {};
br(ex, { TUNE: () => Ui, create: () => Em, showcase: () => VC });
var Yi = {
    introSeconds: 3.5,
    retryIntroSeconds: 1.3,
    interactRange: 2.2,
    interactFacing: 0.45,
    infiltrateRange: 16,
    cutSeconds: 2.4,
    patrol: { gull: 2, hound: 1 },
    waves: [
      { gull: 3, hound: 1 },
      { gull: 3, hound: 2 },
      { gull: 4, hound: 3 },
    ],
    maxAlive: 9,
    spawnStagger: 0.85,
    spawnFar: 18,
    pursuitEvery: 7,
    pursuitMinAlive: 4,
    pursuitExtra: 5,
    titleSpeed: 1.15,
    titleFov: 50,
  },
  jC = ["北方", "东北方", "东方", "东南方", "南方", "西南方", "西方", "西北方"],
  _l = {
    intro: "玄鲸队员，这里是指挥中心。港区主控已封锁泊位。切断堆场、仓库、码头的三处中继。",
    infiltrated: "已进入中继区。切断三处上行中继，注意机械守卫巡逻。",
    contact: "你已被发现！空中有机械飞鸥，地面有机械猎犬。消灭它们。",
    cut: [
      "第一处中继已断开。敌方已察觉，机械守卫正在赶来。",
      "第二处中继已断开。敌方正全力围攻，小心应对。",
    ],
    all: "三处中继全部断开！撤离艇在码头南端的舷梯旁，快撤！",
    bossWarning: "侦测到重装哨兵机甲正在逼近撤离区！击毁它才能登船。",
    bossDown: "哨兵机甲已瘫痪！撤离艇在码头南端的舷梯旁，快撤！",
    low: "伤势严重！找掩体躲避，稍作恢复。",
    done: "玄鲸队员已登船，港区封锁解除。干得漂亮！",
  };
function mM(i) {
  let e = (i.render && i.render.post) || {},
    t = typeof e.saturation == "number" ? e.saturation : 1,
    n = i.player,
    s = i.level,
    o = i.hud,
    r = i.input,
    a = (P, V, ...Y) => {
      try {
        if (P && typeof P[V] == "function") return P[V](...Y);
      } catch (L) {
        console.error(`[game] ${V} threw`, L);
      }
    },
    l = pM(i, {
      deploy() {
        a(i.audio, "resume"), r.requestLock(), U({});
      },
      resume() {
        j(!0);
      },
      restart() {
        a(i.audio, "resume"), r.requestLock(), c.retries++, U({ quick: !0, keepRetries: !0 });
      },
      retry() {
        a(i.audio, "resume"), r.requestLock(), c.retries++, U({ quick: !0, keepRetries: !0 });
      },
      redeploy() {
        a(i.audio, "resume"), r.requestLock(), U({ quick: !0 });
      },
    });
  l.applySettings();
  let c = {
      time: 0,
      retries: 0,
      relays: [],
      cut: 0,
      allCut: !1,
      bossAlive: !1,
      boss: null,
      stage: "infiltrate",
      queue: [],
      waveHot: 0,
      alertT: 0,
      pursuitT: 0,
      pursuitLeft: 0,
      contactSaid: !1,
      lowSaid: !1,
      extractHint: 0,
      intensity: 0.15,
      used: new Map(),
    },
    u = 0,
    h = Yi.introSeconds,
    f = !1,
    p = !1,
    d = 0,
    v = 0,
    g = !1,
    x = "",
    y = 0.8,
    b = new W(),
    m = new W(),
    A = () => (s && s.objectives) || [],
    _ = {
      state: "title",
      flow: Yi,
      run: c,
      menus: l,
      start(P = {}) {
        U({ skipIntro: !!P.skipIntro, quick: !!P.quick });
      },
      pause() {
        G();
      },
      resume() {
        j(!1);
      },
      update: B,
      debugCut() {
        let P = c.relays.find((V) => !V.cut);
        P && me(P);
      },
    };
  function M(P) {
    let V = _.state;
    P !== V && ((_.state = P), (u = 0), i.events.emit("game:state", { state: P, prev: V }));
  }
  let E = { pos: [], look: [], len: 1, t: 0 };
  function w() {
    let P = (s && s.cinematicPath) || [];
    if (
      ((E.pos = P.map((Y) => new W(...Y.pos))),
      (E.look = P.map((Y) => new W(...Y.look))),
      E.pos.length < 2)
    ) {
      let Y = (s && s.playerStart && s.playerStart.pos) || new W();
      (E.pos = [new W(Y.x, 2.2, Y.z), new W(Y.x + 8, 2, Y.z)]),
        (E.look = [new W(Y.x + 30, 2.5, Y.z - 2), new W(Y.x + 40, 3, Y.z - 2)]);
    }
    let V = 0;
    for (let Y = 1; Y < E.pos.length; Y++) V += E.pos[Y].distanceTo(E.pos[Y - 1]);
    E.len = Math.max(V, 4);
  }
  function S(P, V, Y) {
    let L = P.length - 1,
      Z = Zn(V, 0, 1) * L,
      J = Math.min(L - 1, Math.floor(Z)),
      oe = Z - J,
      fe = P[Math.max(0, J - 1)],
      le = P[J],
      R = P[J + 1],
      I = P[Math.min(L, J + 2)],
      se = oe * oe,
      ae = se * oe,
      k = (ce, ve, _e, Te) =>
        0.5 *
        (2 * ve +
          (-ce + _e) * oe +
          (2 * ce - 5 * ve + 4 * _e - Te) * se +
          (-ce + 3 * ve - 3 * _e + Te) * ae);
    return Y.set(k(fe.x, le.x, R.x, I.x), k(fe.y, le.y, R.y, I.y), k(fe.z, le.z, R.z, I.z));
  }
  function z(P) {
    let V = Math.max(26, E.len / Yi.titleSpeed);
    (E.t += P), E.t >= V && (E.t = 0);
    let Y = E.t / V,
      L = Y * Y * (3 - 2 * Y) * 0.25 + Y * 0.75,
      Z = i.camera,
      J = i.time.t;
    S(E.pos, L, b),
      S(E.look, L, m),
      (b.x += Math.sin(J * 0.31) * 0.05),
      (b.y += Math.sin(J * 0.43 + 1.7) * 0.035),
      (b.z += Math.sin(J * 0.27 + 0.6) * 0.05),
      (m.y += Math.sin(J * 0.19) * 0.12),
      (m.x += Math.sin(J * 0.13 + 2) * 0.2),
      Z.position.copy(b),
      Z.lookAt(m),
      (Z.rotation.z += Math.sin(J * 0.21) * 0.006),
      !i.params.fov &&
        Math.abs(Z.fov - Yi.titleFov) > 0.01 &&
        ((Z.fov = Yi.titleFov), Z.updateProjectionMatrix()),
      (e.fade = Math.max(1 - sl(0, 1.8, E.t), sl(V - 1.6, V, E.t)));
  }
  function H() {
    a(i.enemies, "clear"),
      a(i.fx, "clear"),
      a(i.combat, "reset"),
      a(i.weapon, "reset"),
      (c.time = 0),
      (c.cut = 0),
      (c.allCut = !1),
      (c.bossAlive = !1),
      (c.boss = null),
      o.setBoss && o.setBoss(null),
      (c.stage = "infiltrate"),
      (c.queue.length = 0),
      (c.waveHot = 0),
      (c.alertT = 0),
      (c.pursuitT = 0),
      (c.pursuitLeft = 0),
      (c.contactSaid = !1),
      (c.lowSaid = !1),
      (c.extractHint = 0),
      c.used.clear(),
      (c.relays = A().map((P, V) => {
        let Y = (/([a-z0-9])$/i.exec(String(P.id || "")) || [
          0,
          String.fromCharCode(65 + V),
        ])[1].toUpperCase();
        return (
          O(P, "live"), { o: P, id: P.id || "relay_" + V, short: Y, t: 0, cut: !1, cutting: !1 }
        );
      })),
      n.reset(s.playerStart),
      o.reset && o.reset(),
      (e.saturation = t),
      (e.flash = 0),
      q(),
      o.setRelays && o.setRelays(0, c.relays.length),
      ie();
  }
  function O(P, V) {
    try {
      let Y = P && P.object && P.object.userData;
      Y && typeof Y.setState == "function" && Y.setState(V);
    } catch (Y) {
      console.error("[game] relay setState threw", Y);
    }
  }
  function q() {
    if (!o.setMarkers) return;
    let P = c.relays
      .filter((V) => !V.cut)
      .map((V) => ({
        id: V.id,
        short: V.short,
        label: V.o.label || "中继 " + V.short,
        pos: V.o.pos,
        kind: "relay",
      }));
    c.allCut &&
      s.extraction &&
      P.push({
        id: "extract",
        short: "撤离",
        label: "撤离艇",
        pos: s.extraction.pos,
        kind: "extract",
      }),
      o.setMarkers(P);
  }
  function U({ skipIntro: P = !1, quick: V = !1, keepRetries: Y = !1 } = {}) {
    if (
      (Y || (c.retries = 0),
      l.show("none"),
      l.locationCard(!1),
      a(i.audio, "setPaused", !1),
      H(),
      a(i.weapon, "setVisible", !0),
      (g = !1),
      P)
    ) {
      (e.fade = 0), T();
      return;
    }
    (h = V ? Yi.retryIntroSeconds : Yi.introSeconds),
      (f = V),
      (p = V),
      (n.enabled = !1),
      r.setGameplay && r.setGameplay(!1),
      o.show(!1),
      (e.fade = 1),
      a(i.audio, "setIntensity", 0.15),
      M("intro");
  }
  function T() {
    (n.enabled = !0),
      o.show(!0),
      r.setGameplay && r.setGameplay(!0),
      o.setObjective(D()),
      M("playing"),
      C(!0);
  }
  function D() {
    if (c.allCut) return "前往撤离艇";
    if (c.bossAlive) return "击毁玄鲸哨兵机甲";
    if (c.stage === "infiltrate") return "潜入港区，接近中继区";
    let P = c.relays.length - c.cut;
    return c.cut === 0
      ? "切断三处上行中继"
      : P === 1
        ? "切断最后一处中继"
        : `切断剩余 ${P} 处中继`;
  }
  function C(P) {
    let V = r.describeMode ? r.describeMode() : "";
    l.setLookMode(V),
      !(!P && V === x) &&
        ((x = V),
        _.state === "playing" &&
        (r.mode === "drag" ||
          (r.mode === "lock" && !r.locked && !i.params.shot && !i.params.autostart))
          ? o.message(V, r.mode === "drag" ? 7 : 4)
          : _.state === "playing" && r.locked && o.message("", 0));
  }
  r.onModeChange && r.onModeChange(() => C(!1)),
    i.events.on("input:lock", (P) => {
      if (P.locked) {
        (g = !0), C(!1);
        return;
      }
      _.state === "playing" && g && G(), (g = !1);
    }),
    document.addEventListener("visibilitychange", () => {
      document.hidden && _.state === "playing" && G();
    }),
    addEventListener("keydown", (P) => {
      _.state !== "title" ||
        l.panelOpen ||
        (P.code !== "Enter" && P.code !== "NumpadEnter") ||
        (P.target && P.target.tagName === "BUTTON") ||
        (a(i.audio, "resume"), r.requestLock(), U({}));
    });
  function G() {
    _.state === "playing" &&
      (r.setGameplay && r.setGameplay(!1),
      r.exitLock(),
      a(i.audio, "setPaused", !0),
      l.setLookMode(
        r.mode === "drag" ? r.describeMode() : r.touch ? "" : "继续游戏后将重新捕获鼠标。",
      ),
      o.show(!1),
      l.show("paused"),
      (d = 0.35),
      M("paused"));
  }
  function j(P) {
    _.state === "paused" &&
      (l.show("none"),
      a(i.audio, "setPaused", !1),
      o.show(!0),
      r.setGameplay && r.setGameplay(!0),
      (g = !1),
      r.requestLock(),
      M("playing"),
      setTimeout(() => C(!0), 700));
  }
  function N(P) {
    let V = P === "gull" ? "air" : "ground",
      Y = (s && s.enemySpawns) || [],
      L = Y.filter((Z) => Z.type === V);
    return L.length ? L : Y;
  }
  function Q(P, { minDist: V = Yi.spawnFar, from: Y = n.pos, preferHidden: L = !0 } = {}) {
    let Z = N(P),
      J = null,
      oe = -1e9;
    for (let le of Z) {
      let R = Math.hypot(le.pos.x - Y.x, le.pos.z - Y.z),
        I = i.rng() * 1.5;
      if (((I += R >= V ? 2 + Math.min(1, (R - V) / 30) * 0.5 : -(V - R) / 4), L)) {
        b.copy(le.pos), (b.y += P === "gull" ? 0 : 1);
        let ae = !0;
        try {
          ae = i.physics.lineOfSight(b, n.eye);
        } catch {}
        ae || (I += 2.5);
      }
      let se = c.used.get(le);
      se !== void 0 && c.time - se < 6 && (I -= 3), I > oe && ((oe = I), (J = le));
    }
    let fe = new W();
    if (J) {
      c.used.set(J, c.time), fe.copy(J.pos);
      let le = (i.rng() - 0.5) * 2.4,
        R = (i.rng() - 0.5) * 2.4,
        I = P === "gull";
      try {
        I || (I = i.physics.nav.isWalkable(fe.x + le, fe.z + R));
      } catch {
        I = !1;
      }
      I && ((fe.x += le), (fe.z += R));
    } else {
      let le = i.rng() * Math.PI * 2;
      fe.set(Zn(Y.x + Math.cos(le) * 26, -34, 26), 0, Zn(Y.z + Math.sin(le) * 26, -26, 24));
    }
    return P === "gull" && fe.y < 2.5 && (fe.y = 6 + i.rng() * 3), fe;
  }
  function K(P, V, Y) {
    let L = null;
    try {
      L = i.enemies.spawn(P, V, Y);
    } catch (Z) {
      console.error("[game] enemies.spawn threw", Z);
    }
    return L;
  }
  function ie() {
    let P = (s.playerStart && s.playerStart.pos) || n.pos;
    for (let V of ["gull", "hound"])
      for (let Y = 0; Y < Yi.patrol[V]; Y++)
        K(V, Q(V, { minDist: 32, from: P, preferHidden: !0 }), { state: "patrol" });
  }
  function F(P) {
    let V = Yi.waves[Math.min(P, Yi.waves.length - 1)],
      Y = [];
    for (let oe = 0; oe < V.gull; oe++) Y.push("gull");
    for (let oe = 0; oe < V.hound; oe++) Y.splice(Math.min(Y.length, 1 + oe * 2), 0, "hound");
    let L = 0,
      Z = 0;
    Y.forEach((oe, fe) => {
      let le = Q(oe);
      (L += le.x - n.pos.x),
        (Z += le.z - n.pos.z),
        c.queue.push({ type: oe, pos: le, at: c.time + 1.6 + fe * Yi.spawnStagger });
    }),
      (c.waveHot = 30);
    let J = ((Math.atan2(L, -Z) * 180) / Math.PI + 360) % 360;
    o.warn && o.warn("发现敌情 · " + jC[Math.round(J / 45) % 8], 3.4);
  }
  function X(P) {
    let V = ne();
    for (let Y = 0; Y < c.queue.length; Y++) {
      let L = c.queue[Y];
      if (c.time < L.at) continue;
      if (V >= Yi.maxAlive) {
        L.at = c.time + 1;
        continue;
      }
      if (
        !K(L.type, L.pos, { state: "alert", target: n.pos }) &&
        !i.enemies.stub &&
        (L.tries = (L.tries || 0) + 1) < 6
      ) {
        L.at = c.time + 1.5;
        continue;
      }
      c.queue.splice(Y, 1), a(i.enemies, "alert", n.pos, 60);
      break;
    }
    if (c.allCut) {
      if (
        ((c.pursuitT -= P),
        c.pursuitT <= 0 && c.pursuitLeft > 0 && !c.queue.length && V < Yi.pursuitMinAlive)
      ) {
        (c.pursuitT = Yi.pursuitEvery), c.pursuitLeft--;
        let Y = i.rng() < 0.6 ? "gull" : "hound";
        c.queue.push({ type: Y, pos: Q(Y), at: c.time + 0.5 });
      }
      c.pursuitT <= 0 && ((c.pursuitT = 4), a(i.enemies, "alert", n.pos, 90));
    }
  }
  function ne() {
    try {
      return i.enemies.aliveCount
        ? i.enemies.aliveCount()
        : i.enemies.list.filter((P) => P.alive).length;
    } catch {
      return 0;
    }
  }
  function re(P) {
    let V = (i.enemies && i.enemies.list) || [];
    for (let Y = 0; Y < V.length; Y++) {
      let L = V[Y];
      if (L && L.alive && L.pos && Math.hypot(L.pos.x - n.pos.x, L.pos.z - n.pos.z) < P)
        return !0;
    }
    return !1;
  }
  i.events.on("enemy:alert", () => {
    (c.alertT = 10),
      _.state === "playing" &&
        !c.contactSaid &&
        ((c.contactSaid = !0), o.radio && o.radio(_l.contact, 3.2));
  }),
    i.events.on("player:hit", () => {
      c.alertT = Math.max(c.alertT, 8);
    }),
    i.events.on("player:rescued", () => {
      _.state === "playing" && o.message("已从水中获救", 2.5);
    }),
    i.events.on("boss:killed", () => {
      if (!c.bossAlive) return;
      (c.bossAlive = !1), (c.allCut = !0), (c.stage = "extract");
      o.radio && o.radio(_l.bossDown, 4.5), o.setObjective(D()), q();
    });
  function $() {
    let P = null,
      V = Yi.interactRange;
    for (let Y of c.relays) {
      if (Y.cut) continue;
      let L = Y.o.pos.x - n.pos.x,
        Z = Y.o.pos.z - n.pos.z,
        J = Math.hypot(L, Z);
      J > V ||
        Math.abs((Y.o.pos.y || 0) - n.pos.y) > 2.5 ||
        (J > 0.9 &&
          (L * n.forward.x + Z * n.forward.z) /
            (J * Math.max(0.2, Math.hypot(n.forward.x, n.forward.z))) <
            Yi.interactFacing) ||
        ((P = Y), (V = J));
    }
    return P;
  }
  function ue(P) {
    let V = n.alive ? $() : null;
    if (c.stage === "infiltrate" && n.alive) {
      let near = null;
      for (let L of c.relays) {
        if (!L.cut && Math.hypot(L.o.pos.x - n.pos.x, L.o.pos.z - n.pos.z) < Yi.infiltrateRange) {
          near = L;
          break;
        }
      }
      near && ((c.stage = "cut"), o.setObjective(D()), o.radio && o.radio(_l.infiltrated, 3.2));
    }
    for (let L of c.relays)
      L.cut ||
        (L === V && r.down("interact")
          ? (L.cutting || ((L.cutting = !0), O(L.o, "cutting")),
            (L.t += P / Yi.cutSeconds),
            i.events.emit("objective:progress", { id: L.id, t: Math.min(1, L.t) }),
            L.t >= 1 && me(L))
          : L.t > 0 &&
            ((L.t = Math.max(0, L.t - P * 1.6)),
            L.cutting &&
              ((L.cutting = !1),
              O(L.o, "live"),
              i.events.emit("objective:progress", { id: L.id, t: 0 }))));
    V && !V.cut
      ? o.setPrompt && o.setPrompt("切断中继 " + V.short, Fo(V.t))
      : o.setPrompt && o.setPrompt(null);
    let Y = s.extraction;
    if (Y && Y.pos) {
      let L = Math.hypot(Y.pos.x - n.pos.x, Y.pos.z - n.pos.z),
        Z = L < (Y.radius || 2.5) && Math.abs(Y.pos.y - n.pos.y) < 3.5;
      Z && c.allCut && n.alive
        ? ee()
        : Z &&
          !c.allCut &&
          c.extractHint <= 0 &&
          ((c.extractHint = 8),
          o.message(c.bossAlive ? "先击毁玄鲸哨兵机甲，撤离艇才能接应" : "中继尚未断开，撤离艇无法在火力下接应", 3.5)),
        (c.extractHint = Math.max(0, c.extractHint - P));
    }
  }
  function bossAppear() {
    let ex = (s && s.extraction && s.extraction.pos) || null,
      bp = new W(),
      dx = 0,
      dz = -10;
    if (ex) {
      dx = n.pos.x - ex.x;
      dz = n.pos.z - ex.z;
      let dl = Math.hypot(dx, dz) || 1;
      (dx /= dl), (dz /= dl);
      bp.set(ex.x + dx * 12, 0, ex.z + dz * 12);
    } else bp.set(n.pos.x, 0, n.pos.z + dz);
    let gy = 0;
    try {
      gy = i.physics.groundHeight ? i.physics.groundHeight(bp.x, bp.z) : 0;
    } catch {}
    bp.y = gy;
    let boss = null;
    try {
      boss = i.enemies.spawn("sentinel", bp, { variant: "standard" });
    } catch (err) {
      console.error("[game] sentinel spawn threw", err);
    }
    (c.bossAlive = !0), (c.boss = boss), (c.pursuitLeft = Yi.pursuitExtra), (c.pursuitT = 12);
    i.events.emit("objective:all", {}), o.radio && o.radio(_l.bossWarning, 4.6);
    try {
      let rp = new W(bp.x + 2.4, bp.y, bp.z + 2.4);
      i.weapon && i.weapon.spawnPickup && i.weapon.spawnPickup("rocket", WEAPON_DEFS.rocket.magSize * 2, rp, "weapon");
    } catch (err) {
      console.warn("[game] rocket pickup spawn failed", err);
    }
  }
  function me(P) {
    (P.cut = !0), (P.cutting = !1), (P.t = 1), c.cut++, O(P.o, "cut");
    let V = c.relays.length;
    i.events.emit("objective:done", { id: P.id, index: c.cut, total: V }),
      o.setRelays && o.setRelays(c.cut, V),
      o.setPrompt && o.setPrompt(null),
      n.addShake(0.18),
      F(c.cut - 1),
      c.cut >= V
        ? bossAppear()
        : o.radio && o.radio(_l.cut[Math.min(c.cut - 1, _l.cut.length - 1)], 3.6),
      o.setObjective(D()),
      q();
  }
  i.events.on("player:dead", () => {
    (_.state !== "playing" && _.state !== "paused") ||
      (r.setGameplay && r.setGameplay(!1),
      r.exitLock(),
      o.setPrompt && o.setPrompt(null),
      o.show(!1),
      o.clearRadio && o.clearRadio(),
      l.setDead({ time: c.time, relays: c.cut, total: c.relays.length }),
      M("dead"));
  });
  function ee() {
    (n.invulnerable = !0),
      (n.enabled = !1),
      r.setGameplay && r.setGameplay(!1),
      r.exitLock(),
      o.setPrompt && o.setPrompt(null),
      o.show(!1),
      i.events.emit("extraction:reached", {}),
      o.clearRadio && o.clearRadio(),
      o.radio && o.radio(_l.done, 2.2);
    let P = (i.combat && i.combat.stats) || { shots: 0, hits: 0, kills: 0 },
      V = P.shots > 0 ? Zn(P.hits / P.shots, 0, 1) : null,
      Y =
        (c.time < 270 ? 2 : c.time < 400 ? 1 : 0) +
        (V >= 0.5 ? 2 : V >= 0.3 ? 1 : 0) +
        (c.retries === 0 ? 1 : 0),
      L = ["险象环生", "火力全开", "稳扎稳打", "干净利落", "精准果断", "完美突击"][Y];
    l.setDebrief({
      time: c.time,
      accuracy: V,
      kills: P.kills || 0,
      retries: c.retries,
      rating: L,
    }),
      M("complete");
  }
  function B(P) {
    switch (((u += P), _.state)) {
      case "title":
        return z(P), !1;
      case "intro":
        return (
          (e.fade = 1 - sl(0.25, Math.min(h, 2.6), u)),
          !f && u > 0.5 && ((f = !0), l.locationCard(!0)),
          !p && u > 1.3 && ((p = !0), o.radio && o.radio(_l.intro, 4.2)),
          u > h - 0.6 && !o.root?.classList.contains("on") && (o.show(!0), o.setObjective(D())),
          u >= h && (l.locationCard(!1), (e.fade = 0), T()),
          !0
        );
      case "playing": {
        if (
          ((c.time += P),
          (e.fade = kn(e.fade || 0, 0, 6, P)),
          d > 0 && (d -= P),
          r.pressed("pause"))
        )
          return G(), !1;
        if ((ue(P), _.state !== "playing")) return !0;
        X(P), (c.alertT = Math.max(0, c.alertT - P)), (c.waveHot = Math.max(0, c.waveHot - P));
        let V = ne();
        c.waveHot > 0 && V === 0 && !c.queue.length && c.waveHot < 24 && (c.waveHot = 0);
        let Y =
          c.allCut || c.queue.length || (c.waveHot > 0 && V > 0)
            ? 1
            : c.alertT > 0 || (V > 0 && re(26))
              ? 0.6
              : 0.15;
        return (
          Y !== c.intensity && ((c.intensity = Y), a(i.audio, "setIntensity", Y)),
          r.mode === "lock" && !r.locked && !r.touch && !i.params.shot && !i.params.autostart
            ? ((y -= P), y <= 0 && ((y = 2), o.message(r.describeMode(), 2.6)))
            : (y = 0.8),
          !c.lowSaid &&
            n.alive &&
            n.health < 30 &&
            ((c.lowSaid = !0), o.radio && o.radio(_l.low, 3)),
          !0
        );
      }
      case "paused":
        return d > 0 ? (d -= P) : r.pressed("pause") && (l.closePanel() || j(!1)), !1;
      case "dead":
        return (
          (e.saturation = kn(e.saturation ?? 1, 0.12, 2.2, P)),
          (e.fade = kn(e.fade || 0, 0.55, 1.4, P)),
          u > 1.5 && l.screen !== "dead" && (l.show("dead"), a(i.audio, "setIntensity", 0.15)),
          !0
        );
      case "complete":
        return (
          (e.fade = kn(e.fade || 0, 0.72, 0.9, P)),
          (e.saturation = kn(e.saturation ?? 1, t * 0.7, 1, P)),
          u > 3.3 &&
            l.screen !== "complete" &&
            (l.show("complete"), a(i.audio, "setIntensity", 0.15)),
          !0
        );
    }
    return !1;
  }
  return (
    w(),
    (n.enabled = !1),
    o.show(!1),
    a(i.weapon, "setVisible", !1),
    r.setGameplay && r.setGameplay(!1),
    a(i.audio, "setIntensity", 0.15),
    i.params.shot || i.params.autostart || l.show("title"),
    _
  );
}
var gM = {
  mats: qg,
  level: cv,
  backdrop: mv,
  ground: vv,
  fx: Sv,
  weapon: Xv,
  enemies: ex,
  props: $g,
  render: Vg,
};
window.__frames = 0;
window.__ready = !1;
window.__fatal = null;
window.__errors = [];
window.addEventListener("error", (i) => {
  window.__errors.push(String(i.message));
});
{
  let i = console.error.bind(console);
  console.error = (...e) => {
    try {
      window.__errors.push(
        e
          .map((t) => (t && t.stack) || String(t))
          .join(" ")
          .slice(0, 400),
      );
    } catch {}
    i(...e);
  };
}
var KC = () => new Promise((i) => setTimeout(i, 0));
async function QC() {
  let i = Object.fromEntries(new URLSearchParams(location.search)),
    e = !!i.bench || location.hash === "#bench";
  e && ((i.noaudio = "1"), (i.autostart = "1"));
  let t = {
    THREE: lt,
    params: i,
    events: Dy(),
    rng: il(+(i.seed || 4207)),
    time: { t: 0, dt: 0, frame: 0, real: 0 },
    quality: zy(i.q || (i.shot ? "test" : "")),
  };
  window.__G = t;
  let n = i.show && gM[i.show] ? i.show : null;
  t.showcase = n;
  let s = null;
  function o(h) {
    if (h.cam) {
      let f = String(h.cam).split(",").map(Number);
      s = { pos: new W(f[0], f[1], f[2]), look: new W(f[3] ?? 0, f[4] ?? 1, f[5] ?? 0) };
    }
    h.cam === "" && (s = null),
      h.fov && ((t.camera.fov = +h.fov), t.camera.updateProjectionMatrix()),
      h.exposure && (t.render.exposure = +h.exposure);
  }
  window.__setShot = o;
  async function r(h, f, p, d = !1) {
    let v = performance.now();
    try {
      t[h] = await p();
    } catch (x) {
      if ((console.error(`[boot] module "${h}" failed: ${(x && x.stack) || x}`), d || !dr[h]))
        throw x;
      t[h] = dr[h]();
    }
    let g = performance.now() - v;
    g > 150 && console.log(`[boot] ${h} ${g.toFixed(0)}ms`);
  }
  if (
    (await Nr("正在启动渲染器", 0.04),
    await r("render", "render", () => Hg(t), !0),
    (t.renderer = t.render.renderer),
    (t.scene = t.render.scene),
    (t.camera = t.render.camera),
    (t.viewCamera = t.render.viewCamera),
    await Nr("正在生成涂装、锈迹与雨水", 0.12),
    await r("mats", "materials", () => Gg(t)),
    (t.physics = d3(t)),
    (t.props = Yg(t)),
    (t.input = n ? tP() : v_(t)),
    n)
  ) {
    let h = Qi(new rn(80, 80).rotateX(-Math.PI / 2), t.mats.get("concrete"), { cast: !1 });
    if (
      (t.scene.add(h),
      (t.level = {
        stub: !0,
        playerStart: { pos: new W(0, 0, 4), yaw: 0 },
        objectives: [],
        enemySpawns: [],
        zones: [],
        interiorBoxes: [],
        cinematicPath: [],
        extraction: { pos: new W(), radius: 2 },
        groundSurfaceAt: () => "concrete",
        update() {},
      }),
      (t.backdrop = dr.backdrop()),
      (t.ground = dr.ground()),
      t.physics.build(),
      n === "fx")
    )
      await r("fx", "fx", () => Cf(t));
    else
      try {
        t.fx = await Cf(t);
      } catch {
        t.fx = dr.fx();
      }
    (t.audio = dr.audio()),
      (t.hud = dr.hud()),
      (t.player = nP(t)),
      (t.combat = zv(t)),
      (t.weapon = dr.weapon()),
      (t.enemies = dr.enemies()),
      (t.game = { state: "showcase", update: () => !1, start() {} });
    let f = null;
    try {
      f = await gM[n].showcase(t);
    } catch (p) {
      bM(`showcase "${n}" threw: ${(p && p.stack) || p}`);
    }
    (t.showcaseInfo = f || {}),
      f && f.cam && o({ cam: [...f.cam, ...(f.target || [0, 1, 0])].join(",") });
  } else {
    if (
      (await Nr("正在布置集装箱", 0.34),
      await r("level", "level", () => C1(t), !0),
      await Nr("正在架设起重机", 0.5),
      await r("backdrop", "backdrop", () => pv(t)),
      await Nr("正在生成港区地面", 0.58),
      await r("ground", "ground", () => O1(t)),
      t.ground.stub)
    ) {
      let h = Qi(new rn(400, 400).rotateX(-Math.PI / 2), t.mats.get("asphalt"), { cast: !1 });
      t.scene.add(h);
    }
    t.physics.build(),
      await Nr("正在加载弹道与烟雾", 0.66),
      await r("fx", "fx", () => Cf(t)),
      await r("audio", "audio", () => (i.noaudio ? dr.audio() : c_(t))),
      (t.player = x_(t)),
      (t.combat = zv(t)),
      await Nr("正在检查玄鲸制式步枪", 0.74),
      await r("weapon", "weapon", () => dm(t)),
      await Nr("正在启动港区主控", 0.82),
      await r("enemies", "enemies", () => Em(t)),
      await r("hud", "hud", () => hM(t)),
      (t.game = mM(t));
  }
  await Nr("正在准备首帧画面", 0.92);
  try {
    await t.render.onLevelReady();
  } catch (h) {
    console.error("[boot] render.onLevelReady failed: " + ((h && h.stack) || h));
  }
  let a = 0;
  if (
    ((window.__stats = () => ({
      ...(t.render.stats ? t.render.stats() : {}),
      fps: a ? +(1 / a).toFixed(1) : 0,
      state: t.game && t.game.state,
    })),
    i.cam && o(i),
    i.fov && o({ fov: i.fov }),
    !n && (i.shot || i.autostart))
  )
    try {
      t.game.start({ skipIntro: !0 });
    } catch (h) {
      console.error("[boot] game.start failed", h);
    }
  i.noweapon && t.weapon.setVisible && t.weapon.setVisible(!1),
    e && eP(t),
    await Nr("准备就绪", 1),
    vM.classList.add("done"),
    setTimeout(() => {
      vM.hidden = !0;
    }, 700);
  let l = performance.now(),
    c = 1,
    u = (h, f) => {
      let p = t[h];
      if (p && p.update)
        try {
          p.update(f);
        } catch (d) {
          u.err[h] ||
            ((u.err[h] = 1), console.error(`[loop] ${h}.update threw: ${(d && d.stack) || d}`));
        }
    };
  (u.err = {}),
    t.renderer.setAnimationLoop(() => {
      let h = performance.now(),
        f = (h - l) / 1e3;
      (l = h), (a = a ? a * 0.95 + f * 0.05 : f);
      let p = Math.min(f, 0.05);
      i.dt && (p = +i.dt),
        (t.time.dt = p),
        (t.time.t += p),
        (t.time.real = h / 1e3),
        t.time.frame++,
        u("input", p);
      let d = !1;
      try {
        d = t.game.update(p) !== !1 && t.game.state !== "title" && t.game.state !== "paused";
      } catch (v) {
        u.err.game ||
          ((u.err.game = 1), console.error("[loop] game.update threw: " + ((v && v.stack) || v)));
      }
      if (n) {
        if (t.showcaseInfo.update)
          try {
            t.showcaseInfo.update(p);
          } catch (v) {
            u.err.sc ||
              ((u.err.sc = 1),
              console.error("[loop] showcase update threw: " + ((v && v.stack) || v)));
          }
      } else d && (u("player", p), u("weapon", p), u("enemies", p));
      if (
        t.weapon &&
        t.weapon.setWetness &&
        t.level &&
        t.level.interiorBoxes &&
        t.level.interiorBoxes[0]
      ) {
        let v = t.level.interiorBoxes[0],
          g = t.camera.position,
          x = g.x > v.min.x && g.x < v.max.x && g.z > v.min.z && g.z < v.max.z && g.y < v.max.y;
        c += ((x ? 0.3 : 1) - c) * Math.min(1, p * (x ? 0.25 : 0.6));
        try {
          t.weapon.setWetness(c);
        } catch {}
      }
      t.game.state !== "paused" &&
        (u("fx", p), u("ground", p), u("level", p), u("backdrop", p), u("mats", p)),
        u("audio", p),
        u("hud", p),
        s && (t.camera.position.copy(s.pos), t.camera.lookAt(s.look)),
        t.bench && t.bench.frame(f);
      try {
        t.render.frame(p);
      } catch (v) {
        u.err.render ||
          ((u.err.render = 1),
          console.error("[loop] render.frame threw: " + ((v && v.stack) || v)));
      }
      t.input.endFrame && t.input.endFrame(),
        window.__frames++,
        window.__frames === 2 && (window.__ready = !0);
    });
}
function eP(i) {
  let e = document.createElement("pre");
  (e.id = "bench"),
    (e.style.cssText =
      'position:absolute;left:12px;top:12px;z-index:90;margin:0;padding:10px 12px;font:12px/1.45 "PingFang SC",ui-monospace,monospace;color:#d8f0d0;background:rgba(0,0,0,.72);white-space:pre-wrap;max-width:min(560px,90vw);pointer-events:none'),
    document.getElementById("app").appendChild(e);
  let t = "unknown";
  try {
    let f = i.renderer.getContext(),
      p = f.getExtension("WEBGL_debug_renderer_info");
    t = p ? f.getParameter(p.UNMASKED_RENDERER_WEBGL) : f.getParameter(f.RENDERER);
  } catch {}
  let n =
      i.level.cinematicPath && i.level.cinematicPath.length >= 2
        ? i.level.cinematicPath
        : [
            { pos: [-32, 1.7, 6], look: [0, 2, 5] },
            { pos: [10, 1.7, 6], look: [30, 6, 0] },
          ],
    s = [],
    o = 0,
    r = 0,
    a = 30,
    l = new W(),
    c = new W(),
    u = new W(),
    h = new W();
  i.player && (i.player.enabled = !1),
    (i.bench = {
      frame(f) {
        o += f;
        let p = ((o / a) % 1) * (n.length - 1),
          d = Math.min(n.length - 2, Math.floor(p)),
          v = p - d,
          g = v * v * (3 - 2 * v);
        if (
          (l.fromArray(n[d].pos),
          c.fromArray(n[d + 1].pos),
          u.fromArray(n[d].look),
          h.fromArray(n[d + 1].look),
          i.camera.position.lerpVectors(l, c, g),
          i.camera.lookAt(u.lerp(h, g)),
          o > 2 && s.push(f * 1e3),
          s.length > 3e3 && s.shift(),
          o - r > 1 && s.length > 10)
        ) {
          r = o;
          let x = s.slice().sort((M, E) => M - E),
            y = x.reduce((M, E) => M + E, 0) / x.length,
            b = x[Math.floor(x.length * 0.99)],
            m = x[x.length >> 1],
            A = i.render.stats ? i.render.stats() : {},
            _ = i.renderer.getDrawingBufferSize(new Ae());
          e.textContent = `玄鲸性能测试  t=${o.toFixed(0)}s
GPU: ${t}
buffer ${_.x}x${_.y}  quality ${i.quality.name}  dpr ${window.devicePixelRatio}
frame ms avg ${y.toFixed(1)}  median ${m.toFixed(1)}  p99 ${b.toFixed(1)}  => ${(1e3 / y).toFixed(0)} fps
stats ${JSON.stringify(A)}
errors ${window.__errors.length}${
            window.__errors.length
              ? `
 - ` +
                window.__errors.slice(0, 6).join(`
 - `)
              : ""
          }`;
        }
      },
    });
}
function tP() {
  let i = () => {};
  return {
    move: { x: 0, y: 0 },
    look: { dx: 0, dy: 0 },
    fire: !1,
    ads: !1,
    sprint: !1,
    crouch: !1,
    locked: !1,
    touch: !1,
    sensitivity: 1,
    down: () => !1,
    pressed: () => !1,
    update: i,
    endFrame: i,
    requestLock: i,
    exitLock: i,
    nextWeapon: i,
    prevWeapon: i,
  };
}
function nP(i) {
  return {
    pos: new W(0, 0, 4),
    vel: new W(),
    yaw: 0,
    pitch: 0,
    health: 100,
    maxHealth: 100,
    alive: !0,
    onGround: !0,
    sprinting: !1,
    crouching: !1,
    ads: 0,
    speed: 0,
    eye: new W(0, Pi.eye, 4),
    forward: new W(0, 0, -1),
    enabled: !1,
    reset() {},
    damage() {},
    heal() {},
    addRecoil() {},
    addShake() {},
    update() {},
  };
}
