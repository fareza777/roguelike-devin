import type { ArcDef } from '../types';

/** Region arcs (the Regalia hunt). Filled by the region packs in ./regions. */
export const ARCS: ArcDef[] = [];
export const ARC_MAP = new Map<string, ArcDef>();
export const registerArcs = (list: ArcDef[]) => { list.forEach(a => { ARCS.push(a); ARC_MAP.set(a.id, a) }) };
