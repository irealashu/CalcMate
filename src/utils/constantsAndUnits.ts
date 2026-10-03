import { PhysicalConstant, UnitCategory } from '../types/calculator';

export const PHYSICAL_CONSTANTS: PhysicalConstant[] = [
  // ================= UNIVERSAL CONSTANTS =================
  { id: 'c0', symbol: 'c', latexSymbol: 'c', name: 'Speed of Light in Vacuum', category: 'Universal', value: 299792458, unit: 'm/s' },
  { id: 'mu0', symbol: 'μ₀', latexSymbol: '\\mu_0', name: 'Vacuum Permeability', category: 'Universal', value: 1.25663706212e-6, unit: 'N/A²' },
  { id: 'eps0', symbol: 'ε₀', latexSymbol: '\\varepsilon_0', name: 'Vacuum Permittivity', category: 'Universal', value: 8.8541878128e-12, unit: 'F/m' },
  { id: 'Z0', symbol: 'Z₀', latexSymbol: 'Z_0', name: 'Characteristic Impedance of Vacuum', category: 'Universal', value: 376.730313668, unit: 'Ω' },
  { id: 'G', symbol: 'G', latexSymbol: 'G', name: 'Newtonian Constant of Gravitation', category: 'Universal', value: 6.67430e-11, unit: 'm³/(kg·s²)' },
  { id: 'h', symbol: 'h', latexSymbol: 'h', name: 'Planck Constant', category: 'Universal', value: 6.62607015e-34, unit: 'J·s' },
  { id: 'hbar', symbol: 'ℏ', latexSymbol: '\\hbar', name: 'Reduced Planck Constant (h/2π)', category: 'Universal', value: 1.054571817e-34, unit: 'J·s' },
  { id: 'lP', symbol: 'l_P', latexSymbol: 'l_P', name: 'Planck Length', category: 'Universal', value: 1.616255e-35, unit: 'm' },
  { id: 'mP', symbol: 'm_P', latexSymbol: 'm_P', name: 'Planck Mass', category: 'Universal', value: 2.176434e-8, unit: 'kg' },
  { id: 'tP', symbol: 't_P', latexSymbol: 't_P', name: 'Planck Time', category: 'Universal', value: 5.391247e-44, unit: 's' },
  { id: 'TP', symbol: 'T_P', latexSymbol: 'T_P', name: 'Planck Temperature', category: 'Universal', value: 1.416784e32, unit: 'K' },

  // ================= ELECTROMAGNETIC CONSTANTS =================
  { id: 'e', symbol: 'e', latexSymbol: 'e', name: 'Elementary Charge', category: 'Electromagnetic', value: 1.602176634e-19, unit: 'C' },
  { id: 'Phi0', symbol: 'Φ₀', latexSymbol: '\\Phi_0', name: 'Magnetic Flux Quantum (h/2e)', category: 'Electromagnetic', value: 2.067833848e-15, unit: 'Wb' },
  { id: 'G0', symbol: 'G₀', latexSymbol: 'G_0', name: 'Conductance Quantum (2e²/h)', category: 'Electromagnetic', value: 7.748091729e-5, unit: 'S' },
  { id: 'KJ', symbol: 'K_J', latexSymbol: 'K_J', name: 'Josephson Constant', category: 'Electromagnetic', value: 483597.8484e9, unit: 'Hz/V' },
  { id: 'RK', symbol: 'R_K', latexSymbol: 'R_K', name: 'von Klitzing Constant', category: 'Electromagnetic', value: 25812.80745, unit: 'Ω' },
  { id: 'muB', symbol: 'μ_B', latexSymbol: '\\mu_B', name: 'Bohr Magneton', category: 'Electromagnetic', value: 9.2740100783e-24, unit: 'J/T' },
  { id: 'muN', symbol: 'μ_N', latexSymbol: '\\mu_N', name: 'Nuclear Magneton', category: 'Electromagnetic', value: 5.0507837461e-27, unit: 'J/T' },
  { id: 'qcirc', symbol: 'h/2m_e', latexSymbol: 'h/(2m_e)', name: 'Quantum of Circulation', category: 'Electromagnetic', value: 3.6369475516e-4, unit: 'm²/s' },

  // ================= ATOMIC & NUCLEAR CONSTANTS =================
  { id: 'alpha', symbol: 'α', latexSymbol: '\\alpha', name: 'Fine-Structure Constant', category: 'Atomic', value: 7.2973525693e-3, unit: 'dimensionless' },
  { id: 'invAlpha', symbol: '1/α', latexSymbol: '1/\\alpha', name: 'Inverse Fine-Structure Constant', category: 'Atomic', value: 137.035999084, unit: 'dimensionless' },
  { id: 'a0', symbol: 'a₀', latexSymbol: 'a_0', name: 'Bohr Radius', category: 'Atomic', value: 5.29177210903e-11, unit: 'm' },
  { id: 'Rinf', symbol: 'R_∞', latexSymbol: 'R_\\infty', name: 'Rydberg Constant', category: 'Atomic', value: 10973731.56816, unit: 'm⁻¹' },
  { id: 'Eh', symbol: 'E_h', latexSymbol: 'E_h', name: 'Hartree Energy', category: 'Atomic', value: 4.3597447222071e-18, unit: 'J' },
  { id: 're', symbol: 'r_e', latexSymbol: 'r_e', name: 'Classical Electron Radius', category: 'Atomic', value: 2.8179403262e-15, unit: 'm' },
  { id: 'me', symbol: 'm_e', latexSymbol: 'm_e', name: 'Electron Mass', category: 'Atomic', value: 9.1093837015e-31, unit: 'kg' },
  { id: 'me_u', symbol: 'm_e (u)', latexSymbol: 'm_e', name: 'Electron Mass in atomic mass units', category: 'Atomic', value: 5.48579909065e-4, unit: 'u' },
  { id: 'm_p', symbol: 'm_p', latexSymbol: 'm_p', name: 'Proton Mass', category: 'Atomic', value: 1.67262192369e-27, unit: 'kg' },
  { id: 'mp_u', symbol: 'm_p (u)', latexSymbol: 'm_p', name: 'Proton Mass in atomic mass units', category: 'Atomic', value: 1.007276466621, unit: 'u' },
  { id: 'mn', symbol: 'm_n', latexSymbol: 'm_n', name: 'Neutron Mass', category: 'Atomic', value: 1.67492749804e-27, unit: 'kg' },
  { id: 'mn_u', symbol: 'm_n (u)', latexSymbol: 'm_n', name: 'Neutron Mass in atomic mass units', category: 'Atomic', value: 1.00866491595, unit: 'u' },
  { id: 'mmu', symbol: 'm_μ', latexSymbol: 'm_\\mu', name: 'Muon Mass', category: 'Atomic', value: 1.883531627e-28, unit: 'kg' },
  { id: 'mtau', symbol: 'm_τ', latexSymbol: 'm_\\tau', name: 'Tau Mass', category: 'Atomic', value: 3.16754e-27, unit: 'kg' },
  { id: 'md', symbol: 'm_d', latexSymbol: 'm_d', name: 'Deuteron Mass', category: 'Atomic', value: 3.3435837724e-27, unit: 'kg' },
  { id: 'mh', symbol: 'm_h', latexSymbol: 'm_h', name: 'Helion Mass (He-3 nucleus)', category: 'Atomic', value: 5.0064127796e-27, unit: 'kg' },
  { id: 'malpha', symbol: 'm_α', latexSymbol: 'm_\\alpha', name: 'Alpha Particle Mass', category: 'Atomic', value: 6.6446573357e-27, unit: 'kg' },
  { id: 'u', symbol: 'u', latexSymbol: 'u', name: 'Unified Atomic Mass Unit (1/12 C-12)', category: 'Atomic', value: 1.66053906660e-27, unit: 'kg' },
  { id: 'u_eV', symbol: 'u·c²', latexSymbol: 'u c^2', name: 'Atomic Mass Unit Energy Equivalent', category: 'Atomic', value: 931.49410242e6, unit: 'eV' },

  // ================= PHYSICO-CHEMICAL CONSTANTS =================
  { id: 'NA', symbol: 'N_A', latexSymbol: 'N_A', name: 'Avogadro Constant', category: 'Physico-Chemical', value: 6.02214076e23, unit: 'mol⁻¹' },
  { id: 'k', symbol: 'k', latexSymbol: 'k', name: 'Boltzmann Constant', category: 'Physico-Chemical', value: 1.380649e-23, unit: 'J/K' },
  { id: 'R', symbol: 'R', latexSymbol: 'R', name: 'Molar Gas Constant', category: 'Physico-Chemical', value: 8.314462618, unit: 'J/(mol·K)' },
  { id: 'F', symbol: 'F', latexSymbol: 'F', name: 'Faraday Constant', category: 'Physico-Chemical', value: 96485.33212, unit: 'C/mol' },
  { id: 'sigma', symbol: 'σ', latexSymbol: '\\sigma', name: 'Stefan-Boltzmann Constant', category: 'Physico-Chemical', value: 5.670374419e-8, unit: 'W/(m²·K⁴)' },
  { id: 'c1L', symbol: 'c₁L', latexSymbol: 'c_{1L}', name: 'First Radiation Constant for Spectral Radiance', category: 'Physico-Chemical', value: 1.1910429723973e-16, unit: 'W·m²/sr' },
  { id: 'c2', symbol: 'c₂', latexSymbol: 'c_2', name: 'Second Radiation Constant', category: 'Physico-Chemical', value: 1.438776877e-2, unit: 'm·K' },
  { id: 'b', symbol: 'b', latexSymbol: 'b', name: 'Wien Wavelength Displacement Law Constant', category: 'Physico-Chemical', value: 2.897771955e-3, unit: 'm·K' },
  { id: 'b_prime', symbol: "b'", latexSymbol: "b'", name: 'Wien Frequency Displacement Law Constant', category: 'Physico-Chemical', value: 5.878925757e10, unit: 'Hz/K' },
  { id: 'Vm', symbol: 'V_m', latexSymbol: 'V_m', name: 'Molar Volume of Ideal Gas (273.15 K, 101.325 kPa)', category: 'Physico-Chemical', value: 22.41396954e-3, unit: 'm³/mol' },
  { id: 'n0', symbol: 'n₀', latexSymbol: 'n_0', name: 'Loschmidt Constant (273.15 K, 101.325 kPa)', category: 'Physico-Chemical', value: 2.686780111e25, unit: 'm⁻³' },

  // ================= ASTRONOMY, GEOPHYSICS & COSMOLOGY =================
  { id: 'g0', symbol: 'g₀', latexSymbol: 'g_0', name: 'Standard Acceleration of Gravity', category: 'Astro', value: 9.80665, unit: 'm/s²' },
  { id: 'atm', symbol: 'atm', latexSymbol: 'atm', name: 'Standard Atmosphere', category: 'Astro', value: 101325, unit: 'Pa' },
  { id: 'ly', symbol: 'ly', latexSymbol: 'ly', name: 'Light Year', category: 'Astro', value: 9.4607304725808e15, unit: 'm' },
  { id: 'pc', symbol: 'pc', latexSymbol: 'pc', name: 'Parsec', category: 'Astro', value: 3.08567758149137e16, unit: 'm' },
  { id: 'AU', symbol: 'AU', latexSymbol: 'AU', name: 'Astronomical Unit', category: 'Astro', value: 149597870700, unit: 'm' },
  { id: 'M_sun', symbol: 'M_☉', latexSymbol: 'M_\\odot', name: 'Solar Mass', category: 'Astro', value: 1.98847e30, unit: 'kg' },
  { id: 'R_sun', symbol: 'R_☉', latexSymbol: 'R_\\odot', name: 'Solar Radius', category: 'Astro', value: 6.957e8, unit: 'm' },
  { id: 'L_sun', symbol: 'L_☉', latexSymbol: 'L_\\odot', name: 'Solar Luminosity', category: 'Astro', value: 3.828e26, unit: 'W' },
  { id: 'M_earth', symbol: 'M_⊕', latexSymbol: 'M_\\oplus', name: 'Earth Mass', category: 'Astro', value: 5.9722e24, unit: 'kg' },
  { id: 'R_earth', symbol: 'R_⊕', latexSymbol: 'R_\\oplus', name: 'Earth Equatorial Radius', category: 'Astro', value: 6378137, unit: 'm' },
  { id: 'H0', symbol: 'H₀', latexSymbol: 'H_0', name: 'Hubble Constant', category: 'Astro', value: 67.4, unit: '(km/s)/Mpc' },
  { id: 'T_CMB', symbol: 'T_CMB', latexSymbol: 'T_{CMB}', name: 'Cosmic Microwave Background Temperature', category: 'Astro', value: 2.72548, unit: 'K' }
];

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    name: 'Length',
    units: [
      { name: 'Meters', symbol: 'm', toBase: x => x, fromBase: x => x },
      { name: 'Kilometers', symbol: 'km', toBase: x => x * 1000, fromBase: x => x / 1000 },
      { name: 'Centimeters', symbol: 'cm', toBase: x => x / 100, fromBase: x => x * 100 },
      { name: 'Millimeters', symbol: 'mm', toBase: x => x / 1000, fromBase: x => x * 1000 },
      { name: 'Micrometers', symbol: 'µm', toBase: x => x / 1e6, fromBase: x => x * 1e6 },
      { name: 'Nanometers', symbol: 'nm', toBase: x => x / 1e9, fromBase: x => x * 1e9 },
      { name: 'Inches', symbol: 'in', toBase: x => x * 0.0254, fromBase: x => x / 0.0254 },
      { name: 'Feet', symbol: 'ft', toBase: x => x * 0.3048, fromBase: x => x / 0.3048 },
      { name: 'Yards', symbol: 'yd', toBase: x => x * 0.9144, fromBase: x => x / 0.9144 },
      { name: 'Miles', symbol: 'mi', toBase: x => x * 1609.344, fromBase: x => x / 1609.344 },
      { name: 'Nautical Miles', symbol: 'NM', toBase: x => x * 1852, fromBase: x => x / 1852 },
      { name: 'Light Years', symbol: 'ly', toBase: x => x * 9.46073e15, fromBase: x => x / 9.46073e15 }
    ]
  },
  {
    name: 'Mass',
    units: [
      { name: 'Kilograms', symbol: 'kg', toBase: x => x, fromBase: x => x },
      { name: 'Grams', symbol: 'g', toBase: x => x / 1000, fromBase: x => x * 1000 },
      { name: 'Milligrams', symbol: 'mg', toBase: x => x / 1e6, fromBase: x => x * 1e6 },
      { name: 'Micrograms', symbol: 'µg', toBase: x => x / 1e9, fromBase: x => x * 1e9 },
      { name: 'Pounds', symbol: 'lb', toBase: x => x * 0.45359237, fromBase: x => x / 0.45359237 },
      { name: 'Ounces', symbol: 'oz', toBase: x => x * 0.028349523125, fromBase: x => x / 0.028349523125 },
      { name: 'Metric Tons', symbol: 't', toBase: x => x * 1000, fromBase: x => x / 1000 },
      { name: 'Atomic Mass Unit', symbol: 'u', toBase: x => x * 1.660539e-27, fromBase: x => x / 1.660539e-27 }
    ]
  },
  {
    name: 'Temperature',
    units: [
      { name: 'Celsius', symbol: '°C', toBase: x => x + 273.15, fromBase: x => x - 273.15 },
      { name: 'Fahrenheit', symbol: '°F', toBase: x => (x - 32) * (5 / 9) + 273.15, fromBase: x => (x - 273.15) * (9 / 5) + 32 },
      { name: 'Kelvin', symbol: 'K', toBase: x => x, fromBase: x => x }
    ]
  },
  {
    name: 'Area',
    units: [
      { name: 'Square Meters', symbol: 'm²', toBase: x => x, fromBase: x => x },
      { name: 'Square Kilometers', symbol: 'km²', toBase: x => x * 1e6, fromBase: x => x / 1e6 },
      { name: 'Square Centimeters', symbol: 'cm²', toBase: x => x / 10000, fromBase: x => x * 10000 },
      { name: 'Hectares', symbol: 'ha', toBase: x => x * 10000, fromBase: x => x / 10000 },
      { name: 'Acres', symbol: 'ac', toBase: x => x * 4046.8564224, fromBase: x => x / 4046.8564224 },
      { name: 'Square Feet', symbol: 'ft²', toBase: x => x * 0.092903, fromBase: x => x / 0.092903 },
      { name: 'Square Inches', symbol: 'in²', toBase: x => x * 0.00064516, fromBase: x => x / 0.00064516 }
    ]
  },
  {
    name: 'Volume',
    units: [
      { name: 'Liters', symbol: 'L', toBase: x => x, fromBase: x => x },
      { name: 'Milliliters', symbol: 'mL', toBase: x => x / 1000, fromBase: x => x * 1000 },
      { name: 'Cubic Meters', symbol: 'm³', toBase: x => x * 1000, fromBase: x => x / 1000 },
      { name: 'Cubic Centimeters', symbol: 'cm³', toBase: x => x / 1000, fromBase: x => x * 1000 },
      { name: 'Gallons (US)', symbol: 'gal', toBase: x => x * 3.785411784, fromBase: x => x / 3.785411784 },
      { name: 'Quarts (US)', symbol: 'qt', toBase: x => x * 0.946352946, fromBase: x => x / 0.946352946 },
      { name: 'Fluid Ounces (US)', symbol: 'fl oz', toBase: x => x * 0.0295735295625, fromBase: x => x / 0.0295735295625 }
    ]
  },
  {
    name: 'Time',
    units: [
      { name: 'Seconds', symbol: 's', toBase: x => x, fromBase: x => x },
      { name: 'Milliseconds', symbol: 'ms', toBase: x => x / 1000, fromBase: x => x * 1000 },
      { name: 'Minutes', symbol: 'min', toBase: x => x * 60, fromBase: x => x / 60 },
      { name: 'Hours', symbol: 'h', toBase: x => x * 3600, fromBase: x => x / 3600 },
      { name: 'Days', symbol: 'd', toBase: x => x * 86400, fromBase: x => x / 86400 },
      { name: 'Weeks', symbol: 'wk', toBase: x => x * 604800, fromBase: x => x / 604800 },
      { name: 'Years', symbol: 'yr', toBase: x => x * 31536000, fromBase: x => x / 31536000 }
    ]
  },
  {
    name: 'Velocity',
    units: [
      { name: 'Meters / second', symbol: 'm/s', toBase: x => x, fromBase: x => x },
      { name: 'Kilometers / hour', symbol: 'km/h', toBase: x => x / 3.6, fromBase: x => x * 3.6 },
      { name: 'Miles / hour', symbol: 'mph', toBase: x => x * 0.44704, fromBase: x => x / 0.44704 },
      { name: 'Knots', symbol: 'kt', toBase: x => x * 0.514444, fromBase: x => x / 0.514444 },
      { name: 'Speed of Light', symbol: 'c', toBase: x => x * 299792458, fromBase: x => x / 299792458 }
    ]
  },
  {
    name: 'Data Storage',
    units: [
      { name: 'Bytes', symbol: 'B', toBase: x => x, fromBase: x => x },
      { name: 'Kilobytes', symbol: 'KB', toBase: x => x * 1024, fromBase: x => x / 1024 },
      { name: 'Megabytes', symbol: 'MB', toBase: x => x * 1048576, fromBase: x => x / 1048576 },
      { name: 'Gigabytes', symbol: 'GB', toBase: x => x * 1073741824, fromBase: x => x / 1073741824 },
      { name: 'Terabytes', symbol: 'TB', toBase: x => x * 1099511627776, fromBase: x => x / 1099511627776 },
      { name: 'Petabytes', symbol: 'PB', toBase: x => x * 1125899906842624, fromBase: x => x / 1125899906842624 }
    ]
  },
  {
    name: 'Pressure',
    units: [
      { name: 'Pascals', symbol: 'Pa', toBase: x => x, fromBase: x => x },
      { name: 'Kilopascals', symbol: 'kPa', toBase: x => x * 1000, fromBase: x => x / 1000 },
      { name: 'Bar', symbol: 'bar', toBase: x => x * 100000, fromBase: x => x / 100000 },
      { name: 'Atmospheres', symbol: 'atm', toBase: x => x * 101325, fromBase: x => x / 101325 },
      { name: 'PSI', symbol: 'psi', toBase: x => x * 6894.757293168, fromBase: x => x / 6894.757293168 },
      { name: 'Torr / mmHg', symbol: 'mmHg', toBase: x => x * 133.322368421, fromBase: x => x / 133.322368421 }
    ]
  },
  {
    name: 'Energy',
    units: [
      { name: 'Joules', symbol: 'J', toBase: x => x, fromBase: x => x },
      { name: 'Kilojoules', symbol: 'kJ', toBase: x => x * 1000, fromBase: x => x / 1000 },
      { name: 'Calories', symbol: 'cal', toBase: x => x * 4.184, fromBase: x => x / 4.184 },
      { name: 'Kilocalories', symbol: 'kcal', toBase: x => x * 4184, fromBase: x => x / 4184 },
      { name: 'Electronvolts', symbol: 'eV', toBase: x => x * 1.602176634e-19, fromBase: x => x / 1.602176634e-19 },
      { name: 'Kilowatt-hours', symbol: 'kWh', toBase: x => x * 3600000, fromBase: x => x / 3600000 }
    ]
  },
  {
    name: 'Force',
    units: [
      { name: 'Newtons', symbol: 'N', toBase: x => x, fromBase: x => x },
      { name: 'Kilonewtons', symbol: 'kN', toBase: x => x * 1000, fromBase: x => x / 1000 },
      { name: 'Pound-force', symbol: 'lbf', toBase: x => x * 4.448222, fromBase: x => x / 4.448222 },
      { name: 'Dyne', symbol: 'dyn', toBase: x => x * 1e-5, fromBase: x => x / 1e-5 }
    ]
  },
  {
    name: 'Frequency',
    units: [
      { name: 'Hertz', symbol: 'Hz', toBase: x => x, fromBase: x => x },
      { name: 'Kilohertz', symbol: 'kHz', toBase: x => x * 1000, fromBase: x => x / 1000 },
      { name: 'Megahertz', symbol: 'MHz', toBase: x => x * 1e6, fromBase: x => x / 1e6 },
      { name: 'Gigahertz', symbol: 'GHz', toBase: x => x * 1e9, fromBase: x => x / 1e9 },
      { name: 'RPM', symbol: 'rpm', toBase: x => x / 60, fromBase: x => x * 60 }
    ]
  },
  {
    name: 'Angle',
    units: [
      { name: 'Degrees', symbol: '°', toBase: x => x * (Math.PI / 180), fromBase: x => x * (180 / Math.PI) },
      { name: 'Radians', symbol: 'rad', toBase: x => x, fromBase: x => x },
      { name: 'Gradians', symbol: 'grad', toBase: x => x * (Math.PI / 200), fromBase: x => x * (200 / Math.PI) },
      { name: 'Arcminutes', symbol: '′', toBase: x => x * (Math.PI / 10800), fromBase: x => x * (10800 / Math.PI) },
      { name: 'Arcseconds', symbol: '″', toBase: x => x * (Math.PI / 648000), fromBase: x => x * (648000 / Math.PI) }
    ]
  }
];
