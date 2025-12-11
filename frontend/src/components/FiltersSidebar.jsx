// src/components/FiltersSidebar.jsx
import React from "react";

export default function FiltersSidebar({
  category,
  setCategory,
  priceRange,
  setPriceRange,
  onlyInStock,
  setOnlyInStock,
  onlyFavorites,
  setOnlyFavorites,
  onClear,
}) {
  const handleCategory = (value) => setCategory(value);
  const handlePrice = (value) => setPriceRange(value);

  return (
    <aside className="vs-filters-panel">
      <h2 className="vs-page-title">Catálogo</h2>
      <p className="vs-page-subtitle">
        Refina el catálogo por categoría, precio y disponibilidad.
      </p>

      <div className="vs-filters">
        {/* CATEGORÍA */}
        <section className="vs-filter-section">
          <h3 className="vs-filter-title">Categoría</h3>
          <div className="vs-filter-chip-group">
            {["todas", "mujer", "hombre", "unisex", "accesorio"].map((cat) => (
              <button
                key={cat}
                type="button"
                className={
                  "vs-filter-chip" +
                  (category === cat ? " vs-filter-chip--active" : "")
                }
                onClick={() => handleCategory(cat)}
              >
                {cat === "todas"
                  ? "Todas"
                  : cat[0].toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* PRECIO */}
        <section className="vs-filter-section">
          <h3 className="vs-filter-title">Precio</h3>
          <div className="vs-filter-chip-group vs-filter-chip-group--column">
            <button
              type="button"
              className={
                "vs-filter-chip vs-filter-chip--full" +
                (priceRange === "any" ? " vs-filter-chip--active" : "")
              }
              onClick={() => handlePrice("any")}
            >
              Cualquier precio
            </button>
            <button
              type="button"
              className={
                "vs-filter-chip vs-filter-chip--full" +
                (priceRange === "low" ? " vs-filter-chip--active" : "")
              }
              onClick={() => handlePrice("low")}
            >
              Hasta S/ 200
            </button>
            <button
              type="button"
              className={
                "vs-filter-chip vs-filter-chip--full" +
                (priceRange === "mid" ? " vs-filter-chip--active" : "")
              }
              onClick={() => handlePrice("mid")}
            >
              S/ 200 – S/ 400
            </button>
            <button
              type="button"
              className={
                "vs-filter-chip vs-filter-chip--full" +
                (priceRange === "high" ? " vs-filter-chip--active" : "")
              }
              onClick={() => handlePrice("high")}
            >
              Más de S/ 400
            </button>
          </div>
        </section>

        {/* DISPONIBILIDAD */}
        <section className="vs-filter-section">
          <h3 className="vs-filter-title">Disponibilidad</h3>
          <div className="vs-filter-checkbox-row">
            <label className="vs-filter-checkbox">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
              />
              Solo productos con stock
            </label>
            <label className="vs-filter-checkbox">
              <input
                type="checkbox"
                checked={onlyFavorites}
                onChange={(e) => setOnlyFavorites(e.target.checked)}
              />
              Solo productos en favoritos
            </label>
          </div>
        </section>

        <button type="button" className="vs-filter-clear-btn" onClick={onClear}>
          Limpiar filtros
        </button>
      </div>
    </aside>
  );
}
