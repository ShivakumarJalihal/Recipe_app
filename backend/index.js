const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// helper to parse filters like "<=400", ">=4.5", "=300"
function parseOp(value) {
  if (!value) return null;
  const m = String(value).match(/^\s*(<=|>=|=|<|>)\s*([\d.]+)\s*$/);
  if (!m) return null;
  return { op: m[1], num: Number(m[2]) };
}

// GET /api/recipes?page=&limit=  (sorted by rating desc)
app.get("/api/recipes", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const totalQ = await pool.query("SELECT COUNT(*)::int AS cnt FROM recipes");
    const total = totalQ.rows[0].cnt;

    const rowsQ = await pool.query(
      `SELECT id, cuisine, title, rating, prep_time, cook_time, total_time,
              description, nutrients, serves
       FROM recipes
       ORDER BY rating DESC NULLS LAST, id ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ page, limit, total, data: rowsQ.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/recipes/search?calories=<=400&title=pie&cuisine=...&total_time=>=60&rating=>=4.5
app.get("/api/recipes/search", async (req, res) => {
  try {
    const { title, cuisine, calories, total_time, rating } = req.query;

    const where = [];
    const vals = [];

    if (title) {
      vals.push(`%${title}%`);
      where.push(`title ILIKE $${vals.length}`);
    }
    if (cuisine) {
      vals.push(cuisine);
      where.push(`cuisine = $${vals.length}`);
    }

    // numeric filters with operators
    const tt = parseOp(total_time);
    const rt = parseOp(rating);
    const cal = parseOp(calories);

    if (tt) {
      vals.push(tt.num);
      where.push(`total_time ${tt.op} $${vals.length}`);
    }
    if (rt) {
      vals.push(rt.num);
      where.push(`rating ${rt.op} $${vals.length}`);
    }
    if (cal) {
      // extract number from nutrients->>'calories' (e.g., "389 kcal")
      where.push(
        `CAST(regexp_replace(COALESCE(nutrients->>'calories',''), '[^0-9.]', '', 'g') AS numeric) ${cal.op} $${vals.length + 1}`
      );
      vals.push(cal.num);
    }

    const sql = `
      SELECT id, cuisine, title, rating, prep_time, cook_time, total_time,
             description, nutrients, serves
      FROM recipes
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY rating DESC NULLS LAST, id ASC
      LIMIT 200
    `;

    const q = await pool.query(sql, vals);
    res.json({ data: q.rows });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid query parameters" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
