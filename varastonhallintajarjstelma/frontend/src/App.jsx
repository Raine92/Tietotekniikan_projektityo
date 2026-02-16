import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GameList from './components/GameList';
import AddGameForm from './components/AddGameForm';
import BatchForm from './components/BatchForm';

const App = () => {
  const [view, setView] = useState('inventory');
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = () => {
    axios.get('/api/batches/all').then(res => setBatches(res.data));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-indigo-900 text-white p-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black italic tracking-tighter">GAME-STOCK v2</h1>
          <div className="flex gap-2">
            <NavBtn active={view === 'inventory'} onClick={() => setView('inventory')} label="Varasto" />
            <NavBtn active={view === 'add-game'} onClick={() => setView('add-game')} label="+ Peli" />
            <NavBtn active={view === 'add-batch'} onClick={() => setView('add-batch')} label="+ Uusi Erä" />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {view === 'inventory' && <GameList batches={batches} />}
        {view === 'add-game' && <AddGameForm batches={batches} onAdded={() => setView('inventory')} />}
        {view === 'add-batch' && <BatchForm onAdded={() => { fetchBatches(); setView('add-game'); }} />}
      </main>
    </div>
  );
};

const NavBtn = ({ active, onClick, label }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${active ? 'bg-indigo-700 shadow-inner' : 'hover:bg-indigo-800'}`}>
    {label}
  </button>
);

export default App;