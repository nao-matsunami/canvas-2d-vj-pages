import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const dropsPath = path.join(rootDir, "data", "drops.json");
const dateArg = process.argv.find((arg) => arg.startsWith("--date="));
const targetDate = dateArg ? dateArg.slice("--date=".length) : localIsoDate(new Date());

const engines = [
  {
    slug: "orbital-rings",
    titles: ["Radial Type Pulse", "Orbit Mesh Drawing", "Signal Glyph Sweep", "Luma Thread Field", "Scanline Particle Well"],
    copy: "Canvas 2Dだけで描く、発光リングと軌道粒子の無音VJループ。",
    why: "既存系列として、リング、粒子、走査線を中心に増やす。軽量でRECや固定FPS書き出しに接続しやすい。",
  },
  {
    slug: "type-signal",
    titles: ["Canvas Type Scanner", "Monospace Signal Wall", "Ticker Glyph Field", "Terminal Sweep Plate"],
    copy: "Canvas 2Dの文字描画とバー表現を使う、情報グラフィック系VJループ。",
    why: "抽象発光とは別文脈で、文字、バー、端末表示のような素材ラインを作る。イベント名やロゴ展開にもつなげやすい。",
  },
  {
    slug: "raster-cells",
    titles: ["Raster Cell Pulse", "Pixel Tile Bloom", "Modular Light Matrix", "Block Signal Gate"],
    copy: "矩形セルとラスター構造を主役にしたCanvas 2Dループ。",
    why: "粒子やリングではなく、矩形セルの点滅と配置で構成する。LED壁や低解像度スクリーンに合う素材として分ける。",
  },
  {
    slug: "bezier-threads",
    titles: ["Bezier Thread Study", "Ribbon Curve Drift", "Spline Signal Bloom", "Threaded Orbit Score"],
    copy: "ベジェ曲線と糸状の軌道を主役にしたCanvas 2Dループ。",
    why: "Canvas 2Dのパス描画を活かし、線の流れと曲線構造を別エンジンにする。既存のリング系列とは違う有機的な動きが出る。",
  },
];

const data = JSON.parse(await fs.readFile(dropsPath, "utf8"));
const existing = data.drops.find((drop) => drop.date === targetDate);

if (existing) {
  console.log(`Daily drop already exists: ${targetDate} / ${existing.title}`);
  process.exit(0);
}

const seed = hash(targetDate);
const engine = engines[seed % engines.length];
const hueA = fract(seed * 0.0183);
const hueB = fract(hueA + 0.38);
const drop = {
  date: targetDate,
  title: engine.titles[seed % engine.titles.length],
  engine: engine.slug,
  loopSeconds: [8, 12, 16, 20][seed % 4],
  palette: [...hsv(hueA, 0.72, 0.92), ...hsv(hueB, 0.68, 0.8)],
  copy: engine.copy,
  why: engine.why,
};

data.drops.unshift(drop);
data.drops.sort((a, b) => b.date.localeCompare(a.date));
await fs.writeFile(dropsPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Added daily drop: ${targetDate} / ${drop.title}`);

function localIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hash(value) {
  let out = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    out ^= value.charCodeAt(i);
    out = Math.imul(out, 16777619);
  }
  return Math.abs(out);
}

function fract(value) {
  return value - Math.floor(value);
}

function hsv(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const table = [
    [v, t, p],
    [q, v, p],
    [p, v, t],
    [p, q, v],
    [t, p, v],
    [v, p, q],
  ];
  return table[i % 6].map((n) => Number(n.toFixed(3)));
}
