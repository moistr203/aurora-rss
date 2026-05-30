import { useState, useEffect } from "react";

const RSS_URL = "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/auroraupdates.rss";
const PROXY_URL = `https://corsproxy.io/?${encodeURIComponent(RSS_URL)}`;

function App() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(PROXY_URL)
      .then((res) => res.text())
      .then((data) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "text/xml");
        const items = Array.from(xml.querySelectorAll("item")).map((item) => ({
          title: item.querySelector("title")?.textContent,
          description: item.querySelector("description")?.textContent,
          date: item.querySelector("pubDate")?.textContent,
          link: item.querySelector("link")?.textContent,
        }));
        setUpdates(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = updates.filter((u) =>
    u.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <header>
        <h1>🔔 Amazon Aurora Updates</h1>
        <p>Live feed from the Aurora User Guide RSS</p>
        <input
          type="text"
          placeholder="Search updates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {loading ? (
        <div className="loading">Loading updates...</div>
      ) : (
        <div className="grid">
          {filtered.map((item, i) => (
            <div className="card" key={i} onClick={() => setSelected(item)}>
              <h3>{item.title}</h3>
              <span className="date">{new Date(item.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selected.title}</h2>
            <p className="date">{new Date(selected.date).toLocaleDateString()}</p>
            <div dangerouslySetInnerHTML={{ __html: selected.description }} />
            <button onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
