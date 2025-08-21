const fs = require("fs");
const path = require("path");
const pool = require("./db");

function numOrNull(v) {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function run() {
  const file = path.join(__dirname, "data", "US_recipes_clean.json");
  const raw = fs.readFileSync(file, "utf-8");
  let data = JSON.parse(raw);

  // support both array and object-of-objects
  const recipes = Array.isArray(data) ? data : Object.values(data);

  // ensure table exists (safe if already created)
  await pool.query(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8")).catch(()=>{});

  // clear table (optional for reseed)
  await pool.query("TRUNCATE TABLE recipes RESTART IDENTITY");

  const text = `
    INSERT INTO recipes
      (cuisine, title, rating, prep_time, cook_time, total_time, description, nutrients, serves)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)
  `;

  for (const r of recipes) {
    const cuisine = r.cuisine ?? null;
    const title = r.title ?? null;
    const rating = numOrNull(r.rating);
    const prep_time = numOrNull(r.prep_time);
    const cook_time = numOrNull(r.cook_time);
    const total_time = numOrNull(r.total_time);
    const description = r.description ?? null;

    // keep nutrients as-is (object) and serves as string
    const nutrients = r.nutrients ?? null;
    const serves = r.serves ?? null;

    await pool.query(text, [
      cuisine, title, rating, prep_time, cook_time, total_time, description,
      nutrients ? JSON.stringify(nutrients) : null,
      serves
    ]);
  }

  console.log(`Seeded ${recipes.length} recipes`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
