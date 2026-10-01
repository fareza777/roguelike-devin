import { drawFigure } from './figures';
import { glow, poly, rgba, rngOf, shade, vgrad } from './util';

/** Focal objects for event illustrations. Everything is an object or a faceless silhouette: no faces anywhere. */
export type Motif = 'well' | 'door' | 'mirror' | 'cart' | 'bells' | 'idol' | 'fire' | 'chest' | 'cage' | 'tree' | 'bones' | 'banner' | 'boat' | 'gate' | 'tomb' | 'forge' | 'book' | 'crystal' | 'coin' | 'fountain' | 'throne' | 'stone' | 'cairn' | 'mask' | 'lantern' | 'candles' | 'arch' | 'pool' | 'circle' | 'bridge' | 'tent' | 'figure' | 'statue' | 'cog' | 'ship' | 'web' | 'rope' | 'hourglass' | 'vial' | 'crown';

const ICON_MOTIF: Record<string, Motif> = {
  well: 'well', door: 'door', gold: 'cart', j_bell: 'bells', a_tribal: 'idol', a_charm: 'idol', campfire: 'fire', chest: 'chest', chest_open: 'chest', prisoner: 'cage', m_deadtree: 'tree', m_tree: 'tree', e_eviltree: 'tree',
  e_skeleton: 'bones', j_bone: 'bones', j_ribcage: 'bones', e_banner: 'banner', m_ship: 'ship', m_dungeon: 'gate', tombstone: 'tomb', smith: 'forge', lore: 'book', archive: 'book', c_scroll: 'book', c_secretbook: 'book', j_crystals: 'crystal', j_shine: 'crystal', fountain: 'fountain', throne: 'throne', plinth: 'stone', sigil: 'stone', m_obelisk: 'stone', m_ruins: 'arch', m_camp: 'tent', tent: 'tent', m_cave: 'arch', m_bridge: 'bridge',
  j_mask: 'mask', e_lantern: 'lantern', o_lantern: 'lantern', o_candle: 'candles', j_cobweb: 'web', j_hourglass: 'hourglass', hourglass: 'hourglass', c_flask: 'vial', c_vial: 'vial', crown: 'crown', e_crowned: 'crown', cog: 'cog', e_hooded: 'figure', e_soldier: 'figure', e_cowled: 'figure',
};
export const motifOf = (icon: string, id = ''): Motif => {
  const k = id.toLowerCase();
  for (const m of ['mirror', 'well', 'door', 'bell', 'idol', 'cage', 'cart', 'merchant', 'fountain', 'pool', 'lake', 'cairn', 'obelisk', 'tent', 'forge', 'throne', 'crown', 'gate', 'bridge', 'hourglass', 'clock', 'cog', 'web', 'cocoon', 'mask'] as const) if (k.includes(m)) return ({ bell: 'bells', merchant: 'cart', lake: 'pool', obelisk: 'stone', clock: 'hourglass', cocoon: 'web' } as Record<string, Motif>)[m] ?? (m as Motif);
  return ICON_MOTIF[icon] ?? 'figure';
};

function ground(ctx: CanvasRenderingContext2D, W: number, y: number) {
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(W / 2, y + 4, W * 0.16, 9, 0, 0, Math.PI * 2); ctx.fill();
}
const add = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, a = 0.6) => { ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y, r, c, a); ctx.globalCompositeOperation = 'source-over' };

export function drawMotif(ctx: CanvasRenderingContext2D, key: Motif, W: number, H: number, accent = '#ffb860', dark = '#0c0808', seed = 1) {
  const cx = W / 2, gy = H * 0.86, u = H * 0.5;
  const r = rngOf(seed);
  const stone = shade(dark, 0.18);
  ctx.save();
  ground(ctx, W, gy);
  switch (key) {
    case 'well': {
      ctx.fillStyle = vgrad(ctx, gy - u * 0.4, gy, [[0, shade(stone, 0.12)], [1, dark]]); ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.1, u * 0.34, u * 0.1, 0, 0, Math.PI * 2); ctx.rect(cx - u * 0.34, gy - u * 0.34, u * 0.68, u * 0.24); ctx.fill();
      ctx.fillStyle = '#020202'; ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.34, u * 0.34, u * 0.09, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = dark; ctx.fillRect(cx - u * 0.36, gy - u * 0.95, u * 0.03, u * 0.62); ctx.fillRect(cx + u * 0.33, gy - u * 0.95, u * 0.03, u * 0.62); ctx.fillRect(cx - u * 0.4, gy - u * 0.97, u * 0.8, u * 0.04);
      add(ctx, cx, gy - u * 0.34, u * 0.5, accent, 0.5); ctx.fillStyle = rgba(accent, 0.9); ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.34, u * 0.04, u * 0.012, 0, 0, Math.PI * 2); ctx.fill(); break;
    }
    case 'door': {
      ctx.fillStyle = shade(stone, -0.1); ctx.fillRect(cx - u * 0.5, gy - u * 1.1, u, u * 1.1);
      ctx.fillStyle = '#4a0e10'; ctx.beginPath(); ctx.moveTo(cx - u * 0.22, gy); ctx.lineTo(cx - u * 0.22, gy - u * 0.8); ctx.arc(cx, gy - u * 0.8, u * 0.22, Math.PI, 0); ctx.lineTo(cx + u * 0.22, gy); ctx.fill();
      ctx.fillStyle = '#d4a040'; ctx.beginPath(); ctx.arc(cx + u * 0.12, gy - u * 0.4, u * 0.02, 0, Math.PI * 2); ctx.fill();
      add(ctx, cx, gy - u * 0.4, u * 0.7, '#ff3a2a', 0.18); break;
    }
    case 'mirror': {
      ctx.fillStyle = shade(dark, 0.1); ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.6, u * 0.32, u * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = vgrad(ctx, gy - u * 1.1, gy, [[0, '#7a8a9a'], [1, '#1a222a']]); ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.6, u * 0.27, u * 0.45, 0, 0, Math.PI * 2); ctx.fill();
      drawFigure(ctx, { x: cx, y: gy - u * 0.2, h: u * 0.62, look: 'hood', c: '#05080c', back: false, rim: '#9ab0c0', sway: 0 });
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx - u * 0.1, gy - u * 1.0); ctx.lineTo(cx - u * 0.02, gy - u * 0.6); ctx.stroke(); break;
    }
    case 'cart': {
      ctx.fillStyle = dark; ctx.fillRect(cx - u * 0.3, gy - u * 0.4, u * 0.6, u * 0.2);
      ctx.beginPath(); ctx.arc(cx - u * 0.18, gy - u * 0.12, u * 0.12, 0, Math.PI * 2); ctx.arc(cx + u * 0.18, gy - u * 0.12, u * 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = shade(dark, 0.3); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx - u * 0.18, gy - u * 0.12, u * 0.12, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(cx + u * 0.18, gy - u * 0.12, u * 0.12, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = rgba(accent, 0.8); for (let i = 0; i < 6; i++) ctx.fillRect(cx - u * 0.26 + i * u * 0.09, gy - u * 0.46 - r() * u * 0.06, u * 0.05, u * 0.07);
      drawFigure(ctx, { x: cx + u * 0.5, y: gy, h: u * 0.9, look: 'hat', c: '#14100e', accent, back: false, rim: accent, lantern: accent, sway: 0.5 }); break;
    }
    case 'bells': {
      for (let i = 0; i < 5; i++) { const x = cx + (i - 2) * u * 0.28, y = gy - u * (0.75 + (i % 2) * 0.2); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y); ctx.stroke(); ctx.fillStyle = vgrad(ctx, y, y + u * 0.2, [[0, '#d4b45a'], [1, '#6a5420']]); ctx.beginPath(); ctx.moveTo(x - u * 0.03, y); ctx.quadraticCurveTo(x - u * 0.12, y + u * 0.14, x - u * 0.15, y + u * 0.2); ctx.lineTo(x + u * 0.15, y + u * 0.2); ctx.quadraticCurveTo(x + u * 0.12, y + u * 0.14, x + u * 0.03, y); ctx.fill(); add(ctx, x, y + u * 0.1, u * 0.3, accent, 0.25) } break;
    }
    case 'idol': {
      ctx.fillStyle = vgrad(ctx, gy - u * 0.8, gy, [[0, shade(dark, 0.25)], [1, dark]]); poly(ctx, [[cx - u * 0.2, gy], [cx - u * 0.16, gy - u * 0.5], [cx - u * 0.1, gy - u * 0.8], [cx + u * 0.1, gy - u * 0.8], [cx + u * 0.16, gy - u * 0.5], [cx + u * 0.2, gy]]); ctx.fill();
      ctx.strokeStyle = rgba(accent, 0.7); ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(cx - u * 0.12, gy - u * (0.2 + i * 0.14)); ctx.lineTo(cx + u * 0.12, gy - u * (0.24 + i * 0.14)); ctx.stroke() }
      add(ctx, cx, gy - u * 0.5, u * 0.5, accent, 0.3); break;
    }
    case 'fire': {
      ctx.fillStyle = dark; for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(cx, gy - u * 0.05); ctx.rotate(-0.8 + i * 0.4); ctx.fillRect(-u * 0.22, -3, u * 0.44, 7); ctx.restore() }
      add(ctx, cx, gy - u * 0.3, u * 0.9, accent, 0.5);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = rgba(i === 2 ? '#fff0b0' : i === 1 ? '#ffb040' : accent, 0.9); poly(ctx, [[cx - u * (0.12 - i * 0.03), gy - u * 0.08], [cx - u * 0.02, gy - u * (0.5 - i * 0.08)], [cx + u * 0.02, gy - u * (0.3 - i * 0.05)], [cx + u * (0.1 - i * 0.03), gy - u * 0.08]]); ctx.fill() } break;
    }
    case 'chest': {
      ctx.fillStyle = vgrad(ctx, gy - u * 0.4, gy, [[0, '#6a4a22'], [1, '#2a1a0c']]); ctx.fillRect(cx - u * 0.3, gy - u * 0.28, u * 0.6, u * 0.28);
      ctx.beginPath(); ctx.moveTo(cx - u * 0.3, gy - u * 0.28); ctx.quadraticCurveTo(cx, gy - u * 0.56, cx + u * 0.3, gy - u * 0.28); ctx.fill();
      ctx.fillStyle = '#c9a040'; ctx.fillRect(cx - u * 0.02, gy - u * 0.34, u * 0.04, u * 0.12); ctx.fillRect(cx - u * 0.3, gy - u * 0.16, u * 0.6, u * 0.02);
      add(ctx, cx, gy - u * 0.3, u * 0.55, accent, 0.4); break;
    }
    case 'cage': {
      ctx.strokeStyle = shade(dark, 0.45); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, gy - u * 1.0); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.95, u * 0.22, u * 0.05, 0, 0, Math.PI * 2); ctx.stroke();
      for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(cx + i * u * 0.065, gy - u * 0.95); ctx.quadraticCurveTo(cx + i * u * 0.1, gy - u * 0.6, cx + i * u * 0.065, gy - u * 0.25); ctx.stroke() }
      ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.25, u * 0.22, u * 0.05, 0, 0, Math.PI * 2); ctx.stroke();
      drawFigure(ctx, { x: cx, y: gy - u * 0.3, h: u * 0.5, look: 'veil', c: '#1a1614', back: false, rim: accent, sway: 1 }); break;
    }
    case 'tree': {
      ctx.strokeStyle = dark; ctx.lineCap = 'round'; ctx.lineWidth = u * 0.07; ctx.beginPath(); ctx.moveTo(cx, gy); ctx.quadraticCurveTo(cx - u * 0.05, gy - u * 0.5, cx, gy - u * 0.9); ctx.stroke();
      for (let i = 0; i < 7; i++) { const s = i % 2 ? 1 : -1; ctx.lineWidth = u * (0.04 - i * 0.003); ctx.beginPath(); ctx.moveTo(cx, gy - u * (0.45 + i * 0.07)); ctx.quadraticCurveTo(cx + s * u * 0.3, gy - u * (0.6 + i * 0.07), cx + s * u * (0.45 - i * 0.03), gy - u * (0.7 + i * 0.09)); ctx.stroke() }
      add(ctx, cx, gy - u * 0.6, u * 0.8, accent, 0.18); break;
    }
    case 'bones': {
      ctx.strokeStyle = '#d8d0b8'; ctx.lineWidth = u * 0.025; ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(cx - u * 0.3 + i * u * 0.12, gy - u * 0.04); ctx.quadraticCurveTo(cx - u * 0.3 + i * u * 0.12 + u * 0.08, gy - u * 0.34, cx - u * 0.3 + i * u * 0.12 + u * 0.18, gy - u * 0.1); ctx.stroke() }
      ctx.fillStyle = '#c8c0a8'; ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.04, u * 0.4, u * 0.04, 0, 0, Math.PI * 2); ctx.fill(); break;
    }
    case 'banner': {
      ctx.fillStyle = shade(dark, 0.3); ctx.fillRect(cx - 2, gy - u * 1.1, 4, u * 1.1);
      ctx.fillStyle = '#6a1c1c'; ctx.beginPath(); ctx.moveTo(cx, gy - u * 1.05); ctx.bezierCurveTo(cx + u * 0.3, gy - u * 1.0, cx + u * 0.2, gy - u * 0.7, cx + u * 0.4, gy - u * 0.6); ctx.lineTo(cx, gy - u * 0.5); ctx.fill(); break;
    }
    case 'boat': {
      ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(cx - u * 0.4, gy - u * 0.2); ctx.quadraticCurveTo(cx, gy + u * 0.02, cx + u * 0.4, gy - u * 0.2); ctx.lineTo(cx + u * 0.3, gy - u * 0.1); ctx.lineTo(cx - u * 0.3, gy - u * 0.1); ctx.fill();
      ctx.fillRect(cx - 2, gy - u * 0.9, 4, u * 0.7); ctx.fillStyle = rgba('#d8d0c0', 0.5); ctx.beginPath(); ctx.moveTo(cx + 3, gy - u * 0.85); ctx.quadraticCurveTo(cx + u * 0.3, gy - u * 0.6, cx + 3, gy - u * 0.3); ctx.fill(); break;
    }
    case 'gate': {
      ctx.fillStyle = shade(stone, -0.15); ctx.fillRect(cx - u * 0.6, gy - u * 1.0, u * 0.28, u * 1.0); ctx.fillRect(cx + u * 0.32, gy - u * 1.0, u * 0.28, u * 1.0);
      ctx.beginPath(); ctx.arc(cx, gy - u * 0.7, u * 0.34, Math.PI, 0); ctx.lineTo(cx + u * 0.32, gy - u * 0.7); ctx.arc(cx, gy - u * 0.7, u * 0.34, 0, Math.PI, true); ctx.fill();
      ctx.fillStyle = '#020202'; ctx.beginPath(); ctx.moveTo(cx - u * 0.3, gy); ctx.lineTo(cx - u * 0.3, gy - u * 0.7); ctx.arc(cx, gy - u * 0.7, u * 0.3, Math.PI, 0); ctx.lineTo(cx + u * 0.3, gy); ctx.fill();
      add(ctx, cx, gy - u * 0.4, u * 0.6, accent, 0.18); break;
    }
    case 'tomb': {
      ctx.fillStyle = vgrad(ctx, gy - u * 0.5, gy, [[0, shade(stone, 0.1)], [1, dark]]); ctx.beginPath(); ctx.moveTo(cx - u * 0.2, gy); ctx.lineTo(cx - u * 0.2, gy - u * 0.5); ctx.arc(cx, gy - u * 0.5, u * 0.2, Math.PI, 0); ctx.lineTo(cx + u * 0.2, gy); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - u * 0.1, gy - u * 0.5); ctx.lineTo(cx + u * 0.1, gy - u * 0.5); ctx.moveTo(cx, gy - u * 0.58); ctx.lineTo(cx, gy - u * 0.34); ctx.stroke();
      ctx.fillStyle = rgba(accent, 0.7); ctx.beginPath(); ctx.arc(cx + u * 0.26, gy - u * 0.04, u * 0.025, 0, Math.PI * 2); ctx.fill(); add(ctx, cx + u * 0.26, gy - u * 0.04, u * 0.3, accent, 0.5); break;
    }
    case 'forge': {
      ctx.fillStyle = dark; ctx.fillRect(cx - u * 0.3, gy - u * 0.2, u * 0.6, u * 0.2); ctx.fillRect(cx - u * 0.18, gy - u * 0.34, u * 0.36, u * 0.14); ctx.fillRect(cx + u * 0.14, gy - u * 0.4, u * 0.22, u * 0.06);
      add(ctx, cx + u * 0.5, gy - u * 0.3, u * 0.6, '#ff7a30', 0.5); ctx.fillStyle = '#ff9a40'; ctx.fillRect(cx + u * 0.4, gy - u * 0.28, u * 0.25, u * 0.2); break;
    }
    case 'book': {
      ctx.fillStyle = '#3a1c14'; poly(ctx, [[cx - u * 0.3, gy - u * 0.1], [cx, gy - u * 0.18], [cx + u * 0.3, gy - u * 0.1], [cx + u * 0.3, gy - u * 0.02], [cx, gy - u * 0.08], [cx - u * 0.3, gy - u * 0.02]]); ctx.fill();
      ctx.fillStyle = '#d8cfb4'; poly(ctx, [[cx - u * 0.28, gy - u * 0.12], [cx, gy - u * 0.2], [cx + u * 0.28, gy - u * 0.12], [cx + u * 0.28, gy - u * 0.04], [cx, gy - u * 0.1], [cx - u * 0.28, gy - u * 0.04]]); ctx.fill();
      add(ctx, cx, gy - u * 0.3, u * 0.7, accent, 0.4); for (let i = 0; i < 8; i++) { ctx.fillStyle = rgba(accent, 0.8); ctx.fillRect(cx + (r() - 0.5) * u * 0.5, gy - u * (0.3 + r() * 0.5), 2, 2) } break;
    }
    case 'crystal': {
      for (let i = 0; i < 5; i++) { const x = cx + (i - 2) * u * 0.12, h = u * (0.5 + (2 - Math.abs(i - 2)) * 0.25); ctx.fillStyle = vgrad(ctx, gy - h, gy, [[0, shade(accent, 0.3)], [1, shade(accent, -0.6)]]); poly(ctx, [[x - u * 0.06, gy], [x - u * 0.03, gy - h * 0.8], [x, gy - h], [x + u * 0.04, gy - h * 0.75], [x + u * 0.07, gy]]); ctx.fill() }
      add(ctx, cx, gy - u * 0.5, u * 0.8, accent, 0.4); break;
    }
    case 'coin': { ctx.fillStyle = '#d8b040'; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.ellipse(cx + (r() - 0.5) * u * 0.5, gy - u * 0.04 - r() * u * 0.12, u * 0.05, u * 0.02, 0, 0, Math.PI * 2); ctx.fill() } add(ctx, cx, gy - u * 0.1, u * 0.5, '#ffd870', 0.35); break }
    case 'fountain': {
      ctx.fillStyle = shade(stone, 0.05); ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.06, u * 0.42, u * 0.09, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(cx - u * 0.04, gy - u * 0.5, u * 0.08, u * 0.46); ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.5, u * 0.18, u * 0.04, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = rgba(accent, 0.7); ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.09, u * 0.38, u * 0.06, 0, 0, Math.PI * 2); ctx.fill(); add(ctx, cx, gy - u * 0.3, u * 0.6, accent, 0.3); break;
    }
    case 'throne': { ctx.fillStyle = shade(dark, 0.15); poly(ctx, [[cx - u * 0.3, gy], [cx - u * 0.3, gy - u * 0.9], [cx - u * 0.15, gy - u * 1.12], [cx, gy - u * 0.9], [cx + u * 0.15, gy - u * 1.12], [cx + u * 0.3, gy - u * 0.9], [cx + u * 0.3, gy]]); ctx.fill(); ctx.fillStyle = dark; ctx.fillRect(cx - u * 0.2, gy - u * 0.5, u * 0.4, u * 0.5); add(ctx, cx, gy - u * 0.7, u * 0.8, accent, 0.25); break }
    case 'stone': { ctx.fillStyle = vgrad(ctx, gy - u * 0.9, gy, [[0, shade(stone, 0.2)], [1, dark]]); poly(ctx, [[cx - u * 0.12, gy], [cx - u * 0.1, gy - u * 0.8], [cx - u * 0.02, gy - u * 0.95], [cx + u * 0.1, gy - u * 0.82], [cx + u * 0.13, gy]]); ctx.fill(); ctx.strokeStyle = rgba(accent, 0.8); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, gy - u * 0.55, u * 0.06, 0, Math.PI * 2); ctx.moveTo(cx - u * 0.06, gy - u * 0.4); ctx.lineTo(cx + u * 0.06, gy - u * 0.4); ctx.stroke(); add(ctx, cx, gy - u * 0.55, u * 0.4, accent, 0.5); break }
    case 'cairn': { ctx.fillStyle = shade(stone, 0.05); for (let i = 0; i < 4; i++) for (let j = 0; j < 4 - i; j++) { ctx.beginPath(); ctx.ellipse(cx + (j - (3 - i) / 2) * u * 0.14, gy - u * (0.06 + i * 0.09), u * 0.08, u * 0.045, 0, 0, Math.PI * 2); ctx.fill() } add(ctx, cx, gy - u * 0.4, u * 0.4, accent, 0.25); break }
    case 'mask': { ctx.fillStyle = vgrad(ctx, gy - u * 0.9, gy - u * 0.4, [[0, '#ece4d4'], [1, '#a89f8e']]); ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.65, u * 0.14, u * 0.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(cx + u * 0.04, gy - u * 0.64, u * 0.08, u * 0.18, 0, 0, Math.PI * 2); ctx.fill(); add(ctx, cx, gy - u * 0.65, u * 0.5, accent, 0.25); break }
    case 'lantern': { ctx.fillStyle = dark; ctx.fillRect(cx - 2, gy - u * 1.0, 4, u * 1.0); ctx.fillRect(cx - u * 0.07, gy - u * 1.06, u * 0.14, u * 0.12); ctx.fillStyle = rgba(accent, 0.95); ctx.fillRect(cx - u * 0.05, gy - u * 1.03, u * 0.1, u * 0.08); add(ctx, cx, gy - u * 0.98, u * 0.7, accent, 0.7); break }
    case 'candles': { for (let i = 0; i < 7; i++) { const x = cx + (i - 3) * u * 0.12, h = u * (0.1 + r() * 0.2); ctx.fillStyle = '#d8cfb4'; ctx.fillRect(x - u * 0.02, gy - h, u * 0.04, h); add(ctx, x, gy - h - u * 0.03, u * 0.2, accent, 0.7); ctx.fillStyle = '#ffe090'; ctx.beginPath(); ctx.ellipse(x, gy - h - u * 0.02, u * 0.012, u * 0.03, 0, 0, Math.PI * 2); ctx.fill() } break }
    case 'arch': { ctx.strokeStyle = shade(stone, 0.05); ctx.lineWidth = u * 0.1; ctx.beginPath(); ctx.moveTo(cx - u * 0.4, gy); ctx.lineTo(cx - u * 0.4, gy - u * 0.6); ctx.arc(cx, gy - u * 0.6, u * 0.4, Math.PI, 0.35 * Math.PI, false); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx + u * 0.4, gy); ctx.lineTo(cx + u * 0.4, gy - u * 0.35); ctx.stroke(); add(ctx, cx, gy - u * 0.4, u * 0.6, accent, 0.18); break }
    case 'pool': { ctx.fillStyle = rgba(accent, 0.5); ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.04, u * 0.5, u * 0.09, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = rgba('#ffffff', 0.35); ctx.lineWidth = 1.4; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.04, u * (0.14 + i * 0.12), u * (0.025 + i * 0.02), 0, 0, Math.PI * 2); ctx.stroke() } add(ctx, cx, gy - u * 0.04, u * 0.6, accent, 0.3); break }
    case 'circle': { ctx.strokeStyle = rgba(accent, 0.9); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.05, u * 0.42, u * 0.1, 0, 0, Math.PI * 2); ctx.ellipse(cx, gy - u * 0.05, u * 0.3, u * 0.07, 0, 0, Math.PI * 2); ctx.stroke(); add(ctx, cx, gy - u * 0.05, u * 0.6, accent, 0.35); break }
    case 'bridge': { ctx.fillStyle = dark; ctx.fillRect(cx - u * 0.7, gy - u * 0.2, u * 1.4, u * 0.05); for (let i = 0; i < 9; i++) ctx.fillRect(cx - u * 0.68 + i * u * 0.17, gy - u * 0.2, 3, u * 0.2); ctx.strokeStyle = shade(dark, 0.3); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - u * 0.7, gy - u * 0.4); ctx.quadraticCurveTo(cx, gy - u * 0.25, cx + u * 0.7, gy - u * 0.4); ctx.stroke(); break }
    case 'tent': { ctx.fillStyle = vgrad(ctx, gy - u * 0.5, gy, [[0, shade(dark, 0.25)], [1, dark]]); poly(ctx, [[cx - u * 0.4, gy], [cx, gy - u * 0.55], [cx + u * 0.4, gy]]); ctx.fill(); ctx.fillStyle = '#050303'; poly(ctx, [[cx - u * 0.08, gy], [cx, gy - u * 0.25], [cx + u * 0.08, gy]]); ctx.fill(); add(ctx, cx + u * 0.6, gy - u * 0.12, u * 0.5, accent, 0.45); break }
    case 'statue': { ctx.fillStyle = shade(stone, 0.1); ctx.fillRect(cx - u * 0.15, gy - u * 0.2, u * 0.3, u * 0.2); drawFigure(ctx, { x: cx, y: gy - u * 0.18, h: u * 0.85, look: 'hood', c: shade(stone, 0.1), back: false, rim: accent, sway: 0 }); break }
    case 'cog': { ctx.fillStyle = shade(dark, 0.3); ctx.beginPath(); const R = u * 0.4; for (let k = 0; k < 28; k++) { const a = (k / 28) * Math.PI * 2, rr = k % 2 ? R * 0.86 : R; ctx.lineTo(cx + Math.cos(a) * rr, gy - u * 0.5 + Math.sin(a) * rr) } ctx.closePath(); ctx.fill(); ctx.fillStyle = '#050303'; ctx.beginPath(); ctx.arc(cx, gy - u * 0.5, R * 0.3, 0, Math.PI * 2); ctx.fill(); add(ctx, cx, gy - u * 0.5, u * 0.5, accent, 0.25); break }
    case 'ship': { ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(cx - u * 0.5, gy - u * 0.3); ctx.quadraticCurveTo(cx, gy, cx + u * 0.5, gy - u * 0.34); ctx.lineTo(cx - u * 0.5, gy - u * 0.3); ctx.fill(); ctx.fillRect(cx - 2, gy - u * 1.1, 4, u * 0.8); ctx.fillStyle = rgba('#9ab0a8', 0.4); ctx.beginPath(); ctx.moveTo(cx + 3, gy - u * 1.05); ctx.quadraticCurveTo(cx + u * 0.3, gy - u * 0.7, cx + 3, gy - u * 0.4); ctx.fill(); add(ctx, cx, gy - u * 0.5, u * 0.8, accent, 0.18); break }
    case 'web': { ctx.strokeStyle = 'rgba(230,230,240,.5)'; ctx.lineWidth = 1.2; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx, gy - u * 0.6); ctx.lineTo(cx + Math.cos(a) * u * 0.5, gy - u * 0.6 + Math.sin(a) * u * 0.5); ctx.stroke() } for (let k = 1; k < 5; k++) { ctx.beginPath(); for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI * 2; ctx.lineTo(cx + Math.cos(a) * u * 0.1 * k, gy - u * 0.6 + Math.sin(a) * u * 0.1 * k) } ctx.stroke() } ctx.fillStyle = shade('#3a2a22', 0.2); ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.6, u * 0.1, u * 0.22, 0, 0, Math.PI * 2); ctx.fill(); break }
    case 'rope': { ctx.strokeStyle = '#a08a60'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, gy - u * 0.5); ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx, gy - u * 0.42, u * 0.07, u * 0.1, 0, 0, Math.PI * 2); ctx.stroke(); break }
    case 'hourglass': { ctx.fillStyle = rgba(accent, 0.8); poly(ctx, [[cx - u * 0.18, gy - u * 0.9], [cx + u * 0.18, gy - u * 0.9], [cx + u * 0.02, gy - u * 0.5], [cx + u * 0.18, gy - u * 0.1], [cx - u * 0.18, gy - u * 0.1], [cx - u * 0.02, gy - u * 0.5]]); ctx.fill(); ctx.fillStyle = '#1a1210'; ctx.fillRect(cx - u * 0.22, gy - u * 0.95, u * 0.44, u * 0.05); ctx.fillRect(cx - u * 0.22, gy - u * 0.1, u * 0.44, u * 0.05); add(ctx, cx, gy - u * 0.5, u * 0.6, accent, 0.3); break }
    case 'vial': { ctx.fillStyle = rgba(accent, 0.85); ctx.beginPath(); ctx.moveTo(cx - u * 0.04, gy - u * 0.75); ctx.lineTo(cx + u * 0.04, gy - u * 0.75); ctx.lineTo(cx + u * 0.04, gy - u * 0.55); ctx.quadraticCurveTo(cx + u * 0.22, gy - u * 0.4, cx + u * 0.16, gy - u * 0.18); ctx.lineTo(cx - u * 0.16, gy - u * 0.18); ctx.quadraticCurveTo(cx - u * 0.22, gy - u * 0.4, cx - u * 0.04, gy - u * 0.55); ctx.fill(); add(ctx, cx, gy - u * 0.35, u * 0.5, accent, 0.45); break }
    case 'crown': { ctx.fillStyle = '#c8a040'; poly(ctx, [[cx - u * 0.22, gy - u * 0.15], [cx - u * 0.25, gy - u * 0.5], [cx - u * 0.1, gy - u * 0.32], [cx, gy - u * 0.58], [cx + u * 0.1, gy - u * 0.32], [cx + u * 0.25, gy - u * 0.5], [cx + u * 0.22, gy - u * 0.15]]); ctx.fill(); add(ctx, cx, gy - u * 0.35, u * 0.6, '#ffd870', 0.4); break }
    default: drawFigure(ctx, { x: cx, y: gy, h: u * 1.05, look: 'hood', c: shade(dark, 0.18), lantern: accent, back: false, rim: accent, sway: 0.4 });
  }
  ctx.restore();
}
