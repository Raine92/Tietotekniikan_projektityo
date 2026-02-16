import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, RefreshCw, Layers, Edit3, X, ExternalLink, Loader2 } from 'lucide-react';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [editGame, setEditGame] = useState(null);

  const API_URL = "http://localhost:5000";

  useEffect(() => { fetchGames(); }, []);

  const fetchGames = () => {
    axios.get(`${API_URL}/api/games/all`).then(res => setGames(res.data));
  };

  // Funktio pelin poistamiseen
  const deleteGame = async (id) => {
    if (window.confirm("Haluatko varmasti poistaa pelin?")) {
      try {
        await axios.delete(`${API_URL}/api/games/${id}`);
        fetchGames();
      } catch (err) {
        alert("Poisto epäonnistui.");
      }
    }
  };

  // Funktio hintojen automaattiseen päivitykseen
  const updatePrice = async (id) => {
    setUpdatingId(id);
    try {
      await axios.put(`${API_URL}/api/games/update-price/${id}`);
      fetchGames();
    } catch (err) {
      alert("Haku epäonnistui.");
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
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Varasto</h2>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
          {games.length} PELIÄ
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {games.map(game => (
          <div key={game._id} className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-6 hover:shadow-md transition-all">
            <div className="w-20 h-24 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden border border-slate-200">
              <img src={game.kuva_url ? `${API_URL}${game.kuva_url}` : ''} className="w-full h-full object-cover" alt={game.nimi} />
            </div>

            <div className="flex-grow">
              <h3 className="font-bold text-lg leading-tight text-slate-800">{game.nimi}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase">{game.alusta}</span>
                <span className="text-slate-400 text-xs flex items-center gap-1 font-medium"><Layers size={12} /> {game.batch_id?.nimi}</span>
              </div>
              <p className="text-indigo-500 font-extrabold mt-2 text-sm">Oma kulu: {game.laskennallinen_ostohinta} €</p>
            </div>

            <div className="hidden lg:flex gap-2">
               <MarketPrice label="VPD" val={game.market_prices?.vpd} color="blue" href={getSourceLink('vpd', game.nimi, game.alusta)} />
               <MarketPrice label="RGT" val={game.market_prices?.retrogametycoon} color="emerald" href={getSourceLink('rgt', game.nimi, game.alusta)} />
               <MarketPrice label="eBay" val={game.market_prices?.ebay_avg} color="amber" href={getSourceLink('ebay', game.nimi, game.alusta)} />
               <MarketPrice label="PC" val={game.market_prices?.pricecharting} color="purple" href={getSourceLink('pc', game.nimi, game.alusta)} />
            </div>

            {/* Toimintopainikkeet */}
            <div className="flex gap-1 ml-4">
                <button 
                  onClick={() => updatePrice(game._id)} 
                  disabled={updatingId === game._id}
                  className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"
                  title="Päivitä hinnat"
                >
                  {updatingId === game._id ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                </button>
                <button 
                  onClick={() => setEditGame(game)} 
                  className="p-2 text-amber-500 hover:bg-amber-50 rounded-full transition-colors"
                  title="Muokkaa tietoja"
                >
                  <Edit3 size={20} />
                </button>
                <button 
                  onClick={() => deleteGame(game._id)} 
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Poista peli"
                >
                  <Trash2 size={20} />
                </button>
            </div>
          </div>
        ))}
      </div>

      {editGame && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-2xl text-slate-800 uppercase tracking-tighter">Muokkaa tietoja</h3>
              <button onClick={() => setEditGame(null)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
            </div>
            
            <form onSubmit={handleEdit} className="space-y-4">
              <Input label="Pelin nimi" value={editGame.nimi} onChange={v => setEditGame({...editGame, nimi: v})} />
              <Input label="Alusta" value={editGame.alusta} onChange={v => setEditGame({...editGame, alusta: v})} />
              
              <div className="border-t pt-4 mt-4">
                <p className="text-xs font-black text-slate-400 uppercase mb-3 text-center tracking-widest">Markkinahinnat (€)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="VPD" value={editGame.market_prices?.vpd} onChange={v => setEditGame({...editGame, market_prices: {...editGame.market_prices, vpd: v}})} />
                  <Input label="RGT" value={editGame.market_prices?.retrogametycoon} onChange={v => setEditGame({...editGame, market_prices: {...editGame.market_prices, retrogametycoon: v}})} />
                  <Input label="eBay" value={editGame.market_prices?.ebay_avg} onChange={v => setEditGame({...editGame, market_prices: {...editGame.market_prices, ebay_avg: v}})} />
                  <Input label="PC" value={editGame.market_prices?.pricecharting} onChange={v => setEditGame({...editGame, market_prices: {...editGame.market_prices, pricecharting: v}})} />
                </div>
              </div>

              <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 mt-4 transition-all hover:bg-indigo-700">
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
  <a href={href} target="_blank" rel="noreferrer" className={`p-2 rounded-xl bg-${color}-50 border border-${color}-100 w-20 text-center shadow-sm hover:scale-105 transition-transform group relative`}>
    <ExternalLink size={10} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-slate-400" />
    <p className={`text-[8px] font-black text-${color}-600 uppercase mb-0.5`}>{label}</p>
    <p className="text-xs font-black text-slate-800">{val && val !== "0.00" ? `${val}€` : '?.??€'}</p>
  </a>
);

const Input = ({ label, value, onChange }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">{label}</label>
    <input 
      className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 outline-none focus:border-indigo-500 font-bold text-sm" 
      value={value || ''} 
      onChange={e => onChange(e.target.value)} 
    />
  </div>
);

export default GameList;