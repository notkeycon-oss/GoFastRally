// Go Fast Rally — low-poly car models: extruded body profiles, liveries,
// working wheels/suspension, lights, and impact deformation.
(function () {
  const G = window.G;

  // side profiles (x: + is the front, y: up from the ground). Arches are carved in.
  function profile(body, L, xmid, wf, wr, r) {
    const s = new THREE.Shape();
    const x0 = xmid - L / 2, x1 = xmid + L / 2;
    const arch = r + 0.07;
    const by = body === 'raid' ? 0.52 : 0.26; // body bottom height
    const hy = r; // wheel centre height
    s.moveTo(x0 + 0.04, by + 0.06);
    // bottom edge, rear arch, front arch
    s.lineTo(wr - arch - 0.02, by);
    s.absarc(wr, hy, arch, Math.PI, 0, true);
    s.lineTo(wf - arch, by);
    s.absarc(wf, hy, arch, Math.PI, 0, true);
    s.lineTo(x1 - 0.06, by);
    const P = (x, y) => s.lineTo(x, y);
    if (body === 'hatch') {
      P(x1, by + 0.1); P(x1 + 0.02, 0.6); P(x1 - 0.12, 0.78); P(xmid + 0.85, 0.98); P(xmid + 0.12, 1.36); P(x0 + 0.62, 1.38); P(x0 + 0.16, 1.09); P(x0, 0.9); P(x0 - 0.02, by + 0.12);
    } else if (body === 'sedan') {
      P(x1 + 0.02, by + 0.12); P(x1 + 0.04, 0.74); P(x1 - 0.05, 0.86); P(xmid + 0.62, 0.94); P(xmid + 0.12, 1.3); P(xmid - 0.95, 1.3); P(xmid - 1.45, 0.96); P(x0 + 0.08, 0.9); P(x0, 0.82); P(x0 - 0.02, by + 0.12);
    } else if (body === 'wedge') {
      P(x1 + 0.02, by + 0.08); P(x1 + 0.03, 0.5); P(x1 - 0.15, 0.62); P(xmid + 0.62, 0.92); P(xmid + 0.02, 1.26); P(xmid - 0.95, 1.26); P(x0 + 0.3, 1.04); P(x0 + 0.05, 1.0); P(x0, 0.78); P(x0 - 0.02, by + 0.1);
    } else {
      // raid truck
      P(x1 + 0.03, by + 0.1); P(x1 + 0.05, 0.98); P(x1 - 0.1, 1.12); P(xmid + 0.82, 1.22); P(xmid + 0.32, 1.78); P(x0 + 0.35, 1.8); P(x0 + 0.05, 1.7); P(x0, 1.1); P(x0 - 0.02, by + 0.12);
    }
    s.closePath();
    return s;
  }
  // greenhouse polygon (side windows), inset inside the outline
  function windows(body, L, xmid) {
    const s = new THREE.Shape();
    const x0 = xmid - L / 2;
    let pts;
    if (body === 'hatch') pts = [[xmid + 0.78, 1.0], [xmid + 0.12, 1.31], [x0 + 0.66, 1.33], [x0 + 0.24, 1.07], [x0 + 0.2, 1.0]];
    else if (body === 'sedan') pts = [[xmid + 0.56, 0.97], [xmid + 0.1, 1.26], [xmid - 0.92, 1.26], [xmid - 1.36, 0.98]];
    else if (body === 'wedge') pts = [[xmid + 0.56, 0.95], [xmid + 0.02, 1.22], [xmid - 0.9, 1.22], [x0 + 0.55, 1.04], [x0 + 0.5, 0.98]];
    else pts = [[xmid + 0.76, 1.26], [xmid + 0.3, 1.74], [x0 + 0.42, 1.75], [x0 + 0.2, 1.65], [x0 + 0.18, 1.28]];
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    return { s, pts };
  }

  function liveryTexture(lv, L, H) {
    const cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 384;
    const x = cv.getContext('2d');
    const w = cv.width, h = cv.height;
    x.fillStyle = lv.primary;
    x.fillRect(0, 0, w, h);
    // note: u runs rear->front (x0..x1), v runs bottom->top
    x.save();
    x.translate(0, h);
    x.scale(1, -1);
    const pat = lv.pattern;
    if (pat === 'stripes') {
      x.fillStyle = lv.secondary;
      x.fillRect(0, h * 0.3, w, h * 0.14);
      x.fillStyle = lv.accent;
      x.fillRect(0, h * 0.47, w, h * 0.05);
    } else if (pat === 'split') {
      x.fillStyle = lv.secondary;
      x.beginPath();
      x.moveTo(0, 0); x.lineTo(w * 0.62, 0); x.lineTo(w * 0.38, h); x.lineTo(0, h); x.closePath(); x.fill();
      x.fillStyle = lv.accent;
      x.beginPath();
      x.moveTo(w * 0.62, 0); x.lineTo(w * 0.67, 0); x.lineTo(w * 0.43, h); x.lineTo(w * 0.38, h); x.closePath(); x.fill();
    } else if (pat === 'hoop') {
      x.fillStyle = lv.secondary;
      x.fillRect(w * 0.42, 0, w * 0.16, h);
      x.fillStyle = lv.accent;
      x.fillRect(w * 0.4, 0, w * 0.02, h);
      x.fillRect(w * 0.58, 0, w * 0.02, h);
    } else if (pat === 'arrow') {
      x.fillStyle = lv.secondary;
      for (let i = 0; i < 3; i++) {
        const o = w * (0.12 + i * 0.16);
        x.beginPath();
        x.moveTo(o, h * 0.15); x.lineTo(o + w * 0.1, h * 0.42); x.lineTo(o, h * 0.69); x.lineTo(o + w * 0.06, h * 0.69); x.lineTo(o + w * 0.16, h * 0.42); x.lineTo(o + w * 0.06, h * 0.15); x.closePath(); x.fill();
      }
      x.fillStyle = lv.accent;
      x.fillRect(0, h * 0.08, w, h * 0.04);
    }
    // sill
    x.fillStyle = 'rgba(0,0,0,0.55)';
    x.fillRect(0, 0, w, h * 0.06);
    x.restore();
    const t = new THREE.CanvasTexture(cv);
    t.anisotropy = 4;
    return t;
  }

  function numberTexture(num, accent) {
    const cv = document.createElement('canvas');
    cv.width = 256;
    cv.height = 256;
    const x = cv.getContext('2d');
    x.clearRect(0, 0, 256, 256);
    x.fillStyle = '#ffffff';
    x.beginPath();
    x.roundRect ? x.roundRect(20, 40, 216, 176, 26) : x.rect(20, 40, 216, 176);
    x.fill();
    x.strokeStyle = accent || '#ffd23f';
    x.lineWidth = 10;
    x.stroke();
    x.fillStyle = '#111';
    x.font = 'italic 800 150px "Barlow Condensed", Impact, sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(String(num), 128, 134);
    const t = new THREE.CanvasTexture(cv);
    return t;
  }

  class CarModel {
    constructor(spec, livery, opts) {
      opts = opts || {};
      this.spec = spec;
      this.ghost = !!opts.ghost;
      const lv = Object.assign({ primary: spec.colors[0], secondary: spec.colors[1], accent: spec.colors[2], pattern: 'stripes', number: 7, rim: '#e8e8e8' }, livery || {});
      this.livery = lv;
      this.group = new THREE.Group();
      this.body = new THREE.Group();
      this.group.add(this.body);
      this.body.position.y = -spec.cgH;
      const S = spec;
      const L = S.dims[0], W = S.dims[1];
      const a = S.wheelbase * (1 - S.cgFront), b = S.wheelbase * S.cgFront;
      const wf = a, wr = -b;
      const xmid = (wf + wr) / 2 + (S.body === 'wedge' ? -0.05 : 0.08);
      const r = S.wheelR;
      this.mats = [];
      const mk = (m) => {
        if (this.ghost) {
          m.transparent = true;
          m.opacity = 0.32;
          m.depthWrite = false;
        }
        this.mats.push(m);
        return m;
      };
      // ----- body -----
      const shape = profile(S.body, L, xmid, wf, wr, r);
      const depth = W - 0.1;
      const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 1, curveSegments: 6 });
      g.translate(0, 0, -depth / 2);
      g.rotateY(Math.PI / 2);
      this.liveryTex = this.ghost ? null : liveryTexture(lv, L, 1.4);
      if (this.liveryTex) {
        const x0 = xmid - L / 2;
        // caps use (x, y) of the shape as uv
        this.liveryTex.repeat.set(1 / L, 1 / 1.45);
        this.liveryTex.offset.set(-x0 / L, -0.2 / 1.45);
      }
      const capMat = mk(new THREE.MeshPhongMaterial({ color: this.ghost ? 0x9fd8ff : 0xffffff, map: this.liveryTex, shininess: 70, specular: 0x555555 }));
      const paintMat = mk(new THREE.MeshPhongMaterial({ color: this.ghost ? 0x9fd8ff : new THREE.Color(lv.primary), shininess: 80, specular: 0x666666 }));
      this.bodyMesh = new THREE.Mesh(g, [capMat, paintMat]);
      this.bodyMesh.castShadow = !this.ghost;
      this.body.add(this.bodyMesh);
      this.origPos = Float32Array.from(g.attributes.position.array);
      // ----- glass -----
      const glassMat = mk(new THREE.MeshPhongMaterial({ color: 0x141b24, shininess: 120, specular: 0x8899aa }));
      const wd = windows(S.body, L, xmid);
      const wg = new THREE.ExtrudeGeometry(wd.s, { depth: W + 0.0, bevelEnabled: false });
      wg.translate(0, 0, -(W + 0.0) / 2);
      wg.rotateY(Math.PI / 2);
      const wm = new THREE.Mesh(wg, glassMat);
      wm.scale.set(1.0, 1, 1);
      this.body.add(wm);
      // windscreen & rear glass as thin panels lying on the outline
      const panel = (p0, p1, width) => {
        const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
        const len = Math.hypot(dx, dy);
        const m = new THREE.Mesh(new THREE.BoxGeometry(width, 0.02, len * 0.92), glassMat);
        const nx = dy / len, ny = -dx / len; // outward normal (outline is counter-clockwise)
        m.position.set(0, (p0[1] + p1[1]) / 2 + ny * 0.04, -((p0[0] + p1[0]) / 2 + nx * 0.04));
        m.rotation.x = Math.atan2(-dy, -dx);
        this.body.add(m);
        return m;
      };
      const ws = S.body === 'hatch' ? [[xmid + 0.85, 0.98], [xmid + 0.12, 1.36]] : S.body === 'sedan' ? [[xmid + 0.62, 0.94], [xmid + 0.12, 1.3]] : S.body === 'wedge' ? [[xmid + 0.62, 0.92], [xmid + 0.02, 1.26]] : [[xmid + 0.82, 1.22], [xmid + 0.32, 1.78]];
      panel(ws[0], ws[1], W * 0.84);
      // bonnet camera sits just ahead of the windscreen, above the hood
      this.bonnetLocal = new THREE.Vector3(0, ws[0][1] + 0.16 - S.cgH, -(ws[0][0] + 0.12));
      const x0r = xmid - L / 2;
      const rw = S.body === 'hatch' ? [[x0r + 0.6, 1.38], [x0r + 0.16, 1.09]] : S.body === 'sedan' ? [[xmid - 0.95, 1.3], [xmid - 1.43, 0.97]] : S.body === 'wedge' ? [[xmid - 0.95, 1.26], [x0r + 0.32, 1.05]] : [[x0r + 0.05, 1.68], [x0r + 0.0, 1.3]];
      if (S.body !== 'raid') panel(rw[0], rw[1], W * 0.8);
      else {
        const rg = new THREE.Mesh(new THREE.BoxGeometry(W * 0.7, 0.32, 0.02), glassMat);
        rg.position.set(0, 1.5, -(x0r - 0.012));
        this.body.add(rg);
      }
      // ----- details -----
      const dark = mk(new THREE.MeshLambertMaterial({ color: 0x15171b }));
      const accentMat = mk(new THREE.MeshPhongMaterial({ color: new THREE.Color(lv.secondary), shininess: 60 }));
      const x1 = xmid + L / 2, x0 = xmid - L / 2;
      const box = (w, h, d, mat, x, y, z) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        this.body.add(m);
        return m;
      };
      // bumpers & skid plate
      const by = S.body === 'raid' ? 0.52 : 0.26;
      box(W * 0.98, 0.16, 0.2, dark, 0, by + 0.1, -(x1 + 0.03));
      box(W * 0.98, 0.16, 0.2, dark, 0, by + 0.1, -(x0 - 0.03));
      box(W * 0.6, 0.05, 1.0, dark, 0, by - 0.02, -(x1 - 0.6));
      // mirrors
      for (const sx of [-1, 1]) box(0.16, 0.1, 0.12, accentMat, sx * (W / 2 + 0.06), ws[0][1] + 0.05, -(ws[0][0] - 0.1));
      // spoiler / wing
      if (S.id === 'vortex' || S.id === 'havoc' || S.id === 'sprite') {
        const big = S.id === 'havoc';
        const wy = S.body === 'hatch' ? 1.42 : 1.2;
        const wz = S.body === 'hatch' ? -(x0 + 0.25) : -(x0 + 0.18);
        box(W * (big ? 0.98 : 0.92), 0.05, big ? 0.42 : 0.32, accentMat, 0, wy + (big ? 0.16 : 0.06), wz);
        for (const sx of [-1, 1]) box(0.04, big ? 0.24 : 0.14, 0.28, accentMat, sx * W * 0.45, wy + (big ? 0.07 : 0.02), wz);
      }
      if (S.body === 'raid') {
        // roof rack, spare wheel, light bar
        box(W * 0.8, 0.06, 1.2, dark, 0, 1.84, -(xmid - 0.4));
        const sp = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.22, 14), dark);
        sp.rotation.z = Math.PI / 2;
        sp.position.set(0, 1.0, -(x0 - 0.14));
        sp.rotation.set(Math.PI / 2, 0, 0);
        this.body.add(sp);
        box(W * 0.9, 0.08, 0.1, dark, 0, by + 0.2, -(x1 + 0.12));
      }
      // roof scoop
      if (S.body !== 'raid') box(0.34, 0.08, 0.36, accentMat, 0, (S.body === 'hatch' ? 1.38 : 1.29) + 0.04, -(xmid - 0.1));
      // mudflaps
      for (const zx of [wf, wr])
        for (const sx of [-1, 1]) box(0.3, 0.32, 0.03, accentMat, sx * (S.track / 2), by + 0.02, -(zx - r - 0.12));
      // exhaust
      const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.24, 8), dark);
      ex.rotation.x = Math.PI / 2;
      ex.position.set(W * 0.3, by + 0.06, -(x0 - 0.08));
      this.body.add(ex);
      this.exhaustLocal = new THREE.Vector3(W * 0.3, by + 0.06 - S.cgH, -(x0 - 0.22));
      // lights
      this.headMat = mk(new THREE.MeshBasicMaterial({ color: 0xfff6d8 }));
      this.tailMat = mk(new THREE.MeshBasicMaterial({ color: 0x8a1414 }));
      const hy = S.body === 'raid' ? 0.92 : S.body === 'wedge' ? 0.5 : S.body === 'sedan' ? 0.68 : 0.64;
      for (const sx of [-1, 1]) {
        box(0.32, 0.12, 0.05, this.headMat, sx * W * 0.32, hy, -(x1 + 0.03));
        box(0.28, 0.1, 0.05, this.tailMat, sx * W * 0.36, S.body === 'raid' ? 1.0 : 0.82, -(x0 - 0.02));
      }
      // night light pod
      if (opts.night && !this.ghost) {
        const podMat = this.headMat;
        for (let i = 0; i < 4; i++) {
          const c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 10), podMat);
          c.rotation.x = Math.PI / 2;
          c.position.set((i - 1.5) * 0.24, (S.body === 'raid' ? 1.15 : S.body === 'wedge' ? 0.7 : 0.88) + 0.04, -(x1 - 0.2));
          this.body.add(c);
          const back = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 10), dark);
          back.rotation.x = Math.PI / 2;
          back.position.copy(c.position);
          back.position.z += 0.04;
          this.body.add(back);
        }
      }
      // door numbers on both sides (readable decals)
      if (!this.ghost) {
        this.numTex = numberTexture(lv.number, lv.accent);
        const nm = new THREE.MeshBasicMaterial({ map: this.numTex, transparent: true });
        this.mats.push(nm);
        for (const sx of [-1, 1]) {
          const p = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), nm);
          p.position.set(sx * (W / 2 + 0.003), S.body === 'raid' ? 1.0 : 0.66, -(xmid + 0.15));
          p.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
          this.body.add(p);
        }
        // roof number
        const rp = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), nm);
        rp.rotation.x = -Math.PI / 2;
        rp.position.set(0, (S.body === 'raid' ? 1.81 : S.body === 'hatch' ? 1.375 : 1.265) + 0.05, -(xmid - 0.55));
        this.body.add(rp);
      }
      // ----- wheels -----
      this.wheels = [];
      const tyreMat = mk(new THREE.MeshLambertMaterial({ color: 0x1b1b1d }));
      const rimMat = mk(new THREE.MeshPhongMaterial({ color: new THREE.Color(lv.rim || '#e8e8e8'), shininess: 60 }));
      const tg = new THREE.CylinderGeometry(r, r, 0.24, 18);
      tg.rotateZ(Math.PI / 2);
      const rg = new THREE.CylinderGeometry(r * 0.62, r * 0.62, 0.25, 10);
      rg.rotateZ(Math.PI / 2);
      const sg = new THREE.BoxGeometry(0.255, r * 1.15, 0.07);
      for (let i = 0; i < 4; i++) {
        const outer = new THREE.Group();
        const spin = new THREE.Group();
        const t = new THREE.Mesh(tg, tyreMat);
        t.castShadow = !this.ghost;
        spin.add(t);
        spin.add(new THREE.Mesh(rg, rimMat));
        for (let k = 0; k < 3; k++) {
          const sp = new THREE.Mesh(sg, tyreMat);
          sp.rotation.x = (k * Math.PI) / 3;
          spin.add(sp);
        }
        outer.add(spin);
        this.group.add(outer);
        this.wheels.push({ outer, spin });
      }
      // headlights for night driving
      this.spots = [];
      if (opts.night && !this.ghost) {
        for (const sx of [-0.5, 0.5]) {
          const sl = new THREE.SpotLight(0xfff2d0, 2.4, 140, 0.5, 0.45, 1.2);
          sl.position.set(sx, hy - S.cgH, -(x1 - 0.1));
          sl.target.position.set(sx * 3, -2.2, -(x1 + 30));
          this.group.add(sl);
          this.group.add(sl.target);
          this.spots.push(sl);
        }
      }
      this.brakeOn = false;
    }

    // set from physics
    update(ph) {
      this.group.position.copy(ph.pos);
      this.group.quaternion.copy(ph.q);
      for (let i = 0; i < 4; i++) {
        const w = ph.wheels[i], v = this.wheels[i];
        v.outer.position.set(w.mount.x, w.mount.y - w.len, w.mount.z);
        v.outer.rotation.y = -w.delta;
        v.spin.rotation.x = -w.rot;
        if (ph.damage.punct[i]) v.outer.scale.set(1, 0.9, 1);
        else v.outer.scale.set(1, 1, 1);
      }
      const brake = ph.input.brake > 0.1 && ph.gear >= 0;
      this.setBrake(brake || ph.input.handbrake > 0.5);
      if (ph.impacts.length) {
        for (const im of ph.impacts) this.deform(im.p, im.amt);
        ph.impacts.length = 0;
      }
    }

    // replay/ghost: pos, quat, steer, wheel spin, suspension lengths
    setState(pos, quat, steer, rot, lens, brake) {
      this.group.position.copy(pos);
      this.group.quaternion.copy(quat);
      const S = this.spec;
      const a = S.wheelbase * (1 - S.cgFront), b = S.wheelbase * S.cgFront;
      for (let i = 0; i < 4; i++) {
        const front = i < 2;
        const sx = i % 2 === 0 ? -1 : 1;
        const v = this.wheels[i];
        v.outer.position.set((sx * S.track) / 2, lens ? this._mountY(front) - lens[i] : -S.cgH + S.wheelR, front ? -a : b);
        v.outer.rotation.y = front ? -steer : 0;
        v.spin.rotation.x = -rot;
      }
      this.setBrake(!!brake);
    }
    _mountY(front) {
      const S = this.spec;
      const m = S.mass + 150;
      const load = front ? (m * 9.81 * S.cgFront) / 2 : (m * 9.81 * (1 - S.cgFront)) / 2;
      return -S.cgH + S.wheelR + S.rest - load / S.spring;
    }

    setBrake(on) {
      if (on === this.brakeOn) return;
      this.brakeOn = on;
      this.tailMat.color.setHex(on ? 0xff2a1a : 0x8a1414);
    }

    deform(p, amt) {
      const g = this.bodyMesh.geometry;
      const pa = g.attributes.position;
      const a = pa.array;
      const o = this.origPos;
      // impact point in body-mesh space
      const px = p.x, py = p.y + this.spec.cgH, pz = p.z;
      const R = 0.55 + amt * 0.6;
      const push = 0.07 + amt * 0.22;
      for (let i = 0; i < pa.count; i++) {
        const x = a[i * 3], y = a[i * 3 + 1], z = a[i * 3 + 2];
        const dx = x - px, dy = y - py, dz = z - pz;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d > R) continue;
        const f = (1 - d / R) * (1 - d / R) * push;
        // push toward the body centre
        let cx = -x, cy = 0.7 - y, cz = -z * 0.35;
        const l = Math.sqrt(cx * cx + cy * cy + cz * cz) || 1;
        let nx = x + (cx / l) * f, ny = y + (cy / l) * f * 0.5, nz = z + (cz / l) * f;
        // never more than 0.28 m from the original
        const ox = o[i * 3], oy = o[i * 3 + 1], oz = o[i * 3 + 2];
        const ddx = nx - ox, ddy = ny - oy, ddz = nz - oz;
        const dl = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);
        if (dl > 0.28) {
          nx = ox + (ddx / dl) * 0.28;
          ny = oy + (ddy / dl) * 0.28;
          nz = oz + (ddz / dl) * 0.28;
        }
        a[i * 3] = nx; a[i * 3 + 1] = ny; a[i * 3 + 2] = nz;
      }
      pa.needsUpdate = true;
      g.computeVertexNormals();
    }

    resetDamage() {
      const g = this.bodyMesh.geometry;
      g.attributes.position.array.set(this.origPos);
      g.attributes.position.needsUpdate = true;
      g.computeVertexNormals();
    }

    exhaustWorld(out) {
      return out.copy(this.exhaustLocal).applyQuaternion(this.group.quaternion).add(this.group.position);
    }

    dispose() {
      this.group.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
      });
      for (const m of this.mats) {
        if (m.map) m.map.dispose();
        m.dispose();
      }
      if (this.group.parent) this.group.parent.remove(this.group);
    }
  }

  G.CarModel = CarModel;
})();
