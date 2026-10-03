import React, { useState } from 'react';
import { AngleUnit, CalcAppTheme, MemoryRegisters } from '../../types/calculator';
import { Atom, Sparkles, ArrowRight, Zap, Info, Layers } from 'lucide-react';

interface QuantumMechanicsPanelProps {
  angleUnit: AngleUnit;
  registers: MemoryRegisters;
  onPushHistory: (expr: string, res: string) => void;
  appTheme?: CalcAppTheme;
}

const H = 6.62607015e-34; // Planck constant (J s)
const HBAR = 1.054571817e-34; // Reduced Planck constant (J s)
const C_LIGHT = 299792458; // Speed of light (m/s)
const HC_EV_NM = 1239.84198; // hc in eV nm
const RYDBERG = 1.09737315685e7; // Rydberg constant (m^-1)
const M_ELECTRON = 9.1093837e-31; // kg
const COMPTON_WAVELENGTH = 2.42631023867e-12; // h / (m_e c) in meters

export const QuantumMechanicsPanel: React.FC<QuantumMechanicsPanelProps> = ({
  onPushHistory,
  appTheme = 'DAY',
}) => {
  const [subTab, setSubTab] = useState<
    'PHOTON' | 'DE_BROGLIE' | 'HEISENBERG' | 'BOX' | 'RYDBERG' | 'HARMONIC' | 'PHOTOELECTRIC' | 'COMPTON' | 'TUNNELING'
  >('PHOTON');

  // 1. Photon Energy state
  const [photonMode, setPhotonMode] = useState<'WAVELENGTH' | 'FREQUENCY'>('WAVELENGTH');
  const [photonWavelength, setPhotonWavelength] = useState('500'); // nm
  const [photonFreq, setPhotonFreq] = useState('5e14'); // Hz
  const [photonResult, setPhotonResult] = useState<{ energyJ: number; energyEv: number } | null>(null);

  // 2. De Broglie state
  const [deBroglieMass, setDeBroglieMass] = useState('9.11e-31'); // kg
  const [deBroglieVelocity, setDeBroglieVelocity] = useState('2e6'); // m/s
  const [deBroglieResult, setDeBroglieResult] = useState<{ lambdaM: number; wavelengthNm: number; momentum: number } | null>(null);

  // 3. Heisenberg Uncertainty state
  const [heisDeltaX, setHeisDeltaX] = useState('1e-10'); // m
  const [heisMass, setHeisMass] = useState('9.11e-31'); // kg
  const [heisResult, setHeisResult] = useState<{ deltaP: number; deltaV: number } | null>(null);

  // 4. Particle in a Box state
  const [boxL, setBoxL] = useState('1e-9'); // m (1 nm)
  const [boxMass, setBoxMass] = useState('9.11e-31'); // kg
  const [boxN, setBoxN] = useState('1');
  const [boxResult, setBoxResult] = useState<{ energyJ: number; energyEv: number } | null>(null);

  // 5. Rydberg Formula state
  const [rydbergN1, setRydbergN1] = useState('2');
  const [rydbergN2, setRydbergN2] = useState('3');
  const [rydbergResult, setRydbergResult] = useState<{ invLambda: number; lambdaM: number; lambdaNm: number; energyEv: number } | null>(null);

  // 6. Harmonic Oscillator state
  const [harmOmega, setHarmOmega] = useState('1e14'); // rad/s
  const [harmResult, setHarmResult] = useState<{ energyJ: number; energyEv: number; freqHz: number } | null>(null);

  // 7. Photoelectric Effect state
  const [photoWavelength, setPhotoWavelength] = useState('250'); // nm (UV)
  const [photoWorkFunction, setPhotoWorkFunction] = useState('2.3'); // eV (Sodium ~2.3 eV)
  const [photoResult, setPhotoResult] = useState<{ photonEnergyEv: number; kMaxEv: number; thresholdNm: number; emits: boolean } | null>(null);

  // 8. Compton Scattering state
  const [comptonAngleDeg, setComptonAngleDeg] = useState('90'); // degrees
  const [comptonLambdaInitNm, setComptonLambdaInitNm] = useState('0.1'); // nm (X-ray ~0.1 nm = 100 pm)
  const [comptonResult, setComptonResult] = useState<{ deltaLambdaM: number; deltaLambdaPm: number; lambdaFinalNm: number } | null>(null);

  // 9. Quantum Tunneling Penetration state
  const [tunnelV0, setTunnelV0] = useState('10'); // eV barrier height
  const [tunnelE, setTunnelE] = useState('4'); // eV particle energy
  const [tunnelWidthNm, setTunnelWidthNm] = useState('0.5'); // nm barrier width
  const [tunnelResult, setTunnelResult] = useState<{ penetrationDepthNm: number; transmissionCoef: number } | null>(null);

  // Handlers
  const handleComputePhoton = () => {
    try {
      if (photonMode === 'WAVELENGTH') {
        const lambdaNm = parseFloat(photonWavelength);
        const energyEv = HC_EV_NM / lambdaNm;
        const energyJ = energyEv * 1.602176634e-19;
        setPhotonResult({ energyJ, energyEv });
        onPushHistory(`Photon Energy (λ = ${lambdaNm} nm)`, `${energyEv.toFixed(4)} eV`);
      } else {
        const nu = parseFloat(photonFreq);
        const energyJ = H * nu;
        const energyEv = energyJ / 1.602176634e-19;
        setPhotonResult({ energyJ, energyEv });
        onPushHistory(`Photon Energy (ν = ${nu} Hz)`, `${energyEv.toFixed(4)} eV`);
      }
    } catch {
      setPhotonResult(null);
    }
  };

  const handleComputeDeBroglie = () => {
    try {
      const m = parseFloat(deBroglieMass);
      const v = parseFloat(deBroglieVelocity);
      const p = m * v;
      const lambdaM = H / p;
      const wavelengthNm = lambdaM * 1e9;
      setDeBroglieResult({ lambdaM, wavelengthNm, momentum: p });
      onPushHistory(`De Broglie λ (m=${m}kg, v=${v}m/s)`, `${lambdaM.toExponential(4)} m`);
    } catch {
      setDeBroglieResult(null);
    }
  };

  const handleComputeHeisenberg = () => {
    try {
      const dx = parseFloat(heisDeltaX);
      const m = parseFloat(heisMass);
      const deltaP = HBAR / (2 * dx);
      const deltaV = deltaP / m;
      setHeisResult({ deltaP, deltaV });
      onPushHistory(`Heisenberg Δx·Δp (Δx=${dx} m)`, `Δv ≥ ${deltaV.toExponential(4)} m/s`);
    } catch {
      setHeisResult(null);
    }
  };

  const handleComputeBox = () => {
    try {
      const L = parseFloat(boxL);
      const m = parseFloat(boxMass);
      const n = parseInt(boxN) || 1;
      const energyJ = (n * n * H * H) / (8 * m * L * L);
      const energyEv = energyJ / 1.602176634e-19;
      setBoxResult({ energyJ, energyEv });
      onPushHistory(`Particle in Box E_${n} (L=${L} m)`, `${energyEv.toFixed(4)} eV`);
    } catch {
      setBoxResult(null);
    }
  };

  const handleComputeRydberg = () => {
    try {
      const n1 = parseInt(rydbergN1) || 1;
      const n2 = parseInt(rydbergN2) || 2;
      if (n2 <= n1) throw new Error('n2 must be > n1');
      const invLambda = RYDBERG * (1 / (n1 * n1) - 1 / (n2 * n2));
      const lambdaM = 1 / invLambda;
      const lambdaNm = lambdaM * 1e9;
      const energyEv = HC_EV_NM / lambdaNm;
      setRydbergResult({ invLambda, lambdaM, lambdaNm, energyEv });
      onPushHistory(`Rydberg Emission (n2=${n2} → n1=${n1})`, `${lambdaNm.toFixed(2)} nm`);
    } catch {
      setRydbergResult(null);
    }
  };

  const handleComputeHarmonic = () => {
    try {
      const omega = parseFloat(harmOmega);
      const energyJ = 0.5 * HBAR * omega;
      const energyEv = energyJ / 1.602176634e-19;
      const freqHz = omega / (2 * Math.PI);
      setHarmResult({ energyJ, energyEv, freqHz });
      onPushHistory(`Zero-Point Energy (ω=${omega} rad/s)`, `${energyEv.toFixed(4)} eV`);
    } catch {
      setHarmResult(null);
    }
  };

  const handleComputePhotoelectric = () => {
    try {
      const lamNm = parseFloat(photoWavelength);
      const phi = parseFloat(photoWorkFunction);
      const photonEv = HC_EV_NM / lamNm;
      const kMax = photonEv - phi;
      const thresholdNm = HC_EV_NM / phi;
      setPhotoResult({
        photonEnergyEv: photonEv,
        kMaxEv: Math.max(0, kMax),
        thresholdNm,
        emits: photonEv >= phi,
      });
      onPushHistory(`Photoelectric (λ=${lamNm}nm, Φ=${phi}eV)`, `${Math.max(0, kMax).toFixed(3)} eV`);
    } catch {
      setPhotoResult(null);
    }
  };

  const handleComputeCompton = () => {
    try {
      const thetaDeg = parseFloat(comptonAngleDeg);
      const thetaRad = (thetaDeg * Math.PI) / 180;
      const deltaLambdaM = COMPTON_WAVELENGTH * (1 - Math.cos(thetaRad));
      const deltaLambdaPm = deltaLambdaM * 1e12; // picometers
      const lambdaInitM = parseFloat(comptonLambdaInitNm) * 1e-9;
      const lambdaFinalM = lambdaInitM + deltaLambdaM;
      setComptonResult({
        deltaLambdaM,
        deltaLambdaPm,
        lambdaFinalNm: lambdaFinalM * 1e9,
      });
      onPushHistory(`Compton Shift (θ=${thetaDeg}°)` , `Δλ = ${deltaLambdaPm.toFixed(3)} pm`);
    } catch {
      setComptonResult(null);
    }
  };

  const handleComputeTunneling = () => {
    try {
      const V0 = parseFloat(tunnelV0);
      const E = parseFloat(tunnelE);
      const widthNm = parseFloat(tunnelWidthNm);
      if (E >= V0) throw new Error('Energy must be less than Barrier V0');
      
      const V0_J = V0 * 1.602176634e-19;
      const E_J = E * 1.602176634e-19;
      const kappa = Math.sqrt(2 * M_ELECTRON * (V0_J - E_J)) / HBAR;
      const penetrationDepthM = 1 / kappa;
      const widthM = widthNm * 1e-9;
      const transmission = Math.exp(-2 * kappa * widthM);

      setTunnelResult({
        penetrationDepthNm: penetrationDepthM * 1e9,
        transmissionCoef: transmission,
      });
      onPushHistory(`Quantum Tunneling (V0=${V0}eV, E=${E}eV)`, `T ≈ ${transmission.toExponential(3)}`);
    } catch {
      setTunnelResult(null);
    }
  };

  const isNight = appTheme === 'DARK';
  const containerBg = isNight ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-200';
  const tabBtnActive = 'bg-cyan-600 text-white font-black shadow-xs';
  const tabBtnInactive = isNight ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200';
  const inputClass = isNight ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';
  const resultBoxClass = isNight ? 'bg-slate-800 border-slate-700 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-900';

  return (
    <div className={`w-full p-4 sm:p-5 rounded-2xl border shadow-sm space-y-4 ${containerBg}`}>
      {/* Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Atom className="w-5 h-5 text-cyan-600 animate-spin-slow" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-800">Quantum Mechanics</span>
        </div>

        <div className="flex flex-wrap items-center gap-1 text-[11px] font-bold">
          <button onClick={() => setSubTab('PHOTON')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'PHOTON' ? tabBtnActive : tabBtnInactive}`}>Photon</button>
          <button onClick={() => setSubTab('DE_BROGLIE')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'DE_BROGLIE' ? tabBtnActive : tabBtnInactive}`}>De Broglie</button>
          <button onClick={() => setSubTab('HEISENBERG')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'HEISENBERG' ? tabBtnActive : tabBtnInactive}`}>Uncertainty</button>
          <button onClick={() => setSubTab('BOX')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'BOX' ? tabBtnActive : tabBtnInactive}`}>Particle in Box</button>
          <button onClick={() => setSubTab('RYDBERG')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'RYDBERG' ? tabBtnActive : tabBtnInactive}`}>Rydberg Spectra</button>
          <button onClick={() => setSubTab('HARMONIC')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'HARMONIC' ? tabBtnActive : tabBtnInactive}`}>Harmonic Osc</button>
          <button onClick={() => setSubTab('PHOTOELECTRIC')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'PHOTOELECTRIC' ? tabBtnActive : tabBtnInactive}`}>Photoelectric</button>
          <button onClick={() => setSubTab('COMPTON')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'COMPTON' ? tabBtnActive : tabBtnInactive}`}>Compton Shift</button>
          <button onClick={() => setSubTab('TUNNELING')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'TUNNELING' ? tabBtnActive : tabBtnInactive}`}>Tunneling</button>
        </div>
      </div>

      {/* 1. Energy of a Photon */}
      {subTab === 'PHOTON' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold">Formula: E = hν = hc / λ (hc ≈ 1239.84 eV·nm)</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPhotonMode('WAVELENGTH')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${photonMode === 'WAVELENGTH' ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700'}`}
              >
                By Wavelength (λ)
              </button>
              <button
                onClick={() => setPhotonMode('FREQUENCY')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${photonMode === 'FREQUENCY' ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700'}`}
              >
                By Frequency (ν)
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="text-slate-400 font-bold uppercase self-center">Presets:</span>
            <button onClick={() => { setPhotonMode('WAVELENGTH'); setPhotonWavelength('500'); }} className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 border rounded-lg text-slate-700 font-bold">Green Light (500 nm)</button>
            <button onClick={() => { setPhotonMode('WAVELENGTH'); setPhotonWavelength('400'); }} className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 border rounded-lg text-slate-700 font-bold">UV Light (400 nm)</button>
            <button onClick={() => { setPhotonMode('WAVELENGTH'); setPhotonWavelength('121.6'); }} className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 border rounded-lg text-slate-700 font-bold">Lyman-alpha (121.6 nm)</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {photonMode === 'WAVELENGTH' ? (
              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">Wavelength λ (nm)</label>
                <input
                  type="text"
                  value={photonWavelength}
                  onChange={e => setPhotonWavelength(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
                />
              </div>
            ) : (
              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">Frequency ν (Hz)</label>
                <input
                  type="text"
                  value={photonFreq}
                  onChange={e => setPhotonFreq(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
                />
              </div>
            )}
            <div className="flex items-end">
              <button
                onClick={handleComputePhoton}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
              >
                Calculate Photon Energy
              </button>
            </div>
          </div>

          {photonResult && (
            <div className={`p-4 border rounded-xl space-y-1 font-mono ${resultBoxClass}`}>
              <div className="text-xs font-bold uppercase opacity-80">Photon Energy Result:</div>
              <div className="text-base font-black">E = {photonResult.energyEv.toFixed(4)} eV</div>
              <div className="text-xs font-bold opacity-90">E = {photonResult.energyJ.toExponential(4)} Joules</div>
            </div>
          )}
        </div>
      )}

      {/* 2. De Broglie Wavelength */}
      {subTab === 'DE_BROGLIE' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold">Formula: λ = h / p = h / (mv) (h ≈ 6.626 × 10⁻³⁴ J·s)</span>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="text-slate-400 font-bold uppercase self-center">Presets:</span>
            <button onClick={() => { setDeBroglieMass('9.11e-31'); setDeBroglieVelocity('2e6'); }} className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 border rounded-lg text-slate-700 font-bold">Electron (2 × 10⁶ m/s)</button>
            <button onClick={() => { setDeBroglieMass('1.67e-27'); setDeBroglieVelocity('1000'); }} className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 border rounded-lg text-slate-700 font-bold">Proton (1,000 m/s)</button>
            <button onClick={() => { setDeBroglieMass('0.145'); setDeBroglieVelocity('40'); }} className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 border rounded-lg text-slate-700 font-bold">Baseball (40 m/s)</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Mass m (kg)</label>
              <input
                type="text"
                value={deBroglieMass}
                onChange={e => setDeBroglieMass(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Velocity v (m/s)</label>
              <input
                type="text"
                value={deBroglieVelocity}
                onChange={e => setDeBroglieVelocity(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleComputeDeBroglie}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
              >
                Calculate Wavelength
              </button>
            </div>
          </div>

          {deBroglieResult && (
            <div className={`p-4 border rounded-xl space-y-1 font-mono ${resultBoxClass}`}>
              <div className="text-xs font-bold uppercase opacity-80">De Broglie Wavelength & Momentum:</div>
              <div className="text-base font-black">λ = {deBroglieResult.lambdaM.toExponential(4)} meters ({deBroglieResult.wavelengthNm.toFixed(4)} nm)</div>
              <div className="text-xs font-black opacity-90">Momentum p = {deBroglieResult.momentum.toExponential(4)} kg·m/s</div>
            </div>
          )}
        </div>
      )}

      {/* 3. Heisenberg Uncertainty Principle */}
      {subTab === 'HEISENBERG' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold">Formula: Δx · Δp ≥ ħ/2 ⟹ Δv ≥ ħ / (2m·Δx) (ħ ≈ 1.055 × 10⁻³⁴ J·s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Position Uncertainty Δx (m)</label>
              <input
                type="text"
                value={heisDeltaX}
                onChange={e => setHeisDeltaX(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Mass m (kg)</label>
              <input
                type="text"
                value={heisMass}
                onChange={e => setHeisMass(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleComputeHeisenberg}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
              >
                Calculate Minimum Δv
              </button>
            </div>
          </div>

          {heisResult && (
            <div className={`p-4 border rounded-xl space-y-1 font-mono ${resultBoxClass}`}>
              <div className="text-xs font-bold uppercase opacity-80">Heisenberg Uncertainty Result:</div>
              <div className="text-base font-black">Δp ≥ {heisResult.deltaP.toExponential(4)} kg·m/s</div>
              <div className="text-xs font-black opacity-90">Δv ≥ {heisResult.deltaV.toExponential(4)} m/s</div>
            </div>
          )}
        </div>
      )}

      {/* 4. Particle in a Box */}
      {subTab === 'BOX' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold">Formula: E_n = (n² h²) / (8 m L²)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Box Length L (m)</label>
              <input
                type="text"
                value={boxL}
                onChange={e => setBoxL(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Particle Mass m (kg)</label>
              <input
                type="text"
                value={boxMass}
                onChange={e => setBoxMass(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Quantum Level n</label>
              <input
                type="text"
                value={boxN}
                onChange={e => setBoxN(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleComputeBox}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
              >
                Calculate Energy
              </button>
            </div>
          </div>

          {boxResult && (
            <div className={`p-4 border rounded-xl space-y-1 font-mono ${resultBoxClass}`}>
              <div className="text-xs font-bold uppercase opacity-80">Particle in a Box Energy (E_{boxN}):</div>
              <div className="text-base font-black">E = {boxResult.energyEv.toFixed(4)} eV</div>
              <div className="text-xs font-black opacity-90">E = {boxResult.energyJ.toExponential(4)} Joules</div>
            </div>
          )}
        </div>
      )}

      {/* 5. Rydberg Emission */}
      {subTab === 'RYDBERG' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold">Formula: 1/λ = R_H (1/n₁² - 1/n₂²) (R_H ≈ 1.097 × 10⁷ m⁻¹)</span>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="text-slate-400 font-bold uppercase self-center">Presets:</span>
            <button onClick={() => { setRydbergN1('2'); setRydbergN2('3'); }} className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 border rounded-lg text-slate-700 font-bold">Balmer n=3 → 2 (656 nm)</button>
            <button onClick={() => { setRydbergN1('2'); setRydbergN2('4'); }} className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 border rounded-lg text-slate-700 font-bold">Balmer n=4 → 2 (486 nm)</button>
            <button onClick={() => { setRydbergN1('1'); setRydbergN2('2'); }} className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 border rounded-lg text-slate-700 font-bold">Lyman n=2 → 1 (121.6 nm)</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Lower Level n₁</label>
              <input
                type="text"
                value={rydbergN1}
                onChange={e => setRydbergN1(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Upper Level n₂</label>
              <input
                type="text"
                value={rydbergN2}
                onChange={e => setRydbergN2(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleComputeRydberg}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
              >
                Calculate Emission
              </button>
            </div>
          </div>

          {rydbergResult && (
            <div className={`p-4 border rounded-xl space-y-1 font-mono ${resultBoxClass}`}>
              <div className="text-xs font-bold uppercase opacity-80">Rydberg Emission Result:</div>
              <div className="text-base font-black">Emitted Wavelength λ = {rydbergResult.lambdaNm.toFixed(2)} nm</div>
              <div className="text-xs font-black opacity-90">Photon Energy E = {rydbergResult.energyEv.toFixed(4)} eV</div>
            </div>
          )}
        </div>
      )}

      {/* 6. Harmonic Oscillator */}
      {subTab === 'HARMONIC' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold">Formula: E₀ = ½ ħω</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Angular Frequency ω (rad/s)</label>
              <input
                type="text"
                value={harmOmega}
                onChange={e => setHarmOmega(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleComputeHarmonic}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
              >
                Calculate Zero-Point Energy
              </button>
            </div>
          </div>

          {harmResult && (
            <div className={`p-4 border rounded-xl space-y-1 font-mono ${resultBoxClass}`}>
              <div className="text-xs font-bold uppercase opacity-80">Zero-Point Energy Result (E₀):</div>
              <div className="text-base font-black">E₀ = {harmResult.energyEv.toFixed(4)} eV (v = {(harmResult.freqHz / 1e12).toFixed(2)} THz)</div>
              <div className="text-xs font-black opacity-90">E₀ = {harmResult.energyJ.toExponential(4)} Joules</div>
            </div>
          )}
        </div>
      )}

      {/* 7. Photoelectric Effect */}
      {subTab === 'PHOTOELECTRIC' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold">Formula: K_max = hν - Φ = (hc / λ) - Φ</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Incident Wavelength λ (nm)</label>
              <input
                type="text"
                value={photoWavelength}
                onChange={e => setPhotoWavelength(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Work Function Φ (eV)</label>
              <input
                type="text"
                value={photoWorkFunction}
                onChange={e => setPhotoWorkFunction(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleComputePhotoelectric}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
              >
                Calculate K_max
              </button>
            </div>
          </div>

          {photoResult && (
            <div className={`p-4 border rounded-xl space-y-1 font-mono ${resultBoxClass}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase opacity-80">Photoelectric Result:</span>
                <span className={`px-2 py-0.5 rounded-md font-black text-[10px] ${photoResult.emits ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {photoResult.emits ? 'Electrons Emitted' : 'No Emission (λ > threshold)'}
                </span>
              </div>
              <div className="text-base font-black">Max Kinetic Energy K_max = {photoResult.kMaxEv.toFixed(4)} eV</div>
              <div className="text-xs font-black opacity-95">Photon Energy = {photoResult.photonEnergyEv.toFixed(4)} eV | Threshold Wavelength = {photoResult.thresholdNm.toFixed(1)} nm</div>
            </div>
          )}
        </div>
      )}

      {/* 8. Compton Scattering */}
      {subTab === 'COMPTON' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold">Formula: Δλ = (h / m_e c) (1 - cos θ)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Scattering Angle θ (degrees)</label>
              <input
                type="text"
                value={comptonAngleDeg}
                onChange={e => setComptonAngleDeg(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Initial Wavelength λ (nm)</label>
              <input
                type="text"
                value={comptonLambdaInitNm}
                onChange={e => setComptonLambdaInitNm(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleComputeCompton}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
              >
                Calculate Shift
              </button>
            </div>
          </div>

          {comptonResult && (
            <div className={`p-4 border rounded-xl space-y-1 font-mono ${resultBoxClass}`}>
              <div className="text-xs font-bold uppercase opacity-80">Compton Scattering Shift:</div>
              <div className="text-base font-black">Wavelength Shift Δλ = {comptonResult.deltaLambdaPm.toFixed(3)} pm ({comptonResult.deltaLambdaM.toExponential(4)} m)</div>
              <div className="text-xs font-black opacity-90">Final Wavelength λ' = {(comptonResult.lambdaFinalNm * 1e3).toFixed(3)} pm</div>
            </div>
          )}
        </div>
      )}

      {/* 9. Quantum Tunneling */}
      {subTab === 'TUNNELING' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold">Formula: T ≈ exp(-2κw) where κ = √(2m(V₀ - E)) / ħ</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Barrier Height V₀ (eV)</label>
              <input
                type="text"
                value={tunnelV0}
                onChange={e => setTunnelV0(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Particle Energy E (eV)</label>
              <input
                type="text"
                value={tunnelE}
                onChange={e => setTunnelE(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Barrier Width w (nm)</label>
              <input
                type="text"
                value={tunnelWidthNm}
                onChange={e => setTunnelWidthNm(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleComputeTunneling}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
              >
                Calculate Tunneling
              </button>
            </div>
          </div>

          {tunnelResult && (
            <div className={`p-4 border rounded-xl space-y-1 font-mono ${resultBoxClass}`}>
              <div className="text-xs font-bold uppercase opacity-80">Quantum Tunneling Result:</div>
              <div className="text-base font-black">Transmission Coefficient T = {tunnelResult.transmissionCoef.toExponential(4)}</div>
              <div className="text-xs font-black opacity-90">Decay Penetration Depth δ = {tunnelResult.penetrationDepthNm.toFixed(4)} nm</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
