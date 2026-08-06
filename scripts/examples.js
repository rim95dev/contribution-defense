#!/usr/bin/env node
// Renders the showcase scenarios in examples/ from synthetic data:
// "dense" = a maxed-out contribution year, "sparse" = a nearly empty one.
// No token needed — nothing is fetched and no state is touched.
const fs = require("fs");
const path = require("path");
const { render } = require("./battle.js");

const OUT = path.join(__dirname, "..", "examples");

function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return (s >>> 8) / 16777216;
  };
}

function denseWeeks(rand) {
  const weeks = [];
  for (let w = 0; w < 53; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const weekend = d === 0 || d === 6;
      const r = rand();
      let level;
      if (r < 0.03) level = 0;
      else if (weekend) level = r < 0.5 ? 1 : 2;
      else level = r < 0.25 ? 2 : r < 0.75 ? 3 : 4;
      days.push({ count: level * 3, level });
    }
    weeks.push(days);
  }
  return weeks;
}

function sparseWeeks(rand) {
  const weeks = [];
  for (let w = 0; w < 53; w++) {
    weeks.push(Array.from({ length: 7 }, () => ({ count: 0, level: 0 })));
  }
  for (const w of [4, 11, 19, 26, 33, 41, 48]) {
    const d = 1 + Math.floor(rand() * 5);
    weeks[w][d] = { count: 1, level: rand() < 0.7 ? 1 : 2 };
  }
  return weeks;
}

const scenarios = [
  { name: "dense", weeks: denseWeeks(lcg(7)), yesterdayCount: 12, state: { hp: 100 }, seed: "dense-day" },
  { name: "sparse", weeks: sparseWeeks(lcg(42)), yesterdayCount: 0, state: { hp: 20 }, seed: "sparse-day" },
];

fs.mkdirSync(OUT, { recursive: true });
for (const sc of scenarios) {
  for (const theme of ["light", "dark"]) {
    fs.writeFileSync(path.join(OUT, `${sc.name}-${theme}.svg`), render(theme, sc));
  }
  console.log(`rendered example: ${sc.name}`);
}
