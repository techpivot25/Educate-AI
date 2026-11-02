import React, { useState, useMemo } from 'react';
import {
  Atom,
  Search,
  Sparkles,
  Info,
  Maximize2,
  Layers,
  Zap,
  CheckCircle,
  Copy,
  ChevronRight,
  TrendingUp,
  Download,
  Flame,
  Shield,
  CircleDot,
} from 'lucide-react';

export type ElementCategory =
  | 'alkali'
  | 'alkaline-earth'
  | 'transition'
  | 'post-transition'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas';

export interface ChemicalElement {
  z: number; // Atomic Number
  symbol: string;
  name: string;
  mass: number; // Atomic Weight (u)
  period: number; // 1 to 7
  group: number; // 1 to 18
  category: ElementCategory;
  state: 'Gas' | 'Liquid' | 'Solid';
  electronConfig: string;
  shells: number[]; // e.g. [2, 8, 1] for Na
  valence: number;
  oxidationStates: string;
  electronegativity: number | null; // Pauling scale
  atomicRadius: number; // in pm (picometers)
  boardNotes: string;
}

export const ELEMENTS_DATA: ChemicalElement[] = [
  // Period 1
  {
    z: 1,
    symbol: 'H',
    name: 'Hydrogen',
    mass: 1.008,
    period: 1,
    group: 1,
    category: 'nonmetal',
    state: 'Gas',
    electronConfig: '1s¹',
    shells: [1],
    valence: 1,
    oxidationStates: '+1, -1',
    electronegativity: 2.2,
    atomicRadius: 53,
    boardNotes: 'Most abundant element in universe; unique dual placement in Group 1 & 17; forms hydrides and water.',
  },
  {
    z: 2,
    symbol: 'He',
    name: 'Helium',
    mass: 4.003,
    period: 1,
    group: 18,
    category: 'noble-gas',
    state: 'Gas',
    electronConfig: '1s²',
    shells: [2],
    valence: 0,
    oxidationStates: '0',
    electronegativity: null,
    atomicRadius: 31,
    boardNotes: 'Stable duplet noble gas; second lightest element; lowest boiling point of any known substance (-268.9°C).',
  },

  // Period 2
  {
    z: 3,
    symbol: 'Li',
    name: 'Lithium',
    mass: 6.94,
    period: 2,
    group: 1,
    category: 'alkali',
    state: 'Solid',
    electronConfig: '[He] 2s¹',
    shells: [2, 1],
    valence: 1,
    oxidationStates: '+1',
    electronegativity: 0.98,
    atomicRadius: 152,
    boardNotes: 'Lightest alkali metal; highest standard oxidation potential; vital for rechargeable lithium-ion battery chemistry.',
  },
  {
    z: 4,
    symbol: 'Be',
    name: 'Beryllium',
    mass: 9.012,
    period: 2,
    group: 2,
    category: 'alkaline-earth',
    state: 'Solid',
    electronConfig: '[He] 2s²',
    shells: [2, 2],
    valence: 2,
    oxidationStates: '+2',
    electronegativity: 1.57,
    atomicRadius: 112,
    boardNotes: 'Diagonal relationship with Aluminum; forms covalent halides; high melting point and stiffness.',
  },
  {
    z: 5,
    symbol: 'B',
    name: 'Boron',
    mass: 10.81,
    period: 2,
    group: 13,
    category: 'metalloid',
    state: 'Solid',
    electronConfig: '[He] 2s² 2p¹',
    shells: [2, 3],
    valence: 3,
    oxidationStates: '+3',
    electronegativity: 2.04,
    atomicRadius: 85,
    boardNotes: 'Electron-deficient metalloid; forms 3-center-2-electron banana bonds in diborane (B₂H₆); used in borosilicate glassware.',
  },
  {
    z: 6,
    symbol: 'C',
    name: 'Carbon',
    mass: 12.011,
    period: 2,
    group: 14,
    category: 'nonmetal',
    state: 'Solid',
    electronConfig: '[He] 2s² 2p²',
    shells: [2, 4],
    valence: 4,
    oxidationStates: '-4, +2, +4',
    electronegativity: 2.55,
    atomicRadius: 77,
    boardNotes: 'Catenation champion; forms diamond (sp³, hardest natural mineral) and graphite (sp², planar conductor); organic chemistry backbone.',
  },
  {
    z: 7,
    symbol: 'N',
    name: 'Nitrogen',
    mass: 14.007,
    period: 2,
    group: 15,
    category: 'nonmetal',
    state: 'Gas',
    electronConfig: '[He] 2s² 2p³',
    shells: [2, 5],
    valence: 3,
    oxidationStates: '-3 to +5',
    electronegativity: 3.04,
    atomicRadius: 75,
    boardNotes: '78% of atmosphere; strong triple bond (N≡N, 945 kJ/mol) causes chemical inertness at room temperature; Haber process for NH₃.',
  },
  {
    z: 8,
    symbol: 'O',
    name: 'Oxygen',
    mass: 15.999,
    period: 2,
    group: 16,
    category: 'nonmetal',
    state: 'Gas',
    electronConfig: '[He] 2s² 2p⁴',
    shells: [2, 6],
    valence: 2,
    oxidationStates: '-2, -1 (peroxides)',
    electronegativity: 3.44,
    atomicRadius: 73,
    boardNotes: 'Second most electronegative element; paramagnetic in liquid phase due to 2 unpaired electrons in antibonding π* orbitals (MOT).',
  },
  {
    z: 9,
    symbol: 'F',
    name: 'Fluorine',
    mass: 18.998,
    period: 2,
    group: 17,
    category: 'halogen',
    state: 'Gas',
    electronConfig: '[He] 2s² 2p⁵',
    shells: [2, 7],
    valence: 1,
    oxidationStates: '-1 only',
    electronegativity: 3.98,
    atomicRadius: 71,
    boardNotes: 'Most electronegative & reactive element in periodic table; always -1 oxidation state; displaces all other halogens from halides.',
  },
  {
    z: 10,
    symbol: 'Ne',
    name: 'Neon',
    mass: 20.18,
    period: 2,
    group: 18,
    category: 'noble-gas',
    state: 'Gas',
    electronConfig: '[He] 2s² 2p⁶',
    shells: [2, 8],
    valence: 0,
    oxidationStates: '0',
    electronegativity: null,
    atomicRadius: 69,
    boardNotes: 'Complete octet noble gas core; glows vivid red-orange in high-voltage discharge advertising lamps.',
  },

  // Period 3
  {
    z: 11,
    symbol: 'Na',
    name: 'Sodium',
    mass: 22.99,
    period: 3,
    group: 1,
    category: 'alkali',
    state: 'Solid',
    electronConfig: '[Ne] 3s¹',
    shells: [2, 8, 1],
    valence: 1,
    oxidationStates: '+1',
    electronegativity: 0.93,
    atomicRadius: 186,
    boardNotes: 'Soft alkali metal; stored under kerosene due to violent exothermic reaction with atmospheric water producing H₂ and NaOH.',
  },
  {
    z: 12,
    symbol: 'Mg',
    name: 'Magnesium',
    mass: 24.305,
    period: 3,
    group: 2,
    category: 'alkaline-earth',
    state: 'Solid',
    electronConfig: '[Ne] 3s²',
    shells: [2, 8, 2],
    valence: 2,
    oxidationStates: '+2',
    electronegativity: 1.31,
    atomicRadius: 160,
    boardNotes: 'Burns with dazzling white flame producing basic MgO; central metallic atom coordinating porphyrin ring in chlorophyll.',
  },
  {
    z: 13,
    symbol: 'Al',
    name: 'Aluminium',
    mass: 26.982,
    period: 3,
    group: 13,
    category: 'post-transition',
    state: 'Solid',
    electronConfig: '[Ne] 3s² 3p¹',
    shells: [2, 8, 3],
    valence: 3,
    oxidationStates: '+3',
    electronegativity: 1.61,
    atomicRadius: 143,
    boardNotes: 'Most abundant metal in Earth crust; forms protective self-healing amphoteric Al₂O₃ passivation layer against corrosion.',
  },
  {
    z: 14,
    symbol: 'Si',
    name: 'Silicon',
    mass: 28.085,
    period: 3,
    group: 14,
    category: 'metalloid',
    state: 'Solid',
    electronConfig: '[Ne] 3s² 3p²',
    shells: [2, 8, 4],
    valence: 4,
    oxidationStates: '-4, +4',
    electronegativity: 1.9,
    atomicRadius: 118,
    boardNotes: 'Semiconductor basis of integrated microelectronics; network covalent silica (SiO₂) quartz crystal lattice.',
  },
  {
    z: 15,
    symbol: 'P',
    name: 'Phosphorus',
    mass: 30.974,
    period: 3,
    group: 15,
    category: 'nonmetal',
    state: 'Solid',
    electronConfig: '[Ne] 3s² 3p³',
    shells: [2, 8, 5],
    valence: 3,
    oxidationStates: '-3, +3, +5',
    electronegativity: 2.19,
    atomicRadius: 110,
    boardNotes: 'Allotropes: White P (toxic, chemiluminescent tetrahedral P₄) and stable Red P (polymeric, used in safety match strikers).',
  },
  {
    z: 16,
    symbol: 'S',
    name: 'Sulfur',
    mass: 32.06,
    period: 3,
    group: 16,
    category: 'nonmetal',
    state: 'Solid',
    electronConfig: '[Ne] 3s² 3p⁴',
    shells: [2, 8, 6],
    valence: 2,
    oxidationStates: '-2, +4, +6',
    electronegativity: 2.58,
    atomicRadius: 103,
    boardNotes: 'Crown-shaped puckered S₈ octatomic rings; contact process produces H₂SO₄ ("King of Chemicals"); vulcanization of rubber.',
  },
  {
    z: 17,
    symbol: 'Cl',
    name: 'Chlorine',
    mass: 35.45,
    period: 3,
    group: 17,
    category: 'halogen',
    state: 'Gas',
    electronConfig: '[Ne] 3s² 3p⁵',
    shells: [2, 8, 7],
    valence: 1,
    oxidationStates: '-1, +1, +3, +5, +7',
    electronegativity: 3.16,
    atomicRadius: 99,
    boardNotes: 'Greenish-yellow suffocating gas; highest electron gain enthalpy (electron affinity) in periodic table; bleaching & disinfectant.',
  },
  {
    z: 18,
    symbol: 'Ar',
    name: 'Argon',
    mass: 39.948,
    period: 3,
    group: 18,
    category: 'noble-gas',
    state: 'Gas',
    electronConfig: '[Ne] 3s² 3p⁶',
    shells: [2, 8, 8],
    valence: 0,
    oxidationStates: '0',
    electronegativity: null,
    atomicRadius: 97,
    boardNotes: 'Most abundant noble gas in atmosphere (~0.93%); provides inert shielding atmosphere for electric arc welding and incandescent bulbs.',
  },

  // Period 4
  {
    z: 19,
    symbol: 'K',
    name: 'Potassium',
    mass: 39.098,
    period: 4,
    group: 1,
    category: 'alkali',
    state: 'Solid',
    electronConfig: '[Ar] 4s¹',
    shells: [2, 8, 8, 1],
    valence: 1,
    oxidationStates: '+1',
    electronegativity: 0.82,
    atomicRadius: 227,
    boardNotes: 'Highly electropositive alkali metal; burns with distinct lilac/violet flame test; biological intracellular ion pump.',
  },
  {
    z: 20,
    symbol: 'Ca',
    name: 'Calcium',
    mass: 40.078,
    period: 4,
    group: 2,
    category: 'alkaline-earth',
    state: 'Solid',
    electronConfig: '[Ar] 4s²',
    shells: [2, 8, 8, 2],
    valence: 2,
    oxidationStates: '+2',
    electronegativity: 1.0,
    atomicRadius: 197,
    boardNotes: 'Brick-red flame test; key constituent of limestone (CaCO₃), slaked lime Ca(OH)₂, and human skeletal bones/teeth.',
  },
  {
    z: 21,
    symbol: 'Sc',
    name: 'Scandium',
    mass: 44.956,
    period: 4,
    group: 3,
    category: 'transition',
    state: 'Solid',
    electronConfig: '[Ar] 3d¹ 4s²',
    shells: [2, 8, 9, 2],
    valence: 3,
    oxidationStates: '+3',
    electronegativity: 1.36,
    atomicRadius: 162,
    boardNotes: 'First 3d transition metal; Sc³⁺ has d⁰ empty configuration so its salts are diamagnetic and colorless.',
  },
  {
    z: 22,
    symbol: 'Ti',
    name: 'Titanium',
    mass: 47.867,
    period: 4,
    group: 4,
    category: 'transition',
    state: 'Solid',
    electronConfig: '[Ar] 3d² 4s²',
    shells: [2, 8, 10, 2],
    valence: 4,
    oxidationStates: '+2, +3, +4',
    electronegativity: 1.54,
    atomicRadius: 147,
    boardNotes: 'Highest strength-to-density ratio among metals; biocompatible; TiO₂ is universal white pigment in paint & sunscreen.',
  },
  {
    z: 23,
    symbol: 'V',
    name: 'Vanadium',
    mass: 50.942,
    period: 4,
    group: 5,
    category: 'transition',
    state: 'Solid',
    electronConfig: '[Ar] 3d³ 4s²',
    shells: [2, 8, 11, 2],
    valence: 5,
    oxidationStates: '+2, +3, +4, +5',
    electronegativity: 1.63,
    atomicRadius: 134,
    boardNotes: 'Exhibits colorful oxidation states: V²⁺ (violet), V³⁺ (green), VO²⁺ (blue), VO₂⁺ (yellow); V₂O₅ is industrial catalyst in Contact process.',
  },
  {
    z: 24,
    symbol: 'Cr',
    name: 'Chromium',
    mass: 51.996,
    period: 4,
    group: 6,
    category: 'transition',
    state: 'Solid',
    electronConfig: '[Ar] 3d⁵ 4s¹',
    shells: [2, 8, 13, 1],
    valence: 6,
    oxidationStates: '+2, +3, +6',
    electronegativity: 1.66,
    atomicRadius: 128,
    boardNotes: 'Anomalous electronic configuration (half-filled 3d⁵ 4s¹ stability); stainless steel alloy; K₂Cr₂O₇ is powerful primary oxidizing agent.',
  },
  {
    z: 25,
    symbol: 'Mn',
    name: 'Manganese',
    mass: 54.938,
    period: 4,
    group: 7,
    category: 'transition',
    state: 'Solid',
    electronConfig: '[Ar] 3d⁵ 4s²',
    shells: [2, 8, 13, 2],
    valence: 7,
    oxidationStates: '+2 to +7',
    electronegativity: 1.55,
    atomicRadius: 127,
    boardNotes: 'Highest number of oxidation states in 3d series; purple KMnO₄ self-indicating redox titrant (Mn⁺⁷ reduced to Mn²⁺ colorless in acid).',
  },
  {
    z: 26,
    symbol: 'Fe',
    name: 'Iron',
    mass: 55.845,
    period: 4,
    group: 8,
    category: 'transition',
    state: 'Solid',
    electronConfig: '[Ar] 3d⁶ 4s²',
    shells: [2, 8, 14, 2],
    valence: 2,
    oxidationStates: '+2 (ferrous), +3 (ferric)',
    electronegativity: 1.83,
    atomicRadius: 126,
    boardNotes: 'Ferromagnetic core of hemoglobin carrying O₂ in blood; Rust is hydrated ferric oxide Fe₂O₃·xH₂O formed via electrochemical corrosion.',
  },
  {
    z: 27,
    symbol: 'Co',
    name: 'Cobalt',
    mass: 58.933,
    period: 4,
    group: 9,
    category: 'transition',
    state: 'Solid',
    electronConfig: '[Ar] 3d⁷ 4s²',
    shells: [2, 8, 15, 2],
    valence: 2,
    oxidationStates: '+2, +3',
    electronegativity: 1.88,
    atomicRadius: 125,
    boardNotes: 'Crucial coordination center in Vitamin B12 (cyanocobalamin); CoCl₂ paper serves as chemical humidity test (blue anhydrous → pink hexahydrate).',
  },
  {
    z: 28,
    symbol: 'Ni',
    name: 'Nickel',
    mass: 58.693,
    period: 4,
    group: 10,
    category: 'transition',
    state: 'Solid',
    electronConfig: '[Ar] 3d⁸ 4s²',
    shells: [2, 8, 16, 2],
    valence: 2,
    oxidationStates: '+2',
    electronegativity: 1.91,
    atomicRadius: 124,
    boardNotes: 'Raney nickel catalyst in hydrogenation of unsaturated vegetable oils to margarine; Mond process for refining via Ni(CO)₄ gas.',
  },
  {
    z: 29,
    symbol: 'Cu',
    name: 'Copper',
    mass: 63.546,
    period: 4,
    group: 11,
    category: 'transition',
    state: 'Solid',
    electronConfig: '[Ar] 3d¹⁰ 4s¹',
    shells: [2, 8, 18, 1],
    valence: 2,
    oxidationStates: '+1 (cuprous), +2 (cupric)',
    electronegativity: 1.9,
    atomicRadius: 128,
    boardNotes: 'Anomalous fully filled d¹⁰ 4s¹ configuration; high electrical and thermal conductivity; blue vitriol CuSO₄·5H₂O.',
  },
  {
    z: 30,
    symbol: 'Zn',
    name: 'Zinc',
    mass: 65.38,
    period: 4,
    group: 12,
    category: 'transition',
    state: 'Solid',
    electronConfig: '[Ar] 3d¹⁰ 4s²',
    shells: [2, 8, 18, 2],
    valence: 2,
    oxidationStates: '+2',
    electronegativity: 1.65,
    atomicRadius: 134,
    boardNotes: 'Pseudotransition metal (d¹⁰ full in elemental & ionic states); galvanization sacrificial anode protection on steel; Daniell cell electrode.',
  },
  {
    z: 31,
    symbol: 'Ga',
    name: 'Gallium',
    mass: 69.723,
    period: 4,
    group: 13,
    category: 'post-transition',
    state: 'Solid',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p¹',
    shells: [2, 8, 18, 3],
    valence: 3,
    oxidationStates: '+3',
    electronegativity: 1.81,
    atomicRadius: 135,
    boardNotes: 'Predicted by Mendeleev as "Eka-aluminium"; low melting point (29.76°C) so it liquefies in human hand; GaAs used in high-speed optoelectronics.',
  },
  {
    z: 32,
    symbol: 'Ge',
    name: 'Germanium',
    mass: 72.63,
    period: 4,
    group: 14,
    category: 'metalloid',
    state: 'Solid',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p²',
    shells: [2, 8, 18, 4],
    valence: 4,
    oxidationStates: '+2, +4',
    electronegativity: 2.01,
    atomicRadius: 122,
    boardNotes: 'Predicted as "Eka-silicon" by Mendeleev; historical basis of first solid-state transistors; infrared optical lens component.',
  },
  {
    z: 33,
    symbol: 'As',
    name: 'Arsenic',
    mass: 74.922,
    period: 4,
    group: 15,
    category: 'metalloid',
    state: 'Solid',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p³',
    shells: [2, 8, 18, 5],
    valence: 3,
    oxidationStates: '-3, +3, +5',
    electronegativity: 2.18,
    atomicRadius: 120,
    boardNotes: 'Classic metalloid; Marsh test detects microgram poisoning; forms poisonous arsenite and arsenate compounds.',
  },
  {
    z: 34,
    symbol: 'Se',
    name: 'Selenium',
    mass: 78.971,
    period: 4,
    group: 16,
    category: 'nonmetal',
    state: 'Solid',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁴',
    shells: [2, 8, 18, 6],
    valence: 2,
    oxidationStates: '-2, +4, +6',
    electronegativity: 2.55,
    atomicRadius: 119,
    boardNotes: 'Photoconductive chalcogen; electrical conductivity increases 1000-fold upon light exposure; vital antioxidant cofactor.',
  },
  {
    z: 35,
    symbol: 'Br',
    name: 'Bromine',
    mass: 79.904,
    period: 4,
    group: 17,
    category: 'halogen',
    state: 'Liquid',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁵',
    shells: [2, 8, 18, 7],
    valence: 1,
    oxidationStates: '-1, +1, +5',
    electronegativity: 2.96,
    atomicRadius: 114,
    boardNotes: 'Only liquid nonmetallic element at standard temperature & pressure; deep reddish-brown volatile fuming liquid; bromine water test for unsaturation.',
  },
  {
    z: 36,
    symbol: 'Kr',
    name: 'Krypton',
    mass: 83.798,
    period: 4,
    group: 18,
    category: 'noble-gas',
    state: 'Gas',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁶',
    shells: [2, 8, 18, 8],
    valence: 0,
    oxidationStates: '0, +2',
    electronegativity: 3.0,
    atomicRadius: 110,
    boardNotes: 'Heavy noble gas; forms KrF₂ at cryogenic temperatures; historical definition of 1 meter was based on Kr-86 orange-red spectral emission line.',
  },

  // Heavy Core Benchmark Elements
  {
    z: 47,
    symbol: 'Ag',
    name: 'Silver',
    mass: 107.868,
    period: 5,
    group: 11,
    category: 'transition',
    state: 'Solid',
    electronConfig: '[Kr] 4d¹⁰ 5s¹',
    shells: [2, 8, 18, 18, 1],
    valence: 1,
    oxidationStates: '+1',
    electronegativity: 1.93,
    atomicRadius: 144,
    boardNotes: 'Highest electrical conductivity of all metals; Tollen’s reagent [Ag(NH₃)₂]⁺ gives silver mirror test for aldehydes.',
  },
  {
    z: 53,
    symbol: 'I',
    name: 'Iodine',
    mass: 126.904,
    period: 5,
    group: 17,
    category: 'halogen',
    state: 'Solid',
    electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁵',
    shells: [2, 8, 18, 18, 7],
    valence: 1,
    oxidationStates: '-1, +1, +5, +7',
    electronegativity: 2.66,
    atomicRadius: 133,
    boardNotes: 'Lustrous purple-black solid that sublimes directly into violet gas on gentle heating; starch-iodide test turns intense blue-black.',
  },
  {
    z: 79,
    symbol: 'Au',
    name: 'Gold',
    mass: 196.967,
    period: 6,
    group: 11,
    category: 'transition',
    state: 'Solid',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹',
    shells: [2, 8, 18, 32, 18, 1],
    valence: 1,
    oxidationStates: '+1, +3',
    electronegativity: 2.54,
    atomicRadius: 144,
    boardNotes: 'Most malleable and ductile noble metal; dissolves only in Aqua Regia (3:1 conc. HCl to conc. HNO₃) forming [AuCl₄]⁻.',
  },
  {
    z: 80,
    symbol: 'Hg',
    name: 'Mercury',
    mass: 200.592,
    period: 6,
    group: 12,
    category: 'transition',
    state: 'Liquid',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s²',
    shells: [2, 8, 18, 32, 18, 2],
    valence: 2,
    oxidationStates: '+1 (mercurous Hg₂²⁺), +2',
    electronegativity: 2.0,
    atomicRadius: 151,
    boardNotes: 'Only liquid metal at room temperature; forms metal amalgams; dense liquid (13.6 g/cm³) utilized in barometers and manometers.',
  },
  {
    z: 82,
    symbol: 'Pb',
    name: 'Lead',
    mass: 207.2,
    period: 6,
    group: 14,
    category: 'post-transition',
    state: 'Solid',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²',
    shells: [2, 8, 18, 32, 18, 4],
    valence: 2,
    oxidationStates: '+2 (inert pair effect), +4',
    electronegativity: 2.33,
    atomicRadius: 175,
    boardNotes: 'Inert pair effect stabilizes Pb²⁺ over Pb⁴⁺; end decay product of uranium and thorium radioactive series; radiation shielding.',
  },
];

const CATEGORY_STYLES: Record<ElementCategory, { label: string; bg: string; text: string; border: string; glow: string }> = {
  alkali: {
    label: 'Alkali Metals',
    bg: 'bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    glow: 'rgba(244, 63, 94, 0.4)',
  },
  'alkaline-earth': {
    label: 'Alkaline Earth',
    bg: 'bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  transition: {
    label: 'Transition Metals',
    bg: 'bg-blue-500/15',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  'post-transition': {
    label: 'Basic Metals',
    bg: 'bg-teal-500/15',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/30',
    glow: 'rgba(20, 184, 166, 0.4)',
  },
  metalloid: {
    label: 'Metalloids',
    bg: 'bg-purple-500/15',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/30',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
  nonmetal: {
    label: 'Reactive Nonmetals',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  halogen: {
    label: 'Halogens',
    bg: 'bg-orange-500/15',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/30',
    glow: 'rgba(249, 115, 22, 0.4)',
  },
  'noble-gas': {
    label: 'Noble Gases',
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    glow: 'rgba(99, 102, 241, 0.4)',
  },
};

export const ChemistryAtomicChart: React.FC = () => {
  const [selectedZ, setSelectedZ] = useState<number>(11); // Default to Sodium (Na)
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedInfo, setCopiedInfo] = useState(false);

  // Filtered elements
  const filteredElements = useMemo(() => {
    return ELEMENTS_DATA.filter((elem) => {
      const matchCat = filterCategory === 'all' || elem.category === filterCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        elem.symbol.toLowerCase().includes(q) ||
        elem.name.toLowerCase().includes(q) ||
        elem.z.toString() === q ||
        elem.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [filterCategory, searchQuery]);

  // Currently active selected element
  const activeElement = useMemo(() => {
    return ELEMENTS_DATA.find((e) => e.z === selectedZ) || ELEMENTS_DATA[0];
  }, [selectedZ]);

  const activeCategoryMeta = CATEGORY_STYLES[activeElement.category];

  const handleCopyElementDetails = () => {
    const text = `${activeElement.name} (${activeElement.symbol}) [Z=${activeElement.z}, A=${activeElement.mass} u]\nElectron Config: ${activeElement.electronConfig}\nShells: ${activeElement.shells.join(', ')}\nElectronegativity: ${activeElement.electronegativity || 'N/A'}\nValence: ${activeElement.valence}\nNotes: ${activeElement.boardNotes}`;
    navigator.clipboard.writeText(text);
    setCopiedInfo(true);
    setTimeout(() => setCopiedInfo(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-6">
      {/* 1. Header with Badge & Live Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
              <Atom className="w-4 h-4 animate-spin-slow" />
            </div>
            <h2 className="text-lg sm:text-xl font-normal text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
              <span>Chemistry Atomic Chart &amp; Periodic Classification</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80">
                Interactive Bohr &bull; Z=1 to 82
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-white mt-1">
            Explore atomic numbers ($Z$), relative atomic masses ($A$), electronic configurations, Bohr orbit electron shells, and periodic trends.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Symbol (Na), Name (Iron), or Z (11)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#132036] border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
          />
        </div>
      </div>

      {/* 2. Category Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white hover:bg-slate-200'
          }`}
        >
          All Elements ({ELEMENTS_DATA.length})
        </button>
        {Object.entries(CATEGORY_STYLES).map(([key, style]) => {
          const isSelected = filterCategory === key;
          const count = ELEMENTS_DATA.filter((e) => e.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterCategory(isSelected ? 'all' : key)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                isSelected
                  ? `${style.bg} ${style.text} ${style.border} ring-2 ring-current`
                  : 'bg-slate-50 dark:bg-[#132036] text-slate-600 dark:text-white border-slate-200 dark:border-slate-700/80 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: style.glow }} />
              <span>{style.label}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Split View: Periodic Table Grid (Left) + Element Bohr Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Atomic Elements Grid (Periods 1 - 4 + Benchmark Elements) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white px-1">
            <span className="flex items-center gap-1 font-semibold">
              <Layers className="w-3.5 h-3.5 text-[#00A896]" />
              <span>Interactive Atomic Chart Grid</span>
            </span>
            <span className="text-[11px] text-slate-400 dark:text-white">
              Showing {filteredElements.length} elements &bull; Click to inspect
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#111C2E] border border-slate-200/90 dark:border-slate-800/80">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-2">
              {filteredElements.map((elem) => {
                const style = CATEGORY_STYLES[elem.category];
                const isSelected = selectedZ === elem.z;
                return (
                  <button
                    key={`elem-${elem.z}`}
                    onClick={() => setSelectedZ(elem.z)}
                    className={`relative p-2 rounded-xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                      isSelected
                        ? 'ring-2 ring-[#00A896] bg-white dark:bg-[#1A2D4A] shadow-md scale-105 z-10'
                        : `${style.bg} ${style.border} hover:scale-102 hover:shadow-xs`
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono leading-none">
                      <span className="font-extrabold text-slate-500 dark:text-white/80">{elem.z}</span>
                      <span className="text-[8px] text-slate-400 dark:text-white/60">{elem.period}P</span>
                    </div>

                    <div className="my-1 text-center">
                      <span className={`text-base sm:text-lg font-black tracking-tight ${style.text}`}>
                        {elem.symbol}
                      </span>
                    </div>

                    <div className="text-center truncate">
                      <span className="text-[9px] font-medium text-slate-700 dark:text-white block truncate leading-tight">
                        {elem.name}
                      </span>
                      <span className="text-[8px] font-mono text-slate-400 dark:text-white/60 block leading-tight">
                        {elem.mass.toFixed(2)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Periodic Trends Quick Cheat-Sheet */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                <TrendingUp className="w-3.5 h-3.5 text-[#00A896]" />
                <span>Atomic Radius (pm)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-white">
                Decreases across a period ($\leftarrow$), increases down a group ($\downarrow$).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Electronegativity</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-white">
                Increases across a period ($\rightarrow$), decreases down a group ($\uparrow$). F is max (3.98).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>Ionization Enthalpy</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-white">
                Energy to remove outer valence electron. Highest in noble gases (He max).
              </p>
            </div>
          </div>
        </div>

        {/* Right: Active Element Inspector & Bohr Planetary Model */}
        <div className="lg:col-span-5 xl:col-span-4 bg-slate-50 dark:bg-[#111C2E] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
          {/* Header of Active Element */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border shadow-xs ${activeCategoryMeta.bg} ${activeCategoryMeta.border}`}
              >
                <span className="text-[10px] font-mono text-slate-500 dark:text-white/80">{activeElement.z}</span>
                <span className={`text-2xl font-black leading-none ${activeCategoryMeta.text}`}>
                  {activeElement.symbol}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{activeElement.name}</span>
                </h3>
                <span className="text-[11px] font-medium text-slate-500 dark:text-white">
                  Atomic Weight: {activeElement.mass} u &bull; {activeElement.state}
                </span>
                <div className="mt-1">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${activeCategoryMeta.bg} ${activeCategoryMeta.text}`}
                  >
                    {activeCategoryMeta.label}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyElementDetails}
              className="p-1.5 rounded-lg bg-white dark:bg-[#182740] hover:bg-slate-100 dark:hover:bg-[#203456] text-slate-500 dark:text-white border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
              title="Copy element data"
            >
              {copiedInfo ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Dynamic SVG Bohr Atomic Orbit Visualization */}
          <div className="bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 absolute top-2 left-3">
              Bohr Orbit Planetary Model
            </span>
            <span className="text-[10px] font-mono text-emerald-400 absolute top-2 right-3">
              Shells: {activeElement.shells.join(' : ')}
            </span>

            <svg viewBox="0 0 240 180" className="w-full max-w-[240px] h-36 select-none my-1">
              {/* Electron Orbit Shells */}
              {activeElement.shells.map((count, sIdx) => {
                const radius = 26 + sIdx * 18;
                return (
                  <g key={`shell-orbit-${sIdx}`}>
                    <circle
                      cx="120"
                      cy="90"
                      r={radius}
                      fill="none"
                      stroke="#334155"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    {/* Render electrons symmetrically along the orbit */}
                    {Array.from({ length: Math.min(count, 12) }).map((_, eIdx) => {
                      const angle = (2 * Math.PI * eIdx) / Math.min(count, 12);
                      const ex = 120 + radius * Math.cos(angle);
                      const ey = 90 + radius * Math.sin(angle);
                      const isValence = sIdx === activeElement.shells.length - 1;
                      return (
                        <circle
                          key={`electron-${sIdx}-${eIdx}`}
                          cx={ex}
                          cy={ey}
                          r={isValence ? 3.5 : 2.5}
                          fill={isValence ? '#FBBF24' : '#38BDF8'}
                          stroke={isValence ? '#FFFFFF' : 'none'}
                          strokeWidth="0.8"
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* Central Nucleus with Protons and Neutrons */}
              <circle cx="120" cy="90" r="16" fill="#EF4444" opacity="0.9" />
              <text x="120" y="87" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">
                {activeElement.z} p⁺
              </text>
              <text x="120" y="97" fill="#FEE2E2" fontSize="7" textAnchor="middle">
                {Math.round(activeElement.mass - activeElement.z)} n⁰
              </text>
            </svg>

            <div className="flex items-center justify-between w-full pt-1 border-t border-slate-800 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Core: {activeElement.shells.slice(0, -1).reduce((a, b) => a + b, 0)}e⁻</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-bold text-amber-300">Valence: {activeElement.valence}e⁻</span>
              </span>
            </div>
          </div>

          {/* Subatomic Particles & Electronic Constants Table */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-white dark:bg-[#182740] border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] text-slate-400 dark:text-white/70 block">Protons (p⁺)</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">{activeElement.z}</span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#182740] border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] text-slate-400 dark:text-white/70 block">Neutrons (n⁰)</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm">
                {Math.round(activeElement.mass - activeElement.z)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#182740] border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] text-slate-400 dark:text-white/70 block">Electrons (e⁻)</span>
              <span className="font-bold text-sky-600 dark:text-sky-400 text-sm">{activeElement.z}</span>
            </div>
          </div>

          {/* In-Depth Atomic Properties */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#182740] border border-slate-200/60 dark:border-slate-700/70">
              <span className="text-slate-500 dark:text-white/80">Electronic Configuration:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {activeElement.electronConfig}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#182740] border border-slate-200/60 dark:border-slate-700/70">
              <span className="text-slate-500 dark:text-white/80">Common Oxidation States:</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {activeElement.oxidationStates}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-white dark:bg-[#182740] border border-slate-200/60 dark:border-slate-700/70">
                <span className="text-[10px] text-slate-400 dark:text-white/70 block">Electronegativity</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeElement.electronegativity !== null ? `${activeElement.electronegativity} Pauling` : 'Noble (None)'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#182740] border border-slate-200/60 dark:border-slate-700/70">
                <span className="text-[10px] text-slate-400 dark:text-white/70 block">Atomic Radius</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeElement.atomicRadius} pm
                </span>
              </div>
            </div>
          </div>

          {/* Board Exam Academic Note */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300 text-[11px]">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>Board Exam &amp; Laboratory Note:</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-white leading-relaxed">
              {activeElement.boardNotes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
