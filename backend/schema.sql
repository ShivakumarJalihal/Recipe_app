DROP TABLE IF EXISTS recipes CASCADE;

CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  cuisine        VARCHAR(100),
  title          VARCHAR(255),
  rating         FLOAT,
  prep_time      INTEGER,
  cook_time      INTEGER,
  total_time     INTEGER,
  description    TEXT,
  nutrients      JSONB,
  serves         VARCHAR(50)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_recipes_rating ON recipes (rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_recipes_total_time ON recipes (total_time);
CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes (title);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes (cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_nutrients_gin ON recipes USING GIN (nutrients);
