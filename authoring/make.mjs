#!/usr/bin/env node
// Build the library's machines from their specs, and check every one.
//
//   node --conditions=browser --conditions=development authoring/make.mjs [--write] [--only <text>]
//
// For each spec in authoring/specs/: build the machine, decide every short word
// (and a sample of longer ones) with the app's engine and compare with the
// spec's reference, choose the card's examples, run the library's own analysis
// (the badges CI will award), and refuse a machine whose language another entry
// already has. With --write, the entries that pass are written to machines/.
// Nothing is written for a spec that fails.

import { readdir, readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LIBRARY_ROOT, folderFor, slugify, machineIdOf } from './lib/engine.mjs';
import { buildDoc } from './lib/dsl.mjs';
import { verify, signatureOf, analyzeDocument, runTape } from './lib/verify.mjs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const oi = args.indexOf('--only');
const ONLY = oi >= 0 ? args[oi + 1] : null;
const QUIET = args.includes('--quiet');

const posix = p => p.split('\\').join('/');

async function walk(dir, ext) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p, ext));
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out.sort();
}

const LEVELS = new Set(['intro', 'intermediate', 'advanced']);

function lint(spec) {
  const e = [];
  if (!spec.title || spec.title.length > 70) e.push(`title must be 1–70 characters (${spec.title?.length ?? 0})`);
  if (!spec.blurb || spec.blurb.length > 400) e.push(`blurb must be 1–400 characters (${spec.blurb?.length ?? 0})`);
  if (!Array.isArray(spec.tags) || !spec.tags.length || spec.tags.length > 12) e.push('tags: 1–12');
  else if (spec.tags.some(t => t !== slugify(t))) e.push(`tags are lowercase-hyphenated: ${spec.tags.join(', ')}`);
  if (!LEVELS.has(spec.level)) e.push(`level is intro, intermediate or advanced`);
  if (spec.chapter && spec.chapter.length > 80) e.push(`chapter is cut at 80 characters (${spec.chapter.length})`);
  if (!spec.lang && !spec.out && !spec.ltl && !spec.omega) e.push('no reference (lang, out, ltl or omega)');
  return e;
}

async function main() {
  // ── the specs ──
  const specs = [];
  for (const file of await walk(join(LIBRARY_ROOT, 'authoring/specs'), '.mjs')) {
    const mod = await import(pathToFileURL(file).href);
    for (const s of mod.default || []) specs.push({ type: mod.type, ...s, file: posix(relative(LIBRARY_ROOT, file)) });
  }
  const chosen = specs.filter(s => !ONLY || s.type === ONLY || (s.slug || slugify(s.title)).includes(ONLY) || s.file.includes(ONLY));

  // ── the entries that are not made from a spec ──
  const specPaths = new Set(specs.map(s => `${folderFor(s.type)}/${s.slug || slugify(s.title)}.automaton`));
  const others = [];
  for (const file of await walk(join(LIBRARY_ROOT, 'machines'), '.automaton')) {
    const path = posix(relative(LIBRARY_ROOT, file));
    if (specPaths.has(path)) continue;
    const doc = JSON.parse(await readFile(file, 'utf8'));
    others.push({ path, doc, machine: doc.machine, mid: machineIdOf(doc), sig: null });
  }

  const results = [];
  const byPath = new Map(), byMid = new Map(), bySig = new Map(), byIdea = new Map();
  for (const o of others) { if (o.mid) byMid.set(o.mid, o.path); }

  for (const spec of chosen) {
    const slug = spec.slug || slugify(spec.title);
    const path = `${folderFor(spec.type)}/${slug}.automaton`;
    const res = { spec, path, errors: [...lint(spec)], warnings: [], badges: [] };
    results.push(res);
    if (byPath.has(path)) res.errors.push(`a second spec writes ${path} (${byPath.get(path)})`);
    byPath.set(path, spec.file);
    if (spec.idea) { if (byIdea.has(spec.idea)) res.errors.push(`the idea "${spec.idea}" is already ${byIdea.get(spec.idea)}`); byIdea.set(spec.idea, path); }
    if (res.errors.length) continue;
    try {
      const doc = buildDoc(spec);
      const v = verify(spec, doc);
      res.errors.push(...v.errors);
      if (v.errors.length) continue;
      doc.meta.inputs = v.inputs;
      const a = analyzeDocument(doc);
      res.errors.push(...a.errors);
      res.warnings.push(...a.warnings);
      res.badges = (a.facts?.badges || []).map(b => (typeof b === 'string' ? b : b.id));
      if (!res.badges.includes('tested')) res.errors.push('does not earn the tested badge');
      if (['NFA', 'ε-NFA'].includes(spec.type) && res.badges.includes('deterministic')) res.errors.push('this NFA never branches: it is a DFA, and belongs with them');
      for (const b of spec.badges || []) if (!res.badges.includes(b)) res.errors.push(`expected the ${b} badge`);
      const mid = machineIdOf(doc);
      if (byMid.has(mid)) res.errors.push(`the same machine as ${byMid.get(mid)}`);
      byMid.set(mid, path);
      let sig = signatureOf(doc);
      // a machine that computes is named by what it computes, not by what it accepts
      if (spec.tape) sig += '|' + v.results.filter(r => r.want && r.w.length <= 6).map(r => runTape(doc, r.w, 100000).tape).join(',');
      const key = `${spec.type}#${sig}`;
      if (bySig.has(key)) res.errors.push(`the same language as ${bySig.get(key)}`);
      bySig.set(key, path);
      res.doc = doc; res.sig = sig;
    } catch (e) {
      res.errors.push(e.stack || e.message);
    }
  }

  // ── the same language as an entry not made from a spec ──
  const live = results.filter(r => r.sig);
  if (live.length) {
    for (const o of others) {
      if (!live.some(r => r.spec.type === o.machine)) continue;
      o.sig = signatureOf(o.doc);
      for (const r of live) if (r.spec.type === o.machine && r.sig === o.sig) r.errors.push(`the same language as ${o.path}`);
    }
  }

  // ── report, and write ──
  let ok = 0, written = 0;
  const perType = {};
  for (const r of results) {
    const t = perType[r.spec.type] ||= { ok: 0, fail: 0 };
    if (r.errors.length) {
      t.fail++;
      console.log(`FAIL  ${r.path}  (${r.spec.file})`);
      for (const e of r.errors) console.log(`        ✗ ${e}`);
      continue;
    }
    t.ok++; ok++;
    if (!QUIET) console.log(` ok   ${r.path}  [${r.badges.join(', ')}]`);
    if (!QUIET) for (const w of r.warnings) console.log(`        ! ${w}`);
    if (WRITE) {
      const file = join(LIBRARY_ROOT, r.path);
      const text = JSON.stringify(r.doc, null, 2) + '\n';
      const old = existsSync(file) ? await readFile(file, 'utf8') : null;
      if (old !== text) { await mkdir(dirname(file), { recursive: true }); await writeFile(file, text); written++; }
    }
  }
  // A spec that was renamed or removed leaves its old file behind. The manifest
  // lists what the last full run wrote, so the next one can take those away.
  if (WRITE && !ONLY) {
    const mfile = join(LIBRARY_ROOT, 'authoring/manifest.json');
    const before = existsSync(mfile) ? JSON.parse(await readFile(mfile, 'utf8')) : [];
    const now = results.filter(r => !r.errors.length).map(r => r.path).sort();
    const keep = new Set([...now, ...results.filter(r => r.errors.length).map(r => r.path)]);
    for (const p of before) if (!keep.has(p) && existsSync(join(LIBRARY_ROOT, p))) { await unlink(join(LIBRARY_ROOT, p)); console.log(`removed ${p}`); }
    await writeFile(mfile, JSON.stringify(now, null, 2) + '\n');
  }
  console.log('\n' + Object.entries(perType).map(([t, c]) => `${t} ${c.ok}${c.fail ? ` (${c.fail} failing)` : ''}`).join(' · '));
  console.log(`${ok} of ${results.length} specs pass${WRITE ? `; ${written} files written` : ''}.`);
  if (ok !== results.length) process.exitCode = 1;
}

main().catch(e => { console.error(e); process.exitCode = 1; });
