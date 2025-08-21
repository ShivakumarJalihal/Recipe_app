const fs = require("fs");
const path = require("path");

// path to your original JSON file
const inputFile = path.join(__dirname, "data", "US_recipes.json");
const outputFile = path.join(__dirname, "data", "US_recipes_clean.json");

// read as text (string)
let raw = fs.readFileSync(inputFile, "utf-8");

// replace invalid NaN with null
raw = raw.replace(/\bNaN\b/g, "null");

// try parsing to make sure it's valid JSON
try {
  JSON.parse(raw);
  fs.writeFileSync(outputFile, raw, "utf-8");
  console.log("✅ Fixed JSON saved as:", outputFile);
} catch (err) {
  console.error("❌ Still invalid JSON:", err.message);
}
