import type { ArcDef } from '../types';
import { PACKS } from './regions';

/** Region arcs (the Regalia hunt). Filled by the region packs in ./regions. */
export const ARCS: ArcDef[] = PACKS.map(p => p.arc).filter(a => a.steps.length > 0);
export const ARC_MAP = new Map<string, ArcDef>(ARCS.map(a => [a.id, a]));
