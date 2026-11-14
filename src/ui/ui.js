function v_(i) {
  let e = (i.renderer && i.renderer.domElement) || document.getElementById("view"),
    t = document.getElementById("ui"),
    n = new Set(),
    s = new Set(),
    o = { key: new Set(), mouse: new Set(), touch: new Set(), pad: new Set() },
    r = !1,
    a = !1,
    l = 0,
    c = 0,
    u = 0,
    h = [],
    f = {
      move: { x: 0, y: 0 },
      look: { dx: 0, dy: 0 },
      fire: !1,
      ads: !1,
      sprint: !1,
      crouch: !1,
      locked: !1,
      touch: !1,
      gamepad: !1,
      sensitivity: 1,
      invertY: !1,
      mode: "lock",
      down(P) {
        return n.has(P) && (r || g_[P] === 1);
      },
      pressed(P) {
        return s.has(P) && (r || g_[P] === 1);
      },
      update: ee,
      endFrame: B,
      requestLock: A,
      exitLock: _,
      setGameplay(P) {
        (P = !!P),
          P !== r && ((r = P), P || v(), M && M.root.classList.toggle("on", P && f.touch));
      },
      setPrompt(P) {
        M && M.btn.interact.classList.toggle("on", !!P);
      },
      onModeChange(P) {
        h.push(P);
      },
      nextWeapon() {
        i.weapon && i.weapon.nextWeapon && i.weapon.nextWeapon();
      },
      prevWeapon() {
        i.weapon && i.weapon.prevWeapon && i.weapon.prevWeapon();
      },
      describeMode() {
        return f.mode === "touch"
          ? "触屏操作已启用"
          : f.mode === "drag"
            ? "鼠标捕获不可用：移动鼠标调整视角，停在屏幕边缘持续转向；点击开火；方向键或 IJKL 也可转向"
            : f.locked
              ? "鼠标已捕获，按 Esc 释放"
              : "点击游戏画面以捕获鼠标";
      },
    };
  function p(P) {
    if (f.mode !== P) {
      f.mode = P;
      for (let V of h)
        try {
          V(P);
        } catch (Y) {
          console.error(Y);
        }
    }
  }
  function d(P, V, Y) {
    if (!V) return;
    let L = o[P];
    if (Y) {
      if (L.has(V)) return;
      L.add(V), n.has(V) || (n.add(V), s.add(V));
    } else {
      if (!L.delete(V)) return;
      !o.key.has(V) && !o.mouse.has(V) && !o.touch.has(V) && !o.pad.has(V) && n.delete(V);
    }
  }
  function v() {
    for (let P in o) o[P].clear();
    n.clear(),
      (u = 0),
      (j = !1),
      M && (M.btn.ads.classList.remove("active"), ie(), (q = -1), (D = -1));
  }
  addEventListener("keydown", (P) => {
    let V = h_[P.code];
    if (!V) return;
    let Y = P.target;
    (Y && (Y.tagName === "INPUT" || Y.tagName === "SELECT" || Y.tagName === "TEXTAREA")) ||
      (Y &&
        Y.tagName === "BUTTON" &&
        (P.code === "Space" || P.code === "Enter" || P.code === "NumpadEnter")) ||
      (r &&
        (P.code === "Space" || P.code.startsWith("Arrow") || P.code === "ControlLeft") &&
        P.preventDefault(),
      !P.repeat && d("key", V, !0));
  }),
    addEventListener("keyup", (P) => {
      d("key", h_[P.code], !1);
    }),
    addEventListener("blur", () => {
      v();
    });
  let g = (P) => (P === 0 ? "fire" : P === 2 ? "ads" : P === 1 ? "melee" : null);
  e.addEventListener("mousedown", (P) => {
    if (!(f.touch && performance.now() - E < 800) && r) {
      if (!f.locked && f.mode === "lock") {
        A(), P.preventDefault();
        return;
      }
      (u |= 1 << P.button), d("mouse", g(P.button), !0), P.preventDefault();
    }
  }),
    addEventListener("mouseup", (P) => {
      (u &= ~(1 << P.button)), d("mouse", g(P.button), !1);
    }),
    addEventListener("contextmenu", (P) => {
      (P.target === e || r) && P.preventDefault();
    }),
    addEventListener("mousemove", (P) => {
      if (
        r &&
        (f.mode === "drag" &&
          ((x = P.clientX / Math.max(1, innerWidth)),
          (y = P.clientY / Math.max(1, innerHeight)),
          (b = !0)),
        f.locked || f.mode === "drag")
      ) {
        let V = P.movementX || 0,
          Y = P.movementY || 0;
        if (Math.abs(V) > 400 || Math.abs(Y) > 400) return;
        (f.look.dx += V * f_ * f.sensitivity),
          (f.look.dy += Y * f_ * f.sensitivity * (f.invertY ? -1 : 1));
      }
    }),
    addEventListener("wheel", (P) => {
      if (!(r && (f.locked || f.mode === "drag"))) return;
      P.deltaY > 0 ? f.nextWeapon() : f.prevWeapon();
    }, { passive: !0 }),
    document.addEventListener("pointerlockchange", () => {
      if (((f.locked = document.pointerLockElement === e), f.locked))
        (a = !0), (l = 0), (c = 0), f.touch || p("lock");
      else {
        o.mouse.clear(), n.delete("fire"), n.delete("ads");
        for (let P of o.key) n.add(P);
        u = 0;
      }
      i.events.emit("input:lock", { locked: f.locked });
    }),
    document.addEventListener("pointerlockerror", () => m());
  let x = 0.5,
    y = 0.5,
    b = !1;
  document.addEventListener("mouseleave", () => {
    b = !1;
  });
  function m() {
    (l = 0), !(f.locked || f.touch) && (c++, a || p("drag"));
  }
  function A() {
    if (!(f.touch || f.locked)) {
      if (!e.requestPointerLock) {
        m();
        return;
      }
      try {
        l = performance.now();
        let P = e.requestPointerLock();
        P && P.catch && P.catch(() => m());
      } catch {
        m();
      }
      try {
        e.focus({ preventScroll: !0 });
      } catch {}
    }
  }
  function _() {
    try {
      document.pointerLockElement && document.exitPointerLock();
    } catch {}
  }
  let M = null,
    E = 0,
    w = -1,
    S = 0,
    z = 0,
    H = 0,
    O = 0,
    q = -1,
    U = 0,
    T = 0,
    D = -1,
    C = 0,
    G = 0,
    j = !1;
  function N() {
    let P = document.createElement("div");
    (P.className = "touch"),
      (P.innerHTML =
        '<div class="t-stick"><i class="t-ring"></i><i class="t-nub"></i></div><button class="t-btn t-fire" data-a="fire" aria-label="开火"><span>开火</span></button><button class="t-btn t-ads" data-a="ads" aria-label="瞄准"><span>瞄准</span></button><button class="t-btn t-reload" data-a="reload" aria-label="换弹"><span>换弹</span></button><button class="t-btn t-jump" data-a="jump" aria-label="跳跃"><span>跳跃</span></button><button class="t-btn t-interact" data-a="interact" aria-label="Interact"><span>交互</span></button><button class="t-btn t-pause" data-a="pause" aria-label="暂停"><span>暂停</span></button>'),
      t.appendChild(P);
    let V = (L) => P.querySelector(L),
      Y = {
        root: P,
        stick: V(".t-stick"),
        nub: V(".t-nub"),
        btn: {
          fire: V(".t-fire"),
          ads: V(".t-ads"),
          reload: V(".t-reload"),
          jump: V(".t-jump"),
          interact: V(".t-interact"),
          pause: V(".t-pause"),
        },
      };
    for (let L in Y.btn) {
      let Z = Y.btn[L];
      Z.addEventListener(
        "touchstart",
        (oe) => {
          oe.preventDefault(), oe.stopPropagation(), (E = performance.now());
          let fe = oe.changedTouches[0];
          if (L === "ads") {
            (j = !j), Z.classList.toggle("active", j);
            return;
          }
          L === "fire" && ((D = fe.identifier), (C = fe.clientX), (G = fe.clientY)),
            Z.classList.add("active"),
            d("touch", L, !0);
        },
        { passive: !1 },
      );
      let J = (oe) => {
        if ((oe.preventDefault(), oe.stopPropagation(), L !== "ads")) {
          if (L === "fire") {
            let fe = !1;
            for (let le of oe.changedTouches) le.identifier === D && (fe = !0);
            if (!fe) return;
            D = -1;
          }
          Z.classList.remove("active"), d("touch", L, !1);
        }
      };
      Z.addEventListener("touchend", J, { passive: !1 }),
        Z.addEventListener("touchcancel", J, { passive: !1 }),
        Z.addEventListener(
          "touchmove",
          (oe) => {
            if ((oe.preventDefault(), L === "fire"))
              for (let fe of oe.changedTouches)
                fe.identifier === D &&
                  (Q(fe.clientX - C, fe.clientY - G), (C = fe.clientX), (G = fe.clientY));
          },
          { passive: !1 },
        ),
        Z.addEventListener("contextmenu", (oe) => oe.preventDefault());
    }
    return Y;
  }
  function Q(P, V) {
    (f.look.dx += P * d_ * f.sensitivity),
      (f.look.dy += V * d_ * f.sensitivity * (f.invertY ? -1 : 1));
  }
  function K() {
    f.touch ||
      ((f.touch = !0),
      _(),
      M || (M = N()),
      M.root.classList.toggle("on", r),
      document.documentElement.classList.add("is-touch"),
      p("touch"));
  }
  function ie() {
    (w = -1), (H = O = 0), M && M.stick.classList.remove("on");
  }
  addEventListener(
    "touchstart",
    () => {
      (E = performance.now()), K();
    },
    { passive: !0, capture: !0 },
  ),
    e.addEventListener(
      "touchstart",
      (P) => {
        if ((P.preventDefault(), !!r))
          for (let V of P.changedTouches)
            V.clientX < innerWidth * 0.45 && w < 0
              ? ((w = V.identifier),
                (S = V.clientX),
                (z = V.clientY),
                (H = O = 0),
                M &&
                  ((M.stick.style.transform = `translate3d(${S}px,${z}px,0)`),
                  (M.nub.style.transform = "translate3d(0,0,0)"),
                  M.stick.classList.add("on")))
              : q < 0 && ((q = V.identifier), (U = V.clientX), (T = V.clientY));
      },
      { passive: !1 },
    ),
    e.addEventListener(
      "touchmove",
      (P) => {
        if ((P.preventDefault(), !!r))
          for (let V of P.changedTouches)
            if (V.identifier === w) {
              let Y = V.clientX - S,
                L = V.clientY - z,
                Z = Math.hypot(Y, L);
              Z > If && ((Y *= If / Z), (L *= If / Z)),
                (H = Y / If),
                (O = -L / If),
                M &&
                  (M.nub.style.transform = `translate3d(${Y.toFixed(1)}px,${L.toFixed(1)}px,0)`);
            } else
              V.identifier === q &&
                (Q(V.clientX - U, V.clientY - T), (U = V.clientX), (T = V.clientY));
      },
      { passive: !1 },
    );
  let F = (P) => {
    for (let V of P.changedTouches) V.identifier === w ? ie() : V.identifier === q && (q = -1);
  };
  e.addEventListener("touchend", F, { passive: !1 }),
    e.addEventListener("touchcancel", F, { passive: !1 });
  let X = {
      0: "jump",
      1: "crouch",
      2: "reload",
      3: "interact",
      5: "melee",
      6: "ads",
      7: "fire",
      9: "pause",
      10: "sprint",
      11: "melee",
    },
    ne = typeof navigator < "u" && !!navigator.getGamepads,
    re = 0,
    $ = 0,
    ue = (P) => {
      let V = Math.abs(P);
      return V < 0.16 ? 0 : (Math.sign(P) * (V - 0.16)) / 0.84;
    };
  function me(P) {
    if (((re = $ = 0), !ne)) return;
    let V;
    try {
      V = navigator.getGamepads();
    } catch {
      ne = !1;
      return;
    }
    let Y = null;
    for (let J = 0; V && J < V.length; J++)
      if (V[J] && V[J].connected && V[J].mapping === "standard") {
        Y = V[J];
        break;
      }
    if (!Y) {
      f.gamepad && ((f.gamepad = !1), o.pad.clear());
      return;
    }
    (f.gamepad = !0), (re = ue(Y.axes[0] || 0)), ($ = -ue(Y.axes[1] || 0));
    let L = ue(Y.axes[2] || 0),
      Z = ue(Y.axes[3] || 0);
    r &&
      ((f.look.dx += L * Math.abs(L) * m_ * P * f.sensitivity),
      (f.look.dy += Z * Math.abs(Z) * m_ * 0.7 * P * f.sensitivity * (f.invertY ? -1 : 1)));
    for (let J in X) {
      let oe = Y.buttons[J];
      d("pad", X[J], !!oe && (oe.pressed || oe.value > 0.4));
    }
  }
  function ee(P) {
    if (
      (me(P),
      l && performance.now() - l > 1200 && !f.locked && m(),
      f.mode === "drag" && r && b && !f.locked)
    ) {
      let Z = x < 0.12 ? -(0.12 - x) / 0.12 : x > 0.88 ? (x - 0.88) / 0.12 : 0,
        J = y < 0.1 ? -(0.1 - y) / 0.1 : y > 0.9 ? (y - 0.9) / 0.1 : 0;
      (f.look.dx += Z * 2.4 * P * f.sensitivity),
        (f.look.dy += J * 1.2 * P * f.sensitivity * (f.invertY ? -1 : 1));
    }
    let V = 0,
      Y = 0,
      L = !1;
    if (r) {
      (V = (n.has("right") ? 1 : 0) - (n.has("left") ? 1 : 0)),
        (Y = (n.has("forward") ? 1 : 0) - (n.has("back") ? 1 : 0)),
        (L = n.has("sprint")),
        w >= 0 && ((V += H), (Y += O), Math.hypot(H, O) > 0.93 && O > 0.8 && (L = !0)),
        (V += re),
        (Y += $);
      let Z = Math.hypot(V, Y);
      Z > 1 && ((V /= Z), (Y /= Z));
      let J = (n.has("turnR") ? 1 : 0) - (n.has("turnL") ? 1 : 0),
        oe = (n.has("turnD") ? 1 : 0) - (n.has("turnU") ? 1 : 0);
      J && (f.look.dx += J * p_ * P), oe && (f.look.dy += oe * p_ * 0.6 * P);
    }
    (f.move.x = V),
      (f.move.y = Y),
      (f.fire = r && n.has("fire")),
      (f.ads = r && (n.has("ads") || j)),
      (f.sprint = r && L),
      (f.crouch = r && n.has("crouch"));
  }
  function B() {
    s.clear(), (f.look.dx = 0), (f.look.dy = 0);
  }
  return f;
}
var tx = 4,
  nx = -90,
  WC = 450,
  GC = {
    0: "北",
    45: "东北",
    90: "东",
    135: "东南",
    180: "南",
    225: "西南",
    270: "西",
    315: "西北",
  },
  ix = 2 * Math.PI * 19;
function li(i, e, t) {
  let n = document.createElement(i);
  return e && (n.className = e), t != null && (n.innerHTML = t), n;
}
function hM(i) {
  let e = document.getElementById("ui"),
    t = li("div", "hud");
  t.setAttribute("aria-hidden", "true");
  let n = li("div", "h-compass"),
    s = li("div", "h-tape"),
    o = "";
  for (let k = nx; k <= WC; k += 5) {
    let ce = (k - nx) * tx,
      ve = ((k % 360) + 360) % 360,
      _e = ve % 45 === 0,
      Te = ve % 15 === 0;
    (o += `<i class="${_e ? "mj" : Te ? "md" : "mn"}" style="left:${ce}px"></i>`),
      _e
        ? (o += `<b class="${ve % 90 === 0 ? "card" : "ic"}" style="left:${ce}px">${GC[ve]}</b>`)
        : ve % 15 === 0 &&
          (o += `<b class="num" style="left:${ce}px">${String(ve).padStart(3, "0")}</b>`);
  }
  s.innerHTML = o;
  let r = li("div", "h-tape-wrap");
  r.appendChild(s);
  let a = li("div", "h-cmarks"),
    l = li("div", "h-heading", "000");
  n.append(r, li("i", "h-needle"), a, l);
  let c = li(
      "div",
      "h-obj",
      '<div class="h-k">任务目标</div><div class="h-obj-t"></div><div class="h-relays"><span>中继</span><i></i><i></i><i></i><b>0/3</b></div>',
    ),
    u = c.querySelector(".h-obj-t"),
    h = c.querySelector(".h-relays"),
    f = h.querySelector("b"),
    p = [...h.querySelectorAll("i")],
    d = li("div", "h-warn"),
    v = li(
      "div",
      "h-cross",
      '<i class="c-t"></i><i class="c-b"></i><i class="c-l"></i><i class="c-r"></i><i class="c-dot"></i>',
    ),
    g = v.querySelectorAll("i"),
    x = li("div", "h-hit", "<i></i><i></i><i></i><i></i>"),
    y = li("div", "h-arcs"),
    b = [];
  for (let k = 0; k < 4; k++) {
    let ce = li(
      "div",
      "h-arc",
      '<svg viewBox="-100 -100 200 200"><path d="M -38 -84 A 92 92 0 0 1 38 -84" /><path class="tip" d="M -7 -97 L 0 -106 L 7 -97" /></svg>',
    );
    y.appendChild(ce), b.push({ el: ce, life: 0, src: new W(), op: -1, rot: 1e9 });
  }
  let m = li(
      "div",
      "h-prompt",
      `<svg viewBox="-24 -24 48 48"><circle class="bg" r="19"/><circle class="fg" r="19" stroke-dasharray="${ix.toFixed(2)}" stroke-dashoffset="${ix.toFixed(2)}" transform="rotate(-90)"/></svg><span class="h-key">E</span><span class="h-plabel"></span>`,
    ),
    A = m.querySelector(".fg"),
    _ = m.querySelector(".h-key"),
    M = m.querySelector(".h-plabel"),
    E = li("div", "h-feed"),
    w = li("div", "h-msg"),
    S = li(
      "div",
      "h-health",
      '<div class="h-k">生命状态</div><div class="h-hp-row"><b class="h-hp-n">100</b><div class="h-hp-bar">' +
        "<i></i>".repeat(10) +
        "</div></div>",
    ),
    z = S.querySelector(".h-hp-n"),
    H = [...S.querySelectorAll(".h-hp-bar i")],
    O = li(
      "div",
      "h-ammo",
      '<div class="h-cue"></div><div class="h-ammo-row"><b class="h-ammo-n">30</b><span class="h-ammo-r">120</span></div><div class="h-pips"></div><div class="h-wname"></div>',
    ),
    q = O.querySelector(".h-ammo-n"),
    U = O.querySelector(".h-ammo-r"),
    T = O.querySelector(".h-pips"),
    D = O.querySelector(".h-wname"),
    C = O.querySelector(".h-cue"),
    G = li("div", "h-marks"),
    bossEl = li(
      "div",
      "h-boss",
      '<div class="h-boss-k">玄鲸哨兵</div><div class="h-boss-bar"><i></i></div><b class="h-boss-p">阶段 1</b>',
    ),
    bossFill = null,
    bossPhaseEl = null;
  (bossEl.style.cssText =
    "position:absolute;left:50%;top:calc(84px + var(--sat));transform:translateX(-50%);width:min(420px,calc(100vw - var(--gl) - var(--gr) - 8px));display:none;align-items:center;gap:10px;padding:8px 12px;background:var(--plate);border-left:2px solid var(--signal);z-index:6;pointer-events:none"),
    (bossEl.querySelector(".h-boss-k").style.cssText =
      "font:600 11px/1 var(--f-label);letter-spacing:.26em;text-transform:uppercase;color:var(--bone-dim);white-space:nowrap"),
    (bossEl.querySelector(".h-boss-bar").style.cssText =
      "flex:1;height:10px;background:rgba(232,228,218,.14);position:relative;overflow:hidden"),
    ((bossFill = bossEl.querySelector(".h-boss-bar i")),
    (bossFill.style.cssText =
      "display:block;height:100%;width:100%;background:var(--signal);transform-origin:left center;transition:transform .12s linear")),
    ((bossPhaseEl = bossEl.querySelector(".h-boss-p")),
    (bossPhaseEl.style.cssText = "font:600 11px/1 var(--f-label);letter-spacing:.2em;color:var(--signal);white-space:nowrap"));
  t.append(G, n, c, d, y, v, x, m, E, w, S, O, bossEl), e.appendChild(t);
  let j = li(
    "div",
    "comms",
    '<span class="comms-who">指挥中心</span><span class="comms-t"></span>',
  );
  j.setAttribute("role", "status"), j.setAttribute("aria-live", "polite");
  let N = j.querySelector(".comms-t");
  e.appendChild(j);
  let Q = !1,
    K = 420,
    ie = innerWidth,
    F = innerHeight,
    X = {
      ammo: -1,
      mag: -1,
      reserve: -1,
      name: null,
      cue: null,
      low: null,
      hp: -1,
      hpSeg: -1,
      hurt: null,
      head: -1,
      tapeX: 1e9,
      gap: -1,
      crossOn: null,
      promptOn: null,
      promptText: null,
      promptT: -1,
      promptKey: null,
      marksOn: null,
      done: -1,
      total: -1,
    },
    ne = [],
    re = "",
    $ = 0,
    ue = 0,
    me = [],
    ee = null,
    B = 0,
    P = 0,
    V = 0,
    Y = 0,
    L = 0,
    Z = [],
    J = [],
    oe = new W(),
    fe = null,
    le = -1,
    bossSt = null;
  function R() {
    (ie = innerWidth),
      (F = innerHeight),
      (K = n.clientWidth || Math.min(420, ie * 0.6)),
      (X.tapeX = 1e9),
      (X.gap = -1);
    for (let k of J) (k.lastC = 1e9), (k.lastW = "");
  }
  addEventListener("resize", R),
    i.events.on("player:hitEnemy", (k) => {
      I.hitmarker(k && k.killed ? "kill" : k && (k.weak || k.part === "weak") ? "weak" : "hit"),
        k &&
          k.killed &&
          k.weak &&
          fe &&
          le === i.time.frame &&
          !fe.weak &&
          ((fe.weak = !0), (fe.el.innerHTML += "<em>弱点命中</em>"));
    }),
    i.events.on("enemy:killed", (k) => {
      let ce =
        { gull: "机械飞鸥", hound: "机械猎犬", sentinel: "玄鲸哨兵机甲" }[
          k && (k.type || (k.enemy && k.enemy.type))
        ] || "机械守卫";
      (fe = I.feed(`<b>${ce}</b> 已摧毁`)), (le = i.time.frame);
    }),
    i.events.on("boss:spawn", (k) => {
      let ce = k && k.enemy;
      bossSt = ce ? { enemy: ce, maxHp: (ce.maxHp || ce.hp) || 1, phase: 1 } : null;
      bossEl && (bossEl.style.display = bossSt ? "flex" : "none");
    }),
    i.events.on("boss:phase", (k) => {
      if (!bossSt) return;
      let ce = k && (k.phase != null ? k.phase : k.n != null ? k.n : k.stage);
      typeof ce == "number" && (bossSt.phase = ce);
    }),
    i.events.on("boss:killed", () => {
      (bossSt = null), bossEl && (bossEl.style.display = "none");
    }),
    i.events.on("player:hit", (k) => {
      if (!k || !k.fromPos) return;
      let ce = b[0];
      for (let ve of b) {
        if (ve.life <= 0) {
          ce = ve;
          break;
        }
        ve.life < ce.life && (ce = ve);
      }
      ce.src.copy(k.fromPos), (ce.life = 1.5), (ce.max = 1.5);
    });
  let I = {
    root: t,
    show(k) {
      (k = !!k), k !== Q && ((Q = k), t.classList.toggle("on", k), k && R());
    },
    setObjective(k) {
      (k = k || ""),
        k !== re &&
          ((re = k),
          ($ = 0),
          (ue = 0),
          (u.textContent = ""),
          c.classList.toggle("has", !!k),
          c.classList.remove("flash"),
          c.offsetWidth,
          c.classList.add("flash"));
    },
    setRelays(k, ce) {
      if (!(k === X.done && ce === X.total)) {
        if (ce !== X.total) {
          p.forEach((ve) => ve.remove()), (p = []);
          for (let ve = 0; ve < ce; ve++) {
            let _e = document.createElement("i");
            h.insertBefore(_e, f), p.push(_e);
          }
        }
        (X.done = k),
          (X.total = ce),
          p.forEach((ve, _e) => ve.classList.toggle("cut", _e < k)),
          (f.textContent = `${k}/${ce}`),
          h.classList.toggle("all", k >= ce && ce > 0);
      }
    },
    setMarkers(k) {
      for (let ce of J) ce.cEl.remove(), ce.wEl.remove();
      J = (k || []).map((ce) => {
        let ve = li(
            "div",
            "h-cm " + (ce.kind || "relay"),
            `<i></i><b>${ce.short || ""}</b><span></span>`,
          ),
          _e = li(
            "div",
            "h-wm " + (ce.kind || "relay"),
            `<i></i><b>${ce.short || ""}</b><span></span>`,
          );
        return (
          a.appendChild(ve),
          G.appendChild(_e),
          {
            ...ce,
            cEl: ve,
            wEl: _e,
            cDist: ve.querySelector("span"),
            wDist: _e.querySelector("span"),
            lastD: -1,
            lastC: 1e9,
            lastW: "",
            vis: null,
          }
        );
      });
    },
    setPrompt(k, ce = 0) {
      let ve = !!k;
      if (
        (ve !== X.promptOn &&
          ((X.promptOn = ve),
          m.classList.toggle("on", ve),
          i.input.setPrompt && i.input.setPrompt(ve)),
        !ve)
      )
        return;
      let _e = i.input.touch ? "交互" : i.input.gamepad && !i.input.locked ? "Y" : "E";
      _e !== X.promptKey &&
        ((X.promptKey = _e), (_.textContent = _e), _.classList.toggle("wide", _e.length > 1));
      let Te = `按住 ${_e} · ${k}`;
      Te !== X.promptText && ((X.promptText = Te), (M.textContent = Te));
      let Pe = Math.round(ce * 200) / 200;
      Pe !== X.promptT &&
        ((X.promptT = Pe),
        A.setAttribute("stroke-dashoffset", (ix * (1 - Pe)).toFixed(2)),
        m.classList.toggle("busy", Pe > 0));
    },
    radio(k, ce = 4.5) {
      k && me.push({ text: k, secs: ce });
    },
    clearRadio() {
      (me.length = 0), (ee = null), j.classList.remove("on");
    },
    warn(k, ce = 3) {
      (d.textContent = k),
        (Y = ce),
        d.classList.remove("on"),
        d.offsetWidth,
        d.classList.add("on");
    },
    message(k, ce = 3) {
      (w.textContent = k || ""), (L = k ? ce : 0), w.classList.toggle("on", !!k);
    },
    feed(k) {
      let ce = li("div", "h-fl", k);
      E.appendChild(ce);
      let ve = { el: ce, life: 4.2, weak: !1 };
      for (Z.push(ve); Z.length > 4; ) Z.shift().el.remove();
      return ve;
    },
    hitmarker(k = "hit") {
      x.className = "h-hit " + k;
      let ce = k === "weak" || k === "kill" ? 1.5 : 1.15;
      try {
        x.animate(
          [
            { opacity: 1, transform: `translate(-50%,-50%) scale(${ce})` },
            { opacity: 1, transform: "translate(-50%,-50%) scale(1)", offset: 0.35 },
            { opacity: 0, transform: "translate(-50%,-50%) scale(0.92)" },
          ],
          { duration: k === "kill" ? 420 : 240, easing: "ease-out" },
        );
      } catch {}
    },
    reset() {
      (me.length = 0), (ee = null), j.classList.remove("on");
      for (let k of Z) k.el.remove();
      Z.length = 0;
      for (let k of b) k.life = 0;
      (Y = 0),
        d.classList.remove("on"),
        I.message(""),
        I.setPrompt(null),
        I.setObjective(""),
        (X.hp = -1),
        I.setBoss(null);
    },
    setBoss(k) {
      let ce = k && k.enemy;
      bossSt = ce ? { enemy: ce, maxHp: (ce.maxHp || ce.hp) || 1, phase: 1 } : null;
      bossEl && (bossEl.style.display = bossSt ? "flex" : "none");
    },
    update: se,
  };
  function se(k) {
    if ((ae(k), !Q)) return;
    let ce = i.player,
      ve = i.weapon || {},
      _e = i.camera,
      Te = ce.ads || 0,
      Pe = ((-ce.yaw * 180) / Math.PI) % 360;
    Pe < 0 && (Pe += 360);
    let Re = Math.round((K / 2 - (Pe - nx) * tx) * 2) / 2;
    Re !== X.tapeX && ((X.tapeX = Re), (s.style.transform = `translate3d(${Re}px,0,0)`));
    let Fe = Math.round(Pe) % 360;
    Fe !== X.head && ((X.head = Fe), (l.textContent = String(Fe).padStart(3, "0")));
    let ze = Te < 0.5;
    if ((ze !== X.marksOn && ((X.marksOn = ze), G.classList.toggle("off", !ze)), J.length)) {
      _e.updateMatrixWorld(), _e.matrixWorldInverse.copy(_e.matrixWorld).invert();
      let we = K / 2 - 14;
      for (let be of J) {
        let Oe = be.pos.x - ce.pos.x,
          pt = be.pos.z - ce.pos.z,
          ut = Math.round(Math.hypot(Oe, pt));
        if (ut !== be.lastD) {
          be.lastD = ut;
          let Un = ut + "米";
          (be.cDist.textContent = Un), (be.wDist.textContent = Un);
        }
        let nn = (Math.atan2(Oe, -pt) * 180) / Math.PI - Pe;
        nn = ((nn + 540) % 360) - 180;
        let bt = Math.round(Math.max(-we, Math.min(we, nn * tx)));
        bt !== be.lastC &&
          ((be.lastC = bt),
          (be.cEl.style.transform = `translate3d(${bt}px,0,0)`),
          be.cEl.classList.toggle("edge", Math.abs(bt) >= we)),
          oe.set(be.pos.x, be.pos.y + (be.kind === "extract" ? 1.2 : 1.9), be.pos.z).project(_e);
        let Os,
          pn,
          Ti = !1;
        if (
          (oe.z > 1 && ((Ti = !0), (oe.x = -oe.x), (oe.y = -oe.y)),
          Ti || Math.abs(oe.x) > 0.9 || Math.abs(oe.y) > 0.82)
        ) {
          Ti = !0;
          let Un = Math.max(Math.abs(oe.x) / 0.9, Math.abs(oe.y) / 0.82, 0.001);
          if (((oe.x /= Un), (oe.y /= Un), oe.z > 1)) {
            let zo = Math.max(Math.abs(oe.x) / 0.9, Math.abs(oe.y) / 0.82);
            zo < 0.999 && ((oe.x /= zo), (oe.y /= zo));
          }
        }
        (Os = Math.round((oe.x * 0.5 + 0.5) * ie)), (pn = Math.round((-oe.y * 0.5 + 0.5) * F));
        let ho = !Ti && Math.hypot(oe.x, oe.y * 0.6) < 0.16,
          Rs = Os + "," + pn + (Ti ? "o" : "") + (ut < 3 ? "n" : "") + (ho ? "d" : "");
        Rs !== be.lastW &&
          ((be.lastW = Rs),
          (be.wEl.style.transform = `translate3d(${Os}px,${pn}px,0)`),
          be.wEl.classList.toggle("offscreen", Ti),
          be.wEl.classList.toggle("near", ut < 3),
          be.wEl.classList.toggle("dim", ho));
      }
    }
    let We = Te <= 0.6 && ce.alive && ve.state !== "reloading_hidden";
    if ((We !== X.crossOn && ((X.crossOn = We), v.classList.toggle("off", !We)), We)) {
      let we = typeof ve.spread == "number" ? ve.spread : 0.012,
        be = (_e.fov * Math.PI) / 360,
        Oe = (Math.tan(we) / Math.tan(be)) * (F / 2) + 4 + (ce.sprinting ? 10 : 0);
      (Oe = Math.round(Math.max(4, Math.min(70, Oe)) * 2) / 2),
        Oe !== X.gap &&
          ((X.gap = Oe),
          (g[0].style.transform = `translate3d(-50%,${-Oe}px,0) translateY(-100%)`),
          (g[1].style.transform = `translate3d(-50%,${Oe}px,0)`),
          (g[2].style.transform = `translate3d(${-Oe}px,-50%,0) translateX(-100%)`),
          (g[3].style.transform = `translate3d(${Oe}px,-50%,0)`));
    }
    let Ne = Math.max(1, Math.min(60, ve.magSize | 0 || 30)),
      dt = Math.max(0, ve.ammo | 0),
      xe = Math.max(0, ve.reserve | 0);
    if (
      (Ne !== X.mag &&
        ((X.mag = Ne),
        (T.innerHTML = "<i></i>".repeat(Ne)),
        (ne = [...T.children]),
        (X.ammo = -1)),
      dt !== X.ammo)
    ) {
      (X.ammo = dt), (q.textContent = String(dt).padStart(2, "0"));
      for (let we = 0; we < ne.length; we++) ne[we].className = we < dt ? "" : "off";
    }
    xe !== X.reserve && ((X.reserve = xe), (U.textContent = String(xe).padStart(3, "0"))),
      ve.name !== X.name && ((X.name = ve.name), (D.textContent = ve.name || ""));
    let Ie = dt <= Math.ceil(Ne * 0.27),
      Be =
        ve.state === "reloading"
          ? "换弹中"
          : dt === 0
            ? xe > 0
              ? i.input.touch
                ? "换弹"
                : "R · 换弹"
              : "弹药耗尽"
            : Ie
              ? "弹药不足"
              : "";
    Be !== X.cue &&
      ((X.cue = Be),
      (C.textContent = Be),
      (C.className =
        "h-cue" + (Be ? " on" : "") + (dt === 0 && ve.state !== "reloading" ? " urgent" : ""))),
      Ie !== X.low && ((X.low = Ie), O.classList.toggle("low", Ie));
    if (bossSt && bossSt.enemy) {
      let hp = Math.max(0, bossSt.enemy.hp || 0),
        mx = bossSt.maxHp || 1,
        fr = Math.max(0, Math.min(1, hp / mx));
      bossFill && (bossFill.style.transform = `scaleX(${fr})`);
      let ph = "阶段 " + (bossSt.phase || 1);
      bossPhaseEl && bossPhaseEl.textContent !== ph && (bossPhaseEl.textContent = ph);
    }
    let Xe = Math.max(0, Math.ceil(ce.health)),
      Me = ce.health < ce.maxHealth - 0.5;
    if (Xe !== X.hp) {
      (X.hp = Xe), (z.textContent = String(Xe));
      let we = Math.ceil((Xe / ce.maxHealth) * H.length);
      if (we !== X.hpSeg) {
        X.hpSeg = we;
        for (let be = 0; be < H.length; be++) H[be].className = be < we ? "" : "off";
        S.classList.toggle("crit", we <= 3);
      }
    }
    Me !== X.hurt && ((X.hurt = Me), S.classList.toggle("on", Me));
    for (let we of b) {
      if (we.life <= 0) {
        we.op !== 0 && ((we.op = 0), (we.el.style.opacity = "0"));
        continue;
      }
      we.life -= k;
      let be = Math.atan2(we.src.x - ce.pos.x, -(we.src.z - ce.pos.z)) + ce.yaw,
        Oe = Math.round((be * 180) / Math.PI);
      Oe !== we.rot &&
        ((we.rot = Oe), (we.el.style.transform = `translate(-50%,-50%) rotate(${Oe}deg)`));
      let pt = Math.round(Math.min(1, Math.max(0, we.life / 0.6)) * 20) / 20;
      pt !== we.op && ((we.op = pt), (we.el.style.opacity = String(pt)));
    }
    if ($ < re.length) {
      ue += k * 46;
      let we = Math.min(re.length, Math.floor(ue));
      we !== $ && (($ = we), (u.textContent = re.slice(0, we)));
    }
    Y > 0 && ((Y -= k), Y <= 0 && d.classList.remove("on")),
      L > 0 && ((L -= k), L <= 0 && w.classList.remove("on"));
    for (let we = Z.length - 1; we >= 0; we--) {
      let be = Z[we];
      (be.life -= k),
        be.life <= 0
          ? (be.el.remove(), Z.splice(we, 1))
          : be.life < 0.6 && !be.out && ((be.out = !0), be.el.classList.add("out"));
    }
  }
  function ae(k) {
    if (!ee) {
      if (!me.length) return;
      (ee = me.shift()),
        (B = 0),
        (P = 0),
        (V = ee.secs),
        (N.textContent = ""),
        j.classList.add("on"),
        i.events.emit("radio:line", { text: ee.text });
    }
    let ce = ee.text;
    if (B < ce.length) {
      P += k * 58;
      let ve = Math.min(ce.length, Math.floor(P));
      ve !== B && ((B = ve), (N.textContent = ce.slice(0, ve)));
    } else (V -= k), V <= 0 && ((ee = null), me.length || j.classList.remove("on"));
  }
  return R(), I;
}
var fM = "saltline.settings.v1",
  XC = { quality: "auto", sens: 1, invertY: !1, volume: 0.8, fov: Pi.fov },
  dM = ["low", "medium", "high", "ultra"];
function YC() {
  let i = { ...XC };
  try {
    let e = JSON.parse(localStorage.getItem(fM) || "null");
    e &&
      typeof e == "object" &&
      ((e.quality === "auto" || dM.includes(e.quality)) && (i.quality = e.quality),
      Number.isFinite(e.sens) && (i.sens = Math.min(3, Math.max(0.2, e.sens))),
      (i.invertY = !!e.invertY),
      Number.isFinite(e.volume) && (i.volume = Math.min(1, Math.max(0, e.volume))),
      Number.isFinite(e.fov) && (i.fov = Math.min(95, Math.max(60, e.fov))));
  } catch {}
  return i;
}
function Wf(i) {
  try {
    localStorage.setItem(fM, JSON.stringify(i));
  } catch {}
}
var $C = `
<dl class="keys">
  <div><dt>移动</dt><dd><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></dd></div>
  <div><dt>视角</dt><dd>鼠标</dd></div>
  <div><dt>开火</dt><dd>鼠标左键</dd></div>
  <div><dt>瞄准</dt><dd>鼠标右键</dd></div>
  <div><dt>换弹</dt><dd><kbd>R</kbd></dd></div>
  <div><dt>切断中继</dt><dd>按住 <kbd>E</kbd></dd></div>
  <div><dt>跳跃</dt><dd><kbd>Space</kbd></dd></div>
  <div><dt>冲刺</dt><dd><kbd>Shift</kbd></dd></div>
  <div><dt>蹲伏</dt><dd><kbd>C</kbd> 或 <kbd>Ctrl</kbd></dd></div>
  <div><dt>近战</dt><dd><kbd>F</kbd></dd></div>
  <div><dt>暂停</dt><dd><kbd>Esc</kbd> 或 <kbd>P</kbd></dd></div>
</dl>`,
  ZC = `
<dl class="keys">
  <div><dt>移动</dt><dd>左手拇指在左侧任意位置滑动</dd></div>
  <div><dt>视角</dt><dd>在屏幕右侧拖动</dd></div>
  <div><dt>开火</dt><dd>按住“开火”，拖动跟踪目标</dd></div>
  <div><dt>瞄准</dt><dd>点击“瞄准”切换瞄准状态</dd></div>
  <div><dt>换弹</dt><dd>换弹</dd></div>
  <div><dt>跳跃</dt><dd>跳跃</dd></div>
  <div><dt>切断中继</dt><dd>靠近中继并按住“交互”</dd></div>
  <div><dt>冲刺</dt><dd>将摇杆推到最前方</dd></div>
</dl>`;
function pM(i, e) {
  let t = document.getElementById("ui"),
    n = YC(),
    s = document.createElement("div");
  (s.className = "menu"),
    (s.dataset.screen = "none"),
    (s.innerHTML = `
  <div class="m-veil"></div>
  <div class="m-bars"><i></i><i></i></div>

  <section class="m-screen m-title" data-s="title" aria-label="断链">
    <div class="m-title-main">
      <div class="m-eyebrow"><span class="m-tag">B4</span><span>玄鲸突击小队</span><span class="m-dim">玄鲸港区 · 05:42</span></div>
      <h1 class="m-word">断链<span class="m-subtitle">3A大作</span></h1>
      <p class="m-premise">港区防御系统失控。切断三处中继，突破封锁，登船撤离。</p>
      <div class="m-actions">
        <button class="btn primary" data-act="deploy">开始行动</button>
        <button class="btn" data-act="settings">设置</button>
        <button class="btn" data-act="about">项目介绍</button>
        <button class="btn m-only-narrow" data-act="controls">操作说明</button>
      </div>
      <p class="m-note">使用 Fable5.2 自主研发 · 国产第一人称射击游戏 · 开发体验版</p>
    </div>
    <aside class="m-legend" aria-label="操作速览">
      <div><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 移动</span><span><kbd>鼠标</kbd> 视角</span><span><kbd>左键</kbd> 开火</span><span><kbd>右键</kbd> 瞄准</span><span><kbd>R</kbd> 换弹</span></div>
      <div><span><kbd>E</kbd> 切断中继</span><span><kbd>Space</kbd> 跳跃</span><span><kbd>Shift</kbd> 冲刺</span><span><kbd>C</kbd> 蹲伏</span><span><kbd>Esc</kbd> 暂停</span></div>
      <div class="lg-touch"><em>触屏操作</em><span>左手拇指移动</span><span>右手拇指转动视角</span><span>屏幕按钮：开火 · 瞄准 · 换弹 · 跳跃</span></div>
    </aside>
  </section>

  <section class="m-screen m-card" data-s="paused" aria-label="已暂停">
    <div class="m-k">行动暂时中止</div>
    <h2 class="m-h">已暂停</h2>
    <p class="m-line" data-f="lookmode"></p>
    <div class="m-actions col">
      <button class="btn primary" data-act="resume">继续游戏</button>
      <button class="btn" data-act="settings">设置</button>
      <button class="btn" data-act="controls">操作说明</button>
      <button class="btn" data-act="restart">重新开始任务</button>
    </div>
  </section>

  <section class="m-screen m-card m-dead" data-s="dead" aria-label="信号中断">
    <div class="m-k">突击队员倒下</div>
    <h2 class="m-h">信号中断</h2>
    <dl class="m-stats"><div><dt>生存时间</dt><dd data-f="dead-time">00:00</dd></div><div><dt>已切断中继</dt><dd data-f="dead-relays">0/3</dd></div></dl>
    <div class="m-actions col"><button class="btn primary" data-act="retry">重试</button></div>
  </section>

  <section class="m-screen m-card m-debrief" data-s="complete" aria-label="行动简报">
    <div class="m-k">四号泊位 · 行动简报</div>
    <h2 class="m-h">玄鲸港区已解除封锁</h2>
    <div class="m-rating"><span>行动评级</span><b data-f="rating">干净利落</b></div>
    <dl class="m-stats">
      <div><dt>用时</dt><dd data-f="time">00:00</dd></div>
      <div><dt>命中率</dt><dd data-f="acc">0%</dd></div>
      <div><dt>摧毁机械</dt><dd data-f="kills">0</dd></div>
      <div><dt>重试次数</dt><dd data-f="retries">0</dd></div>
    </dl>
    <div class="m-actions col"><button class="btn primary" data-act="redeploy">再次出击</button></div>
  </section>

  <div class="panel" role="dialog" aria-modal="true" aria-label="设置与操作" tabindex="-1" hidden>
    <header class="panel-h">
      <div class="tabs" role="tablist">
        <button class="tab" role="tab" data-tab="settings" aria-selected="true">设置</button>
        <button class="tab" role="tab" data-tab="controls" aria-selected="false">操作说明</button>
      <button class="tab" role="tab" data-tab="about" aria-selected="false">项目介绍</button>
      </div>
      <button class="btn small" data-act="close-panel">关闭</button>
    </header>
    <div class="panel-b about-copy" data-pane="about" hidden>
      <h3>断链</h3>
      <p>各位老师、同学好！宣传一下我们最近使用 Fable5.2 自主研发的一款国产 3A FPS 大作——<strong>《断链》</strong>！🎮</p>
      <p>我们致力于打造具有中国特色的高品质第一人称射击游戏，融合沉浸式战斗体验、创新玩法与次世代视觉表现，探索国产 FPS 游戏的更多可能性。</p>
      <p>目前项目仍在持续开发与优化中，距离国际顶尖 3A 水准还有一定差距。</p>
      <p>非常欢迎各位老师、同学关注、体验并提出宝贵建议，期待与游戏开发、图形学及 AI 方向的朋友深入交流！🐱🔥</p>
    </div>
    <div class="panel-b" data-pane="settings">
      <div class="row"><label id="l-q">画面质量</label>
        <div class="seg" role="group" aria-labelledby="l-q">${dM.map((U) => `<button data-q="${U}" aria-pressed="false">${{ low: "低", medium: "中", high: "高", ultra: "极高" }[U]}</button>`).join("")}</div></div>
      <div class="row"><label for="s-sens">鼠标灵敏度</label><div class="slider"><input id="s-sens" type="range" min="0.2" max="3" step="0.05"><output data-o="sens"></output></div></div>
      <div class="row"><label id="l-inv">反转垂直视角</label><button class="toggle" data-act="invert" aria-labelledby="l-inv" aria-pressed="false"><i></i><span>关闭</span></button></div>
      <div class="row"><label for="s-vol">主音量</label><div class="slider"><input id="s-vol" type="range" min="0" max="100" step="1"><output data-o="vol"></output></div></div>
      <div class="row"><label for="s-fov">视野范围</label><div class="slider"><input id="s-fov" type="range" min="60" max="95" step="1"><output data-o="fov"></output></div></div>
      <div class="row" data-row="fs"><label id="l-fs">显示模式</label><button class="btn small" data-act="fullscreen" aria-labelledby="l-fs fs-t"><span id="fs-t">进入全屏</span></button></div>
      <p class="panel-note" data-f="qnote"></p>
    </div>
    <div class="panel-b" data-pane="controls" hidden>
      <h3>键盘 · 鼠标</h3>${$C}
      <p class="panel-note">若浏览器无法捕获鼠标，按住鼠标按钮并拖动以调整视角（左键同时开火，右键同时瞄准）。方向键或 <kbd>I</kbd><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd> 转向，<kbd>Enter</kbd> 开火。</p>
      <h3>触屏操作</h3>${ZC}
      <h3>手柄</h3>
      <p class="panel-note">摇杆移动与转动视角 · RT 开火 · LT 瞄准 · A 跳跃 · B 蹲伏 · X 换弹 · Y 切断中继 · L3 冲刺 · Start 暂停。</p>
    </div>
  </div>

  <div class="loc-card" aria-hidden="true"><i></i><b>玄鲸港区 · 四号泊位 · 05:42</b><span>玄鲸突击小队 · 单兵行动，无人支援</span></div>
`),
    t.appendChild(s);
  let o = (U) => s.querySelector(U),
    r = (U) => [...s.querySelectorAll(U)],
    a = o(".panel"),
    l = o(".loc-card"),
    c = (U) => s.querySelector(`[data-f="${U}"]`),
    u = o("#s-sens"),
    h = o("#s-vol"),
    f = o("#s-fov"),
    p = "none",
    d = null;
  function v(U) {
    if (
      ((!U || U === "sens") && (i.input.sensitivity = n.sens),
      (!U || U === "invertY") && (i.input.invertY = n.invertY),
      !U || U === "volume")
    )
      try {
        i.audio && i.audio.setVolume && i.audio.setVolume(n.volume);
      } catch (T) {
        console.error(T);
      }
    if (
      ((!U || U === "fov") && i.player && i.player.setFov && i.player.setFov(n.fov),
      U === "quality" ||
        (!U &&
          n.quality !== "auto" &&
          !i.params.shot &&
          !i.params.q &&
          n.quality !== (i.quality && i.quality.name)))
    ) {
      let T = Pr[n.quality];
      if (T)
        try {
          i.render && i.render.setQuality
            ? i.render.setQuality({ ...T })
            : (i.quality = { ...T });
        } catch (D) {
          console.error("[game] setQuality failed", D);
        }
    }
  }
  function g() {
    let U = n.quality === "auto" ? i.quality && i.quality.name : n.quality;
    for (let D of r(".seg button")) D.setAttribute("aria-pressed", String(D.dataset.q === U));
    (u.value = n.sens),
      (h.value = Math.round(n.volume * 100)),
      (f.value = n.fov),
      (o('[data-o="sens"]').textContent = n.sens.toFixed(2) + "\xD7"),
      (o('[data-o="vol"]').textContent = Math.round(n.volume * 100) + "%"),
      (o('[data-o="fov"]').textContent = Math.round(n.fov) + "\xB0");
    let T = o('[data-act="invert"]');
    T.setAttribute("aria-pressed", String(n.invertY)),
      (T.querySelector("span").textContent = n.invertY ? "开启" : "关闭"),
      (c("qnote").textContent =
        n.quality === "auto"
          ? `已根据设备自动选择画质（${{ low: "低", medium: "中", high: "高", ultra: "极高" }[U] || "默认"}），运行不流畅时可降低画质。`
          : "画质设置立即生效；阴影和反射需要片刻重新生成。");
  }
  u.addEventListener("input", () => {
    (n.sens = +u.value), v("sens"), g(), Wf(n);
  }),
    h.addEventListener("input", () => {
      (n.volume = +h.value / 100), v("volume"), g(), Wf(n);
    }),
    f.addEventListener("input", () => {
      (n.fov = +f.value), v("fov"), g(), Wf(n);
    });
  let x = o('[data-row="fs"]'),
    y = o("#fs-t"),
    b = () => document.fullscreenElement || document.webkitFullscreenElement || null,
    m = document.getElementById("app") || document.documentElement;
  (m &&
    (m.requestFullscreen || m.webkitRequestFullscreen) &&
    document.fullscreenEnabled !== !1 &&
    document.webkitFullscreenEnabled !== !1) ||
    (x.hidden = !0);
  function _() {
    y.textContent = "当前环境不支持全屏";
  }
  function M() {
    try {
      if (b()) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        return;
      }
      let U = (m.requestFullscreen || m.webkitRequestFullscreen).call(m);
      U && U.catch && U.catch(_);
    } catch {
      _();
    }
  }
  let E = () => {
    y.textContent = b() ? "退出全屏" : "进入全屏";
  };
  document.addEventListener("fullscreenchange", E),
    document.addEventListener("webkitfullscreenchange", E);
  function w(U) {
    (d = document.activeElement),
      (a.hidden = !1),
      s.classList.add("panel-open"),
      z(U || "settings");
    try {
      a.focus({ preventScroll: !0 });
    } catch {}
  }
  function S() {
    return a.hidden
      ? !1
      : ((a.hidden = !0),
        s.classList.remove("panel-open"),
        d && d.focus && s.contains(d) ? d.focus() : H(),
        !0);
  }
  function z(U) {
    for (let T of r(".tab")) T.setAttribute("aria-selected", String(T.dataset.tab === U));
    for (let T of r(".panel-b")) T.hidden = T.dataset.pane !== U;
  }
  function H() {
    let U = s.querySelector(`.m-screen[data-s="${p}"] .btn.primary`);
    if (U)
      try {
        U.focus({ preventScroll: !0 });
      } catch {}
  }
  s.addEventListener("click", (U) => {
    let T = U.target.closest("button");
    if (!T || !s.contains(T)) return;
    if ((i.events.emit("ui:click", {}), T.dataset.q)) {
      (n.quality = T.dataset.q), v("quality"), g(), Wf(n);
      return;
    }
    if (T.dataset.tab) {
      z(T.dataset.tab);
      return;
    }
    let D = T.dataset.act;
    D === "about"
      ? w("about")
      : D === "settings"
        ? w("settings")
        : D === "controls"
          ? w("controls")
          : D === "close-panel"
            ? S()
            : D === "invert"
              ? ((n.invertY = !n.invertY), v("invertY"), g(), Wf(n))
              : D === "fullscreen"
                ? M()
                : D && e[D] && e[D](U);
  }),
    s.addEventListener("mouseover", (U) => {
      let T = U.target.closest("button");
      T && U.relatedTarget && !T.contains(U.relatedTarget) && i.events.emit("ui:hover", {});
    }),
    s.addEventListener("keydown", (U) => {
      if (
        (U.code === "Escape" && !a.hidden && (S(), U.stopPropagation(), U.preventDefault()),
        U.code === "Tab" && !a.hidden)
      ) {
        let T = [...a.querySelectorAll("button, input")].filter((G) => G.offsetParent !== null);
        if (!T.length) return;
        let D = T[0],
          C = T[T.length - 1];
        U.shiftKey && document.activeElement === D
          ? (C.focus(), U.preventDefault())
          : !U.shiftKey && document.activeElement === C && (D.focus(), U.preventDefault());
      }
    });
  let O = (U) => (
      (U = Math.max(0, Math.floor(U))),
      String(Math.floor(U / 60)).padStart(2, "0") + ":" + String(U % 60).padStart(2, "0")
    ),
    q = {
      root: s,
      settings: n,
      fmtTime: O,
      get screen() {
        return p;
      },
      get panelOpen() {
        return !a.hidden;
      },
      closePanel: S,
      show(U) {
        U !== p &&
          ((p = U),
          (s.dataset.screen = U),
          S(),
          s.classList.toggle("open", U !== "none"),
          U !== "none"
            ? (g(), setTimeout(H, 30))
            : document.activeElement &&
              s.contains(document.activeElement) &&
              document.activeElement.blur());
      },
      locationCard(U) {
        l.classList.toggle("on", !!U);
      },
      setLookMode(U) {
        c("lookmode").textContent = U || "";
      },
      setDead({ time: U, relays: T, total: D }) {
        (c("dead-time").textContent = O(U)), (c("dead-relays").textContent = `${T}/${D}`);
      },
      setDebrief({ time: U, accuracy: T, kills: D, retries: C, rating: G }) {
        (c("time").textContent = O(U)),
          (c("acc").textContent = T == null ? "\u2014" : Math.round(T * 100) + "%"),
          (c("kills").textContent = String(D)),
          (c("retries").textContent = String(C)),
          (c("rating").textContent = G);
      },
      applySettings: v,
    };
  return g(), q;
}
var vM = document.getElementById("boot"),
  xM = document.getElementById("boot-msg"),
  yM = document.getElementById("boot-fill");
function bM(i) {
  (window.__fatal = String(i)), console.error("[fatal] " + i);
  let e = document.getElementById("fatal");
  e ||
    ((e = document.createElement("div")),
    (e.id = "fatal"),
    document.getElementById("app").appendChild(e)),
    (e.textContent = "玄鲸启动失败：" + i);
}
async function Nr(i, e) {
  xM && (xM.textContent = i), yM && (yM.style.width = Math.round(e * 100) + "%"), await KC();
}
