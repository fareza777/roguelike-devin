import type { Theme } from '../types';

export interface ThemePal { floor: string; floor2: string; wall: string; wallTop: string; wallFace: string; accent: string; ambient: string; particle: 'dust' | 'ember' | 'snow' | 'spore' | 'mote' | 'drip'; light: string }

export const THEMES: Record<Theme, ThemePal> = {
  crypt: { floor: '#2d2c33', floor2: '#26252c', wall: '#121117', wallTop: '#3d3c48', wallFace: '#1d1c25', accent: '#9a96bc', ambient: 'rgba(14,14,34,0.42)', particle: 'dust', light: '255,214,150' },
  flooded: { floor: '#20323a', floor2: '#1b2b32', wall: '#0a161a', wallTop: '#30505a', wallFace: '#122329', accent: '#4fc0aa', ambient: 'rgba(4,28,32,0.46)', particle: 'drip', light: '190,255,235' },
  forest: { floor: '#26342a', floor2: '#202d24', wall: '#0b140e', wallTop: '#33502f', wallFace: '#12200f', accent: '#98c070', ambient: 'rgba(6,26,10,0.42)', particle: 'spore', light: '255,190,110' },
  ember: { floor: '#38271f', floor2: '#2f211a', wall: '#140c09', wallTop: '#553226', wallFace: '#21120d', accent: '#ff8a3a', ambient: 'rgba(40,10,0,0.42)', particle: 'ember', light: '255,160,80' },
  bone: { floor: '#3d372c', floor2: '#332e25', wall: '#181510', wallTop: '#605844', wallFace: '#28231a', accent: '#e6d8a8', ambient: 'rgba(30,24,8,0.4)', particle: 'dust', light: '255,225,160' },
  mine: { floor: '#332d29', floor2: '#2b2622', wall: '#120f0d', wallTop: '#504339', wallFace: '#211a16', accent: '#ffb05a', ambient: 'rgba(30,14,4,0.44)', particle: 'ember', light: '255,190,110' },
  ice: { floor: '#2d3d4c', floor2: '#263644', wall: '#0c1420', wallTop: '#4f6b84', wallFace: '#16222f', accent: '#a4ceF4', ambient: 'rgba(6,20,44,0.4)', particle: 'snow', light: '210,235,255' },
  noon: { floor: '#40331f', floor2: '#372c1a', wall: '#1a1307', wallTop: '#75602f', wallFace: '#2c210d', accent: '#ffd870', ambient: 'rgba(40,28,0,0.34)', particle: 'mote', light: '255,235,170' },
  cave: { floor: '#2d2924', floor2: '#26221e', wall: '#100e0c', wallTop: '#443d35', wallFace: '#1b1713', accent: '#c9a45c', ambient: 'rgba(16,10,4,0.42)', particle: 'dust', light: '255,210,140' },
  ruin: { floor: '#332d28', floor2: '#2a2521', wall: '#141110', wallTop: '#4d4238', wallFace: '#211b17', accent: '#c9a45c', ambient: 'rgba(20,12,6,0.4)', particle: 'dust', light: '255,205,140' },
  swamp: { floor: '#28362c', floor2: '#213026', wall: '#0e1610', wallTop: '#385040', wallFace: '#15211a', accent: '#a8c878', ambient: 'rgba(6,26,12,0.44)', particle: 'spore', light: '210,255,170' },
  glass: { floor: '#3a2c36', floor2: '#322530', wall: '#150d14', wallTop: '#6a4a5e', wallFace: '#25171f', accent: '#ffcf9a', ambient: 'rgba(40,14,24,0.38)', particle: 'mote', light: '255,214,170' },
  gear: { floor: '#35291d', floor2: '#2d2318', wall: '#130d07', wallTop: '#5f4524', wallFace: '#241a0e', accent: '#ffb44a', ambient: 'rgba(34,18,2,0.42)', particle: 'ember', light: '255,196,110' },
  thorn: { floor: '#223022', floor2: '#1c291c', wall: '#08120a', wallTop: '#2f4a2a', wallFace: '#0f1d0e', accent: '#b6e07a', ambient: 'rgba(4,24,8,0.46)', particle: 'spore', light: '230,255,170' },
  aurora: { floor: '#243448', floor2: '#1e2c40', wall: '#081018', wallTop: '#3d6a7e', wallFace: '#112230', accent: '#7affc8', ambient: 'rgba(4,28,40,0.4)', particle: 'snow', light: '180,255,230' },
  deep: { floor: '#1d2a30', floor2: '#17232a', wall: '#070d10', wallTop: '#2f4a52', wallFace: '#0e1a1f', accent: '#5af0d0', ambient: 'rgba(0,22,26,0.5)', particle: 'spore', light: '150,255,225' },
  reef: { floor: '#1c3238', floor2: '#172b30', wall: '#071317', wallTop: '#2c5560', wallFace: '#0e2228', accent: '#ff9a7a', ambient: 'rgba(2,26,32,0.46)', particle: 'drip', light: '255,200,170' },
  archive: { floor: '#2e202b', floor2: '#271b24', wall: '#120b11', wallTop: '#4d3349', wallFace: '#20131d', accent: '#e07acb', ambient: 'rgba(30,6,28,0.44)', particle: 'ember', light: '255,190,240' },
};

export const TERRAIN: Record<string, { base: string; alt: string }> = {
  p: { base: '#3d4a33', alt: '#364330' },
  f: { base: '#26382b', alt: '#20301f' },
  F: { base: '#2c2420', alt: '#241d1a' },
  a: { base: '#3b332d', alt: '#332c27' },
  h: { base: '#4b4636', alt: '#423d30' },
  b: { base: '#5a5240', alt: '#4f4838' },
  n: { base: '#b7c4d2', alt: '#a9b8c8' },
  x: { base: '#2e3d33', alt: '#27352c' },
  c: { base: '#3d2d19', alt: '#33261a' },
  w: { base: '#12303f', alt: '#0f2836' },
  r: { base: '#8a7a5a', alt: '#7d6e50' },
  B: { base: '#6b5232', alt: '#5e4729' },
  M: { base: '#4f4f5a', alt: '#454550' },
  N: { base: '#d3deea', alt: '#c2d0df' },
  O: { base: '#8b8468', alt: '#7d765c' },
  Z: { base: '#2a2008', alt: '#1e1604' },
  G: { base: '#3a2c10', alt: '#2c210c' },
  H: { base: '#2c1a2c', alt: '#221422' },
  s: { base: '#8a6f3e', alt: '#7d6336' },
  y: { base: '#5a3548', alt: '#4d2d3d' },
  K: { base: '#1c2a1a', alt: '#172314' },
  u: { base: '#3a3022', alt: '#33291c' },
  l: { base: '#16262a', alt: '#12212a' },
  i: { base: '#98b4c8', alt: '#8aa8bd' },
  e: { base: '#6a5a3a', alt: '#5f5033' },
};

export const RARITY_COLOR: Record<string, string> = { common: '#9a9285', rare: '#5f9be0', epic: '#b07af0', relic: '#f0b850', mythic: '#ff6a8a' };
