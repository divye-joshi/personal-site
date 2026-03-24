import { useEffect, useRef } from 'react';

// ─── Character sets ───────────────────────────────────────────────────────────
const NUMBERS = '0123456789%#@*!'.split('');
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,?-!:\'_ '.split('');
const ALL_CHARS = [...new Set([...NUMBERS, ...LETTERS])].filter(c => c !== ' ');

const COLORS = ['#ffffff', '#00ffff', '#55ff55', '#ff8888'];

// ─── Pre-rendered glyph cache ─────────────────────────────────────────────────
const glyphCache = {};

function initGlyphCache() {
  if (Object.keys(glyphCache).length > 0) return;
  COLORS.forEach(color => {
    glyphCache[color] = {};
    ALL_CHARS.forEach(char => {
      const c = document.createElement('canvas');
      c.width = 120; c.height = 120;
      const cx = c.getContext('2d');
      cx.fillStyle = color;
      cx.font = '600 50px "Outfit", sans-serif';
      cx.textAlign = 'center';
      cx.textBaseline = 'middle';
      cx.shadowColor = color === '#ffffff' ? 'rgba(255,255,255,0.9)' : color;
      cx.shadowBlur = 20;
      cx.fillText(char, 60, 60);
      glyphCache[color][char] = c;
    });
  });
}

// ─── Section data ─────────────────────────────────────────────────────────────
export const SECTIONS = [
  {
    id: 0,
    elements: [
      { text: 'LANDING PAGE\n___________', color: '#00ffff' },
      { text: '\n\n\u201cEverything is numbers\u201d', color: '#55ff55' },
      { text: "\n\nHi, I'm Divye. Welcome to my corner of the internet.\n\nI put this personal site together to serve as a central hub for my work and background. If you're looking to get a quick sense of who I am, you'll find a brief introduction just a scroll away. You can also use this space to download my most up-to-date CV, explore my other profiles, and find the best way to get in touch with me.", color: '#ffffff' },
      { text: '\n\nAside from that, you can take a look at site navigation information on the top.', color: '#ff8888' },
    ],
  },
  {
    id: 1,
    elements: [
      { text: 'ABOUT ME\n_________', color: '#00ffff' },
      { text: "\n\nHi, I'm Divye Joshi.\n\nMy primary research interests lie at the intersection of Computer Vision, Signal Processing, and Quantum Machine Learning. I enjoy tackling real-world machine learning problems and have experience working with diverse and complex datasets.\n\nMy core expertise spans the entire ML lifecycle\u2014from the initial research phase of designing and optimizing model architectures, all the way to the production phase, where I deploy those models into automated, scalable pipelines.\n\nYou can find my detailed cv by clicking here :", color: '#ffffff' },
    ],
    links: [{ icon: 'cv', url: 'https://divye.tiiny.site' }],
  },
  {
    id: 2,
    elements: [
      { text: 'MY PROFILES\n_________', color: '#00ffff' },
    ],
    links: [
      { icon: 'linkedin', url: 'https://in.linkedin.com/in/divye-joshi' },
      { icon: 'scholar', url: 'https://scholar.google.com/citations?user=ztXtDjUAAAAJ&hl=en' },
      { icon: 'github', url: 'https://github.com/divye-joshi?tab=repositories' },
    ],
  },
  {
    id: 3,
    elements: [
      { text: 'CONNECT WITH ME\n_______________', color: '#00ffff' },
    ],
    links: [{ icon: 'email', url: 'mailto:work.with.divye@gmail.com' }],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function distToBox(x, y, box) {
  const dx = Math.max(box.left - x, 0, x - box.right);
  const dy = Math.max(box.top - y, 0, y - box.bottom);
  return Math.sqrt(dx * dx + dy * dy);
}

// ─── Text layout ──────────────────────────────────────────────────────────────
function layoutText(section, cw, ch, ctx) {
  const fontSize = 22;
  const lineHeight = fontSize * 1.5;

  ctx.font = `600 ${fontSize}px "Outfit", sans-serif`;

  const layout = {
    left: cw * 0.40,
    right: cw * 0.95,
    top: Math.max(ch * 0.10, 150),
    bottom: ch * 0.90,
  };

  const photoZone = { left: cw * 0.05, right: cw * 0.35, top: ch * 0.10, bottom: ch * 0.90 };

  const startX = layout.left + 60;
  const maxWidth = (layout.right - layout.left) - 120;

  // ── Word-wrap into lines ──
  const lines = [];
  let currLine = [], currW = 0;

  const pushLine = () => { lines.push(currLine); currLine = []; currW = 0; };

  section.elements.forEach(el => {
    el.text.split(/(\n)/).forEach(part => {
      if (part === '\n') { pushLine(); return; }
      part.split(' ').forEach(word => {
        if (!word) return;
        const wordW = ctx.measureText(word + ' ').width;
        if (currW + wordW > maxWidth && currLine.length > 0) pushLine();
        currLine.push({ word: word + ' ', color: el.color });
        currW += wordW;
      });
    });
  });
  if (currLine.length > 0) pushLine();

  // ── Place nodes ──
  const nodes = [];
  const totalH = lines.length * lineHeight;
  let cy = (layout.top + layout.bottom) / 2 - totalH / 2 - 40;

  lines.forEach(line => {
    let cx2 = startX;
    line.forEach(chunk => {
      for (let i = 0; i < chunk.word.length; i++) {
        const ch2 = chunk.word[i];
        const cw2 = ctx.measureText(ch2).width;
        if (ch2 !== ' ') {
          nodes.push({
            char: ch2, originalChar: ch2, x: cx2 + cw2 / 2, y: cy, color: chunk.color,
            particles: [], assembledCount: 0, isAssembled: false,
            glitchTimer: 0, glitchOffsetX: 0, glitchOffsetY: 0
          });
        }
        cx2 += cw2;
      }
    });
    cy += lineHeight;
  });

  // ── Bounding box ──
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    if (n.x < minX) minX = n.x; if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y; if (n.y > maxY) maxY = n.y;
  });

  const centerX = (minX + maxX) / 2;
  const minWidth = section.links ? 450 : 270;
  const calcW = Math.max((maxX - minX) + 90, minWidth);

  const textZone = nodes.length > 0 ? {
    left: centerX - calcW / 2,
    right: centerX + calcW / 2,
    top: minY - 45,
    bottom: maxY + 110,
    width: calcW,
    height: (maxY - minY) + 155,
  } : null;

  return { nodes, fontSize, textZone, photoZone };
}

// ─── Particle class ───────────────────────────────────────────────────────────
class Particle {
  constructor(cw, ch) {
    this.x = Math.random() * cw;
    this.y = Math.random() * ch;
    this.baseSize = Math.random() * 24 + 16;
    this.density = Math.random() * 30 + 1;
    this.char = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    this.baseOpacity = Math.random() * 0.5 + 0.2;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 1.2;
    this.angle = Math.random() * Math.PI * 2;
    this.angleSpeed = Math.random() * 0.08 + 0.02;
    this.danceRadius = Math.random() * 2 + 0.5;
    this.morphSpeed = Math.random() * 0.06 + 0.03;
    // assigned externally
    this.node = null;
    this.isHidden = false;
    this.isEternalBackground = false;
  }

  update(cw, ch, mouse) {
    if (this.isHidden) return;

    if (this.node) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dSq = dx * dx + dy * dy;
      const rSq = mouse.radius * mouse.radius;

      if (!window.disableParticleHover && dSq < rSq) {
        const d = Math.sqrt(dSq);
        const f = (mouse.radius - d) / mouse.radius;
        this.x -= (dx / d) * f * 15 * this.density * 0.1;
        this.y -= (dy / d) * f * 15 * this.density * 0.1;
        this.node.assembledCount = -999;
      } else {
        this.x += (this.node.x - this.x) * this.morphSpeed;
        this.y += (this.node.y - this.y) * this.morphSpeed;
        const tx = this.node.x - this.x;
        const ty = this.node.y - this.y;
        if (tx * tx + ty * ty < 15) this.node.assembledCount++;
      }
    } else {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x > cw + 50) this.x = -50;
      if (this.x < -50) this.x = cw + 50;
      if (this.y > ch + 50) this.y = -50;
      if (this.y < -50) this.y = ch + 50;

      if (!window.disableParticleHover) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < mouse.radius * mouse.radius) {
          const d = Math.sqrt(dSq);
          const f = (mouse.radius - d) / mouse.radius;
          this.x -= (dx / d) * f * 5;
          this.y -= (dy / d) * f * 5;
        }
      }
    }
  }

  draw(ctx, textZone, photoZone) {
    if (this.isHidden) return;
    if (this.node && this.node.isAssembled) return;

    const sinA = Math.sin(this.angle);
    const size = this.baseSize + sinA * 4;
    let opacity = this.baseOpacity + sinA * 0.2;
    let fade = 1;

    if (!this.node) {
      if (textZone) {
        const d = distToBox(this.x, this.y, textZone);
        fade = d === 0 ? 0.15 : d < 150 ? 0.15 + 0.85 * Math.pow(d / 150, 2) : 1;
      }
      if (photoZone) {
        const d = distToBox(this.x, this.y, photoZone);
        if (d === 0) fade = 0;
        else if (d < 80) fade = Math.min(fade, Math.pow(d / 80, 2));
      }
      if (fade <= 0) return;
    }

    ctx.globalAlpha = this.node
      ? Math.max(0.4, opacity)
      : Math.max(0.01, opacity * fade);

    const scale = size / 50;
    const w = 120 * scale;
    const h = 120 * scale;
    const dx = this.x + Math.cos(this.angle) * this.danceRadius - w / 2;
    const dy = this.y + sinA * this.danceRadius - h / 2;

    const color = this.node ? this.node.color : '#ffffff';
    const glyph = glyphCache[color]?.[this.char];
    if (glyph) ctx.drawImage(glyph, dx, dy, w, h);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CanvasAnimation({ currentSection, onLayoutChange }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    particles: [],
    nodes: [],
    layout: { fontSize: 22, textZone: null, photoZone: null },
    mouse: { x: -1000, y: -1000, radius: 150 },
    rafId: null,
    resizeTimer: null,
  });

  // ── Init + animate ──
  useEffect(() => {
    initGlyphCache();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    // mouse / pointer
    const onMouseMove = (e) => { state.mouse.x = e.clientX; state.mouse.y = e.clientY; };
    const onMouseOut = () => { state.mouse.x = -1000; state.mouse.y = -1000; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseout', onMouseOut);

    // ── helpers ──
    const ETERNAL_COUNT = 600;
    const TEXT_COUNT = 1200;

    const rebuildNodes = () => {
      const section = SECTIONS[currentSection];
      const { nodes, fontSize, textZone, photoZone } = layoutText(section, canvas.width, canvas.height, ctx);

      state.nodes = nodes;
      state.layout = { fontSize, textZone, photoZone };
      if (onLayoutChange && textZone) onLayoutChange(textZone);

      // reset text-pool particles
      const textPool = state.particles.filter(p => !p.isEternalBackground);
      textPool.forEach(p => { p.node = null; p.isHidden = true; });

      const shuffled = textPool.sort(() => Math.random() - 0.5);
      let idx = 0;
      nodes.forEach(node => {
        for (let k = 0; k < 2; k++) {
          if (idx < shuffled.length) {
            const p = shuffled[idx++];
            p.node = node;
            p.isHidden = false;
            node.particles.push(p);
          }
        }
      });
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      rebuildNodes();
    };

    // ── initial particle pool (once) ──
    if (state.particles.length === 0) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ec = ETERNAL_COUNT;
      const tc = TEXT_COUNT;
      for (let i = 0; i < ec + tc; i++) {
        const p = new Particle(canvas.width, canvas.height);
        p.isEternalBackground = i < ec;
        p.isHidden = i >= ec;       // text pool starts hidden
        state.particles.push(p);
      }
    }

    resize();

    // debounced resize
    const onResize = () => {
      clearTimeout(state.resizeTimer);
      state.resizeTimer = setTimeout(resize, 150);
    };
    window.addEventListener('resize', onResize);

    // ── animation loop ──
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { particles, nodes, layout, mouse } = state;
      const now = Date.now();

      particles.forEach(p => {
        p.angle += p.angleSpeed;
        p.update(canvas.width, canvas.height, mouse);
      });

      nodes.forEach(node => {
        const assembled = node.assembledCount >= node.particles.length * 0.6;
        node.isAssembled = assembled;

        if (assembled) {
          // glitch effect
          if (node.glitchTimer > 0) {
            node.glitchTimer--;
          } else if (Math.random() < 0.0003) {
            node.glitchTimer = Math.floor(Math.random() * 8) + 3;
            node.char = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
            const big = Math.random() < 0.2;
            node.glitchOffsetX = (Math.random() - 0.5) * (big ? 15 : 5);
            node.glitchOffsetY = (Math.random() - 0.5) * (big ? 15 : 5);
          } else {
            node.char = node.originalChar;
            node.glitchOffsetX *= 0.85;
            node.glitchOffsetY *= 0.85;
          }

          const phase = node.originalChar.charCodeAt(0) * 10;
          const fx = Math.sin(now * 0.001 + phase) * 0.5;
          const fy = Math.cos(now * 0.0015 + phase) * 0.5;
          const glyph = glyphCache[node.color]?.[node.char];

          if (glyph) {
            let scale = layout.fontSize / 50;
            scale *= 1 + Math.sin(now * 0.001 + node.x) * 0.01;
            const w = 120 * scale, h = 120 * scale;
            ctx.globalAlpha = 1;
            ctx.drawImage(glyph,
              node.x - w / 2 + node.glitchOffsetX + fx,
              node.y - h / 2 + node.glitchOffsetY + fy,
              w, h
            );
          }
        }

        node.assembledCount = 0;
      });

      particles.forEach(p => p.draw(ctx, layout.textZone, layout.photoZone));
      state.rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseout', onMouseOut);
      cancelAnimationFrame(state.rafId);
      clearTimeout(state.resizeTimer);
    };
  }, [currentSection, onLayoutChange]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
    />
  );
}
