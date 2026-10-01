import { DEEP } from './deep';
import { FROST } from './frost';
import { GEAR } from './gear';
import { GLASS } from './glass';
import { THORN } from './thorn';
import { TIDE } from './tide';
import type { RegionPack } from './pack';

export type { RegionPack } from './pack';
/** Part II regions in recommended order. */
export const PACKS: RegionPack[] = [GLASS, THORN, TIDE, GEAR, FROST, DEEP];
