import React, { useState } from 'react';
import axios from 'axios';
import { ImagePlus, Loader2, CheckCircle2 } from 'lucide-react';

const AddGameForm = ({ batches, onAdded }) => {
  const [formData, setFormData] = useState({ nimi: '', alusta: 'PS2', batch_id: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const alustat = ["PS1", "PS2", "PS3", "PS4", "PS5"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Luodaan väliaikainen URL esikatselulle
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const data = new FormData();
    data.append('nimi', formData.nimi);
    data.append('alusta', formData.alusta);
    data.append('batch_id', formData.batch_id);
    if (image) data.append('image', image); // Backendissä multer käsittelee 'image' -kentän

    try {
      await axios.post('/api/games/add', data);
      onAdded(); // Palataan varastonäkymään
    } catch (err) {
      alert("Virhe tallennuksessa: " + (err.response?.data?.virhe || "Palvelinvirhe"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-lg mx-auto">
      <h2 className="text-2xl font-black mb-6 text-indigo-900 tracking-tight">Lisää peli varastoon</h2>
      <form onSubmit={submit} className="space-y-6">
        
        {/* Erän valinta */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase mb-1 block">Ostoerä</label>
          <select 
            required 
            className="w-full p-3 border-2 border-slate-100 rounded-xl font-semibold bg-slate-50 focus:border-indigo-500 outline-none transition-all" 
            value={formData.batch_id}
            onChange={e => setFormData({...formData, batch_id: e.target.value})}
          >
            <option value="">-- Valitse Erä --</option>
            {batches.map(b => (
              <option key={b._id} value={b._id}>
                {b.nimi} ({new Date(b.ostopvm).toLocaleDateString('fi-FI')})
              </option>
            ))}
          </select>
        </div>

        {/* Pelin nimi */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase mb-1 block">Pelin nimi</label>
          <input 
            placeholder="Esim. Metal Gear Solid 4" 
            className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 outline-none focus:border-indigo-500 font-bold" 
            required 
            value={formData.nimi}
            onChange={e => setFormData({...formData, nimi: e.target.value})} 
          />
        </div>

        {/* Alustan valinta */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Alusta</label>
          <div className="flex flex-wrap gap-2">
            {alustat.map(a => (
              <button 
                key={a} 
                type="button" 
                onClick={() => setFormData({...formData, alusta: a})} 
                className={`px-4 py-2 rounded-full border-2 font-black text-xs transition-all flex-1 ${
                  formData.alusta === a 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'border-slate-100 text-slate-400 hover:border-slate-200 bg-slate-50'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Kuvan lataus ja esikatselu */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Pelin kuva</label>
          <div className="relative border-4 border-dashed border-slate-100 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors group">
            <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              onChange={handleImageChange} 
            />
            
            {preview ? (
              <div className="flex flex-col items-center">
                <img src={preview} alt="Esikatselu" className="h-32 w-auto rounded-lg shadow-md mb-2 object-cover" />
                <span className="text-xs text-indigo-600 font-bold">Vaihda kuva</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                <ImagePlus size={32} className="group-hover:text-indigo-400 transition-colors" />
                <span className="text-sm font-bold uppercase tracking-wider">Valitse kuva</span>
              </div>
            )}
          </div>
        </div>

        {/* Tallennuspainike */}
        <button 
          disabled={isSubmitting}
          className={`w-full py-4 rounded-2xl font-black shadow-lg transition-all flex justify-center items-center gap-2 ${
            isSubmitting ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-green-100'
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <CheckCircle2 size={24} />
              TALLENNA PELI
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddGameForm;