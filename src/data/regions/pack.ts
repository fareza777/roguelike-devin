import type { ArcDef, Bonus, Cond, DungeonDef, EnemyDef, ItemDef, LandmarkDef, QuestDef, SceneDef, School, Speaker, StoryEvent, TownDef } from '../../types';
import type { Zone } from '../world';

/** A self-contained region of the world: map points, creatures, story and quests, aggregated by the data modules. */
export interface RegionPack {
  id: string;
  zone: Zone;
  towns: TownDef[];
  dungeons: DungeonDef[];
  landmarks: LandmarkDef[];
  /** Road links built by the world generator. */
  links: [string, string][];
  enemies: EnemyDef[];
  quests: QuestDef[];
  events: StoryEvent[];
  scenes: SceneDef[];
  items: ItemDef[];
  sets: Record<string, { name: string; two: Bonus; four: Bonus; blurb: string }>;
  bossLoot: Record<string, string[]>;
  speakers: Record<string, Speaker>;
  arc: ArcDef;
  triggers: { loc: string; cond: Cond; scene: string }[];
  schools: Record<string, School[]>;
}
