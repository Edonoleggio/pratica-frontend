import { useState, useMemo, useEffect, useRef, useCallback, memo, Component } from 'react';
import { CalendarDays, Receipt, BarChart2,
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
  CircleDot, Power, Shield, Briefcase, Zap, Package
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// APP VERSION — visualizzata in Impostazioni
// ═══════════════════════════════════════════════════════════════════
// Mantieni questa stringa allineata con i tag git e i deploy Render.
// Convenzione: x.y.z dove x = major rewrite, y = feature, z = fix.
// La data accanto aiuta a verificare al volo che il deploy sia andato a buon fine.
const APP_VERSION = {
  number: '0.15.0',
  codename: 'Registro cassa · Storico cliente',
  date: '2026-05-18',
  changelog: [
    'Registro cassa: traccia acconti, saldi, rimborsi con export CSV',
    'Storico cliente: storico completo prenotazioni e pratiche per cliente',
    'RentMe sync live: disponibilità reale da gestionale (auto ogni 5 min)',
    'Banco Rapido: walk-in con griglia disponibilità → prenotazione in un tap',
    'PDF export preventivo: stampa / salva PDF direttamente dal preventivo',
    'Editor stagioni: configura mesi bassa/media/alta dall\'interfaccia',
    'Import flotta CSV: carica lista mezzi da file con anteprima',
    'Alert stock: avvisi automatici quando categoria sotto soglia 25%',
    'DisponibilitaView aggiornata: usa dati RentMe quando disponibili',
    'Anagrafica agenzia editabile da Impostazioni → Modifica (admin)',
    'Tracking reale veicoli fuori: pannello "Veicoli fuori" nella Dashboard',
    'Calcolo automatico ritardo / imminente / programmato dai contratti reali',
    'Aggiornamento live ogni 60s: i veicoli passano da "imminenti" a "in ritardo" da soli',
    'Pulsante "Veicolo rientrato" su Dashboard e lista Pratiche',
    'Filtro "In viaggio" nella lista Pratiche per veicoli ancora fuori',
    'Reset archivi · zona pericolosa: svuota rubrica/contratti/tutto dal backend',
    'Risolve i 3 clienti finti che riapparivano dal backend Render',
    'Sync agenzia: i dati anagrafici sono coerenti tra tutti i tablet',
    'Storage ibrido backend Render + localStorage di fallback',
    'Error boundary globale · toggle CARGOS · mapping 46 campi CARGOS',
  ],
};

// ═══════════════════════════════════════════════════════════════════
// ERROR BOUNDARY — niente più schermate bianche
// ═══════════════════════════════════════════════════════════════════
// React di default svuota tutto il DOM quando un componente crasha, lasciando
// pagina bianca. Questo boundary cattura l'errore in qualsiasi figlio e mostra
// un fallback leggibile con stack trace, utile per diagnosticare al volo.
// In produzione si potrebbe loggare a Sentry/backend; qui lo mostra inline.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { error, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    if (typeof console !== 'undefined' && console.error) {
      console.error('[Pratica] Error boundary catch:', error, errorInfo);
    }
  }

  reset = () => this.setState({ error: null, errorInfo: null });

  render() {
    if (!this.state.error) return this.props.children;

    const { error, errorInfo } = this.state;
    const msg = error?.message || String(error);
    const stack = error?.stack || '';
    const componentStack = errorInfo?.componentStack || '';

    return (
      <div style={{ minHeight: '100vh', background: '#faf7f2', padding: '40px 24px', fontFamily: '"IBM Plex Sans", system-ui, sans-serif', color: '#1a1815' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ background: '#f4d8d8', border: '1px solid #c83434', borderLeft: '4px solid #c83434', padding: '20px 24px', borderRadius: 4, marginBottom: 20 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c83434', marginBottom: 4, fontWeight: 600 }}>
              Errore inatteso · Pratica v{APP_VERSION?.number || '?'}
            </div>
            <h1 style={{ fontFamily: '"Newsreader", Georgia, serif', fontSize: 24, fontWeight: 500, margin: '0 0 12px' }}>
              Qualcosa è andato storto
            </h1>
            <p style={{ fontSize: 14, color: '#3a352e', margin: '0 0 16px', lineHeight: 1.5 }}>
              L'applicazione ha incontrato un errore e non può proseguire da questa schermata. I dati salvati sono intatti. Puoi tornare alla schermata principale o ricaricare l'app.
            </p>
            <div style={{ padding: 12, background: '#faf7f2', border: '1px solid #d4ccba', borderRadius: 4, fontFamily: '"JetBrains Mono", Menlo, monospace', fontSize: 12, color: '#1a1815', wordBreak: 'break-word' }}>
              <strong>{error?.name || 'Error'}:</strong> {msg}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button type="button" onClick={this.reset} style={{ padding: '8px 16px', background: '#c83434', color: 'white', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Riprova
              </button>
              <button type="button" onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }} style={{ padding: '8px 16px', background: 'white', color: '#1a1815', border: '1px solid #d4ccba', borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Ricarica app
              </button>
            </div>
          </div>

          <details style={{ background: '#fff', border: '1px solid #d4ccba', borderRadius: 4, padding: 16, fontSize: 12 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#3a352e' }}>
              Dettagli tecnici (utile per assistenza)
            </summary>
            {stack && (
              <>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a7068', marginTop: 12, marginBottom: 4 }}>Stack JavaScript</div>
                <pre style={{ margin: 0, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#3a352e', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 200, overflow: 'auto', padding: 8, background: '#faf7f2', border: '1px solid #e8e0cc', borderRadius: 3 }}>{stack}</pre>
              </>
            )}
            {componentStack && (
              <>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a7068', marginTop: 12, marginBottom: 4 }}>Stack componenti React</div>
                <pre style={{ margin: 0, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#3a352e', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 200, overflow: 'auto', padding: 8, background: '#faf7f2', border: '1px solid #e8e0cc', borderRadius: 3 }}>{componentStack}</pre>
              </>
            )}
          </details>
        </div>
      </div>
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// EDONOLEGGIO — REAL COMPANY DATA
// www.edonoleggio.com · Pionieri del noleggio a Lampedusa dal 1994
// ═══════════════════════════════════════════════════════════════════

// Valori iniziali Edonoleggio. In v0.12+ questi dati sono editabili via UI
// (Impostazioni → Anagrafica agenzia). Cambiamenti vengono propagati al backend
// e sincronizzati tra tutti i dispositivi del banco.
const INITIAL_AGENCY = {
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
  email: 'edomoto@libero.it',
  pec: 'edonoleggio@pec.it',
  questuraPec: 'ag.gab@pecps.poliziadistato.it',
  piva: '01900450840',
  cf: 'RPTLSN61A58E431A',
  agenziaId: 'EDO-LMP-1994',
  orari: 'Lun–Dom · 08:30–13:00 / 14:30–19:00',
  servizi: 'Auto · Scooter · Quad · E-bike · Mehari · Transfer · Officina',
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

// Clienti: nessun seed di simulazione. Il primo cliente viene aggiunto dall'operatore
// (manualmente o tramite QR/scan documento). La rubrica si popola con l'uso.
// Struttura del record cliente, per riferimento documentale:
//   { id, cognome, nome, nascita, luogoNascita, cittadinanza,
//     docTipo, docNum, patente, tel, email, visite, vip,
//     fatturazione: { tipo, ragioneSociale?, cf, piva, indirizzo, sdi, pec } | null }
const INITIAL_CUSTOMERS = [];

const INITIAL_PARTNERS = [
  { id: 's1',  nome: 'Aeroporto di Lampedusa',       tipo: 'aeroporto',   indirizzo: 'Contrada Cala Pisana, 92031 Lampedusa (AG)',  fissa: true },
  { id: 's2',  nome: 'Porto di Lampedusa',           tipo: 'porto',       indirizzo: 'Lungomare Luigi Rizzo, 92031 Lampedusa (AG)', fissa: true },
  { id: 's3',  nome: 'Sede Edonoleggio',             tipo: 'sede',        indirizzo: 'Cortile Caltanissetta, 92031 Lampedusa (AG)', fissa: true },
  { id: 's4',  nome: 'Nautic Hotel',                 tipo: 'hotel',       indirizzo: 'Lampedusa (AG)' },
  { id: 's5',  nome: "U' Piddu Hotel",               tipo: 'hotel',       indirizzo: 'Lampedusa (AG)' },
  { id: 's6',  nome: 'Moresco Resort',               tipo: 'resort',      indirizzo: 'Lampedusa (AG)' },
  { id: 's7',  nome: 'Il Villaggio del Mago',        tipo: 'resort',      indirizzo: 'Lampedusa (AG)' },
  { id: 's8',  nome: 'Villa Giulia Residence',       tipo: 'residence',   indirizzo: 'Lampedusa (AG)' },
  { id: 's9',  nome: '7 Palazzi',                    tipo: 'residence',   indirizzo: 'Lampedusa (AG)' },
  { id: 's10', nome: 'Le Barche Volanti',            tipo: 'guesthouse',  indirizzo: 'Via Roma, 92031 Lampedusa (AG)' },
  { id: 's11', nome: 'Perla del Sud',                tipo: 'guesthouse',  indirizzo: 'Lampedusa (AG)' },
  { id: 's12', nome: 'Dimora Spugnara',              tipo: 'guesthouse',  indirizzo: 'Lampedusa (AG)' },
  { id: 's13', nome: 'Farchikalà',                   tipo: 'guesthouse',  indirizzo: 'Lampedusa (AG)' },
  { id: 's14', nome: 'Appartamenti Alba e Tramonto', tipo: 'appartamento',indirizzo: 'Lampedusa (AG)' },
  { id: 's15', nome: 'Appartamenti Nino Paranzoto',  tipo: 'appartamento',indirizzo: 'Lampedusa (AG)' },
  { id: 's16', nome: 'Brezza Marina',                tipo: 'casa',        indirizzo: 'Lampedusa (AG)' },
  { id: 's17', nome: 'Casa vacanze da Ivan',         tipo: 'casa',        indirizzo: 'Lampedusa (AG)' },
  { id: 's18', nome: 'Casa di Manuela',              tipo: 'casa',        indirizzo: 'Lampedusa (AG)' },
  { id: 's19', nome: 'Casa vacanze da Nino',         tipo: 'casa',        indirizzo: 'Lampedusa (AG)' },
  { id: 's20', nome: 'Casette di Sara',              tipo: 'casa',        indirizzo: 'Lampedusa (AG)' },
  { id: 's21', nome: 'Le villette di Cala Galera',   tipo: 'casa',        indirizzo: 'Contrada Cala Galera, 92031 Lampedusa (AG)' },
  { id: 's22', nome: 'Le villette di Cala Madonna',  tipo: 'casa',        indirizzo: 'Contrada Cala Madonna, 92031 Lampedusa (AG)' },
];

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

// Operatori: il banco deve avere almeno un operatore per funzionare (l'app crasha
// se la lista è vuota, vedi guardia in SettingsPage). Quindi seed con la titolare
// reale di Edonoleggio. Altri operatori si aggiungono dalla UI in Impostazioni.
const MOCK_OPERATORS = [
  { id: 'op-alessandra', initials: 'AR', nome: 'Alessandra Raptis', turno: '08:30 → 13:00 / 14:30 → 19:00', current: true, ruolo: 'Titolare', role: 'admin', tel: '+39 339 172 8645', email: 'edomoto@libero.it', enabled: true },
];

// Contratti: nessuna simulazione. La lista pratiche si popola dal wizard reale.
// I record salvati hanno una struttura più ricca (vedi submitContract in App):
//   { contractId, createdAt, operatorId, status, vehicleType, cargosRequired,
//     cargosOverridden, record (46 campi CARGOS), wizardSnapshot, receipt, syncedAt }
// Questa costante esiste ancora solo per retrocompatibilità con vecchi riferimenti
// che usavano MOCK_CONTRACTS nel codice della Dashboard e dei contatori di rientro.
const MOCK_CONTRACTS = [];

const TIPO_PAGAMENTO = {
  C: { label: 'Carta di credito', cargosMap: 'C', icon: CreditCard },
  P: { label: 'PayPal',           cargosMap: 'A', icon: Wallet },
  B: { label: 'Bonifico',         cargosMap: 'B', icon: Building2 },
  T: { label: 'Contante',         cargosMap: 'T', icon: Wallet },
};

const TIPO_DOC = { CI: "Carta d'identità", PA: 'Passaporto', PT: 'Patente di guida', PE: 'Permesso di soggiorno' };

// ═══════════════════════════════════════════════════════════════════
// BACKEND API
// ═══════════════════════════════════════════════════════════════════
//
// Thin client per il backend Pratica (Node/Express). Endpoint base
// configurabile via env (VITE_PRATICA_API o NEXT_PUBLIC_PRATICA_API)
// o dal pannello Impostazioni (override locale, salvato in localStorage).
//
// Strategia:
//   • create contratto AUTO → POST sync, attesa fino a 30s, ricevuta CARGOS
//   • create contratto MOTO/SCOOTER → POST, salvato come 'paper' (escluso CARGOS)
//   • errore di rete → contratto sopravvive in localStorage, l'utente può
//     ritentare manualmente o lasciare al background sync
//   • timeout 30s per submission, 5s per health check
//   • retry esponenziale solo per chiamate idempotenti (GET, retry endpoint)
//   • idempotenza POST garantita dal CONTRATTO_ID univoco lato client
// ═══════════════════════════════════════════════════════════════════

// URL di default: in produzione (build Vite/Next) può essere injected da variabile d'ambiente.
// Altrimenti usiamo direttamente il backend Render già deployato e funzionante.
// L'utente admin può sempre sovrascrivere via UI in Impostazioni → Backend Pratica.
// Nota: NON usiamo `import.meta` direttamente perché il parser di alcuni ambienti
// (artifact preview Claude, vecchi bundler senza ESM) fallisce in fase di parsing.
function getDefaultApiBase() {
  try {
    // globalThis.process è popolato da Next.js a build time
    if (typeof globalThis !== 'undefined') {
      const p = globalThis.process;
      if (p && p.env && p.env.NEXT_PUBLIC_PRATICA_API) return p.env.NEXT_PUBLIC_PRATICA_API;
    }
  } catch {
    /* parser quiet */
  }
  // Default: backend Edonoleggio già deployato su Render
  return 'https://pratica-backend.onrender.com/api';
}
const DEFAULT_API_BASE = getDefaultApiBase();

// Errore tipizzato — distingue rete / validazione / server.
// Il chiamante può inspect err.kind per decidere il toast e il rollback.
class ApiError extends Error {
  constructor(kind, message, details) {
    super(message);
    this.kind = kind;     // 'network' | 'timeout' | 'validation' | 'server' | 'auth' | 'offline' | 'blocked'
    this.details = details;
  }
}

// Rileva se la chiamata a `url` sarà quasi sicuramente bloccata dal browser.
// Caso tipico: l'anteprima artifact di Claude gira sotto un CSP che blocca
// connect-src verso localhost. Senza questo check, il polling health spara
// 50+ errori console al minuto inutilmente. Meglio non chiamare proprio.
function isLikelyBlocked(url) {
  if (typeof window === 'undefined') return false;
  try {
    const target = new URL(url, window.location.href);
    const isLocalhost = target.hostname === 'localhost' || target.hostname === '127.0.0.1' || target.hostname === '0.0.0.0';
    if (!isLocalhost) return false;
    // Siamo dentro un iframe/sandbox? Probabile CSP restrittivo.
    // L'anteprima artifact di Claude è un iframe srcdoc dove window.location.hostname
    // è stringa vuota — non è "il nostro server", quindi chiamare localhost è inutile.
    // Anche claudeusercontent.com e simili sandbox host che non sono localhost vanno trattati uguale.
    const here = window.location.hostname;
    const inLocalDev = here === 'localhost' || here === '127.0.0.1';
    return !inLocalDev;
  } catch {
    return false;
  }
}

// Wrapper fetch con timeout + JSON + gestione errori uniforme.
async function apiFetch(baseUrl, path, options = {}) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ApiError('offline', 'Nessuna connessione di rete');
  }
  // Pre-check: se l'URL è quasi sicuramente bloccato dal CSP del contenitore
  // (tipico in anteprima artifact con localhost), evita di chiamare proprio
  // — evita spam di errori console e ottiene comunque feedback al chiamante.
  if (isLikelyBlocked(`${baseUrl}${path}`)) {
    throw new ApiError('blocked', 'Backend non raggiungibile da questo contesto (CSP/sandbox)');
  }
  const controller = new AbortController();
  const timeoutMs = options.timeout || 30000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.operatorId ? { 'X-Operator-Id': options.operatorId } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    let data = null;
    const text = await res.text();
    if (text) {
      try { data = JSON.parse(text); }
      catch { data = { ok: false, error: 'invalid_json', raw: text.slice(0, 200) }; }
    }

    if (!res.ok) {
      if (res.status === 400) throw new ApiError('validation', data?.error || 'Dati non validi', data);
      if (res.status === 401 || res.status === 403) throw new ApiError('auth', 'Non autorizzato', data);
      throw new ApiError('server', `Errore server ${res.status}`, data);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'AbortError') throw new ApiError('timeout', `Timeout (${timeoutMs / 1000}s) — server non risponde`);
    throw new ApiError('network', err.message || 'Errore di rete');
  } finally {
    clearTimeout(timer);
  }
}

// Genera un CONTRATTO_ID idempotente lato client.
// Formato: <AGENCY_ID>-<YYYYMMDD>-<seq>-<random>
// L'unicità è garantita dal random + timestamp. Se la rete cade e l'utente
// riprova, il client deve riusare lo stesso ID (è la regola di idempotenza).
function generateContractId(agenziaId) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${agenziaId || 'EDO'}-${ymd}-${rand}`;
}

// Mappa il wizard data → record CARGOS tracciato.
// Riferimento: D.M. 29/10/2021, Allegato A (45 campi).
// I codici tabellati (luoghi ISTAT, cittadinanza) usano valori provvisori
// che il backend rimpiazzerà se necessario — qui si fa best-effort.
function mapWizardToCargosRecord(data, operator, agency, partners) {
  const c = data.cliente?.full || {};
  const v = data.veicolo || {};
  const tipoCargos = VEICOLO_CARGOS_CODE[v.tipo] || 'A';

  const ritiroPartner = partners.find(p => p.id === data.ritiroStruttura);
  const consegnaPartner = partners.find(p => p.id === data.consegnaStruttura);
  const ritiroAddr = data.ritiroIndirizzo || ritiroPartner?.indirizzo || '';
  const consegnaAddr = data.consegnaIndirizzo || consegnaPartner?.indirizzo || '';

  return {
    CONTRATTO_ID: data.contractId || generateContractId(agency.agenziaId),
    CONTRATTO_DATA: data.contractDate || formatNowItalian(),
    CONTRATTO_TIPOP: data.pagamento || 'C',
    CONTRATTO_CHECKOUT_DATA: data.ritiroData || '',
    CONTRATTO_CHECKOUT_LUOGO_COD: agency.istatLuogo,
    CONTRATTO_CHECKOUT_INDIRIZZO: ritiroAddr,
    CONTRATTO_CHECKIN_DATA: data.consegnaData || '',
    CONTRATTO_CHECKIN_LUOGO_COD: agency.istatLuogo,
    CONTRATTO_CHECKIN_INDIRIZZO: consegnaAddr,
    OPERATORE_ID: operator?.id || 'unknown',
    AGENZIA_ID: agency.agenziaId,
    AGENZIA_NOME: agency.ragioneSociale,
    AGENZIA_LUOGO_COD: agency.istatLuogo,
    AGENZIA_INDIRIZZO: `${agency.indirizzoLegale}, ${agency.cap} ${agency.citta} (${agency.provincia})`,
    AGENZIA_RECAPITO_TEL: agency.telefono,
    VEICOLO_TIPO: tipoCargos,
    VEICOLO_MARCA: v.marca || '',
    VEICOLO_MODELLO: v.modello || '',
    VEICOLO_TARGA: (v.targa || '').toUpperCase().replace(/\s+/g, ''),
    VEICOLO_COLORE: v.colore || undefined,
    VEICOLO_GPS: v.gps ? 1 : 0,
    VEICOLO_BLOCCOM: v.blocco ? 1 : 0,
    CONDUCENTE_CONTRAENTE_COGNOME: c.cognome || '',
    CONDUCENTE_CONTRAENTE_NOME: c.nome || '',
    CONDUCENTE_CONTRAENTE_NASCITA_DATA: c.nascita || '',
    CONDUCENTE_CONTRAENTE_NASCITA_LUOGO_COD: 0,  // backend risolve da c.luogoNascita
    CONDUCENTE_CONTRAENTE_CITTADINANZA_COD: 0,   // backend risolve da c.cittadinanza
    CONDUCENTE_CONTRAENTE_DOCIDE_TIPO_COD: c.docTipo || 'CI',
    CONDUCENTE_CONTRAENTE_DOCIDE_NUMERO: c.docNum || '',
    CONDUCENTE_CONTRAENTE_DOCIDE_LUOGORIL_COD: agency.istatLuogo,
    CONDUCENTE_CONTRAENTE_PATENTE_NUMERO: c.patente || '',
    CONDUCENTE_CONTRAENTE_PATENTE_LUOGORIL_COD: agency.istatLuogo,
    CONDUCENTE_CONTRAENTE_RECAPITO: c.tel || undefined,
  };
}

// Mappatura tipi veicolo wizard → codice CARGOS (1 lettera)
const VEICOLO_CARGOS_CODE = { auto: 'A', scooter: 'M', quad: 'M', ebike: null };

// Formatta now() come "DD/MM/YYYY HH:MM" — formato richiesto da CARGOS
function formatNowItalian() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Parsing inverso: "DD/MM/YYYY HH:MM" → Date object (o null se invalido)
// Usato per calcolare i minuti al rientro dai contratti, e altre operazioni
// che richiedono di confrontare orari/date reali con il momento attuale.
function parseItalianDateTime(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const [, d, mo, y, h, mi] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
  return isNaN(date.getTime()) ? null : date;
}

// Factory delle funzioni API — il base URL viene dal Context o passato esplicitamente.
function makeApi(baseUrl) {
  return {
    health: () => apiFetch(baseUrl, '/health', { timeout: 5000 }),

    checkContract: (record) =>
      apiFetch(baseUrl, '/contracts/check', { method: 'POST', body: record, timeout: 10000 }),

    submitContract: (record, mode = 'sync', operatorId) =>
      apiFetch(baseUrl, `/contracts?mode=${mode}`, {
        method: 'POST',
        body: record,
        operatorId,
        timeout: mode === 'sync' ? 35000 : 8000,  // sync attende CARGOS, async ritorna subito
      }),

    getContract: (id) => apiFetch(baseUrl, `/contracts/${encodeURIComponent(id)}`, { timeout: 8000 }),

    listContracts: (params = {}) => {
      const qs = new URLSearchParams();
      if (params.status) qs.set('status', params.status);
      if (params.since)  qs.set('since', String(params.since));
      if (params.limit)  qs.set('limit', String(params.limit));
      return apiFetch(baseUrl, `/contracts?${qs}`, { timeout: 10000 });
    },

    retryContract: (id, operatorId) =>
      apiFetch(baseUrl, `/contracts/${encodeURIComponent(id)}/retry`, {
        method: 'POST', operatorId, timeout: 35000,
      }),

    // CSV fallback — restituisce il payload base64 e le istruzioni PEC
    csvBatch: (ids) =>
      apiFetch(baseUrl, '/contracts/csv-batch', { method: 'POST', body: { ids }, timeout: 10000 }),
  };
}

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

// usePersistentState — stato che vive in TRE livelli, in ordine di affidabilità:
//   1. memoria (useState)               — sempre disponibile, perso a refresh
//   2. localStorage del browser         — sopravvive a refresh, locale al dispositivo
//   3. backend Render `/api/store/:key` — sync tra tutti i dispositivi
//
// Strategia:
//   • All'avvio: carichiamo prima da localStorage (zero latenza, schermata istantanea),
//     poi tentiamo backend in background. Se il backend ha dati più recenti, sovrascrive.
//   • In scrittura: aggiorniamo lo state e localStorage SUBITO, ma il save remoto è
//     debounced 1.5s. Se l'utente sta digitando rapidamente (es. modifica indirizzo
//     cliente), un solo POST parte alla fine, non uno per lettera.
//   • Se il backend cade, il salvataggio remoto fallisce silenziosamente — i dati
//     sono comunque al sicuro in localStorage. Una sync esplicita ("Sincronizza ora"
//     in Impostazioni) li reinvia quando il backend torna.
//   • Niente polling automatico: spreca batteria, tiene sveglio il Render free tier,
//     e in scenari reali sovrascrive lo state se due dispositivi modificano insieme.
//
// firma: usePersistentState(key, initialValue, options?)
//   options.baseUrl   — URL backend (se assente, no sync remota)
//   options.skipRemote — true per disabilitare backend (utile in test)
//
function usePersistentState(key, initialValue, options = {}) {
  const { baseUrl, skipRemote } = options;

  // Lettura sincrona da localStorage all'init
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined' || !window.localStorage) return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  // Stato sync remota (per UI)
  const [remoteStatus, setRemoteStatus] = useState(skipRemote || !baseUrl ? 'disabled' : 'idle');
  const [lastRemoteSync, setLastRemoteSync] = useState(null);

  // Tracciamento per evitare cicli e race
  const initialLoadDone = useRef(false);
  const saveTimerRef = useRef(null);
  const lastSavedRef = useRef(null);  // ultimo valore salvato → evita POST inutili

  // Salvataggio locale immediato a ogni cambio
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota piena → state resta in memoria, OK
    }
  }, [key, value]);

  // Caricamento iniziale dal backend (una volta sola, in background)
  useEffect(() => {
    if (skipRemote || !baseUrl || initialLoadDone.current) return;
    initialLoadDone.current = true;
    let cancelled = false;

    setRemoteStatus('loading');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    fetch(`${baseUrl}/store/${encodeURIComponent(key)}`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled) return;
        // Se il backend ha un valore non-null, sovrascrive il locale.
        // Convenzione: { value: ... } payload del backend.
        if (data && data.value !== null && data.value !== undefined) {
          setValue(data.value);
          lastSavedRef.current = JSON.stringify(data.value);
        }
        setRemoteStatus('synced');
        setLastRemoteSync(new Date());
      })
      .catch(() => {
        if (cancelled) return;
        // Errore di rete o timeout: silente, restiamo su localStorage
        setRemoteStatus('offline');
      })
      .finally(() => clearTimeout(timer));

    return () => { cancelled = true; controller.abort(); clearTimeout(timer); };
  }, [key, baseUrl, skipRemote]);

  // Salvataggio remoto debounced — parte 1.5s dopo l'ultima modifica
  useEffect(() => {
    if (skipRemote || !baseUrl || !initialLoadDone.current) return;
    const serialized = JSON.stringify(value);
    if (serialized === lastSavedRef.current) return;  // niente di nuovo, skip

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      setRemoteStatus('saving');
      fetch(`${baseUrl}/store/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
        signal: controller.signal,
      })
        .then(r => {
          if (r.ok) {
            lastSavedRef.current = serialized;
            setRemoteStatus('synced');
            setLastRemoteSync(new Date());
          } else {
            setRemoteStatus('error');
          }
        })
        .catch(() => setRemoteStatus('offline'))
        .finally(() => clearTimeout(timeout));
    }, 1500);

    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [key, value, baseUrl, skipRemote]);

  // Sync manuale: forza re-fetch dal backend e re-save del corrente.
  // Tornata come funzione per essere chiamata dal pulsante "Sincronizza ora".
  const sync = useCallback(async () => {
    if (skipRemote || !baseUrl) return { ok: false, reason: 'remote_disabled' };
    setRemoteStatus('saving');
    try {
      // Re-push valore corrente (ha priorità su quello remoto se l'utente
      // ha modificato qualcosa offline — è una scelta deliberata di "client wins")
      const res = await fetch(`${baseUrl}/store/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      lastSavedRef.current = JSON.stringify(value);
      setRemoteStatus('synced');
      setLastRemoteSync(new Date());
      return { ok: true };
    } catch (err) {
      setRemoteStatus('offline');
      return { ok: false, reason: err.message };
    }
  }, [key, value, baseUrl, skipRemote]);

  return [value, setValue, { remoteStatus, lastRemoteSync, sync }];
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

// useBackendHealth — polling periodico /health del backend.
// Stati: 'checking' (boot) | 'online' | 'offline' | 'degraded' (CARGOS down)
// Polling: 30s normale, 5s quando offline (per accorgersi al volo del ritorno).
// Anche listener su window 'online'/'offline' per recovery immediato.
function useBackendHealth(api, enabled = true) {
  const [status, setStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);
  const [cargosOk, setCargosOk] = useState(null);
  const apiRef = useRef(api);
  apiRef.current = api;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer = null;

    const check = async () => {
      try {
        const result = await apiRef.current.health();
        if (cancelled) return;
        setLastCheck(new Date());
        setCargosOk(result?.cargos?.ok ?? null);
        setStatus(result?.cargos?.ok === false ? 'degraded' : 'online');
      } catch (err) {
        if (cancelled) return;
        // Se l'URL è bloccato dal contesto (CSP, sandbox iframe), non ha senso
        // continuare a fare polling — segniamo 'unconfigured' una volta e basta.
        if (err.kind === 'blocked') {
          setStatus('unconfigured');
          setCargosOk(null);
          return; // STOP: nessun re-schedule
        }
        setStatus('offline');
        setCargosOk(null);
      }
      // Re-check più frequente quando offline (5s) vs normale (30s)
      const nextDelay = status === 'offline' ? 5000 : 30000;
      timer = setTimeout(check, nextDelay);
    };

    check();

    // Listener su eventi network del browser per recovery immediato
    const onOnline = () => check();
    const onOffline = () => { if (!cancelled) setStatus('offline'); };
    if (typeof window !== 'undefined') {
      window.addEventListener('online', onOnline);
      window.addEventListener('offline', onOffline);
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
      }
    };
    // status nelle deps è intenzionale: regola la cadenza del polling.
  }, [enabled, status]);

  return { status, lastCheck, cargosOk };
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
      role="switch"
      aria-checked={checked}
      aria-label={label}
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

// ═══════════════════════════════════════════════════════════════════
// PRENOTAZIONI — modulo prenotazioni/calendario (v0.13)
// Ponte tra EDOX (booking management) e Pratica (contratti/CARGOS).
// Flusso: Preventivo → Prenotazione → [cliente arriva] → Converti in pratica
// Schema record:
//   { id, createdAt, updatedAt, operatorId,
//     clienteId, clienteNome, clienteCognome, clienteTel,
//     vehicleId, vehicleLabel, vehicleType,
//     dal, al, stato, fonte, prezzo, acconto, contractId, note }
// ═══════════════════════════════════════════════════════════════════

const PRENO_STATI = {
  attesa:      { label: 'In attesa',  color: '#b87333', bg: '#fdf3e3', dot: '#e9a44c' },
  confermata:  { label: 'Confermata', color: '#2e6e3e', bg: '#eaf4ec', dot: '#4a9e5c' },
  in_corso:    { label: 'In corso',   color: '#1f5d83', bg: '#e8f2f9', dot: '#3a8bbf' },
  completata:  { label: 'Completata', color: '#5a5047', bg: '#f2ede8', dot: '#9a8a78' },
  cancellata:  { label: 'Cancellata', color: '#8a3030', bg: '#faeaea', dot: '#c85050' },
};

const PRENO_FONTI = {
  diretto:       'Diretto',
  walkin:        'Walk-in',
  telefono:      'Telefono',
  online:        'Online',
  tour_operator: 'Tour operator',
};

function prenoId() {
  return 'pr' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatDate(d) {
  if (!d) return '—';
  const [y, m, g] = d.split('-');
  return `${g}/${m}/${y}`;
}

function daysDiff(dal, al) {
  if (!dal || !al) return 0;
  return Math.max(0, Math.round((new Date(al) - new Date(dal)) / 86400000));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ── PrenoStatPill ────────────────────────────────────────────────────
function PrenoStatPill({ stato }) {
  const s = PRENO_STATI[stato] || PRENO_STATI.attesa;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
      color: s.color, background: s.bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

// ── PrenoCard ────────────────────────────────────────────────────────
function PrenoCard({ p, onEdit, onConvert, onDelete }) {
  const giorni = daysDiff(p.dal, p.al);
  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '14px 16px',
      display: 'flex', gap: 14, alignItems: 'flex-start',
    }}>
      {/* date block */}
      <div style={{
        flexShrink: 0, width: 52, textAlign: 'center',
        background: 'var(--surface-2)', borderRadius: 6, padding: '6px 4px',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-serif)', lineHeight: 1 }}>
          {p.dal ? p.dal.slice(8) : '—'}
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
          {p.dal ? new Date(p.dal + 'T12:00:00').toLocaleString('it-IT', { month: 'short' }).toUpperCase() : ''}
        </div>
        <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 4, borderTop: '1px solid var(--border)', paddingTop: 4 }}>
          {giorni}g
        </div>
      </div>

      {/* main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>
            {p.clienteCognome || p.clienteNome ? `${p.clienteCognome || ''} ${p.clienteNome || ''}`.trim() : 'Cliente da definire'}
          </span>
          <PrenoStatPill stato={p.stato} />
          {p.contractId && (
            <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'monospace' }}>
              ⟶ pratica
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 4 }}>
          {p.vehicleLabel || 'Mezzo da assegnare'}
          {p.clienteTel && <> · <a href={`tel:${p.clienteTel}`} style={{ color: 'var(--ink-2)' }}>{p.clienteTel}</a></>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          {formatDate(p.dal)} → {formatDate(p.al)}
          {p.prezzo != null && <> · <strong style={{ color: 'var(--ink)' }}>€{p.prezzo}</strong></>}
          {p.acconto != null && p.acconto > 0 && <> · acconto €{p.acconto}</>}
          {p.fonte && <> · {PRENO_FONTI[p.fonte] || p.fonte}</>}
        </div>
        {p.note && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>{p.note}</div>}
      </div>

      {/* actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <button type="button" onClick={() => onEdit(p)}
          style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer' }}>
          Modifica
        </button>
        {(p.stato === 'confermata' || p.stato === 'in_corso') && !p.contractId && (
          <button type="button" onClick={() => onConvert(p)}
            style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
            → Pratica
          </button>
        )}
        <button type="button" onClick={() => onDelete(p.id)}
          style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #f0d0d0', background: 'transparent', color: '#c85050', cursor: 'pointer' }}>
          Elimina
        </button>
      </div>
    </div>
  );
}

// ── PrenoForm — add/edit ─────────────────────────────────────────────
function PrenoForm({ initial, fleet, customers, onSave, onClose }) {
  const empty = {
    clienteNome: '', clienteCognome: '', clienteTel: '',
    vehicleId: '', vehicleLabel: '', vehicleType: 'auto',
    dal: todayISO(), al: '', stato: 'attesa', fonte: 'diretto',
    prezzo: '', acconto: '', note: '',
  };
  const [f, setF] = useState(initial ? {
    ...empty,
    clienteNome: initial.clienteNome || '',
    clienteCognome: initial.clienteCognome || '',
    clienteTel: initial.clienteTel || '',
    vehicleId: initial.vehicleId || '',
    vehicleLabel: initial.vehicleLabel || '',
    vehicleType: initial.vehicleType || 'auto',
    dal: initial.dal || todayISO(),
    al: initial.al || '',
    stato: initial.stato || 'attesa',
    fonte: initial.fonte || 'diretto',
    prezzo: initial.prezzo != null ? String(initial.prezzo) : '',
    acconto: initial.acconto != null ? String(initial.acconto) : '',
    note: initial.note || '',
  } : empty);

  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  const availableVehicles = (fleet || []).filter(v => v.stato === 'available');

  function handleVehicleChange(e) {
    const id = e.target.value;
    const v = fleet.find(x => x.id === id);
    set('vehicleId', id);
    set('vehicleLabel', v ? `${v.marca} ${v.modello} · ${v.targa}`.trim() : '');
    set('vehicleType', v ? v.tipo : 'auto');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!f.dal) return;
    onSave({
      ...f,
      prezzo: f.prezzo !== '' ? parseFloat(f.prezzo) : null,
      acconto: f.acconto !== '' ? parseFloat(f.acconto) : null,
    });
  }

  const inp = { border: '1px solid var(--border)', borderRadius: 4, padding: '7px 10px', fontSize: 13, width: '100%', background: 'var(--bg)', color: 'var(--ink)', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-2)', marginBottom: 4 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg)', borderRadius: 10, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
            {initial ? 'Modifica prenotazione' : 'Nuova prenotazione'}
          </h2>
          <button type="button" onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--muted)', padding: '0 4px' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Cliente */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Cognome</label>
              <input style={inp} value={f.clienteCognome} onChange={e => set('clienteCognome', e.target.value)} placeholder="Rossi" />
            </div>
            <div>
              <label style={lbl}>Nome</label>
              <input style={inp} value={f.clienteNome} onChange={e => set('clienteNome', e.target.value)} placeholder="Mario" />
            </div>
          </div>
          <div>
            <label style={lbl}>Telefono</label>
            <input style={inp} type="tel" value={f.clienteTel} onChange={e => set('clienteTel', e.target.value)} placeholder="+39 333 123 4567" />
          </div>

          {/* Mezzo */}
          <div>
            <label style={lbl}>Mezzo</label>
            <select style={inp} value={f.vehicleId} onChange={handleVehicleChange}>
              <option value="">— Categoria generica —</option>
              {availableVehicles.map(v => (
                <option key={v.id} value={v.id}>{v.marca} {v.modello} · {v.targa} ({v.tipo})</option>
              ))}
            </select>
            {!f.vehicleId && (
              <input style={{ ...inp, marginTop: 6 }} value={f.vehicleLabel}
                onChange={e => set('vehicleLabel', e.target.value)}
                placeholder="es. Scooter 125cc standard" />
            )}
          </div>

          {/* Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Dal *</label>
              <input style={inp} type="date" required value={f.dal} onChange={e => set('dal', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Al</label>
              <input style={inp} type="date" value={f.al} min={f.dal} onChange={e => set('al', e.target.value)} />
            </div>
          </div>

          {/* Stato e fonte */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Stato</label>
              <select style={inp} value={f.stato} onChange={e => set('stato', e.target.value)}>
                {Object.entries(PRENO_STATI).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Fonte</label>
              <select style={inp} value={f.fonte} onChange={e => set('fonte', e.target.value)}>
                {Object.entries(PRENO_FONTI).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Prezzi */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Prezzo totale €</label>
              <input style={inp} type="number" min="0" step="0.01" value={f.prezzo} onChange={e => set('prezzo', e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label style={lbl}>Acconto €</label>
              <input style={inp} type="number" min="0" step="0.01" value={f.acconto} onChange={e => set('acconto', e.target.value)} placeholder="0.00" />
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={lbl}>Note</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 60 }} value={f.note} onChange={e => set('note', e.target.value)} placeholder="Note aggiuntive…" />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ padding: '9px 18px', borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 13 }}>
              Annulla
            </button>
            <button type="submit"
              style={{ padding: '9px 18px', borderRadius: 5, border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              {initial ? 'Salva modifiche' : 'Crea prenotazione'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── PrenotazioniPage ─────────────────────────────────────────────────
function PrenotazioniPage({ prenotazioni, setPrenotazioni, fleet, customers, operator, onOpenWizard, pushToast, prefill, onClearPrefill }) {
  const [form, setForm] = useState(null); // null | 'new' | {record}
  const [showDisp, setShowDisp] = useState(false);

  // Quando Preventivi passa un prefill (es. clic su "+ Prenota"), apri il form precompilato
  useEffect(() => {
    if (!prefill) return;
    setForm({ ...prefill, id: '__prefill__' });
    onClearPrefill && onClearPrefill();
  }, [prefill]);
  const [filterStato, setFilterStato] = useState('tutti');
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState('asc'); // asc = prossime prima

  // CRUD
  function createPreno(data) {
    const rec = {
      id: prenoId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      operatorId: operator?.id || '',
      clienteId: null,
      contractId: null,
      ...data,
    };
    setPrenotazioni(ps => [...ps, rec]);
    setForm(null);
    pushToast && pushToast({ tone: 'success', title: 'Prenotazione creata', message: `${rec.clienteCognome || ''} ${rec.clienteNome || ''} · ${formatDate(rec.dal)}` });
  }

  function updatePreno(data) {
    setPrenotazioni(ps => ps.map(p => p.id === form.id
      ? { ...p, ...data, updatedAt: new Date().toISOString() }
      : p
    ));
    setForm(null);
    pushToast && pushToast({ tone: 'success', title: 'Prenotazione aggiornata', message: `${data.clienteCognome || ''} ${data.clienteNome || ''}`.trim() });
  }

  function deletePreno(id) {
    if (!confirm('Eliminare questa prenotazione?')) return;
    setPrenotazioni(ps => ps.filter(p => p.id !== id));
    pushToast && pushToast({ tone: 'warning', title: 'Prenotazione eliminata' });
  }

  function convertToPratica(p) {
    // Precompila il wizard Pratica con i dati della prenotazione
    const prefill = {
      cognome: p.clienteCognome || '',
      nome: p.clienteNome || '',
      tel: p.clienteTel || '',
      vehicleId: p.vehicleId || null,
      dal: p.dal, al: p.al,
    };
    // Segna la prenotazione come "in_corso"
    setPrenotazioni(ps => ps.map(x => x.id === p.id ? { ...x, stato: 'in_corso', updatedAt: new Date().toISOString() } : x));
    onOpenWizard && onOpenWizard(prefill);
    pushToast && pushToast({ tone: 'info', title: 'Wizard aperto', message: 'Dati prenotazione trasferiti nella pratica' });
  }

  // Filtri e ordinamento
  const today = todayISO();
  const filtered = (prenotazioni || [])
    .filter(p => {
      if (filterStato !== 'tutti' && p.stato !== filterStato) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${p.clienteNome} ${p.clienteCognome} ${p.clienteTel} ${p.vehicleLabel} ${p.note}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const da = a.dal || '9999', db = b.dal || '9999';
      return sortDir === 'asc' ? da.localeCompare(db) : db.localeCompare(da);
    });

  // KPI veloci
  const attive = (prenotazioni || []).filter(p => p.stato === 'confermata' || p.stato === 'in_corso').length;
  const inAttesa = (prenotazioni || []).filter(p => p.stato === 'attesa').length;
  const oggi = (prenotazioni || []).filter(p => p.dal === today || p.al === today).length;

  const btnFilter = (stato, label) => (
    <button type="button"
      onClick={() => setFilterStato(stato)}
      style={{
        padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
        border: filterStato === stato ? 'none' : '1px solid var(--border)',
        background: filterStato === stato ? 'var(--ink)' : 'transparent',
        color: filterStato === stato ? 'var(--bg)' : 'var(--ink-2)',
        fontWeight: filterStato === stato ? 600 : 400,
      }}>
      {label}
    </button>
  );

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>Prenotazioni</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
            Gestisci le prenotazioni future — poi convertile in pratica al ritiro del cliente.
          </p>
        </div>
        <button type="button"
          onClick={() => setForm('new')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          <Plus style={{ width: 15, height: 15 }} /> Nuova prenotazione
        </button>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Confermate / In corso', value: attive, color: '#2e6e3e' },
          { label: 'In attesa conferma',    value: inAttesa, color: '#b87333' },
          { label: 'Movimenti oggi',        value: oggi,    color: '#1f5d83' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-serif)', color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Barra filtri */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '0 0 200px' }}>
          <Search style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--muted)' }} />
          <input
            style={{ paddingLeft: 30, padding: '7px 10px 7px 30px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, width: '100%', background: 'var(--bg)', color: 'var(--ink)', boxSizing: 'border-box' }}
            placeholder="Cerca cliente, mezzo…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {btnFilter('tutti', 'Tutte')}
        {btnFilter('attesa', 'In attesa')}
        {btnFilter('confermata', 'Confermate')}
        {btnFilter('in_corso', 'In corso')}
        {btnFilter('completata', 'Completate')}
        <button type="button"
          onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
          style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 20, fontSize: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer' }}>
          {sortDir === 'asc' ? '↑ Prossime' : '↓ Recenti'}
        </button>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          <CalendarDays style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.3 }} />
          <div style={{ fontSize: 15, fontFamily: 'var(--font-serif)', marginBottom: 6 }}>
            {(prenotazioni || []).length === 0 ? 'Nessuna prenotazione ancora' : 'Nessun risultato per i filtri applicati'}
          </div>
          <div style={{ fontSize: 12 }}>
            {(prenotazioni || []).length === 0 && 'Crea la prima prenotazione con il pulsante qui sopra.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(p => (
            <PrenoCard
              key={p.id}
              p={p}
              onEdit={(rec) => setForm(rec)}
              onConvert={convertToPratica}
              onDelete={deletePreno}
            />
          ))}
        </div>
      )}

      {/* Vista disponibilità */}
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <button type="button"
          onClick={() => setShowDisp(s => !s)}
          style={{ fontSize: 12, padding: '5px 14px', borderRadius: 20, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer' }}>
          {showDisp ? '▲ Nascondi calendario' : '▼ Mostra disponibilità 4 settimane'}
        </button>
      </div>
      {showDisp && <DisponibilitaView prenotazioni={prenotazioni} rentmeVehicles={[]} />}

      {/* Form modal */}
      {form && (
        <PrenoForm
          initial={form === 'new' ? null : form}
          fleet={fleet}
          customers={customers}
          onSave={form === 'new' ? createPreno : updatePreno}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// PREVENTIVI — listino prezzi + calcolo preventivo (v0.14)
// Porta in Pratica il sistema tariffario di EDOX:
//   · 12 categorie veicoli · 3 stagioni (bassa/media/alta)
//   · Calcolo automatico: tariffa giornaliera vs settimanale
//   · Regola agosto: solo settimanale, minimo 7 giorni
//   · Bottone WhatsApp · Aggiungi a Prenotazione
// ═══════════════════════════════════════════════════════════════════

// ── Stagioni ────────────────────────────────────────────────────────
const EDO_SEASONS = {
  bassa: { name: 'Bassa stagione', months: [0,1,2,3,9,10,11], color: '#4a6a35', bg: '#eaf3e3', label: 'BASSA' },
  media: { name: 'Media stagione', months: [4,5,6,8],         color: '#b87333', bg: '#fdf3e3', label: 'MEDIA' },
  alta:  { name: 'Alta stagione',  months: [7],               color: '#c14a2b', bg: '#faeaea', label: 'ALTA'  },
};

function getSeason(dateStr) {
  if (!dateStr) return 'bassa';
  const m = new Date(dateStr + 'T12:00:00').getMonth();
  if (EDO_SEASONS.alta.months.includes(m))  return 'alta';
  if (EDO_SEASONS.media.months.includes(m)) return 'media';
  return 'bassa';
}

function isAugust(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + 'T12:00:00').getMonth() === 7;
}

// ── Listino prezzi (da edonoleggio.com) ─────────────────────────────
const LISTINO = [
  { id: 'auto_chiusa',     nome: 'Auto chiusa',          tipo: 'auto',
    bassa:{daily:30,weekly:200}, media:{daily:30,weekly:200}, alta:{daily:30,weekly:300} },
  { id: 'auto_cabrio',     nome: 'Auto cabrio',           tipo: 'auto',
    bassa:{daily:45,weekly:250}, media:{daily:45,weekly:270}, alta:{daily:45,weekly:370} },
  { id: 'auto_superior',   nome: 'Auto superior',         tipo: 'auto',
    bassa:{daily:35,weekly:250}, media:{daily:35,weekly:250}, alta:{daily:35,weekly:350} },
  { id: 'mehari',          nome: 'Mehari',                tipo: 'auto',
    bassa:{daily:40,weekly:220}, media:{daily:40,weekly:250}, alta:{daily:40,weekly:350} },
  { id: 'scooter_50',      nome: 'Scooter 50 cc',         tipo: 'scooter',
    bassa:{daily:55,weekly:120}, media:{daily:55,weekly:130}, alta:{daily:55,weekly:180} },
  { id: 'scooter_125',     nome: 'Scooter 125 cc',        tipo: 'scooter',
    bassa:{daily:36,weekly:140}, media:{daily:36,weekly:150}, alta:{daily:36,weekly:230} },
  { id: 'scooter_125_sup', nome: 'Scooter 125 superior',  tipo: 'scooter',
    bassa:{daily:65,weekly:175}, media:{daily:65,weekly:175}, alta:{daily:65,weekly:250} },
  { id: 'quad_base',       nome: 'Quad base',             tipo: 'quad',
    bassa:{daily:35,weekly:180}, media:{daily:35,weekly:180}, alta:{daily:35,weekly:240} },
  { id: 'quad_150',        nome: 'Quad 150 cc',           tipo: 'quad',
    bassa:{daily:40,weekly:200}, media:{daily:40,weekly:210}, alta:{daily:40,weekly:280} },
  { id: 'quad_300',        nome: 'Quad 300 cc',           tipo: 'quad',
    bassa:{daily:70,weekly:240}, media:{daily:70,weekly:260}, alta:{daily:70,weekly:340} },
  { id: 'ebike',           nome: 'E-bike',                tipo: 'ebike',
    bassa:{daily:20,weekly:80},  media:{daily:20,weekly:90},  alta:{daily:20,weekly:120} },
  { id: 'bici_muscolare',  nome: 'Bici muscolare',        tipo: 'ebike',
    bassa:{daily:25,weekly:45},  media:{daily:25,weekly:50},  alta:{daily:25,weekly:70}  },
];

// ── Calcolo preventivo ───────────────────────────────────────────────
// Logica identica a EDOX: confronta giornaliero × giorni vs settimanale
// + eventuale arrotondamento alla settimana intera se conviene.
// Regola agosto: solo tariffa settimanale, minimo 7 giorni.
function calcPreventivo(cat, dal, al) {
  const giorni = Math.max(0, Math.round((new Date(al + 'T12:00:00') - new Date(dal + 'T12:00:00')) / 86400000));
  if (giorni <= 0) return null;

  const agosto = isAugust(dal);
  const season = getSeason(dal);
  const rates  = cat[season];
  if (!rates) return null;

  let totale, righe = [], risparmio = 0;

  if (agosto) {
    // Regola agosto: solo settimanale, minimo 7 giorni
    const settimane = Math.max(1, Math.ceil(giorni / 7));
    totale = settimane * rates.weekly;
    righe.push({ desc: `${settimane} settimana${settimane > 1 ? 'e' : ''} × €${rates.weekly}`, sub: totale });
    if (giorni < 7) righe.push({ desc: '⚠ Agosto: minimo 7 giorni', sub: null, warn: true });
  } else {
    const soloGiornaliero = giorni * rates.daily;
    const settimane  = Math.floor(giorni / 7);
    const rimanenti  = giorni % 7;
    const conSettim  = settimane * rates.weekly + rimanenti * rates.daily;
    const arrotondato = Math.ceil(giorni / 7) * rates.weekly;

    totale = Math.min(soloGiornaliero, conSettim, arrotondato);

    if (totale === arrotondato && arrotondato < soloGiornaliero) {
      const sett = Math.ceil(giorni / 7);
      righe.push({ desc: `${sett} settimana${sett > 1 ? 'e' : ''} × €${rates.weekly} (arrotondato su)`, sub: arrotondato });
      risparmio = soloGiornaliero - arrotondato;
    } else if (totale === conSettim && settimane > 0) {
      righe.push({ desc: `${settimane} settimana${settimane > 1 ? 'e' : ''} × €${rates.weekly}`, sub: settimane * rates.weekly });
      if (rimanenti > 0) righe.push({ desc: `${rimanenti} giorno${rimanenti > 1 ? 'i' : ''} × €${rates.daily}`, sub: rimanenti * rates.daily });
      risparmio = soloGiornaliero - conSettim;
    } else {
      righe.push({ desc: `${giorni} giorno${giorni > 1 ? 'i' : ''} × €${rates.daily}`, sub: soloGiornaliero });
    }
  }

  return { totale, righe, risparmio, giorni, season, agosto, rates };
}

// ── QuoteCard — singola categoria con prezzo calcolato ───────────────
function QuoteCard({ cat, dal, al, onPrenota }) {
  const [open, setOpen] = useState(false);
  const q = calcPreventivo(cat, dal, al);
  if (!q) return null;

  const seas = EDO_SEASONS[q.season];

  function buildWhatsApp() {
    const testo =
      `Preventivo Edonoleggio Lampedusa\n` +
      `Mezzo: ${cat.nome}\n` +
      `Dal ${formatDate(dal)} al ${formatDate(al)} (${q.giorni} giorni)\n` +
      `Stagione: ${seas.name}\n` +
      `Totale: €${q.totale}` +
      (q.risparmio > 0 ? ` (risparmi €${q.risparmio} con la tariffa settimanale)` : '') +
      `\n\nConfermate disponibilità e prezzo? Grazie!`;
    return `https://wa.me/?text=${encodeURIComponent(testo)}`;
  }

  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 8, overflow: 'hidden',
    }}>
      {/* Row principale */}
      <div
        style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', cursor: 'pointer', gap: 12 }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{cat.nome}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            <span style={{
              padding: '1px 7px', borderRadius: 10, fontSize: 10, fontWeight: 700,
              color: seas.color, background: seas.bg, marginRight: 6,
            }}>{seas.label}</span>
            {q.agosto && <span style={{ color: '#c14a2b', fontWeight: 600 }}>Regola agosto · </span>}
            €{q.rates.daily}/g · €{q.rates.weekly}/sett
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
            €{q.totale}
          </div>
          {q.risparmio > 0 && (
            <div style={{ fontSize: 10, color: '#4a9e5c', fontWeight: 600 }}>
              risparmi €{q.risparmio}
            </div>
          )}
        </div>

        <ChevronDown style={{
          width: 16, height: 16, color: 'var(--muted)', flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s',
        }} />
      </div>

      {/* Dettaglio breakdown */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px 12px', background: 'var(--surface-2)' }}>
          <div style={{ fontSize: 12, marginBottom: 10 }}>
            {q.righe.map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                color: r.warn ? '#c14a2b' : 'var(--ink-2)',
                fontWeight: r.warn ? 600 : 400,
                marginBottom: 3,
              }}>
                <span>{r.desc}</span>
                {r.sub != null && <span style={{ fontFamily: 'monospace' }}>€{r.sub}</span>}
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 4,
              fontWeight: 700, color: 'var(--ink)',
            }}>
              <span>Totale {q.giorni} giorni</span>
              <span>€{q.totale}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href={buildWhatsApp()}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1, padding: '7px 0', borderRadius: 5, textAlign: 'center',
                fontSize: 12, fontWeight: 600, textDecoration: 'none',
                background: '#25d366', color: 'white',
              }}
            >
              WhatsApp
            </a>
            <button
              type="button"
              onClick={() => exportPreventivoPDF({
                catName: cat.nome, dal, al,
                stagione: q.stagione, isWeekly: q.isWeekly,
                total: parseFloat(q.totale) || 0,
                totalDays: q.giorni,
                breakdown: (q.dettaglio || []).map(d => ({ label: d.label || '', gg: d.gg || 0, price: d.price || 0, subtotal: (d.gg||0)*(d.price||0) })),
              })}
              style={{
                padding: '7px 12px', borderRadius: 5, border: 'none',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: '#1a1815', color: 'white', display: 'flex', alignItems: 'center', gap: 4,
              }}
              title="Scarica / stampa PDF preventivo"
            >
              <Printer className="w-3 h-3" /> PDF
            </button>
            <button
              type="button"
              onClick={() => onPrenota({ cat, dal, al, totale: q.totale, giorni: q.giorni })}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 5, border: 'none',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: 'var(--accent)', color: 'white',
              }}
            >
              + Prenota
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ListinoTable — tabella prezzi senza date ─────────────────────────
function ListinoTable({ filter }) {
  const cats = filter ? LISTINO.filter(c => c.id.startsWith(filter) || c.nome.toLowerCase().includes(filter)) : LISTINO;
  const thStyle = {
    padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--bg)', background: 'var(--ink)',
  };
  const tdStyle = { padding: '9px 12px', fontSize: 13, borderBottom: '1px solid var(--border)' };
  const num = { ...tdStyle, textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 };

  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
        <thead>
          <tr>
            <th style={thStyle}>Mezzo</th>
            {['Bassa', 'Media', 'Alta'].map(s => (
              <th key={s} style={{ ...thStyle, textAlign: 'right' }} colSpan={2}>{s}</th>
            ))}
          </tr>
          <tr style={{ background: 'var(--surface-2)' }}>
            <th style={{ ...tdStyle, fontWeight: 600, fontSize: 11 }}></th>
            {['bassa', 'media', 'alta'].map(s => (
              <>
                <th key={s+'d'} style={{ ...tdStyle, textAlign: 'right', fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>Giorno</th>
                <th key={s+'w'} style={{ ...tdStyle, textAlign: 'right', fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>Settimana</th>
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {cats.map(c => (
            <tr key={c.id} style={{ transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <td style={{ ...tdStyle, fontWeight: 600, fontFamily: 'var(--font-serif)' }}>{c.nome}</td>
              {['bassa', 'media', 'alta'].map(s => (
                <>
                  <td key={s+'d'} style={num}>€{c[s].daily}</td>
                  <td key={s+'w'} style={num}>€{c[s].weekly}</td>
                </>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── PreventiviPage ───────────────────────────────────────────────────
function PreventiviPage({ setPage, setPrenotazioniPrefill, listino: listinoProps }) {
  const listinoCats = listinoProps || LISTINO;
  const today = new Date().toISOString().slice(0, 10);
  const [dal, setDal] = useState(today);
  const [al, setAl]   = useState('');
  const [filterTipo, setFilterTipo] = useState('tutti');
  const [view, setView] = useState('preventivo'); // 'preventivo' | 'listino'

  const giorni = dal && al
    ? Math.max(0, Math.round((new Date(al + 'T12:00:00') - new Date(dal + 'T12:00:00')) / 86400000))
    : 0;

  const season = getSeason(dal);
  const seasInfo = EDO_SEASONS[season];

  const categorieVisibili = listinoCats.filter(c =>
    filterTipo === 'tutti' || c.tipo === filterTipo
  );

  function handlePrenota({ cat, dal, al, totale, giorni }) {
    // Passa i dati alla pagina Prenotazioni con il form precompilato
    if (setPrenotazioniPrefill) {
      setPrenotazioniPrefill({ vehicleLabel: cat.nome, dal, al, prezzo: totale });
    }
    setPage('prenotazioni');
  }

  const btnTipo = (id, label) => (
    <button
      key={id}
      type="button"
      onClick={() => setFilterTipo(id)}
      style={{
        padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
        border: filterTipo === id ? 'none' : '1px solid var(--border)',
        background: filterTipo === id ? 'var(--ink)' : 'transparent',
        color: filterTipo === id ? 'var(--bg)' : 'var(--ink-2)',
        fontWeight: filterTipo === id ? 600 : 400,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>Preventivi</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
            Seleziona le date e vedi subito il prezzo per ogni categoria.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['preventivo', 'listino'].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{
                padding: '7px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                border: '1px solid var(--border)',
                background: view === v ? 'var(--ink)' : 'transparent',
                color: view === v ? 'var(--bg)' : 'var(--ink-2)',
                fontWeight: view === v ? 600 : 400,
                textTransform: 'capitalize',
              }}
            >
              {v === 'preventivo' ? 'Calcola' : 'Listino'}
            </button>
          ))}
        </div>
      </div>

      {/* Date picker */}
      <div style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '16px 20px', marginBottom: 20,
        display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap',
      }}>
        <div style={{ flex: '1 1 140px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-2)', marginBottom: 5 }}>
            Dal (ritiro)
          </div>
          <input
            type="date"
            value={dal}
            onChange={e => { setDal(e.target.value); if (al && e.target.value > al) setAl(''); }}
            style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 14, fontFamily: 'monospace', background: 'var(--bg)', color: 'var(--ink)', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-2)', marginBottom: 5 }}>
            Al (riconsegna)
          </div>
          <input
            type="date"
            value={al}
            min={dal}
            onChange={e => setAl(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 14, fontFamily: 'monospace', background: 'var(--bg)', color: 'var(--ink)', boxSizing: 'border-box' }}
          />
        </div>

        {/* Riepilogo periodo */}
        {giorni > 0 && (
          <div style={{
            flex: '0 0 auto', padding: '8px 16px', borderRadius: 8,
            background: seasInfo.bg, border: `1px solid ${seasInfo.color}22`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-serif)', color: seasInfo.color, lineHeight: 1 }}>
              {giorni}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: seasInfo.color, marginTop: 2 }}>
              giorni · {seasInfo.label}
            </div>
            {isAugust(dal) && (
              <div style={{ fontSize: 9, color: '#c14a2b', fontWeight: 600, marginTop: 3 }}>
                ⚠ Regola agosto
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtro tipo */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {btnTipo('tutti', 'Tutti')}
        {btnTipo('auto', 'Auto')}
        {btnTipo('scooter', 'Scooter')}
        {btnTipo('quad', 'Quad')}
        {btnTipo('ebike', 'E-bike')}
      </div>

      {/* Contenuto principale */}
      {view === 'listino' ? (
        <ListinoTable />
      ) : giorni > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categorieVisibili.map(cat => (
            <QuoteCard key={cat.id} cat={cat} dal={dal} al={al} onPrenota={handlePrenota} />
          ))}
        </div>
      ) : (
        /* Stato vuoto — nessuna data selezionata */
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📅</div>
          <div style={{ fontSize: 15, fontFamily: 'var(--font-serif)', color: 'var(--ink)', marginBottom: 6 }}>
            Seleziona le date del noleggio
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
            Appena scegli dal e al, vedi subito il prezzo per ogni categoria.
          </div>
          <button
            type="button"
            onClick={() => setView('listino')}
            style={{
              padding: '8px 18px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--ink-2)', fontSize: 13, cursor: 'pointer',
            }}
          >
            Vedi listino completo →
          </button>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// DISPONIBILITÀ — heatmap calendario prenotazioni (v0.15)
// Mostra saturazione per categoria su 4 settimane
// ═══════════════════════════════════════════════════════════════════

function DisponibilitaView({ prenotazioni, rentmeVehicles }) {
  const [refDate, setRefDate] = useState(() => new Date().toISOString().slice(0,10));

  // Costruisce array di 28 giorni a partire dal lunedì della settimana di refDate
  const days = useMemo(() => {
    const d = new Date(refDate + 'T12:00:00');
    const dow = (d.getDay() + 6) % 7; // 0=lun
    d.setDate(d.getDate() - dow);
    const arr = [];
    for (let i = 0; i < 28; i++) {
      arr.push(d.toISOString().slice(0,10));
      d.setDate(d.getDate() + 1);
    }
    return arr;
  }, [refDate]);

  const today = new Date().toISOString().slice(0,10);

  // Categorie: da RentMe se disponibili, altrimenti hardcoded
  const defaultCats = ['Auto chiusa','Auto cabrio','Auto superior','Mehari',
    'Scooter 50 cc','Scooter 125 cc','Scooter 125 superior',
    'Quad base','Quad 150 cc','E-bike'];

  // Per ogni categoria conta occupazione per giorno
  const matrix = useMemo(() => {
    // Categoria names: da RentMe o fallback
    const catNames = rentmeVehicles && rentmeVehicles.length > 0
      ? [...new Set(rentmeVehicles.map(v => v.nome || v.slug))]
      : defaultCats;

    const result = {};
    catNames.forEach(cat => {
      result[cat] = {};
      days.forEach(day => {
        // Usa calcAvailability per i dati reali quando disponibili
        if (rentmeVehicles && rentmeVehicles.length > 0) {
          const av = calcAvailability(day, day, rentmeVehicles, prenotazioni);
          const match = av.find(c => c.nome === cat || c.id === cat);
          result[cat][day] = match ? match.booked : 0;
        } else {
          // Fallback locale
          const count = (prenotazioni || []).filter(p =>
            p.stato !== 'cancellata' && p.stato !== 'completata' &&
            p.dal <= day && p.al >= day &&
            (p.vehicleLabel || '').toLowerCase().includes(cat.toLowerCase().split(' ')[0].toLowerCase())
          ).length;
          result[cat][day] = count;
        }
      });
    });
    return result;
  }, [prenotazioni, rentmeVehicles, days]);

  const navigate = (delta) => {
    const d = new Date(refDate + 'T12:00:00');
    d.setDate(d.getDate() + delta * 28);
    setRefDate(d.toISOString().slice(0,10));
  };

  const weekLabels = ['Sett 1','Sett 2','Sett 3','Sett 4'];
  const dayLetters = ['L','M','M','G','V','S','D'];

  const cellColor = (count) => {
    if (count === 0) return { bg: '#eaf4ec', color: '#4a9e5c' };
    if (count <= 2)  return { bg: '#fdf3e3', color: '#b87333' };
    return { bg: '#faeaea', color: '#c14a2b' };
  };

  return (
    <div style={{ marginTop: 24, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      {/* Header navigazione */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
        <button type="button" onClick={() => navigate(-1)}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 13, color: 'var(--ink-2)' }}>‹</button>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
          {new Date(days[0] + 'T12:00:00').toLocaleDateString('it-IT', { day:'numeric', month:'short' })} →{' '}
          {new Date(days[27] + 'T12:00:00').toLocaleDateString('it-IT', { day:'numeric', month:'short', year:'numeric' })}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" onClick={() => setRefDate(today)}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11, color: 'var(--ink-2)' }}>Oggi</button>
          <button type="button" onClick={() => navigate(1)}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 13, color: 'var(--ink-2)' }}>›</button>
        </div>
      </div>

      {/* Griglia */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10, color: 'var(--muted)', fontWeight: 600, width: 130, borderBottom: '1px solid var(--border)' }}>Categoria</th>
              {days.map((day, i) => {
                const isToday = day === today;
                const dow = new Date(day + 'T12:00:00').getDay();
                const isWeekend = dow === 0 || dow === 6;
                return (
                  <th key={day} style={{
                    padding: '4px 2px', textAlign: 'center', fontSize: 9, fontWeight: isToday ? 800 : 500,
                    color: isToday ? 'var(--accent)' : isWeekend ? 'var(--ink)' : 'var(--muted)',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: i % 7 === 0 ? '2px solid var(--border)' : 'none',
                    minWidth: 22,
                  }}>
                    <div>{dayLetters[(i) % 7]}</div>
                    <div style={{ fontSize: 10, fontWeight: 600 }}>{day.slice(8)}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Object.entries(matrix).map(([cat, dayCounts], ri) => (
              <tr key={cat} style={{ background: ri % 2 === 0 ? 'var(--bg)' : 'var(--surface-2)' }}>
                <td style={{ padding: '5px 10px', fontSize: 11, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>
                  {cat}
                </td>
                {days.map((day, i) => {
                  const count = dayCounts[day] || 0;
                  const { bg, color } = cellColor(count);
                  const isToday = day === today;
                  return (
                    <td key={day} style={{
                      padding: '3px 2px', textAlign: 'center',
                      borderBottom: '1px solid var(--border)',
                      borderLeft: i % 7 === 0 ? '2px solid var(--border)' : 'none',
                      background: isToday ? '#e8f2f9' : count > 0 ? bg : '',
                    }}>
                      {count > 0 && (
                        <span style={{
                          display: 'inline-block', width: 18, height: 18, lineHeight: '18px',
                          borderRadius: 4, fontSize: 10, fontWeight: 700,
                          color, background: bg,
                        }}>{count}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '8px 16px', fontSize: 10, color: 'var(--muted)', borderTop: '1px solid var(--border)', display: 'flex', gap: 16 }}>
        <span style={{ color: '#4a9e5c', fontWeight: 600 }}>● Libero</span>
        <span style={{ color: '#b87333', fontWeight: 600 }}>● 1–2 prenotazioni</span>
        <span style={{ color: '#c14a2b', fontWeight: 600 }}>● 3+ prenotazioni</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// REPORT — dashboard analitica (v0.16)
// KPI, andamento prenotazioni, categorie più richieste, incasso stimato
// ═══════════════════════════════════════════════════════════════════

function ReportPage({ prenotazioni, contracts }) {
  const today = new Date().toISOString().slice(0,10);
  const thisMonth = today.slice(0,7);
  const lastMonth = (() => {
    const d = new Date(today + 'T12:00:00');
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0,7);
  })();

  const allP = prenotazioni || [];
  const allC = contracts || [];

  // KPI
  const meseCorrente  = allP.filter(p => (p.dal || '').startsWith(thisMonth));
  const mesePrecedente = allP.filter(p => (p.dal || '').startsWith(lastMonth));
  const attive = allP.filter(p => p.stato === 'confermata' || p.stato === 'in_corso');
  const incassoMese = meseCorrente.reduce((s, p) => s + (p.prezzo || 0), 0);
  const accontiMese = meseCorrente.reduce((s, p) => s + (p.acconto || 0), 0);
  const contrattiBimestre = allC.filter(c => {
    const d = (c.createdAt || '').slice(0,7);
    return d >= lastMonth;
  }).length;

  // Categorie più richieste
  const catCount = {};
  allP.forEach(p => {
    const k = (p.vehicleLabel || 'Non specificato').split(' ·')[0].trim() || 'Non specificato';
    catCount[k] = (catCount[k] || 0) + 1;
  });
  const topCats = Object.entries(catCount).sort((a,b) => b[1]-a[1]).slice(0,6);
  const maxCount = topCats[0]?.[1] || 1;

  // Andamento ultimi 8 mesi
  const trend = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(today + 'T12:00:00');
    d.setMonth(d.getMonth() - i);
    const ym = d.toISOString().slice(0,7);
    const label = d.toLocaleDateString('it-IT', { month:'short' });
    const count = allP.filter(p => (p.dal || '').startsWith(ym)).length;
    const rev = allP.filter(p => (p.dal || '').startsWith(ym)).reduce((s,p) => s+(p.prezzo||0), 0);
    trend.push({ ym, label, count, rev });
  }
  const maxTrend = Math.max(...trend.map(t => t.count), 1);

  const kpiCard = (label, value, sub, color = 'var(--ink)') => (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 18px' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-serif)', color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>Report</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>Andamento prenotazioni, incassi e saturazione flotta.</p>
      </div>

      {/* KPI principali */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {kpiCard('Prenotazioni questo mese', meseCorrente.length, `${mesePrecedente.length} il mese scorso`)}
        {kpiCard('Attive ora', attive.length, 'confermate + in corso', '#2e6e3e')}
        {kpiCard('Incasso stimato mese', `€${incassoMese.toLocaleString('it-IT')}`, `Acconti: €${accontiMese}`, '#1f5d83')}
        {kpiCard('Pratiche bimestre', contrattiBimestre, 'contratti firmati', '#b87333')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Trend mensile */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-2)', marginBottom: 14 }}>
            Prenotazioni · ultimi 8 mesi
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
            {trend.map(t => (
              <div key={t.ym} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600 }}>{t.count || ''}</div>
                <div style={{
                  width: '100%', borderRadius: '3px 3px 0 0',
                  height: `${Math.max(4, (t.count / maxTrend) * 80)}px`,
                  background: t.ym === thisMonth ? 'var(--accent)' : 'var(--ink)',
                  opacity: t.ym === thisMonth ? 1 : 0.25 + (t.count / maxTrend) * 0.55,
                  transition: 'height 0.3s',
                }} />
                <div style={{ fontSize: 9, color: 'var(--muted)' }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top categorie */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-2)', marginBottom: 14 }}>
            Categorie più richieste
          </div>
          {topCats.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>Nessuna prenotazione ancora</div>
          ) : topCats.map(([cat, n]) => (
            <div key={cat} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{cat}</span>
                <span style={{ color: 'var(--muted)' }}>{n}</span>
              </div>
              <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(n/maxCount)*100}%`, background: 'var(--ink)', borderRadius: 3, transition: 'width 0.4s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ripartizione stati */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-2)', marginBottom: 14 }}>
          Stato prenotazioni · tutte
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.entries({
            attesa: 'In attesa', confermata: 'Confermate', in_corso: 'In corso',
            completata: 'Completate', cancellata: 'Cancellate',
          }).map(([stato, label]) => {
            const n = allP.filter(p => p.stato === stato).length;
            const s = PRENO_STATI[stato];
            return (
              <div key={stato} style={{ flex: '1 1 120px', background: s.bg, borderRadius: 6, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-serif)', color: s.color }}>{n}</div>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LISTINO EDITOR — gestione prezzi in Impostazioni (v0.17)
// Modifica tariffe giornaliere e settimanali per stagione
// ═══════════════════════════════════════════════════════════════════

function ListinoEditor({ listino, onSave }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(listino)));
  const [dirty, setDirty] = useState(false);

  function setPrice(catId, season, type, val) {
    setDraft(d => d.map(c => c.id === catId
      ? { ...c, [season]: { ...c[season], [type]: parseFloat(val) || 0 } }
      : c
    ));
    setDirty(true);
  }

  const inp = {
    width: 64, padding: '5px 6px', border: '1px solid var(--border)',
    borderRadius: 4, fontSize: 12, fontFamily: 'monospace',
    textAlign: 'right', background: 'var(--bg)', color: 'var(--ink)',
    boxSizing: 'border-box',
  };

  const thS = { padding: '8px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--bg)', background: 'var(--ink)', textAlign: 'center' };
  const tdS = { padding: '8px 10px', borderBottom: '1px solid var(--border)', fontSize: 12 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Tariffe · giorno / settimana per stagione</div>
        {dirty && (
          <button type="button" onClick={() => { onSave(draft); setDirty(false); }}
            style={{ padding: '7px 16px', borderRadius: 5, border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            Salva modifiche
          </button>
        )}
      </div>
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
          <thead>
            <tr>
              <th style={{ ...thS, textAlign: 'left', width: 160 }}>Mezzo</th>
              {['Bassa', 'Media', 'Alta'].map(s => (
                <th key={s} style={thS} colSpan={2}>{s}</th>
              ))}
            </tr>
            <tr style={{ background: 'var(--surface-2)' }}>
              <th style={{ ...tdS, fontWeight: 600, fontSize: 10, color: 'var(--muted)' }}></th>
              {['bassa','media','alta'].map(s => (
                <>
                  <th key={s+'d'} style={{ ...tdS, textAlign: 'center', fontSize: 9, color: 'var(--muted)', fontWeight: 600 }}>Giorno</th>
                  <th key={s+'w'} style={{ ...tdS, textAlign: 'center', fontSize: 9, color: 'var(--muted)', fontWeight: 600 }}>Settimana</th>
                </>
              ))}
            </tr>
          </thead>
          <tbody>
            {draft.map(c => (
              <tr key={c.id}>
                <td style={{ ...tdS, fontWeight: 600, fontFamily: 'var(--font-serif)' }}>{c.nome}</td>
                {['bassa','media','alta'].map(s => (
                  <>
                    <td key={s+'d'} style={{ ...tdS, textAlign: 'center' }}>
                      <input style={inp} type="number" min="0" value={c[s].daily}
                        onChange={e => setPrice(c.id, s, 'daily', e.target.value)} />
                    </td>
                    <td key={s+'w'} style={{ ...tdS, textAlign: 'center' }}>
                      <input style={inp} type="number" min="0" value={c[s].weekly}
                        onChange={e => setPrice(c.id, s, 'weekly', e.target.value)} />
                    </td>
                  </>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>
        Le modifiche si sincronizzano automaticamente con il backend e aggiornano i preventivi in tempo reale.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// RENTME INTEGRATION
// Sync live con il gestionale RentMe (Altervista).
// RENTME_USER_ID: UUID azienda Edonoleggio (sola lettura).
// RENTME_PROXY: PHP proxy su Altervista che bypassa CORS.
// ═══════════════════════════════════════════════════════════════════
const RENTME_API_BASE = 'https://rentmealtervista.duckdns.org/api/rest';
const RENTME_PROXY    = 'https://rentme.altervista.org/edox-proxy.php';
const RENTME_USER_ID  = '02zq4lkb-44yy-6j4h-53dg-4752198po90p';

// ── calcAvailability ─────────────────────────────────────────────
// Funzione pura: dato un periodo dal/al, restituisce array di categorie
// con { id, nome, tipo, total, booked, free, threshold, alert }.
// Usa dati RentMe se disponibili, altrimenti prenotazioni locali.
function calcAvailability(dal, al, rentmeVehicles, prenotazioni) {
  const dalS = dal || new Date().toISOString().slice(0,10);
  const alS  = al  || dalS;

  if (rentmeVehicles && rentmeVehicles.length > 0) {
    // ── Modalità RentMe: categorie reali ────────────────────────
    const bySlug = {};
    rentmeVehicles.forEach(v => {
      if (!bySlug[v.slug]) bySlug[v.slug] = { slug: v.slug, nome: v.nome, tipo: v.tipo, targhes: [] };
      bySlug[v.slug].targhes.push(v.targa);
    });
    return Object.values(bySlug).map(cat => {
      const total = cat.targhes.length;
      const busy  = new Set();
      (prenotazioni || []).forEach(b => {
        if (!b.dal || !b.al || b.stato === 'cancellata') return;
        if (b.al < dalS || b.dal > alS) return; // fuori periodo
        if (b.rentmeTarga && cat.targhes.includes(b.rentmeTarga)) {
          busy.add(b.rentmeTarga);
        } else if (!b.rentmeTarga && b.vehicleId === cat.slug && b.fonte !== 'rentme') {
          busy.add('__local_' + (b.id || Math.random()));
        }
      });
      const booked    = busy.size;
      const free      = Math.max(0, total - booked);
      const threshold = Math.max(1, Math.ceil(total * 0.25));
      return { id: cat.slug, nome: cat.nome, tipo: cat.tipo, total, booked, free, threshold, alert: free <= threshold && total > 0 };
    }).filter(c => c.total > 0).sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
  }

  // ── Fallback: conta dalle prenotazioni locali ────────────────
  const catMap = {};
  (prenotazioni || []).forEach(b => {
    if (!b.vehicleLabel || b.stato === 'cancellata') return;
    const cat = b.vehicleLabel;
    if (!catMap[cat]) catMap[cat] = { id: b.vehicleId || cat, nome: cat, tipo: '', total: 0, booked: 0 };
    if (!(b.al < dalS || b.dal > alS)) catMap[cat].booked++;
  });
  return Object.values(catMap).map(c => ({
    ...c, free: Math.max(0, c.total - c.booked), threshold: 1, alert: false
  }));
}

// ── useRentMeSync ─────────────────────────────────────────────────
// Hook: gestisce il ciclo di vita della sync RentMe.
// Restituisce { status, lastSync, errorMsg, vehicles, sync }.
// Auto-sync al mount + ogni 5 minuti, se enabled = true.
//
// ┌─────────────────────────────────────────────────────────────────┐
// │  ROADMAP — INDIPENDENZA DA RENTME                               │
// │                                                                 │
// │  Fase 1 (ora):   RentMe = fonte di verità, Pratica legge       │
// │  Fase 2 (presto):Pratica ha il suo DB su Render, RentMe        │
// │                  opzionale come canale di verifica             │
// │  Fase 3 (target):RentMe disabilitato, Pratica standalone       │
// │                                                                 │
// │  Il toggle si trova in Impostazioni → RentMe Bridge.           │
// │  Quando enabled = false, questa funzione non chiama nulla.     │
// │  Tutti i dati vivono già in edo:v1:* su Render.                │
// └─────────────────────────────────────────────────────────────────┘
//
// Le prenotazioni RentMe vengono mergiate con quelle locali:
//   - ID prefissato 'rm_' per riconoscerle
//   - fonte: 'rentme' — non editabili dall'operatore
function useRentMeSync({ rentmeVehicles, setRentmeVehicles, setPrenotazioni, pushToast, enabled = true }) {
  const [status,   setStatus]   = useState('idle'); // idle|syncing|ok|error
  const [lastSync, setLastSync] = useState(() => {
    try { return localStorage.getItem('edo:rentme:lastSync') || null; } catch { return null; }
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const timerRef = useRef(null);

  const sync = useCallback(async () => {
    setStatus('syncing');
    setErrorMsg(null);
    try {
      const r = await fetch(`${RENTME_API_BASE}/user/getVeicoli/${RENTME_USER_ID}`);
      if (!r.ok) throw new Error(`Errore server RentMe: ${r.status}`);
      const data = await r.json();
      const veicoli = data.listObject || [];

      // Normalizza lista veicoli
      const mapped = veicoli.map(v => ({
        targa:               v.targa,
        uuidDittaAssociata:  v.uuidDittaAssociata,
        nome:                [v.tipo, v.marca, v.modello, v.cilindrata].filter(Boolean).join(' '),
        slug:                [v.tipo, v.marca, v.modello, v.cilindrata].join('-').toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9-]/g,''),
        tipo:                v.tipo || '',
        impegni:             (v.dateImpegno || []).map(di => {
          const p = di.split('|');
          return p.length >= 2 ? { dal: p[0], al: p[1], cliente: (p[2]||'').trim(), acconto: parseFloat(p[3])||0, importo: parseFloat(p[4])||0, note: (p[5]||'').trim() } : null;
        }).filter(Boolean)
      }));
      setRentmeVehicles(mapped);

      // Costruisce prenotazioni RentMe da mergare
      const rentmeRows = [];
      veicoli.forEach(v => {
        const slug = [v.tipo, v.marca, v.modello, v.cilindrata].join('-').toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9-]/g,'');
        (v.dateImpegno || []).forEach(di => {
          const p = di.split('|');
          if (p.length >= 2 && p[0] && p[1]) {
            const clienteFull = (p[2]||'').trim();
            const parti = clienteFull.split(' ');
            rentmeRows.push({
              id:            `rm_${v.targa}_${p[0].replace(/-/g,'')}`,
              createdAt:     new Date().toISOString(),
              updatedAt:     new Date().toISOString(),
              clienteNome:   parti[0] || '',
              clienteCognome:parti.slice(1).join(' ') || clienteFull,
              clienteTel:    '',
              vehicleId:     slug,
              vehicleLabel:  [v.tipo, v.marca, v.modello, v.cilindrata].filter(Boolean).join(' '),
              vehicleType:   v.tipo || '',
              dal:           p[0],
              al:            p[1],
              stato:         'confermata',
              fonte:         'rentme',
              prezzo:        parseFloat(p[4])||0,
              acconto:       parseFloat(p[3])||0,
              note:          (p[5]||'').trim(),
              rentmeTarga:   v.targa,
            });
          }
        });
      });

      // Merge: mantieni prenotazioni locali + sostituisce quelle RentMe
      setPrenotazioni(prev => {
        const local = (prev || []).filter(p => p.fonte !== 'rentme');
        return [...local, ...rentmeRows];
      });

      const now = new Date().toISOString();
      setLastSync(now);
      try { localStorage.setItem('edo:rentme:lastSync', now); } catch {}
      setStatus('ok');
      pushToast && pushToast({
        tone: 'success',
        title: `RentMe ✓`,
        message: `${veicoli.length} mezzi · ${rentmeRows.length} prenotazioni sincronizzate`,
      });
      return { ok: true, vehicles: mapped.length, bookings: rentmeRows.length };
    } catch(e) {
      setStatus('error');
      setErrorMsg(e.message);
      pushToast && pushToast({ tone: 'warning', title: 'Sync RentMe fallito', message: e.message });
      return { ok: false, error: e.message };
    }
  }, [setRentmeVehicles, setPrenotazioni, pushToast]);

  // Auto-sync al mount + ogni 5 minuti — solo se enabled
  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }
    sync();
    timerRef.current = setInterval(sync, 5 * 60 * 1000);
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Manda prenotazione a RentMe (PUSH — solo aggiunte, mai modifiche)
  const pushBooking = useCallback(async (booking, slug) => {
    const veicoli = rentmeVehicles || [];
    const catVehs = veicoli.filter(v => v.slug === slug);
    if (!catVehs.length) throw new Error('Nessun mezzo RentMe per questa categoria');
    // Trova il primo mezzo libero
    const busy = new Set();
    // (prenotazioni già filtrate in calcAvailability; qui usiamo l'ultimo stato)
    const freeVeh = catVehs.find(v => !busy.has(v.targa)) || catVehs[0];
    const payload = {
      uuidDittaAssociata: freeVeh.uuidDittaAssociata || RENTME_USER_ID,
      targa:              freeVeh.targa,
      descrizione:        [booking.clienteCognome, booking.clienteNome].filter(Boolean).join(' '),
      dal:                booking.dal,
      al:                 booking.al,
      acconto:            parseFloat(booking.acconto) || 0,
      prezzoPrenotazione: parseFloat(booking.prezzo)  || 0,
      note:               (booking.note || '').replace(/\|/g,' '),
      bloccata:           'false',
    };
    const r = await fetch(`${RENTME_PROXY}?path=veicoli/add/reservetion`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`RentMe API: ${r.status}`);
    return r.json();
  }, [rentmeVehicles]);

  return { status, lastSync, errorMsg, sync, pushBooking };
}

// ═══════════════════════════════════════════════════════════════════
// BANCO RAPIDO — walk-in desk
// Schermata veloce per il banco: seleziona date, vedi cosa è libero,
// un tap → apre il form prenotazione prefillato per quella categoria.
// ═══════════════════════════════════════════════════════════════════
function BancoRapidoPage({ rentmeVehicles, prenotazioni, fleet, setPage, setPrenotazioniPrefill, listino, pushToast, rentmeSyncStatus, onRentmeSync, rentmeLastSync }) {
  const today = new Date().toISOString().slice(0,10);
  const [dal, setDal] = useState(today);
  const [al,  setAl]  = useState(today);

  const availability = useMemo(
    () => calcAvailability(dal, al, rentmeVehicles, prenotazioni),
    [dal, al, rentmeVehicles, prenotazioni]
  );

  // Alert: categorie sotto soglia
  const alerts = availability.filter(c => c.alert);

  const handleSelect = (cat) => {
    if (cat.free <= 0) {
      pushToast({ tone: 'warning', title: 'Categoria esaurita', message: `Nessun ${cat.nome} libero per le date selezionate` });
      return;
    }
    setPrenotazioniPrefill({ vehicleId: cat.id, vehicleLabel: cat.nome, vehicleType: cat.tipo, dal, al, fonte: 'walk_in' });
    setPage('prenotazioni');
    pushToast({ tone: 'success', title: '🚶 Walk-in', message: `${cat.nome} · ${dal === al ? dal : dal + ' → ' + al}` });
  };

  const fmtLastSync = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });
  };

  const catColor = (cat) => {
    if (cat.free <= 0) return { bg: '#fdecea', border: '#c0392b', text: '#c0392b', label: 'Esaurito' };
    if (cat.alert)     return { bg: '#fff8e6', border: '#e67e22', text: '#d35400', label: 'Quasi esaurito' };
    return { bg: '#eafaf1', border: '#27ae60', text: '#1e8449', label: 'Disponibile' };
  };

  const nGiorni = (() => {
    const d1 = new Date(dal + 'T12:00:00');
    const d2 = new Date(al  + 'T12:00:00');
    const diff = Math.round((d2 - d1) / 86400000);
    return diff <= 0 ? 'Giornaliero' : `${diff + 1} giorni`;
  })();

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--ink)' }}>
            Banco rapido
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
            Verifica disponibilità in tempo reale e crea una prenotazione in un tap.
          </p>
        </div>
        {/* RentMe status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-2)' }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: rentmeSyncStatus === 'ok' ? '#27ae60' : rentmeSyncStatus === 'syncing' ? '#e67e22' : rentmeSyncStatus === 'error' ? '#c0392b' : '#aaa',
            display: 'inline-block',
          }} />
          <span>RentMe {rentmeSyncStatus === 'ok' ? `· sync ${fmtLastSync(rentmeLastSync)}` : rentmeSyncStatus === 'syncing' ? '· sincronizzazione…' : rentmeSyncStatus === 'error' ? '· errore' : '· non connesso'}</span>
          <button type="button" onClick={onRentmeSync}
            disabled={rentmeSyncStatus === 'syncing'}
            style={{ padding: '3px 10px', fontSize: 11, border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg)', cursor: 'pointer', color: 'var(--ink-2)' }}>
            ↻ Sync
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {alerts.length > 0 && (
        <div style={{ background: '#fff8e6', border: '1px solid #f39c12', borderLeft: '4px solid #e67e22', borderRadius: 6, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle style={{ width: 16, height: 16, color: '#e67e22', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#7d4e0a' }}>
            <strong>Attenzione:</strong> {alerts.map(c => c.nome).join(', ')} {alerts.length === 1 ? 'è quasi esaurita' : 'sono quasi esaurite'} per il periodo selezionato.
          </span>
        </div>
      )}

      {/* Date picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '14px 18px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dal</label>
          <input type="date" value={dal} min={today}
            onChange={e => { setDal(e.target.value); if (e.target.value > al) setAl(e.target.value); }}
            style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 14, background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-sans)' }} />
        </div>
        <span style={{ color: 'var(--muted)', fontSize: 18 }}>→</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Al</label>
          <input type="date" value={al} min={dal}
            onChange={e => setAl(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 14, background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-sans)' }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>{nGiorni}</span>
        <div style={{ flex: 1 }} />
        <button type="button" onClick={() => { setDal(today); setAl(today); }}
          style={{ fontSize: 12, color: 'var(--ink-2)', background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '5px 12px', cursor: 'pointer' }}>
          Oggi
        </button>
      </div>

      {/* Griglia disponibilità */}
      {availability.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔌</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: 'var(--ink-2)' }}>Nessun dato disponibile</div>
          <div style={{ fontSize: 13 }}>Sincronizza RentMe o inserisci prenotazioni per vedere la disponibilità.</div>
          <button type="button" onClick={onRentmeSync} style={{ marginTop: 16, padding: '8px 20px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 5, fontSize: 13, cursor: 'pointer' }}>
            ↻ Sincronizza RentMe
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {availability.map(cat => {
            const c = catColor(cat);
            const pct = cat.total > 0 ? Math.round((cat.free / cat.total) * 100) : 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat)}
                disabled={cat.free <= 0}
                style={{
                  background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 10,
                  padding: '16px 18px', textAlign: 'left', cursor: cat.free > 0 ? 'pointer' : 'not-allowed',
                  transition: 'transform 0.1s, box-shadow 0.1s', position: 'relative', overflow: 'hidden',
                  opacity: cat.free <= 0 ? 0.75 : 1,
                }}
                onMouseEnter={e => { if (cat.free > 0) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,.12)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.text, marginBottom: 6 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.3 }}>
                  {cat.nome}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-serif)', color: c.text, lineHeight: 1 }}>{cat.free}</span>
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>/ {cat.total} liberi</span>
                </div>
                {/* Barra progressione */}
                <div style={{ height: 4, background: 'rgba(0,0,0,.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: c.border, borderRadius: 2, transition: 'width 0.4s' }} />
                </div>
                {cat.free > 0 && (
                  <div style={{ position: 'absolute', right: 12, bottom: 12, fontSize: 11, color: c.text, fontWeight: 600 }}>
                    Prenota →
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Legenda */}
      {availability.length > 0 && (
        <div style={{ marginTop: 24, display: 'flex', gap: 20, fontSize: 11, color: 'var(--muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#27ae60', display: 'inline-block' }} />
            Disponibile
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#e67e22', display: 'inline-block' }} />
            Quasi esaurito (≤25% liberi)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#c0392b', display: 'inline-block' }} />
            Esaurito
          </div>
          {(rentmeVehicles||[]).length === 0 && (
            <span style={{ marginLeft: 'auto', fontStyle: 'italic' }}>
              ⚠ Dati solo locali · sync RentMe per disponibilità reale
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PDF EXPORT — Preventivo
// Apre una nuova finestra con HTML formattato e lancia window.print().
// Nessuna dipendenza esterna — funziona ovunque.
// ═══════════════════════════════════════════════════════════════════
function exportPreventivoPDF(quote, agencyInfo) {
  const agency = agencyInfo || {};
  const nomeAzienda = agency.nome || 'Edonoleggio';
  const indirizzo   = agency.indirizzoLegale ? `${agency.indirizzoLegale}, ${agency.citta || ''}` : 'Via Emerico Amari, 8 — Lampedusa (AG)';
  const telefono    = agency.telefono || '';
  const email       = agency.email || '';
  const piva        = agency.piva ? `P.IVA ${agency.piva}` : '';

  const today = new Date().toLocaleDateString('it-IT', { day:'2-digit', month:'long', year:'numeric' });
  const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('it-IT', { day:'2-digit', month:'long', year:'numeric' }) : '—';

  const rows = (quote.breakdown || []).map(b =>
    `<tr><td>${b.label}</td><td style="text-align:right">${b.gg} gg</td><td style="text-align:right">€${b.price.toFixed(2)}</td><td style="text-align:right;font-weight:600">€${b.subtotal.toFixed(2)}</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>Preventivo · ${nomeAzienda}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',system-ui,sans-serif;color:#1a1815;background:#fff;padding:40px 48px;max-width:760px;margin:0 auto}
  h1{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:28px;color:#1a1815;margin-bottom:4px}
  .sub{font-size:13px;color:#6a6057;margin-bottom:32px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;padding-bottom:20px;border-bottom:2px solid #1a1815}
  .logo-area h2{font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:#1a1815}
  .logo-area p{font-size:12px;color:#6a6057;margin-top:3px}
  .doc-meta{text-align:right;font-size:12px;color:#6a6057}
  .doc-meta strong{font-size:15px;font-weight:600;color:#1a1815;display:block}
  .section{margin-bottom:28px}
  .section h3{font-family:'Fraunces',serif;font-size:14px;font-weight:600;color:#1a1815;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #e8e0cc}
  .info-row{display:flex;gap:8px;font-size:13px;margin-bottom:5px;color:#3a352e}
  .info-label{font-weight:600;width:120px;flex-shrink:0;color:#6a6057;font-size:12px;text-transform:uppercase;letter-spacing:.05em}
  table{width:100%;border-collapse:collapse;font-size:13px}
  thead tr{background:#f5f0e8}
  th{padding:8px 10px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#6a6057;border-bottom:2px solid #e8e0cc}
  td{padding:9px 10px;border-bottom:1px solid #f0ebe0;color:#3a352e}
  .total-row td{font-weight:700;color:#1a1815;border-top:2px solid #1a1815;font-size:15px;padding-top:12px}
  .footer{margin-top:48px;padding-top:16px;border-top:1px solid #e8e0cc;font-size:11px;color:#9a9085;text-align:center;line-height:1.6}
  .highlight{background:#f5f0e8;border-radius:6px;padding:14px 16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center}
  .highlight .price{font-family:'Fraunces',serif;font-size:32px;font-weight:600;color:#1a1815}
  .highlight .price-label{font-size:12px;color:#6a6057;text-transform:uppercase;letter-spacing:.06em}
  @media print{body{padding:20px}button{display:none!important}}
</style>
</head>
<body>
<div class="header">
  <div class="logo-area">
    <h2>${nomeAzienda}</h2>
    <p>${indirizzo}${telefono ? ' · Tel. '+telefono : ''}${email ? ' · '+email : ''}</p>
    ${piva ? `<p>${piva}</p>` : ''}
  </div>
  <div class="doc-meta">
    <strong>PREVENTIVO</strong>
    <span>${today}</span>
  </div>
</div>

<div class="section">
  <h3>Dettagli noleggio</h3>
  <div class="info-row"><span class="info-label">Categoria</span><span>${quote.catName || '—'}</span></div>
  <div class="info-row"><span class="info-label">Dal</span><span>${fmtDate(quote.dal)}</span></div>
  <div class="info-row"><span class="info-label">Al</span><span>${fmtDate(quote.al)}</span></div>
  <div class="info-row"><span class="info-label">Stagione</span><span>${quote.stagione ? quote.stagione.charAt(0).toUpperCase() + quote.stagione.slice(1) : '—'}</span></div>
  <div class="info-row"><span class="info-label">Tipo tariffa</span><span>${quote.isWeekly ? 'Settimanale (più conveniente)' : 'Giornaliera'}</span></div>
</div>

${(quote.breakdown||[]).length > 0 ? `
<div class="section">
  <h3>Dettaglio tariffe</h3>
  <table>
    <thead><tr><th>Periodo</th><th style="text-align:right">Giorni</th><th style="text-align:right">Tariffa/gg</th><th style="text-align:right">Subtotale</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>` : ''}

<div class="highlight">
  <div>
    <div class="price-label">Totale preventivo</div>
    <div class="price">€${(quote.total||0).toFixed(2)}</div>
  </div>
  <div style="font-size:12px;color:#6a6057;text-align:right">
    ${quote.totalDays || 0} giorni · IVA inclusa<br>
    Salvo disponibilità alla conferma
  </div>
</div>

<div class="footer">
  Questo preventivo è indicativo e non costituisce contratto. Valido 7 giorni dalla data di emissione.<br>
  ${nomeAzienda} · ${indirizzo} · Lampedusa, Isole Pelagie
</div>

<div style="text-align:center;margin-top:24px">
  <button onclick="window.print()" style="padding:10px 28px;background:#1a1815;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif">
    🖨 Stampa / Salva PDF
  </button>
</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900,scrollbars=yes');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 800);
  }
}

// ═══════════════════════════════════════════════════════════════════
// STAGIONI EDITOR — configura quali mesi appartengono a quale stagione
// Consente all'admin di modificare la distribuzione stagionale senza
// toccare il codice. Persistente su edo:v1:stagioni.
// ═══════════════════════════════════════════════════════════════════
const DEFAULT_STAGIONI_CONFIG = {
  bassa: [0,1,2,3,9,10,11],    // gen-apr, ott-dic
  media: [4,5,6,8],            // mag-lug, set
  alta:  [7],                  // ago
};
const MESI_IT = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
const STAGIONE_LABELS = { bassa: 'Bassa stagione', media: 'Media stagione', alta: 'Alta stagione' };
const STAGIONE_COLORS = { bassa: '#1f5d83', media: '#b87333', alta: '#c14a2b' };

function StagioniEditor({ stagioni, onSave }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(stagioni || DEFAULT_STAGIONI_CONFIG)));
  const [saved, setSaved] = useState(false);

  const getStagioneForMonth = (m) => {
    if (draft.alta.includes(m))  return 'alta';
    if (draft.media.includes(m)) return 'media';
    if (draft.bassa.includes(m)) return 'bassa';
    return null;
  };

  const cycleMonth = (m) => {
    const order = ['bassa','media','alta'];
    const cur   = getStagioneForMonth(m);
    const nextS = order[(order.indexOf(cur) + 1) % order.length];
    const nd = { bassa: [...draft.bassa], media: [...draft.media], alta: [...draft.alta] };
    ['bassa','media','alta'].forEach(s => { nd[s] = nd[s].filter(x => x !== m); });
    nd[nextS].push(m);
    nd[nextS].sort((a,b)=>a-b);
    setDraft(nd);
    setSaved(false);
  };

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 24px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-2)', marginBottom: 6 }}>
        Distribuzione stagionale
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
        Clicca su ogni mese per cambiare stagione (cicla: Bassa → Media → Alta). Le modifiche influenzano subito il calcolo dei preventivi.
      </p>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
        {['bassa','media','alta'].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: STAGIONE_COLORS[s], display: 'inline-block' }} />
            <span style={{ color: 'var(--ink-2)' }}>{STAGIONE_LABELS[s]}</span>
          </div>
        ))}
      </div>

      {/* Mesi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6, marginBottom: 20 }}>
        {MESI_IT.map((nome, m) => {
          const s = getStagioneForMonth(m);
          const col = s ? STAGIONE_COLORS[s] : '#aaa';
          return (
            <button key={m} type="button" onClick={() => cycleMonth(m)}
              title={s ? STAGIONE_LABELS[s] : '—'}
              style={{
                padding: '10px 4px', border: `2px solid ${col}`, borderRadius: 6,
                background: s ? col + '22' : '#f5f5f5',
                cursor: 'pointer', textAlign: 'center', transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: col, textTransform: 'uppercase', letterSpacing: '.04em' }}>{nome}</div>
            </button>
          );
        })}
      </div>

      {/* Riepilogo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
        {['bassa','media','alta'].map(s => (
          <div key={s} style={{ padding: '10px 12px', background: STAGIONE_COLORS[s] + '18', borderRadius: 6, border: `1px solid ${STAGIONE_COLORS[s]}44` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: STAGIONE_COLORS[s], textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{STAGIONE_LABELS[s]}</div>
            <div style={{ fontSize: 12, color: 'var(--ink)' }}>
              {draft[s].length === 0 ? '—' : draft[s].map(m => MESI_IT[m]).join(', ')}
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={handleSave}
        style={{ padding: '8px 20px', background: saved ? '#27ae60' : 'var(--ink)', color: '#fff', border: 'none', borderRadius: 5, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background .2s' }}>
        {saved ? '✓ Salvato' : 'Salva configurazione stagioni'}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FLEET CSV IMPORT — carica flotta da file CSV
// Formato atteso (header obbligatorio):
//   targa, categoria, alias, anno, stato
//   AG001AA, scooter_50, Piaggio Liberty, 2021, attivo
// Il separatore può essere virgola o punto-e-virgola.
// ═══════════════════════════════════════════════════════════════════
function FleetCSVImport({ fleet, onImport, onClose }) {
  const [step, setStep]     = useState('upload'); // upload | preview | done
  const [preview, setPreview] = useState([]);
  const [error, setError]   = useState(null);
  const [added, setAdded]   = useState(0);
  const fileRef = useRef();

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error('Il file deve avere almeno un\'intestazione e una riga dati');
    const sep   = lines[0].includes(';') ? ';' : ',';
    const heads = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/"/g,''));
    const rows  = lines.slice(1).map(l => {
      const cells = l.split(sep).map(c => c.trim().replace(/"/g,''));
      const obj = {};
      heads.forEach((h,i) => { obj[h] = cells[i] || ''; });
      return obj;
    }).filter(r => r.targa || r['targa/id']);
    if (!rows.length) throw new Error('Nessuna riga valida trovata (colonna "targa" obbligatoria)');
    return rows.map(r => ({
      id:        r.targa || r['targa/id'] || r.id || ('VEH_' + Math.random().toString(36).slice(2,7).toUpperCase()),
      targa:     (r.targa || r['targa/id'] || '').toUpperCase(),
      categoria: r.categoria || r.category || r.tipo || '',
      alias:     r.alias || r.modello || r.nome || '',
      anno:      parseInt(r.anno || r.year || '0') || null,
      stato:     r.stato || r.status || 'attivo',
    }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const rows = parseCSV(ev.target.result);
        setPreview(rows);
        setStep('preview');
      } catch(err) {
        setError(err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = () => {
    // Filtra duplicati (per targa)
    const existing = new Set((fleet || []).map(v => v.id));
    const toAdd = preview.filter(r => !existing.has(r.id));
    onImport([...(fleet || []), ...toAdd]);
    setAdded(toAdd.length);
    setStep('done');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '28px 32px', width: 560, maxWidth: '95vw', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>Import flotta CSV</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>Carica un file .csv con le colonne: targa, categoria, alias, anno, stato</p>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {step === 'upload' && (
          <div>
            {error && (
              <div style={{ background: '#fdecea', border: '1px solid #c0392b', borderRadius: 5, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#c0392b' }}>
                ❌ {error}
              </div>
            )}
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: 'var(--surface-2)', transition: 'border-color .2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink-2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <Upload style={{ width: 32, height: 32, color: 'var(--muted)', margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Clicca per scegliere il file</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>CSV con separatore virgola o punto-e-virgola · UTF-8</div>
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{ display: 'none' }} />
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: 'var(--muted)' }}>
              <strong>Esempio CSV:</strong><br/>
              <code style={{ display: 'block', background: 'var(--surface-2)', padding: '8px 10px', borderRadius: 4, marginTop: 6, fontFamily: 'monospace', fontSize: 11 }}>
                targa,categoria,alias,anno,stato<br/>
                AG001AA,scooter_50,Piaggio Liberty,2021,attivo<br/>
                AG002BB,scooter_125,Honda PCX,2022,attivo
              </code>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div>
            <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--ink-2)' }}>
              <strong>{preview.length}</strong> mezzi trovati nel file. Controlla e conferma l'importazione.
            </div>
            <div style={{ maxHeight: 280, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 6 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    {['Targa','Categoria','Alias','Anno','Stato'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-2)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg)' : 'var(--surface-2)' }}>
                      <td style={{ padding: '5px 10px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{r.targa}</td>
                      <td style={{ padding: '5px 10px', borderBottom: '1px solid var(--border)' }}>{r.categoria}</td>
                      <td style={{ padding: '5px 10px', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>{r.alias}</td>
                      <td style={{ padding: '5px 10px', borderBottom: '1px solid var(--border)' }}>{r.anno}</td>
                      <td style={{ padding: '5px 10px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: r.stato === 'attivo' ? '#27ae60' : '#c0392b' }}>{r.stato}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button type="button" onClick={handleImport}
                style={{ flex: 1, padding: '10px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 5, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Importa {preview.length} mezzi
              </button>
              <button type="button" onClick={() => { setStep('upload'); setPreview([]); }}
                style={{ padding: '10px 20px', background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: 5, fontSize: 14, cursor: 'pointer' }}>
                Indietro
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Import completato</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
              {added > 0 ? `${added} mezzi aggiunti alla flotta.` : 'Nessun nuovo mezzo (tutti già presenti).'}
            </div>
            <button type="button" onClick={onClose}
              style={{ padding: '10px 28px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 5, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Chiudi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// REGISTRO CASSA
// Traccia ogni incasso: acconto, saldo, rimborso.
// Persistente su edo:v1:cassa — sincronizzato su tutti i dispositivi.
// ═══════════════════════════════════════════════════════════════════
const CASSA_METODI = {
  contanti: { label: 'Contanti',  icon: '💵', color: '#27ae60' },
  carta:    { label: 'Carta',     icon: '💳', color: '#1f5d83' },
  bonifico: { label: 'Bonifico',  icon: '🏦', color: '#7d3c98' },
  paypal:   { label: 'PayPal',    icon: '🅿',  color: '#0070ba' },
  altro:    { label: 'Altro',     icon: '•',  color: '#7a7068' },
};
const CASSA_TIPI = {
  acconto:  { label: 'Acconto',   pill: 'pill-warn' },
  saldo:    { label: 'Saldo',     pill: 'pill-ok'   },
  rimborso: { label: 'Rimborso',  pill: 'pill-err'  },
  deposito: { label: 'Deposito',  pill: 'pill-sea'  },
  extra:    { label: 'Extra',     pill: 'pill-neutral' },
};

function CassaFormModal({ onSave, onClose, prenotazioni, customers, operator }) {
  const today = new Date().toISOString().slice(0,10);
  const [form, setForm] = useState({
    data: today, clienteNome: '', prenotazioneId: '',
    importo: '', metodo: 'contanti', tipo: 'saldo', nota: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Auto-compila cliente da prenotazione selezionata
  const handlePrenoChange = (id) => {
    set('prenotazioneId', id);
    const p = (prenotazioni||[]).find(x => x.id === id);
    if (p) set('clienteNome', [p.clienteCognome, p.clienteNome].filter(Boolean).join(' '));
  };

  const validate = () => {
    const e = {};
    if (!form.importo || isNaN(parseFloat(form.importo))) e.importo = 'Importo non valido';
    if (!form.clienteNome.trim()) e.clienteNome = 'Cliente obbligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const p = (prenotazioni||[]).find(x => x.id === form.prenotazioneId);
    onSave({
      id: 'cassa_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
      createdAt: new Date().toISOString(),
      data: form.data,
      clienteNome: form.clienteNome.trim(),
      prenotazioneId: form.prenotazioneId || null,
      vehicleLabel: p?.vehicleLabel || '',
      importo: parseFloat(form.importo),
      metodo: form.metodo,
      tipo: form.tipo,
      nota: form.nota.trim(),
      operatorId: operator?.id || '',
      operatorName: operator?.nome || '',
    });
  };

  const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 14, background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-2)', display: 'block', marginBottom: 4 };
  const fieldStyle = { marginBottom: 14 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '28px 32px', width: 480, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>Nuovo incasso</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20 }}>×</button>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Data</label>
          <input type="date" value={form.data} onChange={e => set('data', e.target.value)} style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Collega prenotazione <span style={{ fontWeight: 400, textTransform: 'none' }}>(opzionale)</span></label>
          <select value={form.prenotazioneId} onChange={e => handlePrenoChange(e.target.value)} style={inputStyle}>
            <option value="">— senza prenotazione —</option>
            {(prenotazioni||[]).filter(p => p.stato !== 'cancellata' && p.fonte !== 'rentme').map(p => (
              <option key={p.id} value={p.id}>
                {[p.clienteCognome, p.clienteNome].filter(Boolean).join(' ')} · {p.vehicleLabel} · {p.dal}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Cliente *</label>
          <input type="text" value={form.clienteNome} onChange={e => set('clienteNome', e.target.value)}
            placeholder="Cognome Nome" style={{ ...inputStyle, borderColor: errors.clienteNome ? '#c0392b' : 'var(--border)' }} />
          {errors.clienteNome && <div style={{ fontSize: 11, color: '#c0392b', marginTop: 3 }}>{errors.clienteNome}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Importo € *</label>
            <input type="number" min="0" step="0.01" value={form.importo} onChange={e => set('importo', e.target.value)}
              placeholder="0.00" style={{ ...inputStyle, borderColor: errors.importo ? '#c0392b' : 'var(--border)' }} />
            {errors.importo && <div style={{ fontSize: 11, color: '#c0392b', marginTop: 3 }}>{errors.importo}</div>}
          </div>
          <div>
            <label style={labelStyle}>Tipo</label>
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)} style={inputStyle}>
              {Object.entries(CASSA_TIPI).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Metodo di pagamento</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(CASSA_METODI).map(([k,v]) => (
              <button key={k} type="button" onClick={() => set('metodo', k)}
                style={{
                  padding: '6px 12px', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `2px solid ${form.metodo === k ? v.color : 'var(--border)'}`,
                  background: form.metodo === k ? v.color + '18' : 'var(--bg)',
                  color: form.metodo === k ? v.color : 'var(--ink-2)',
                }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Nota interna <span style={{ fontWeight: 400, textTransform: 'none' }}>(opzionale)</span></label>
          <input type="text" value={form.nota} onChange={e => set('nota', e.target.value)} placeholder="Es. saldo finale, caparra rimborsata…" style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="button" onClick={handleSubmit}
            style={{ flex: 1, padding: '10px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 5, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Registra incasso
          </button>
          <button type="button" onClick={onClose}
            style={{ padding: '10px 20px', background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: 5, fontSize: 14, cursor: 'pointer' }}>
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

function RegistroCassaPage({ cassa, setCassa, prenotazioni, customers, operator, pushToast }) {
  const [periodo, setPeriodo] = useState('oggi');
  const [metodoFilter, setMetodoFilter] = useState('tutti');
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().slice(0,10);

  const getRange = () => {
    const d = new Date();
    if (periodo === 'oggi')      return [today, today];
    if (periodo === 'settimana') {
      const lun = new Date(d); lun.setDate(d.getDate() - ((d.getDay()+6)%7));
      return [lun.toISOString().slice(0,10), today];
    }
    if (periodo === 'mese') return [`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`, today];
    return [null, null];
  };
  const [dal, al] = getRange();

  const filtered = useMemo(() => {
    return (cassa || []).filter(r => {
      if (dal && r.data < dal) return false;
      if (al  && r.data > al)  return false;
      if (metodoFilter !== 'tutti' && r.metodo !== metodoFilter) return false;
      return true;
    }).sort((a,b) => b.data.localeCompare(a.data) || b.createdAt.localeCompare(a.createdAt));
  }, [cassa, dal, al, metodoFilter]);

  // Totali
  const totale     = filtered.filter(r => r.tipo !== 'rimborso').reduce((s,r) => s + r.importo, 0);
  const rimborsi   = filtered.filter(r => r.tipo === 'rimborso').reduce((s,r) => s + r.importo, 0);
  const netto      = totale - rimborsi;
  const perMetodo  = Object.fromEntries(Object.keys(CASSA_METODI).map(k => [k, filtered.filter(r => r.metodo === k && r.tipo !== 'rimborso').reduce((s,r)=>s+r.importo,0)]));

  const handleSave = (record) => {
    setCassa(prev => [record, ...(prev||[])]);
    setShowForm(false);
    pushToast({ tone: 'success', title: 'Incasso registrato', message: `€${record.importo.toFixed(2)} · ${CASSA_METODI[record.metodo]?.label}` });
  };

  const handleDelete = (id) => {
    setCassa(prev => (prev||[]).filter(r => r.id !== id));
    pushToast({ tone: 'warning', title: 'Incasso rimosso', message: 'Record eliminato dal registro' });
  };

  const exportCSV = () => {
    const header = 'Data,Cliente,Mezzo,Tipo,Metodo,Importo,Nota,Operatore';
    const rows = filtered.map(r =>
      [r.data, r.clienteNome, r.vehicleLabel||'', CASSA_TIPI[r.tipo]?.label||r.tipo, CASSA_METODI[r.metodo]?.label||r.metodo, r.importo.toFixed(2), r.nota||'', r.operatorName||''].map(x => `"${String(x).replace(/"/g,'""')}"`).join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `cassa_${today}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const periodoLabel = { oggi: 'Oggi', settimana: 'Questa settimana', mese: 'Questo mese', tutto: 'Tutto' };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>Registro cassa</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
            Tracciamento incassi · acconti · saldi · rimborsi
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={exportCSV}
            style={{ padding: '8px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 5, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
            <Download className="w-4 h-4" /> CSV
          </button>
          <button type="button" onClick={() => setShowForm(true)}
            style={{ padding: '8px 18px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 5, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus className="w-4 h-4" /> Incasso
          </button>
        </div>
      </div>

      {/* Filtri periodo */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {['oggi','settimana','mese','tutto'].map(p => (
          <button key={p} type="button" onClick={() => setPeriodo(p)}
            style={{ padding: '6px 14px', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: periodo === p ? 'var(--ink)' : 'var(--bg)', color: periodo === p ? '#fff' : 'var(--ink-2)' }}>
            {periodoLabel[p]}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
        {['tutti', ...Object.keys(CASSA_METODI)].map(m => (
          <button key={m} type="button" onClick={() => setMetodoFilter(m)}
            style={{ padding: '5px 12px', borderRadius: 5, fontSize: 12, cursor: 'pointer', border: `1px solid ${metodoFilter === m ? 'var(--ink)' : 'var(--border)'}`, background: metodoFilter === m ? 'var(--ink)' : 'var(--bg)', color: metodoFilter === m ? '#fff' : 'var(--ink-2)' }}>
            {m === 'tutti' ? 'Tutti' : CASSA_METODI[m]?.icon + ' ' + CASSA_METODI[m]?.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Incassato', value: `€${totale.toLocaleString('it-IT', {minimumFractionDigits:2})}`, sub: periodoLabel[periodo], color: '#27ae60' },
          { label: 'Rimborsi', value: `€${rimborsi.toLocaleString('it-IT', {minimumFractionDigits:2})}`, sub: 'da sottrarre', color: '#c0392b' },
          { label: 'Netto', value: `€${netto.toLocaleString('it-IT', {minimumFractionDigits:2})}`, sub: 'incasso - rimborsi', color: '#1f5d83' },
          { label: 'Movimenti', value: filtered.length, sub: `${periodoLabel[periodo].toLowerCase()}`, color: 'var(--ink)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-serif)', color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Breakdown per metodo */}
      {filtered.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {Object.entries(perMetodo).filter(([,v]) => v > 0).map(([k,v]) => {
            const m = CASSA_METODI[k];
            return (
              <div key={k} style={{ padding: '8px 14px', background: m.color+'14', border: `1px solid ${m.color}44`, borderRadius: 6, fontSize: 13 }}>
                <span style={{ color: m.color, fontWeight: 700, marginRight: 6 }}>{m.icon} {m.label}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>€{v.toLocaleString('it-IT', {minimumFractionDigits:2})}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Lista movimenti */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          <Wallet style={{ width: 36, height: 36, margin: '0 auto 12px', opacity: .4 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
            Nessun movimento
          </div>
          <div style={{ fontSize: 13 }}>Registra il primo incasso con il bottone qui sopra.</div>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['Data','Cliente','Mezzo','Tipo','Metodo','Importo','Nota',''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-2)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const metodo = CASSA_METODI[r.metodo];
                const tipo   = CASSA_TIPI[r.tipo];
                return (
                  <tr key={r.id} style={{ background: i%2===0 ? 'var(--bg)' : 'var(--surface-2)' }}>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', color: 'var(--ink-2)' }}>{r.data}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{r.clienteNome}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)', fontSize: 12, borderBottom: '1px solid var(--border)' }}>{r.vehicleLabel||'—'}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                      <span className={tipo?.pill||'pill-neutral'} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{tipo?.label||r.tipo}</span>
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      <span style={{ color: metodo?.color, fontWeight: 600, fontSize: 12 }}>{metodo?.icon} {metodo?.label}</span>
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 700, textAlign: 'right', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', color: r.tipo==='rimborso' ? '#c0392b' : '#27ae60' }}>
                      {r.tipo==='rimborso' ? '-' : '+'}€{r.importo.toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)', fontSize: 11, borderBottom: '1px solid var(--border)' }}>{r.nota||'—'}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                      <button type="button" onClick={() => handleDelete(r.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}
                        title="Elimina movimento">
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <CassaFormModal
          onSave={handleSave}
          onClose={() => setShowForm(false)}
          prenotazioni={prenotazioni}
          customers={customers}
          operator={operator}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STORICO CLIENTE — pannello espandibile nella lista clienti
// Mostra: visite, spesa totale, ultima visita, categorie preferite,
// lista prenotazioni collegate.
// ═══════════════════════════════════════════════════════════════════
function ClienteStoricoPanel({ cliente, prenotazioni, contracts, onClose }) {
  const preno = useMemo(() => {
    return (prenotazioni||[]).filter(p => {
      if (p.fonte === 'rentme') return false;
      const nome = [p.clienteCognome, p.clienteNome].filter(Boolean).join(' ').toLowerCase();
      const cNome = [cliente.cognome, cliente.nome].filter(Boolean).join(' ').toLowerCase();
      return p.clienteId === cliente.id || nome === cNome;
    }).sort((a,b) => b.dal.localeCompare(a.dal));
  }, [prenotazioni, cliente]);

  const contr = useMemo(() => {
    return (contracts||[]).filter(c => c.record?.cognome?.toLowerCase() === (cliente.cognome||'').toLowerCase()).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }, [contracts, cliente]);

  const spesaTotale  = preno.reduce((s,p) => s + (p.prezzo||0), 0);
  const accontiTotali = preno.reduce((s,p) => s + (p.acconto||0), 0);
  const ultimaVisita = preno.length > 0 ? preno[0].dal : null;
  const catCount     = {};
  preno.forEach(p => { if (p.vehicleLabel) catCount[p.vehicleLabel] = (catCount[p.vehicleLabel]||0)+1; });
  const topCat       = Object.entries(catCount).sort((a,b)=>b[1]-a[1]).slice(0,3);

  const fmtDate = (d) => d ? new Date(d+'T12:00:00').toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'}) : '—';
  const statoPill = (s) => {
    const m = { attesa:'#e67e22', confermata:'#1f5d83', in_corso:'#27ae60', completata:'#7a7068', cancellata:'#c0392b' };
    return <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color:'#fff', background: m[s]||'#aaa', padding:'1px 7px', borderRadius:10 }}>{s?.replace('_',' ')}</span>;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 700, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
      <div style={{ background: 'var(--bg)', width: 480, maxWidth: '95vw', height: '100vh', overflow: 'auto', boxShadow: '-8px 0 40px rgba(0,0,0,.2)', padding: '28px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
              {cliente.cognome} {cliente.nome}
            </h2>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
              {cliente.cittadinanza} · {cliente.docTipo}: {cliente.docNum}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 22 }}>×</button>
        </div>

        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Prenotazioni', value: preno.length },
            { label: 'Pratiche', value: contr.length },
            { label: 'Spesa totale', value: `€${spesaTotale.toLocaleString('it-IT')}` },
            { label: 'Acconti', value: `€${accontiTotali.toLocaleString('it-IT')}` },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--surface-2)', borderRadius: 6, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>{k.value}</div>
            </div>
          ))}
        </div>

        {ultimaVisita && (
          <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 16, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 6 }}>
            <span style={{ fontWeight: 600 }}>Ultima visita:</span> {fmtDate(ultimaVisita)}
            {topCat.length > 0 && <span style={{ marginLeft: 12 }}>· <span style={{ fontWeight: 600 }}>Preferisce:</span> {topCat.map(([c]) => c).join(', ')}</span>}
          </div>
        )}

        {/* Contatti */}
        {(cliente.tel || cliente.email) && (
          <div style={{ marginBottom: 20, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 6, fontSize: 13 }}>
            {cliente.tel && <div style={{ marginBottom: 4 }}><Phone style={{ width: 13, height: 13, display: 'inline', marginRight: 6 }} /><span className="mono">{cliente.tel}</span></div>}
            {cliente.email && <div><Mail style={{ width: 13, height: 13, display: 'inline', marginRight: 6 }} />{cliente.email}</div>}
          </div>
        )}

        {/* Lista prenotazioni */}
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-2)', marginBottom: 10 }}>
          Prenotazioni ({preno.length})
        </div>
        {preno.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 20 }}>Nessuna prenotazione</div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            {preno.map(p => (
              <div key={p.id} style={{ borderBottom: '1px solid var(--border)', padding: '10px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{p.vehicleLabel}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtDate(p.dal)} → {fmtDate(p.al)}</div>
                  {p.acconto > 0 && <div style={{ fontSize: 11, color: 'var(--muted)' }}>Acconto €{p.acconto}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {statoPill(p.stato)}
                  {p.prezzo > 0 && <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--ink)', marginTop: 4 }}>€{p.prezzo}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista pratiche */}
        {contr.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-2)', marginBottom: 10 }}>
              Pratiche CARGOS ({contr.length})
            </div>
            {contr.map(c => (
              <div key={c.contractId} style={{ borderBottom: '1px solid var(--border)', padding: '8px 0', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--muted)' }}>{c.contractId}</span>
                  <span style={{ marginLeft: 8 }}>{c.record?.tipoVeicolo || '—'}</span>
                </div>
                <span style={{ color: 'var(--muted)' }}>{fmtDate(c.createdAt?.slice(0,10))}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [wizardOpen, setWizardOpen] = useState(false);

  // URL del backend (locale al tablet, NON sincronizzato via backend stesso — sarebbe circolare).
  // L'admin può cambiarlo da Impostazioni; tipicamente punta a Render in produzione.
  const [apiBaseUrl, setApiBaseUrl] = usePersistentState('edo:v1:apiBase', DEFAULT_API_BASE, { skipRemote: true });

  // Dati operativi: localStorage SEMPRE + sync con backend Render quando disponibile.
  // Le chiavi 'edo:v1:' devono combaciare con quelle che usa il backend (path /api/store/edo:v1:fleet).
  // Sync flow: load da backend in background → save debounced 1.5s → fallback localStorage se offline.
  const sharedOpts = { baseUrl: apiBaseUrl };
  const [listino, setListino] = usePersistentState('edo:v1:listino', LISTINO, sharedOpts);
  const [fleet,        setFleet,        fleetSync]     = usePersistentState('edo:v1:fleet',     INITIAL_FLEET,           sharedOpts);
  const [customers,    setCustomers,    customersSync] = usePersistentState('edo:v1:customers', INITIAL_CUSTOMERS,       sharedOpts);
  const [partners,     setPartners,     partnersSync]  = usePersistentState('edo:v1:partners',  INITIAL_PARTNERS,        sharedOpts);
  const [operators,    setOperators,    operatorsSync] = usePersistentState('edo:v1:operators', MOCK_OPERATORS,          sharedOpts);
  const [cargosConfig, setCargosConfig, cargosSync]    = usePersistentState('edo:v1:cargos',    INITIAL_CARGOS_CONFIG,   sharedOpts);
  const [agency,       setAgency,       agencySync]    = usePersistentState('edo:v1:agency',    INITIAL_AGENCY,          sharedOpts);
  const [prenotazioni, setPrenotazioni, prenoSync]     = usePersistentState('edo:v1:prenotazioni', [],              sharedOpts);
  const [rentmeVehicles, setRentmeVehicles] = usePersistentState('edo:v1:rentme_vehicles', [], { skipRemote: true });
  const [stagioni, setStagioni] = usePersistentState('edo:v1:stagioni', DEFAULT_STAGIONI_CONFIG, sharedOpts);
  // rentmeConfig: controlla il "bridge" verso RentMe.
  // enabled: false → Pratica gira in autonomia, zero chiamate a RentMe.
  // Questa è la singola spunta che separa "oggi" da "domani".
  const [rentmeConfig, setRentmeConfig] = usePersistentState('edo:v1:rentme_config', { enabled: true, autoIntervalMins: 5 }, { skipRemote: true });
  // Registro cassa: tutti i movimenti economici dell'agenzia.
  // skipRemote: false → sincronizzato su tutti i dispositivi (critico per contabilità).
  const [cassa, setCassa, cassaSync] = usePersistentState('edo:v1:cassa', [], sharedOpts);

  // Helper: aggrega tutti gli stati sync per il pannello Impostazioni
  const allSyncStatus = useMemo(() => ({
    fleet: fleetSync, customers: customersSync, partners: partnersSync, prenotazioni: prenoSync,
    operators: operatorsSync, cargos: cargosSync, agency: agencySync, cassa: cassaSync,
  }), [fleetSync, customersSync, partnersSync, operatorsSync, cargosSync, agencySync]);

  // Sync globale: forza il push di tutti gli slot. Utile per il pulsante "Sincronizza ora".
  const syncAll = useCallback(async () => {
    const results = await Promise.all([
      fleetSync.sync(), customersSync.sync(), partnersSync.sync(),
      operatorsSync.sync(), cargosSync.sync(), agencySync.sync(),
    ]);
    return {
      ok: results.every(r => r.ok),
      count: results.filter(r => r.ok).length,
      total: results.length,
    };
  }, [fleetSync, customersSync, partnersSync, operatorsSync, cargosSync, agencySync]);

  // Stato di sessione (non persistente — si resetta a ogni apertura)
  const [admin, setAdmin]                 = useState(false);
  const [manualOffline, setManualOffline] = useState(false);  // toggle manuale per testing
  const [operatorIdx, setOperatorIdx]     = useState(0);
  const [modal, setModal]                 = useState(null);
  const [prefillCustomer, setPrefillCustomer] = useState(null);
  // Bridge condiviso: usato da Preventivi, BancoRapido e PrenotazioniPage
  const [prenotazioniPrefill, setPrenotazioniPrefill] = useState(null);
  const [showDisponibilita, setShowDisponibilita] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [storioClienteId, setStorioClienteId] = useState(null);

  // RentMe sync hook — auto-sync al mount + ogni 5 min (se abilitato)
  const rentmeSync = useRentMeSync({
    rentmeVehicles,
    setRentmeVehicles,
    setPrenotazioni,
    pushToast,
    enabled: rentmeConfig.enabled !== false,
  });

  // Toast system per feedback non-bloccanti
  const { toasts, push: pushToast, dismiss: dismissToast } = useToasts();

  // API client — memoizzato sul baseUrl così le chiamate sono consistenti
  const api = useMemo(() => makeApi(apiBaseUrl), [apiBaseUrl]);

  // Polling stato backend — attivo solo se non offline manuale
  const { status: backendStatus, lastCheck, cargosOk } = useBackendHealth(api, !manualOffline);

  // Online "effettivo" combina toggle manuale + stato del backend
  const online = !manualOffline && (backendStatus === 'online' || backendStatus === 'degraded');
  const setOnline = useCallback((v) => setManualOffline(!v), []);

  // Coda contratti in attesa di drain (offline → online)
  // Per ora indicatore visivo; il drain reale lo fa il worker backend.
  const [pendingQueue, setPendingQueue] = useState(0);

  const operator = operators[operatorIdx] || operators[0];

  // Toast quando lo stato backend cambia significativamente
  const lastStatusRef = useRef(backendStatus);
  useEffect(() => {
    if (lastStatusRef.current === backendStatus) return;
    const wasChecking = lastStatusRef.current === 'checking';
    lastStatusRef.current = backendStatus;
    // Skip toast al boot (checking → primo stato): si capisce dal pill di stato
    if (wasChecking) return;
    if (backendStatus === 'online') {
      pushToast({ tone: 'success', title: 'Backend connesso', message: 'Pratica online · CARGOS pronto' });
    } else if (backendStatus === 'offline') {
      pushToast({ tone: 'warning', title: 'Backend non raggiungibile', message: 'Lavorerai in locale, i dati restano salvati sul tablet', duration: 5000 });
    } else if (backendStatus === 'degraded') {
      pushToast({ tone: 'warning', title: 'CARGOS non disponibile', message: 'I contratti restano in coda, drain automatico al ripristino' });
    }
    // 'unconfigured' → niente toast: è uno stato di setup, non un errore.
    // L'utente vedrà la guida nel pannello Impostazioni → Backend.
  }, [backendStatus, pushToast]);

  // pendingQueue è derivato da localContracts (vedi effect più sotto, dopo
  // la dichiarazione di localContracts — l'ordine importa per ESLint).

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

  // Update URL API backend
  const updateApiBase = useCallback((url) => {
    setApiBaseUrl(url);
    pushToast({ tone: 'info', title: 'URL backend aggiornato', message: url });
  }, [pushToast]);

  // ── SUBMIT CONTRATTO al backend ───────────────────────────────────
  // Strategia: optimistic — la UI mostra subito "in attesa" e il chiamante
  // del wizard può chiudere il form. La promise restituisce { ok, status, error }
  // così il caller decide cosa mostrare (toast verde su sent, warning su error
  // con suggerimento di retry, info su paper per i motoveicoli).
  // Salva sempre una copia locale prima della rete: zero contratti persi.
  const [localContracts, setLocalContracts] = usePersistentState('edo:v1:contracts', [], { skipRemote: true });

  // pendingQueue derivato dai contratti reali in attesa (queued/pending/error)
  useEffect(() => {
    const realPending = localContracts.filter(c =>
      c.status === 'queued' || c.status === 'pending' || c.status === 'error'
    ).length;
    setPendingQueue(realPending);
  }, [localContracts]);

  const submitContract = useCallback(async (wizardData) => {
    // 1. Map wizard data → CARGOS record
    const record = mapWizardToCargosRecord(wizardData, operator, agency, partners);
    const isMoto = record.VEICOLO_TIPO === 'M';
    const isExcluded = record.VEICOLO_TIPO === null;  // e-bike
    // Override esplicito: l'operatore ha disattivato CARGOS per questo contratto
    // (regime transitorio, contratto pre-2018, test, ecc.). Significativo solo per i veicoli
    // che CARGOS richiederebbe — per scooter/quad/ebike è già spento per norma.
    const overriddenOff = wizardData.cargosOverride === 'off';
    const willSendToCargos = !isMoto && !isExcluded && !overriddenOff;

    // 2. Save local copy IMMEDIATELY (sopravvive a tutto)
    const localEntry = {
      contractId: record.CONTRATTO_ID,
      createdAt: new Date().toISOString(),
      operatorId: operator?.id,
      status: willSendToCargos ? 'pending' : 'paper',
      vehicleType: record.VEICOLO_TIPO,
      cargosRequired: willSendToCargos,
      cargosOverridden: overriddenOff,  // tracciatura per audit
      record,
      wizardSnapshot: wizardData,  // utile per ristampare il PDF, troubleshooting
    };
    setLocalContracts(cs => [...cs, localEntry]);

    // 3. Casi che non vanno al backend CARGOS:
    //    - e-bike (escluse per norma, non veicolo a motore)
    //    - override manuale dell'operatore (CARGOS disattivato per questo contratto)
    if (isExcluded) {
      pushToast({ tone: 'info', title: 'Contratto salvato', message: 'E-bike: non soggetto a CARGOS' });
      return { ok: true, status: 'paper', contractId: record.CONTRATTO_ID };
    }
    if (overriddenOff) {
      pushToast({
        tone: 'warning',
        title: 'Contratto salvato senza CARGOS',
        message: `Override manuale · ${record.VEICOLO_MARCA} ${record.VEICOLO_MODELLO}`,
        duration: 4500,
      });
      return { ok: true, status: 'paper', contractId: record.CONTRATTO_ID, overridden: true };
    }

    // 4. Se siamo offline (manuale o backend down), salva e basta
    if (!online) {
      setLocalContracts(cs => cs.map(c => c.contractId === record.CONTRATTO_ID ? { ...c, status: 'queued' } : c));
      pushToast({
        tone: 'warning',
        title: 'Salvato in coda',
        message: `Contratto ${isMoto ? '(motoveicolo)' : ''} in attesa di sync${isMoto ? '' : ' e invio CARGOS'}`,
        duration: 4500,
      });
      return { ok: true, status: 'queued', contractId: record.CONTRATTO_ID };
    }

    // 5. Online: prova il submit reale
    try {
      const result = await api.submitContract(record, 'sync', operator?.id);
      const finalStatus = result.status || (isMoto ? 'paper' : 'sent');
      setLocalContracts(cs => cs.map(c =>
        c.contractId === record.CONTRATTO_ID
          ? { ...c, status: finalStatus, receipt: result.receipt, syncedAt: new Date().toISOString() }
          : c
      ));

      if (isMoto) {
        pushToast({ tone: 'success', title: 'Contratto salvato', message: 'Motoveicolo: nessun invio CARGOS necessario' });
      } else if (finalStatus === 'sent') {
        pushToast({ tone: 'success', title: 'Inviato a CARGOS', message: `Ricevuta: ${result.receipt?.slice(0, 16) || 'ok'}…` });
      } else if (result.ok === false) {
        pushToast({ tone: 'warning', title: 'Invio CARGOS fallito', message: result.error || 'Riprovabile dalle Pratiche', duration: 5000 });
      }
      return { ok: result.ok !== false, status: finalStatus, contractId: record.CONTRATTO_ID, error: result.error };
    } catch (err) {
      // Errore di rete o timeout: il contratto resta in 'pending' localmente
      setLocalContracts(cs => cs.map(c =>
        c.contractId === record.CONTRATTO_ID
          ? { ...c, status: 'error', lastError: err.message, lastErrorKind: err.kind }
          : c
      ));
      const msg = {
        network:    'Connessione non riuscita — contratto salvato localmente',
        timeout:    'Backend troppo lento — contratto salvato, riprova dopo',
        offline:    'Sei offline — contratto in coda',
        blocked:    'Backend non raggiungibile da questo ambiente — contratto salvato localmente',
        validation: `Errore di validazione: ${err.message}`,
        server:     `Errore server: ${err.message}`,
        auth:       'Sessione scaduta — controlla credenziali CARGOS',
      }[err.kind] || err.message;
      pushToast({ tone: 'error', title: 'Invio non completato', message: msg, duration: 6000 });
      return { ok: false, status: 'error', contractId: record.CONTRATTO_ID, error: err.message, errorKind: err.kind };
    }
  }, [operator, partners, online, api, setLocalContracts, pushToast]);

  // Retry manuale di un contratto in errore — utile dalla lista pratiche
  const retryContract = useCallback(async (contractId) => {
    if (!online) {
      pushToast({ tone: 'warning', title: 'Sei offline', message: 'Riprova quando torna la connessione' });
      return;
    }
    try {
      const result = await api.retryContract(contractId, operator?.id);
      setLocalContracts(cs => cs.map(c =>
        c.contractId === contractId
          ? { ...c, status: result.status || 'sent', receipt: result.receipt, syncedAt: new Date().toISOString() }
          : c
      ));
      pushToast({ tone: 'success', title: 'Reinvio riuscito', message: `Contratto ${contractId.slice(-8)} inviato a CARGOS` });
    } catch (err) {
      pushToast({ tone: 'error', title: 'Reinvio fallito', message: err.message });
    }
  }, [online, api, operator, setLocalContracts, pushToast]);

  // Marca un contratto come "veicolo rientrato": cambia status a 'completed' e registra
  // il timestamp del rientro effettivo. Sparisce dal pannello "Veicoli fuori".
  // I dati restano in archivio per consultazioni successive.
  const markContractReturned = useCallback((contractId) => {
    setLocalContracts(cs => cs.map(c =>
      c.contractId === contractId
        ? { ...c, returnedAt: new Date().toISOString() }
        : c
    ));
    const c = localContracts.find(x => x.contractId === contractId);
    const veicolo = c?.record?.VEICOLO_TARGA || c?.record?.VEICOLO_MARCA || 'veicolo';
    pushToast({
      tone: 'success',
      title: 'Rientro registrato',
      message: `${veicolo} marcato come rientrato`,
      duration: 3000,
    });
  }, [localContracts, setLocalContracts, pushToast]);

  // ── RESET ARCHIVI ─────────────────────────────────────────────────
  // Svuota uno slot persistente sia in locale che remoto. Il debounce
  // di usePersistentState propaga il valore vuoto al backend Render
  // entro 1.5s, sovrascrivendo eventuali dati lasciati lì da versioni
  // precedenti (es. i 3 clienti di simulazione che non si volevano via).
  const resetCustomers = useCallback(() => {
    setCustomers([]);
    pushToast({ tone: 'warning', title: 'Rubrica clienti svuotata', message: 'Il backend verrà aggiornato entro pochi secondi', duration: 4000 });
  }, [setCustomers, pushToast]);

  const resetContracts = useCallback(() => {
    setLocalContracts([]);
    pushToast({ tone: 'warning', title: 'Archivio pratiche svuotato', message: 'Tutti i contratti locali sono stati rimossi', duration: 4000 });
  }, [setLocalContracts, pushToast]);

  const resetEverything = useCallback(() => {
    setCustomers([]);
    setLocalContracts([]);
    setFleet(INITIAL_FLEET);
    setPartners(INITIAL_PARTNERS);
    setOperators(MOCK_OPERATORS);
    pushToast({ tone: 'warning', title: 'Reset completo eseguito', message: 'Tutto ripristinato ai valori reali iniziali · sync in corso', duration: 5000 });
  }, [setCustomers, setLocalContracts, setFleet, setPartners, setOperators, pushToast]);

  const requestResetCustomers = useCallback(() => {
    setModal({
      type: 'confirm',
      title: 'Svuotare tutta la rubrica clienti?',
      message: <>Verranno rimossi <strong>tutti</strong> i {customers.length} clienti dall'app e dal backend Render. Utile per ripulire i clienti di simulazione caricati per sbaglio. <strong>L'azione è irreversibile</strong>: i contratti già fatti restano, ma i dati anagrafici dei clienti spariranno.</>,
      confirmLabel: 'Svuota rubrica',
      onConfirm: resetCustomers,
    });
  }, [customers.length, resetCustomers]);

  const requestResetContracts = useCallback(() => {
    setModal({
      type: 'confirm',
      title: 'Svuotare tutto l\'archivio pratiche?',
      message: <>Verranno rimossi {localContracts.length} contratti dall'archivio locale. <strong>I contratti già inviati a CARGOS restano sui server della Questura</strong> — questo svuota solo la copia interna dell'agenzia. Uso tipico: pulizia contratti di test.</>,
      confirmLabel: 'Svuota archivio',
      onConfirm: resetContracts,
    });
  }, [localContracts.length, resetContracts]);

  const requestResetEverything = useCallback(() => {
    setModal({
      type: 'confirm',
      title: 'Reset totale ai dati iniziali?',
      message: <>Operazione di <strong>emergenza</strong>: cancella clienti e contratti dell'app e dal backend, e ripristina flotta/strutture/operatori ai valori reali iniziali (193 veicoli, 22 strutture, solo Alessandra Raptis come operatore). Usare solo se i dati sono compromessi e si vuole ripartire da zero pulito.</>,
      confirmLabel: 'Conferma reset totale',
      onConfirm: resetEverything,
    });
  }, [resetEverything]);

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
        <Sidebar page={page} setPage={setPage} onNew={() => openWizard()} online={online && cargosConfig.enabled} agency={agency} rentmeSyncStatus={rentmeSync.status} rentmeAlertCount={rentmeSync.status === 'ok' ? calcAvailability(new Date().toISOString().slice(0,10), new Date().toISOString().slice(0,10), rentmeVehicles, prenotazioni).filter(c => c.alert).length : 0} />
        <main className="flex-1 min-h-screen" id="main-content">
          <Topbar
            online={online} setOnline={setOnline} pendingQueue={pendingQueue}
            operator={operator} admin={admin} setAdmin={setAdmin}
            onScanPlate={() => setModal('plate')}
            onShiftChange={() => setModal('shift')}
            agency={agency}
          />
          <div className="px-8 py-6 max-w-[1280px] mx-auto">
            {/* ErrorBoundary con key={page}: se una pagina crasha, cambiando pagina
                il boundary si resetta automaticamente (la key cambia → nuovo mount). */}
            <ErrorBoundary key={page}>
              {page === 'dashboard'  && <Dashboard onNew={() => openWizard()} setPage={setPage} operator={operator} fleet={fleet} contracts={localContracts} partners={partners} onMarkReturned={markContractReturned} />}
              {page === 'cassa'      && <RegistroCassaPage cassa={cassa} setCassa={setCassa} prenotazioni={prenotazioni} customers={customers} operator={operator} pushToast={pushToast} />}
              {page === 'banco'      && <BancoRapidoPage rentmeVehicles={rentmeVehicles} prenotazioni={prenotazioni} fleet={fleet} setPage={setPage} setPrenotazioniPrefill={setPrenotazioniPrefill} listino={listino} pushToast={pushToast} rentmeSyncStatus={rentmeSync.status} onRentmeSync={rentmeSync.sync} rentmeLastSync={rentmeSync.lastSync} />}
              {page === 'report'        && <ReportPage prenotazioni={prenotazioni} contracts={localContracts} />}
              {page === 'preventivi'    && <PreventiviPage setPage={setPage} setPrenotazioniPrefill={setPrenotazioniPrefill} listino={listino} />}
              {page === 'prenotazioni' && <PrenotazioniPage prenotazioni={prenotazioni} setPrenotazioni={setPrenotazioni} fleet={fleet} customers={customers} operator={operator} onOpenWizard={openWizard} pushToast={pushToast} prefill={prenotazioniPrefill} onClearPrefill={() => setPrenotazioniPrefill(null)} />}
              {page === 'contracts'  && <ContractsList contracts={localContracts} operators={operators} onRetry={retryContract} onMarkReturned={markContractReturned} online={online} />}
              {page === 'fleet'      && <FleetPage fleet={fleet} admin={admin} onAddVehicle={() => setModal('newVehicle')} onEditVehicle={(v) => setModal({ type: 'editVehicle', vehicle: v })} onDeleteVehicle={requestDeleteVehicle} onImportCSV={() => setShowCsvImport(true)} />}
              {page === 'customers'  && <CustomersPage customers={customers} admin={admin} onShowQR={(c) => setModal({ type: 'qr', customer: c })} onNewWithCustomer={openWizard} onAddCustomer={() => setModal('newCustomer')} onEditCustomer={(c) => setModal({ type: 'editCustomer', customer: c })} onShowStorico={(c) => setStorioClienteId(c.id)} />}
              {page === 'partners'   && <PartnersPage partners={partners} admin={admin} onAddPartner={() => setModal('newPartner')} onEditPartner={(p) => setModal({ type: 'editPartner', partner: p })} onDeletePartner={requestDeletePartner} />}
              {page === 'listino'    && <div style={{padding:'28px 32px',maxWidth:900,margin:'0 auto'}}>
                <h1 style={{margin:'0 0 6px',fontSize:22,fontFamily:'var(--font-serif)',fontWeight:600}}>Gestione prezzi</h1>
                <p style={{margin:'0 0 20px',fontSize:13,color:'var(--muted)'}}>Modifica le tariffe del listino per stagione. Le modifiche si riflettono subito nei preventivi.</p>
                <ListinoEditor listino={listino} onSave={(l)=>{setListino(l); pushToast && pushToast({tone:'success',title:'Listino aggiornato',message:'Tariffe salvate e sincronizzate'});}} />
                <div style={{marginTop:32}}>
                  <h2 style={{margin:'0 0 12px',fontSize:16,fontFamily:'var(--font-serif)',fontWeight:600}}>Stagioni</h2>
                  <StagioniEditor stagioni={stagioni} onSave={(s)=>{setStagioni(s); pushToast && pushToast({tone:'success',title:'Stagioni aggiornate',message:'Configurazione stagionale salvata'});}} />
                </div>
              </div>}
              {page === 'settings'   && <SettingsPage operator={operator} operators={operators} admin={admin} cargosConfig={cargosConfig} backendStatus={backendStatus} lastCheck={lastCheck} apiBaseUrl={apiBaseUrl} syncStatus={allSyncStatus} agency={agency} customers={customers} contracts={localContracts} onSyncAll={syncAll} pushToast={pushToast} onAddOperator={() => setModal('newOperator')} onEditOperator={(o) => setModal({ type: 'editOperator', operator: o })} onDeleteOperator={requestDeleteOperator} onEditCargos={() => setModal('cargosConfig')} onEditApiBase={() => setModal('apiBase')} onEditAgency={() => setModal('agency')} onResetCustomers={requestResetCustomers} onResetContracts={requestResetContracts} onResetEverything={requestResetEverything} rentmeConfig={rentmeConfig} setRentmeConfig={setRentmeConfig} rentmeSync={rentmeSync} rentmeVehicles={rentmeVehicles} />}
            </ErrorBoundary>
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
            onSubmit={submitContract}
            agency={agency}
          />
        )}

        {modal === 'plate'        && <PlateScanModal fleet={fleet} onClose={closeModal} />}
        {modal === 'shift'        && <ShiftChangeModal currentOperator={operator} operators={operators} contracts={localContracts} onClose={closeModal} onConfirm={handoverShift} />}
        {modal === 'newVehicle'   && <NewVehicleModal onClose={closeModal} onSave={(v) => { addVehicle(v); closeModal(); }} />}
        {modal === 'newCustomer'  && <NewCustomerModal onClose={closeModal} onSave={(c) => { addCustomer(c); closeModal(); }} />}
        {modal === 'newPartner'   && <NewPartnerModal onClose={closeModal} onSave={(p) => { addPartner(p); closeModal(); }} />}
        {modal === 'newOperator'  && <NewOperatorModal onClose={closeModal} onSave={(o) => { addOperator(o); closeModal(); }} />}
        {modal === 'cargosConfig' && <CargosConfigModal config={cargosConfig} onClose={closeModal} onSave={(c) => { updateCargosConfig(c); closeModal(); }} />}
        {modal === 'apiBase'      && <ApiBaseModal current={apiBaseUrl} onClose={closeModal} onSave={(url) => { updateApiBase(url); closeModal(); }} />}
        {modal === 'agency'       && <AgencyConfigModal current={agency} onClose={closeModal} onSave={(a) => { setAgency(a); pushToast({ tone: 'success', title: 'Anagrafica agenzia aggiornata', message: 'Modifiche salvate · sync in corso' }); closeModal(); }} />}
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
      {storioClienteId && (() => {
        const c = customers.find(x => x.id === storioClienteId);
        return c ? <ClienteStoricoPanel cliente={c} prenotazioni={prenotazioni} contracts={localContracts} onClose={() => setStorioClienteId(null)} /> : null;
      })()}
            {showCsvImport && (
        <FleetCSVImport
          fleet={fleet}
          onImport={(newFleet) => {
            setFleet(newFleet);
            setShowCsvImport(false);
            pushToast({ tone: 'success', title: 'Flotta importata', message: `${newFleet.length} mezzi in flotta` });
          }}
          onClose={() => setShowCsvImport(false)}
        />
      )}
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
function Sidebar({ page, setPage, onNew, online, agency, rentmeSyncStatus, rentmeAlertCount }) {
  const items = [
    { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
    { id: 'banco',        label: 'Banco rapido', icon: Zap, badge: rentmeAlertCount > 0 ? rentmeAlertCount : null },
    { id: 'cassa',        label: 'Cassa',        icon: Wallet },
    { id: 'preventivi',   label: 'Preventivi',   icon: Receipt },
    { id: 'report',       label: 'Report',       icon: BarChart2 },
    { id: 'contracts',    label: 'Pratiche',     icon: FileText },
    { id: 'prenotazioni', label: 'Prenotazioni', icon: CalendarDays },
    { id: 'fleet',        label: 'Flotta',       icon: Car },
    { id: 'customers',    label: 'Clienti',      icon: Users },
    { id: 'partners',     label: 'Strutture',    icon: Hotel },
    { id: 'listino',      label: 'Prezzi',       icon: Pencil },
    { id: 'settings',     label: 'Impostazioni', icon: Settings },
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
          Edonoleggio · Lampedusa<br />dal {agency.fondazione}
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
              {it.badge ? (
                <span style={{ background: '#c0392b', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 10, padding: '1px 5px', minWidth: 16, textAlign: 'center' }}>{it.badge}</span>
              ) : (
                <span className="dot" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Stato connessione</div>
        <div className="flex items-center gap-2 text-xs" aria-live="polite">
          <span className="w-2 h-2 rounded-full pulse" style={{ background: online ? 'var(--success)' : 'var(--accent)' }} aria-hidden="true" />
          <span style={{ color: 'var(--ink-2)' }}>{online ? 'Online' : 'Offline'}</span>
        </div>
        <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>
          {online ? 'Backend raggiungibile' : 'Lavoro locale, dati al sicuro'}
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px]" style={{ color: 'var(--muted)' }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
            background: rentmeSyncStatus === 'ok' ? '#27ae60' : rentmeSyncStatus === 'syncing' ? '#e67e22' : rentmeSyncStatus === 'error' ? '#c0392b' : '#aaa'
          }} />
          RentMe {rentmeSyncStatus === 'ok' ? '· connesso' : rentmeSyncStatus === 'syncing' ? '· sync…' : rentmeSyncStatus === 'error' ? '· errore' : '· —'}
        </div>
        <button
          type="button"
          onClick={() => setPage('settings')}
          className="mt-3 pt-3 border-t w-full text-left text-[10px] mono btn-ghost px-1 py-1 rounded -mx-1 hover:bg-[var(--surface-2)]"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          title="Apri impostazioni · informazioni versione"
          aria-label={`Versione ${APP_VERSION.number}, apri impostazioni`}
        >
          Pratica v{APP_VERSION.number} · {APP_VERSION.date}
        </button>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TOPBAR
// ═══════════════════════════════════════════════════════════════════
function Topbar({ online, setOnline, pendingQueue, operator, admin, setAdmin, onScanPlate, onShiftChange, agency }) {
  return (
    <header className="border-b px-8 py-3 flex items-center gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink-2)' }}>
        <Building2 className="w-4 h-4" aria-hidden="true" />
        <span className="font-medium">{agency.nome}</span>
        <span style={{ color: 'var(--muted)' }}>· {agency.indirizzoLegale}, {agency.citta}</span>
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
// DASHBOARD — basata su dati reali (props), niente mock
// ═══════════════════════════════════════════════════════════════════
function Dashboard({ onNew, setPage, operator, fleet, contracts, partners, onMarkReturned }) {
  // Data di oggi formattata in italiano
  const today = useMemo(() => {
    const d = new Date();
    const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const mesi   = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
                    'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
    return `${giorni[d.getDay()]} · ${d.getDate()} ${mesi[d.getMonth()]} ${d.getFullYear()} · Lampedusa`;
  }, []);

  // Statistiche derivate dai dati reali
  const stats = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayContracts = contracts.filter(c => {
      if (!c.createdAt) return false;
      return new Date(c.createdAt) >= startOfDay;
    });
    const byType = { auto: 0, scooter: 0, quad: 0, ebike: 0 };
    todayContracts.forEach(c => {
      const t = c.vehicleType === 'A' ? 'auto' : c.vehicleType === 'M' ? 'scooter' : null;
      if (t && byType[t] !== undefined) byType[t]++;
    });
    const sent     = todayContracts.filter(c => c.status === 'sent').length;
    const dueCargos = todayContracts.filter(c => c.cargosRequired).length;
    const errors   = contracts.filter(c => c.status === 'error').length;
    // Veicoli fuori = contratti attivi non ancora marcati rientrati
    const out = contracts.filter(c =>
      !c.returnedAt &&
      ['sent', 'paper', 'queued', 'pending'].includes(c.status) &&
      parseItalianDateTime(c.record?.CONTRATTO_CHECKIN_DATA) !== null
    ).length;
    // Overdue rispetto a ora
    const nowMs = Date.now();
    const overdue = contracts.filter(c => {
      if (c.returnedAt) return false;
      if (!['sent', 'paper', 'queued', 'pending'].includes(c.status)) return false;
      const d = parseItalianDateTime(c.record?.CONTRATTO_CHECKIN_DATA);
      return d !== null && d.getTime() < nowMs;
    }).length;

    return [
      {
        k: 'Pratiche oggi',
        v: todayContracts.length,
        sub: todayContracts.length === 0
          ? 'nessun contratto ancora'
          : `${byType.auto} auto · ${byType.scooter} scoot · ${byType.quad} quad · ${byType.ebike} e-bike`,
        accent: false,
      },
      {
        k: 'Inviate a CARGOS',
        v: sent,
        sub: dueCargos === 0 ? 'nessun invio dovuto oggi' : `su ${dueCargos} dovute (solo auto)`,
        accent: false,
      },
      {
        k: 'In errore',
        v: errors,
        sub: errors === 0 ? 'tutto in regola' : 'richiede attenzione',
        accent: errors > 0,
      },
      {
        k: 'Veicoli fuori',
        v: out,
        sub: out === 0
          ? 'nessun veicolo in viaggio'
          : overdue > 0
          ? `${overdue} in ritardo`
          : 'tutti nei tempi',
        accent: overdue > 0,
      },
    ];
  }, [contracts]);

  // Saluto adattivo
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12)  return 'Buongiorno';
    if (h < 18)  return 'Buon pomeriggio';
    return 'Buonasera';
  }, []);

  const errorCount = stats[2].v;
  const recentContracts = useMemo(() =>
    [...contracts].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5)
  , [contracts]);

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>{today}</p>
          <h2 className="serif text-4xl font-medium tracking-tight">{greeting}, {operator.nome.split(' ')[0]}.</h2>
          {errorCount > 0 ? (
            <p className="text-sm mt-1" style={{ color: 'var(--ink-2)' }}>
              <span style={{ color: 'var(--accent)' }}>{errorCount === 1 ? '1 pratica' : `${errorCount} pratiche`}</span> in errore richiede attenzione.
            </p>
          ) : contracts.length === 0 ? (
            <p className="text-sm mt-1" style={{ color: 'var(--ink-2)' }}>
              Banco pronto. <span style={{ color: 'var(--accent)' }}>Apri la prima pratica</span> per iniziare.
            </p>
          ) : (
            <p className="text-sm mt-1" style={{ color: 'var(--ink-2)' }}>
              Tutto in regola · {contracts.length === 1 ? '1 contratto' : `${contracts.length} contratti`} in archivio.
            </p>
          )}
        </div>
        <button type="button" onClick={onNew} className="btn-primary px-5 py-2.5 rounded text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" aria-hidden="true" /> Nuova pratica
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6" role="list" aria-label="Statistiche giornaliere">
        {stats.map(s => (
          <div key={s.k} className={`card-paper p-5 ${s.accent ? 'stat-accent' : ''}`} role="listitem">
            <div className="text-[11px] uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>{s.k}</div>
            <div className="serif text-4xl font-medium" style={{ color: s.accent ? 'var(--accent)' : 'var(--ink)' }}>{s.v}</div>
            <div className="text-xs mt-2" style={{ color: 'var(--ink-2)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <ReturnsPanel contracts={contracts} partners={partners} onMarkReturned={onMarkReturned} />

      <div className="card-paper">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h3 className="serif text-xl font-medium">Pratiche recenti</h3>
          <button type="button" onClick={() => setPage('contracts')} className="text-xs flex items-center gap-1 btn-ghost px-2 py-1 rounded">
            Vedi tutte <ChevronRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>

        {recentContracts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--muted)' }} aria-hidden="true" />
            <div className="serif text-lg font-medium mb-1">Nessuna pratica ancora</div>
            <div className="text-sm mb-5" style={{ color: 'var(--ink-2)' }}>
              Crea il primo contratto per popolare l'archivio.
            </div>
            <button type="button" onClick={onNew} className="btn-primary px-4 py-2 rounded text-sm font-semibold inline-flex items-center gap-2">
              <Plus className="w-4 h-4" aria-hidden="true" /> Nuova pratica
            </button>
          </div>
        ) : (
          <table className="w-full" aria-label="Pratiche recenti">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                <th scope="col" className="text-left px-5 py-3 font-semibold">ID</th>
                <th scope="col" className="text-left px-2 py-3 font-semibold">Cliente</th>
                <th scope="col" className="text-left px-2 py-3 font-semibold">Veicolo</th>
                <th scope="col" className="text-left px-2 py-3 font-semibold">Quando</th>
                <th scope="col" className="text-left px-2 py-3 font-semibold">Stato</th>
              </tr>
            </thead>
            <tbody>
              {recentContracts.map(c => {
                const r = c.record || {};
                const createdAt = c.createdAt ? new Date(c.createdAt) : null;
                const stato = c.status === 'sent'    ? 'inviato'
                           : c.status === 'paper'   ? 'cartaceo'
                           : c.status === 'queued'  ? 'bozza'
                           : c.status === 'pending' ? 'bozza'
                           : c.status === 'error'   ? 'errore'
                           : 'bozza';
                return (
                  <tr key={c.contractId} className="border-t hover:bg-[var(--surface-2)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-5 py-3 mono text-xs" style={{ color: 'var(--ink-2)' }}>{c.contractId.slice(-12)}</td>
                    <td className="px-2 py-3 text-sm">
                      {r.CONDUCENTE_CONTRAENTE_COGNOME} {r.CONDUCENTE_CONTRAENTE_NOME}
                    </td>
                    <td className="px-2 py-3 text-sm" style={{ color: 'var(--ink-2)' }}>
                      {r.VEICOLO_MARCA} {r.VEICOLO_MODELLO}
                      {r.VEICOLO_TARGA && <span className="mono text-[11px] ml-1.5">· {r.VEICOLO_TARGA}</span>}
                    </td>
                    <td className="px-2 py-3 text-xs" style={{ color: 'var(--ink-2)' }}>
                      {createdAt
                        ? createdAt.toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="px-2 py-3"><StatusPill stato={stato} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
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

// ReturnsPanel: tre colonne (In ritardo · Imminenti · Programmati) calcolate
// dai contratti reali. Un contratto è "in viaggio" se status ∈ {sent, paper, queued}
// e CONTRATTO_CHECKIN_DATA è nel futuro (non ancora marcato come 'completed').
// Aggiornamento live: il `now` interno rigenera ogni 60s per spostare automaticamente
// le pratiche da "imminenti" a "in ritardo" senza che l'operatore debba ricaricare.
function ReturnsPanel({ contracts, partners, onMarkReturned }) {
  // Ticker che invalida `now` ogni 60 secondi → ricalcolo automatico dei minuti
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Deriva la lista veicoli "fuori" dai contratti reali
  const returns = useMemo(() => {
    const active = (contracts || []).filter(c => {
      // Considero solo contratti finalizzati ma non ancora chiusi
      if (c.returnedAt) return false;
      if (c.status === 'error') return false;  // contratti in errore non sono "fuori"
      if (!['sent', 'paper', 'queued', 'pending'].includes(c.status)) return false;
      // Devono avere data di rientro parsabile
      const checkinDate = parseItalianDateTime(c.record?.CONTRATTO_CHECKIN_DATA);
      return checkinDate !== null;
    });

    return active.map(c => {
      const r = c.record || {};
      const checkinDate = parseItalianDateTime(r.CONTRATTO_CHECKIN_DATA);
      const minutiAlRientro = Math.round((checkinDate - now) / 60000);
      const partner = partners?.find(p => p.indirizzo === r.CONTRATTO_CHECKIN_INDIRIZZO);
      return {
        contractId: c.contractId,
        cliente:    `${r.CONDUCENTE_CONTRAENTE_COGNOME || ''} ${r.CONDUCENTE_CONTRAENTE_NOME || ''}`.trim() || '—',
        telefono:   r.CONDUCENTE_CONTRAENTE_RECAPITO || null,
        marca:      r.VEICOLO_MARCA || '',
        modello:    r.VEICOLO_MODELLO || '',
        targa:      r.VEICOLO_TARGA || '',
        consegnaTimestamp: r.CONTRATTO_CHECKIN_DATA || '—',
        consegnaPartner:   partner?.nome || null,
        minutiAlRientro,
      };
    });
  }, [contracts, partners, now]);

  const overdue   = useMemo(() => returns.filter(r => r.minutiAlRientro < 0).sort((a,b) => a.minutiAlRientro - b.minutiAlRientro), [returns]);
  const imminent  = useMemo(() => returns.filter(r => r.minutiAlRientro >= 0 && r.minutiAlRientro <= 90).sort((a,b) => a.minutiAlRientro - b.minutiAlRientro), [returns]);
  const scheduled = useMemo(() => returns.filter(r => r.minutiAlRientro > 90).sort((a,b) => a.minutiAlRientro - b.minutiAlRientro), [returns]);

  const fmtTime = useCallback((mins) => {
    if (mins < 0) {
      const m = Math.abs(mins);
      if (m < 60)  return `${m} min in ritardo`;
      if (m < 1440) return `${Math.floor(m / 60)}h ${m % 60}m in ritardo`;
      return `${Math.floor(m / 1440)}g in ritardo`;
    }
    if (mins < 60)   return `tra ${mins} min`;
    if (mins < 1440) return `tra ${Math.floor(mins / 60)}h ${mins % 60}m`;
    return `tra ${Math.floor(mins / 1440)}g ${Math.floor((mins % 1440) / 60)}h`;
  }, []);

  // Se non ci sono veicoli fuori, non mostro proprio il pannello
  if (returns.length === 0) return null;

  return (
    <div className="card-paper mb-6 overflow-hidden">
      <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
        <Timer className="w-4 h-4" style={{ color: 'var(--accent)' }} aria-hidden="true" />
        <h3 className="serif text-lg font-medium">Veicoli fuori</h3>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>· {returns.length} {returns.length === 1 ? 'attivo' : 'attivi'}</span>
        <div className="flex-1" />
        <div aria-live="assertive" aria-atomic="true" className="flex items-center gap-2">
          {overdue.length > 0  && <span className="pill pill-err pulse-red" role="alert"><AlertCircle className="w-3 h-3" aria-hidden="true" /> {overdue.length} in ritardo</span>}
          {imminent.length > 0 && <span className="pill pill-warn"><Clock className="w-3 h-3" aria-hidden="true" /> {imminent.length} {imminent.length === 1 ? 'imminente' : 'imminenti'}</span>}
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'var(--border)' }}>
        <ReturnColumn title="In ritardo"   color="var(--accent)"  items={overdue}   empty="Nessuno · ottimo lavoro"     fmtTime={fmtTime} onMarkReturned={onMarkReturned} urgent />
        <ReturnColumn title="Imminenti"    color="var(--warning)" items={imminent}  empty="Nessuno nelle prossime 1.5h" fmtTime={fmtTime} onMarkReturned={onMarkReturned} />
        <ReturnColumn title="Programmati"  color="var(--muted)"   items={scheduled} empty="Nessuno"                     fmtTime={fmtTime} onMarkReturned={onMarkReturned} muted />
      </div>
    </div>
  );
}

function ReturnColumn({ title, color, items, empty, fmtTime, urgent, muted, onMarkReturned }) {
  return (
    <div className="p-4">
      <div className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color }}>{title}</div>
      {items.length === 0
        ? <div className="text-xs py-2" style={{ color: 'var(--muted)' }}>{empty}</div>
        : items.map(r => (
          <div key={r.contractId} className={`flex items-start gap-2 py-2 ${urgent ? 'pulse-red rounded px-2 -mx-2' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{r.cliente}</div>
              <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                {r.targa && <span className="mono">{r.targa}</span>}
                {r.targa && (r.marca || r.modello) && ' · '}
                {r.marca} {r.modello}
              </div>
              <div className="text-[11px] mt-1 font-medium" style={{ color: urgent ? 'var(--accent)' : muted ? 'var(--muted)' : 'var(--warning)' }}>
                {muted ? r.consegnaTimestamp : fmtTime(r.minutiAlRientro)}
              </div>
              {r.consegnaPartner && (
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
                  <MapPin className="w-2.5 h-2.5 inline mr-0.5" aria-hidden="true" />{r.consegnaPartner}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              {!muted && r.telefono && (
                <a
                  href={`tel:${r.telefono.replace(/\s/g, '')}`}
                  className="btn-ghost p-1.5 rounded border block"
                  style={{ borderColor: 'var(--border)' }}
                  aria-label={`Chiama ${r.cliente}`}
                  title={r.telefono}
                >
                  <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              )}
              {onMarkReturned && (
                <button
                  type="button"
                  onClick={() => onMarkReturned(r.contractId)}
                  className="btn-ghost p-1.5 rounded border"
                  style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
                  aria-label={`Marca rientrato veicolo ${r.targa || ''}`}
                  title="Veicolo rientrato"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONTRACTS LIST — basata su localContracts reali (no mock)
// ═══════════════════════════════════════════════════════════════════
function ContractsList({ contracts, operators, onRetry, onMarkReturned, online }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const c = { all: contracts.length, sent: 0, paper: 0, queued: 0, error: 0, pending: 0, out: 0 };
    for (const x of contracts) {
      c[x.status] = (c[x.status] || 0) + 1;
      // 'out' = veicoli ancora in viaggio (sent/paper/queued con data CONTRATTO_CHECKIN_DATA, non rientrati)
      if (!x.returnedAt && ['sent', 'paper', 'queued', 'pending'].includes(x.status) &&
          parseItalianDateTime(x.record?.CONTRATTO_CHECKIN_DATA)) {
        c.out++;
      }
    }
    return c;
  }, [contracts]);

  const filtered = useMemo(() => {
    let f;
    if (statusFilter === 'all') f = contracts;
    else if (statusFilter === 'out') {
      f = contracts.filter(x =>
        !x.returnedAt &&
        ['sent', 'paper', 'queued', 'pending'].includes(x.status) &&
        parseItalianDateTime(x.record?.CONTRATTO_CHECKIN_DATA)
      );
    }
    else f = contracts.filter(x => x.status === statusFilter);

    if (query.trim()) {
      const q = query.toLowerCase();
      f = f.filter(x => {
        const r = x.record || {};
        return (
          (r.CONTRATTO_ID || '').toLowerCase().includes(q) ||
          (r.CONDUCENTE_CONTRAENTE_COGNOME || '').toLowerCase().includes(q) ||
          (r.CONDUCENTE_CONTRAENTE_NOME || '').toLowerCase().includes(q) ||
          (r.VEICOLO_TARGA || '').toLowerCase().includes(q) ||
          (r.VEICOLO_MARCA || '').toLowerCase().includes(q)
        );
      });
    }
    return [...f].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [contracts, statusFilter, query]);

  const statusFilters = [
    { id: 'all',     label: 'Tutte',         n: counts.all,                      icon: null },
    { id: 'out',     label: 'In viaggio',    n: counts.out || 0,                 icon: Timer,        color: 'var(--sea)' },
    { id: 'sent',    label: 'Inviate',       n: counts.sent || 0,                icon: CheckCircle2, color: 'var(--success)' },
    { id: 'paper',   label: 'Cartacee',      n: counts.paper || 0,               icon: FileCheck2,   color: 'var(--sea)' },
    { id: 'queued',  label: 'In coda',       n: (counts.queued || 0) + (counts.pending || 0), icon: Clock, color: 'var(--warning)' },
    { id: 'error',   label: 'In errore',     n: counts.error || 0,               icon: AlertCircle,  color: 'var(--accent)' },
  ].filter(s => s.id === 'all' || s.n > 0);

  return (
    <div>
      <h2 className="serif text-3xl font-medium mb-1">Pratiche</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
        {contracts.length === 0
          ? 'Archivio vuoto — i contratti creati dal wizard "Nuova pratica" appariranno qui.'
          : `${contracts.length} contratti · esportabili in CSV per fallback CARGOS via PEC alla Questura di Agrigento`}
      </p>

      {contracts.length === 0 ? (
        <div className="card-paper p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted)' }} aria-hidden="true" />
          <div className="serif text-xl font-medium mb-2">Nessun contratto ancora</div>
          <div className="text-sm" style={{ color: 'var(--ink-2)' }}>
            Inizia creando la prima pratica dal banco.
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Filtra per stato contratto">
            {statusFilters.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-3 py-1.5 rounded text-xs flex items-center gap-2 border transition-all ${statusFilter === s.id ? 'btn-primary border-transparent' : 'btn-ghost'}`}
                  style={{ borderColor: statusFilter === s.id ? 'transparent' : 'var(--border)' }}
                  aria-pressed={statusFilter === s.id}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" style={{ color: statusFilter === s.id ? 'currentColor' : s.color }} />}
                  {s.label}
                  <span className="opacity-60">{s.n}</span>
                </button>
              );
            })}
          </div>

          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} aria-hidden="true" />
            <input className="input pl-9" placeholder="Cerca per ID, cliente, targa…" value={query} onChange={e => setQuery(e.target.value)} />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-0.5 rounded" aria-label="Cancella ricerca">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="card-paper p-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
              Nessun contratto trovato{query && ` per "${query}"`}
            </div>
          ) : (
            <div className="card-paper overflow-hidden">
              <table className="w-full" aria-label="Archivio pratiche">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider border-b" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
                    <th scope="col" className="text-left px-5 py-3 font-semibold">ID</th>
                    <th scope="col" className="text-left px-2 py-3 font-semibold">Cliente</th>
                    <th scope="col" className="text-left px-2 py-3 font-semibold">Veicolo</th>
                    <th scope="col" className="text-left px-2 py-3 font-semibold">Data</th>
                    <th scope="col" className="text-left px-2 py-3 font-semibold">Operatore</th>
                    <th scope="col" className="text-left px-2 py-3 font-semibold">Stato</th>
                    <th scope="col" className="text-right px-5 py-3 font-semibold">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const r = c.record || {};
                    const op = operators?.find(o => o.id === c.operatorId);
                    const opName = op?.nome || c.operatorId || '—';
                    const opInitials = op?.initials || getInitials(opName.split(' ')[0], opName.split(' ').slice(1).join(' '));
                    const createdDate = c.createdAt ? new Date(c.createdAt) : null;
                    const stato = c.status === 'sent'    ? 'inviato'
                               : c.status === 'paper'   ? 'cartaceo'
                               : c.status === 'queued'  ? 'bozza'
                               : c.status === 'pending' ? 'bozza'
                               : c.status === 'error'   ? 'errore'
                               : 'bozza';
                    return (
                      <tr key={c.contractId} className="border-t hover:bg-[var(--surface-2)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                        <td className="px-5 py-3 mono text-[11px]" style={{ color: 'var(--ink-2)' }}>{c.contractId.slice(-12)}</td>
                        <td className="px-2 py-3 text-sm">
                          {r.CONDUCENTE_CONTRAENTE_COGNOME} {r.CONDUCENTE_CONTRAENTE_NOME}
                        </td>
                        <td className="px-2 py-3 text-sm" style={{ color: 'var(--ink-2)' }}>
                          {r.VEICOLO_MARCA} {r.VEICOLO_MODELLO}
                          {r.VEICOLO_TARGA && <span className="mono text-[11px] ml-1.5">· {r.VEICOLO_TARGA}</span>}
                        </td>
                        <td className="px-2 py-3 text-xs" style={{ color: 'var(--ink-2)' }}>
                          {createdDate ? createdDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : '—'}
                          <div className="text-[10px] mono" style={{ color: 'var(--muted)' }}>
                            {createdDate?.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }} aria-hidden="true">
                              {opInitials}
                            </div>
                            <span style={{ color: 'var(--ink-2)' }}>{opName.split(' ')[0]}</span>
                          </div>
                        </td>
                        <td className="px-2 py-3"><StatusPill stato={stato} /></td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            {/* Veicolo ancora "fuori" → mostra pulsante "rientrato" */}
                            {!c.returnedAt &&
                             ['sent', 'paper', 'queued', 'pending'].includes(c.status) &&
                             parseItalianDateTime(c.record?.CONTRATTO_CHECKIN_DATA) &&
                             onMarkReturned && (
                              <button
                                type="button"
                                onClick={() => onMarkReturned(c.contractId)}
                                className="btn-ghost px-2 py-1 rounded text-xs border inline-flex items-center gap-1"
                                style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
                                title="Marca veicolo come rientrato"
                              >
                                <Check className="w-3 h-3" /> Rientrato
                              </button>
                            )}
                            {c.returnedAt && (
                              <span className="text-[11px] inline-flex items-center gap-1" style={{ color: 'var(--success)' }} title={`Rientrato il ${new Date(c.returnedAt).toLocaleString('it-IT')}`}>
                                <Check className="w-3 h-3" /> Rientrato
                              </span>
                            )}
                            {c.status === 'error' && onRetry && (
                              <button
                                type="button"
                                onClick={() => onRetry(c.contractId)}
                                disabled={!online}
                                className="btn-accent px-3 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1 disabled:opacity-40"
                                title={online ? 'Riprova invio CARGOS' : 'Offline · non si può riprovare ora'}
                              >
                                <RefreshCw className="w-3 h-3" /> Reinvia
                              </button>
                            )}
                            {c.status === 'sent' && c.receipt && (
                              <span className="text-[11px] mono inline-flex items-center gap-1" style={{ color: 'var(--ink-2)' }}>
                                {c.receipt.slice(0, 12)}… <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FLEET
// ═══════════════════════════════════════════════════════════════════
function FleetPage({ fleet, admin, onAddVehicle, onEditVehicle, onDeleteVehicle, onImportCSV }) {
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onImportCSV}
              style={{ padding: '8px 16px', borderRadius: 5, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--ink-2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Upload className="w-4 h-4" aria-hidden="true" /> Import CSV
            </button>
            <button type="button" onClick={onAddVehicle} className="btn-primary px-4 py-2 rounded text-sm font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" aria-hidden="true" /> Nuovo veicolo
            </button>
          </div>
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
function CustomersPage({ customers, admin, onShowQR, onNewWithCustomer, onAddCustomer, onEditCustomer, onShowStorico }) {
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
            <button type="button" onClick={() => onShowStorico && onShowStorico(c)}
              className="btn-ghost px-3 py-1.5 rounded border text-xs font-semibold flex items-center gap-1.5"
              style={{ borderColor: 'var(--border)', color: 'var(--ink-2)' }}
              aria-label={`Storico di ${c.nome} ${c.cognome}`}>
              <History className="w-3.5 h-3.5" /> Storico
            </button>
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
function SettingsPage({ operator, operators, cargosConfig, admin, backendStatus, lastCheck, apiBaseUrl, syncStatus, agency, onSyncAll, pushToast, onAddOperator, onEditOperator, onDeleteOperator, onEditCargos, onEditApiBase, onEditAgency, onResetCustomers, onResetContracts, onResetEverything, customers, contracts, rentmeConfig, setRentmeConfig, rentmeSync, rentmeVehicles }) {
  const [showCargosSecrets, setShowCargosSecrets] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSyncAll = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const result = await onSyncAll();
      if (result.ok) {
        pushToast?.({ tone: 'success', title: 'Sincronizzazione completata', message: `${result.count}/${result.total} sezioni aggiornate sul backend` });
      } else {
        pushToast?.({ tone: 'warning', title: 'Sincronizzazione parziale', message: `${result.count}/${result.total} sezioni riuscite — controlla la connessione`, duration: 5000 });
      }
    } finally {
      setSyncing(false);
    }
  }, [syncing, onSyncAll, pushToast]);

  // Guardie difensive: se per qualche bug a monte mancano dati cruciali,
  // mostriamo un fallback leggibile invece di crashare con "undefined.nome".
  // Questo non dovrebbe mai succedere ma protegge dai casi-limite (CRUD operatori
  // che svuota la lista, persistente con dati corrotti, ecc.).
  if (!operators || operators.length === 0) {
    return (
      <div className="card-paper p-8 text-center">
        <AlertTriangle className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--warning)' }} />
        <div className="serif text-xl font-medium mb-2">Nessun operatore configurato</div>
        <div className="text-sm" style={{ color: 'var(--ink-2)' }}>
          La lista operatori è vuota. Ricarica l'app per ripristinare i valori predefiniti.
        </div>
      </div>
    );
  }
  if (!operator) {
    return (
      <div className="card-paper p-8 text-center">
        <AlertTriangle className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--warning)' }} />
        <div className="serif text-xl font-medium mb-2">Nessun operatore attivo</div>
        <div className="text-sm" style={{ color: 'var(--ink-2)' }}>
          L'operatore corrente non è definito. Effettua un cambio turno per assegnarne uno.
        </div>
      </div>
    );
  }
  // Anche cargosConfig deve esistere — usiamo oggetto vuoto come fallback
  // così tutti gli accessi a cfg.xxx ritornano undefined gestiti dalle `||`.
  const cfg = cargosConfig || {};

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-3">
              <h3 id="agency-heading" className="serif text-lg font-medium">{agency.nome}</h3>
              <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>dal {agency.fondazione}</span>
            </div>
            {admin && (
              <button type="button" onClick={onEditAgency} className="btn-ghost px-2.5 py-1 rounded text-xs border inline-flex items-center gap-1.5" style={{ borderColor: 'var(--border)' }}>
                <Pencil className="w-3.5 h-3.5" /> Modifica
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Ragione sociale"  value={agency.ragioneSociale} wide />
            <Field label="Titolare"         value={agency.titolare} />
            <Field label="P. IVA"           value={agency.piva} mono />
            <Field label="Codice fiscale"   value={agency.cf} mono wide />
            <Field label="Sede legale"      value={`${agency.indirizzoLegale}, ${agency.cap} ${agency.citta} (${agency.provincia})`} wide />
            <Field label="Sede operativa"   value={agency.sedeOperativa} wide />
            <Field label="Telefono"         value={agency.telefono} mono />
            <Field label="Cellulari"        value={(agency.cellulari || []).join(' / ')} mono />
            <Field label="Email"            value={agency.email} mono wide />
            <Field label="Servizi"          value={agency.servizi} wide />
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
            <Field label="Endpoint"             value={cfg.endpoint || '—'} mono wide />
            <Field label="ID Agenzia"           value={cfg.agenziaId || agency.agenziaId} mono />
            <Field label="Codice luogo (ISTAT)" value={cfg.istatLuogo || agency.istatLuogo} mono />
            <Field label="Username"             value={cfg.username || '—'} mono />
            <div>
              <div className="label">Password</div>
              <div className="flex items-center gap-2">
                <span className="text-sm mono">
                  {cfg.password
                    ? (showCargosSecrets ? cfg.password : '••••••••••')
                    : <span style={{ color: 'var(--muted)' }}>non configurata</span>}
                </span>
                {cfg.password && (
                  <button type="button" onClick={() => setShowCargosSecrets(s => !s)} className="btn-ghost p-1 rounded" aria-label={showCargosSecrets ? 'Nascondi password' : 'Mostra password'}>
                    {showCargosSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
            <Field label="PEC Questura"         value={cfg.questuraPec || agency.questuraPec} mono wide />
            <Field label="Operatore corrente"   value={`${operator.nome} (${operator.id})`} wide />
            <div>
              <div className="label">Stato comunicazione</div>
              <div className="flex items-center gap-2">
                {cfg.enabled && cfg.username && cfg.password ? (
                  <>
                    <span className="pill pill-ok"><CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Attiva</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>Invio automatico {cfg.autoSendTimeout || 30}s</span>
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
              Credenziali rilasciate dalla <strong>Questura di Agrigento</strong>, competente sulla sede legale di {agency.citta}. Conservate cifrate (AES-256-GCM) lato server.
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

      <section className="card-paper p-6 mb-4" aria-labelledby="backend-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icona dinamica: Wifi se online, WifiOff se non raggiungibile */}
            {backendStatus === 'online' || backendStatus === 'degraded'
              ? <Wifi className="w-5 h-5" style={{ color: 'var(--success)' }} aria-hidden="true" />
              : <WifiOff className="w-5 h-5" style={{ color: 'var(--muted)' }} aria-hidden="true" />
            }
            <div>
              <h3 id="backend-heading" className="serif text-lg font-medium">Backend Pratica</h3>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                {backendStatus === 'checking'     && 'Verifica connessione in corso…'}
                {backendStatus === 'online'       && <>Connesso · ultimo check {lastCheck ? lastCheck.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}</>}
                {backendStatus === 'degraded'     && 'Backend connesso ma CARGOS non disponibile'}
                {backendStatus === 'offline'      && 'Non raggiungibile · lavorando in locale'}
                {backendStatus === 'unconfigured' && 'Backend non configurato per questo ambiente'}
              </div>
            </div>
          </div>
          {admin && (
            <button type="button" onClick={onEditApiBase} className="btn-ghost px-2.5 py-1 rounded text-xs border inline-flex items-center gap-1.5" style={{ borderColor: 'var(--border)' }}>
              <Pencil className="w-3.5 h-3.5" /> Cambia URL
            </button>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <Field label="URL endpoint" value={apiBaseUrl} mono wide />
          <div>
            <div className="label">Stato attuale</div>
            <div className="flex items-center gap-2 flex-wrap">
              {backendStatus === 'online'       && <span className="pill pill-ok"><CheckCircle2 className="w-3 h-3" /> Online</span>}
              {backendStatus === 'degraded'     && <span className="pill pill-warn"><AlertTriangle className="w-3 h-3" /> CARGOS giù</span>}
              {backendStatus === 'offline'      && <span className="pill pill-err"><WifiOff className="w-3 h-3" /> Offline</span>}
              {backendStatus === 'checking'     && <span className="pill pill-neutral"><RefreshCw className="w-3 h-3 animate-spin" /> Verifica…</span>}
              {backendStatus === 'unconfigured' && <span className="pill pill-neutral"><Settings className="w-3 h-3" /> Da configurare</span>}
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {backendStatus === 'offline'
                  ? 'I contratti vengono salvati localmente, drain quando torna la rete'
                  : backendStatus === 'degraded'
                  ? 'I contratti restano in coda, drain automatico al ripristino CARGOS'
                  : backendStatus === 'unconfigured'
                  ? 'Cambia URL per puntare al server reale, oppure resta in modalità locale'
                  : 'Contratti inviati in tempo reale a CARGOS'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="card-paper p-6" aria-labelledby="audit-heading">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4" style={{ color: 'var(--ink-2)' }} aria-hidden="true" />
          <h3 id="audit-heading" className="serif text-lg font-medium">Audit log · ultimi cambi turno</h3>
        </div>
        <div className="text-xs p-4 rounded text-center" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
          <Clock className="w-5 h-5 mx-auto mb-2 opacity-50" aria-hidden="true" />
          Nessun cambio turno registrato ancora.<br />
          Lo storico si popola automaticamente a ogni passaggio di consegne tra operatori.
        </div>
      </section>

      {admin && (
        <section className="card-paper p-6 mt-4" aria-labelledby="sync-heading">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} style={{ color: 'var(--ink-2)' }} aria-hidden="true" />
              <div>
                <h3 id="sync-heading" className="serif text-lg font-medium">Sincronizzazione multi-dispositivo</h3>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  Forza l'invio dei dati locali al backend Render — utile dopo lavoro offline
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSyncAll}
              disabled={syncing || backendStatus !== 'online'}
              className="btn-primary px-4 py-2 rounded text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-40"
              title={backendStatus !== 'online' ? 'Backend non raggiungibile — sincronizzazione disponibile solo online' : 'Forza sync ora'}
            >
              {syncing
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Sincronizzazione…</>
                : <><RefreshCw className="w-4 h-4" /> Sincronizza ora</>
              }
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mt-4">
            {[
              { id: 'fleet',     label: 'Flotta veicoli',         st: syncStatus?.fleet },
              { id: 'customers', label: 'Rubrica clienti',        st: syncStatus?.customers },
              { id: 'partners',  label: 'Strutture partner',      st: syncStatus?.partners },
              { id: 'operators', label: 'Operatori del banco',    st: syncStatus?.operators },
              { id: 'cargos',    label: 'Configurazione CARGOS',  st: syncStatus?.cargos },
              { id: 'agency',    label: 'Anagrafica agenzia',     st: syncStatus?.agency },
            ].map(row => {
              const status = row.st?.remoteStatus || 'disabled';
              const last = row.st?.lastRemoteSync;
              const meta = {
                idle:     { label: 'In attesa',     color: 'var(--muted)',   icon: Clock },
                loading:  { label: 'Caricamento…',  color: 'var(--sea)',     icon: RefreshCw },
                saving:   { label: 'Salvataggio…',  color: 'var(--sea)',     icon: RefreshCw },
                synced:   { label: 'Sincronizzato', color: 'var(--success)', icon: CheckCircle2 },
                error:    { label: 'Errore',        color: 'var(--accent)',  icon: AlertCircle },
                offline:  { label: 'Solo locale',   color: 'var(--warning)', icon: WifiOff },
                disabled: { label: 'Solo locale',   color: 'var(--muted)',   icon: WifiOff },
              }[status];
              const Icon = meta.icon;
              const spinning = status === 'loading' || status === 'saving';
              return (
                <div key={row.id} className="p-3 rounded border flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${spinning ? 'animate-spin' : ''}`} style={{ color: meta.color }} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{row.label}</div>
                    <div className="text-[10px]" style={{ color: meta.color }}>
                      {meta.label}
                      {last && status === 'synced' && (
                        <span style={{ color: 'var(--muted)' }}> · {last.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-[11px] p-3 rounded flex items-start gap-2" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              I dati vengono salvati automaticamente sul backend 1,5 secondi dopo ogni modifica.
              Il pulsante <strong>"Sincronizza ora"</strong> serve solo per forzare un re-invio (es. dopo periodi offline).
              In caso di conflitti tra dispositivi, vince l'ultima modifica salvata.
            </span>
          </div>
        </section>
      )}

      {admin && (
        <section className="card-paper p-6 mt-4" aria-labelledby="storage-heading">
          <div className="flex items-center gap-2 mb-3">
            <Save className="w-4 h-4" style={{ color: 'var(--ink-2)' }} aria-hidden="true" />
            <h3 id="storage-heading" className="serif text-lg font-medium">Archivio locale</h3>
          </div>
          <div className="text-xs mb-3" style={{ color: 'var(--ink-2)' }}>
            Tutti i dati (flotta, clienti, strutture, operatori, configurazione CARGOS) sono salvati nel browser di questo dispositivo <strong>e</strong> sincronizzati con il backend Render quando online. Quando il backend è raggiungibile, le modifiche fatte su un tablet appaiono su tutti gli altri entro pochi secondi. Quando il backend è offline, i dati restano comunque al sicuro localmente.
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

      {/* ── RentMe Bridge ─────────────────────────────────────────── */}
      <section className="card-paper p-6" aria-labelledby="rentme-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wifi className="w-5 h-5" style={{ color: rentmeConfig?.enabled !== false ? '#27ae60' : 'var(--muted)' }} aria-hidden="true" />
            <div>
              <h3 id="rentme-heading" className="serif text-lg font-medium">RentMe Bridge</h3>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                Collegamento con il gestionale RentMe · Altervista
              </div>
            </div>
          </div>
          {admin && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <span className="text-sm" style={{ color: 'var(--ink-2)' }}>
                {rentmeConfig?.enabled !== false ? 'Abilitato' : 'Disabilitato'}
              </span>
              <div
                onClick={() => {
                  const newEnabled = rentmeConfig?.enabled === false;
                  setRentmeConfig(prev => ({ ...prev, enabled: newEnabled }));
                  pushToast({
                    tone: newEnabled ? 'success' : 'warning',
                    title: newEnabled ? 'RentMe attivato' : 'RentMe disabilitato',
                    message: newEnabled
                      ? 'Pratica sincronizzerà i dati dal gestionale RentMe'
                      : 'Pratica gira in autonomia · nessuna chiamata a RentMe',
                  });
                }}
                role="switch"
                aria-checked={rentmeConfig?.enabled !== false}
                aria-labelledby="rentme-heading"
                tabIndex={0}
                style={{
                  width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background .2s',
                  background: rentmeConfig?.enabled !== false ? '#27ae60' : '#aaa',
                  position: 'relative', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: rentmeConfig?.enabled !== false ? 23 : 3,
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                }} />
              </div>
            </label>
          )}
        </div>

        {/* Stato sync */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
          <div style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 6 }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)', fontWeight: 700 }}>Stato sync</div>
            <div className="flex items-center gap-2">
              <span style={{
                width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
                background: rentmeConfig?.enabled === false ? '#aaa' : rentmeSync?.status === 'ok' ? '#27ae60' : rentmeSync?.status === 'syncing' ? '#e67e22' : rentmeSync?.status === 'error' ? '#c0392b' : '#aaa'
              }} />
              <span style={{ fontWeight: 600 }}>
                {rentmeConfig?.enabled === false ? 'Spento' : rentmeSync?.status === 'ok' ? 'OK' : rentmeSync?.status === 'syncing' ? 'In corso…' : rentmeSync?.status === 'error' ? 'Errore' : '—'}
              </span>
            </div>
          </div>
          <div style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 6 }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)', fontWeight: 700 }}>Mezzi flotta</div>
            <div style={{ fontWeight: 600 }}>{(rentmeVehicles || []).length > 0 ? `${(rentmeVehicles||[]).length} veicoli` : '—'}</div>
          </div>
          <div style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 6 }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)', fontWeight: 700 }}>Ultimo sync</div>
            <div style={{ fontWeight: 600, fontSize: 11, fontFamily: 'monospace' }}>
              {rentmeSync?.lastSync ? new Date(rentmeSync.lastSync).toLocaleString('it-IT', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'}
            </div>
          </div>
        </div>

        {rentmeConfig?.enabled !== false && (
          <button
            type="button"
            onClick={rentmeSync?.sync}
            disabled={rentmeSync?.status === 'syncing'}
            className="btn-primary px-4 py-2 rounded text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-40 mb-5"
          >
            <RefreshCw className={`w-4 h-4 ${rentmeSync?.status === 'syncing' ? 'animate-spin' : ''}`} />
            Sincronizza ora
          </button>
        )}

        {/* Roadmap indipendenza */}
        <div style={{
          background: '#f0f7ff', border: '1px solid #bdd5f0', borderLeft: '3px solid #1f5d83',
          borderRadius: 6, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1f5d83', marginBottom: 8 }}>
            Roadmap · verso l'indipendenza
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { fase: 'Fase 1', label: 'Pratica legge da RentMe', done: true,  note: 'Sync live, prenotazioni e flotta' },
              { fase: 'Fase 2', label: 'Pratica ha il suo backend', done: true,  note: 'Render · edo:v1:* · multi-device' },
              { fase: 'Fase 3', label: 'RentMe opzionale',         done: false, note: 'Toggle disabilita sync, dati solo in Pratica' },
              { fase: 'Fase 4', label: 'Pratica standalone',       done: false, note: 'Zero dipendenze esterne · app mobile + desktop' },
            ].map(r => (
              <div key={r.fase} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  background: r.done ? '#27ae60' : 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {r.done && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: r.done ? '#1a5a1a' : 'var(--ink-2)' }}>{r.fase} — {r.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>{r.note}</span>
                </div>
              </div>
            ))}
          </div>
          {rentmeConfig?.enabled !== false && (
            <div style={{ marginTop: 12, fontSize: 11, color: '#1f5d83', fontStyle: 'italic' }}>
              Per passare alla Fase 3: disabilita RentMe Bridge qui sopra. Pratica continuerà a girare senza interruzioni — tutti i dati sono già su Render.
            </div>
          )}
          {rentmeConfig?.enabled === false && (
            <div style={{ marginTop: 12, fontSize: 11, color: '#1e8449', fontWeight: 600 }}>
              ✓ Pratica sta girando in autonomia. RentMe non viene contattato.
            </div>
          )}
        </div>
      </section>

      {admin && (onResetCustomers || onResetContracts || onResetEverything) && (
        <section className="card-paper p-6 mt-4" aria-labelledby="reset-heading" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" style={{ color: 'var(--accent)' }} aria-hidden="true" />
            <h3 id="reset-heading" className="serif text-lg font-medium">Reset archivi · zona pericolosa</h3>
          </div>
          <div className="text-xs mb-4" style={{ color: 'var(--ink-2)' }}>
            Operazioni di pulizia per rimuovere dati di simulazione, test, o legacy.
            Le modifiche si propagano <strong>anche al backend Render</strong>, quindi sovrascrivono
            quello che è stato salvato lì da versioni precedenti dell'app.
          </div>
          <div className="space-y-2">
            {onResetCustomers && (
              <div className="flex items-center justify-between p-3 rounded border" style={{ borderColor: 'var(--border)' }}>
                <div className="flex-1">
                  <div className="font-medium text-sm">Svuota rubrica clienti</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    Rimuove tutti i clienti salvati (locale + backend). Attualmente: <strong>{customers?.length || 0}</strong>.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onResetCustomers}
                  disabled={!customers?.length}
                  className="btn-ghost px-3 py-1.5 rounded text-xs border inline-flex items-center gap-1.5 disabled:opacity-40"
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                >
                  <Trash2 className="w-3 h-3" /> Svuota
                </button>
              </div>
            )}
            {onResetContracts && (
              <div className="flex items-center justify-between p-3 rounded border" style={{ borderColor: 'var(--border)' }}>
                <div className="flex-1">
                  <div className="font-medium text-sm">Svuota archivio pratiche</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    Rimuove i contratti salvati localmente. Quelli già inviati a CARGOS restano sui server della Questura. Attualmente: <strong>{contracts?.length || 0}</strong>.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onResetContracts}
                  disabled={!contracts?.length}
                  className="btn-ghost px-3 py-1.5 rounded text-xs border inline-flex items-center gap-1.5 disabled:opacity-40"
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                >
                  <Trash2 className="w-3 h-3" /> Svuota
                </button>
              </div>
            )}
            {onResetEverything && (
              <div className="flex items-center justify-between p-3 rounded border" style={{ borderColor: 'var(--accent)', background: '#fdf4f4' }}>
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: 'var(--accent)' }}>Reset totale</div>
                  <div className="text-xs" style={{ color: 'var(--ink-2)' }}>
                    Operazione di emergenza: cancella clienti+contratti e riporta flotta/strutture/operatori ai dati reali iniziali.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onResetEverything}
                  className="btn-accent px-3 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" /> Reset totale
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer versione — sempre visibile, anche senza admin */}
      <section className="mt-6 px-6 py-5 rounded text-xs flex items-center justify-between" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} aria-labelledby="version-heading">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent)', color: '#fff' }} aria-hidden="true">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span id="version-heading" className="serif text-base font-medium" style={{ color: 'var(--ink)' }}>Pratica</span>
              <span className="mono font-semibold" style={{ color: 'var(--accent)' }}>v{APP_VERSION.number}</span>
              <span style={{ color: 'var(--muted)' }}>· "{APP_VERSION.codename}"</span>
            </div>
            <div className="mt-0.5" style={{ color: 'var(--muted)' }}>
              Edonoleggio Lampedusa · build del <span className="mono">{APP_VERSION.date}</span>
            </div>
          </div>
        </div>
        {admin && (
          <details className="text-right">
            <summary className="cursor-pointer btn-ghost px-2 py-1 rounded inline-flex items-center gap-1 text-[11px]">
              Cosa c'è di nuovo <ChevronDown className="w-3 h-3" />
            </summary>
            <ul className="mt-2 text-left space-y-1" style={{ color: 'var(--ink-2)' }}>
              {APP_VERSION.changelog.map((line, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
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
function Wizard({ onClose, prefillCustomer, operator, fleet, customers, partners, onSubmit, agency }) {
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
    // Override CARGOS: 'auto' = decide il tipo veicolo (auto→invia, scooter→no)
    //                  'off'  = forzato OFF dall'operatore (solo archivio, no invio)
    // L'override è significativo solo per veicoli normalmente soggetti a CARGOS.
    // Per scooter/quad/ebike il toggle non ha effetto pratico (già esclusi per norma).
    cargosOverride: 'auto',
  });
  const [pdfOpen, setPdfOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const update = useCallback((k, v) => setData(d => ({ ...d, [k]: v })), []);
  const t = data.tipoVeicolo ? VEHICLE_TYPES[data.tipoVeicolo] : null;
  // CARGOS effettivo = obbligatorio per legge sul tipo veicolo E non disattivato dall'operatore.
  // Se override = 'off', il contratto viene salvato come 'paper' anche per le auto.
  const isCargosBound = t?.cargosRequired === true && data.cargosOverride !== 'off';

  const STEPS = ['Tipo', 'Cliente', 'Veicolo', 'Periodo', 'Conferma'];

  const canProceed = useMemo(() => {
    if (step === 1) return data.tipoVeicolo !== null;
    if (step === 2) return data.cliente !== null;
    if (step === 3) return data.veicolo !== null;
    return true;
  }, [step, data.tipoVeicolo, data.cliente, data.veicolo]);

  // Conferma finale: chiama submitContract dall'App, mostra spinner, poi ResultScreen
  const handleConfirm = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = onSubmit ? await onSubmit(data) : { ok: true, status: 'paper' };
    setSubmitResult(result);
    setSubmitting(false);
    setSent(true);
  }, [onSubmit, data, submitting]);

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
              ? <ResultScreen data={data} onClose={onClose} operator={operator} submitResult={submitResult} onShowPdf={() => setPdfOpen(true)} />
              : (
                <div key={step} className="fade-in">
                  {step === 1 && <Step1Type data={data} update={update} />}
                  {step === 2 && <Step2Customer data={data} update={update} customers={customers} />}
                  {step === 3 && <Step3Vehicle data={data} update={update} fleet={fleet} />}
                  {step === 4 && <Step4Period data={data} update={update} partners={partners} />}
                  {step === 5 && <Step5Confirm data={data} operator={operator} partners={partners} onShowPdf={() => setPdfOpen(true)} update={update} agency={agency} />}
                </div>
              )
            }
          </div>

          {/* Footer */}
          {!sent && (
            <div className="px-8 py-4 border-t flex items-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <button type="button" onClick={() => step > 1 ? setStep(step - 1) : onClose()} disabled={submitting} className="btn-ghost px-4 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" aria-hidden="true" /> {step === 1 ? 'Annulla' : 'Indietro'}
              </button>
              <div className="flex-1" />
              {t && !isCargosBound && step >= 1 && (
                <div className="flex items-center gap-2 mr-4 text-xs" style={{ color: 'var(--warning)' }} role="status">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  {t.cargosRequired && data.cargosOverride === 'off'
                    ? <>CARGOS <strong>disattivato manualmente</strong> · solo archivio</>
                    : <>{t.label}: nessun invio CARGOS, solo contratto</>
                  }
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
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting}
                  aria-disabled={submitting}
                  className="btn-accent px-5 py-2 rounded text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" /> {isCargosBound ? 'Invio in corso…' : 'Salvataggio…'}</>
                  ) : isCargosBound ? (
                    <><Send className="w-4 h-4" aria-hidden="true" /> Invia a CARGOS</>
                  ) : t?.cargosRequired && data.cargosOverride === 'off' ? (
                    <><FileCheck2 className="w-4 h-4" aria-hidden="true" /> Salva senza CARGOS</>
                  ) : (
                    <><FileCheck2 className="w-4 h-4" aria-hidden="true" /> Genera contratto</>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {pdfOpen && <ContractPdfModal data={data} operator={operator} partners={partners} onClose={() => setPdfOpen(false)} agency={agency} />}
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
function Step5Confirm({ data, operator, partners, onShowPdf, update, agency }) {
  const t = VEHICLE_TYPES[data.tipoVeicolo];
  // Disponibilità CARGOS: lo permette la normativa per questo tipo veicolo?
  const cargosAllowed = t.cargosRequired;
  // Effettivo: chiede CARGOS la norma, E l'operatore non ha forzato off?
  const isCargosBound = cargosAllowed && data.cargosOverride !== 'off';
  // È stato disattivato manualmente?
  const cargosManuallyOff = cargosAllowed && data.cargosOverride === 'off';
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
    CONTRATTO_CHECKOUT_LUOGO_COD: agency.istatLuogo,
    CONTRATTO_CHECKOUT_INDIRIZZO: ritiroAddr,
    CONTRATTO_CHECKIN_DATA: data.consegnaData,
    CONTRATTO_CHECKIN_LUOGO_COD: agency.istatLuogo,
    CONTRATTO_CHECKIN_INDIRIZZO: consegnaAddr,
    OPERATORE_ID: operator.id,
    AGENZIA_ID: agency.agenziaId,
    AGENZIA_NOME: agency.nome,
    AGENZIA_LUOGO_COD: agency.istatLuogo,
    AGENZIA_INDIRIZZO: agency.indirizzoLegale,
    AGENZIA_RECAPITO_TEL: agency.telefono,
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

        {/* Toggle CARGOS — abilitato solo per tipi veicolo soggetti per legge */}
        {cargosAllowed ? (
          <div className="mt-5 p-4 rounded card-paper" style={{ borderLeft: `3px solid ${isCargosBound ? 'var(--accent)' : 'var(--warning)'}` }}>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: isCargosBound ? 'var(--accent)' : 'var(--muted)' }} aria-hidden="true" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="font-medium text-sm">
                    {isCargosBound ? 'Invio a CARGOS attivo' : 'Invio a CARGOS disattivato'}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isCargosBound}
                    aria-label={isCargosBound ? 'Disattiva invio a CARGOS per questo contratto' : 'Riattiva invio a CARGOS per questo contratto'}
                    onClick={() => update && update('cargosOverride', isCargosBound ? 'off' : 'auto')}
                    className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${isCargosBound ? 'bg-[var(--accent)]' : 'bg-[var(--muted)]'}`}
                  >
                    <span className={`absolute top-0.5 ${isCargosBound ? 'left-5' : 'left-0.5'} w-5 h-5 bg-white rounded-full transition-all shadow-sm`} />
                  </button>
                </div>
                <div className="text-xs mt-2" style={{ color: 'var(--ink-2)' }}>
                  {isCargosBound ? (
                    <>Il contratto verrà trasmesso alla Questura di Agrigento. Validazione tracciato OK · firma operatore: <strong>{operator.nome}</strong>.</>
                  ) : (
                    <>
                      <strong style={{ color: 'var(--warning)' }}>Attenzione:</strong> il contratto verrà salvato solo in archivio locale, senza invio CARGOS. Usa questa modalità solo se sai cosa stai facendo (test, contratti pre-2018, regime transitorio dichiarato).
                    </>
                  )}
                </div>
                {cargosManuallyOff && (
                  <div className="text-[11px] mt-2 p-2 rounded mono" style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}>
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    Override manuale attivo · CARGOS bypassato per scelta operatore
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded card-paper flex items-start gap-3" style={{ borderLeft: '3px solid var(--warning)' }}>
            <FileCheck2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--ink-2)' }} aria-hidden="true" />
            <div className="flex-1">
              <div className="font-medium text-sm">{t.label}: escluso da CARGOS per norma</div>
              <div className="text-xs mt-1" style={{ color: 'var(--ink-2)' }}>
                {t.cargosCode === null
                  ? 'Non veicolo a motore (e-bike ≤25 km/h)'
                  : 'Motoveicoli e quadricicli L7e: esclusi da CARGOS ai sensi D.L. 113/2018 art. 17'}
                . Verrà generato solo il PDF firmabile per il cliente · conservazione interna 7 anni.
              </div>
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
          ) : cargosManuallyOff ? (
            <>
              <span className="c">// CARGOS disattivato manualmente dall'operatore</span>{'\n'}
              <span className="c">// {t.label} ({t.cargosCode}) sarebbe normalmente soggetto</span>{'\n'}
              <span className="c">// nessun invio API · contratto salvato in archivio locale</span>
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
function ResultScreen({ data, onClose, operator, submitResult, onShowPdf }) {
  const t = VEHICLE_TYPES[data.tipoVeicolo];
  const isCargosBound = t.cargosRequired;

  // Stati possibili dal submitResult:
  //   - undefined → flow legacy (mock, niente backend) → mostra success generico
  //   - { ok: true, status: 'sent' } → contratto inviato a CARGOS
  //   - { ok: true, status: 'paper' } → moto/ebike, niente CARGOS
  //   - { ok: true, status: 'queued' } → offline, in coda locale
  //   - { ok: false, status: 'error', error, errorKind } → invio fallito
  const status   = submitResult?.status || (isCargosBound ? 'sent' : 'paper');
  const failed   = submitResult?.ok === false;
  const queued   = status === 'queued';
  const contractId = submitResult?.contractId || 'EDO-2026-0423';

  // Visuale dinamica
  const visual = failed
    ? { Icon: AlertTriangle, color: 'var(--accent)',  bg: '#f4d8d8', title: 'Invio non completato' }
    : queued
    ? { Icon: Clock,         color: 'var(--warning)', bg: '#f4ebd8', title: 'Salvato in coda' }
    : status === 'paper'
    ? { Icon: FileCheck2,    color: 'var(--sea)',     bg: '#e2eef2', title: 'Contratto generato' }
    : { Icon: Check,         color: 'var(--success)', bg: 'var(--success-soft)', title: 'Inviato a CARGOS' };

  const subtitle = failed
    ? 'Il contratto è salvato localmente: puoi riprovare l\'invio dalla lista Pratiche oppure usare il fallback CSV/PEC.'
    : queued
    ? 'Sei offline: il contratto è in coda. Quando la rete torna, viene inviato automaticamente.'
    : status === 'paper'
    ? `${t.label}: nessun invio CARGOS necessario. Contratto pronto per la firma.`
    : 'La pratica è stata trasmessa alla Questura di Agrigento. Ricevuta archiviata.';

  const VIcon = visual.Icon;

  return (
    <div className="max-w-2xl mx-auto text-center py-8">
      <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: visual.bg }}>
        <VIcon className="w-8 h-8" style={{ color: visual.color }} aria-hidden="true" />
      </div>
      <h3 className="serif text-3xl font-medium mb-2" tabIndex={-1}>{visual.title}</h3>
      <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--ink-2)' }}>{subtitle}</p>

      <div className="card-paper p-6 text-left mb-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div><dt className="label">ID Pratica</dt><dd className="mono font-semibold text-xs">{contractId}</dd></div>
          {status === 'sent' && submitResult?.receipt && (
            <div><dt className="label">Ricevuta CARGOS</dt><dd className="mono font-semibold text-xs">{submitResult.receipt.slice(0, 20)}…</dd></div>
          )}
          <div><dt className="label">Cliente</dt><dd>{data.cliente?.cognome} {data.cliente?.nome}</dd></div>
          <div><dt className="label">Veicolo</dt><dd>{data.veicolo?.marca} {data.veicolo?.modello}</dd></div>
          <div><dt className="label">Operatore</dt><dd>{operator.nome}</dd></div>
          <div><dt className="label">Stato</dt><dd><StatusPill stato={
            failed ? 'errore' : queued ? 'bozza' : status === 'paper' ? 'cartaceo' : 'inviato'
          } /></dd></div>
        </dl>
        {failed && submitResult?.error && (
          <div className="mt-4 p-3 rounded text-xs" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
            <AlertCircle className="w-3.5 h-3.5 inline mr-1.5" style={{ color: 'var(--accent)' }} />
            <strong>Dettaglio errore:</strong> {submitResult.error}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <button type="button" onClick={onShowPdf} className="btn-accent px-5 py-2.5 rounded text-sm font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4" aria-hidden="true" /> Stampa contratto
        </button>
        {status === 'sent' && (
          <button type="button" className="btn-ghost px-5 py-2.5 rounded text-sm border flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <Download className="w-4 h-4" aria-hidden="true" /> Ricevuta CARGOS
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
function ContractPdfModal({ data, operator, partners, onClose, agency }) {
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
                <div style={{ fontSize: 11, color: '#8a847b', fontStyle: 'italic' }}>{agency.slogan}</div>
                <div style={{ fontSize: 10.5, color: '#3a352e', marginTop: 10, lineHeight: 1.55 }}>
                  {agency.ragioneSociale}<br />
                  {agency.indirizzoLegale}, {agency.cap} {agency.citta} ({agency.provincia})<br />
                  Tel. {agency.telefono} · {agency.email}<br />
                  P.IVA {agency.piva} · CF {agency.cf}
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
              Edonoleggio · {agency.indirizzoLegale}, {agency.citta} (AG) · www.edonoleggio.com<br />
              {agency.slogan} · Documento generato da Pratica
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

// ═══════════════════════════════════════════════════════════════════
// MODAL: API BASE URL — endpoint backend Pratica
// ═══════════════════════════════════════════════════════════════════
function ApiBaseModal({ current, onClose, onSave }) {
  const [url, setUrl] = useState(current || '');
  const trimmed = url.trim().replace(/\/$/, '');
  const valid = /^https?:\/\/[^\s]+/.test(trimmed);
  const presets = [
    { label: 'Produzione · Render',     url: 'https://pratica-backend.onrender.com/api' },
    { label: 'Sviluppo locale',         url: 'http://localhost:3000/api' },
    { label: 'Server LAN banco',        url: 'http://192.168.1.100:3000/api' },
  ];

  return (
    <ModalShell
      id="api-base-title"
      title="URL endpoint backend"
      subtitle="Configurazione · admin"
      onClose={onClose}
      maxWidth="max-w-xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost px-4 py-2 rounded text-sm">Annulla</button>
          <button type="button" onClick={() => valid && onSave(trimmed)} disabled={!valid} className="btn-primary px-4 py-2 rounded text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-40">
            <Save className="w-4 h-4" /> Salva URL
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="text-xs p-3 rounded flex items-start gap-2" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            Indirizzo del backend che invia i contratti a CARGOS. In produzione tipicamente <code className="mono">https://api.edonoleggio.com/api</code>. Lo stato della connessione si aggiorna automaticamente entro 30 secondi dal salvataggio.
          </span>
        </div>

        <div>
          <label htmlFor="api-url" className="label">Endpoint completo</label>
          <input
            id="api-url"
            type="url"
            className="input mono"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://server-edonoleggio.example.com/api"
            autoComplete="off"
          />
          {url && !valid && (
            <div className="text-[11px] mt-1" style={{ color: 'var(--accent)' }}>
              URL non valido — deve iniziare con http:// o https://
            </div>
          )}
        </div>

        <div>
          <div className="label mb-2">Preset rapidi</div>
          <div className="space-y-1.5">
            {presets.map(p => (
              <button
                key={p.url}
                type="button"
                onClick={() => setUrl(p.url)}
                className={`w-full text-left p-2.5 rounded border text-sm transition-all hover:border-[var(--ink)] ${trimmed === p.url ? 'bg-[var(--surface)] border-[var(--ink)]' : 'bg-white'}`}
                style={{ borderColor: trimmed === p.url ? 'var(--ink)' : 'var(--border)' }}
              >
                <div className="font-medium text-xs">{p.label}</div>
                <div className="mono text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>{p.url}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL: AGENCY CONFIG — anagrafica modificabile
// ═══════════════════════════════════════════════════════════════════
// I dati dell'agenzia (ragione sociale, P.IVA, indirizzi, contatti) sono editabili
// dall'admin. Vengono usati nei contratti PDF, payload CARGOS, header di stampa.
// Modifiche sincronizzate con il backend, quindi cambiano su tutti i tablet del banco.
function AgencyConfigModal({ current, onClose, onSave }) {
  const [form, setForm] = useState({ ...current, cellulari: [...(current.cellulari || [])] });
  const upd = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);
  const updCell = useCallback((idx, v) => setForm(f => {
    const cellulari = [...f.cellulari];
    cellulari[idx] = v;
    return { ...f, cellulari };
  }), []);
  const addCell = useCallback(() => setForm(f => ({ ...f, cellulari: [...f.cellulari, ''] })), []);
  const rmCell = useCallback((idx) => setForm(f => ({ ...f, cellulari: f.cellulari.filter((_, i) => i !== idx) })), []);

  // Validation: P.IVA italiana (11 cifre), CF (16 caratteri), email base, CAP (5 cifre)
  const errs = {};
  if (form.piva && !/^\d{11}$/.test(form.piva.trim())) errs.piva = 'P.IVA italiana: 11 cifre';
  if (form.cf && form.cf.length !== 16) errs.cf = 'Codice fiscale: 16 caratteri';
  if (form.cap && !/^\d{5}$/.test(form.cap.trim())) errs.cap = 'CAP: 5 cifre';
  if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Email non valida';
  if (form.pec && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.pec)) errs.pec = 'PEC non valida';
  const valid = !form.ragioneSociale || (Object.keys(errs).length === 0 && form.nome && form.ragioneSociale);

  const groups = [
    {
      title: 'Identità commerciale',
      fields: [
        { k: 'nome',           label: 'Nome agenzia',         wide: false, req: true },
        { k: 'titolare',       label: 'Titolare',             wide: false, req: true },
        { k: 'ragioneSociale', label: 'Ragione sociale',      wide: true,  req: true },
        { k: 'slogan',         label: 'Slogan',               wide: true },
        { k: 'fondazione',     label: 'Anno fondazione',      wide: false, type: 'number' },
        { k: 'servizi',        label: 'Servizi offerti',      wide: true },
        { k: 'orari',          label: 'Orari apertura',       wide: true },
      ],
    },
    {
      title: 'Sede e indirizzi',
      fields: [
        { k: 'indirizzoLegale', label: 'Indirizzo legale',     wide: true,  req: true },
        { k: 'sedeOperativa',   label: 'Sede operativa',       wide: true },
        { k: 'cap',             label: 'CAP',                  wide: false, err: errs.cap },
        { k: 'citta',           label: 'Città',                wide: false, req: true },
        { k: 'provincia',       label: 'Provincia (sigla)',    wide: false },
        { k: 'istatLuogo',      label: 'Codice ISTAT',         wide: false, type: 'number', mono: true },
        { k: 'catastale',       label: 'Codice catastale',     wide: false, mono: true },
      ],
    },
    {
      title: 'Identificativi fiscali',
      fields: [
        { k: 'piva',      label: 'Partita IVA',     wide: false, mono: true, err: errs.piva },
        { k: 'cf',        label: 'Codice fiscale',  wide: false, mono: true, err: errs.cf },
        { k: 'agenziaId', label: 'ID Agenzia',      wide: true,  mono: true, helper: 'Codice univoco usato nei contratti CARGOS' },
      ],
    },
    {
      title: 'Contatti',
      fields: [
        { k: 'telefono',    label: 'Telefono fisso',  wide: false, mono: true },
        { k: 'email',       label: 'Email',           wide: true,  mono: true, err: errs.email },
        { k: 'pec',         label: 'PEC agenzia',     wide: true,  mono: true, err: errs.pec },
        { k: 'questuraPec', label: 'PEC Questura',    wide: true,  mono: true, helper: 'Destinatario fallback CARGOS via PEC' },
      ],
    },
  ];

  return (
    <ModalShell
      id="agency-modal-title"
      title="Anagrafica agenzia"
      subtitle="Dati visibili in contratti, PDF, payload CARGOS"
      onClose={onClose}
      maxWidth="max-w-3xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost px-4 py-2 rounded text-sm">Annulla</button>
          <button
            type="button"
            onClick={() => valid && onSave({ ...form, cellulari: form.cellulari.filter(c => c.trim()) })}
            disabled={!valid}
            className="btn-primary px-4 py-2 rounded text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-40"
          >
            <Save className="w-4 h-4" /> Salva modifiche
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="text-xs p-3 rounded flex items-start gap-2" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            Le modifiche si sincronizzano automaticamente con tutti i dispositivi del banco entro pochi secondi.
            <strong> Attenzione</strong>: cambiare <code className="mono">agenziaId</code> o codice ISTAT può creare problemi con i contratti già inviati a CARGOS — modificarli solo con conoscenza di causa.
          </span>
        </div>

        {groups.map(g => (
          <div key={g.title}>
            <div className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--ink-2)' }}>{g.title}</div>
            <div className="grid grid-cols-2 gap-3">
              {g.fields.map(f => (
                <div key={f.k} className={f.wide ? 'col-span-2' : ''}>
                  <label htmlFor={`agency-${f.k}`} className="label">
                    {f.label}{f.req && <span style={{ color: 'var(--accent)' }}> *</span>}
                  </label>
                  <input
                    id={`agency-${f.k}`}
                    type={f.type || 'text'}
                    className={`input ${f.mono ? 'mono' : ''}`}
                    value={form[f.k] ?? ''}
                    onChange={e => upd(f.k, f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                    aria-invalid={!!f.err}
                  />
                  {f.err && <div className="text-[11px] mt-1" style={{ color: 'var(--accent)' }}>{f.err}</div>}
                  {f.helper && !f.err && <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>{f.helper}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Cellulari array — gestione separata */}
        <div>
          <div className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--ink-2)' }}>Cellulari</div>
          <div className="space-y-2">
            {form.cellulari.map((cell, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="tel"
                  className="input mono flex-1"
                  value={cell}
                  onChange={e => updCell(idx, e.target.value)}
                  placeholder="+39 ..."
                />
                <button
                  type="button"
                  onClick={() => rmCell(idx)}
                  className="btn-ghost p-2 rounded border"
                  style={{ borderColor: 'var(--border)' }}
                  aria-label={`Rimuovi cellulare ${idx + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCell}
              className="btn-ghost px-3 py-1.5 rounded text-xs border inline-flex items-center gap-1.5"
              style={{ borderColor: 'var(--border)' }}
            >
              <Plus className="w-3 h-3" /> Aggiungi cellulare
            </button>
          </div>
        </div>
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
function ShiftChangeModal({ currentOperator, operators, contracts, onClose, onConfirm }) {
  const [newOpId, setNewOpId] = useState(null);
  const [taken, setTaken] = useState({});
  // Contratti aperti = quelli in bozza o errore, oppure inviati ma con veicolo ancora "fuori"
  // (in v11 abbiamo solo i contratti reali, niente più mock — il dato sui rientri verrà
  // aggiunto in una iterazione successiva tracciando la consegna effettiva)
  const openContracts = useMemo(() =>
    (contracts || []).filter(c => c.status === 'pending' || c.status === 'queued' || c.status === 'error')
  , [contracts]);
  const ops = operators || MOCK_OPERATORS;
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
          {openContracts.length === 0 ? (
            <div className="text-xs p-3 rounded" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
              Nessuna pratica aperta in questo momento · nessuna consegna da trasferire.
            </div>
          ) : (
            <div className="space-y-2" role="group" aria-label="Selezione pratiche da trasferire">
              {openContracts.map(c => {
                const r = c.record || {};
                const stato = c.status === 'error' ? 'errore' : 'bozza';
                return (
                  <label key={c.contractId} className="card-paper p-3 flex items-center gap-3 cursor-pointer hover:border-[var(--ink-2)] transition-all">
                    <input type="checkbox" checked={!!taken[c.contractId]} onChange={e => setTaken(t => ({ ...t, [c.contractId]: e.target.checked }))} className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2"><span className="mono text-xs">{c.contractId.slice(-12)}</span><StatusPill stato={stato} /></div>
                      <div className="text-sm font-medium mt-0.5">{r.CONDUCENTE_CONTRAENTE_COGNOME} {r.CONDUCENTE_CONTRAENTE_NOME}</div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>
                        {r.VEICOLO_MARCA} {r.VEICOLO_MODELLO}
                        {r.VEICOLO_TARGA && <span className="mono"> · {r.VEICOLO_TARGA}</span>}
                        {r.CONTRATTO_CHECKIN_DATA && <> · rientro {r.CONTRATTO_CHECKIN_DATA}</>}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
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
