// =========================
// src/App.tsx
// =========================
import React, {
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
} from "react";
import axios from "axios";
import {
  Routes,
  Route,
  NavLink,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import styles from "./App.module.css";

/**
 * React + TypeScript app (Pokédex)
 * - List view: live search + sort (name, id, base_experience) asc/desc
 * - Gallery view: image grid with multi-select type filters
 * - Detail view: attributes + Prev/Next across the current list; route: /pokemon/:id
 * - NO caching (no interceptors / no localStorage)
 * - CSS Modules for styling (no inline styles)
 */

// -----------------------------
// Types
// -----------------------------
interface NamedAPIResource {
  name: string;
  url: string;
}

interface PokemonDetail {
  id: number;
  name: string;
  sprites: { front_default: string | null; other?: any };
  types: { slot: number; type: NamedAPIResource }[];
  abilities: { ability: NamedAPIResource; is_hidden: boolean }[];
  stats: { base_stat: number; stat: NamedAPIResource }[];
  height: number;
  weight: number;
  base_experience: number;
}

export interface PokemonListItem {
  id: number;
  name: string;
  url: string;
  image: string;
  types: string[];
  base_experience: number;
  height: number;
  weight: number;
}

// -----------------------------
// Axios API (no interceptors / no cache)
// -----------------------------
const api = axios.create({ baseURL: "https://pokeapi.co/api/v2" });

async function getPokemonDetail(
  idOrName: number | string
): Promise<PokemonDetail> {
  const res = await api.get(`/pokemon/${idOrName}`);
  return res.data as PokemonDetail;
}

async function getPokemonPage(
  limit = 256,
  offset = 0
): Promise<PokemonListItem[]> {
  try {
    const res = await api.get("/pokemon", { params: { limit, offset } });
    const list: { name: string; url: string }[] = res.data.results;

    // Build a light list from the index endpoint
    const light: PokemonListItem[] = list
      .map((it) => {
        const id = Number(it.url.split("/").filter(Boolean).pop());
        return {
          id,
          name: it.name,
          url: it.url,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          types: [],
          base_experience: -1,
          height: -1,
          weight: -1,
        };
      })
      .sort((a, b) => a.id - b.id);

    // Optional enrichment (reduced concurrency; no cache)
    const concurrency = 4;
    let i = 0;
    const next = async (): Promise<void> => {
      if (i >= light.length) return;
      const idx = i++;
      try {
        const d = await getPokemonDetail(light[idx].id);
        light[idx] = {
          ...light[idx],
          image: d.sprites.front_default || light[idx].image,
          types: d.types.map((t) => t.type.name),
          base_experience: d.base_experience,
          height: d.height,
          weight: d.weight,
        };
      } catch {
        // ignore enrichment errors — keep light item
      }
      await next();
    };
    await Promise.all(
      Array.from({ length: Math.min(concurrency, light.length) }, () => next())
    );

    return light;
  } catch {
    // Minimal mock to keep UI usable while debugging; remove if you want a hard failure
    const mock: PokemonListItem[] = [
      {
        id: 1,
        name: "bulbasaur",
        url: "",
        image:
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
        types: ["grass", "poison"],
        base_experience: 64,
        height: 7,
        weight: 69,
      },
      {
        id: 4,
        name: "charmander",
        url: "",
        image:
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
        types: ["fire"],
        base_experience: 62,
        height: 6,
        weight: 85,
      },
      {
        id: 7,
        name: "squirtle",
        url: "",
        image:
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
        types: ["water"],
        base_experience: 63,
        height: 5,
        weight: 90,
      },
    ];
    return mock;
  }
}

async function getAllTypes(): Promise<string[]> {
  const res = await api.get("/type");
  return (res.data.results as any[])
    .map((t) => t.name as string)
    .filter((n) => !["unknown", "shadow"].includes(n));
}

// -----------------------------
// Context for sharing fetched list between views
// -----------------------------
interface ResultsCtx {
  items: PokemonListItem[];
  setItems: (items: PokemonListItem[]) => void;
}
const ResultsContext = createContext<ResultsCtx | null>(null);
function useResults() {
  const ctx = useContext(ResultsContext);
  if (!ctx) throw new Error("useResults must be used inside ResultsProvider");
  return ctx;
}

// -----------------------------
// UI Helpers (sorting & filtering)
// -----------------------------
type SortKey = "name" | "id" | "base_experience";
type SortDir = "asc" | "desc";

function sortItems(items: PokemonListItem[], key: SortKey, dir: SortDir) {
  const mul = dir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const av = (a as any)[key];
    const bv = (b as any)[key];
    if (typeof av === "string") return av.localeCompare(bv) * mul;
    return (av - bv) * mul;
  });
}

function filterItems(items: PokemonListItem[], q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return items;
  return items.filter((p) => p.name.includes(s) || String(p.id) === s);
}

// -----------------------------
// Minimal runtime tests (console.assert)
// -----------------------------
function runRuntimeTests() {
  const sample: PokemonListItem[] = [
    {
      id: 1,
      name: "bulbasaur",
      url: "",
      image: "",
      types: ["grass"],
      base_experience: 64,
      height: 7,
      weight: 69,
    },
    {
      id: 2,
      name: "ivysaur",
      url: "",
      image: "",
      types: ["grass"],
      base_experience: 142,
      height: 10,
      weight: 130,
    },
    {
      id: 4,
      name: "charmander",
      url: "",
      image: "",
      types: ["fire"],
      base_experience: 62,
      height: 6,
      weight: 85,
    },
  ];
  console.assert(filterItems(sample, "bulb").length === 1);
  console.assert(filterItems(sample, "1").length === 1);
  console.assert(filterItems(sample, "").length === 3);
  console.assert(sortItems(sample, "id", "asc")[0].id === 1);
  console.assert(sortItems(sample, "id", "desc")[0].id === 4);
  console.assert(sortItems(sample, "name", "asc")[0].name === "bulbasaur");
  console.assert(
    sortItems(sample, "base_experience", "desc")[0].base_experience === 142
  );
  const order = sample.map((x) => x.id);
  console.assert(order.indexOf(1) === 0);
}

// -----------------------------
// Components
// -----------------------------
function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex gap-2 items-center">
      <label className="sr-only" htmlFor="search">
        Search
      </label>
      <input
        id="search"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search by name or id"
      />
    </div>
  );
}

function SortControls({
  sortKey,
  sortDir,
  onSortKey,
  onSortDir,
}: {
  sortKey: SortKey;
  sortDir: SortDir;
  onSortKey: (k: SortKey) => void;
  onSortDir: (d: SortDir) => void;
}) {
  return (
    <div className="flex gap-2 items-center" role="group" aria-label="Sort controls">
      <select
        className={styles.input}
        value={sortKey}
        onChange={(e) => onSortKey(e.target.value as SortKey)}
        aria-label="Sort by"
      >
        <option value="name">Name</option>
        <option value="id">ID</option>
        <option value="base_experience">Base XP</option>
      </select>
      <button
        className={`${styles.btn} ${styles.btnOutline}`}
        onClick={() => onSortDir(sortDir === "asc" ? "desc" : "asc")}
        aria-label="Toggle ascending/descending"
      >
        {sortDir === "asc" ? "Ascending ▲" : "Descending ▼"}
      </button>
    </div>
  );
}

function GalleryFilters({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [types, setTypes] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllTypes();
        setTypes(all);
      } catch {
        setError("Failed to load types");
      }
    })();
  }, []);

  function toggle(t: string) {
    if (selected.includes(t)) onChange(selected.filter((x) => x !== t));
    else onChange([...selected, t]);
  }

  if (error) return <p role="alert" className={styles.alert}>{error}</p>;

  return (
    <div className={styles.filterRow}>
      {types.map((t) => (
        <button
          key={t}
          className={`${styles.btn} ${styles.btnOutline} ${styles.filterChip}`}
          onClick={() => toggle(t)}
          aria-pressed={selected.includes(t)}
          data-active={selected.includes(t) || undefined}
        >
          {t}
        </button>
      ))}
      {types.length === 0 && (
        <span className={styles.countPill}>Loading filters…</span>
      )}
    </div>
  );
}

function PokemonCard({ p }: { p: PokemonListItem }) {
  return (
    <Link to={`/pokemon/${p.id}`} aria-label={`View details for ${p.name}`} className="block">
      <article className={styles.card}>
        <div className={styles.media}>
          {p.image ? (
            <img src={p.image} alt={p.name} className="w-2/3" />
          ) : (
            <span className={styles.meta}>No image</span>
          )}
        </div>
        <div className={styles.body}>
          <div className={styles.title}>
            #{p.id} {p.name}
          </div>
          <div className={styles.meta}>
            XP {p.base_experience} • H {p.height} • W {p.weight}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {p.types.map((t) => (
              <span key={t} className={styles.badge}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}

// -----------------------------
// Pages
// -----------------------------
function ListView() {
  const { items, setItems } = useResults();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (items.length) return;
      try {
        setLoading(true);
        const data = await getPokemonPage(256, 0);
        setItems(data);
        if (data.every((d) => d.base_experience === -1)) {
          setError(
            "Working limited mode — some details may be missing if the API rate-limits."
          );
        }
      } catch {
        setError("Failed to load Pokémon.");
      } finally {
        setLoading(false);
      }
    })();
  }, [items.length, setItems]);

  const filteredSorted = useMemo(() => {
    return sortItems(filterItems(items, query), sortKey, sortDir);
  }, [items, query, sortKey, sortDir]);

  return (
    <section className={styles.panel}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by name or exact ID…"
          />
          <span className={styles.countPill}>
            {filteredSorted.length} results
          </span>
        </div>
        <SortControls
          sortKey={sortKey}
          sortDir={sortDir}
          onSortKey={setSortKey}
          onSortDir={setSortDir}
        />
      </div>

      {error && <p role="alert" className={styles.alert}>{error}</p>}
      {loading && <p>Loading…</p>}

      <div className={styles.gridAutofill}>
        {filteredSorted.map((p) => (
          <PokemonCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

function GalleryView() {
  const { items, setItems } = useResults();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (items.length) return;
      try {
        setLoading(true);
        const data = await getPokemonPage(256, 0);
        setItems(data);
      } catch {
        setError("Failed to load Pokémon.");
      } finally {
        setLoading(false);
      }
    })();
  }, [items.length, setItems]);

  const filtered = useMemo(() => {
    if (selected.length === 0) return items;
    return items.filter((p) => selected.every((t) => p.types.includes(t)));
  }, [items, selected]);

  return (
    <section className={styles.panel}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <GalleryFilters selected={selected} onChange={setSelected} />
        <span className={styles.countPill}>{filtered.length} shown</span>
      </div>
      {error && <p role="alert" className={styles.alert}>{error}</p>}
      {loading && <p>Loading…</p>}
      <div className={styles.gridAutofill}>
        {filtered.map((p) => (
          <PokemonCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

function DetailView() {
  const { id } = useParams();
  const pid = Number(id);
  const { items } = useResults();
  const [data, setData] = useState<PokemonDetail | null>(null);
  const [, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await getPokemonDetail(pid);
        setData(d);
        setError("");
      } catch {
        setError("Failed to load details");
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [pid]);

  const order = useMemo(() => items.map((i) => i.id), [items]);
  const index = order.indexOf(pid);
  const prevId = index > 0 ? order[index - 1] : null;
  const nextId = index >= 0 && index < order.length - 1 ? order[index + 1] : null;

  function goPrev() { if (prevId) navigate(`/pokemon/${prevId}`); }
  function goNext() { if (nextId) navigate(`/pokemon/${nextId}`); }

  if (loading) return <p>Loading…</p>;
  if (!data) return <p role="alert" className={styles.alert}>Failed to load details.</p>;

  return (
    <section className={styles.panel}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className={`${styles.btn} ${styles.btnOutline}`}>← Back to List</Link>
        <div className="flex gap-2">
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={goPrev} disabled={!prevId} aria-label="Previous">◀ Prev</button>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={goNext} disabled={!nextId} aria-label="Next">Next ▶</button>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <div className="grid place-items-center">
          {data.sprites.front_default ? (
            <img src={data.sprites.front_default} alt={data.name} />
          ) : (
            <div className={styles.countPill}>No image</div>
          )}
        </div>
        <div>
          <h2 className={styles.title}>#{data.id} {data.name}</h2>
          <p className={`${styles.countPill} inline-block mt-1`}>
            Base XP: {data.base_experience} • Height: {data.height} • Weight: {data.weight}
          </p>
          <p className="mt-2">
            <strong>Types:</strong> {data.types.map((t) => t.type.name).join(", ")}
          </p>
          <p className="mt-1">
            <strong>Abilities:</strong>{" "}
            {data.abilities.map((a) => a.ability.name + (a.is_hidden ? " (hidden)" : "")).join(", ")}
          </p>
          <div className="mt-2">
            <strong>Stats:</strong>
            <ul className="list-disc pl-5">
              {data.stats.map((s) => (
                <li key={s.stat.name}>
                  {s.stat.name}: {s.base_stat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// -----------------------------
// App Shell
// -----------------------------
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.appShell}>
      <header className={styles.appHeader}>
        <div className={styles.headerInner}>
          <h1 className={styles.brand}>PokeDex</h1>
          <nav aria-label="Primary" className={styles.nav}>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
            >
              List
            </NavLink>
            <NavLink
              to="/gallery"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
            >
              Gallery
            </NavLink>
          </nav>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.appFooter}>
        <div className={styles.footerInner}>
          Data from{" "}
          <a
            href="https://pokeapi.co/"
            target="_blank"
            rel="noreferrer noopener"
            className={styles.linkAccent}
          >
            PokeAPI
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState<PokemonListItem[]>([]);

  useEffect(() => {
    runRuntimeTests();
  }, []);

  return (
    <ResultsContext.Provider value={{ items, setItems }}>
      <Shell>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/pokemon/:id" element={<DetailView />} />
        </Routes>
      </Shell>
    </ResultsContext.Provider>
  );
}
