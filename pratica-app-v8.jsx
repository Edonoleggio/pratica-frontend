// CONFIGURAZIONE SERVER - Incollato da Gemini
const API_URL = "https://pratica-backend.onrender.com/api";

// --- Fine configurazione ---

import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react';
// 
import {
  LayoutDashboard, FileText, Car, Users, Settings, Plus, Search,
  ChevronRight, Check, AlertCircle, Clock, Send, Camera, ScanLine,
  ChevronLeft, X, MapPin, CreditCard, ShieldCheck, Download,
  Eye, ArrowUpRight, Filter, FileCheck2, User, Hash,
  Phone, Building2, AlertTriangle, Info,
  CheckCircle2, ArrowRight, Sparkles, QrCode, Wifi, WifiOff, ChevronDown,
  UserCheck, PhoneCall, Timer, Stamp, History,
  ScanSearch, Star, FileSignature, Lock, Unlock, Pencil, Trash2,
  Hotel, Anchor, Plane, Wallet, Printer, Save, Mail, Home, Compass,
  Upload, Image as ImageIcon, RefreshCw, Key, Eye as EyeIcon, EyeOff,
  CircleDot, Power, Shield, Briefcase
} from 'lucide-react';
const API_BASE_URL = 'https://pratica-backend.onrender.com';
// ═══════════════════════════════════════════════════════════════════
// EDONOLEGGIO — REAL COMPANY DATA
// www.edonoleggio.com · Pionieri del noleggio a Lampedusa dal 1994
// ═══════════════════════════════════════════════════════════════════

const AGENCY = {
  nome: 'Edonoleggio',
  titolare: 'Raptis Alessandra',
  ragioneSociale: 'Edonoleggio di Raptis Alessandra',
  slogan: 'Pionieri del noleggio a Lampedusa dal 1994',
  fondazione: 1994,
  indirizzoLegale: 'Via Roma, 15',
  sedeOperativa: 'Cortile Caltanissetta (traversa Via Siracusa)',
  cap: '92031',
  citta: 'Lampedusa e Linosa',
  provincia: 'AG',
  istatLuogo: 84017,
  catastale: 'E431',
  telefono: '+39 0922 970265',
  cellulari: ['+39 339 172 8645', '+39 338 649 6305'],
  email: 'info@edonoleggio.com',
  pec: 'edonoleggio@pec.it',
  questuraPec: 'ag.gab@pecps.poliziadistato.it',
  piva: '01900450840',
  cf: 'RPTLSN61A58E431A',
  agenziaId: 'EDO-LMP-1994',
  orari: 'Lun–Dom · 08:30–13:00 / 14:30–19:00',
  servizi: 'Auto · Scooter · Quad · E-bike · Mehari · Transfer',
};

// Configurazione CARGOS — modificabile via UI in Impostazioni
const INITIAL_CARGOS_CONFIG = {
  endpoint: 'https://cargos.poliziadistato.it/CARGOS_API',
  agenziaId: 'EDO-LMP-1994',
  username: 'edonoleggio',
  password: '',                               // mai stampato in chiaro
  otpSeed: '',                                // shared secret per TOTP
  istatLuogo: 84017,                          // Lampedusa e Linosa
  questuraPec: 'ag.gab@pecps.poliziadistato.it',
  autoSendTimeout: 5,                         // minuti prima di pec fallback
  enabled: true,
};

// ═══════════════════════════════════════════════════════════════════
// VEHICLE TYPES
// ═══════════════════════════════════════════════════════════════════
const VEHICLE_TYPES = {
  auto:    { label: 'Auto',    short: 'Auto',    cargosCode: 'A',  cargosRequired: true,  hasPlate: true,  needsLicense: 'B',    description: 'Autoveicolo ≥ 4 ruote · CARGOS obbligatorio' },
  scooter: { label: 'Scooter', short: 'Scooter', cargosCode: 'M',  cargosRequired: false, hasPlate: true,  needsLicense: 'AM/A', description: 'Motoveicolo 2 ruote · escluso da CARGOS' },
  quad:    { label: 'Quad',    short: 'Quad',    cargosCode: 'M',  cargosRequired: false, hasPlate: true,  needsLicense: 'B1/B', description: 'Quadriciclo L7e · equiparato a motoveicolo' },
  ebike:   { label: 'E-bike',  short: 'E-bike',  cargosCode: null, cargosRequired: false, hasPlate: false, needsLicense: null,   description: 'Pedalata assistita ≤ 25 km/h · non veicolo a motore' },
};

// ═══════════════════════════════════════════════════════════════════
// SHARED UTILITY — iconForTipo (was duplicated 3×)
// ═══════════════════════════════════════════════════════════════════
function iconForTipo(tipo) {
  if (tipo === 'aeroporto') return Plane;
  if (tipo === 'porto') return Anchor;
  if (tipo === 'sede') return Building2;
  if (tipo === 'appartamento' || tipo === 'casa') return Home;
  if (tipo === 'residence') return Building2;
  return Hotel;
}

// Iniziali sicure (gestisce campi vuoti senza renderizzare "undefined")
function getInitials(nome, cognome) {
  const n = (nome || '').trim();
  const c = (cognome || '').trim();
  return (n[0] || '') + (c[0] || '') || '?';
}

// Generatore ID univoci: timestamp + random per evitare collisioni in batch
let _idCounter = 0;
function makeId(prefix) {
  _idCounter = (_idCounter + 1) % 10000;
  return `${prefix}${Date.now().toString(36)}${_idCounter.toString(36)}`;
}

// ═══════════════════════════════════════════════════════════════════
// VEHICLE ICONS — memoized
// ═══════════════════════════════════════════════════════════════════
const VehicleIcon = memo(function VehicleIcon({ type, className = 'w-5 h-5' }) {
  if (type === 'auto') return <Car className={className} />;
  if (type === 'scooter') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" />
      <path d="M6 17L8 9L13 9L17 14" /><path d="M13 9L15 5L18 5" /><path d="M18 17L19 13" />
    </svg>
  );
  if (type === 'quad') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="5" cy="17" r="2.5" /><circle cx="19" cy="17" r="2.5" />
      <path d="M5 17L4 12L8 9L16 9L20 12L19 17" /><path d="M9 9L9 6L15 6L15 9" /><path d="M11 13L13 13" />
    </svg>
  );
  if (type === 'ebike') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" />
      <path d="M6 17L10 7L13 7" /><path d="M18 17L14 10L11 10" /><path d="M14 4L13 7L15 7L14 10" strokeWidth="2.2" />
    </svg>
  );
  return null;
});

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════
// ─── Database mezzi Edonoleggio (estratto da DATABASE_MEZZI_EDONOLEGGIO_2026.numbers) ─
// Stati operativi del file originale: OK, FERMO/FERMA, INCIDENTATO, VENDUTO ?, TONY
// Mappati internamente come 'available', 'fermo', 'incidentato', 'venduto'
const INITIAL_FLEET = [
  // ═══ AUTO CHIUSE — Fiat Panda flotta storica ═══
  { id: 'v1',  tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'GA413YP', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v2',  tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'CR042MZ', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v3',  tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'DP428KM', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v4',  tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'CX124KZ', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v5',  tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'EM416AA', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v6',  tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'FV485FB', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v7',  tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'DG894VJ', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v8',  tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'CX312NY', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v9',  tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'DP331AA', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v10', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'DB391VR', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v11', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'ED949RX', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v12', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'DS248VG', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v13', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'CV464EH', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v14', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'DE371MM', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v15', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'CY937XX', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v16', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'DS995DN', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v17', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'CL890CZ', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v18', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'DA014MD', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v19', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'CN308TV', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v20', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'CR452BP', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v21', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'DY669GW', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v22', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'CP969XS', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v23', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'CF847GS', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v24', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'DV274MC', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v25', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'GH869KA', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v26', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'DB506ZV', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v27', tipo: 'auto', marca: 'Fiat', modello: 'Panda',     targa: 'CX824KS', colore: '', stato: 'available', cilindrata: '900cc', anno: '', gps: 0, blocco: 0 },
  // New Panda
  { id: 'v28', tipo: 'auto', marca: 'Fiat', modello: 'New Panda', targa: 'FB599WD', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v29', tipo: 'auto', marca: 'Fiat', modello: 'New Panda', targa: 'FG705MC', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v30', tipo: 'auto', marca: 'Fiat', modello: 'New Panda', targa: 'CW417RM', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v31', tipo: 'auto', marca: 'Fiat', modello: 'New Panda', targa: 'DP417KM', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v32', tipo: 'auto', marca: 'Fiat', modello: 'New Panda', targa: 'DE474WL', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v33', tipo: 'auto', marca: 'Fiat', modello: 'New Panda', targa: 'CV403WW', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v34', tipo: 'auto', marca: 'Fiat', modello: 'New Panda', targa: 'DH407YR', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v35', tipo: 'auto', marca: 'Fiat', modello: 'Panda Automatica', targa: 'DZ500KR', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v36', tipo: 'auto', marca: 'Fiat', modello: 'New Panda', targa: 'EP804YM', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v37', tipo: 'auto', marca: 'Fiat', modello: 'New Panda', targa: 'EV888PB', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v38', tipo: 'auto', marca: 'Fiat', modello: 'New Panda', targa: 'FS944BA', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v39', tipo: 'auto', marca: 'Fiat', modello: 'New Panda', targa: 'FM873GS', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v40', tipo: 'auto', marca: 'Fiat', modello: 'New Panda', targa: 'EM461AA', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v41', tipo: 'auto', marca: 'Fiat', modello: 'New Panda', targa: 'FY821LW', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  // Altri modelli (Auto chiuse)
  { id: 'v42', tipo: 'auto', marca: 'Fiat',     modello: 'Doblò',         targa: 'DL923YK', colore: '', stato: 'available', cilindrata: '1600cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v43', tipo: 'auto', marca: 'Toyota',   modello: 'RAV 4',         targa: 'CP875NR', colore: '', stato: 'available', cilindrata: '2000cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v44', tipo: 'auto', marca: 'Citroën',  modello: 'C3',            targa: 'DZ063EP', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v45', tipo: 'auto', marca: 'Nissan',   modello: 'Micra',         targa: 'DR856NT', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v46', tipo: 'auto', marca: 'Dacia',    modello: 'Sandero',       targa: 'EM056GE', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v47', tipo: 'auto', marca: 'Fiat',     modello: 'Grande Punto',  targa: 'DT796CM', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v48', tipo: 'auto', marca: 'Fiat',     modello: 'Grande Punto',  targa: 'DF197JW', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v49', tipo: 'auto', marca: 'Lancia',   modello: 'Y',             targa: 'EJ001VV', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v50', tipo: 'auto', marca: 'Land Rover', modello: '',            targa: 'ZA040EJ', colore: '', stato: 'available', cilindrata: '', anno: '', gps: 0, blocco: 0 },
  { id: 'v51', tipo: 'auto', marca: 'Volkswagen', modello: 'Golf',        targa: 'EH739XT', colore: '', stato: 'available', cilindrata: '1400cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v52', tipo: 'auto', marca: 'Fiat',     modello: '500',           targa: 'DY441HX', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v53', tipo: 'auto', marca: 'Opel',     modello: 'Corsa',         targa: 'DJ507XH', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v54', tipo: 'auto', marca: 'Opel',     modello: 'Corsa',         targa: 'DE530WF', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v55', tipo: 'auto', marca: 'Ford',     modello: 'Fiesta',        targa: 'DW184YC', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v56', tipo: 'auto', marca: 'Fiat',     modello: 'Multipla',      targa: 'BG345SV', colore: '', stato: 'available', cilindrata: '1600cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v57', tipo: 'auto', marca: 'Fiat',     modello: 'Ulisse',        targa: 'CZ241RA', colore: '', stato: 'available', cilindrata: '2000cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v58', tipo: 'auto', marca: 'Nissan',   modello: 'Cube',          targa: 'FK08099', colore: '', stato: 'available', cilindrata: '1500cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v59', tipo: 'auto', marca: '',         modello: '',              targa: 'CX891TB', colore: '', stato: 'available', cilindrata: '', anno: '', gps: 0, blocco: 0, note: 'Da catalogare' },
  { id: 'v60', tipo: 'auto', marca: '',         modello: '',              targa: 'EX856DA', colore: 'Grigia', stato: 'available', cilindrata: '', anno: '', gps: 0, blocco: 0, note: 'Da catalogare' },

  // ═══ AUTO APERTE — Mehari, cabrio, scoperte ═══
  { id: 'v61', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'SV256194',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v62', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'PR292027',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v63', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'VI3397198', colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v64', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'PC210411',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v65', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'TS1922630', colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v66', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'AG253022',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v67', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'AG253021',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v68', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'TOM28765',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v69', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'FH854KY',   colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v70', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'MI35777G',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v71', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'UD514492',  colore: '', stato: 'fermo',       cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v72', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'TP342201',  colore: '', stato: 'fermo',       cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v73', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'AG279352',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v74', tipo: 'auto', marca: 'Citroën', modello: 'Diane',  targa: 'PV407892',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v75', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'ROMA10123H',colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v76', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'MO484122',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v77', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'BL113579',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v78', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'AX391EK',   colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v79', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'LT421661',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v80', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'NAP41156',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v81', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'TOM97379',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v82', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'VC567189',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v83', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'MI00033R',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v84', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'AG214750',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v85', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'CM506JG',   colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v86', tipo: 'auto', marca: 'Citroën', modello: 'Mehari', targa: 'AL719452',  colore: '', stato: 'available',   cilindrata: '602cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v87', tipo: 'auto', marca: 'Suzuki',  modello: 'Jimny',  targa: 'BZ085ZB',   colore: '', stato: 'available',   cilindrata: '1300cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v88', tipo: 'auto', marca: 'Volkswagen', modello: 'New Beetle', targa: 'CK710JG', colore: '', stato: 'available', cilindrata: '1600cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v89', tipo: 'auto', marca: 'Fiat',    modello: 'Punto Cabrio', targa: 'BC503HM', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v90', tipo: 'auto', marca: 'Fiat',    modello: 'Punto Cabrio', targa: 'AJ844WG', colore: '', stato: 'fermo',     cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v91', tipo: 'auto', marca: 'Fiat',    modello: 'Punto Cabrio', targa: 'AY107RH', colore: '', stato: 'fermo',     cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v92', tipo: 'auto', marca: 'Fiat',    modello: 'Punto Cabrio', targa: 'AD712WR', colore: '', stato: 'fermo',     cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v93', tipo: 'auto', marca: 'Fiat',    modello: 'Punto Cabrio', targa: 'AR466YG', colore: '', stato: 'fermo',     cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v94', tipo: 'auto', marca: 'Fiat',    modello: 'Punto Cabrio', targa: 'CY066XS', colore: '', stato: 'fermo',     cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v95', tipo: 'auto', marca: 'Fiat',    modello: 'Punto Cabrio', targa: 'BK344VW', colore: '', stato: 'fermo',     cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v96', tipo: 'auto', marca: 'Fiat',    modello: 'Punto Cabrio', targa: 'AE724GZ', colore: '', stato: 'fermo',     cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v97', tipo: 'auto', marca: 'Fiat',    modello: '500',          targa: 'AG085215',colore: '', stato: 'available', cilindrata: '500cc',  anno: '', gps: 0, blocco: 0 },
  { id: 'v98', tipo: 'auto', marca: 'Fiat',    modello: '500',          targa: 'SP98304', colore: '', stato: 'available', cilindrata: '500cc',  anno: '', gps: 0, blocco: 0 },
  { id: 'v99', tipo: 'auto', marca: 'Ford',    modello: 'Ka',           targa: 'CJ607GK', colore: '', stato: 'available', cilindrata: '1200cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v100',tipo: 'auto', marca: 'Fiat',    modello: '500 Cabrio',   targa: 'GH649LD', colore: '', stato: 'available', cilindrata: '900cc',  anno: '', gps: 0, blocco: 0 },
  { id: 'v101',tipo: 'auto', marca: 'Smart',   modello: 'Fortwo',       targa: 'FL409XV', colore: '', stato: 'available', cilindrata: '1000cc', anno: '', gps: 0, blocco: 0 },

  // ═══ SCOOTER 125CC ═══
  { id: 'v102',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'ET46342', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v103',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'ET46340', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v104',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'ET46341', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v105',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'CG25160', colore: '', stato: 'venduto',   cilindrata: '125cc', anno: '', gps: 0, blocco: 0, note: 'Da verificare' },
  { id: 'v106',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'CG25175', colore: '', stato: 'venduto',   cilindrata: '125cc', anno: '', gps: 0, blocco: 0, note: 'Da verificare' },
  { id: 'v107',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'CP85154', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v108',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'CV78763', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v109',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DE81460', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v110',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'CW77242', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v111',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DJ16006', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v112',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'ER52914', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v113',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'BV68609', colore: '', stato: 'fermo',     cilindrata: '125cc', anno: '', gps: 0, blocco: 0, note: 'Tony' },
  { id: 'v114',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DV40167', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v115',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'BW58323', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v116',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'CV61957', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v117',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DM06845', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v118',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DV46333', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v119',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DV46926', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v120',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DV40304', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v121',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DN16471', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v122',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'BY77132', colore: '', stato: 'fermo',     cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v123',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DV92194', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v124',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DV46995', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v125',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DT07281', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v126',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DT07280', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v127',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DT07282', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v128',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DT07199', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v129',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DM59120', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v130',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EV53905', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v131',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EV53904', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v132',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FP74555', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v133',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FP74556', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v134',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FP74554', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v135',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EW92292', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v136',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EW92293', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v137',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EW92294', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v138',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EW92295', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v139',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EW92296', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v140',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EW92297', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v141',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EW92298', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v142',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EW92299', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v143',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EW92300', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v144',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EW92301', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v145',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FF16659', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v146',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FK08061', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v147',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FK08098', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v148',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FB88295', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v149',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FB88299', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v150',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FB88260', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v151',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FB88330', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v152',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FB88344', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v153',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FB88345', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v154',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FB88346', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v155',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FB88347', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v156',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FB88348', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v157',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FB88349', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v158',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FF16747', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v159',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FF16748', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v160',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FK08089', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v161',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FK08090', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v162',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FK08091', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v163',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FK08092', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v164',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FK08093', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v165',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FD33808', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v166',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FA13043', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v167',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FA13042', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v168',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FA13040', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v169',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FA13038', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v170',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FA13039', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v171',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FA13036', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v172',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FA13035', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v173',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FA13037', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v174',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'FA13041', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v175',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EX61503', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v176',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EX61501', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v177',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EX61500', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v178',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EX61499', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v179',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EX61505', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v180',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EX61498', colore: '', stato: 'incidentato',cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v181',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EX48432', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v182',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EX61504', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v183',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EX61502', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v184',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'EX61497', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v185',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DV40164', colore: '', stato: 'fermo',     cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v186',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'CG25178', colore: '', stato: 'available', cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v187',tipo: 'scooter', marca: 'Scooter 125CC', modello: '', targa: 'DC07551', colore: '', stato: 'fermo',     cilindrata: '125cc', anno: '', gps: 0, blocco: 0 },

  // ═══ QUAD ═══
  { id: 'v188',tipo: 'quad', marca: 'Quad', modello: '150cc', targa: 'EF82687', colore: '', stato: 'available', cilindrata: '150cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v189',tipo: 'quad', marca: 'Quad', modello: '300cc', targa: 'FS23036', colore: '', stato: 'available', cilindrata: '300cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v190',tipo: 'quad', marca: 'Quad', modello: '150cc', targa: 'DC06822', colore: '', stato: 'fermo',     cilindrata: '150cc', anno: '', gps: 0, blocco: 0 },
  { id: 'v191',tipo: 'quad', marca: 'Quad', modello: '150cc', targa: 'DW08528', colore: '', stato: 'available', cilindrata: '150cc', anno: '', gps: 0, blocco: 0 },

  // ═══ E-BIKE — non presenti nel database, mantenute come esempio ═══
  { id: 'v192',tipo: 'ebike', marca: 'Atala', modello: 'B-Tour SLS',   targa: '—', colore: 'Antracite', stato: 'available', cilindrata: '250W', anno: 2024, gps: 0, blocco: 0 },
  { id: 'v193',tipo: 'ebike', marca: 'Giant', modello: 'Explore E+ 2', targa: '—', colore: 'Bianco',    stato: 'available', cilindrata: '250W', anno: 2024, gps: 0, blocco: 0 },
];

// Stati operativi del veicolo
const VEHICLE_STATUS = {
  available:   { label: 'Disponibile', pill: 'pill-ok',      icon: CheckCircle2 },
  fermo:       { label: 'Fermo',       pill: 'pill-warn',    icon: AlertTriangle },
  incidentato: { label: 'Incidentato', pill: 'pill-err',     icon: AlertCircle },
  venduto:     { label: 'Venduto',     pill: 'pill-neutral', icon: X },
};

const MOCK_CUSTOMERS = [];

const MOCK_LOCATIONS = [];

const PARTNER_TYPES = {
  aeroporto:    { label: 'Aeroporto' },
  porto:        { label: 'Porto' },
  sede:         { label: 'Sede' },
  hotel:        { label: 'Hotel' },
  resort:       { label: 'Resort' },
  residence:    { label: 'Residence' },
  guesthouse:   { label: 'Guest house' },
  bb:           { label: 'B&B' },
  appartamento: { label: 'Appartamenti' },
  casa:         { label: 'Casa vacanze' },
};

const MOCK_OPERATORS = [];
 
const MOCK_CONTRACTS = [
  { id: 'EDO-2026-0418', cliente: 'Bianchi Marco',      clienteId: 'c1', veicolo: 'Citroën Mehari · AG123XX',   tipo: 'auto',    stato: 'inviato',  data: 'oggi · 09:14', ritiro: 'oggi 10:00', consegna: 'lun 18:00',  consegnaTimestamp: 'lunedì 18:00',  minutiAlRientro: null, fuori: true },
  { id: 'EDO-2026-0419', cliente: 'García López María', clienteId: 'c2', veicolo: 'Vespa Primavera · DJ44102',   tipo: 'scooter', stato: 'cartaceo', data: 'oggi · 11:32', ritiro: 'oggi 12:00', consegna: 'oggi 17:30', consegnaTimestamp: 'oggi 17:30',    minutiAlRientro: 50,   fuori: true },
  { id: 'EDO-2026-0420', cliente: 'Rossi Anna',         clienteId: null, veicolo: 'Polaris Sportsman · XQ88550', tipo: 'quad',    stato: 'cartaceo', data: 'oggi · 14:08', ritiro: 'oggi 14:30', consegna: 'oggi 19:00', consegnaTimestamp: 'oggi 19:00',    minutiAlRientro: 140,  fuori: true },
  { id: 'EDO-2026-0421', cliente: 'Müller Hans',        clienteId: 'c3', veicolo: 'Fiat Panda · GG441KP',        tipo: 'auto',    stato: 'errore',   data: 'oggi · 15:50', ritiro: 'oggi 16:00', consegna: 'oggi 16:30', consegnaTimestamp: 'oggi 16:30',    minutiAlRientro: -10,  fuori: true, ritardo: true },
  { id: 'EDO-2026-0422', cliente: 'Esposito Luca',      clienteId: null, veicolo: 'Atala B-Tour · —',            tipo: 'ebike',   stato: 'cartaceo', data: 'oggi · 16:21', ritiro: 'dom 09:00',  consegna: 'mar 09:00', consegnaTimestamp: 'martedì 09:00', minutiAlRientro: null, fuori: false },
];

const TIPO_PAGAMENTO = {
  C: { label: 'Carta di credito', cargosMap: 'C', icon: CreditCard },
  P: { label: 'PayPal',           cargosMap: 'A', icon: Wallet },
  B: { label: 'Bonifico',         cargosMap: 'B', icon: Building2 },
  T: { label: 'Contante',         cargosMap: 'T', icon: Wallet },
};

const TIPO_DOC = { CI: "Carta d'identità", PA: 'Passaporto', PT: 'Patente di guida', PE: 'Permesso di soggiorno' };

// ═══════════════════════════════════════════════════════════════════
// CUSTOM HOOKS
// ═══════════════════════════════════════════════════════════════════

// useCameraStream — gestisce getUserMedia con cleanup, errori, switch camera
// Usata da PlateScanModal e DocumentScanModal per scansione live.
function useCameraStream(active, facingMode = 'environment') {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setError(null);
    setReady(false);

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Fotocamera non supportata su questo dispositivo. Usa il caricamento file.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => setReady(true)).catch(() => {});
          };
        }
      } catch (e) {
        if (cancelled) return;
        if (e.name === 'NotAllowedError') {
          setError('Permesso fotocamera negato. Autorizza l\'accesso dalle impostazioni del browser, oppure carica un file.');
        } else if (e.name === 'NotFoundError') {
          setError('Nessuna fotocamera trovata. Usa il caricamento file.');
        } else {
          setError('Errore fotocamera: ' + (e.message || e.name) + '. Usa il caricamento file.');
        }
      }
    }
    start();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [active, facingMode]);

  // Cattura uno snapshot dal video → dataURL JPEG
  const capture = useCallback(() => {
    if (!videoRef.current || !ready) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [ready]);

  return { videoRef, error, ready, capture };
}

// Conta i veicoli per tipo — memoized in place dove serve
function useFleetCounts(fleet) {
  return useMemo(() => {
    const counts = { auto: 0, scooter: 0, quad: 0, ebike: 0 };
    for (const v of fleet) counts[v.tipo]++;
    return counts;
  }, [fleet]);
}

// usePersistentState — useState che persiste su localStorage tra refresh.
// Critico per il banco: se l'operatore aggiunge un cliente alle 9:30
// e l'iPad fa restart automatico alle 14:00, ritrova tutto.
// Gestisce gracefully ambienti senza localStorage (SSR, mode privato Safari).
const BACKEND_URL = 'https://pratica-backend.onrender.com';

function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [loaded, setLoaded] = useState(false);
  const isSaving = useRef(false);
  const pendingSave = useRef(false);

  // Modifica il caricamento iniziale
  useEffect(() => {
    const API_BASE_URL = 'https://pratica-backend.onrender.com';

    // Prima prova a prendere i dati dal SERVER
    fetch(`${API_BASE_URL}/api/fleet`)
      .then(res => res.json())
      .then(serverData => {
        if (serverData && serverData.length > 0) {
          setValue(serverData); // Se il server ha la flotta, usa quella!
        }
      })
      .catch(() => {
        // Se il server fallisce o è lento, prova il vecchio metodo locale
        try {
          const raw = window.localStorage.getItem(key);
          if (raw) setValue(JSON.parse(raw));
        } catch {}
      })
      .finally(() => {
        setLoaded(true);
      });
  }, [key]);

  // Modifica il Polling (l'aggiornamento automatico)
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${API_BASE_URL}/api/fleet`)
        .then(res => res.json())
        .then(serverData => {
          setValue(serverData);
        })
        .catch(err => console.log("Backend ancora in standby..."));
    }, 30000);

    return () => clearInterval(interval);
  }, []);
}

// useToasts — gestore semplice di notifiche non-bloccanti.
// push({ tone, title, message, duration }) ritorna l'id; dismiss(id) chiude.
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((t) => {
    const id = makeId('t');
    setToasts(ts => [...ts, { id, tone: 'success', ...t }]);
    return id;
  }, []);
  const dismiss = useCallback((id) => setToasts(ts => ts.filter(t => t.id !== id)), []);
  return { toasts, push, dismiss };
}

// ═══════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════

// ReadonlyBanner — DRY: era ripetuto in Fleet, Customers, Partners
const ReadonlyBanner = memo(function ReadonlyBanner({ message }) {
  return (
    <div
      role="status"
      className="text-xs p-3 rounded mb-4 flex items-center gap-2"
      style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}
    >
      <Lock className="w-3.5 h-3.5" aria-hidden="true" />
      {message}
    </div>
  );
});

// DocumentScanner — componente in-line per scansione documenti o QR cliente
// Supporta: fotocamera live (getUserMedia) + upload file da galleria.
// In produzione: il dataURL/file viene mandato al backend per OCR MRZ (documenti)
// o decodifica QR (jsQR/zxing) → pre-compilazione campi.
// mode: 'document' (CI/passaporto/patente) | 'qr' (codice cliente)
function DocumentScanner({ mode = 'document', customers, onPick, onUpload }) {
  const [stage, setStage] = useState('idle'); // 'idle' | 'camera' | 'captured'
  const [snapshot, setSnapshot] = useState(null);
  const [uploaded, setUploaded] = useState(null);
  const fileInputRef = useRef(null);
  const { videoRef, error: camError, ready, capture } = useCameraStream(stage === 'camera');

  const handleCapture = () => {
    const dataUrl = capture();
    if (dataUrl) {
      setSnapshot(dataUrl);
      setStage('captured');
      if (onUpload) onUpload(null, dataUrl);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploaded({ name: file.name, dataUrl: ev.target.result });
      if (onUpload) onUpload(file, ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setSnapshot(null);
    setUploaded(null);
    setStage('idle');
  };

  const labelDoc = mode === 'qr' ? 'codice cliente' : 'documento d\'identità';
  const hintText = mode === 'qr'
    ? 'Inquadra il QR del cliente o carica uno screenshot ricevuto via WhatsApp'
    : 'Inquadra CI / passaporto / patente sul lato MRZ, oppure carica una foto dalla galleria';

  // Stato idle: due grandi bottoni
  if (stage === 'idle' && !snapshot && !uploaded) {
    return (
      <div className="card-paper p-5 mb-6">
        <div className="text-[11px] uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--muted)' }}>
          {mode === 'qr' ? <QrCode className="w-3.5 h-3.5" /> : <ScanLine className="w-3.5 h-3.5" />}
          Acquisisci {labelDoc}
        </div>
        <div className="text-xs mb-4" style={{ color: 'var(--ink-2)' }}>{hintText}</div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStage('camera')}
            className="card-paper p-5 hover:border-[var(--ink)] transition-all text-center group"
            style={{ borderColor: 'var(--border)' }}
          >
            <Camera className="w-7 h-7 mx-auto mb-2" style={{ color: 'var(--accent)' }} />
            <div className="font-medium text-sm">Fotocamera</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>Scansione live</div>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="card-paper p-5 hover:border-[var(--ink)] transition-all text-center group"
            style={{ borderColor: 'var(--border)' }}
          >
            <Upload className="w-7 h-7 mx-auto mb-2" style={{ color: 'var(--sea)' }} />
            <div className="font-medium text-sm">Carica file</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>JPG, PNG, PDF</div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    );
  }

  // Stato camera: video live + cattura
  if (stage === 'camera') {
    return (
      <div className="card-paper p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--muted)' }}>
            <Camera className="w-3.5 h-3.5" /> Fotocamera live
            {ready && (
              <span className="pill pill-ok ml-2">
                <CircleDot className="w-3 h-3" /> Pronta
              </span>
            )}
          </div>
          <button type="button" onClick={reset} className="btn-ghost px-2 py-1 rounded text-xs">
            <X className="w-3.5 h-3.5 inline" /> Annulla
          </button>
        </div>
        {camError ? (
          <div className="p-6 rounded text-center" style={{ background: 'var(--surface-2)' }}>
            <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--warning)' }} />
            <div className="text-sm font-medium mb-1">Fotocamera non disponibile</div>
            <div className="text-xs mb-3" style={{ color: 'var(--ink-2)' }}>{camError}</div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-primary px-4 py-2 rounded text-sm font-semibold inline-flex items-center gap-2">
              <Upload className="w-4 h-4" /> Carica un file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => { handleFileUpload(e); setStage('idle'); }}
            />
          </div>
        ) : (
          <>
            <div className="relative rounded overflow-hidden" style={{ background: '#000', aspectRatio: '4/3' }}>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {/* Overlay guida */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[80%] h-[60%] border-2 border-dashed rounded" style={{ borderColor: 'rgba(255,255,255,0.6)' }} />
              </div>
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <div className="inline-block px-3 py-1 rounded text-[11px]" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                  Allinea {labelDoc} nel riquadro
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleCapture}
                disabled={!ready}
                className="btn-primary px-4 py-2.5 rounded text-sm font-semibold flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Camera className="w-4 h-4" /> Scatta
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-ghost px-4 py-2.5 rounded text-sm border inline-flex items-center gap-2"
                style={{ borderColor: 'var(--border)' }}
              >
                <Upload className="w-4 h-4" /> File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => { handleFileUpload(e); setStage('idle'); }}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // Stato post-scatto o post-upload: anteprima + conferma
  const previewSrc = snapshot || uploaded?.dataUrl;
  const previewName = snapshot ? 'snapshot dalla fotocamera' : uploaded?.name;

  return (
    <div className="card-paper p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--success)' }}>
          <CheckCircle2 className="w-3.5 h-3.5" /> Acquisito
        </div>
        <button type="button" onClick={reset} className="btn-ghost px-2 py-1 rounded text-xs inline-flex items-center gap-1">
          <RefreshCw className="w-3.5 h-3.5" /> Ricomincia
        </button>
      </div>
      {previewSrc && previewSrc.startsWith('data:image') ? (
        <img src={previewSrc} alt={previewName} className="w-full rounded" style={{ maxHeight: 280, objectFit: 'contain', background: 'var(--surface-2)' }} />
      ) : (
        <div className="p-6 rounded text-center" style={{ background: 'var(--surface-2)' }}>
          <FileCheck2 className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--success)' }} />
          <div className="text-sm font-medium">{previewName}</div>
        </div>
      )}
      <div className="mt-3 p-3 rounded text-[11px] flex items-start gap-2" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span>
          {mode === 'qr'
            ? 'In produzione: il QR viene decodificato (libreria jsQR) e i dati cliente pre-compilati automaticamente. Per ora compila i campi sotto manualmente o seleziona da "clienti precedenti".'
            : 'In produzione: l\'immagine viene inviata al backend per OCR della zona MRZ del documento; i campi sotto verranno pre-compilati automaticamente. Per ora compila manualmente.'}
        </span>
      </div>
    </div>
  );
}

// ModalShell — DRY header/body/footer shared by all modals
function ModalShell({ id, title, subtitle, onClose, children, footer, maxWidth = 'max-w-2xl' }) {
  // Chiudi con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center fade-in"
      style={{ background: 'rgba(26,24,21,0.55)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={id}
    >
      <div
        className={`card-paper w-full ${maxWidth} slide-up max-h-[92vh] flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div>
            {subtitle && <div className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>{subtitle}</div>}
            <h3 id={id} className="serif text-xl font-medium">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost p-2 rounded" aria-label="Chiudi">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--border)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ConfirmModal — sostituisce window.confirm() con un modale coerente.
// Mobile-friendly (no alert nativo iOS) e stilizzato come il resto dell'app.
// Variant 'danger' (rosso) per eliminazioni, 'warning' (giallo) per azioni reversibili.
function ConfirmModal({ title, message, confirmLabel = 'Conferma', cancelLabel = 'Annulla', variant = 'danger', icon: Icon = AlertTriangle, onConfirm, onClose }) {
  const tone = {
    danger:  { color: 'var(--accent)',  bg: 'var(--surface-2)', btnClass: 'btn-accent' },
    warning: { color: 'var(--warning)', bg: 'var(--surface-2)', btnClass: 'btn-primary' },
    info:    { color: 'var(--sea)',     bg: 'var(--surface-2)', btnClass: 'btn-primary' },
  }[variant] || { color: 'var(--accent)', bg: 'var(--surface-2)', btnClass: 'btn-accent' };

  return (
    <ModalShell
      id="confirm-title"
      title={title}
      subtitle="Conferma azione"
      onClose={onClose}
      maxWidth="max-w-md"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost px-4 py-2 rounded text-sm">{cancelLabel}</button>
          <button type="button" onClick={() => { onConfirm(); onClose(); }} className={`${tone.btnClass} px-4 py-2 rounded text-sm font-semibold inline-flex items-center gap-2`}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tone.bg, color: tone.color }}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>{message}</div>
      </div>
    </ModalShell>
  );
}

// Toast — feedback non-bloccante per azioni completate.
// Si auto-chiude dopo 3 secondi. Click sul toast per chiuderlo subito.
function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, toast.duration || 3000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  const tones = {
    success: { bg: '#e8f0db', border: 'var(--success)', icon: CheckCircle2 },
    info:    { bg: '#e2eef2', border: 'var(--sea)',     icon: Info },
    warning: { bg: '#f4ebd8', border: 'var(--warning)', icon: AlertTriangle },
    error:   { bg: '#f4d8d8', border: 'var(--accent)',  icon: AlertCircle },
  };
  const t = tones[toast.tone] || tones.success;
  const Icon = t.icon;

  return (
    <button
      type="button"
      onClick={onDismiss}
      className="card-paper px-4 py-3 flex items-start gap-3 slide-up text-left max-w-sm cursor-pointer hover:shadow-lg transition-shadow"
      style={{ background: t.bg, borderLeft: `3px solid ${t.border}` }}
      role="status"
      aria-live="polite"
    >
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: t.border }} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {toast.title && <div className="font-medium text-sm">{toast.title}</div>}
        <div className="text-xs" style={{ color: 'var(--ink-2)' }}>{toast.message}</div>
      </div>
      <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-50" aria-hidden="true" />
    </button>
  );
}

// ToastContainer — fixed bottom-right, stacka i toast attivi.
function ToastContainer({ toasts, dismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[60]" aria-label="Notifiche">
      {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />)}
    </div>
  );
}

// BillingForm — DRY: era duplicato in Step2Customer e NewCustomerModal
function BillingForm({ fatturazione, onChange }) {
  const upd = (k, v) => onChange({ ...fatturazione, [k]: v });
  return (
    <div className="space-y-3 fade-in">
      <div className="grid grid-cols-2 gap-2">
        {['privato', 'azienda'].map(tipo => (
          <button
            key={tipo}
            type="button"
            onClick={() => upd('tipo', tipo)}
            className={`p-2.5 rounded border text-sm text-left transition-all ${fatturazione.tipo === tipo ? 'border-[var(--ink)] bg-[var(--surface)]' : 'border-[var(--border)] bg-white'}`}
            aria-pressed={fatturazione.tipo === tipo}
          >
            {tipo === 'privato'
              ? <User className="w-4 h-4 mb-1" style={{ color: fatturazione.tipo === 'privato' ? 'var(--accent)' : 'var(--muted)' }} aria-hidden="true" />
              : <Building2 className="w-4 h-4 mb-1" style={{ color: fatturazione.tipo === 'azienda' ? 'var(--accent)' : 'var(--muted)' }} aria-hidden="true" />
            }
            <div className="font-medium text-xs capitalize">{tipo === 'azienda' ? 'Azienda · libero professionista' : 'Privato'}</div>
          </button>
        ))}
      </div>

      {fatturazione.tipo === 'azienda' && (
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Ragione sociale" req value={fatturazione.ragioneSociale || ''} onChange={v => upd('ragioneSociale', v)} />
          <FormField label="Partita IVA" req value={fatturazione.piva || ''} onChange={v => upd('piva', v)} mono />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Codice fiscale" req={fatturazione.tipo === 'privato'} value={fatturazione.cf || ''} onChange={v => upd('cf', v.toUpperCase())} mono />
        <FormField label="Indirizzo fatturazione" req value={fatturazione.indirizzo || ''} onChange={v => upd('indirizzo', v)} placeholder="Via, n., CAP, Città" />
      </div>

      {fatturazione.tipo === 'azienda' && (
        <>
          <div className="text-[11px] uppercase tracking-wider font-semibold mt-2" style={{ color: 'var(--muted)' }}>Fatturazione elettronica</div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Codice SDI" value={fatturazione.sdi || ''} onChange={v => upd('sdi', v.toUpperCase())} mono placeholder="7 caratteri" hint="alfanumerico, fornito dal cliente" />
            <FormField label="PEC fatturazione" value={fatturazione.pec || ''} onChange={v => upd('pec', v)} type="email" placeholder="...@pec.it" hint="alternativa al codice SDI" />
          </div>
          <div className="text-[10px] flex items-start gap-2 p-2 rounded" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
            <Info className="w-3 h-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>Almeno uno tra SDI e PEC è richiesto per la fatturazione elettronica (D.Lgs. 127/2015). Se mancanti, si usa <span className="mono">0000000</span>.</span>
          </div>
        </>
      )}
    </div>
  );
}

// Toggle (riutilizzabile per Admin, Billing)
function Toggle({ checked, onChange, label }) {
  return (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--ink)] ${checked ? 'bg-[var(--ink)]' : 'bg-[var(--border-strong)]'}`}
    >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  );
} 

// ═══════════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [wizardOpen, setWizardOpen] = useState(false);
  // Stato persistente su localStorage — sopravvive a refresh, riavvii del tablet, ecc.
  // Chiavi prefissate 'edo:v1:' per gestire migrazioni future senza confondersi con altre app.
  const [fleet, setFleet]           = usePersistentState('edo:v1:fleet',     []);
  const [customers, setCustomers]   = usePersistentState('edo:v1:customers', []);
  const [partners, setPartners]     = usePersistentState('edo:v1:partners',  []);
  const [operators, setOperators]   = usePersistentState('edo:v1:operators', []);
  const [cargosConfig, setCargosConfig] = usePersistentState('edo:v1:cargos', INITIAL_CARGOS_CONFIG);

  // Stato di sessione (non persistente — si resetta a ogni apertura)
  const [admin, setAdmin]                 = useState(false);
  const [online, setOnline]               = useState(true);
  const [pendingQueue, setPendingQueue]   = useState(0);
  const [operatorIdx, setOperatorIdx]     = useState(0);
  const [modal, setModal]                 = useState(null);
  const [prefillCustomer, setPrefillCustomer] = useState(null);

  // Toast system per feedback non-bloccanti
  const { toasts, push: pushToast, dismiss: dismissToast } = useToasts();

  const operator = operators.length > 0 ? (operators[operatorIdx] || operators[0]) : { id: 'loading', nome: '...', ruolo: '', turnoInizio: '08:00', turnoFine: '20:00' };

  useEffect(() => {
    if (!online && pendingQueue === 0) setPendingQueue(2);
    if (online && pendingQueue > 0) {
      const t = setTimeout(() => setPendingQueue(0), 1500);
      return () => clearTimeout(t);
    }
  }, [online, pendingQueue]);

  const openWizard = useCallback((prefill = null) => {
    setPrefillCustomer(prefill);
    setWizardOpen(true);
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const handoverShift = useCallback((newIdx) => {
    const newOp = operators[newIdx];
    setOperatorIdx(newIdx);
    setModal(null);
    if (newOp) {
      pushToast({ tone: 'info', title: 'Turno cambiato', message: `Banco affidato a ${newOp.nome}`, duration: 4500 });
    }
  }, [operators, pushToast]);

  // CRUD veicoli — con toast su successo
  const addVehicle = useCallback((v) => {
    setFleet(f => [...f, { ...v, id: makeId('v') }]);
    pushToast({ tone: 'success', title: 'Veicolo aggiunto', message: `${v.marca} ${v.modello}${v.targa ? ` · ${v.targa}` : ''}` });
  }, [pushToast]);

  const updateVehicle = useCallback((id, patch) => {
    setFleet(f => f.map(v => v.id === id ? { ...v, ...patch } : v));
    pushToast({ tone: 'success', title: 'Veicolo aggiornato', message: `${patch.marca || ''} ${patch.modello || ''}`.trim() });
  }, [pushToast]);

  const deleteVehicle = useCallback((id) => {
    const v = fleet.find(x => x.id === id);
    if (!v) return;
    setFleet(f => f.filter(x => x.id !== id));
    pushToast({ tone: 'warning', title: 'Veicolo eliminato', message: `${v.marca} ${v.modello}` });
  }, [fleet, pushToast]);

  // CRUD clienti
  const addCustomer = useCallback((c) => {
    setCustomers(cs => [...cs, { ...c, id: makeId('c'), visite: 0, vip: false }]);
    pushToast({ tone: 'success', title: 'Cliente aggiunto', message: `${c.cognome} ${c.nome}` });
  }, [pushToast]);

  const updateCustomer = useCallback((id, patch) => {
    setCustomers(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c));
    pushToast({ tone: 'success', title: 'Cliente aggiornato', message: `${patch.cognome || ''} ${patch.nome || ''}`.trim() });
  }, [pushToast]);

  // CRUD partner
  const addPartner = useCallback((p) => {
    setPartners(ps => [...ps, { ...p, id: makeId('s') }]);
    pushToast({ tone: 'success', title: 'Struttura aggiunta', message: p.nome });
  }, [pushToast]);

  const updatePartner = useCallback((id, patch) => {
    setPartners(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p));
    pushToast({ tone: 'success', title: 'Struttura aggiornata', message: patch.nome });
  }, [pushToast]);

  const deletePartner = useCallback((id) => {
    const p = partners.find(x => x.id === id);
    if (!p) return;
    setPartners(ps => ps.filter(x => x.id !== id));
    pushToast({ tone: 'warning', title: 'Struttura eliminata', message: p.nome });
  }, [partners, pushToast]);

  // CRUD operatori
  const addOperator = useCallback((o) => {
    setOperators(os => [...os, { ...o, id: makeId('op-') }]);
    pushToast({ tone: 'success', title: 'Operatore aggiunto', message: o.nome });
  }, [pushToast]);

  const updateOperator = useCallback((id, patch) => {
    setOperators(os => os.map(o => o.id === id ? { ...o, ...patch } : o));
    pushToast({ tone: 'success', title: 'Operatore aggiornato', message: patch.nome });
  }, [pushToast]);

  const deleteOperator = useCallback((id) => {
    const target = operators.find(o => o.id === id);
    if (!target || operators.length <= 1) return;
    // Protezione: non eliminare l'operatore attivo
    if (operators[operatorIdx] && target.id === operators[operatorIdx].id) {
      pushToast({ tone: 'warning', title: 'Operazione bloccata', message: `${target.nome} è in turno, non può essere eliminato` });
      return;
    }
    setOperators(os => os.filter(o => o.id !== id));
    const idx = operators.findIndex(o => o.id === id);
    if (idx !== -1 && idx < operatorIdx) {
      setOperatorIdx(i => Math.max(0, i - 1));
    }
    pushToast({ tone: 'warning', title: 'Operatore eliminato', message: target.nome });
  }, [operatorIdx, operators, pushToast]);

  // CARGOS config update — con toast
  const updateCargosConfig = useCallback((patch) => {
    setCargosConfig(c => ({ ...c, ...patch }));
    pushToast({ tone: 'success', title: 'CARGOS aggiornato', message: patch.enabled ? 'Invio automatico attivo' : 'Configurazione salvata' });
  }, [pushToast]);

  // ── CONFERME DI ELIMINAZIONE ──────────────────────────────────────
  // Invece di window.confirm() (bloccante, brutto su iOS), usiamo
  // ConfirmModal coerente con lo stile del resto dell'app.
  const requestDeleteVehicle = useCallback((id) => {
    const v = fleet.find(x => x.id === id);
    if (!v) return;
    setModal({
      type: 'confirm',
      title: `Eliminare ${v.marca} ${v.modello}?`,
      message: <>Questo veicolo verrà rimosso dalla flotta. {v.targa && <>Targa <strong className="mono">{v.targa}</strong>.</>} L'azione è irreversibile, ma puoi sempre riaggiungerlo.</>,
      confirmLabel: 'Elimina veicolo',
      onConfirm: () => deleteVehicle(id),
    });
  }, [fleet, deleteVehicle]);

  const requestDeletePartner = useCallback((id) => {
    const p = partners.find(x => x.id === id);
    if (!p) return;
    setModal({
      type: 'confirm',
      title: `Eliminare ${p.nome}?`,
      message: <>Questa struttura non sarà più selezionabile come luogo di ritiro o consegna nei nuovi contratti. I contratti già esistenti non vengono toccati.</>,
      confirmLabel: 'Elimina struttura',
      onConfirm: () => deletePartner(id),
    });
  }, [partners, deletePartner]);

  const requestDeleteOperator = useCallback((id) => {
    const op = operators.find(o => o.id === id);
    if (!op) return;
    setModal({
      type: 'confirm',
      title: `Eliminare ${op.nome}?`,
      message: <>L'operatore non potrà più accedere al banco. L'audit log dei suoi turni passati resta consultabile. L'azione è irreversibile.</>,
      confirmLabel: 'Elimina operatore',
      onConfirm: () => deleteOperator(id),
    });
  }, [operators, deleteOperator]);

  return (
    <>
      <Styles />
      <div className="pratica-app flex">
        <Sidebar page={page} setPage={setPage} onNew={() => openWizard()} online={online && cargosConfig.enabled} />
        <main className="flex-1 min-h-screen" id="main-content">
          <Topbar
            online={online} setOnline={setOnline} pendingQueue={pendingQueue}
            operator={operator} admin={admin} setAdmin={setAdmin}
            onScanPlate={() => setModal('plate')}
            onShiftChange={() => setModal('shift')}
          />
          <div className="px-8 py-6 max-w-[1280px] mx-auto">
            {page === 'dashboard'  && <Dashboard onNew={() => openWizard()} setPage={setPage} operator={operator} fleet={fleet} />}
            {page === 'contracts'  && <ContractsList />}
            {page === 'fleet'      && <FleetPage fleet={fleet} admin={admin} onAddVehicle={() => setModal('newVehicle')} onEditVehicle={(v) => setModal({ type: 'editVehicle', vehicle: v })} onDeleteVehicle={requestDeleteVehicle} />}
            {page === 'customers'  && <CustomersPage customers={customers} admin={admin} onShowQR={(c) => setModal({ type: 'qr', customer: c })} onNewWithCustomer={openWizard} onAddCustomer={() => setModal('newCustomer')} onEditCustomer={(c) => setModal({ type: 'editCustomer', customer: c })} />}
            {page === 'partners'   && <PartnersPage partners={partners} admin={admin} onAddPartner={() => setModal('newPartner')} onEditPartner={(p) => setModal({ type: 'editPartner', partner: p })} onDeletePartner={requestDeletePartner} />}
            {page === 'settings'   && <SettingsPage operator={operator} operators={operators} admin={admin} cargosConfig={cargosConfig} onAddOperator={() => setModal('newOperator')} onEditOperator={(o) => setModal({ type: 'editOperator', operator: o })} onDeleteOperator={requestDeleteOperator} onEditCargos={() => setModal('cargosConfig')} />}
          </div>
        </main>

        {wizardOpen && (
          <Wizard
            onClose={() => { setWizardOpen(false); setPrefillCustomer(null); }}
            prefillCustomer={prefillCustomer}
            operator={operator}
            fleet={fleet}
            customers={customers}
            partners={partners}
          />
        )}

        {modal === 'plate'        && <PlateScanModal fleet={fleet} onClose={closeModal} />}
        {modal === 'shift'        && <ShiftChangeModal currentOperator={operator} operators={operators} onClose={closeModal} onConfirm={handoverShift} />}
        {modal === 'newVehicle'   && <NewVehicleModal onClose={closeModal} onSave={(v) => { addVehicle(v); closeModal(); }} />}
        {modal === 'newCustomer'  && <NewCustomerModal onClose={closeModal} onSave={(c) => { addCustomer(c); closeModal(); }} />}
        {modal === 'newPartner'   && <NewPartnerModal onClose={closeModal} onSave={(p) => { addPartner(p); closeModal(); }} />}
        {modal === 'newOperator'  && <NewOperatorModal onClose={closeModal} onSave={(o) => { addOperator(o); closeModal(); }} />}
        {modal === 'cargosConfig' && <CargosConfigModal config={cargosConfig} onClose={closeModal} onSave={(c) => { updateCargosConfig(c); closeModal(); }} />}
        {modal?.type === 'qr'             && <QRCustomerModal customer={modal.customer} onClose={closeModal} />}
        {modal?.type === 'editVehicle'    && <NewVehicleModal vehicle={modal.vehicle} onClose={closeModal} onSave={(v) => { updateVehicle(modal.vehicle.id, v); closeModal(); }} />}
        {modal?.type === 'editPartner'    && <NewPartnerModal partner={modal.partner} onClose={closeModal} onSave={(p) => { updatePartner(modal.partner.id, p); closeModal(); }} />}
        {modal?.type === 'editCustomer'   && <NewCustomerModal customer={modal.customer} onClose={closeModal} onSave={(c) => { updateCustomer(modal.customer.id, c); closeModal(); }} />}
        {modal?.type === 'editOperator'   && <NewOperatorModal operator={modal.operator} onClose={closeModal} onSave={(o) => { updateOperator(modal.operator.id, o); closeModal(); }} />}
        {modal?.type === 'confirm'        && (
          <ConfirmModal
            title={modal.title}
            message={modal.message}
            confirmLabel={modal.confirmLabel}
            cancelLabel={modal.cancelLabel}
            variant={modal.variant}
            icon={modal.icon}
            onConfirm={modal.onConfirm}
            onClose={closeModal}
          />
        )}
      </div>
      <ToastContainer toasts={toasts} dismiss={dismissToast} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
      :root {
        --bg: #faf7f2; --surface: #ffffff; --surface-2: #f3eee5;
        --ink: #1a1815; --ink-2: #3a352e; --muted: #8a847b;
        --accent: #c83434; --accent-deep: #9c2424; --accent-soft: #f5e3df;
        --success: #4a6a30; --success-soft: #e8efde;
        --warning: #b07820; --warning-soft: #f5e8d0;
        --sea: #2d6c8b; --sea-soft: #d9e8f0;
        --border: #e6dfd2; --border-strong: #d4ccba;
        --radius: 5px;
      }
      .pratica-app, .pratica-app * { font-family: 'IBM Plex Sans', system-ui, sans-serif; box-sizing: border-box; }
      .pratica-app .serif { font-family: 'Newsreader', Georgia, serif; font-feature-settings: 'liga', 'dlig'; }
      .pratica-app .mono  { font-family: 'JetBrains Mono', ui-monospace, monospace; }
      .pratica-app { background: var(--bg); color: var(--ink); min-height: 100vh; }

      /* Navigation */
      .nav-item { color: var(--muted); transition: all 0.15s ease; border-radius: var(--radius); }
      .nav-item:hover { color: var(--ink); background: var(--surface-2); }
      .nav-item.active { color: var(--ink); background: var(--surface); border-color: var(--border-strong) !important; }
      .nav-item.active .dot { opacity: 1; }
      .dot { opacity: 0; width: 4px; height: 4px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

      /* Pills */
      .pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.02em; line-height: 1.4; }
      .pill-ok      { background: var(--success-soft); color: var(--success); }
      .pill-err     { background: var(--accent-soft);  color: var(--accent-deep); }
      .pill-warn    { background: var(--warning-soft); color: var(--warning); }
      .pill-neutral { background: var(--surface-2);    color: var(--ink-2); }
      .pill-sea     { background: var(--sea-soft);     color: var(--sea); }

      /* Buttons */
      .btn-primary { background: var(--ink); color: #f9f5ec; transition: background 0.15s, transform 0.1s; border-radius: var(--radius); }
      .btn-primary:hover:not(:disabled) { background: var(--accent); }
      .btn-primary:active:not(:disabled) { transform: translateY(1px); }
      .btn-ghost  { color: var(--ink-2); transition: background 0.15s; border-radius: var(--radius); }
      .btn-ghost:hover:not(:disabled) { background: var(--surface-2); }
      .btn-accent { background: var(--accent); color: white; transition: background 0.15s, transform 0.1s; border-radius: var(--radius); }
      .btn-accent:hover:not(:disabled) { background: var(--accent-deep); }
      .btn-accent:active:not(:disabled) { transform: translateY(1px); }
      button:disabled, button[aria-disabled="true"] { opacity: 0.4; cursor: not-allowed; }

      /* Cards */
      .card       { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; }
      .card-paper { background: var(--surface); border: 1px solid var(--border); border-radius: 3px; box-shadow: 0 1px 0 rgba(26,24,21,0.04); }

      /* Forms */
      .input { background: var(--surface); border: 1px solid var(--border); padding: 9px 11px; border-radius: 4px; width: 100%; font-size: 14px; transition: border-color 0.15s, box-shadow 0.15s; }
      .input:focus { outline: none; border-color: var(--ink); box-shadow: 0 0 0 3px rgba(26,24,21,0.07); }
      .input.mono { font-family: 'JetBrains Mono', monospace; font-size: 13px; }
      .label { font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); margin-bottom: 5px; display: block; }
      .label .req { color: var(--accent); margin-left: 2px; }

      /* Wizard steps */
      .step-num { width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
      .step-num.active { background: var(--ink); color: #f9f5ec; }
      .step-num.done   { background: var(--success); color: white; }
      .step-num.todo   { background: var(--surface-2); color: var(--muted); border: 1px solid var(--border); }

      /* Vehicle cards */
      .vehicle-card { transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s; cursor: pointer; }
      .vehicle-card:hover { border-color: var(--ink-2); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(26,24,21,0.08); }
      .vehicle-card.selected { border-color: var(--ink); background: var(--surface); box-shadow: 0 0 0 1px var(--ink) inset; }

      /* Stat cards — colored top border instead of noisy stripe */
      .stat-accent { border-top: 3px solid var(--accent); }

      /* Misc */
      .divider-dotted { border-top: 1px dashed rgba(212,204,186,0.6); }
      .json-block { background: #1a1815; color: #e8e2d4; border-radius: 4px; padding: 14px; font-size: 12px; line-height: 1.6; overflow-x: auto; }
      .json-block .k { color: #d4a04d; } .json-block .s { color: #9ec38f; }
      .json-block .n { color: #d47c7c; } .json-block .c { color: #6b6660; font-style: italic; }

      /* Animations */
      @keyframes slideUp  { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes fadeIn   { from { opacity: 0; } to { opacity: 1; } }
      @keyframes pulseDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      @keyframes pulseRed { 0%, 100% { box-shadow: 0 0 0 0 rgba(200,52,52,0.5); } 50% { box-shadow: 0 0 0 6px rgba(200,52,52,0); } }
      @keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }

      .slide-up  { animation: slideUp 0.25s ease-out; }
      .fade-in   { animation: fadeIn  0.2s ease-out; }
      .pulse     { animation: pulseDot 1.4s ease-in-out infinite; }
      .pulse-red { animation: pulseRed 1.6s ease-in-out infinite; }
      .scan-line { position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); animation: scanLine 2s ease-in-out infinite; }

      /* Scroll */
      .overflow-y-auto { scroll-behavior: smooth; }

      /* Print */
      @media print {
        .no-print { display: none !important; }
        body { background: white !important; }
      }

      /* Focus visible global */
      .pratica-app :focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; border-radius: 3px; }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════════
function Sidebar({ page, setPage, onNew, online }) {
  const items = [
    { id: 'dashboard', label: 'Banco',        icon: LayoutDashboard },
    { id: 'contracts', label: 'Pratiche',     icon: FileText },
    { id: 'fleet',     label: 'Flotta',       icon: Car },
    { id: 'customers', label: 'Clienti',      icon: Users },
    { id: 'partners',  label: 'Strutture',    icon: Hotel },
    { id: 'settings',  label: 'Impostazioni', icon: Settings },
  ];

  return (
    <aside
      className="w-60 border-r flex-shrink-0 flex flex-col"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
      aria-label="Navigazione principale"
    >
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-baseline gap-2">
          <span className="serif text-3xl font-semibold tracking-tight" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>edo</span>
          <span className="serif italic text-2xl" style={{ color: 'var(--accent)', lineHeight: 1 }}>·</span>
          <span className="serif text-2xl font-medium" style={{ color: 'var(--ink-2)' }}>pratica</span>
        </div>
        <p className="text-[10px] mt-2 tracking-widest uppercase leading-relaxed" style={{ color: 'var(--muted)' }}>
          Edonoleggio · Lampedusa<br />dal {AGENCY.fondazione}
        </p>
      </div>

      <button
        type="button"
        onClick={onNew}
        className="btn-accent mx-4 mb-5 px-4 py-2.5 rounded text-sm font-semibold flex items-center justify-center gap-2"
        aria-label="Crea nuova pratica di noleggio"
      >
        <Plus className="w-4 h-4" aria-hidden="true" /> Nuova pratica
      </button>

      <nav className="px-3 flex-1" aria-label="Sezioni app">
        {items.map(it => {
          const Icon = it.icon;
          const active = page === it.id;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => setPage(it.id)}
              className={`nav-item w-full flex items-center gap-3 px-3 py-2 rounded text-sm border border-transparent mb-0.5 ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span className="flex-1 text-left">{it.label}</span>
              <span className="dot" aria-hidden="true" />
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Stato CARGOS</div>
        <div className="flex items-center gap-2 text-xs" aria-live="polite">
          <span className="w-2 h-2 rounded-full pulse" style={{ background: online ? 'var(--success)' : 'var(--accent)' }} aria-hidden="true" />
          <span style={{ color: 'var(--ink-2)' }}>{online ? 'Connesso · Questura AG' : 'Disconnesso'}</span>
        </div>
        <div className="text-[11px] mt-1 mono" style={{ color: 'var(--muted)' }}>
          {online ? 'token attivo · 23 min' : 'in attesa di rete'}
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TOPBAR
// ═══════════════════════════════════════════════════════════════════
function Topbar({ online, setOnline, pendingQueue, operator, admin, setAdmin, onScanPlate, onShiftChange }) {
  return (
    <header className="border-b px-8 py-3 flex items-center gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink-2)' }}>
        <Building2 className="w-4 h-4" aria-hidden="true" />
        <span className="font-medium">{AGENCY.nome}</span>
        <span style={{ color: 'var(--muted)' }}>· {AGENCY.indirizzoLegale}, {AGENCY.citta}</span>
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={() => setAdmin(!admin)}
        className="flex items-center gap-2 px-3 py-1.5 rounded text-xs border transition-all"
        style={{
          borderColor: admin ? 'var(--accent)' : 'var(--border)',
          background: admin ? 'var(--accent-soft)' : 'transparent',
          color: admin ? 'var(--accent-deep)' : 'var(--ink-2)',
        }}
        aria-pressed={admin}
        title={admin ? 'Disattiva modalità amministratore' : 'Attiva modalità amministratore'}
      >
        {admin ? <Unlock className="w-3.5 h-3.5" aria-hidden="true" /> : <Lock className="w-3.5 h-3.5" aria-hidden="true" />}
        <span className="font-semibold">Admin</span>
        {admin && <span className="w-1.5 h-1.5 rounded-full pulse" style={{ background: 'var(--accent)' }} aria-hidden="true" />}
      </button>

      <button
        type="button"
        onClick={() => setOnline(!online)}
        className="flex items-center gap-2 px-3 py-1.5 rounded text-xs border transition-all"
        style={{
          borderColor: online ? 'var(--border)' : 'var(--warning)',
          background: online ? 'transparent' : 'var(--warning-soft)',
          color: online ? 'var(--ink-2)' : 'var(--warning)',
        }}
        aria-pressed={!online}
        title="Simula offline/online"
      >
        {online
          ? <><Wifi className="w-3.5 h-3.5" aria-hidden="true" /><span>Online</span></>
          : <><WifiOff className="w-3.5 h-3.5" aria-hidden="true" /><span>Offline · <strong>{pendingQueue}</strong> in coda</span></>
        }
      </button>

      <button
        type="button"
        onClick={onScanPlate}
        className="btn-ghost px-3 py-1.5 rounded text-xs flex items-center gap-1.5 border"
        style={{ borderColor: 'var(--border)' }}
        aria-label="Apri lettore targa"
      >
        <ScanSearch className="w-3.5 h-3.5" aria-hidden="true" /> Targa
      </button>

      <div className="relative">
        <label htmlFor="topbar-search" className="sr-only">Cerca pratica</label>
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted)' }} aria-hidden="true" />
        <input id="topbar-search" className="input pl-9" style={{ width: 200 }} placeholder="Cerca pratica…" type="search" />
      </div>

      <button
        type="button"
        onClick={onShiftChange}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded border transition-all hover:bg-[var(--surface-2)]"
        style={{ borderColor: 'var(--border)' }}
        aria-label={`Operatore: ${operator.nome}. Clicca per cambio turno`}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold" style={{ background: 'var(--ink)', color: '#f9f5ec' }} aria-hidden="true">
          {operator.initials}
        </div>
        <div className="text-left">
          <div className="text-xs font-medium leading-tight">{operator.nome.split(' ')[0]}</div>
          <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{operator.ruolo}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} aria-hidden="true" />
      </button>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════
function Dashboard({ onNew, setPage, operator }) {
  const stats = [
    { k: 'Pratiche oggi',    v: 5,  sub: '2 auto · 1 scoot · 1 quad · 1 e-bike', accent: false },
    { k: 'Inviate a CARGOS', v: 1,  sub: 'su 2 dovute (solo auto)',               accent: false },
    { k: 'In errore',        v: 1,  sub: 'richiede attenzione',                   accent: true  },
    { k: 'Veicoli fuori',    v: 12, sub: 'rientri previsti oggi: 3',              accent: false },
  ];
  const returns = useMemo(() => MOCK_CONTRACTS.filter(c => c.fuori && c.minutiAlRientro !== null), []);

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Venerdì · 8 maggio 2026 · Lampedusa</p>
          <h2 className="serif text-4xl font-medium tracking-tight">Buongiorno, {operator.nome.split(' ')[0]}.</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-2)' }}>
            <span style={{ color: 'var(--accent)' }}>1 pratica</span> richiede la tua attenzione ·{' '}
            <span style={{ color: 'var(--accent)' }}>1 rientro in ritardo</span>.
          </p>
        </div>
        <button type="button" onClick={onNew} className="btn-primary px-5 py-2.5 rounded text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" aria-hidden="true" /> Nuova pratica
        </button>
      </div>

      {/* Stat cards — colored top border instead of distracting stripe */}
      <div className="grid grid-cols-4 gap-3 mb-6" role="list" aria-label="Statistiche giornaliere">
        {stats.map(s => (
          <div key={s.k} className={`card-paper p-5 ${s.accent ? 'stat-accent' : ''}`} role="listitem">
            <div className="text-[11px] uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>{s.k}</div>
            <div className="serif text-4xl font-medium" style={{ color: s.accent ? 'var(--accent)' : 'var(--ink)' }}>{s.v}</div>
            <div className="text-xs mt-2" style={{ color: 'var(--ink-2)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <ReturnsPanel returns={returns} />

      <div className="card-paper">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h3 className="serif text-xl font-medium">Pratiche di oggi</h3>
          <button type="button" onClick={() => setPage('contracts')} className="text-xs flex items-center gap-1 btn-ghost px-2 py-1 rounded">
            Vedi tutte <ChevronRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
        <table className="w-full" aria-label="Pratiche di oggi">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              <th scope="col" className="text-left px-5 py-3 font-semibold">ID</th>
              <th scope="col" className="text-left px-2 py-3 font-semibold">Tipo</th>
              <th scope="col" className="text-left px-2 py-3 font-semibold">Cliente</th>
              <th scope="col" className="text-left px-2 py-3 font-semibold">Veicolo</th>
              <th scope="col" className="text-left px-2 py-3 font-semibold">Periodo</th>
              <th scope="col" className="text-left px-2 py-3 font-semibold">Stato</th>
              <th scope="col" className="text-right px-5 py-3 font-semibold">Azione</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CONTRACTS.map(c => {
              const t = VEHICLE_TYPES[c.tipo];
              return (
                <tr key={c.id} className="border-t hover:bg-[var(--surface-2)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-5 py-3">
                    <div className="mono text-xs" style={{ color: 'var(--ink-2)' }}>{c.id}</div>
                    <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{c.data}</div>
                  </td>
                  <td className="px-2 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: t.cargosRequired ? 'var(--ink)' : 'var(--muted)' }}>
                      <VehicleIcon type={c.tipo} className="w-3.5 h-3.5" /> {t.short}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-sm">{c.cliente}</td>
                  <td className="px-2 py-3 text-sm" style={{ color: 'var(--ink-2)' }}>{c.veicolo}</td>
                  <td className="px-2 py-3 text-xs" style={{ color: 'var(--ink-2)' }}>{c.ritiro} → {c.consegna}</td>
                  <td className="px-2 py-3"><StatusPill stato={c.stato} /></td>
                  <td className="px-5 py-3 text-right">
                    {c.stato === 'errore' && (
                      <button type="button" className="btn-accent px-3 py-1.5 rounded text-xs font-medium">Reinvia</button>
                    )}
                    {(c.stato === 'inviato' || c.stato === 'cartaceo' || c.stato === 'bozza') && (
                      <button type="button" className="btn-ghost px-2 py-1.5 rounded text-xs flex items-center gap-1 ml-auto" aria-label={`Apri pratica ${c.id}`}>
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" /> Apri
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── StatusPill — memoized ──────────────────────────────────────────
const StatusPill = memo(function StatusPill({ stato }) {
  if (stato === 'inviato')  return <span className="pill pill-ok"><Check className="w-3 h-3" aria-hidden="true" /> Inviato</span>;
  if (stato === 'errore')   return <span className="pill pill-err"><AlertCircle className="w-3 h-3" aria-hidden="true" /> Errore</span>;
  if (stato === 'bozza')    return <span className="pill pill-neutral"><Clock className="w-3 h-3" aria-hidden="true" /> Bozza</span>;
  if (stato === 'cartaceo') return <span className="pill pill-warn"><FileText className="w-3 h-3" aria-hidden="true" /> Cartaceo</span>;
  return null;
});

function ReturnsPanel({ returns }) {
  const overdue   = useMemo(() => returns.filter(r => r.minutiAlRientro < 0), [returns]);
  const imminent  = useMemo(() => returns.filter(r => r.minutiAlRientro >= 0 && r.minutiAlRientro <= 90), [returns]);
  const scheduled = useMemo(() => returns.filter(r => r.minutiAlRientro > 90), [returns]);

  const fmtTime = useCallback((mins) =>
    mins < 0 ? `${Math.abs(mins)} min in ritardo`
    : mins < 60 ? `tra ${mins} min`
    : `tra ${Math.floor(mins / 60)}h ${mins % 60}m`
  , []);

  return (
    <div className="card-paper mb-6 overflow-hidden">
      <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
        <Timer className="w-4 h-4" style={{ color: 'var(--accent)' }} aria-hidden="true" />
        <h3 className="serif text-lg font-medium">Rientri di oggi</h3>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>· {returns.length} previsti</span>
        <div className="flex-1" />
        {/* aria-live per aggiornamenti urgenti */}
        <div aria-live="assertive" aria-atomic="true" className="flex items-center gap-2">
          {overdue.length > 0  && <span className="pill pill-err pulse-red" role="alert"><AlertCircle className="w-3 h-3" aria-hidden="true" /> {overdue.length} in ritardo</span>}
          {imminent.length > 0 && <span className="pill pill-warn"><Clock className="w-3 h-3" aria-hidden="true" /> {imminent.length} imminenti</span>}
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'var(--border)' }}>
        <ReturnColumn title="In ritardo" color="var(--accent)" items={overdue} empty="Nessuno · ottimo lavoro" fmtTime={fmtTime} urgent />
        <ReturnColumn title="Imminenti"  color="var(--warning)" items={imminent} empty="Nessuno nelle prossime 1.5h" fmtTime={fmtTime} />
        <ReturnColumn title="Programmati" color="var(--muted)" items={scheduled} empty="Nessuno" fmtTime={fmtTime} muted />
      </div>
    </div>
  );
}

function ReturnColumn({ title, color, items, empty, fmtTime, urgent, muted }) {
  return (
    <div className="p-4">
      <div className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color }}>{title}</div>
      {items.length === 0
        ? <div className="text-xs py-2" style={{ color: 'var(--muted)' }}>{empty}</div>
        : items.map(r => (
          <div key={r.id} className={`flex items-start gap-3 py-2 ${urgent ? 'pulse-red rounded px-2 -mx-2' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{r.cliente}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                <span className="mono">{r.veicolo.split(' · ')[1]}</span> · {r.veicolo.split(' · ')[0]}
              </div>
              <div className="text-[11px] mt-1 font-medium" style={{ color: urgent ? 'var(--accent)' : muted ? 'var(--muted)' : 'var(--warning)' }}>
                {muted ? r.consegnaTimestamp : fmtTime(r.minutiAlRientro)}
              </div>
            </div>
            {!muted && (
              <button type="button" className="btn-ghost p-1.5 rounded border flex-shrink-0" style={{ borderColor: 'var(--border)' }} aria-label={`Chiama ${r.cliente}`}>
                <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        ))
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONTRACTS LIST
// ═══════════════════════════════════════════════════════════════════
function ContractsList() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/contracts?limit=200`)
      .then(r => r.json())
      .then(data => { setContracts(data.contracts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = contracts.filter(c => {
    if (filter === 'paper') return c.status === 'paper';
    if (filter === 'cargos') return c.cargos_required;
    return true;
  });

  return (
    <div>
      <h2 className="serif text-3xl font-medium mb-1">Pratiche</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
        Archivio completo dei contratti generati
      </p>
      <div className="card-paper">
        <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
          <button type="button" onClick={() => setFilter('all')} className={`btn-ghost px-3 py-1.5 rounded text-xs ${filter === 'all' ? 'font-bold' : ''}`}>Tutte</button>
          <button type="button" onClick={() => setFilter('cargos')} className={`btn-ghost px-3 py-1.5 rounded text-xs ${filter === 'cargos' ? 'font-bold' : ''}`}>Solo CARGOS (auto)</button>
          <button type="button" onClick={() => setFilter('paper')} className={`btn-ghost px-3 py-1.5 rounded text-xs ${filter === 'paper' ? 'font-bold' : ''}`}>Solo cartacei</button>
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>Caricamento...</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>Nessuna pratica trovata</div>
        ) : (
          <table className="w-full" aria-label="Archivio pratiche">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                <th scope="col" className="text-left px-5 py-3 font-semibold">ID</th>
                <th scope="col" className="text-left px-2 py-3 font-semibold">Tipo</th>
                <th scope="col" className="text-left px-2 py-3 font-semibold">Stato</th>
                <th scope="col" className="text-left px-2 py-3 font-semibold">Data</th>
                <th scope="col" className="text-right px-5 py-3 font-semibold">Azione</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-5 py-3 font-mono text-xs">{c.id}</td>
                  <td className="px-2 py-3 text-sm">{c.vehicle_type}</td>
                  <td className="px-2 py-3">
                    <span className={`pill ${c.status === 'sent' ? 'pill-sea' : c.status === 'error' ? 'pill-err' : 'pill-ink'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-sm">{new Date(c.created_at).toLocaleDateString('it-IT')}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        fetch(`${BACKEND_URL}/api/contracts/${c.id}`)
                          .then(r => r.json())
                          .then(full => setSelectedContract(full));
                      }}
                      className="btn-ghost px-3 py-1 rounded text-xs"
                    >
                      Dettagli / PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirm(`Cancellare la pratica ${c.id}?`)) return;
                        fetch(`${BACKEND_URL}/api/contracts/${c.id}`, { method: 'DELETE' })
                          .then(r => r.json())
                          .then(res => {
                            if (res.ok) setContracts(prev => prev.filter(x => x.id !== c.id));
                            else alert('Errore durante la cancellazione');
                          });
                      }}
                      className="btn-ghost px-3 py-1 rounded text-xs"
                      style={{ color: 'var(--err)' }}
                    >
                      Cancella
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selectedContract && (
        <ContractPdfModal
          data={selectedContract.payload}
          operator={{}}
          partners={[]}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════
// FLEET
// ═══════════════════════════════════════════════════════════════════
function FleetPage({ fleet, admin, onAddVehicle, onEditVehicle, onDeleteVehicle }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const counts = useFleetCounts(fleet);

  const statusCounts = useMemo(() => {
    const c = { all: fleet.length, available: 0, fermo: 0, incidentato: 0, venduto: 0 };
    for (const v of fleet) c[v.stato || 'available'] = (c[v.stato || 'available'] || 0) + 1;
    return c;
  }, [fleet]);

  const filtered = useMemo(() => {
    let f = typeFilter === 'all' ? fleet : fleet.filter(v => v.tipo === typeFilter);
    if (statusFilter !== 'all') f = f.filter(v => (v.stato || 'available') === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      f = f.filter(v =>
        (v.targa || '').toLowerCase().includes(q) ||
        (v.marca || '').toLowerCase().includes(q) ||
        (v.modello || '').toLowerCase().includes(q) ||
        (v.colore || '').toLowerCase().includes(q)
      );
    }
    return f;
  }, [fleet, typeFilter, statusFilter, query]);

  const filters = [
    { id: 'all',     label: 'Tutti',   n: fleet.length },
    { id: 'auto',    label: 'Auto',    n: counts.auto },
    { id: 'scooter', label: 'Scooter', n: counts.scooter },
    { id: 'quad',    label: 'Quad',    n: counts.quad },
    { id: 'ebike',   label: 'E-bike',  n: counts.ebike },
  ];

  const statusFilters = [
    { id: 'all',         label: 'Tutti',       n: fleet.length },
    { id: 'available',   label: 'Disponibili', n: statusCounts.available || 0 },
    { id: 'fermo',       label: 'Fermi',       n: statusCounts.fermo || 0 },
    { id: 'incidentato', label: 'Incidentati', n: statusCounts.incidentato || 0 },
    { id: 'venduto',     label: 'Venduti',     n: statusCounts.venduto || 0 },
  ].filter(s => s.id === 'all' || s.n > 0);

  return (
    <div>
      <div className="flex items-end justify-between mb-1">
        <div>
          <h2 className="serif text-3xl font-medium">Flotta</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {fleet.length} veicoli · {counts.auto} auto · {counts.scooter} scooter · {counts.quad} quad · {counts.ebike} e-bike
            {statusCounts.fermo > 0 && <span style={{ color: 'var(--warning)' }}> · {statusCounts.fermo} fermi</span>}
            {statusCounts.incidentato > 0 && <span style={{ color: 'var(--accent)' }}> · {statusCounts.incidentato} incidentati</span>}
          </p>
        </div>
        {admin && (
          <button type="button" onClick={onAddVehicle} className="btn-primary px-4 py-2 rounded text-sm font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" aria-hidden="true" /> Nuovo veicolo
          </button>
        )}
      </div>

      <div className="flex gap-2 mt-5 mb-2 flex-wrap" role="group" aria-label="Filtra per tipo veicolo">
        {filters.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTypeFilter(t.id)}
            className={`px-3 py-1.5 rounded text-xs flex items-center gap-2 border transition-all ${typeFilter === t.id ? 'btn-primary border-transparent' : 'btn-ghost'}`}
            style={{ borderColor: typeFilter === t.id ? 'transparent' : 'var(--border)' }}
            aria-pressed={typeFilter === t.id}
          >
            {t.id !== 'all' && <VehicleIcon type={t.id} className="w-3.5 h-3.5" />}
            {t.label}
            <span className="opacity-60" aria-label={`${t.n} veicoli`}>{t.n}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap" role="group" aria-label="Filtra per stato veicolo">
        {statusFilters.map(s => {
          const meta = s.id !== 'all' ? VEHICLE_STATUS[s.id] : null;
          const Icon = meta?.icon;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStatusFilter(s.id)}
              className={`px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 border transition-all ${statusFilter === s.id ? 'border-[var(--ink)]' : 'btn-ghost'}`}
              style={{ borderColor: statusFilter === s.id ? 'var(--ink)' : 'var(--border)' }}
              aria-pressed={statusFilter === s.id}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {s.label}
              <span className="opacity-60">{s.n}</span>
            </button>
          );
        })}
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} aria-hidden="true" />
        <input className="input pl-9" placeholder="Cerca per targa, marca, modello, colore…" value={query} onChange={e => setQuery(e.target.value)} />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-0.5 rounded" aria-label="Cancella ricerca">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {!admin && (
        <ReadonlyBanner message={<>Modalità sola lettura · attiva <strong>Admin</strong> in alto a destra per aggiungere o modificare veicoli.</>} />
      )}

      {filtered.length === 0 ? (
        <div className="card-paper p-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
          Nessun veicolo trovato{query && ` per "${query}"`}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(v => {
            const t = VEHICLE_TYPES[v.tipo];
            const status = VEHICLE_STATUS[v.stato] || VEHICLE_STATUS.available;
            const StatusIcon = status.icon;
            const dimmed = v.stato === 'venduto';
            return (
              <div key={v.id} className="card-paper p-5 group relative" style={{ opacity: dimmed ? 0.55 : 1 }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="serif text-lg font-medium leading-tight">{v.marca}</div>
                    <div className="text-sm" style={{ color: 'var(--ink-2)' }}>{v.modello}</div>
                  </div>
                  <VehicleIcon type={v.tipo} className="w-5 h-5" />
                </div>
                <div className="mono text-sm font-semibold tracking-wider px-2 py-1 inline-block rounded" style={{ background: 'var(--surface-2)', color: 'var(--ink)' }}>
                  {v.targa}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3 text-[11px] items-center">
                  {v.stato && v.stato !== 'available' && (
                    <span className={`pill ${status.pill}`}>
                      <StatusIcon className="w-3 h-3" /> {status.label}
                    </span>
                  )}
                  {v.colore && <span style={{ color: 'var(--muted)' }}>{v.colore}</span>}
                  {v.cilindrata && <span style={{ color: 'var(--muted)' }}>· {v.cilindrata}</span>}
                  {v.anno && <span style={{ color: 'var(--muted)' }}>· {v.anno}</span>}
                  {v.gps === 1    && <span className="pill pill-neutral">GPS</span>}
                  {v.blocco === 1 && <span className="pill pill-neutral">Blocco motore</span>}
                  {!t.cargosRequired && <span className="pill pill-sea" title="Non soggetto a CARGOS">no CARGOS</span>}
                </div>
                {admin && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button type="button" onClick={() => onEditVehicle(v)} className="btn-ghost p-1.5 rounded border bg-white" style={{ borderColor: 'var(--border)' }} aria-label={`Modifica ${v.marca} ${v.modello}`}>
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteVehicle(v.id)}
                      className="btn-ghost p-1.5 rounded border bg-white"
                      style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
                      aria-label={`Elimina ${v.marca} ${v.modello}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════════════
function CustomersPage({ customers, admin, onShowQR, onNewWithCustomer, onAddCustomer, onEditCustomer }) {
  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="serif text-3xl font-medium mb-1">Clienti</h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {customers.length} clienti in rubrica · GDPR compliant · QR personali generabili
          </p>
        </div>
        {admin && (
          <button type="button" onClick={onAddCustomer} className="btn-primary px-4 py-2 rounded text-sm font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" aria-hidden="true" /> Nuovo cliente
          </button>
        )}
      </div>

      {!admin && (
        <ReadonlyBanner message={<>Modalità sola lettura · attiva <strong>Admin</strong> per aggiungere clienti dalla rubrica. (I clienti possono comunque essere creati direttamente da una nuova pratica.)</>} />
      )}

      <div className="card-paper" role="list" aria-label="Rubrica clienti">
        {customers.map(c => (
          <div key={c.id} className="px-5 py-4 border-b flex items-center gap-5 hover:bg-[var(--surface-2)] last:border-b-0" style={{ borderColor: 'var(--border)' }} role="listitem">
            <div className="w-10 h-10 rounded-full flex items-center justify-center serif font-medium relative flex-shrink-0" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }} aria-hidden="true">
              {getInitials(c.nome, c.cognome)}
              {c.vip && <Star className="w-3.5 h-3.5 absolute -top-1 -right-1 fill-current" style={{ color: 'var(--warning)' }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium flex items-center gap-2 flex-wrap">
                {c.cognome} {c.nome}
                {c.vip && <span className="pill pill-warn">VIP · {c.visite} visite</span>}
                {!c.vip && c.visite > 1 && <span className="pill pill-neutral">{c.visite} visite</span>}
                {c.fatturazione && (
                  <span className="pill pill-sea" title={c.fatturazione.tipo === 'azienda' ? 'Fatturazione azienda configurata' : 'Fatturazione privato configurata'}>
                    <FileText className="w-3 h-3" aria-hidden="true" /> Fattura {c.fatturazione.tipo === 'azienda' ? 'azienda' : 'privato'}
                  </span>
                )}
              </div>
              <div className="text-xs flex flex-wrap gap-x-4 gap-y-0.5 mt-1" style={{ color: 'var(--muted)' }}>
                <span>{c.cittadinanza}</span>
                <span className="mono">{TIPO_DOC[c.docTipo]}: {c.docNum}</span>
                {c.tel   && <span className="flex items-center gap-1"><Phone className="w-3 h-3" aria-hidden="true" /> <span className="mono">{c.tel}</span></span>}
                {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3"  aria-hidden="true" /> {c.email}</span>}
              </div>
              {c.fatturazione?.tipo === 'azienda' && c.fatturazione.ragioneSociale && (
                <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>
                  <Building2 className="w-3 h-3 inline mr-1" aria-hidden="true" />
                  {c.fatturazione.ragioneSociale} · P.IVA <span className="mono">{c.fatturazione.piva}</span>
                </div>
              )}
            </div>
            <button type="button" onClick={() => onShowQR(c)} className="btn-ghost p-2 rounded border" style={{ borderColor: 'var(--border)' }} aria-label={`Mostra QR di ${c.nome} ${c.cognome}`}>
              <QrCode className="w-4 h-4" aria-hidden="true" />
            </button>
            {admin && (
              <button type="button" onClick={() => onEditCustomer(c)} className="btn-ghost p-2 rounded border" style={{ borderColor: 'var(--border)' }} aria-label={`Modifica ${c.nome} ${c.cognome}`}>
                <Pencil className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <button type="button" onClick={() => onNewWithCustomer(c)} className="btn-primary px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5" aria-label={`Nuova pratica per ${c.nome} ${c.cognome}`}>
              <Plus className="w-3 h-3" aria-hidden="true" /> Nuova pratica
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PARTNERS
// ═══════════════════════════════════════════════════════════════════
function PartnersPage({ partners, admin, onAddPartner, onEditPartner, onDeletePartner }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const c = { all: partners.length };
    for (const p of partners) c[p.tipo] = (c[p.tipo] || 0) + 1;
    return c;
  }, [partners]);

  const filtered = useMemo(() => {
    let f = typeFilter === 'all' ? partners : partners.filter(p => p.tipo === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      f = f.filter(p => p.nome.toLowerCase().includes(q) || p.indirizzo.toLowerCase().includes(q));
    }
    return f;
  }, [partners, typeFilter, query]);

  const filterOrder = ['all', 'hotel', 'resort', 'residence', 'guesthouse', 'bb', 'appartamento', 'casa', 'sede', 'aeroporto', 'porto'];
  const visibleFilters = filterOrder.filter(t => t === 'all' || (counts[t] || 0) > 0);

  return (
    <div>
      <div className="flex items-end justify-between mb-1">
        <div>
          <h2 className="serif text-3xl font-medium">Strutture partner</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {partners.length} luoghi · ritiro/consegna pre-configurati per snellire il banco
          </p>
        </div>
        {admin && (
          <button type="button" onClick={onAddPartner} className="btn-primary px-4 py-2 rounded text-sm font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" aria-hidden="true" /> Nuova struttura
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-5 mb-3" role="group" aria-label="Filtra per tipo struttura">
        {visibleFilters.map(t => {
          const label = t === 'all' ? 'Tutte' : (PARTNER_TYPES[t]?.label || t);
          const Icon = t === 'all' ? null : iconForTipo(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded text-xs flex items-center gap-2 border transition-all ${typeFilter === t ? 'btn-primary border-transparent' : 'btn-ghost'}`}
              style={{ borderColor: typeFilter === t ? 'transparent' : 'var(--border)' }}
              aria-pressed={typeFilter === t}
            >
              {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
              {label}
              <span className="opacity-60">{counts[t] || 0}</span>
            </button>
          );
        })}
      </div>

      <div className="relative mb-4">
        <label htmlFor="partner-search" className="sr-only">Cerca struttura per nome o indirizzo</label>
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted)' }} aria-hidden="true" />
        <input
          id="partner-search"
          type="search"
          className="input pl-9"
          placeholder="Cerca per nome o indirizzo…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-0.5 rounded" aria-label="Cancella ricerca">
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {!admin && (
        <ReadonlyBanner message={<>Modalità sola lettura · attiva <strong>Admin</strong> per aggiungere, modificare o eliminare strutture.</>} />
      )}

      {filtered.length === 0 ? (
        <div className="card-paper p-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
          Nessuna struttura trovata{query && ` per "${query}"`}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(p => {
            const Icon = iconForTipo(p.tipo);
            const indirizzoCompleto = p.indirizzo && p.indirizzo !== 'Lampedusa (AG)';
            return (
              <div key={p.id} className="card-paper p-4 group relative">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-2)', color: p.fissa ? 'var(--accent)' : 'var(--ink-2)' }}>
                    <Icon style={{ width: 18, height: 18 }} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="serif text-base font-medium leading-tight">{p.nome}</div>
                      {p.fissa && <span className="pill pill-warn"><Star className="w-3 h-3 fill-current" aria-hidden="true" /> Fisso</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="pill pill-neutral">{PARTNER_TYPES[p.tipo]?.label || p.tipo}</span>
                      {!indirizzoCompleto && !p.fissa && (
                        <span className="pill pill-warn" title="Aggiungi l'indirizzo per migliorare i contratti">
                          <AlertTriangle className="w-3 h-3" aria-hidden="true" /> Indirizzo da completare
                        </span>
                      )}
                    </div>
                    {indirizzoCompleto && (
                      <div className="text-[11px] mt-1.5 flex items-start gap-1" style={{ color: 'var(--muted)' }}>
                        <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="leading-snug">{p.indirizzo}</span>
                      </div>
                    )}
                  </div>
                </div>
                {admin && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button type="button" onClick={() => onEditPartner(p)} className="btn-ghost p-1.5 rounded border bg-white" style={{ borderColor: 'var(--border)' }} aria-label={`Modifica ${p.nome}`}>
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    {!p.fissa && (
                      <button
                        type="button"
                        onClick={() => onDeletePartner(p.id)}
                        className="btn-ghost p-1.5 rounded border bg-white"
                        style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
                        aria-label={`Elimina ${p.nome}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {admin && (
        <div className="mt-6 p-4 rounded card-paper flex gap-3">
          <Compass className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} aria-hidden="true" />
          <div>
            <div className="font-medium text-sm">Suggerimento per gli indirizzi</div>
            <div className="text-xs mt-1" style={{ color: 'var(--ink-2)' }}>
              Per le strutture con indirizzo "Lampedusa (AG)" generico, modifica e completa con il nome della via per migliorare i contratti stampati. Puoi prenderli velocemente da Google Maps copiando l'indirizzo dalla scheda della struttura.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════
function SettingsPage({ operator, operators, cargosConfig, admin, onAddOperator, onEditOperator, onDeleteOperator, onEditCargos }) {
  const [showCargosSecrets, setShowCargosSecrets] = useState(false);
  const enabledOps = operators.filter(o => o.enabled !== false);

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="serif text-3xl font-medium mb-1">Impostazioni</h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Dati agenzia, credenziali CARGOS, operatori, archivio cambi turno</p>
        </div>
      </div>

      {!admin && (
        <ReadonlyBanner message="Modalità sola lettura · attiva Admin in alto per modificare credenziali CARGOS e gestire gli operatori" />
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <section className="card-paper p-6" aria-labelledby="agency-heading">
          <div className="flex items-baseline gap-3 mb-4">
            <h3 id="agency-heading" className="serif text-lg font-medium">{AGENCY.nome}</h3>
            <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>dal {AGENCY.fondazione}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Ragione sociale"  value={AGENCY.ragioneSociale} wide />
            <Field label="Titolare"         value={AGENCY.titolare} />
            <Field label="P. IVA"           value={AGENCY.piva} mono />
            <Field label="Codice fiscale"   value={AGENCY.cf} mono wide />
            <Field label="Sede legale"      value={`${AGENCY.indirizzoLegale}, ${AGENCY.cap} ${AGENCY.citta} (${AGENCY.provincia})`} wide />
            <Field label="Sede operativa"   value={AGENCY.sedeOperativa} wide />
            <Field label="Telefono"         value={AGENCY.telefono} mono />
            <Field label="Cellulari"        value={AGENCY.cellulari.join(' / ')} mono />
            <Field label="Email"            value={AGENCY.email} mono wide />
            <Field label="Servizi"          value={AGENCY.servizi} wide />
          </div>
        </section>

        <section className="card-paper p-6" aria-labelledby="cargos-heading">
          <div className="flex items-center justify-between mb-4">
            <h3 id="cargos-heading" className="serif text-lg font-medium">CARGOS · Questura di Agrigento</h3>
            {admin && (
              <button type="button" onClick={onEditCargos} className="btn-ghost px-2.5 py-1 rounded text-xs border inline-flex items-center gap-1.5" style={{ borderColor: 'var(--border)' }}>
                <Key className="w-3.5 h-3.5" /> Modifica
              </button>
            )}
          </div>
          <div className="space-y-3 text-sm">
            <Field label="Endpoint"             value={cargosConfig.endpoint || '—'} mono wide />
            <Field label="ID Agenzia"           value={cargosConfig.agenziaId || AGENCY.agenziaId} mono />
            <Field label="Codice luogo (ISTAT)" value={cargosConfig.istatLuogo || AGENCY.istatLuogo} mono />
            <Field label="Username"             value={cargosConfig.username || '—'} mono />
            <div>
              <div className="label">Password</div>
              <div className="flex items-center gap-2">
                <span className="text-sm mono">
                  {cargosConfig.password
                    ? (showCargosSecrets ? cargosConfig.password : '••••••••••')
                    : <span style={{ color: 'var(--muted)' }}>non configurata</span>}
                </span>
                {cargosConfig.password && (
                  <button type="button" onClick={() => setShowCargosSecrets(s => !s)} className="btn-ghost p-1 rounded" aria-label={showCargosSecrets ? 'Nascondi password' : 'Mostra password'}>
                    {showCargosSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
            <Field label="PEC Questura"         value={cargosConfig.questuraPec || AGENCY.questuraPec} mono wide />
            <Field label="Operatore corrente"   value={`${operator.nome} (${operator.id})`} wide />
            <div>
              <div className="label">Stato comunicazione</div>
              <div className="flex items-center gap-2">
                {cargosConfig.enabled && cargosConfig.username && cargosConfig.password ? (
                  <>
                    <span className="pill pill-ok"><CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Attiva</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>Invio automatico {cargosConfig.autoSendTimeout || 30}s</span>
                  </>
                ) : (
                  <>
                    <span className="pill pill-warn"><AlertTriangle className="w-3 h-3" /> Non attiva</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>Configura credenziali per abilitare</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-xs p-3 rounded mt-2" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
              <Info className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
              Credenziali rilasciate dalla <strong>Questura di Agrigento</strong>, competente sulla sede legale di {AGENCY.citta}. Conservate cifrate (AES-256-GCM) lato server.
            </div>
          </div>
        </section>
      </div>

      <section className="card-paper p-6 mb-4" aria-labelledby="operators-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5" style={{ color: 'var(--ink-2)' }} aria-hidden="true" />
            <div>
              <h3 id="operators-heading" className="serif text-lg font-medium">Operatori al banco</h3>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{enabledOps.length} attivi · {operators.length - enabledOps.length} disabilitati</div>
            </div>
          </div>
          {admin && (
            <button type="button" onClick={onAddOperator} className="btn-primary px-3 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Nuovo operatore
            </button>
          )}
        </div>
        <ul className="space-y-2" aria-label="Lista operatori">
          {operators.map(op => (
            <li key={op.id} className="flex items-center gap-3 p-3 rounded border" style={{ borderColor: 'var(--border)', background: op.enabled === false ? 'var(--surface-2)' : 'transparent' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center serif font-medium relative" style={{ background: 'var(--surface-2)', color: op.enabled === false ? 'var(--muted)' : 'var(--ink-2)' }} aria-hidden="true">
                {op.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                {op.id === operator.id && <CircleDot className="w-3 h-3 absolute -top-0.5 -right-0.5 fill-current" style={{ color: 'var(--success)' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm flex items-center gap-2">
                  {op.nome}
                  <span className="mono text-xs" style={{ color: 'var(--muted)' }}>· {op.id}</span>
                  {op.role === 'admin' && <span className="pill pill-warn"><Shield className="w-3 h-3" /> Admin</span>}
                  {op.id === operator.id && <span className="pill pill-ok">in turno</span>}
                  {op.enabled === false && <span className="pill pill-neutral">disabilitato</span>}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {op.tel && <span className="mono">{op.tel}</span>}
                  {op.email && <span className="ml-3">{op.email}</span>}
                </div>
              </div>
              {admin && (
                <div className="flex gap-1">
                  <button type="button" onClick={() => onEditOperator(op)} className="btn-ghost p-1.5 rounded border" style={{ borderColor: 'var(--border)' }} title="Modifica operatore" aria-label={`Modifica ${op.nome}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {op.id !== operator.id && (
                    <button
                      type="button"
                      onClick={() => onDeleteOperator(op.id)}
                      className="btn-ghost p-1.5 rounded border"
                      style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
                      title="Elimina operatore"
                      aria-label={`Elimina ${op.nome}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card-paper p-6" aria-labelledby="audit-heading">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4" style={{ color: 'var(--ink-2)' }} aria-hidden="true" />
          <h3 id="audit-heading" className="serif text-lg font-medium">Audit log · ultimi cambi turno</h3>
        </div>
        <ol className="space-y-3 text-sm" aria-label="Storico cambi turno">
          {[
            { t: 'oggi 08:30', from: '—',                 to: 'Alessandra Raptis', taken: 0, action: 'Apertura turno' },
            { t: 'ieri 20:30', from: 'Marco Santini',     to: 'turno chiuso',      taken: 0, action: 'Chiusura turno' },
            { t: 'ieri 14:00', from: 'Alessandra Raptis', to: 'Marco Santini',     taken: 4, action: 'Cambio turno' },
          ].map((e, i) => (
            <li key={i} className="flex items-center gap-3 py-1">
              <div className="text-xs mono w-20" style={{ color: 'var(--muted)' }}>{e.t}</div>
              <Stamp className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} aria-hidden="true" />
              <div className="flex-1">
                <span>{e.action}: <strong>{e.from}</strong> → <strong>{e.to}</strong></span>
                {e.taken > 0 && <span className="text-xs ml-2" style={{ color: 'var(--muted)' }}>({e.taken} pratiche prese in carico)</span>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {admin && (
        <section className="card-paper p-6 mt-4" aria-labelledby="storage-heading">
          <div className="flex items-center gap-2 mb-3">
            <Save className="w-4 h-4" style={{ color: 'var(--ink-2)' }} aria-hidden="true" />
            <h3 id="storage-heading" className="serif text-lg font-medium">Archivio locale</h3>
          </div>
          <div className="text-xs mb-3" style={{ color: 'var(--ink-2)' }}>
            Tutti i dati (flotta, clienti, strutture, operatori, configurazione CARGOS) sono salvati nel browser di questo dispositivo. Sopravvivono ai riavvii, ma <strong>non sono sincronizzati</strong> con gli altri dispositivi finché non si collega il backend. Per Edonoleggio: ogni tablet del banco mantiene la sua copia.
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
              <div className="font-medium">Veicoli memorizzati</div>
              <div className="mono mt-1" style={{ color: 'var(--muted)' }}>chiave: edo:v1:fleet</div>
            </div>
            <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
              <div className="font-medium">Rubrica clienti</div>
              <div className="mono mt-1" style={{ color: 'var(--muted)' }}>chiave: edo:v1:customers</div>
            </div>
            <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
              <div className="font-medium">Strutture partner</div>
              <div className="mono mt-1" style={{ color: 'var(--muted)' }}>chiave: edo:v1:partners</div>
            </div>
            <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
              <div className="font-medium">Operatori e CARGOS</div>
              <div className="mono mt-1" style={{ color: 'var(--muted)' }}>chiavi: edo:v1:operators, edo:v1:cargos</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

const Field = memo(function Field({ label, value, mono, wide }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <div className="label">{label}</div>
      <div className={`text-sm ${mono ? 'mono text-xs' : ''}`} style={{ color: 'var(--ink)' }}>{value}</div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════
// WIZARD
// ═══════════════════════════════════════════════════════════════════
function Wizard({ onClose, prefillCustomer, operator, fleet, customers, partners }) {
  const [step, setStep] = useState(prefillCustomer ? 3 : 1);
  const [data, setData] = useState({
    tipoVeicolo: prefillCustomer ? 'auto' : null,
    cliente: prefillCustomer || null,
    veicolo: null,
    ritiroData: '08/05/2026 17:00',
    consegnaData: '11/05/2026 10:00',
    ritiroStruttura: 's3',
    ritiroIndirizzo: '',
    consegnaStruttura: 's3',
    consegnaIndirizzo: '',
    pagamento: 'C',
   })
 const [pdfOpen, setPdfOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // 

  const update = useCallback((k, v) => setData(d => ({ ...d, [k]: v })), []);
  const t = data.tipoVeicolo ? VEHICLE_TYPES[data.tipoVeicolo] : null;
  const isCargosBound = t?.cargosRequired === true;

  //
  const handleFinalConfirm = async () => {
    setIsUploading(true);
    try {
      // 
      const BACKEND_URL = 'https://pratica-backend.onrender.com'; 
      
      const endpoint = data.tipoVeicolo === 'auto' ? '/api/contracts' : '/api/contracts/paper';
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSent(true); // 
      } else {
        alert("Il server ha ricevuto i dati ma ha dato errore. Controlla i log di Render.");
      }
    } catch (error) {
      alert("Errore di connessione: Il backend su Render non risponde. Aspetta un minuto e riprova (potrebbe essere in standby).");
    } finally {
      setIsUploading(false);
    }
  };

  const STEPS = ['Tipo', 'Cliente', 'Veicolo', 'Periodo', 'Conferma'];

  const canProceed = useMemo(() => {
    if (step === 1) return data.tipoVeicolo !== null;
    if (step === 2) return data.cliente !== null;
    if (step === 3) return data.veicolo !== null;
    return true;
  }, [step, data.tipoVeicolo, data.cliente, data.veicolo]);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(26,24,21,0.45)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
      >
        <div className="w-full max-w-5xl rounded-t-lg slide-up flex flex-col" style={{ background: 'var(--bg)', height: '92vh' }}>
          {/* Header */}
          <div className="px-8 py-5 border-b flex items-center" style={{ borderColor: 'var(--border)' }}>
            <div>
              <div className="text-[11px] uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                <span>Nuova pratica</span><span aria-hidden="true">·</span>
                <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" aria-hidden="true" /> {operator.nome.split(' ')[0]}</span>
                {prefillCustomer && <><span aria-hidden="true">·</span><span style={{ color: 'var(--accent)' }}>cliente pre-caricato</span></>}
              </div>
              <h2 id="wizard-title" className="serif text-2xl font-medium leading-tight">
                {sent ? 'Pratica conclusa' : `Passo ${step} · ${STEPS[step - 1]}`}
              </h2>
            </div>

            {/* Step indicator */}
            <div className="flex-1 flex items-center justify-center gap-2" role="list" aria-label="Progressione wizard">
              {!sent && STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2" role="listitem">
                  <div
                    className={`step-num ${i + 1 === step ? 'active' : i + 1 < step ? 'done' : 'todo'}`}
                    aria-label={`Passo ${i + 1}: ${s}${i + 1 < step ? ' (completato)' : i + 1 === step ? ' (corrente)' : ''}`}
                  >
                    {i + 1 < step ? <Check className="w-3 h-3" aria-hidden="true" /> : i + 1}
                  </div>
                  <span className={`text-xs ${i + 1 === step ? 'font-semibold' : ''}`} style={{ color: i + 1 <= step ? 'var(--ink)' : 'var(--muted)' }} aria-hidden="true">{s}</span>
                  {i < STEPS.length - 1 && <div className="w-6 h-px" style={{ background: 'var(--border-strong)' }} aria-hidden="true" />}
                </div>
              ))}
            </div>

            <button type="button" onClick={onClose} className="btn-ghost p-2 rounded" aria-label="Chiudi wizard">
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Body — fade-in animato al cambio step tramite key */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            {sent
              ? <ResultScreen data={data} onClose={onClose} operator={operator} onShowPdf={() => setPdfOpen(true)} />
              : (
                <div key={step} className="fade-in">
                  {step === 1 && <Step1Type data={data} update={update} />}
                  {step === 2 && <Step2Customer data={data} update={update} customers={customers} />}
                  {step === 3 && <Step3Vehicle data={data} update={update} fleet={fleet} />}
                  {step === 4 && <Step4Period data={data} update={update} partners={partners} />}
                  {step === 5 && <Step5Confirm data={data} operator={operator} partners={partners} onShowPdf={() => setPdfOpen(true)} />}
                </div>
              )
            }
          </div>

          {/* Footer */}
          {!sent && (
            <div className="px-8 py-4 border-t flex items-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <button type="button" onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="btn-ghost px-4 py-2 rounded text-sm flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" aria-hidden="true" /> {step === 1 ? 'Annulla' : 'Indietro'}
              </button>
              <div className="flex-1" />
              {t && !isCargosBound && step >= 1 && (
                <div className="flex items-center gap-2 mr-4 text-xs" style={{ color: 'var(--warning)' }} role="status">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  {t.label}: nessun invio CARGOS, solo contratto
                </div>
              )}
              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => canProceed && setStep(step + 1)}
                  disabled={!canProceed}
                  aria-disabled={!canProceed}
                  className="btn-primary px-5 py-2 rounded text-sm font-semibold flex items-center gap-2"
                >
                  Continua <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              ) : (
                <button type="button" onClick={handleFinalConfirm} className="btn-accent px-5 py-2 rounded text-sm font-semibold flex items-center gap-2">
                  {isCargosBound
                    ? <><Send className="w-4 h-4" aria-hidden="true" /> Invia a CARGOS</>
                    : <><FileCheck2 className="w-4 h-4" aria-hidden="true" /> Genera contratto</>
                  }
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {pdfOpen && <ContractPdfModal data={data} operator={operator} partners={partners} onClose={() => setPdfOpen(false)} />}
    </>
  );
}

// ─── Step 1 — Tipo veicolo ────────────────────────────────────────
function Step1Type({ data, update }) {
  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="serif text-2xl font-medium mb-2">Che tipo di veicolo si noleggia?</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
        La scelta determina i campi richiesti, l'eventuale invio a CARGOS e il tipo di patente necessaria.
      </p>
      <div className="grid grid-cols-4 gap-3" role="radiogroup" aria-label="Tipo veicolo">
        {Object.entries(VEHICLE_TYPES).map(([key, t]) => {
          const selected = data.tipoVeicolo === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => update('tipoVeicolo', key)}
              className={`vehicle-card card-paper p-5 text-left ${selected ? 'selected' : ''}`}
            >
              <VehicleIcon type={key} className="w-8 h-8 mb-3" />
              <div className="serif text-xl font-medium mb-1">{t.label}</div>
              <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--ink-2)' }}>{t.description}</p>
              <div className="flex flex-wrap gap-1">
                {t.cargosRequired
                  ? <span className="pill pill-err"><Send className="w-3 h-3" aria-hidden="true" /> CARGOS</span>
                  : <span className="pill pill-sea"><X className="w-3 h-3" aria-hidden="true" /> no CARGOS</span>
                }
                {t.needsLicense && <span className="pill pill-neutral">Patente {t.needsLicense}</span>}
                {!t.hasPlate    && <span className="pill pill-neutral">no targa</span>}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-6 p-4 rounded-md text-xs flex gap-3" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="font-semibold">Solo le auto vanno a CARGOS.</span> L'art. 17 D.L. 113/2018 si applica a "veicoli a motore con almeno quattro ruote, esclusi i motoveicoli". Quad omologati come quadricicli (L7e), scooter e e-bike sono esclusi. Edonoleggio archivia comunque ogni contratto per le scadenze fiscali.
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 — Cliente ─────────────────────────────────────────────
function Step2Customer({ data, update, customers }) {
  const [mode, setMode] = useState(data.cliente ? 'new' : 'qr');
  const [form, setForm] = useState(() => {
    if (data.cliente?.full) return data.cliente.full;
    if (data.cliente) return {
      cognome: data.cliente.cognome || '', nome: data.cliente.nome || '',
      nascita: data.cliente.nascita || '', luogoNascita: data.cliente.luogoNascita || '',
      cittadinanza: data.cliente.cittadinanza || 'Italia',
      residenzaLuogo: '', residenzaIndirizzo: '',
      docTipo: data.cliente.docTipo || 'CI', docNum: data.cliente.docNum || '', docLuogoRil: '',
      patenteNum: data.cliente.patente || '', patenteLuogoRil: '',
      tel: data.cliente.tel || '', email: data.cliente.email || '',
      fatturazione: data.cliente.fatturazione || null,
    };
    return {
      cognome: '', nome: '', nascita: '', luogoNascita: '', cittadinanza: 'Italia',
      residenzaLuogo: '', residenzaIndirizzo: '',
      docTipo: 'CI', docNum: '', docLuogoRil: '',
      patenteNum: '', patenteLuogoRil: '',
      tel: '', email: '',
      fatturazione: null,
    };
  });

  const pick = useCallback((c) => {
    const filled = {
      cognome: c.cognome, nome: c.nome, nascita: c.nascita,
      luogoNascita: c.luogoNascita, cittadinanza: c.cittadinanza,
      residenzaLuogo: 'Lampedusa', residenzaIndirizzo: 'Via Roma 5',
      docTipo: c.docTipo, docNum: c.docNum, docLuogoRil: 'Lampedusa',
      patenteNum: c.patente, patenteLuogoRil: 'MCTC Agrigento',
      tel: c.tel, email: c.email || '',
      fatturazione: c.fatturazione || null,
    };
    setForm(filled);
    update('cliente', { ...c, full: filled });
  }, [update]);

  const updateForm = useCallback((k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (next.cognome && next.nome && next.docNum) {
        update('cliente', { id: 'new', cognome: next.cognome, nome: next.nome, full: next });
      }
      return next;
    });
  }, [update]);

  const billingActive = form.fatturazione !== null;

  const MODES = [
    { id: 'qr',     label: 'QR cliente',     Icon: QrCode },
    { id: 'lookup', label: 'Esistente',       Icon: Search },
    { id: 'scan',   label: 'Scansiona doc',   Icon: ScanLine },
    { id: 'new',    label: 'Nuovo',           Icon: User },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="serif text-2xl font-medium mb-2">Conducente principale</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
        I dati seguono il tracciato CARGOS. Per i clienti abituali usa il <span className="font-medium" style={{ color: 'var(--accent)' }}>QR cliente</span>.
      </p>

      <div className="flex gap-2 mb-6" role="tablist" aria-label="Modalità inserimento cliente">
        {MODES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => setMode(id)}
            className={`px-4 py-2 rounded text-sm border ${mode === id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderColor: mode === id ? 'transparent' : 'var(--border)' }}
          >
            <Icon className="w-4 h-4 inline mr-2" aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {mode === 'qr' && (
        <DocumentScanner
          mode="qr"
          customers={customers}
          onPick={(c) => { pick(c); setMode('new'); }}
          onUpload={(file, dataUrl) => {
            // In produzione: decodifica QR (jsQR/zxing) → dataset cliente.
            // L'immagine acquisita verrà inviata al backend per decodifica.
          }}
        />
      )}

      {mode === 'lookup' && (
        <div className="card-paper p-4 mb-6">
          <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>Clienti precedenti · {customers.length}</div>
          {customers.map(c => (
            <button key={c.id} type="button" onClick={() => { pick(c); setMode('new'); }} className="w-full flex items-center gap-3 p-3 rounded hover:bg-[var(--surface-2)] text-left">
              <div className="w-9 h-9 rounded-full flex items-center justify-center serif font-medium text-sm relative flex-shrink-0" style={{ background: 'var(--surface-2)' }} aria-hidden="true">
                {getInitials(c.nome, c.cognome)}
                {c.vip && <Star className="w-3 h-3 absolute -top-0.5 -right-0.5 fill-current" style={{ color: 'var(--warning)' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm flex items-center gap-2">
                  {c.cognome} {c.nome}
                  {c.vip && <span className="pill pill-warn">VIP</span>}
                  {c.fatturazione && <span className="pill pill-sea">Fattura</span>}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{c.cittadinanza} · {c.tel} · {c.visite} visite</div>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted)' }} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {mode === 'scan' && (
        <DocumentScanner
          mode="document"
          onUpload={(file, dataUrl) => {
            // In produzione: OCR MRZ del documento → pre-compilazione campi anagrafica.
            // L'immagine acquisita verrà inviata al backend.
          }}
        />
      )}

      {/* Form dati cliente */}
      <div className="card-paper p-6 space-y-5">
        <FormSection title="Anagrafica">
          <div className="grid grid-cols-3 gap-3">
            <FormField id="cf-cognome"      label="Cognome"      req value={form.cognome}      onChange={v => updateForm('cognome', v)} />
            <FormField id="cf-nome"         label="Nome"         req value={form.nome}         onChange={v => updateForm('nome', v)} />
            <FormField id="cf-nascita"      label="Data nascita" req value={form.nascita}      onChange={v => updateForm('nascita', v)} mono placeholder="DD/MM/AAAA" />
            <FormField id="cf-luogoNascita" label="Luogo nascita" req value={form.luogoNascita} onChange={v => updateForm('luogoNascita', v)} hint="comune o stato estero" />
            <FormField id="cf-cittadinanza" label="Cittadinanza" req value={form.cittadinanza} onChange={v => updateForm('cittadinanza', v)} />
          </div>
        </FormSection>
        <div className="divider-dotted" />
        <FormSection title="Contatti">
          <div className="grid grid-cols-2 gap-3">
            <FormField id="cf-tel"   label="Telefono" req value={form.tel}   onChange={v => updateForm('tel', v)}   mono placeholder="+39 ..." />
            <FormField id="cf-email" label="Email"    req value={form.email} onChange={v => updateForm('email', v)} type="email" placeholder="nome@email.com" />
          </div>
        </FormSection>
        <div className="divider-dotted" />
        <FormSection title="Documento d'identità">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="cf-docTipo" className="label">Tipo<span className="req" aria-hidden="true">*</span></label>
              <select id="cf-docTipo" className="input" value={form.docTipo} onChange={e => updateForm('docTipo', e.target.value)}>
                {Object.entries(TIPO_DOC).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <FormField id="cf-docNum"      label="Numero documento" req value={form.docNum}      onChange={v => updateForm('docNum', v)}      mono />
            <FormField id="cf-docLuogoRil" label="Luogo rilascio"   req value={form.docLuogoRil} onChange={v => updateForm('docLuogoRil', v)} />
          </div>
        </FormSection>
        <div className="divider-dotted" />
        <FormSection title="Patente di guida">
          <div className="grid grid-cols-2 gap-3">
            <FormField id="cf-patenteNum"      label="Numero patente" req value={form.patenteNum}      onChange={v => updateForm('patenteNum', v)}      mono />
            <FormField id="cf-patenteLuogoRil" label="Luogo rilascio" req value={form.patenteLuogoRil} onChange={v => updateForm('patenteLuogoRil', v)} />
          </div>
        </FormSection>
        <div className="divider-dotted" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'var(--ink-2)' }}>Fatturazione</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {billingActive ? 'Configurata · la fattura verrà emessa con questi dati' : 'Attiva se il cliente richiede fattura'}
              </div>
            </div>
            <Toggle checked={billingActive} onChange={(v) => updateForm('fatturazione', v ? { tipo: 'privato', cf: '', piva: '', ragioneSociale: '', indirizzo: '', sdi: '', pec: '' } : null)} label="Abilita fatturazione" />
          </div>
          {billingActive && (
            <BillingForm fatturazione={form.fatturazione} onChange={v => updateForm('fatturazione', v)} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 — Veicolo ─────────────────────────────────────────────
function Step3Vehicle({ data, update, fleet }) {
  const [query, setQuery] = useState('');
  // Nel wizard mostriamo solo i veicoli noleggiabili (disponibili).
  // Quelli fermi, incidentati o venduti sono visibili solo nella pagina Flotta.
  const typeFleet = useMemo(
    () => fleet.filter(v => v.tipo === data.tipoVeicolo && (!v.stato || v.stato === 'available')),
    [fleet, data.tipoVeicolo]
  );
  const filtered = useMemo(() => {
    if (!query.trim()) return typeFleet;
    const q = query.toLowerCase();
    return typeFleet.filter(v =>
      v.targa.toLowerCase().includes(q) || v.modello.toLowerCase().includes(q) ||
      v.marca.toLowerCase().includes(q) || v.colore.toLowerCase().includes(q)
    );
  }, [typeFleet, query]);

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="serif text-2xl font-medium mb-2">Seleziona il veicolo</h3>
      <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
        {VEHICLE_TYPES[data.tipoVeicolo].label} · {typeFleet.length} disponibili nella flotta
      </p>

      <div className="relative mb-5">
        <label htmlFor="vehicle-search" className="sr-only">Cerca per targa, marca, modello o colore</label>
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted)' }} aria-hidden="true" />
        <input
          id="vehicle-search"
          type="search"
          className="input pl-9"
          placeholder="Cerca per targa, marca, modello o colore…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-0.5 rounded" aria-label="Cancella ricerca">
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card-paper p-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
          Nessun veicolo trovato per "{query}"
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Scegli veicolo">
          {filtered.map(v => {
            const selected = data.veicolo?.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update('veicolo', v)}
                className={`vehicle-card card-paper p-4 text-left ${selected ? 'selected' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="serif text-lg font-medium leading-tight">{v.marca}</div>
                    <div className="text-sm" style={{ color: 'var(--ink-2)' }}>{v.modello}</div>
                  </div>
                  <div className="mono text-sm font-semibold tracking-wider px-2 py-1 rounded" style={{ background: 'var(--surface-2)' }}>{v.targa}</div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px]">
                  <span style={{ color: 'var(--muted)' }}>{v.colore}</span>
                  <span style={{ color: 'var(--muted)' }}>· {v.cilindrata}</span>
                  <span style={{ color: 'var(--muted)' }}>· {v.anno}</span>
                  {v.gps === 1 && <span className="pill pill-neutral">GPS</span>}
                  {selected && <span className="pill pill-ok ml-auto"><Check className="w-3 h-3" aria-hidden="true" /> Selezionato</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Step 4 — Periodo ─────────────────────────────────────────────
function Step4Period({ data, update, partners }) {
  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="serif text-2xl font-medium mb-2">Periodo e modalità</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Date di ritiro e consegna, luoghi e pagamento.</p>
      <div className="card-paper p-6 space-y-5">
        <FormSection title="Ritiro">
          <div className="grid grid-cols-2 gap-3">
            <FormField id="p4-ritiroData" label="Data e ora ritiro" req mono value={data.ritiroData} onChange={v => update('ritiroData', v)} placeholder="DD/MM/AAAA HH:MM" />
            <StructureSelect label="Luogo di ritiro" req partners={partners} structureId={data.ritiroStruttura} onStructureChange={v => update('ritiroStruttura', v)} freeText={data.ritiroIndirizzo} onFreeTextChange={v => update('ritiroIndirizzo', v)} />
          </div>
        </FormSection>
        <div className="divider-dotted" />
        <FormSection title="Consegna">
          <div className="grid grid-cols-2 gap-3">
            <FormField id="p4-consegnaData" label="Data e ora consegna" req mono value={data.consegnaData} onChange={v => update('consegnaData', v)} placeholder="DD/MM/AAAA HH:MM" />
            <StructureSelect label="Luogo di consegna" req partners={partners} structureId={data.consegnaStruttura} onStructureChange={v => update('consegnaStruttura', v)} freeText={data.consegnaIndirizzo} onFreeTextChange={v => update('consegnaIndirizzo', v)} />
          </div>
        </FormSection>
        <div className="divider-dotted" />
        <FormSection title="Pagamento">
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Metodo di pagamento">
            {Object.entries(TIPO_PAGAMENTO).map(([k, v]) => {
              const Icon = v.icon;
              const selected = data.pagamento === k;
              return (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => update('pagamento', k)}
                  className={`p-3 rounded border text-sm text-left transition-all ${selected ? 'border-[var(--ink)] bg-[var(--surface)]' : 'border-[var(--border)] bg-[var(--surface)]'}`}
                >
                  <Icon className="w-4 h-4 mb-1.5" style={{ color: selected ? 'var(--accent)' : 'var(--muted)' }} aria-hidden="true" />
                  <div className="font-medium text-xs">{v.label}</div>
                  <div className="text-[10px] mono mt-0.5" style={{ color: 'var(--muted)' }}>CARGOS: {v.cargosMap}</div>
                </button>
              );
            })}
          </div>
          <div className="text-[11px] mt-3 flex items-start gap-2" style={{ color: 'var(--muted)' }}>
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>Il tracciato CARGOS prevede 4 codici (C/B/T/A). PayPal viene mappato automaticamente come <span className="mono">A</span> (Altro).</span>
          </div>
        </FormSection>
      </div>
    </div>
  );
}

// StructureSelect — memoized groups
function StructureSelect({ label, req, partners, structureId, onStructureChange, freeText, onFreeTextChange }) {
  const [mode, setMode] = useState('partner');
  const partner = partners.find(s => s.id === structureId);

  const groups = useMemo(() => {
    const fixed = partners.filter(p => p.fissa);
    const byType = {};
    for (const p of partners.filter(p => !p.fissa)) {
      if (!byType[p.tipo]) byType[p.tipo] = [];
      byType[p.tipo].push(p);
    }
    return { fixed, byType };
  }, [partners]);

  const selectId = `struct-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div>
      <label className="label" id={`${selectId}-label`}>{label}{req && <span className="req" aria-hidden="true">*</span>}</label>
      <div className="flex gap-1 mb-2" role="group" aria-label="Modalità selezione luogo">
        {[
          { id: 'partner', label: 'Partner Edonoleggio', Icon: Hotel },
          { id: 'custom',  label: 'Indirizzo libero',    Icon: MapPin },
        ].map(({ id, label: lbl, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            aria-pressed={mode === id}
            className={`px-3 py-1 rounded text-[11px] border flex items-center gap-1 ${mode === id ? 'btn-primary border-transparent' : 'btn-ghost'}`}
            style={{ borderColor: mode === id ? 'transparent' : 'var(--border)' }}
          >
            <Icon className="w-3 h-3" aria-hidden="true" /> {lbl}
          </button>
        ))}
      </div>
      {mode === 'partner' ? (
        <>
          <select id={selectId} className="input" value={structureId} onChange={e => onStructureChange(e.target.value)} aria-labelledby={`${selectId}-label`}>
            <optgroup label="Punti di accesso">
              {groups.fixed.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </optgroup>
            {Object.entries(groups.byType).map(([tipo, items]) => (
              <optgroup key={tipo} label={PARTNER_TYPES[tipo]?.label || tipo}>
                {items.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </optgroup>
            ))}
          </select>
          {partner && (
            <div className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: 'var(--muted)' }}>
              {(() => { const Icon = iconForTipo(partner.tipo); return <Icon className="w-3 h-3" aria-hidden="true" />; })()}
              {partner.indirizzo}
            </div>
          )}
        </>
      ) : (
        <input
          className="input"
          value={freeText}
          onChange={e => onFreeTextChange(e.target.value)}
          placeholder="Inserisci l'indirizzo completo (es. Via Roma 12, 92031 Lampedusa)"
          aria-labelledby={`${selectId}-label`}
        />
      )}
    </div>
  );
}

// ─── Step 5 — Conferma ────────────────────────────────────────────
function Step5Confirm({ data, operator, partners, onShowPdf }) {
  const t = VEHICLE_TYPES[data.tipoVeicolo];
  const isCargosBound = t.cargosRequired;
  const c = data.cliente?.full || {};
  const v = data.veicolo || {};
  const pag = TIPO_PAGAMENTO[data.pagamento];
  const ritiroPartner = partners.find(s => s.id === data.ritiroStruttura);
  const consegnaPartner = partners.find(s => s.id === data.consegnaStruttura);
  const ritiroAddr = data.ritiroIndirizzo || ritiroPartner?.indirizzo || '';
  const consegnaAddr = data.consegnaIndirizzo || consegnaPartner?.indirizzo || '';

  const payload = useMemo(() => ({
    CONTRATTO_ID: 'EDO-2026-0423',
    CONTRATTO_DATA: '08/05/2026 16:42',
    CONTRATTO_TIPOP: pag.cargosMap,
    CONTRATTO_CHECKOUT_DATA: data.ritiroData,
    CONTRATTO_CHECKOUT_LUOGO_COD: AGENCY.istatLuogo,
    CONTRATTO_CHECKOUT_INDIRIZZO: ritiroAddr,
    CONTRATTO_CHECKIN_DATA: data.consegnaData,
    CONTRATTO_CHECKIN_LUOGO_COD: AGENCY.istatLuogo,
    CONTRATTO_CHECKIN_INDIRIZZO: consegnaAddr,
    OPERATORE_ID: operator.id,
    AGENZIA_ID: AGENCY.agenziaId,
    AGENZIA_NOME: AGENCY.nome,
    AGENZIA_LUOGO_COD: AGENCY.istatLuogo,
    AGENZIA_INDIRIZZO: AGENCY.indirizzoLegale,
    AGENZIA_RECAPITO_TEL: AGENCY.telefono,
    VEICOLO_TIPO: t.cargosCode,
    VEICOLO_MARCA: v.marca || '',
    VEICOLO_MODELLO: v.modello || '',
    VEICOLO_TARGA: v.targa || '',
    VEICOLO_COLORE: v.colore || '',
    CONDUCENTE_CONTRAENTE_COGNOME: c.cognome || '',
    CONDUCENTE_CONTRAENTE_NOME: c.nome || '',
    CONDUCENTE_CONTRAENTE_DOCIDE_TIPO_COD: c.docTipo || 'CI',
    CONDUCENTE_CONTRAENTE_DOCIDE_NUMERO: c.docNum || '',
    CONDUCENTE_CONTRAENTE_PATENTE_NUMERO: c.patenteNum || '',
    CONDUCENTE_CONTRAENTE_RECAPITO: c.tel || '',
  }), [data, operator, t, c, v, ritiroAddr, consegnaAddr, pag]);

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-5 gap-6">
      <div className="col-span-3">
        <h3 className="serif text-2xl font-medium mb-2">Riepilogo</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Verifica i dati prima di {isCargosBound ? 'inviare a CARGOS' : 'generare il contratto'}.
        </p>
        <div className="card-paper p-6 space-y-5">
          <SummaryRow icon={() => <VehicleIcon type={data.tipoVeicolo} />} label="Veicolo" value={`${v.marca} ${v.modello}`} sub={`${v.targa} · ${v.colore} · ${v.cilindrata}`} />
          <div className="divider-dotted" />
          <SummaryRow icon={User} label="Conducente" value={`${data.cliente?.cognome} ${data.cliente?.nome}`} sub={`${c.cittadinanza || 'Italia'} · ${TIPO_DOC[c.docTipo] || 'Documento'}: ${c.docNum || '—'}`} />
          <div className="divider-dotted" />
          <SummaryRow icon={FileText} label="Periodo" value={`${data.ritiroData} → ${data.consegnaData}`} sub={`Ritiro: ${ritiroAddr}`} />
          <div className="divider-dotted" />
          <SummaryRow icon={pag.icon} label="Pagamento" value={pag.label} sub={`mappato a CARGOS_TIPOP = ${pag.cargosMap}`} />
          <div className="divider-dotted" />
          <SummaryRow icon={UserCheck} label="Operatore" value={operator.nome} sub={`${operator.ruolo} · turno ${operator.turno}`} />
        </div>

        {isCargosBound ? (
          <div className="mt-5 p-4 rounded card-paper flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} aria-hidden="true" />
            <div>
              <div className="font-medium text-sm">Pronto per l'invio a CARGOS</div>
              <div className="text-xs mt-1" style={{ color: 'var(--ink-2)' }}>Validazione tracciato OK · ricevuta archiviata automaticamente · firma operatore: {operator.nome}.</div>
            </div>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded card-paper flex items-start gap-3" style={{ borderLeft: '3px solid var(--warning)' }}>
            <FileCheck2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--ink-2)' }} aria-hidden="true" />
            <div>
              <div className="font-medium text-sm">{t.label}: nessun invio CARGOS</div>
              <div className="text-xs mt-1" style={{ color: 'var(--ink-2)' }}>Verrà generato il PDF firmabile per il cliente. Conservazione interna 7 anni.</div>
            </div>
          </div>
        )}

        <button type="button" onClick={onShowPdf} className="mt-4 btn-ghost w-full px-4 py-3 rounded text-sm font-semibold flex items-center justify-center gap-2 border" style={{ borderColor: 'var(--border)' }}>
          <Eye className="w-4 h-4" aria-hidden="true" /> Anteprima contratto PDF
        </button>
      </div>

      <div className="col-span-2">
        <div className="text-[11px] uppercase tracking-widest mb-3 font-semibold flex items-center gap-2" style={{ color: 'var(--muted)' }}>
          <Hash className="w-3 h-3" aria-hidden="true" /> {isCargosBound ? 'Payload CARGOS · anteprima' : 'Solo archivio interno'}
        </div>
        <div className="json-block" role="region" aria-label="Payload JSON CARGOS">
          {isCargosBound ? (
            <>
              <span className="c">// POST /api/Send · 46 campi tracciato</span>{'\n'}
              {'{'}
              {Object.entries(payload).map(([k, val]) => (
                <div key={k} style={{ paddingLeft: 12 }}>
                  <span className="k">"{k}"</span>: {typeof val === 'string' ? <span className="s">"{val}"</span> : <span className="n">{val === null ? 'null' : String(val)}</span>},
                </div>
              ))}
              <span className="c">  // …altri campi opzionali</span>{'\n'}
              {'}'}
            </>
          ) : (
            <>
              <span className="c">// {t.label}: escluso da CARGOS</span>{'\n'}
              <span className="c">// {t.cargosCode === null ? 'Non veicolo a motore' : 'art. 17 D.L. 113/2018'}</span>{'\n'}
              <span className="c">// nessun invio API</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const SummaryRow = memo(function SummaryRow({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-2)' }}>
        <Icon className="w-4 h-4" style={{ color: 'var(--ink-2)' }} aria-hidden="true" />
      </div>
      <div className="flex-1">
        <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</div>
        <div className="font-medium">{value}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{sub}</div>}
      </div>
    </div>
  );
});

// ─── Result screen ────────────────────────────────────────────────
function ResultScreen({ data, onClose, operator, onShowPdf }) {
  const t = VEHICLE_TYPES[data.tipoVeicolo];
  const isCargosBound = t.cargosRequired;

  return (
    <div className="max-w-2xl mx-auto text-center py-8">
      <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: 'var(--success-soft)' }}>
        <Check className="w-8 h-8" style={{ color: 'var(--success)' }} aria-hidden="true" />
      </div>
      <h3 className="serif text-3xl font-medium mb-2" tabIndex={-1}>
        {isCargosBound ? 'Inviato a CARGOS' : 'Contratto generato'}
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-2)' }}>
        {isCargosBound
          ? 'La pratica è stata trasmessa alla Questura di Agrigento. Ricevuta archiviata.'
          : `${t.label}: nessun invio CARGOS necessario. Contratto pronto per la firma.`
        }
      </p>
      <div className="card-paper p-6 text-left mb-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div><dt className="label">ID Pratica</dt><dd className="mono font-semibold">EDO-2026-0423</dd></div>
          {isCargosBound && <div><dt className="label">Ricevuta CARGOS</dt><dd className="mono font-semibold">RIC-A8F4-2026</dd></div>}
          <div><dt className="label">Cliente</dt><dd>{data.cliente?.cognome} {data.cliente?.nome}</dd></div>
          <div><dt className="label">Veicolo</dt><dd>{data.veicolo?.marca} {data.veicolo?.modello}</dd></div>
          <div><dt className="label">Operatore</dt><dd>{operator.nome}</dd></div>
          <div><dt className="label">Stato</dt><dd><StatusPill stato={isCargosBound ? 'inviato' : 'cartaceo'} /></dd></div>
        </dl>
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        <button type="button" onClick={onShowPdf} className="btn-accent px-5 py-2.5 rounded text-sm font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4" aria-hidden="true" /> Genera PDF contratto
        </button>
        {isCargosBound && (
          <button type="button" className="btn-ghost px-5 py-2.5 rounded text-sm border flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <FileCheck2 className="w-4 h-4" aria-hidden="true" /> Scarica ricevuta CARGOS
          </button>
        )}
        <button type="button" onClick={onClose} className="btn-primary px-5 py-2.5 rounded text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" aria-hidden="true" /> Nuova pratica
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONTRACT PDF MODAL
// ═══════════════════════════════════════════════════════════════════
function ContractPdfModal({ data, operator, partners, onClose }) {
  const printRef = useRef(null);
  const t = VEHICLE_TYPES[data.tipoVeicolo];
  const c = data.cliente?.full || {};
  const v = data.veicolo || {};
  const pag = TIPO_PAGAMENTO[data.pagamento];
  const ritiroPartner  = partners.find(s => s.id === data.ritiroStruttura);
  const consegnaPartner = partners.find(s => s.id === data.consegnaStruttura);
  const ritiroAddr  = data.ritiroIndirizzo  || ritiroPartner?.indirizzo  || '';
  const consegnaAddr = data.consegnaIndirizzo || consegnaPartner?.indirizzo || '';

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handleDownloadHtml = useCallback(() => {
    const contractHtml = printRef.current?.innerHTML || '';
    const full = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>Contratto Edonoleggio EDO-2026-0423</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Newsreader', Georgia, 'Times New Roman', serif; color: #1a1815; line-height: 1.55; margin: 0; padding: 0; background: white; }
  .page { max-width: 178mm; margin: 0 auto; }
  h1 { font-size: 26pt; font-weight: 600; margin: 0 0 4pt; letter-spacing: -0.01em; }
  h2 { font-size: 12pt; font-weight: 500; margin: 14pt 0 6pt; padding-bottom: 3pt; border-bottom: 1px solid #d4ccba; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 3pt 0; font-size: 10pt; vertical-align: top; }
  td.lbl { width: 38mm; font-size: 8pt; color: #8a847b; text-transform: uppercase; letter-spacing: 0.05em; padding-right: 4pt; }
  .mono { font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 9.5pt; }
  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body onload="window.print()">
<div class="page">${contractHtml}</div>
</body>
</html>`;
    const blob = new Blob([full], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) {
      const a = document.createElement('a');
      a.href = url; a.download = 'Contratto-EDO-2026-0423.html'; a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col fade-in no-print"
      style={{ background: 'rgba(26,24,21,0.85)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #pdf-printable, #pdf-printable * { visibility: visible; }
          #pdf-printable { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex items-center px-6 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(26,24,21,0.95)' }}>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.55)' }}>Anteprima contratto · A4</div>
          <div id="pdf-modal-title" className="serif text-lg font-medium" style={{ color: 'white' }}>
            EDO-2026-0423 · {data.cliente?.cognome} {data.cliente?.nome}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => window.print()} className="px-4 py-2 rounded text-sm font-semibold flex items-center gap-2 transition-all" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
            <Printer className="w-4 h-4" aria-hidden="true" /> Stampa
          </button>
          <button type="button" onClick={handleDownloadHtml} className="btn-accent px-4 py-2 rounded text-sm font-semibold flex items-center gap-2">
            <Download className="w-4 h-4" aria-hidden="true" /> Scarica PDF
          </button>
          <button type="button" onClick={onClose} className="p-2 rounded transition-all hover:bg-white/10" style={{ color: 'white' }} aria-label="Chiudi anteprima">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-8 px-4">
        <div className="mx-auto" style={{ maxWidth: '210mm' }}>
          <div
            id="pdf-printable"
            ref={printRef}
            className="bg-white"
            style={{ fontFamily: "'Newsreader', Georgia, serif", padding: '18mm 16mm', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', minHeight: '297mm', color: '#1a1815' }}
          >
            {/* Intestazione */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 14, borderBottom: '2px solid #1a1815', marginBottom: 16 }}>
              <div>
                <h1 style={{ fontSize: 30, fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Edonoleggio</h1>
                <div style={{ fontSize: 11, color: '#8a847b', fontStyle: 'italic' }}>{AGENCY.slogan}</div>
                <div style={{ fontSize: 10.5, color: '#3a352e', marginTop: 10, lineHeight: 1.55 }}>
                  {AGENCY.ragioneSociale}<br />
                  {AGENCY.indirizzoLegale}, {AGENCY.cap} {AGENCY.citta} ({AGENCY.provincia})<br />
                  Tel. {AGENCY.telefono} · {AGENCY.email}<br />
                  P.IVA {AGENCY.piva} · CF {AGENCY.cf}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: '#8a847b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contratto n.</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600 }}>EDO-2026-0423</div>
                <div style={{ fontSize: 10.5, color: '#3a352e', marginTop: 4 }}>08/05/2026 · ore 16:42</div>
                {t.cargosRequired && (
                  <div style={{ display: 'inline-block', marginTop: 8, padding: '3px 8px', borderRadius: 3, background: '#f5e3df', color: '#9c2424', fontSize: 9, fontWeight: 700 }}>
                    CARGOS · RIC-A8F4-2026
                  </div>
                )}
              </div>
            </div>

            {/* Contraente */}
            <h2 style={{ fontSize: 13, fontWeight: 500, margin: '14px 0 6px', paddingBottom: 4, borderBottom: '1px solid #d4ccba' }}>Contraente / Conducente</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={cellLabel}>Cognome e nome</td><td style={cellVal}><strong>{c.cognome} {c.nome}</strong></td></tr>
                <tr><td style={cellLabel}>Nato/a il</td><td style={cellVal}>{c.nascita} a {c.luogoNascita}</td></tr>
                <tr><td style={cellLabel}>Cittadinanza</td><td style={cellVal}>{c.cittadinanza}</td></tr>
                <tr><td style={cellLabel}>{TIPO_DOC[c.docTipo]}</td><td style={cellMono}>{c.docNum} <span style={{ fontFamily: 'inherit', color: '#8a847b' }}>(rilasciato a {c.docLuogoRil})</span></td></tr>
                <tr><td style={cellLabel}>Patente di guida</td><td style={cellMono}>{c.patenteNum} <span style={{ fontFamily: 'inherit', color: '#8a847b' }}>(rilasciata a {c.patenteLuogoRil})</span></td></tr>
                {c.tel   && <tr><td style={cellLabel}>Telefono</td><td style={{ ...cellVal, fontFamily: "'JetBrains Mono', monospace" }}>{c.tel}</td></tr>}
                {c.email && <tr><td style={cellLabel}>Email</td><td style={cellVal}>{c.email}</td></tr>}
              </tbody>
            </table>

            {c.fatturazione && (
              <>
                <h2 style={{ fontSize: 13, fontWeight: 500, margin: '14px 0 6px', paddingBottom: 4, borderBottom: '1px solid #d4ccba' }}>Dati di fatturazione</h2>
                <div style={{ padding: '8px 12px', background: '#f3eee5', borderLeft: '3px solid #2d6c8b', fontSize: 10.5, marginBottom: 4 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {c.fatturazione.tipo === 'azienda' && c.fatturazione.ragioneSociale && <tr><td style={cellLabel}>Ragione sociale</td><td style={cellVal}><strong>{c.fatturazione.ragioneSociale}</strong></td></tr>}
                      {c.fatturazione.piva    && <tr><td style={cellLabel}>Partita IVA</td><td style={cellMono}>{c.fatturazione.piva}</td></tr>}
                      {c.fatturazione.cf      && <tr><td style={cellLabel}>Codice fiscale</td><td style={cellMono}>{c.fatturazione.cf}</td></tr>}
                      {c.fatturazione.indirizzo && <tr><td style={cellLabel}>Indirizzo</td><td style={cellVal}>{c.fatturazione.indirizzo}</td></tr>}
                      {c.fatturazione.tipo === 'azienda' && <>
                        <tr><td style={cellLabel}>Codice SDI</td><td style={cellMono}>{c.fatturazione.sdi || '0000000'}</td></tr>
                        {c.fatturazione.pec && <tr><td style={cellLabel}>PEC</td><td style={cellVal}>{c.fatturazione.pec}</td></tr>}
                      </>}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Veicolo */}
            <h2 style={{ fontSize: 13, fontWeight: 500, margin: '14px 0 6px', paddingBottom: 4, borderBottom: '1px solid #d4ccba' }}>Veicolo noleggiato</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={cellLabel}>Categoria</td><td style={cellVal}>{t.label} {t.cargosRequired ? '(soggetto a CARGOS)' : '(escluso da CARGOS)'}</td></tr>
                <tr><td style={cellLabel}>Marca e modello</td><td style={cellVal}><strong>{v.marca} {v.modello}</strong></td></tr>
                <tr><td style={{ ...cellMono, fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>Targa</td><td style={{ ...cellMono, fontSize: 13, fontWeight: 600 }}>{v.targa}</td></tr>
                <tr><td style={cellLabel}>Colore</td><td style={cellVal}>{v.colore}</td></tr>
                <tr><td style={cellLabel}>Cilindrata · anno</td><td style={cellVal}>{v.cilindrata} · {v.anno}</td></tr>
              </tbody>
            </table>

            {/* Periodo */}
            <h2 style={{ fontSize: 13, fontWeight: 500, margin: '14px 0 6px', paddingBottom: 4, borderBottom: '1px solid #d4ccba' }}>Periodo e modalità</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={cellLabel}>Ritiro</td><td style={cellVal}><strong>{data.ritiroData}</strong> · {ritiroAddr}</td></tr>
                <tr><td style={cellLabel}>Consegna</td><td style={cellVal}><strong>{data.consegnaData}</strong> · {consegnaAddr}</td></tr>
                <tr><td style={cellLabel}>Pagamento</td><td style={cellVal}>{pag.label}</td></tr>
                <tr><td style={cellLabel}>Operatore</td><td style={cellVal}>{operator.nome} ({operator.ruolo})</td></tr>
              </tbody>
            </table>

            {/* Condizioni */}
            <h2 style={{ fontSize: 13, fontWeight: 500, margin: '14px 0 6px', paddingBottom: 4, borderBottom: '1px solid #d4ccba' }}>Condizioni della locazione</h2>
            <div style={{ fontSize: 9, color: '#3a352e', lineHeight: 1.55, textAlign: 'justify' }}>
              <p style={{ margin: '4px 0 6px' }}>
                In riferimento all'<strong>art. 1587 C.C., punto 1</strong>, il sottoscritto si impegna ad usare il mezzo con cura e prudenza, e non sottoporlo ad eccessiva velocità, sforzi, itinerari e carichi eccessivi e non cedere la guida ad altre persone. Ogni avaria fosse subita dal mezzo, sarà a carico del sottoscritto. Oltre alle spese delle riparazioni da farsi da esecutori di Vostra fiducia, il sottoscritto vi riconoscerà un indennizzo pro-die pari all'importo della Tariffa applicata per ogni giorno in cui il mezzo, per cause dipendenti dalla presente locazione, non sarà in grado di circolare.
              </p>
              <p style={{ margin: '6px 0 4px', fontWeight: 500 }}>Il sottoscritto dichiara che:</p>
              <ol style={{ margin: '0 0 0 14px', padding: 0, listStyleType: 'decimal' }}>
                {/* FLAG AUTOVEICOLO: visibile solo per auto */}
                {t.cargosCode === 'A' && (
                  <li style={{ margin: '3px 0' }}>
                    L'<strong>AUTOVEICOLO</strong> preso in locazione è dotato di ruota di scorta, normali attrezzi, Carta di circolazione (fotocopia), contrassegno di assicurazione R.C.A.
                  </li>
                )}
                {/* FLAG SCOOTER: visibile per scooter, quad */}
                {(t.label === 'Scooter' || t.label === 'Quad' || t.cargosCode === 'M') && (
                  <li style={{ margin: '3px 0' }}>
                    Lo <strong>SCOOTER</strong> è completo di libretto di circolazione, caschi e assicurazione. Il mezzo viene ritirato in perfetto stato di pulizia sia interna che esterna, è obbligo del Locatario accertarsi, prima del ritiro del mezzo, di eventuali danni, difetti e/o anomalie presenti sul medesimo, facendoli rilevare al Locatore.
                  </li>
                )}
                <li style={{ margin: '3px 0' }}>
                  Saranno a carico del sottoscritto tutte le conseguenze relative a contravvenzioni in cui incorresse, a chiunque contestate e si obbliga a conciliarle, quando la conciliazione sia ammessa. Saranno pure a carico del sottoscritto le conseguenze dei danni e/o lesioni subite da cose e/o persone e/o animali trasportati e/o esterne, verificatesi durante la locazione del mezzo.
                </li>
                <li style={{ margin: '3px 0' }}>
                  Il sottoscritto si obbliga a denunciare subito al Locatore ogni incidente, anche di minima importanza e di qualsiasi natura fosse avvenuto durante la locazione e suscettibile di produrre conseguenze accennate ai punti precedenti, precisando circostanze, prove e testimonianze favorevoli.
                </li>
                <li style={{ margin: '3px 0' }}>
                  Il sottoscritto dichiara di essere a conoscenza che sul mezzo preso in locazione, <strong>NON ESISTE ALCUNA POLIZZA ASSICURATIVA DEL TIPO KASCO</strong>.
                </li>
                <li style={{ margin: '3px 0' }}>
                  I costi relativi all'acquisto dei carburanti, saranno a carico del sottoscritto.
                </li>
                <li style={{ margin: '3px 0' }}>
                  Fermi restando gli obblighi di cui al 2° comma dell'<strong>art. 1588 C.C.</strong>, in completa deroga al 1° comma di detto articolo, il sottoscritto resterà solidamente obbligato nei confronti del Locatore pure nel caso che venga dimostrato, anche in sede giudiziaria, che il sottoscritto non ha responsabilità di sorta nell'incendio, nella perdita o deterioramento totale o parziale del mezzo locato in quanto avvenuta per causa non imputabile al sottoscritto.
                </li>
                <li style={{ margin: '3px 0' }}>
                  Il sottoscritto si fa obbligo del pagamento del prezzo del noleggio pattuito sia nel caso che non venga effettuato alcun pagamento anticipato, sia nel caso che fosse necessario un conguaglio fra il pagamento anticipato e l'effettivo prezzo finale, sia nel caso che il sottoscritto noleggi il mezzo in qualità di conducente per terze persone, o per ditte, o per enti, autorizzando sin d'ora la Ditta Locataria ad esigere il pagamento nella forma che riterrà più opportuna.
                </li>
                <li style={{ margin: '3px 0' }}>
                  Per ogni eventuale controversia, sarà competente l'<strong>Autorità Giudiziaria di Agrigento</strong>.
                </li>
              </ol>

              {t.cargosRequired && (
                <p style={{ margin: '8px 0 0', fontSize: 8.5, color: '#5a5048', fontStyle: 'italic', borderTop: '1px dashed #d4ccba', paddingTop: 6 }}>
                  Ai sensi del D.L. 113/2018 art. 17 e D.M. 29/10/2021, i dati identificativi del Conducente vengono comunicati al portale CARGOS della Polizia di Stato per finalità di sicurezza pubblica e prevenzione di reati. Il trattamento dei dati personali avviene ai sensi del Reg. UE 2016/679 (GDPR); l'informativa estesa è disponibile presso la sede di Edonoleggio.
                </p>
              )}
              {!t.cargosRequired && (
                <p style={{ margin: '8px 0 0', fontSize: 8.5, color: '#5a5048', fontStyle: 'italic', borderTop: '1px dashed #d4ccba', paddingTop: 6 }}>
                  Il trattamento dei dati personali avviene ai sensi del Reg. UE 2016/679 (GDPR); l'informativa estesa è disponibile presso la sede di Edonoleggio.
                </p>
              )}
            </div>

            {/* Firme */}
            <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16mm' }}>
              <div>
                <div style={{ borderTop: '1px solid #1a1815', paddingTop: 4, fontSize: 9, color: '#8a847b' }}>Firma del Conducente</div>
                <div style={{ fontSize: 8, color: '#8a847b', marginTop: 2 }}>per accettazione delle Condizioni Generali</div>
              </div>
              <div>
                <div style={{ borderTop: '1px solid #1a1815', paddingTop: 4, fontSize: 9, color: '#8a847b' }}>Per Edonoleggio</div>
                <div style={{ fontSize: 8, color: '#8a847b', marginTop: 2 }}>{operator.nome} · {operator.ruolo}</div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 20, fontSize: 8, color: '#8a847b', textAlign: 'center', fontStyle: 'italic', borderTop: '1px dashed #d4ccba', paddingTop: 8 }}>
              Edonoleggio · {AGENCY.indirizzoLegale}, {AGENCY.citta} (AG) · www.edonoleggio.com<br />
              {AGENCY.slogan} · Documento generato da Pratica
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const cellLabel = { width: '38mm', padding: '3px 4px 3px 0', fontSize: 9, color: '#8a847b', textTransform: 'uppercase', letterSpacing: '0.05em', verticalAlign: 'top' };
const cellVal   = { padding: '3px 0', fontSize: 10.5, verticalAlign: 'top' };
const cellMono  = { padding: '3px 0', fontSize: 10, fontFamily: "'JetBrains Mono', 'Courier New', monospace", verticalAlign: 'top' };

// ═══════════════════════════════════════════════════════════════════
// MODALS — usano ModalShell per DRY
// ═══════════════════════════════════════════════════════════════════

function NewVehicleModal({ vehicle, onClose, onSave }) {
  const editing = !!vehicle;
  const [form, setForm] = useState(vehicle || {
    tipo: 'auto', marca: '', modello: '', targa: '', colore: '',
    cilindrata: '', anno: new Date().getFullYear(), gps: 0, blocco: 0,
    stato: 'available', note: '',
  });
  const upd = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);
  const valid = form.marca && form.modello && (VEHICLE_TYPES[form.tipo].hasPlate ? form.targa : true);

  return (
    <ModalShell
      id="new-vehicle-title"
      title={editing ? `${vehicle.marca} ${vehicle.modello}` : 'Aggiungi alla flotta'}
      subtitle={`${editing ? 'Modifica' : 'Nuovo'} veicolo · admin`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost px-4 py-2 rounded text-sm">Annulla</button>
          <button type="button" onClick={() => valid && onSave(form)} disabled={!valid} aria-disabled={!valid} className="btn-primary px-4 py-2 rounded text-sm font-semibold flex items-center gap-2">
            <Save className="w-4 h-4" aria-hidden="true" /> {editing ? 'Salva modifiche' : 'Aggiungi alla flotta'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="label">Tipo veicolo<span className="req" aria-hidden="true">*</span></div>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Tipo veicolo">
            {Object.entries(VEHICLE_TYPES).map(([k, t]) => (
              <button key={k} type="button" role="radio" aria-checked={form.tipo === k} onClick={() => upd('tipo', k)}
                className={`p-3 rounded border text-left transition-all ${form.tipo === k ? 'border-[var(--ink)] bg-[var(--surface)]' : 'border-[var(--border)] bg-white'}`}>
                <VehicleIcon type={k} className="w-5 h-5 mb-1" />
                <div className="text-xs font-medium">{t.label}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="nv-marca"  label="Marca"   req value={form.marca}      onChange={v => upd('marca', v)}  placeholder="es. Fiat, Vespa" />
          <FormField id="nv-modello" label="Modello" req value={form.modello}    onChange={v => upd('modello', v)} placeholder="es. Panda, Primavera" />
          <FormField id="nv-targa"  label={`Targa${VEHICLE_TYPES[form.tipo].hasPlate ? '' : ' (non richiesta)'}`} req={VEHICLE_TYPES[form.tipo].hasPlate} value={form.targa} onChange={v => upd('targa', v.toUpperCase().replace(/\s+/g, ''))} mono placeholder="es. AB123CD" />
          <FormField id="nv-colore" label="Colore"   value={form.colore}         onChange={v => upd('colore', v)} />
          <FormField id="nv-cc"     label="Cilindrata / potenza" value={form.cilindrata} onChange={v => upd('cilindrata', v)} placeholder="es. 1200cc, 250W" />
          <FormField id="nv-anno"   label="Anno"     type="number" value={form.anno}      onChange={v => upd('anno', parseInt(v) || '')} mono />
        </div>

        <div>
          <div className="label">Stato operativo</div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(VEHICLE_STATUS).map(([k, s]) => {
              const Icon = s.icon;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => upd('stato', k)}
                  className={`p-2.5 rounded border text-left transition-all ${form.stato === k ? 'border-[var(--ink)] bg-[var(--surface)]' : 'border-[var(--border)] bg-white'}`}
                >
                  <Icon className="w-4 h-4 mb-1" style={{ color: form.stato === k ? 'var(--accent)' : 'var(--muted)' }} />
                  <div className="text-[11px] font-medium">{s.label}</div>
                </button>
              );
            })}
          </div>
          <div className="text-[10px] mt-1.5" style={{ color: 'var(--muted)' }}>I veicoli "fermi", "incidentati" o "venduti" non sono noleggiabili nel wizard ma restano nello storico</div>
        </div>

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.gps === 1} onChange={e => upd('gps', e.target.checked ? 1 : 0)} className="w-4 h-4" />
            GPS installato
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.blocco === 1} onChange={e => upd('blocco', e.target.checked ? 1 : 0)} className="w-4 h-4" />
            Blocco motore remoto
          </label>
        </div>
        <div>
          <label htmlFor="nv-note" className="label">Note interne</label>
          <textarea id="nv-note" className="input" rows={2} value={form.note || ''} onChange={e => upd('note', e.target.value)} placeholder="es. tagliando in scadenza, danno parafango, ecc." style={{ resize: 'vertical', minHeight: 50 }} />
        </div>
        <div className="text-xs p-3 rounded flex items-start gap-2" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>Categoria <strong>{VEHICLE_TYPES[form.tipo].label}</strong>: {VEHICLE_TYPES[form.tipo].description}</span>
        </div>
      </div>
    </ModalShell>
  );
}

function NewPartnerModal({ partner, onClose, onSave }) {
  const editing = !!partner;
  const isFixed = partner?.fissa;
  const [form, setForm] = useState(partner || { nome: '', tipo: 'hotel', indirizzo: '', telefono: '', note: '' });
  const upd = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);
  const valid = form.nome && form.tipo;

  const types = isFixed
    ? [['aeroporto', 'Aeroporto'], ['porto', 'Porto'], ['sede', 'Sede']]
    : [['hotel', 'Hotel'], ['resort', 'Resort'], ['residence', 'Residence'], ['guesthouse', 'Guest house'], ['bb', 'B&B'], ['appartamento', 'Appartamenti'], ['casa', 'Casa vacanze']];

  return (
    <ModalShell
      id="new-partner-title"
      title={editing ? partner.nome : 'Aggiungi un partner'}
      subtitle={`${editing ? 'Modifica' : 'Nuova'} struttura · admin`}
      onClose={onClose}
      maxWidth="max-w-xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost px-4 py-2 rounded text-sm">Annulla</button>
          <button type="button" onClick={() => valid && onSave(form)} disabled={!valid} aria-disabled={!valid} className="btn-primary px-4 py-2 rounded text-sm font-semibold flex items-center gap-2">
            <Save className="w-4 h-4" aria-hidden="true" /> {editing ? 'Salva modifiche' : 'Aggiungi alla lista'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField id="np-nome" label="Nome struttura" req value={form.nome} onChange={v => upd('nome', v)} placeholder="es. Hotel Martello, B&B Stella…" />
        <div>
          <div className="label">Categoria<span className="req" aria-hidden="true">*</span></div>
          {isFixed ? (
            <div className="text-xs p-2.5 rounded flex items-center gap-2" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              Punto fisso · categoria <strong>{PARTNER_TYPES[form.tipo]?.label}</strong> non modificabile
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Categoria struttura">
              {types.map(([k, label]) => {
                const Icon = iconForTipo(k);
                return (
                  <button key={k} type="button" role="radio" aria-checked={form.tipo === k} onClick={() => upd('tipo', k)}
                    className={`p-2.5 rounded border text-left transition-all ${form.tipo === k ? 'border-[var(--ink)] bg-[var(--surface)]' : 'border-[var(--border)] bg-white'}`}>
                    <Icon className="w-4 h-4 mb-1" style={{ color: form.tipo === k ? 'var(--accent)' : 'var(--muted)' }} aria-hidden="true" />
                    <div className="text-[11px] font-medium leading-tight">{label}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <FormField id="np-indirizzo" label="Indirizzo"           value={form.indirizzo}  onChange={v => upd('indirizzo', v)}  placeholder="es. Via Roma 24, 92031 Lampedusa (AG)" hint="opzionale, ma consigliato per i contratti stampati" />
        <FormField id="np-tel"       label="Telefono"            value={form.telefono||''} onChange={v => upd('telefono', v)} mono placeholder="+39 ..." hint="opzionale, utile per coordinare consegne" />
        <div>
          <label htmlFor="np-note" className="label">Note interne</label>
          <textarea id="np-note" className="input" rows={2} value={form.note||''} onChange={e => upd('note', e.target.value)} placeholder="es. consegnare al portiere, parcheggio in cortile…" style={{ resize: 'vertical', minHeight: 60 }} />
          <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>Visibili solo agli operatori, non stampate sul contratto</div>
        </div>
      </div>
    </ModalShell>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL: NEW / EDIT OPERATOR
// ═══════════════════════════════════════════════════════════════════
function NewOperatorModal({ operator, onClose, onSave }) {
  const editing = !!operator;
  const [form, setForm] = useState(operator || {
    nome: '', tel: '', email: '', role: 'operator', enabled: true,
  });
  const upd = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);
  const valid = form.nome?.trim().length >= 2;

  return (
    <ModalShell
      id="op-title"
      title={editing ? operator.nome : 'Nuovo operatore'}
      subtitle={editing ? 'Modifica operatore · admin' : 'Aggiungi operatore · admin'}
      onClose={onClose}
      maxWidth="max-w-lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost px-4 py-2 rounded text-sm">Annulla</button>
          <button type="button" onClick={() => valid && onSave(form)} disabled={!valid} className="btn-primary px-4 py-2 rounded text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-40">
            <Save className="w-4 h-4" /> {editing ? 'Salva modifiche' : 'Aggiungi'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField id="op-nome"  label="Nome e cognome"           req value={form.nome}  onChange={v => upd('nome', v)}  placeholder="es. Marco Santini" />
        <div className="grid grid-cols-2 gap-3">
          <FormField id="op-tel"   label="Telefono"     value={form.tel||''}   onChange={v => upd('tel', v)}   mono placeholder="+39 ..." />
          <FormField id="op-email" label="Email"        value={form.email||''} onChange={v => upd('email', v)} type="email" placeholder="nome@edonoleggio.com" />
        </div>

        <div>
          <label className="label">Ruolo</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => upd('role', 'operator')} className={`p-3 rounded border text-left transition-all ${form.role === 'operator' ? 'border-[var(--ink)] bg-[var(--surface)]' : 'border-[var(--border)] bg-white'}`}>
              <UserCheck className="w-4 h-4 mb-1" style={{ color: form.role === 'operator' ? 'var(--accent)' : 'var(--muted)' }} />
              <div className="text-sm font-medium">Operatore</div>
              <div className="text-[10px]" style={{ color: 'var(--muted)' }}>Gestione contratti, banco</div>
            </button>
            <button type="button" onClick={() => upd('role', 'admin')} className={`p-3 rounded border text-left transition-all ${form.role === 'admin' ? 'border-[var(--ink)] bg-[var(--surface)]' : 'border-[var(--border)] bg-white'}`}>
              <Shield className="w-4 h-4 mb-1" style={{ color: form.role === 'admin' ? 'var(--accent)' : 'var(--muted)' }} />
              <div className="text-sm font-medium">Admin</div>
              <div className="text-[10px]" style={{ color: 'var(--muted)' }}>Flotta, clienti, CARGOS, audit</div>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded border" style={{ borderColor: 'var(--border)' }}>
          <Power className="w-4 h-4" style={{ color: form.enabled !== false ? 'var(--success)' : 'var(--muted)' }} />
          <div className="flex-1">
            <div className="text-sm font-medium">Operatore attivo</div>
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>Può effettuare login al banco e prendere turni</div>
          </div>
          <button
            type="button"
            onClick={() => upd('enabled', form.enabled === false ? true : false)}
            className={`relative w-10 h-5 rounded-full transition-all ${form.enabled !== false ? 'bg-[var(--success)]' : 'bg-[var(--muted)]'}`}
            aria-pressed={form.enabled !== false}
            aria-label="Toggle operatore attivo"
          >
            <span className={`absolute top-0.5 ${form.enabled !== false ? 'left-5' : 'left-0.5'} w-4 h-4 bg-white rounded-full transition-all`} />
          </button>
        </div>

        <div className="text-xs p-3 rounded flex items-start gap-2" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            L'ID univoco viene generato automaticamente. La password e l'OTP CARGOS, se l'operatore farà invii diretti, vanno configurati dal pannello CARGOS dedicato.
          </span>
        </div>
      </div>
    </ModalShell>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL: CARGOS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════
function CargosConfigModal({ config, onClose, onSave }) {
  const [form, setForm] = useState(config || {});
  const [showPwd, setShowPwd] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const upd = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);
  const valid = form.username?.trim() && form.password?.trim();

  return (
    <ModalShell
      id="cg-title"
      title="Credenziali CARGOS"
      subtitle="Portale Polizia di Stato · admin"
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost px-4 py-2 rounded text-sm">Annulla</button>
          <button type="button" onClick={() => onSave(form)} className="btn-primary px-4 py-2 rounded text-sm font-semibold inline-flex items-center gap-2">
            <Save className="w-4 h-4" /> Salva configurazione
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="text-xs p-3 rounded flex items-start gap-2" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
          <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
          <span>
            Queste credenziali sono state rilasciate dalla <strong>Questura di Agrigento</strong> per l'invio dei contratti di noleggio a CARGOS (D.L. 113/2018 art. 17). Conservale con cura. Sono memorizzate cifrate lato server.
          </span>
        </div>

        <FormSection title="Endpoint e identificativi">
          <div className="space-y-3">
            <FormField id="cg-endpoint" label="Endpoint API" req mono value={form.endpoint||''} onChange={v => upd('endpoint', v)} placeholder="https://cargos.poliziadistato.it/CARGOS_API" hint="URL completo del web service" />
            <div className="grid grid-cols-2 gap-3">
              <FormField id="cg-agid"   label="ID Agenzia"           req mono value={form.agenziaId||''}  onChange={v => upd('agenziaId', v)}  placeholder="Es. 12345" />
              <FormField id="cg-istat"  label="Codice luogo (ISTAT)" req mono value={form.istatLuogo||''} onChange={v => upd('istatLuogo', v)} placeholder="Es. 84017" hint="comune della sede legale" />
            </div>
          </div>
        </FormSection>

        <div className="divider-dotted" />

        <FormSection title="Autenticazione">
          <div className="space-y-3">
            <FormField id="cg-user" label="Username" req mono value={form.username||''} onChange={v => upd('username', v)} placeholder="Username CARGOS" />
            <div>
              <label htmlFor="cg-pwd" className="label">Password<span className="req">*</span></label>
              <div className="relative">
                <input
                  id="cg-pwd"
                  type={showPwd ? 'text' : 'password'}
                  className="input mono pr-10"
                  value={form.password||''}
                  onChange={e => upd('password', e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 btn-ghost p-1 rounded" aria-label={showPwd ? 'Nascondi' : 'Mostra'}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="cg-otp" className="label">Seed OTP (opzionale, per 2FA)</label>
              <div className="relative">
                <input
                  id="cg-otp"
                  type={showOtp ? 'text' : 'password'}
                  className="input mono pr-10"
                  value={form.otpSeed||''}
                  onChange={e => upd('otpSeed', e.target.value)}
                  placeholder="Base32 secret · solo se attivata 2FA TOTP"
                  autoComplete="off"
                />
                <button type="button" onClick={() => setShowOtp(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 btn-ghost p-1 rounded" aria-label={showOtp ? 'Nascondi' : 'Mostra'}>
                  {showOtp ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>Se vuoto, il sistema chiederà l'OTP a ogni invio</div>
            </div>
            <FormField id="cg-pec" label="PEC Questura (fallback CSV)" mono value={form.questuraPec||''} onChange={v => upd('questuraPec', v)} placeholder="ag.gab@pecps.poliziadistato.it" hint="usata quando CARGOS è irraggiungibile" />
          </div>
        </FormSection>

        <div className="divider-dotted" />

        <FormSection title="Comportamento invii">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded border" style={{ borderColor: 'var(--border)' }}>
              <div className="flex-1">
                <div className="text-sm font-medium">Invio automatico abilitato</div>
                <div className="text-[11px]" style={{ color: 'var(--muted)' }}>I contratti AUTO confermati vengono inoltrati a CARGOS senza azione operatore</div>
              </div>
              <button
                type="button"
                onClick={() => upd('enabled', !form.enabled)}
                className={`relative w-10 h-5 rounded-full transition-all ${form.enabled ? 'bg-[var(--success)]' : 'bg-[var(--muted)]'}`}
                aria-pressed={!!form.enabled}
                aria-label="Toggle invio automatico"
              >
                <span className={`absolute top-0.5 ${form.enabled ? 'left-5' : 'left-0.5'} w-4 h-4 bg-white rounded-full transition-all`} />
              </button>
            </div>
            <div>
              <label htmlFor="cg-timeout" className="label">Timeout invio automatico (secondi)</label>
              <input
                id="cg-timeout"
                type="number"
                className="input mono"
                value={form.autoSendTimeout || 30}
                onChange={e => upd('autoSendTimeout', parseInt(e.target.value, 10) || 30)}
                min={5}
                max={300}
                disabled={!form.enabled}
              />
              <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>Tempo di attesa dopo conferma contratto prima dell'invio (per consentire annullamenti)</div>
            </div>
          </div>
        </FormSection>

        {!valid && (
          <div className="text-xs p-3 rounded flex items-start gap-2" style={{ background: 'var(--surface-2)', color: 'var(--warning)' }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Senza username e password, l'invio CARGOS sarà disattivato. Potrai comunque salvare i contratti localmente.</span>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function NewCustomerModal({ customer, onClose, onSave }) {
  const editing = !!customer;
  const [form, setForm] = useState(customer || {
    cognome: '', nome: '', nascita: '', luogoNascita: '', cittadinanza: 'Italia',
    docTipo: 'CI', docNum: '', patente: '', tel: '', email: '',
    fatturazione: null,
  });
  const upd = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);
  const billingActive = form.fatturazione !== null;
  const valid = form.cognome && form.nome && form.docNum;

  return (
    <ModalShell
      id="new-customer-title"
      title={editing ? `${customer.cognome} ${customer.nome}` : 'Aggiungi alla rubrica'}
      subtitle={editing ? 'Modifica cliente · admin' : 'Nuovo cliente · admin'}
      onClose={onClose}
      maxWidth="max-w-3xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost px-4 py-2 rounded text-sm">Annulla</button>
          <button type="button" onClick={() => valid && onSave(form)} disabled={!valid} aria-disabled={!valid} className="btn-primary px-4 py-2 rounded text-sm font-semibold flex items-center gap-2">
            <Save className="w-4 h-4" aria-hidden="true" /> {editing ? 'Salva modifiche' : 'Aggiungi cliente'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <FormSection title="Anagrafica">
          <div className="grid grid-cols-2 gap-3">
            <FormField id="nc-cognome" label="Cognome" req value={form.cognome} onChange={v => upd('cognome', v)} />
            <FormField id="nc-nome"    label="Nome"    req value={form.nome}    onChange={v => upd('nome', v)} />
            <FormField id="nc-nascita" label="Data nascita" placeholder="DD/MM/AAAA" value={form.nascita} onChange={v => upd('nascita', v)} mono />
            <FormField id="nc-luogo"   label="Luogo nascita" value={form.luogoNascita} onChange={v => upd('luogoNascita', v)} />
            <FormField id="nc-cittad"  label="Cittadinanza"  value={form.cittadinanza} onChange={v => upd('cittadinanza', v)} />
          </div>
        </FormSection>
        <div className="divider-dotted" />
        <FormSection title="Contatti">
          <div className="grid grid-cols-2 gap-3">
            <FormField id="nc-tel"   label="Telefono" req value={form.tel}   onChange={v => upd('tel', v)}   mono placeholder="+39 ..." hint="usato per allerte rientri e WhatsApp" />
            <FormField id="nc-email" label="Email"    req value={form.email} onChange={v => upd('email', v)} type="email" placeholder="nome@email.com" hint="invio QR cliente, ricevuta noleggio" />
          </div>
        </FormSection>
        <div className="divider-dotted" />
        <FormSection title="Documento e patente">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="nc-docTipo" className="label">Tipo documento</label>
              <select id="nc-docTipo" className="input" value={form.docTipo} onChange={e => upd('docTipo', e.target.value)}>
                {Object.entries(TIPO_DOC).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <FormField id="nc-docNum"  label="Numero documento" req value={form.docNum}  onChange={v => upd('docNum', v)}  mono />
            <FormField id="nc-patente" label="Numero patente"      value={form.patente}  onChange={v => upd('patente', v)} mono />
          </div>
        </FormSection>
        <div className="divider-dotted" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'var(--ink-2)' }}>Fatturazione</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Compila se il cliente richiede fattura · puoi farlo anche dopo</div>
            </div>
            <Toggle
              checked={billingActive}
              onChange={v => upd('fatturazione', v ? { tipo: 'privato', cf: '', piva: '', ragioneSociale: '', indirizzo: '', sdi: '', pec: '' } : null)}
              label="Abilita fatturazione"
            />
          </div>
          {billingActive && (
            <div className="card-paper p-4 fade-in">
              <BillingForm fatturazione={form.fatturazione} onChange={v => upd('fatturazione', v)} />
            </div>
          )}
        </div>
        <div className="text-xs p-3 rounded flex items-start gap-2" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>I dati saranno cifrati AES-256-GCM nel database e accessibili solo agli operatori autenticati. Conservazione fiscale: 7 anni (DPR 600/1973). Cancellazione GDPR su richiesta.</span>
        </div>
      </div>
    </ModalShell>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL: PLATE SCANNER
// ═══════════════════════════════════════════════════════════════════
function PlateScanModal({ fleet, onClose }) {
  const [stage, setStage] = useState('camera'); // 'camera' | 'review' | 'manual' | 'found' | 'notfound'
  const [snapshot, setSnapshot] = useState(null);   // dataURL della foto
  const [plateInput, setPlateInput] = useState(''); // targa estratta/inserita
  const [match, setMatch] = useState(null);
  const fileInputRef = useRef(null);
  const { videoRef, error: camError, ready, capture } = useCameraStream(stage === 'camera');

  const lookupPlate = (plate) => {
    const normalized = plate.toUpperCase().replace(/\s+/g, '').trim();
    if (!normalized) return;
    const v = fleet.find(x => x.targa === normalized);
    if (v) {
      setMatch(v);
      setStage('found');
    } else {
      setPlateInput(normalized);
      setStage('notfound');
    }
  };

  const handleCapture = () => {
    const dataUrl = capture();
    if (dataUrl) {
      setSnapshot(dataUrl);
      setStage('review');
    }
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setSnapshot(e.target?.result);
      setStage('review');
    };
    reader.readAsDataURL(file);
  };

  return (
    <ModalShell
      id="plate-scan-title"
      title={
        stage === 'camera' ? 'Inquadra la targa' :
        stage === 'review' ? 'Conferma la targa' :
        stage === 'manual' ? 'Inserisci la targa' :
        stage === 'found'  ? 'Veicolo trovato' : 'Targa non trovata'
      }
      subtitle="Lettura targa"
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      {stage === 'camera' && (
        <div>
          <div className="relative mx-auto rounded overflow-hidden" style={{ background: 'var(--ink)', minHeight: 280 }}>
            {!camError ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay playsInline muted
                  className="w-full h-auto"
                  style={{ display: 'block', maxHeight: 360, objectFit: 'cover' }}
                  aria-label="Anteprima fotocamera"
                />
                {/* Overlay viewfinder */}
                <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-16 border-2 rounded pointer-events-none" style={{ borderColor: 'var(--accent)' }}>
                  {ready && <div className="scan-line" />}
                </div>
                {!ready && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ color: '#f9f5ec', opacity: 0.7 }}>
                    <div className="text-center">
                      <Camera className="w-10 h-10 mx-auto mb-2 animate-pulse" />
                      <div className="text-xs">Avvio fotocamera…</div>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 inset-x-0 text-center text-xs mono" style={{ color: '#f9f5ec', opacity: 0.7 }} aria-hidden="true">
                  centra la targa nel rettangolo
                </div>
              </>
            ) : (
              <div className="p-8 text-center" style={{ color: '#f9f5ec' }}>
                <AlertCircle className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--warning)' }} />
                <div className="text-sm">{camError}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              type="button"
              onClick={handleCapture}
              disabled={!ready || !!camError}
              className="btn-accent py-2.5 rounded text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Camera className="w-4 h-4" /> Scatta foto
            </button>
            <label className="btn-ghost py-2.5 rounded text-sm font-semibold border flex items-center justify-center gap-2 cursor-pointer" style={{ borderColor: 'var(--border)' }}>
              <Upload className="w-4 h-4" /> Carica immagine
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setStage('manual')}
            className="btn-ghost w-full mt-2 py-2 rounded text-xs"
          >
            Inserisci targa manualmente
          </button>

          <div className="text-[11px] mt-3 text-center" style={{ color: 'var(--muted)' }}>
            OCR locale on-device · nessun frame inviato in rete
          </div>
        </div>
      )}

      {stage === 'review' && snapshot && (
        <div>
          <img src={snapshot} alt="Foto targa" className="w-full rounded mb-3" style={{ maxHeight: 280, objectFit: 'contain', background: '#000' }} />
          <div className="text-xs mb-2" style={{ color: 'var(--muted)' }}>
            <Info className="w-3 h-3 inline mr-1" />
            In produzione: OCR locale (Tesseract.js o ML Kit) leggerà la targa. Per ora inserisci la targa manualmente:
          </div>
          <input
            type="text"
            value={plateInput}
            onChange={e => setPlateInput(e.target.value.toUpperCase())}
            placeholder="es. AB123CD"
            className="input mono text-center text-lg font-bold tracking-wider"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button type="button" onClick={() => { setSnapshot(null); setPlateInput(''); setStage('camera'); }} className="btn-ghost py-2.5 rounded text-sm border" style={{ borderColor: 'var(--border)' }}>
              Riprova
            </button>
            <button type="button" onClick={() => lookupPlate(plateInput)} disabled={!plateInput.trim()} className="btn-primary py-2.5 rounded text-sm font-semibold disabled:opacity-40">
              Cerca
            </button>
          </div>
        </div>
      )}

      {stage === 'manual' && (
        <div>
          <label className="label">Targa</label>
          <input
            type="text"
            value={plateInput}
            onChange={e => setPlateInput(e.target.value.toUpperCase())}
            placeholder="es. AB123CD"
            className="input mono text-center text-lg font-bold tracking-wider"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') lookupPlate(plateInput); }}
          />
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button type="button" onClick={() => setStage('camera')} className="btn-ghost py-2.5 rounded text-sm border" style={{ borderColor: 'var(--border)' }}>
              <Camera className="w-4 h-4 inline mr-1" /> Usa fotocamera
            </button>
            <button type="button" onClick={() => lookupPlate(plateInput)} disabled={!plateInput.trim()} className="btn-primary py-2.5 rounded text-sm font-semibold disabled:opacity-40">
              Cerca
            </button>
          </div>
        </div>
      )}

      {stage === 'found' && match && (
        <div>
          <div className="card-paper p-4 flex items-start gap-4">
            <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'var(--success-soft)' }}>
              <VehicleIcon type={match.tipo} className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="mono text-lg font-semibold tracking-wider px-2 py-1 inline-block rounded mb-2" style={{ background: 'var(--surface-2)' }}>{match.targa}</div>
              <div className="serif text-lg leading-tight">{match.marca} {match.modello}</div>
              <div className="text-sm" style={{ color: 'var(--ink-2)' }}>{match.colore || '—'} · {match.cilindrata || '—'}</div>
              <div className="flex items-center gap-2 mt-2">
                {match.stato && VEHICLE_STATUS[match.stato] && (
                  <span className={`pill ${VEHICLE_STATUS[match.stato].pill}`}>
                    {VEHICLE_STATUS[match.stato].label}
                  </span>
                )}
                <span className="pill pill-neutral">{VEHICLE_TYPES[match.tipo].label}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button type="button" onClick={onClose} className="btn-ghost px-4 py-2.5 rounded text-sm border flex items-center justify-center gap-2" style={{ borderColor: 'var(--border)' }}>
              <Eye className="w-4 h-4" aria-hidden="true" /> Apri dettaglio
            </button>
            <button type="button" onClick={onClose} className="btn-primary px-4 py-2.5 rounded text-sm font-semibold flex items-center justify-center gap-2">
              <FileCheck2 className="w-4 h-4" aria-hidden="true" /> Avvia rientro
            </button>
          </div>
        </div>
      )}

      {stage === 'notfound' && (
        <div className="text-center py-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--warning)' }} />
          <div className="serif text-lg mb-1">Targa non trovata in flotta</div>
          <div className="text-sm mb-4" style={{ color: 'var(--ink-2)' }}>
            La targa <span className="mono font-semibold">{plateInput}</span> non corrisponde a nessun veicolo registrato.
          </div>
          <button type="button" onClick={() => { setPlateInput(''); setSnapshot(null); setStage('camera'); }} className="btn-primary px-4 py-2 rounded text-sm font-semibold">
            Riprova
          </button>
        </div>
      )}
    </ModalShell>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL: SHIFT CHANGE
// ═══════════════════════════════════════════════════════════════════
function ShiftChangeModal({ currentOperator, operators, onClose, onConfirm }) {
  const [newOpId, setNewOpId] = useState(null);
  const [taken, setTaken] = useState({});
  const openContracts = MOCK_CONTRACTS.filter(c => c.fuori || c.stato === 'bozza' || c.stato === 'errore');
  const ops = operators || [];
  const enabledOps = ops.filter(o => o.enabled !== false);
  const newOp = ops.find(o => o.id === newOpId);
  const takenCount = Object.values(taken).filter(Boolean).length;
  // Calcola le iniziali a partire dal nome se non sono già nel record
  const initialsOf = (op) => op?.initials || op?.nome?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <ModalShell
      id="shift-title"
      title="Sigillo di consegna"
      subtitle="Audit log · cambio turno"
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={newOpId ? (
        <>
          <div className="text-xs flex-1" style={{ color: 'var(--muted)' }}>
            <Stamp className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
            Verrà generata una voce immutabile in audit log con timestamp, IP, operatori e pratiche.
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-4 py-2 rounded text-sm">Annulla</button>
          <button type="button" onClick={() => { const idx = ops.findIndex(o => o.id === newOpId); onConfirm(idx, takenCount); }} className="btn-accent px-4 py-2 rounded text-sm font-semibold flex items-center gap-2">
            <FileSignature className="w-4 h-4" aria-hidden="true" /> Sigilla
            {takenCount > 0 && <span className="pill" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{takenCount}</span>}
          </button>
        </>
      ) : null}
    >
      <div className="card-paper p-4 mb-5 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: 'var(--ink)', color: '#f9f5ec' }} aria-hidden="true">{initialsOf(currentOperator)}</div>
          <div><div className="text-xs" style={{ color: 'var(--muted)' }}>uscente</div><div className="font-medium text-sm">{currentOperator.nome}</div></div>
        </div>
        <ArrowRight className="w-5 h-5" style={{ color: 'var(--muted)' }} aria-hidden="true" />
        {newOp ? (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: 'var(--accent)', color: 'white' }} aria-hidden="true">{initialsOf(newOp)}</div>
            <div><div className="text-xs" style={{ color: 'var(--muted)' }}>entrante</div><div className="font-medium text-sm">{newOp.nome}</div></div>
          </div>
        ) : <div className="text-sm" style={{ color: 'var(--muted)' }}>seleziona l'operatore subentrante</div>}
      </div>

      {!newOpId && (
        <div className="mb-5">
          <div className="label mb-2">Operatore subentrante</div>
          <div className="grid grid-cols-2 gap-2">
            {enabledOps.filter(o => o.id !== currentOperator.id).map(o => (
              <button key={o.id} type="button" onClick={() => setNewOpId(o.id)} className="card-paper p-3 text-left hover:border-[var(--ink)] transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ background: 'var(--surface-2)' }} aria-hidden="true">{initialsOf(o)}</div>
                  <div><div className="font-medium text-sm">{o.nome}</div><div className="text-[11px]" style={{ color: 'var(--muted)' }}>{o.ruolo || o.role || 'operator'}{o.turno ? ` · ${o.turno}` : ''}</div></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {newOpId && (
        <>
          <div className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--ink-2)' }}>Pratiche da prendere in carico · {openContracts.length}</div>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
            Le pratiche selezionate continueranno con OPERATORE_ID = <span className="mono">{newOp.id}</span>. Le altre restano firmate da {currentOperator.nome.split(' ')[0]}.
          </p>
          <div className="space-y-2" role="group" aria-label="Selezione pratiche da trasferire">
            {openContracts.map(c => (
              <label key={c.id} className="card-paper p-3 flex items-center gap-3 cursor-pointer hover:border-[var(--ink-2)] transition-all">
                <input type="checkbox" checked={!!taken[c.id]} onChange={e => setTaken(t => ({ ...t, [c.id]: e.target.checked }))} className="w-4 h-4" />
                <div className="flex-1">
                  <div className="flex items-center gap-2"><span className="mono text-xs">{c.id}</span><StatusPill stato={c.stato} /></div>
                  <div className="text-sm font-medium mt-0.5">{c.cliente}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{c.veicolo} · rientro {c.consegnaTimestamp}</div>
                </div>
              </label>
            ))}
          </div>
        </>
      )}
    </ModalShell>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL: CUSTOMER QR
// ═══════════════════════════════════════════════════════════════════
function QRCustomerModal({ customer, onClose }) {
  return (
    <ModalShell
      id="qr-modal-title"
      title={`${customer.cognome} ${customer.nome}`}
      subtitle="Codice personale cliente"
      onClose={onClose}
      maxWidth="max-w-md"
      footer={
        <>
          <button type="button" className="btn-ghost flex-1 px-4 py-2 rounded text-sm border flex items-center justify-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <Phone className="w-4 h-4" aria-hidden="true" /> WhatsApp
          </button>
          <button type="button" className="btn-ghost flex-1 px-4 py-2 rounded text-sm border flex items-center justify-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <Mail className="w-4 h-4" aria-hidden="true" /> Email
          </button>
          <button type="button" className="btn-primary flex-1 px-4 py-2 rounded text-sm font-semibold flex items-center justify-center gap-2">
            <Download className="w-4 h-4" aria-hidden="true" /> Stampa
          </button>
        </>
      }
    >
      <div className="text-center">
        <div className="inline-block p-4 rounded" style={{ background: 'var(--surface)' }}>
          <FakeQR seed={`EDO-${customer.id}-${customer.docNum}`} />
        </div>
        <div className="mt-4">
          <div className="text-sm font-medium">Codice valido per pre-compilazione</div>
          <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Riutilizzabile illimitatamente · revocabile dal cliente</div>
        </div>
        <div className="card-paper p-3 mt-4 text-left text-xs">
          <div className="font-semibold mb-1">Cosa contiene</div>
          <div style={{ color: 'var(--ink-2)' }}>Un riferimento opaco firmato (HMAC-SHA256). I dati personali restano sul server di Edonoleggio: il QR è una chiave, non un dossier.</div>
        </div>
      </div>
    </ModalShell>
  );
}

// FakeQR — memoized, costoso da ri-renderizzare
const FakeQR = memo(function FakeQR({ seed = 'demo' }) {
  const cells = useMemo(() => {
    const size = 21;
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    const rng = () => { h = (h * 1103515245 + 12345) | 0; return Math.abs(h); };
    const out = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const isCorner = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
        if (isCorner || x === 6 || y === 6) continue;
        if (rng() % 100 > 52) out.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#1a1815" />);
      }
    }
    return out;
  }, [seed]);

  const SIZE = 21;
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-48 h-48" shapeRendering="crispEdges" role="img" aria-label="QR code cliente">
      {[[0, 0], [SIZE - 7, 0], [0, SIZE - 7]].map(([fx, fy], i) => (
        <g key={i}>
          <rect x={fx} y={fy} width={7} height={7} fill="#1a1815" />
          <rect x={fx + 1} y={fy + 1} width={5} height={5} fill="white" />
          <rect x={fx + 2} y={fy + 2} width={3} height={3} fill="#1a1815" />
        </g>
      ))}
      {cells}
    </svg>
  );
});

// ═══════════════════════════════════════════════════════════════════
// SHARED FORM PRIMITIVES
// ═══════════════════════════════════════════════════════════════════

// FormField — memoized, with proper htmlFor/id wiring
const FormField = memo(function FormField({ id, label, value, onChange, req, mono, placeholder, hint, type = 'text' }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}{req && <span className="req" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        type={type}
        className={`input ${mono ? 'mono' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-required={req ? 'true' : undefined}
      />
      {hint && <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{hint}</div>}
    </div>
  );
});

const FormSection = memo(function FormSection({ title, children }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest mb-3 font-semibold" style={{ color: 'var(--ink-2)' }}>{title}</div>
      {children}
    </div>
  );
});
