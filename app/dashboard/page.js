'use client'; 
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // --- EXISTING STATES ---
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('M');
  const [prescriptionDate, setPrescriptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [bp, setBp] = useState('');
  const [weight, setWeight] = useState('');
  const [pulse, setPulse] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [ccList, setCcList] = useState([]);
  const [advInput, setAdvInput] = useState('');
  const [advList, setAdvList] = useState([]);
  const [medicineInput, setMedicineInput] = useState('');
  const [dosage, setDosage] = useState('1+0+1');
  const [timing, setTiming] = useState('After Food');
  const [duration, setDuration] = useState('7 Days');
  const [searchResults, setSearchResults] = useState([]); 
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicinesList, setMedicinesList] = useState([]);  

  // Check session storage on load so the doctor stays logged in on refresh
  useEffect(() => {
    const sessionStatus = sessionStorage.getItem('doc_authenticated');
    if (sessionStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Handle Login Submission
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');

    const correctEmail = process.env.NEXT_PUBLIC_DOCTOR_EMAIL;
    const correctPassword = process.env.NEXT_PUBLIC_DOCTOR_PASSPHRASE;

    if (email === correctEmail && password === correctPassword) {
      sessionStorage.setItem('doc_authenticated', 'true');
      setIsAuthenticated(true);
    } else {
      setAuthError('Invalid credentials. Access Denied.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('doc_authenticated');
    setIsAuthenticated(false);
  };

  // --- EXISTING EFFECTS & HANDLERS ---
  useEffect(() => {
    const searchMedicines = async () => {
      if (medicineInput.trim() === '' || selectedMedicine) {
        setSearchResults([]);
        return;
      }
      const { data, error } = await supabase
        .from('medicines')
        .select('name, generic')
        .ilike('name', `%${medicineInput}%`);

      if (!error && data) setSearchResults(data); 
    };

    const delayDebounce = setTimeout(() => { searchMedicines(); }, 300);
    return () => clearTimeout(delayDebounce);
  }, [medicineInput, selectedMedicine]);

  const handleSelectMedicine = (med) => {
    setSelectedMedicine(med);
    setMedicineInput(med.name);
    setSearchResults([]);
  };

  const addMedicineToPrescription = (e) => {
    e.preventDefault();
    if (!selectedMedicine) return;

    const newMedObj = {
      name: selectedMedicine.name,
      generic: selectedMedicine.generic,
      dosage, timing, duration
    };

    setMedicinesList([...medicinesList, newMedObj]);
    setMedicineInput('');
    setSelectedMedicine(null);
    setDosage('1+0+1');
    setTiming('After Food');
    setDuration('7 Days');
  };

  const handleAddCc = (e) => {
    e.preventDefault();
    if (ccInput.trim() === '') return;
    setCcList([...ccList, ccInput.trim()]);
    setCcInput('');
  };

  const handleRemoveCc = (indexToRemove) => {
    setCcList(ccList.filter((_, index) => index !== indexToRemove));
  };

  const handleAddAdv = (e) => {
    e.preventDefault();
    if (advInput.trim() === '') return;
    setAdvList([...advList, advInput.trim()]);
    setAdvInput('');
  };

  const handleRemoveAdv = (indexToRemove) => {
    setAdvList(advList.filter((_, index) => index !== indexToRemove));
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "____";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handlePrint = () => { window.print(); };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-mono text-sm">
        Verifying secure workspace session...
      </div>
    );
  }

  // Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold tracking-wider text-slate-200 uppercase">Signature  <span className="text-xs text-emerald-400 font-mono">DocTech</span></h1>
            <p className="text-xs text-slate-400 mt-1">Authorized Medical Personnel Access Only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Doctor Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 px-4 py-2.5 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-200 text-sm" placeholder="doctor@example.com" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Passphrase</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 px-4 py-2.5 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-200 text-sm" placeholder="••••••••" />
            </div>
            {authError && <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded border border-red-500/20">{authError}</p>}
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition">
              Unlock Workstation
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render App if authenticated
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col print:bg-white print:text-slate-900">
      
      {/* NAVBAR */}
      <nav className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center shadow-md print:hidden">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-lg font-semibold tracking-wider uppercase text-slate-200">Signature <span className="text-xs text-emerald-400 font-mono">DocTech</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm bg-slate-800 px-4 py-1.5 rounded-full text-slate-300 font-medium border border-slate-700">
            Dr. Md. Emraan Hossain
          </div>
          <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-400 transition uppercase tracking-wide">
            Exit
          </button>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 p-6 gap-6 print:block print:p-0">
        
        {/* LEFT COLUMN: Input Form Controls */}
        <div className="xl:col-span-5 bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col gap-5 print:hidden overflow-y-auto max-h-[calc(100vh-100px)]">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Prescription Builder</h2>
            <p className="text-xs text-slate-400 mt-0.5">Build structured clinical lists, records, and medicines.</p>
          </div>
          
          {/* 1. Patient Information & Date */}
          <div className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">1. Patient Information & Date</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <input type="text" placeholder="Shakkhor" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full bg-slate-900 px-3 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100 placeholder-slate-500 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Age</label>
                <input type="text" placeholder="24" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} className="w-full bg-slate-900 px-3 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100 placeholder-slate-500 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sex</label>
                <select value={patientGender} onChange={(e) => setPatientGender(e.target.value)} className="w-full bg-slate-900 px-3 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100 text-sm">
                  <option value="M">M</option>
                  <option value="F">F</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="pt-1">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Prescription Date</label>
                <span className="text-[10px] text-emerald-400 font-mono">Format: (date/month/year)</span>
              </div>
              <input type="date" value={prescriptionDate} onChange={(e) => setPrescriptionDate(e.target.value)} className="w-full bg-slate-900 px-3 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100 text-sm" />
            </div>
          </div>

          {/* 2. Patient Vitals */}
          <div className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">2. Vitals & Examination</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Blood Pressure</label>
                <input type="text" placeholder="120/80" value={bp} onChange={(e) => setBp(e.target.value)} className="w-full bg-slate-900 px-3 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100 placeholder-slate-500 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Weight (kg)</label>
                <input type="text" placeholder="65" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-slate-900 px-3 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100 placeholder-slate-500 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pulse (bpm)</label>
                <input type="text" placeholder="72" value={pulse} onChange={(e) => setPulse(e.target.value)} className="w-full bg-slate-900 px-3 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100 placeholder-slate-500 text-sm" />
              </div>
            </div>
          </div>

          {/* 3. Clinical Lists Builder (C/C and Adv) */}
          <div className="space-y-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">3. Symptoms & Advice Lists</h3>
            
            {/* C/C List Sub-Form */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Chief Complaints (C/C)</label>
              <div className="flex gap-2">
                <input type="text" placeholder="e.g., Knee joint pain for 3 days" value={ccInput} onChange={(e) => setCcInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddCc(e); } }} className="flex-1 bg-slate-900 px-3 py-1.5 border border-slate-700 rounded-lg focus:outline-none text-slate-100 text-sm" />
                <button type="button" onClick={handleAddCc} className="bg-slate-700 hover:bg-slate-600 px-3 rounded-lg text-xs font-bold text-slate-200">Add</button>
              </div>
              {/* Active C/C Tags Panel */}
              {ccList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/60">
                  {ccList.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-slate-700 text-slate-200 text-xs px-2 py-0.5 rounded-md font-medium">
                      {item}
                      <button type="button" onClick={() => handleRemoveCc(idx)} className="text-red-400 hover:text-red-300 font-bold ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Adv List Sub-Form */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Advise / Investigations (Adv)</label>
              <div className="flex gap-2">
                <input type="text" placeholder="e.g., X-Ray Right Knee Joint" value={advInput} onChange={(e) => setAdvInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddAdv(e); } }} className="flex-1 bg-slate-900 px-3 py-1.5 border border-slate-700 rounded-lg focus:outline-none text-slate-100 text-sm" />
                <button type="button" onClick={handleAddAdv} className="bg-slate-700 hover:bg-slate-600 px-3 rounded-lg text-xs font-bold text-slate-200">Add</button>
              </div>
              {/* Active Adv Tags Panel */}
              {advList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/60">
                  {advList.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-slate-700 text-slate-200 text-xs px-2 py-0.5 rounded-md font-medium">
                      {item}
                      <button type="button" onClick={() => handleRemoveAdv(idx)} className="text-red-400 hover:text-red-300 font-bold ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4. Advanced Medication Builder Form */}
          <form onSubmit={addMedicineToPrescription} className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700 relative">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">4. Medication Details</h3>
            
            <div className="relative">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Search Medicine</label>
              <input type="text" placeholder="Search from database..." value={medicineInput} onChange={(e) => { setMedicineInput(e.target.value); if(selectedMedicine) setSelectedMedicine(null); }} className="w-full bg-slate-900 px-3 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100 placeholder-slate-500 text-sm" />

              {/* DB SEARCH DROPDOWN */}
              {searchResults.length > 0 && (
                <div className="absolute top-[65px] left-0 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto">
                  {searchResults.map((med, index) => (
                    <button key={index} type="button" onClick={() => handleSelectMedicine(med)} className="w-full text-left px-4 py-2.5 hover:bg-slate-800 border-b border-slate-800 last:border-0 flex flex-col">
                      <span className="font-semibold text-sm text-slate-200">{med.name}</span>
                      <span className="text-[11px] text-slate-400">Generic: {med.generic}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Structured Dosage Settings */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dosage</label>
                <select value={dosage} onChange={(e) => setDosage(e.target.value)} className="w-full bg-slate-900 px-2 py-2 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none">
                  <option>1+0+1</option>
                  <option>1+1+1</option>
                  <option>1+0+0</option>
                  <option>0+0+1</option>
                  <option>0+1+0</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Timing</label>
                <select value={timing} onChange={(e) => setTiming(e.target.value)} className="w-full bg-slate-900 px-2 py-2 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none">
                  <option>After Food</option>
                  <option>Before Food</option>
                  <option>With Food</option>
                  <option>Empty Stomach</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Duration</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-slate-900 px-2 py-2 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none">
                  <option>7 Days</option>
                  <option>5 Days</option>
                  <option>3 Days</option>
                  <option>2 Weeks</option>
                  <option>1 Month</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={!selectedMedicine} className={`w-full mt-2 py-2 rounded-lg font-medium text-xs tracking-wider uppercase transition ${selectedMedicine ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}>
              Add to Prescription Sheet
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Premium Live Prescription Preview */}
        <div className="xl:col-span-7 flex flex-col items-center justify-start overflow-y-auto p-2 bg-slate-950 rounded-2xl print:bg-white print:p-0">
          
          {/* A4 Paper layout sheet */}
          <div className="w-full max-w-[620px] min-h-[842px] bg-white shadow-2xl p-14 flex flex-col justify-between text-slate-800 font-sans print:shadow-none print:p-0">
            
            <div>
              {/* BRANDING HEADER */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-5 mb-5">
                <div className="text-left font-sans text-slate-900">
                  <h3 className="text-[17px] font-black tracking-wide leading-tight text-slate-900">Dr. Md. Emraan Hossain</h3>
                  <p className="text-[11px] font-bold text-slate-600 tracking-wide mt-0.5">BMDC- A-119333</p>
                  <p className="text-[12px] font-bold text-slate-800 mt-0.5">MBBS(DU), CCD(BIRDEM)</p>
                  <p className="text-[11px] font-medium text-slate-700">PGT (Medicine), PGT (surgery)</p>
                  <p className="text-[11px] font-bold text-slate-800">FCPS (fp) orthopaedic surgery</p>
                  <p className="text-[11px] font-bold text-emerald-800 mt-0.5">Surgery , orthopaedic surgery & Diabetology</p>
                  <p className="text-[12px] font-black text-slate-900 mt-1">Medical College For Women and Hospital</p>
                  <p className="text-[11px] font-medium text-slate-500">Emergency Department</p>
                </div>
                <div className="w-1/3 h-full" />
              </div>

              {/* PATIENT PROFILE STRIP */}
              <div className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-xs font-semibold text-slate-700 mb-6 print:bg-slate-50">
                <div className="col-span-5 truncate"><strong>Name:</strong> <span className="font-normal font-mono text-slate-900 ml-1">{patientName || "____________________"}</span></div>
                <div className="col-span-2"><strong>Age:</strong> <span className="font-normal font-mono text-slate-900 ml-1">{patientAge ? `${patientAge} y` : "____"}</span></div>
                <div className="col-span-2"><strong>Sex:</strong> <span className="font-normal font-mono text-slate-900 ml-1">{patientGender || "___"}</span></div>
                <div className="col-span-3 text-right"><strong>Date:</strong> <span className="font-normal font-mono text-slate-900 ml-1">{formatDateDisplay(prescriptionDate)}</span></div>
              </div>

              {/* TWO-COLUMN CLINICAL BODY */}
              <div className="grid grid-cols-12 gap-6 min-h-[500px]">
                
                {/* Left Column */}
                <div className="col-span-4 border-r border-slate-100 flex flex-col gap-6 pr-3">
                  <div>
                    <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">VITALS</h5>
                    <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                      <li className="flex flex-col border-b border-slate-50 pb-1">
                        <span className="text-[10px] text-slate-400 uppercase">B.P</span>
                        <span className="font-mono text-slate-800 font-bold">{bp || "---"} <span className="text-[9px] font-normal text-slate-400">mmHg</span></span>
                      </li>
                      <li className="flex flex-col border-b border-slate-50 pb-1">
                        <span className="text-[10px] text-slate-400 uppercase">Weight</span>
                        <span className="font-mono text-slate-800 font-bold">{weight || "---"} <span className="text-[9px] font-normal text-slate-400">kg</span></span>
                      </li>
                      <li className="flex flex-col border-b border-slate-50 pb-1">
                        <span className="text-[10px] text-slate-400 uppercase">Pulse</span>
                        <span className="font-mono text-slate-800 font-bold">{pulse || "---"} <span className="text-[9px] font-normal text-slate-400">bpm</span></span>
                      </li>
                    </ul>
                  </div>

                  {ccList.length > 0 && (
                    <div className="animate-fadeIn">
                      <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-900 mb-1.5">C/C</h5>
                      <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1 font-medium leading-tight">
                        {ccList.map((item, idx) => (
                          <li key={idx} className="tracking-tight">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {advList.length > 0 && (
                    <div className="animate-fadeIn">
                      <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-900 mb-1.5">Adv</h5>
                      <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1 font-medium leading-tight">
                        {advList.map((item, idx) => (
                          <li key={idx} className="tracking-tight">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right Column: Rx Panel */}
                <div className="col-span-8 pl-2">
                  <span className="text-4xl font-serif font-black text-slate-900 block mb-4 italic">Rₓ</span>
                  {medicinesList.length === 0 ? (
                    <p className="text-slate-300 italic text-xs pl-2 pt-4 font-mono tracking-wide print:hidden">No therapeutic interventions added.</p>
                  ) : (
                    <div className="space-y-5">
                      {medicinesList.map((med, index) => (
                        <div key={index} className="group relative border-b border-slate-100 pb-2.5 flex flex-col">
                          <div className="flex justify-between items-baseline">
                            <div className="flex gap-2 items-center">
                              <span className="font-mono text-xs font-bold text-slate-400">{index + 1}.</span>
                              <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{med.name}</span>
                            </div>
                            <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">{med.dosage}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-500 font-semibold mt-1 pl-4">
                            <span className="italic font-normal text-slate-400">Generic: {med.generic}</span>
                            <span className="text-slate-600 font-mono">{med.timing} — <span className="text-emerald-700 font-bold">{med.duration}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* FOOTER BAR */}
            <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-[10px] text-slate-400 font-medium tracking-wide">
              <div>
                <p>Generated securely via Shakkhor_DocTech</p>
                <p className="font-mono text-[9px] text-slate-300">System reference token: SignatureNS7</p>
              </div>
              <div className="text-center w-40">
                <div className="border-b border-slate-300 w-full mb-1 h-8" />
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Registered Signature</p>
              </div>
            </div>

          </div>

          {/* Action Trigger Button */}
          <button onClick={handlePrint} className="mt-6 mb-2 w-full max-w-[620px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-lg hover:shadow-xl active:scale-[0.99] print:hidden">
            Print / Export Professional Document
          </button>
        </div>

      </div>
    </div>
  );
}