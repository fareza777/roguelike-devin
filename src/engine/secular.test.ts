import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Dreadmarch is a secular dark-fantasy world: no organised religion, clergy or sacred symbols anywhere in the shipped source.
const BANNED = [
  'church', 'cathedral', 'chapel', 'temple', 'sanctum', 'sanctif\\w*', 'sanctuary', 'priest\\w*', 'nun', 'nuns', 'monk', 'monks', 'abbess', 'abbot',
  'bishop', 'chaplain', 'cleric', 'clergy', 'saint\\w*', 'holy', 'hallow\\w*', 'sacred', 'divine', 'divinity', 'bless\\w*', 'prayer\\w*', 'pray\\w*',
  'hymn\\w*', 'psalm\\w*', 'sermon', 'gospel', 'scripture', 'heresy', 'heretic\\w*', 'pilgrim\\w*', 'penitent', 'confess\\w*', 'absolution', 'sacrament',
  'altar', 'shrine', 'halo', 'angel', 'demon', 'devil', 'hell', 'heaven', 'god', 'gods', 'goddess', 'miracle\\w*', 'faith', 'worship\\w*', 'ritual\\w*',
  'sacrifice\\w*', 'cross', 'crucif\\w*', 'cassock', 'vestment\\w*', 'inquisitor', 'martyr\\w*', 'censer', 'chalice', 'totem', 'oracle', 'incense',
  'fetish', 'sexton', 'mitre', 'choir\\w*', 'covenant', 'rosary',
];
const RE = new RegExp(`\\b(${BANNED.join('|')})\\b`, 'i');
const TITLE = /\b(Mother|Sister|Brother|Father) [A-Z]/;

function files(dir: string, out: string[] = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(ts|css|json)$/.test(f) && !/\.test\./.test(f)) out.push(p);
  }
  return out;
}

describe('secular world', () => {
  it('contains no religious vocabulary in shipped source', () => {
    const hits: string[] = [];
    for (const f of files('src')) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        const m = line.match(RE) ?? line.match(TITLE);
        if (m) hits.push(`${f}:${i + 1}: ${m[0]} … ${line.trim().slice(0, 90)}`);
      });
    }
    expect(hits).toEqual([]);
  });
});
