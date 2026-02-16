import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, RefreshCw, Layers, Edit3, X, ExternalLink, Loader2, ShoppingBag } from 'lucide-react';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [editGame, setEditGame] = useState(null);

  const API_URL = "http://localhost:5000";

  useEffect(() => { fetchGames(); }, []);

  const fetchGames = () => {
    axios.get(`${API_URL}/api/games/all`).then(res => setGames(res.data));
  };

  const deleteGame = async (id) => {
    if (window.confirm("Haluatko varmasti poistaa pelin?")) {
      try {
        await axios.delete(`${API_URL}/api/games/${id}`);
        fetchGames();
      } catch (err) { alert("Poisto epäonnistui."); }
    }
  };

  const markAsSold = async (id) => {
    const hinta = window.prompt("Millä hinnalla peli myytiin? (€)");
    if (hinta) {
      try {
        // Huom: Tämä vaatii backend-reitin, jonka voimme tehdä seuraavaksi
        await axios.put(`${API_URL}/api/games/sell/${id}`, { myyntihinta: hinta });
        fetchGames();
      } catch (err) { alert("Myyntimerkintä epäonnistui."); }
    }
  };

  const updatePrice = async (id) => {
    setUpdatingId(id);
    try {
      // Tämä kutsuu nyt backendin uutta järjestettyä reittiä
      await axios.put(`${API_URL}/api/games/update-price/${id}`);
      fetchGames();
    } catch (err) {
      alert("Haku epäonnistui. Tarkista backendin reittien järjestys tai Scrapfly-kiintiö.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getSourceLink = (site, name, platform) => {
    const query = encodeURIComponent(`${name} ${platform}`);
    const links = {
      vpd: `https://www.vpd.fi/search/?q=${query}`,
      rgt: `https://retrogametycoon.com/fi/search/?q=${query}`,
      ebay: `https://www.ebay.com/sch/i.html?_nkw=${query}&LH_BIN=1&_sop=12`,
      pc: `https://www.pricecharting.com/search-products?q=${query}&type=videogames`
    };
    return links[site];
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/games/${editGame._id}`, editGame);
      setEditGame(null);
      fetchGames();
    } catch (err) { alert("Muokkaus epäonnistui."); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Varastotilanne</h2>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          {games.length} Peliä listalla
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {games.map(game => (
          <div key={game._id} className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-6 hover:shadow-md transition-all group">
            
            {/* Kuva - korjattu renderöinti */}
            <div className="w-20 h-24 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden border border-slate-200 flex items-center justify-center">
              {game.kuva_url ? (
                <img src={`${API_URL}${game.kuva_url}`} className="w-full h-full object-cover" alt={game.nimi} />
              ) : (
                <span className="text-[10px] text-slate-400 font-bold uppercase p-2 text-center">Ei kuvaa</span>
              )}
            </div>

            {/* Perustiedot */}
            <div className="flex-grow">
              <h3 className="font-bold text-lg leading-tight text-slate-800 group-hover:text-indigo-600 transition-colors">{game.nimi}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase shadow-sm">
                  {game.alusta}
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                  <Layers size={12} /> {game.batch_id?.nimi || 'Määrittelemätön erä'}
                </span>
              </div>
              <p className="text-indigo-500 font-black mt-2 text-sm">
                Kulu: {game.laskennallinen_ostohinta} €
              </p>
            </div>

            {/* Hintalaatikot */}
            <div className="hidden lg:flex gap-2">
               <MarketPrice label="VPD" val={game.market_prices?.vpd} color="blue" href={getSourceLink('vpd', game.nimi, game.alusta)} />
               <MarketPrice label="RGT" val={game.market_prices?.retrogametycoon} color="emerald" href={getSourceLink('rgt', game.nimi, game.alusta)} />
               <MarketPrice label="eBay" val={game.market_prices?.ebay_avg} color="amber" href={getSourceLink('ebay', game.nimi, game.alusta)} />
               <MarketPrice label="PC" val={game.market_prices?.pricecharting} color="purple" href={getSourceLink('pc', game.nimi, game.alusta)} />
            </div>

            {/* Toiminnot */}
            <div className="flex gap-1 ml-4 border-l pl-4">
                <button onClick={() => updatePrice(game._id)} disabled={updatingId === game._id} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors" title="Päivitä markkinahinnat">
                  {updatingId === game._id ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                </button>
                <button onClick={() => setEditGame(game)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-full transition-colors" title="Muokkaa tietoja">
                  <Edit3 size={20} />
                </button>
                <button onClick={() => markAsSold(game._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Merkitse myydyksi">
                  <ShoppingBag size={20} />
                </button>
                <button onClick={() => deleteGame(game._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Poista varastosta">
                  <Trash2 size={20} />
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Muokkauslomake (Modal) */}
      {editGame && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-2xl text-slate-800 uppercase tracking-tighter">Muokkaa peliä</h3>
              <button onClick={() => setEditGame(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleEdit} className="space-y-4">
              <Input label="Pelin nimi" value={editGame.nimi} onChange={v => setEditGame({...editGame, nimi: v})} />
              <Input label="Alusta" value={editGame.alusta} onChange={v => setEditGame({...editGame, alusta: v})} />
              
              <div className="border-t pt-4 mt-4 bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-4 text-center tracking-widest">Manuaalinen hinnan korjaus (€)</p>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="VPD" value={editGame.market_prices?.vpd} onChange={v => setEditGame({...editGame, market_prices: {...editGame.market_prices, vpd: v}})} />
                  <Input label="RGT" value={editGame.market_prices?.retrogametycoon} onChange={v => setEditGame({...editGame, market_prices: {...editGame.market_prices, retrogametycoon: v}})} />
                  <Input label="eBay" value={editGame.market_prices?.ebay_avg} onChange={v => setEditGame({...editGame, market_prices: {...editGame.market_prices, ebay_avg: v}})} />
                  <Input label="PC" value={editGame.market_prices?.pricecharting} onChange={v => setEditGame({...editGame, market_prices: {...editGame.market_prices, pricecharting: v}})} />
                </div>
              </div>

              <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 mt-4 transition-all hover:bg-indigo-700 active:scale-95">
                TALLENNA MUUTOKSET
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MarketPrice = ({ label, val, color, href }) => (
  <a href={href} target="_blank" rel="noreferrer" className={`p-2 rounded-xl bg-${color}-50 border border-${color}-100 w-20 text-center shadow-sm hover:scale-105 transition-transform group relative block`}>
    <ExternalLink size={10} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
    <p className={`text-[8px] font-black text-${color}-600 uppercase mb-0.5 tracking-tighter`}>{label}</p>
    <p className="text-xs font-black text-slate-800">{val && val !== "0.00" ? `${val}€` : '?.??€'}</p>
  </a>
);

const Input = ({ label, value, onChange }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block ml-1">{label}</label>
    <input 
      className="w-full p-3 border-2 border-slate-100 rounded-xl bg-white outline-none focus:border-indigo-500 font-bold text-sm transition-all shadow-sm" 
      value={value || ''} 
      onChange={e => onChange(e.target.value)} 
    />
  </div>
);

export default GameList;