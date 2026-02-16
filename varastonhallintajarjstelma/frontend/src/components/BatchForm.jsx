import React, { useState } from 'react';
import axios from 'axios';

const BatchForm = ({ onAdded }) => {
  const [data, setData] = useState({ 
    nimi: '', 
    ostohinta_yhteensa: '', 
    ostopvm: new Date().toISOString().split('T')[0],
    tavoite_kerroin: 2.0 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/batches/add', data);
      alert("Uusi erä luotu onnistuneesti!");
      onAdded(); // Päivittää listan ja vaihtaa näkymää
    } catch (err) {
      alert("Erän luonti epäonnistui.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Luo uusi ostoerä</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Erän nimi</label>
          <input 
            placeholder="Esim. Huutonetti-setti" 
            className="w-full p-3 border-2 border-slate-50 rounded-xl bg-slate-50 outline-none focus:border-indigo-500" 
            required 
            onChange={e => setData({...data, nimi: e.target.value})} 
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Kokonaisostohinta (€)</label>
          <input 
            type="number" 
            placeholder="Mitä maksoit yhteensä?" 
            className="w-full p-3 border-2 border-slate-50 rounded-xl bg-slate-50 outline-none focus:border-indigo-500" 
            required 
            onChange={e => setData({...data, ostohinta_yhteensa: e.target.value})} 
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Ostopäivä</label>
          <input 
            type="date" 
            value={data.ostopvm} 
            className="w-full p-3 border-2 border-slate-50 rounded-xl bg-slate-50 outline-none focus:border-indigo-500" 
            onChange={e => setData({...data, ostopvm: e.target.value})} 
          />
        </div>
        <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          LUO ERÄ
        </button>
      </form>
    </div>
  );
};

export default BatchForm;