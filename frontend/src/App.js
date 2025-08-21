import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [mealType, setMealType] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, []);

   const fetchRecipes = async () => {
   try {
     const res = await axios.get("http://localhost:5000/api/recipes");
     console.log("Fetched recipes:", res.data);
     setRecipes(res.data.recipes);   // 👈 change here
   } catch (err) {
     console.error("Error fetching recipes:", err);
   }
 };

 const handleSearch = async () => {
   try {
     const res = await axios.get("http://localhost:5000/api/recipes/search", {
       params: { name: search, mealType },
     });
     setRecipes(res.data.recipes);   // 👈 change here
   } catch (err) {
     console.error("Error searching recipes:", err);
   }
 };

  return (
    <div className="App">
      <h1>🍽️ Recipe Finder</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
          <option value="">All</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
        </select>
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="recipe-list">
        {recipes.map((r) => (
          <div className="recipe-card" key={r.id}>
            <h2>{r.name}</h2>
            <p><b>Meal:</b> {r.mealtype}</p>
            <p><b>Ingredients:</b> {r.ingredients}</p>
            <p><b>Instructions:</b> {r.instructions}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
