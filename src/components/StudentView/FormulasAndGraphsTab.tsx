import React, { useState } from 'react';
import {
  Binary,
  Cpu,
  Atom,
  Clock,
  Zap,
  Compass,
  Search,
  BookOpen,
  Filter,
  CheckCircle,
  Share2,
  Copy,
  ChevronRight,
  Maximize2,
  Download,
  Info,
  Sparkles,
} from 'lucide-react';

export type SubjectCategory = 'Mathematics' | 'Physics' | 'Chemistry' | 'History & Civics' | 'Biology';

export interface FormulaItem {
  id: string;
  name: string;
  latex?: string;
  expression: string;
  category: SubjectCategory;
  gradeLevels: number[];
  governingBoards: string[]; // CBSE, ICSE, IB, IGCSE, State
  topic: string;
  description: string;
  variables: { symbol: string; meaning: string; units?: string }[];
  exampleProblem?: string;
  keyTakeaway: string;
}

export interface DiagramModel {
  id: string;
  title: string;
  category: SubjectCategory;
  gradeLevels: number[];
  governingBoards: string[];
  topic: string;
  diagramType: 'Circuit' | 'Atomic' | 'Graph / Function' | 'Timeline / Flowchart' | 'Ray Optics';
  description: string;
  svgVisual: React.ReactNode;
  labels: { text: string; detail: string }[];
}

export const FORMULA_DATABASE: FormulaItem[] = [
  // MATHEMATICS
  {
    id: 'f-math-1',
    name: 'Quadratic Formula & Discriminant',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    expression: 'x = (-b ± √(b² - 4ac)) / (2a)',
    category: 'Mathematics',
    gradeLevels: [9, 10, 11],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: 'Quadratic Equations & Polynomials',
    description: 'Calculates the real or complex roots of any second-order polynomial equation ax² + bx + c = 0.',
    variables: [
      { symbol: 'a, b, c', meaning: 'Coefficients where a ≠ 0' },
      { symbol: 'Δ = b² - 4ac', meaning: 'Discriminant: Δ>0 (2 real), Δ=0 (1 repeated), Δ<0 (complex)' },
      { symbol: 'x', meaning: 'Roots (zeros) of the quadratic curve' },
    ],
    exampleProblem: 'For 2x² - 4x - 6 = 0: a=2, b=-4, c=-6. Δ = 16 - 4(2)(-6) = 64. x = (4 ± 8)/4 ⇒ x = 3 or x = -1.',
    keyTakeaway: 'The vertex x-coordinate always sits on the axis of symmetry: x = -b / (2a).',
  },
  {
    id: 'f-math-2',
    name: 'Pythagorean Theorem & Distance in ℝ²',
    latex: 'c^2 = a^2 + b^2 \\quad \\Longleftrightarrow \\quad d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
    expression: 'c² = a² + b² | d = √((x₂ - x₁)² + (y₂ - y₁)²) ',
    category: 'Mathematics',
    gradeLevels: [6, 7, 8, 9, 10],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: 'Coordinate Geometry & Trigonometry',
    description: 'Calculates hypotenuse length in right triangles and Euclidean distance between any two Cartesian coordinates.',
    variables: [
      { symbol: 'a, b', meaning: 'Leg lengths of right triangle' },
      { symbol: 'c', meaning: 'Hypotenuse opposite the 90° angle' },
      { symbol: '(x₁, y₁), (x₂, y₂)', meaning: 'Endpoints on Cartesian plane' },
    ],
    exampleProblem: 'Distance between (1, 2) and (4, 6) = √((4-1)² + (6-2)²) = √(9 + 16) = √25 = 5 units.',
    keyTakeaway: 'Foundation for trigonometric identity sin²θ + cos²θ = 1.',
  },
  {
    id: 'f-math-3',
    name: 'Arithmetic Progression (nth Term & Sum)',
    latex: 'a_n = a + (n - 1)d, \\quad S_n = \\frac{n}{2}[2a + (n - 1)d]',
    expression: 'aₙ = a + (n - 1)d | Sₙ = (n/2)[2a + (n - 1)d]',
    category: 'Mathematics',
    gradeLevels: [10, 11],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: 'Sequences & Series',
    description: 'Calculates any term and total cumulative sum of an arithmetic sequence with uniform common difference.',
    variables: [
      { symbol: 'a', meaning: 'First term of sequence' },
      { symbol: 'd', meaning: 'Common difference (aₙ - aₙ₋₁)' },
      { symbol: 'n', meaning: 'Total number of terms' },
      { symbol: 'Sₙ', meaning: 'Sum of first n terms' },
    ],
    exampleProblem: 'For AP: 3, 7, 11... Find 10th term: a₁₀ = 3 + (10 - 1)4 = 39. S₁₀ = (10/2)[2(3) + 9(4)] = 5 * 42 = 210.',
    keyTakeaway: 'The sum can also be written as Sₙ = (n/2)(first_term + last_term).',
  },
  {
    id: 'f-math-4',
    name: 'Calculus: First Derivative Power Rule',
    latex: '\\frac{d}{dx}[x^n] = n \\cdot x^{n - 1}',
    expression: 'd/dx [xⁿ] = n · xⁿ⁻¹',
    category: 'Mathematics',
    gradeLevels: [11, 12],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE'],
    topic: 'Differential Calculus',
    description: 'Fundamental derivative rule for calculating instantaneous rate of change or tangent gradient for polynomial powers.',
    variables: [
      { symbol: 'n', meaning: 'Real number power exponent' },
      { symbol: 'd/dx', meaning: 'Differential operator with respect to x' },
    ],
    exampleProblem: 'd/dx [5x³ - 2x² + 7] = 15x² - 4x + 0.',
    keyTakeaway: 'Stationary points occurs where d/dx [f(x)] = 0 (critical points for local extrema).',
  },

  // PHYSICS
  {
    id: 'f-phys-1',
    name: "Newton's Second Law of Motion",
    latex: '\\vec{F}_{net} = m \\cdot \\vec{a} = \\frac{d\\vec{p}}{dt}',
    expression: 'F_net = m · a = Δp / Δt',
    category: 'Physics',
    gradeLevels: [8, 9, 10, 11],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: 'Classical Mechanics & Dynamics',
    description: 'Net external force acting on a body equals the rate of change of linear momentum, simplifying to mass × acceleration for constant mass.',
    variables: [
      { symbol: 'F_net', meaning: 'Net applied vector force', units: 'Newtons (N = kg·m/s²)' },
      { symbol: 'm', meaning: 'Inertial mass', units: 'Kilograms (kg)' },
      { symbol: 'a', meaning: 'Acceleration', units: 'm/s²' },
      { symbol: 'p', meaning: 'Linear momentum (m·v)', units: 'kg·m/s' },
    ],
    exampleProblem: 'A 1200 kg car accelerates from 0 to 20 m/s in 5s. a = 4 m/s². F = 1200 × 4 = 4800 N.',
    keyTakeaway: 'Acceleration is directly proportional to net force and inversely proportional to inertial mass.',
  },
  {
    id: 'f-phys-2',
    name: "Ohm's Law & Electrical Joule Dissipation",
    latex: 'V = I \\cdot R, \\quad P = V \\cdot I = I^2 \\cdot R = \\frac{V^2}{R}',
    expression: 'V = I · R | P = I² · R = V²/R',
    category: 'Physics',
    gradeLevels: [7, 8, 9, 10, 12],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: 'Electricity & DC Circuits',
    description: 'Direct current proportionality through an ohmic conductor under constant temperature, and Joule heat power dissipation.',
    variables: [
      { symbol: 'V', meaning: 'Potential difference (Voltage)', units: 'Volts (V)' },
      { symbol: 'I', meaning: 'Current flow', units: 'Amperes (A)' },
      { symbol: 'R', meaning: 'Resistance', units: 'Ohms (Ω)' },
      { symbol: 'P', meaning: 'Power dissipated', units: 'Watts (W = J/s)' },
    ],
    exampleProblem: 'A 12V automotive bulb draws 2A. Resistance R = 12/2 = 6Ω. Power P = 12 × 2 = 24W.',
    keyTakeaway: 'In series circuits current is constant (I); in parallel circuits voltage drop is constant (V).',
  },
  {
    id: 'f-phys-3',
    name: 'Kinematic Equations (Uniform Acceleration)',
    latex: 'v = u + at, \\quad s = ut + \\frac{1}{2}at^2, \\quad v^2 = u^2 + 2as',
    expression: 'v = u + at | s = ut + ½at² | v² = u² + 2as',
    category: 'Physics',
    gradeLevels: [9, 10, 11],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: '1D & 2D Kinematics',
    description: 'The standard three SUVAT equations connecting displacement, initial/final velocities, uniform acceleration, and time.',
    variables: [
      { symbol: 'u', meaning: 'Initial velocity', units: 'm/s' },
      { symbol: 'v', meaning: 'Final velocity', units: 'm/s' },
      { symbol: 'a', meaning: 'Constant acceleration', units: 'm/s²' },
      { symbol: 't', meaning: 'Elapsed time', units: 'seconds (s)' },
      { symbol: 's', meaning: 'Net displacement', units: 'meters (m)' },
    ],
    exampleProblem: 'Ball dropped from rest (u=0, a=9.8 m/s²) falls for 3s. Height s = 0 + 0.5(9.8)(9) = 44.1 m.',
    keyTakeaway: 'Only valid when acceleration "a" is strictly constant throughout the motion.',
  },
  {
    id: 'f-phys-4',
    name: "Snell's Law of Refraction & Critical Angle",
    latex: 'n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2), \\quad \\sin(\\theta_c) = \\frac{n_2}{n_1}',
    expression: 'n₁ sin(θ₁) = n₂ sin(θ₂) | sin(θ_c) = n₂/n₁ (when n₁ > n₂)',
    category: 'Physics',
    gradeLevels: [10, 12],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE'],
    topic: 'Wave Optics & Ray Geometrical Optics',
    description: 'Describes the bending of light rays across a boundary separating media of differing refractive indices.',
    variables: [
      { symbol: 'n₁, n₂', meaning: 'Refractive indices of medium 1 and 2' },
      { symbol: 'θ₁', meaning: 'Angle of incidence from normal' },
      { symbol: 'θ₂', meaning: 'Angle of refraction' },
      { symbol: 'θ_c', meaning: 'Critical angle for Total Internal Reflection (TIR)' },
    ],
    exampleProblem: 'Light enters water (n₂=1.33) from air (n₁=1.0) at 30°: sin(θ₂) = (1.0 * sin 30°) / 1.33 = 0.376 ⇒ θ₂ ≈ 22.1°.',
    keyTakeaway: 'Total Internal Reflection occurs only when traveling from denser to rarer media at θ > θ_c.',
  },

  // CHEMISTRY
  {
    id: 'f-chem-1',
    name: 'Ideal Gas Law & Universal Gas Constant',
    latex: 'P \\cdot V = n \\cdot R \\cdot T',
    expression: 'P · V = n · R · T',
    category: 'Chemistry',
    gradeLevels: [9, 10, 11],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: 'States of Matter & Gas Laws',
    description: 'Relates pressure, volume, quantity, and thermodynamic temperature for ideal gas particles with zero intermolecular attraction.',
    variables: [
      { symbol: 'P', meaning: 'Pressure', units: 'Atmospheres (atm) or Pascals (Pa)' },
      { symbol: 'V', meaning: 'Volume', units: 'Liters (L) or m³' },
      { symbol: 'n', meaning: 'Amount of substance', units: 'Moles (mol)' },
      { symbol: 'R', meaning: 'Gas constant', units: '0.0821 L·atm/(mol·K) or 8.314 J/(mol·K)' },
      { symbol: 'T', meaning: 'Absolute temperature', units: 'Kelvin (K = °C + 273.15)' },
    ],
    exampleProblem: '1 mol of gas at STP (0°C = 273.15 K, 1 atm): V = (1 × 0.0821 × 273.15) / 1 = 22.4 Liters.',
    keyTakeaway: 'Molar volume of any ideal gas at standard STP is universally 22.4 L/mol.',
  },
  {
    id: 'f-chem-2',
    name: 'Molarity & Solution Concentration',
    latex: 'M = \\frac{\\text{moles of solute}}{\\text{Volume of solution in Liters}} = \\frac{w_B \\times 1000}{M_B \\times V_{(mL)}}',
    expression: 'Molarity (M) = moles solute / Volume (L)',
    category: 'Chemistry',
    gradeLevels: [9, 10, 11, 12],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: 'Solutions & Stoichiometry',
    description: 'Measures concentration of solute dissolved per unit volume of solution.',
    variables: [
      { symbol: 'M', meaning: 'Molarity', units: 'mol/L or M' },
      { symbol: 'w_B', meaning: 'Mass of solute', units: 'grams (g)' },
      { symbol: 'M_B', meaning: 'Molar mass of solute', units: 'g/mol' },
      { symbol: 'V', meaning: 'Solution volume', units: 'mL or L' },
    ],
    exampleProblem: 'Dissolving 4g of NaOH (M=40 g/mol) in 250 mL water: moles = 0.1 mol. Molarity = 0.1 / 0.25 L = 0.4 M.',
    keyTakeaway: 'For dilutions use M₁V₁ = M₂V₂.',
  },
  {
    id: 'f-chem-3',
    name: 'pH Scale & Hydrogen Ion Concentration',
    latex: '\\text{pH} = -\\log_{10}[H^+] = -\\log_{10}[H_3O^+], \\quad \\text{pH} + \\text{pOH} = 14',
    expression: 'pH = -log₁₀[H⁺] | pH + pOH = 14 (at 25°C)',
    category: 'Chemistry',
    gradeLevels: [8, 9, 10, 11],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: 'Acids, Bases & Salts',
    description: 'Logarithmic quantification of acidity and basicity in aqueous solutions based on hydronium ion activity.',
    variables: [
      { symbol: '[H⁺]', meaning: 'Hydronium ion concentration', units: 'mol/L' },
      { symbol: 'pH < 7', meaning: 'Acidic solution' },
      { symbol: 'pH = 7', meaning: 'Neutral water (at 298 K)' },
      { symbol: 'pH > 7', meaning: 'Basic / Alkaline solution' },
    ],
    exampleProblem: 'Solution with [H⁺] = 1 × 10⁻⁴ M: pH = -log(10⁻⁴) = 4. Solution is moderately acidic.',
    keyTakeaway: 'Each whole step on pH scale represents a 10-fold change in acidity.',
  },

  // HISTORY & CIVICS
  {
    id: 'f-hist-1',
    name: 'Preamble Constitutional Pillars (Sovereign, Socialist, Secular, Democratic, Republic)',
    latex: '\\text{Constitution} = \\text{Justice} + \\text{Liberty} + \\text{Equality} + \\text{Fraternity}',
    expression: 'Core Values: Sovereign · Socialist · Secular · Democratic · Republic',
    category: 'History & Civics',
    gradeLevels: [8, 9, 10],
    governingBoards: ['CBSE', 'ICSE', 'State Boards'],
    topic: 'Indian Constitution & Democratic Polity',
    description: 'Foundational framework of the Constitution of India outlining fundamental rights, separation of powers, and civic duties.',
    variables: [
      { symbol: 'Part III', meaning: 'Fundamental Rights (Articles 12-35)' },
      { symbol: 'Part IV', meaning: 'Directive Principles of State Policy (Articles 36-51)' },
      { symbol: 'Article 32', meaning: 'Right to Constitutional Remedies (Heart & Soul of Constitution)' },
    ],
    exampleProblem: 'Question: Which article empowers Supreme Court writs? Answer: Article 32 (Habeas Corpus, Mandamus, Quo Warranto, Certiorari, Prohibition).',
    keyTakeaway: 'The Indian Constitution is the longest written national charter in modern global history.',
  },
  {
    id: 'f-hist-2',
    name: 'Separation of Powers Triad (Legislature, Executive, Judiciary)',
    latex: '\\text{Governance} = \\text{Legislature (Parliament)} \\;\\longleftrightarrow\\; \\text{Executive} \\;\\longleftrightarrow\\; \\text{Judiciary (Courts)}',
    expression: 'Checks & Balances: Legislature ↔ Executive ↔ Independent Judiciary',
    category: 'History & Civics',
    gradeLevels: [7, 8, 9, 10],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: 'Parliamentary Democracy & Governance',
    description: 'Montesquieu separation of powers doctrine ensuring no single organ exercises unchecked sovereign authority.',
    variables: [
      { symbol: 'Lok Sabha', meaning: 'House of the People (Lower House, directly elected)' },
      { symbol: 'Rajya Sabha', meaning: 'Council of States (Upper House, federal representation)' },
      { symbol: 'Judicial Review', meaning: 'Power to strike down unconstitutional legislation' },
    ],
    exampleProblem: 'Question: What ensures judiciary independence? Answer: Fixed tenure, consolidated salaries, complex impeachment process.',
    keyTakeaway: 'In parliamentary system, Executive is drawn directly from and accountable to the Legislature.',
  },

  // BIOLOGY
  {
    id: 'f-bio-1',
    name: 'Photosynthesis Overall Chemical Stoichiometry',
    latex: '6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow[\\text{Chlorophyll}]{\\text{Light}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2',
    expression: '6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂',
    category: 'Biology',
    gradeLevels: [6, 7, 8, 9, 10, 11],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: 'Life Processes & Plant Physiology',
    description: 'Endothermic biochemical conversion of atmospheric CO₂ and soil water into glucose carbohydrate and oxygen gas.',
    variables: [
      { symbol: 'CO₂', meaning: 'Enters leaves through stomatal guard cells' },
      { symbol: 'H₂O', meaning: 'Absorbed by xylem roots via transpiration pull' },
      { symbol: 'C₆H₁₂O₆', meaning: 'Stored as starch or converted to sucrose' },
      { symbol: 'O₂', meaning: 'Byproduct released into atmosphere' },
    ],
    exampleProblem: 'Where do light reactions take place? In the thylakoid membranes of chloroplasts; Calvin cycle in stroma.',
    keyTakeaway: 'Photosynthesis is the fundamental energy engine supporting virtually all planetary terrestrial and marine food chains.',
  },
];

export const DIAGRAM_DATABASE: DiagramModel[] = [
  // 1. DC CIRCUIT MODEL
  {
    id: 'd-circ-1',
    title: 'DC Series-Parallel Resistor Circuit Model',
    category: 'Physics',
    gradeLevels: [8, 9, 10, 12],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: 'Current Electricity & Circuit Laws',
    diagramType: 'Circuit',
    description: 'A schematic showing DC source V, key switch, ammeter in series, voltmeter in parallel, and dual resistors with current distribution.',
    labels: [
      { text: 'DC Battery Source (12V)', detail: 'Direct current potential supplying charge' },
      { text: 'Resistors R₁ (4Ω) & R₂ (6Ω)', detail: 'Current I splits inversely across parallel branches' },
      { text: 'Ammeter (A)', detail: 'Low internal resistance; connected strictly in series' },
      { text: 'Voltmeter (V)', detail: 'High internal resistance; connected strictly across nodes' },
    ],
    svgVisual: (
      <svg viewBox="0 0 460 260" className="w-full h-auto max-h-64 mx-auto select-none">
        <rect width="460" height="260" fill="#0B132B" rx="16" />
        {/* Wire Loop */}
        <path d="M 60 80 H 400 V 200 H 60 Z" fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
        {/* Battery */}
        <g transform="translate(60, 140)">
          <line x1="0" y1="-20" x2="0" y2="20" stroke="#F87171" strokeWidth="5" />
          <line x1="12" y1="-12" x2="12" y2="12" stroke="#60A5FA" strokeWidth="3" />
          <text x="-24" y="-5" fill="#F87171" fontSize="12" fontWeight="bold">+ 12V</text>
        </g>
        {/* Key Switch */}
        <g transform="translate(180, 80)">
          <circle cx="-15" cy="0" r="4" fill="#FBBF24" />
          <circle cx="15" cy="0" r="4" fill="#FBBF24" />
          <line x1="-15" y1="0" x2="10" y2="-12" stroke="#FBBF24" strokeWidth="3" />
          <text x="-12" y="-18" fill="#FBBF24" fontSize="10" fontWeight="bold">Key (Closed)</text>
        </g>
        {/* Ammeter */}
        <g transform="translate(290, 80)">
          <circle cx="0" cy="0" r="16" fill="#1E293B" stroke="#34D399" strokeWidth="2.5" />
          <text x="-5" y="4" fill="#34D399" fontSize="13" fontWeight="bold">A</text>
          <text x="-18" y="30" fill="#94A3B8" fontSize="9">Series</text>
        </g>
        {/* Resistor R1 (Zigzag) */}
        <g transform="translate(400, 140)">
          <rect x="-8" y="-30" width="16" height="60" fill="#1E293B" stroke="#A78BFA" strokeWidth="2.5" rx="3" />
          <text x="14" y="5" fill="#A78BFA" fontSize="11" fontWeight="bold">R₁ = 6Ω</text>
        </g>
        {/* Parallel Voltmeter branch */}
        <path d="M 360 100 H 340 V 180 H 360" fill="none" stroke="#F472B6" strokeWidth="2" strokeDasharray="4 3" />
        <g transform="translate(340, 140)">
          <circle cx="0" cy="0" r="14" fill="#1E293B" stroke="#F472B6" strokeWidth="2" />
          <text x="-4" y="4" fill="#F472B6" fontSize="12" fontWeight="bold">V</text>
          <text x="-35" y="4" fill="#F472B6" fontSize="9">Parallel</text>
        </g>
        {/* Current Arrows */}
        <polygon points="120,77 130,80 120,83" fill="#38BDF8" />
        <text x="110" y="70" fill="#38BDF8" fontSize="10" fontWeight="bold">I →</text>
        <polygon points="400,165 403,175 397,175" fill="#38BDF8" />
        {/* Bottom ground label */}
        <text x="200" y="225" fill="#64748B" fontSize="11" textAnchor="middle">Complete Ohmic DC Circuit with Series Ammeter & Shunt Voltmeter</text>
      </svg>
    ),
  },

  // 2. ATOMIC BOHR STRUCTURE
  {
    id: 'd-atom-1',
    title: 'Bohr Atomic Model of Sodium (Na, Z=11)',
    category: 'Chemistry',
    gradeLevels: [8, 9, 10, 11],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: 'Structure of the Atom & Electronic Configuration',
    diagramType: 'Atomic',
    description: 'Detailed planetary Bohr model showing central nucleus with 11 protons and 12 neutrons, surrounded by K (2), L (8), and valence M (1) energy shells.',
    labels: [
      { text: 'Nucleus (11p⁺, 12n⁰)', detail: 'Contains >99.9% of atomic mass; positive net charge' },
      { text: 'K-Shell (n=1, 2e⁻)', detail: 'Innermost lowest energy level (max capacity 2)' },
      { text: 'L-Shell (n=2, 8e⁻)', detail: 'Stable octet noble gas core configuration (max capacity 8)' },
      { text: 'Valence M-Shell (n=3, 1e⁻)', detail: 'Readily lost to form stable Na⁺ cation' },
    ],
    svgVisual: (
      <svg viewBox="0 0 460 260" className="w-full h-auto max-h-64 mx-auto select-none">
        <rect width="460" height="260" fill="#0B132B" rx="16" />
        {/* Orbits */}
        <circle cx="230" cy="130" r="35" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="230" cy="130" r="65" fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="230" cy="130" r="100" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Central Nucleus */}
        <circle cx="230" cy="130" r="18" fill="#EF4444" opacity="0.9" />
        <text x="230" y="127" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">11 p⁺</text>
        <text x="230" y="138" fill="#FEE2E2" fontSize="8" textAnchor="middle">12 n⁰</text>

        {/* K-Shell electrons (2) */}
        <circle cx="230" cy="95" r="4.5" fill="#60A5FA" />
        <circle cx="230" cy="165" r="4.5" fill="#60A5FA" />
        <text x="260" y="100" fill="#93C5FD" fontSize="9">K (2e⁻)</text>

        {/* L-Shell electrons (8) */}
        <circle cx="230" cy="65" r="4.5" fill="#34D399" />
        <circle cx="230" cy="195" r="4.5" fill="#34D399" />
        <circle cx="165" cy="130" r="4.5" fill="#34D399" />
        <circle cx="295" cy="130" r="4.5" fill="#34D399" />
        <circle cx="184" cy="84" r="4.5" fill="#34D399" />
        <circle cx="276" cy="84" r="4.5" fill="#34D399" />
        <circle cx="184" cy="176" r="4.5" fill="#34D399" />
        <circle cx="276" cy="176" r="4.5" fill="#34D399" />
        <text x="310" y="115" fill="#6EE7B7" fontSize="9">L (8e⁻)</text>

        {/* M-Shell valence electron (1) */}
        <circle cx="230" cy="30" r="5" fill="#FBBF24" />
        <circle cx="230" cy="30" r="8" fill="none" stroke="#FBBF24" strokeWidth="1" opacity="0.6" />
        <text x="245" y="34" fill="#FCD34D" fontSize="10" fontWeight="bold">M Valence (1e⁻)</text>

        {/* Caption */}
        <text x="230" y="245" fill="#94A3B8" fontSize="11" textAnchor="middle">
          Sodium (Na): Electronic Configuration: 2, 8, 1 &bull; Forms Na⁺ (Ne core)
        </text>
      </svg>
    ),
  },

  // 3. QUADRATIC FUNCTION PARABOLA GRAPH
  {
    id: 'd-graph-1',
    title: 'Quadratic Function Graph: y = x² - 4x + 3',
    category: 'Mathematics',
    gradeLevels: [9, 10, 11],
    governingBoards: ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Boards'],
    topic: 'Coordinate Geometry & Parabolas',
    diagramType: 'Graph / Function',
    description: 'Cartesian coordinate graph of concave-up parabola showing x-intercepts at (1,0) and (3,0), y-intercept at (0,3), vertex minimum at (2,-1), and axis of symmetry x=2.',
    labels: [
      { text: 'Roots / Zeros: x = 1 and x = 3', detail: 'Points where curve intersects the X-axis (f(x) = 0)' },
      { text: 'Vertex Minimum: (2, -1)', detail: 'Extremum minimum calculated via x = -b/(2a) = 4/2 = 2' },
      { text: 'Axis of Symmetry: x = 2', detail: 'Vertical line dividing parabola into two mirrored halves' },
      { text: 'Y-Intercept: (0, 3)', detail: 'Value when x = 0 (constant c = 3)' },
    ],
    svgVisual: (
      <svg viewBox="0 0 460 260" className="w-full h-auto max-h-64 mx-auto select-none">
        <rect width="460" height="260" fill="#0B132B" rx="16" />
        {/* Grid lines */}
        <g stroke="#1E293B" strokeWidth="1">
          <line x1="60" y1="50" x2="420" y2="50" />
          <line x1="60" y1="100" x2="420" y2="100" />
          <line x1="60" y1="150" x2="420" y2="150" />
          <line x1="60" y1="200" x2="420" y2="200" />
          <line x1="120" y1="30" x2="120" y2="230" />
          <line x1="180" y1="30" x2="180" y2="230" />
          <line x1="240" y1="30" x2="240" y2="230" />
          <line x1="300" y1="30" x2="300" y2="230" />
          <line x1="360" y1="30" x2="360" y2="230" />
        </g>
        {/* Axes */}
        {/* Y Axis (at x=0 -> pixel 120) */}
        <line x1="120" y1="20" x2="120" y2="240" stroke="#94A3B8" strokeWidth="2" />
        <polygon points="120,15 117,23 123,23" fill="#94A3B8" />
        <text x="130" y="28" fill="#94A3B8" fontSize="11" fontWeight="bold">Y</text>

        {/* X Axis (at y=0 -> pixel 170) */}
        <line x1="40" y1="170" x2="430" y2="170" stroke="#94A3B8" strokeWidth="2" />
        <polygon points="435,170 427,167 427,173" fill="#94A3B8" />
        <text x="425" y="160" fill="#94A3B8" fontSize="11" fontWeight="bold">X</text>

        {/* Axis of Symmetry: x = 2 -> pixel 240 */}
        <line x1="240" y1="20" x2="240" y2="230" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="245" y="35" fill="#F59E0B" fontSize="10" fontWeight="bold">x = 2 (Symmetry)</text>

        {/* Parabola Curve: y = x² - 4x + 3 */}
        {/* Mapping: x=0: y=3 (px 120, 80); x=1: y=0 (px 180, 170); x=2: y=-1 (px 240, 200); x=3: y=0 (px 300, 170); x=4: y=3 (px 360, 80) */}
        <path
          d="M 100 45 Q 240 355 380 45"
          fill="none"
          stroke="#818CF8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Points of interest */}
        {/* Roots */}
        <circle cx="180" cy="170" r="5" fill="#10B981" />
        <text x="165" y="162" fill="#10B981" fontSize="10" fontWeight="bold">(1, 0)</text>

        <circle cx="300" cy="170" r="5" fill="#10B981" />
        <text x="305" y="162" fill="#10B981" fontSize="10" fontWeight="bold">(3, 0)</text>

        {/* Vertex */}
        <circle cx="240" cy="200" r="5" fill="#EF4444" />
        <text x="248" y="212" fill="#EF4444" fontSize="10" fontWeight="bold">Vertex (2, -1)</text>

        {/* Y-intercept */}
        <circle cx="120" cy="80" r="5" fill="#38BDF8" />
        <text x="130" y="80" fill="#38BDF8" fontSize="10" fontWeight="bold">(0, 3)</text>
      </svg>
    ),
  },

  // 4. HISTORICAL TIMELINE FLOWCHART
  {
    id: 'd-hist-1',
    title: 'Indian National Freedom Movement Milestone Flowchart (1857 - 1947)',
    category: 'History & Civics',
    gradeLevels: [8, 9, 10],
    governingBoards: ['CBSE', 'ICSE', 'State Boards'],
    topic: 'Modern Indian History & Anti-Colonial Struggle',
    diagramType: 'Timeline / Flowchart',
    description: 'Chronological timeline mapping from the 1857 Revolt through Non-Cooperation, Dandi Salt March, Quit India, and 1947 Independence.',
    labels: [
      { text: '1857: First War of Independence', detail: 'Sepoy Mutiny ending British East India Company rule; transfer to Crown' },
      { text: '1920: Non-Cooperation Movement', detail: 'Led by Mahatma Gandhi advocating Swadeshi and boycott of colonial institutions' },
      { text: '1930: Civil Disobedience & Salt March', detail: 'Historic 240-mile march to Dandi breaking the colonial salt tax monopoly' },
      { text: '1942: Quit India Movement', detail: 'Do or Die (Karo ya Maro) national call during World War II' },
      { text: '1947: Indian Independence Act', detail: 'End of British colonial rule and establishment of sovereign democratic nation' },
    ],
    svgVisual: (
      <svg viewBox="0 0 460 260" className="w-full h-auto max-h-64 mx-auto select-none">
        <rect width="460" height="260" fill="#0B132B" rx="16" />
        {/* Central Connecting Flow Line */}
        <path d="M 40 130 H 420" stroke="#F59E0B" strokeWidth="3" strokeDasharray="5 5" />

        {/* Milestone 1: 1857 */}
        <g transform="translate(60, 130)">
          <circle cx="0" cy="0" r="14" fill="#1E293B" stroke="#F87171" strokeWidth="3" />
          <text x="0" y="4" fill="#F87171" fontSize="10" fontWeight="bold" textAnchor="middle">1857</text>
          <line x1="0" y1="-14" x2="0" y2="-35" stroke="#F87171" strokeWidth="1.5" />
          <rect x="-45" y="-70" width="90" height="32" rx="6" fill="#1E293B" stroke="#F87171" strokeWidth="1" />
          <text x="0" y="-55" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">First War of Ind.</text>
          <text x="0" y="-43" fill="#94A3B8" fontSize="7" textAnchor="middle">Sepoy Uprising</text>
        </g>

        {/* Milestone 2: 1920 */}
        <g transform="translate(145, 130)">
          <circle cx="0" cy="0" r="14" fill="#1E293B" stroke="#38BDF8" strokeWidth="3" />
          <text x="0" y="4" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle">1920</text>
          <line x1="0" y1="14" x2="0" y2="35" stroke="#38BDF8" strokeWidth="1.5" />
          <rect x="-45" y="38" width="90" height="32" rx="6" fill="#1E293B" stroke="#38BDF8" strokeWidth="1" />
          <text x="0" y="53" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">Non-Cooperation</text>
          <text x="0" y="65" fill="#94A3B8" fontSize="7" textAnchor="middle">Swadeshi Boycott</text>
        </g>

        {/* Milestone 3: 1930 */}
        <g transform="translate(230, 130)">
          <circle cx="0" cy="0" r="14" fill="#1E293B" stroke="#FBBF24" strokeWidth="3" />
          <text x="0" y="4" fill="#FBBF24" fontSize="10" fontWeight="bold" textAnchor="middle">1930</text>
          <line x1="0" y1="-14" x2="0" y2="-35" stroke="#FBBF24" strokeWidth="1.5" />
          <rect x="-45" y="-70" width="90" height="32" rx="6" fill="#1E293B" stroke="#FBBF24" strokeWidth="1" />
          <text x="0" y="-55" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">Salt Satyagraha</text>
          <text x="0" y="-43" fill="#94A3B8" fontSize="7" textAnchor="middle">Dandi 240 mi March</text>
        </g>

        {/* Milestone 4: 1942 */}
        <g transform="translate(315, 130)">
          <circle cx="0" cy="0" r="14" fill="#1E293B" stroke="#A78BFA" strokeWidth="3" />
          <text x="0" y="4" fill="#A78BFA" fontSize="10" fontWeight="bold" textAnchor="middle">1942</text>
          <line x1="0" y1="14" x2="0" y2="35" stroke="#A78BFA" strokeWidth="1.5" />
          <rect x="-45" y="38" width="90" height="32" rx="6" fill="#1E293B" stroke="#A78BFA" strokeWidth="1" />
          <text x="0" y="53" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">Quit India</text>
          <text x="0" y="65" fill="#94A3B8" fontSize="7" textAnchor="middle">"Do or Die" Call</text>
        </g>

        {/* Milestone 5: 1947 */}
        <g transform="translate(400, 130)">
          <circle cx="0" cy="0" r="14" fill="#1E293B" stroke="#34D399" strokeWidth="3" />
          <text x="0" y="4" fill="#34D399" fontSize="10" fontWeight="bold" textAnchor="middle">1947</text>
          <line x1="0" y1="-14" x2="0" y2="-35" stroke="#34D399" strokeWidth="1.5" />
          <rect x="-45" y="-70" width="90" height="32" rx="6" fill="#1E293B" stroke="#34D399" strokeWidth="1" />
          <text x="0" y="-55" fill="#34D399" fontSize="8" fontWeight="bold" textAnchor="middle">Independence</text>
          <text x="0" y="-43" fill="#FFFFFF" fontSize="7" textAnchor="middle">Sovereign Nation</text>
        </g>

        {/* Footer */}
        <text x="230" y="235" fill="#94A3B8" fontSize="11" textAnchor="middle">
          Chronological Evolution of Indian Nationalist Movement (Grade 8-10 Syllabus Standard)
        </text>
      </svg>
    ),
  },
];

export const FormulasAndGraphsTab: React.FC<{
  currentGrade: number;
  currentBoard: string;
}> = ({ currentGrade, currentBoard }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory>('Mathematics');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeViewMode, setActiveViewMode] = useState<'all' | 'formulas' | 'diagrams'>('all');
  const [copiedFormulaId, setCopiedFormulaId] = useState<string | null>(null);
  const [selectedDiagramModal, setSelectedDiagramModal] = useState<DiagramModel | null>(null);

  const subjects: { id: SubjectCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'Mathematics', label: 'Mathematics', icon: <Binary className="w-4 h-4" />, color: 'text-indigo-500' },
    { id: 'Physics', label: 'Physics', icon: <Zap className="w-4 h-4" />, color: 'text-sky-500' },
    { id: 'Chemistry', label: 'Chemistry', icon: <Atom className="w-4 h-4" />, color: 'text-emerald-500' },
    { id: 'History & Civics', label: 'History & Civics', icon: <Clock className="w-4 h-4" />, color: 'text-amber-500' },
    { id: 'Biology', label: 'Biology', icon: <Cpu className="w-4 h-4" />, color: 'text-teal-500' },
  ];

  // Filtering formulas
  const filteredFormulas = FORMULA_DATABASE.filter((f) => {
    const matchesSubject = f.category === selectedSubject;
    const matchesSearch =
      searchTerm === '' ||
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.expression.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Filtering diagrams
  const filteredDiagrams = DIAGRAM_DATABASE.filter((d) => {
    const matchesSubject = d.category === selectedSubject;
    const matchesSearch =
      searchTerm === '' ||
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const copyFormulaToClipboard = (formula: FormulaItem) => {
    navigator.clipboard.writeText(`${formula.name}: ${formula.expression}`);
    setCopiedFormulaId(formula.id);
    setTimeout(() => setCopiedFormulaId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. HERO HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dedicated Resource Hub &bull; Grades 6–12</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Formulas, Graphs & Schematic Models
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Access board-compliant formula cheat-sheets, interactive Cartesian graphs, circuit diagrams, atomic structures, and timeline flowcharts on demand.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 shrink-0 bg-white/5 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
            <div className="text-center px-2">
              <div className="text-xl font-black text-indigo-400">{FORMULA_DATABASE.length}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Master Formulas</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-2">
              <div className="text-xl font-black text-emerald-400">{DIAGRAM_DATABASE.length}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">SVG Diagrams</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-2">
              <div className="text-xl font-black text-amber-400">{currentBoard}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Governing Board</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUBJECT SELECTOR TABS & SEARCH / FILTER CONTROLS */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* Subject Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {subjects.map((sub) => {
              const isSelected = selectedSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/25'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : sub.color}>{sub.icon}</span>
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle (All / Formulas / Diagrams) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveViewMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeViewMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              All Assets
            </button>
            <button
              onClick={() => setActiveViewMode('formulas')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeViewMode === 'formulas'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Formulas ({filteredFormulas.length})
            </button>
            <button
              onClick={() => setActiveViewMode('diagrams')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeViewMode === 'diagrams'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Diagrams ({filteredDiagrams.length})
            </button>
          </div>
        </div>

        {/* Search Bar & Context Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${selectedSubject} formulas, models, or topics...`}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Aligned to Grade {currentGrade} &bull; {currentBoard} Syllabus</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. SECTION A: SCHEMATIC DIAGRAMS & VECTOR MODELS */}
      {(activeViewMode === 'all' || activeViewMode === 'diagrams') && filteredDiagrams.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#4F46E5]" />
              <span>Board-Compliant Diagrams & Visual Models ({filteredDiagrams.length})</span>
            </h2>
            <span className="text-xs text-slate-500">Interactive SVG graphics with labeled parts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDiagrams.map((diag) => (
              <div
                key={diag.id}
                className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8]">
                        {diag.diagramType}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">{diag.topic}</span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                      {diag.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedDiagramModal(diag)}
                    title="Expand Fullscreen View"
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* SVG Visual Canvas */}
                <div className="p-4 bg-slate-950 flex items-center justify-center">
                  {diag.svgVisual}
                </div>

                {/* Diagram Description & Key Labels */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {diag.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Component Breakdown & Annotations:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {diag.labels.map((lbl, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-[11px]"
                        >
                          <div className="font-bold text-slate-900 dark:text-white">{lbl.text}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{lbl.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SECTION B: MASTER FORMULA CHEAT-SHEETS */}
      {(activeViewMode === 'all' || activeViewMode === 'formulas') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Binary className="w-5 h-5 text-[#4F46E5]" />
              <span>{selectedSubject} Formulas & Equations ({filteredFormulas.length})</span>
            </h2>
            <span className="text-xs text-slate-500">Board-compliant derivation variables & worked examples</span>
          </div>

          {filteredFormulas.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
              <Binary className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No formulas match "{searchTerm}"
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for another keyword or switch subjects above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFormulas.map((f) => (
                <div
                  key={f.id}
                  className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {f.topic}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Grades {f.gradeLevels.join(', ')}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                          {f.name}
                        </h3>
                      </div>

                      <button
                        onClick={() => copyFormulaToClipboard(f)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          copiedFormulaId === f.id
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 text-slate-600 dark:text-slate-300 hover:text-[#4F46E5]'
                        }`}
                        title="Copy formula text"
                      >
                        {copiedFormulaId === f.id ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Prominent Formula Equation Display */}
                    <div className="p-4 rounded-xl bg-slate-950 text-white font-mono text-center shadow-inner space-y-1">
                      <div className="text-base sm:text-lg font-bold text-indigo-300 tracking-wide select-all">
                        {f.expression}
                      </div>
                      <div className="text-[10px] text-slate-400">Standard Formula Expression</div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {f.description}
                    </p>
                  </div>

                  {/* Variables & Units Breakdown */}
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Variables & Units:
                      </span>
                      <div className="space-y-1">
                        {f.variables.map((v, i) => (
                          <div key={i} className="flex items-baseline justify-between text-[11px] gap-2">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {v.symbol}
                            </span>
                            <span className="text-slate-600 dark:text-slate-300 flex-1 truncate">
                              {v.meaning}
                            </span>
                            {v.units && (
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                [{v.units}]
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Example Problem if available */}
                    {f.exampleProblem && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[11px]">
                        <span className="font-bold text-[#4F46E5] dark:text-[#818CF8] block">
                          Worked Example:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                          {f.exampleProblem}
                        </p>
                      </div>
                    )}

                    {/* Key Takeaway */}
                    <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                      <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{f.keyTakeaway}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN DIAGRAM MODAL */}
      {selectedDiagramModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
                  {selectedDiagramModal.category} &bull; {selectedDiagramModal.diagramType}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedDiagramModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDiagramModal(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-slate-950 rounded-2xl flex items-center justify-center">
              {selectedDiagramModal.svgVisual}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {selectedDiagramModal.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {selectedDiagramModal.labels.map((lbl, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">{lbl.text}</div>
                  <div className="text-slate-500 text-[11px]">{lbl.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
