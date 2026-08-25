
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
ArchiveRestore,
BadgeCheck,
BookOpenText,
Camera,
ChevronLeft,
ChevronRight,
Download,
ExternalLink,
History,
LibraryBig,
ScanSearch,
Sparkles,
Upload,
X,
} from "lucide-react";

// ── Palette & global styles injected once ──────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
--gold: #c9a84c;
--gold2: #e8c97a;
--deep: #1a1008;
--panel: #231a0e;

--border: #3d2e14;
--text: #f0e6ce;
--muted: #9e8a6a;
--red: #8b2020;
--glow: rgba(201,168,76,0.18);
}

body { background: var(--deep); color: var(--text); font-family: 'EB Garamond', serif; }

.app-wrap {
min-height: 100vh;
background:
radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,168,76,0.12) 0%, transparent 70%),
repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.015) 40px),
repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.015) 40px),
var(--deep);

padding: 0 0 60px;
}

/* ── Header ── */
.halo-header {
text-align: center;
padding: 44px 20px 32px;
position: relative;
}
.halo-header::after {
content: '';
display: block;
margin: 24px auto 0;
width: 240px; height: 1px;
background: linear-gradient(90deg, transparent, var(--gold), transparent);
}
.halo-header .crown {
font-size: 13px;
letter-spacing: 6px;

color: var(--gold);
text-transform: uppercase;
margin-bottom: 10px;
opacity: 0.8;
}
.halo-header h1 {
font-family: 'Cinzel', serif;
font-size: clamp(26px, 5vw, 42px);
font-weight: 700;
color: var(--gold2);
letter-spacing: 2px;
text-shadow: 0 0 40px rgba(201,168,76,0.4);
line-height: 1.15;
}
.halo-header p {
margin-top: 12px;
color: var(--muted);
font-style: italic;
font-size: 17px;
}


/* ── Tab nav ── */
.tab-row {
display: flex;
justify-content: center;
gap: 4px;
padding: 0 20px 32px;
}
.tab-btn {
font-family: 'Cinzel', serif;
font-size: 13px;
letter-spacing: 1.5px;
padding: 9px 22px;
border: 1px solid var(--border);
background: transparent;
color: var(--muted);
cursor: pointer;
transition: all .25s;
}
.tab-btn:hover { color: var(--gold); border-color: 

var(--gold); }
.tab-btn.active {
background: linear-gradient(135deg, rgba(201,168,76,0.18), rgba(201,168,76,0.06));
color: var(--gold2);
border-color: var(--gold);
box-shadow: 0 0 18px rgba(201,168,76,0.12);
}

/* ── Cards ── */
.card {
background: linear-gradient(145deg, var(--panel), #1c1309);
border: 1px solid var(--border);
border-radius: 2px;
box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,76,0.08);
}

/* ── Upload zone ── */

.upload-zone {
border: 1.5px dashed var(--border);
border-radius: 2px;
padding: 48px 24px;
text-align: center;
cursor: pointer;
transition: all .3s;
background: rgba(0,0,0,0.2);
position: relative;
overflow: hidden;
}
.upload-zone:hover, .upload-zone.drag { border-color: var(--gold); background: var(--glow); }
.upload-zone .uz-icon { font-size: 44px; margin-bottom: 12px; opacity: 0.6; }
.upload-zone .uz-title {
font-family: 'Cinzel', serif;
font-size: 15px;
color: var(--gold);
letter-spacing: 1px;

}
.upload-zone .uz-sub { margin-top: 6px; font-size: 14px; color: var(--muted); font-style: italic; }

/* ── Preview image ── */
.img-preview-wrap {
position: relative;
display: inline-block;
margin: 0 auto;
}
.img-preview {
max-width: 100%;
max-height: 320px;
display: block;
border: 1px solid var(--border);
box-shadow: 0 0 30px rgba(201,168,76,0.15);
}
.img-preview-wrap .clear-btn {
position: absolute;
top: -10px; right: -10px;

background: var(--red);
border: none;
color: #fff;
width: 26px; height: 26px;
border-radius: 50%;
font-size: 14px;
cursor: pointer;
display: flex; align-items: center; justify-content: center;
box-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

/* ── Buttons ── */
.btn-gold {
font-family: 'Cinzel', serif;
font-size: 13px;
letter-spacing: 2px;
padding: 12px 32px;
background: linear-gradient(135deg, #c9a84c, #a8813a);

border: none;
color: var(--deep);
cursor: pointer;
font-weight: 700;
transition: all .25s;
box-shadow: 0 4px 18px rgba(201,168,76,0.25);
}
.btn-gold:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(201,168,76,0.4); }
.btn-gold:disabled { opacity: 0.4; transform: none; cursor: not-allowed; }
.btn-ghost {
font-family: 'Cinzel', serif;
font-size: 12px;
letter-spacing: 1.5px;
padding: 10px 22px;
background: transparent;
border: 1px solid var(--border);
color: var(--muted);
cursor: pointer;

transition: all .2s;
}
.btn-ghost:hover { border-color: var(--gold); color: var(--gold); }

/* ── Saint profile ── */
.saint-profile {
animation: fadeUp .5s ease both;
}
@keyframes fadeUp {
from { opacity: 0; transform: translateY(16px); }
to { opacity: 1; transform: translateY(0); }
}
.saint-name {
font-family: 'Cinzel', serif;
font-size: clamp(22px, 4vw, 34px);
color: var(--gold2);
letter-spacing: 1.5px;
text-shadow: 0 0 30px rgba(201,168,76,0.3);
}

.feast-badge {
display: inline-block;
margin-top: 6px;
padding: 4px 14px;
border: 1px solid var(--gold);
font-size: 13px;
color: var(--gold);
letter-spacing: 1px;
font-family: 'Cinzel', serif;
}
.info-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
gap: 16px;
margin-top: 20px;
}
.info-cell {
background: rgba(0,0,0,0.2);
border: 1px solid var(--border);

padding: 14px;
}
.info-cell .ic-label {
font-size: 10px;
letter-spacing: 2px;
text-transform: uppercase;
color: var(--gold);
margin-bottom: 6px;
font-family: 'Cinzel', serif;
}
.info-cell .ic-val {
font-size: 15px;
color: var(--text);
font-style: italic;
}
.bio-text {
font-size: 16px;
line-height: 1.85;
color: #d4c4a8;
margin-top: 20px;

border-left: 2px solid var(--gold);
padding-left: 18px;
}
.attrib-list {
display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;
}
.attrib-tag {
padding: 4px 12px;
background: rgba(201,168,76,0.1);
border: 1px solid rgba(201,168,76,0.25);
font-size: 13px;
color: var(--gold2);
border-radius: 1px;
}
.confidence-bar-wrap { margin-top: 18px; }
.cb-label { font-size: 12px; letter-spacing: 1px; color: var(--muted); margin-bottom: 6px; font-family: 'Cinzel', serif; }
.cb-track {

height: 4px; background: var(--border); border-radius: 2px; overflow: hidden;
}
.cb-fill {
height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold2));
border-radius: 2px; transition: width 1s ease;
}

/* ── Loading halo ── */
.loading-halo {
display: flex; flex-direction: column; align-items: center; gap: 18px;
padding: 40px 0;
}
.halo-ring {
width: 64px; height: 64px;
border-radius: 50%;
border: 2px solid var(--border);
border-top-color: var(--gold);

animation: spin 1.2s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-halo p { color: var(--muted); font-style: italic; font-size: 15px; }

/* ── Training tab ── */
.train-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
gap: 14px;
margin-top: 20px;
}
.train-item {
border: 1px solid var(--border);
background: rgba(0,0,0,0.2);
padding: 10px;
text-align: center;

position: relative;
}
.train-item img { width: 100%; height: 110px; object-fit: cover; border: 1px solid var(--border); }
.train-item .ti-name {
margin-top: 8px;
font-family: 'Cinzel', serif;
font-size: 11px;
color: var(--gold);
letter-spacing: 0.5px;
word-break: break-word;
}
.train-item .ti-del {
position: absolute; top: 4px; right: 4px;
background: var(--red); border: none; color: #fff;
width: 20px; height: 20px; font-size: 11px;
cursor: pointer; border-radius: 50%;
display: flex; align-items: center; justify-content: center;
}


/* ── Dividers ── */
.gold-rule {
border: none;
border-top: 1px solid var(--border);
margin: 24px 0;
position: relative;
}
.gold-rule::before {
content: '✦';
position: absolute; top: -9px; left: 50%;
transform: translateX(-50%);
background: var(--panel);
padding: 0 10px;
color: var(--gold);
font-size: 12px;
}

/* ── Responsive container ── */
.container { max-width: 780px; margin: 0 auto; 

padding: 0 20px; }

/* ── Error ── */
.err-box {
background: rgba(139,32,32,0.15);
border: 1px solid var(--red);
padding: 14px 18px;
color: #e08080;
font-size: 14px;
border-radius: 1px;
}

/* ── Camera ── */
.camera-wrap { position: relative; }
.camera-wrap video { width: 100%; border: 1px solid var(--border); display: block; }
.camera-overlay {
position: absolute; inset: 0;
border: 3px solid rgba(201,168,76,0.4);
pointer-events: none;

}
.camera-overlay::before, .camera-overlay::after {
content: '';
position: absolute;
width: 20px; height: 20px;
border-color: var(--gold);
border-style: solid;
}
.camera-overlay::before { top: 10px; left: 10px; border-width: 2px 0 0 2px; }
.camera-overlay::after { bottom: 10px; right: 10px; border-width: 0 2px 2px 0; }

/* ── History ── */
.history-row {
display: flex; align-items: center; gap: 14px;
padding: 12px;
border: 1px solid var(--border);
background: rgba(0,0,0,0.2);
cursor: pointer;

transition: all .2s;
margin-bottom: 10px;
}
.history-row:hover { border-color: var(--gold); background: var(--glow); }
.history-row img { width: 52px; height: 52px; object-fit: cover; border: 1px solid var(--border); }
.history-row .hr-name { font-family: 'Cinzel', serif; font-size: 14px; color: var(--gold2); }
.history-row .hr-feast { font-size: 13px; color: var(--muted); font-style: italic; margin-top: 2px; }

/* ── Product refresh ── */
:root {
--gold: #d1a34d;
--gold2: #f2d58e;
--deep: #071b19;
--panel: #102925;
--border: #315249;
--text: #edf0df;
--muted: #9eb4a5;
--red: #a94442;
--glow: rgba(209,163,77,0.14);
--teal: #69a99a;
}

body { background: var(--deep); }
.app-wrap {
background:
linear-gradient(180deg, rgba(7,27,25,0.78), rgba(7,27,25,0.98)),
repeating-linear-gradient(90deg, transparent 0, transparent 39px, rgba(155,202,184,0.035) 40px),
repeating-linear-gradient(0deg, transparent 0, transparent 39px, rgba(155,202,184,0.028) 40px),
#071b19;
padding: 24px 0 48px;
}
.container { max-width: 1060px; padding: 0 24px; }
.halo-header {
display: grid;
grid-template-columns: 1fr auto 1fr;
align-items: center;
gap: 24px;
padding: 22px 0 28px;
text-align: left;
}
.halo-header::after { display: none; }
.halo-header .crown { grid-column: 2; grid-row: 1; margin: 0; font-size: 10px; letter-spacing: 3px; text-align: center; }
.halo-header h1 { grid-column: 2; grid-row: 2; font-size: clamp(28px, 4vw, 40px); letter-spacing: 1px; text-align: center; white-space: nowrap; }
.halo-header .header-subtitle { grid-column: 2; grid-row: 3; margin: 0; font-size: 15px; text-align: center; }
.header-status {
grid-column: 3; grid-row: 2; justify-self: end; display: inline-flex; align-items: center; gap: 8px;
color: var(--muted); font-size: 13px; font-style: italic;
}
.header-status::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 0 4px rgba(105,169,154,0.12); }
.tab-row {
justify-content: stretch; gap: 0; padding: 0; margin-bottom: 22px;
border: 1px solid var(--border); background: rgba(9,35,31,0.82); border-radius: 5px; overflow: hidden;
}
.tab-btn { flex: 1; min-height: 48px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 0; border-right: 1px solid var(--border); font-size: 11px; letter-spacing: 1px; padding: 10px 14px; }
.tab-btn:last-child { border-right: 0; }
.tab-btn.active { background: rgba(209,163,77,0.13); box-shadow: inset 0 -2px 0 var(--gold); color: var(--gold2); }
.tab-btn:hover { background: rgba(105,169,154,0.08); }
.card { border-radius: 6px; background: linear-gradient(145deg, rgba(20,48,43,0.98), rgba(10,31,28,0.98)); border-color: #345a4f; box-shadow: 0 18px 50px rgba(0,0,0,0.28), inset 0 1px 0 rgba(242,213,142,0.07); }
.workspace-card { padding: 32px !important; }
.view-heading { display: flex; align-items: center; gap: 10px; color: var(--gold2); font-family: 'Cinzel', serif; font-size: 19px; letter-spacing: 1px; margin-bottom: 6px; }
.view-copy { color: var(--muted); font-size: 15px; font-style: italic; line-height: 1.5; margin-bottom: 24px; max-width: 680px; }
.subpanel { border: 1px solid rgba(158,180,165,0.22); padding: 18px; background: rgba(2,18,16,0.28); margin-bottom: 20px; border-radius: 4px; }
.subpanel-title { color: var(--gold); font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 1.4px; margin-bottom: 12px; }
.action-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.upload-zone { min-height: 280px; display: grid; place-items: center; align-content: center; gap: 8px; border-radius: 5px; border-color: #496d60; background: rgba(5,26,23,0.45); }
.upload-zone:hover, .upload-zone.drag { border-color: var(--gold); background: rgba(209,163,77,0.08); }
.upload-zone .uz-icon { display: grid; place-items: center; width: 54px; height: 54px; margin: 0 0 8px; border: 1px solid rgba(209,163,77,0.45); border-radius: 50%; color: var(--gold2); }
.upload-zone .uz-title { font-size: 14px; letter-spacing: 1.3px; }
.upload-zone .uz-sub { font-size: 14px; }
.btn-gold, .btn-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 4px; min-height: 42px; }
.btn-gold { background: #d5ad59; color: #10201c; box-shadow: none; }
.btn-gold:hover { background: #ecd184; box-shadow: none; }
.btn-ghost { border-color: #52766b; color: #c0d1c2; }
.btn-ghost:hover { background: rgba(105,169,154,0.1); border-color: var(--teal); color: #e6efe5; }
.img-preview { border-radius: 4px; border-color: #52766b; max-height: 420px; }
.img-preview-wrap .clear-btn { display: grid; place-items: center; background: #a94442; border-radius: 4px; width: 30px; height: 30px; }
.camera-wrap { padding: 14px; border: 1px solid #41675c; border-radius: 5px; background: rgba(3,20,18,0.5); }
.camera-wrap video { border-radius: 3px; border-color: #52766b; }
.camera-overlay { border-color: rgba(209,163,77,0.6); }
.loading-halo { padding: 54px 0; }
.halo-ring { width: 48px; height: 48px; border-width: 3px; }
.gold-rule { border-color: rgba(158,180,165,0.22); }
.gold-rule::before { background: #102925; color: var(--gold); }
.saint-profile { max-width: 820px; margin: 0 auto; }
.saint-name { font-size: clamp(26px, 4vw, 36px); }
.feast-badge { border-radius: 999px; border-color: rgba(209,163,77,0.7); background: rgba(209,163,77,0.1); padding: 6px 13px; }
.info-grid { grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; }
.info-cell { border-radius: 4px; background: rgba(3,20,18,0.35); border-color: rgba(158,180,165,0.2); }
.bio-text { border-left-color: var(--teal); color: #d9e1d4; }
.attrib-tag { border-radius: 999px; border-color: rgba(105,169,154,0.35); background: rgba(105,169,154,0.09); color: #d2e1d5; }
.confidence-bar-wrap { padding: 14px; background: rgba(3,20,18,0.25); border: 1px solid rgba(158,180,165,0.16); border-radius: 4px; }
.cb-track { height: 6px; background: #24433a; }
.cb-fill { background: linear-gradient(90deg, var(--teal), var(--gold2)); }
.candidate-panel { margin-top: 12px; border: 1px solid rgba(158,180,165,0.16); background: rgba(3,20,18,0.22); border-radius: 4px; overflow: hidden; }
.candidate-heading { padding: 10px 13px; color: var(--muted); font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 1.4px; border-bottom: 1px solid rgba(158,180,165,0.12); }
.candidate-row { display: grid; grid-template-columns: 30px 1fr auto; align-items: center; gap: 10px; padding: 9px 13px; border-bottom: 1px solid rgba(158,180,165,0.09); }
.candidate-row:last-child { border-bottom: 0; }
.candidate-rank { color: var(--gold); font-family: 'Cinzel', serif; font-size: 11px; }
.candidate-name { color: var(--text); font-size: 15px; }
.candidate-score { color: var(--muted); font-size: 13px; font-style: italic; }
.train-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.train-item { border-radius: 4px; border-color: rgba(158,180,165,0.2); background: rgba(3,20,18,0.32); }
.train-item img { height: 130px; border-radius: 2px; border-color: rgba(158,180,165,0.2); }
.collection-health { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; margin-bottom: 20px; border: 1px solid rgba(158,180,165,0.18); background: rgba(158,180,165,0.18); border-radius: 4px; overflow: hidden; }
.health-metric { padding: 14px; background: rgba(3,20,18,0.3); }
.health-value { color: var(--gold2); font-family: 'Cinzel', serif; font-size: 22px; line-height: 1; }
.health-label { color: var(--muted); font-size: 12px; font-style: italic; margin-top: 6px; }
.training-guidance { color: var(--muted); font-size: 13px; font-style: italic; margin: -8px 0 18px; }
.history-row { border-radius: 4px; border-color: rgba(158,180,165,0.2); background: rgba(3,20,18,0.28); min-height: 74px; }
.history-row:hover { border-color: var(--teal); background: rgba(105,169,154,0.09); }
.history-row img { border-radius: 3px; border-color: rgba(158,180,165,0.24); }
.err-box { border-radius: 4px; }
.app-input { width: 100%; padding: 12px 14px; background: rgba(3,20,18,0.5); border: 1px solid #52766b; border-radius: 4px; color: var(--text); font-family: 'EB Garamond', serif; font-size: 16px; outline: none; }
.app-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(209,163,77,0.1); }
.result-action { margin-top: 18px; text-align: center; }
@media (max-width: 680px) {
    .app-wrap { padding-top: 12px; }
    .container { padding: 0 14px; }
    .halo-header { display: block; padding: 18px 0 22px; text-align: center; }
    .halo-header .crown, .halo-header h1, .halo-header .header-subtitle { display: block; }
    .halo-header .crown { margin-bottom: 8px; }
    .header-status { display: none; }
    .tab-row { overflow-x: auto; justify-content: flex-start; }
    .tab-row { scrollbar-width: none; }
    .tab-row::-webkit-scrollbar { display: none; }
    .tab-btn { flex: 0 0 auto; min-width: 112px; }
    .workspace-card { padding: 20px !important; }
    .upload-zone { min-height: 240px; padding: 28px 16px; }
    .history-row { align-items: flex-start; flex-wrap: wrap; }
    .collection-health { grid-template-columns: 1fr; }
}
`;

const STORAGE_KEYS = {
trainingData: "training_data",
history: "saint_history",
apiKey: "anthropic_api_key",
synaxariumCatalog: "synaxarium_catalog",
reviewDenials: "synaxarium_review_denials",
};
const MAX_HISTORY = 30;
const LOCAL_MATCH_THRESHOLD = 0.4;
const CLOUD_SYNC_ENDPOINT = "/api/training-sync";
const DATABASE_NAME = "shere-pistavros";
const DATABASE_STORE = "app-data";
const COPTIC_SYNXARIUM_URL = "https://www.copticchurch.net/synaxarium/all/en";
const COPTIC_SYNXARIUM_MIRROR_URL = "https://r.jina.ai/http://www.copticchurch.net/synaxarium/all/en";
const COPTIC_SAINT_ALIASES = {
"george": "george prince of the martyrs",
"george of lydda": "george prince of the martyrs",
"mark": "mark the apostle",
"mark the apostle": "mark the apostle",
"anthony": "anthony the great",
"anthony the great": "anthony the great",
"bishoy": "anba bishoy",
"shenouda": "shenouda shenoute",
"mercurius": "mercurius known as saint with the two swords",
"demiana": "demiana",
"abanoub": "abanoub",
"mina": "mari mina the wonder worker",
"menas": "mari mina the wonder worker",
"moses the black": "moses the black",
};
const COPTIC_DOXOLOGY_LINKS = {
"george": "https://tasbeha.org/hymn_library/cat/285",
"george of lydda": "https://tasbeha.org/hymn_library/cat/285",
"mark": "https://tasbeha.org/hymn_library/cat/283",
"mark the apostle": "https://tasbeha.org/hymn_library/cat/283",
"demiana": "https://tasbeha.org/hymn_library/cat/302",
"bishoy": "https://tasbeha.org/hymn_library/cat/293",
"shenouda": "https://tasbeha.org/hymn_library/cat/292",
"abanoub": "https://tasbeha.org/hymn_library/cat/295",
"mina": "https://tasbeha.org/hymn_library/cat/286",
"menas": "https://tasbeha.org/hymn_library/cat/286",
"moses the black": "https://tasbeha.org/hymn_library/cat/297",
"mercurius": "https://tasbeha.org/hymn_library/cat/320",
};
let copticSynaxariumPromise;
const COPTIC_MONTHS = ["Tout", "Baba", "Hator", "Kiahk", "Toba", "Amshir", "Baramhat", "Baramouda", "Bashons", "Paona", "Abib", "Mesra", "Nasie"];

const openAppDatabase = () => new Promise((resolve, reject) => {
const request = indexedDB.open(DATABASE_NAME, 1);
request.onupgradeneeded = () => {
if (!request.result.objectStoreNames.contains(DATABASE_STORE)) {
request.result.createObjectStore(DATABASE_STORE);
}
};
request.onsuccess = () => resolve(request.result);
request.onerror = () => reject(request.error);
});

const getIndexedDbStorageAdapter = () => {
const database = openAppDatabase();

const read = async (key) => new Promise((resolve, reject) => {
database.then((db) => {
const request = db.transaction(DATABASE_STORE, "readonly").objectStore(DATABASE_STORE).get(key);
request.onsuccess = () => resolve(request.result ?? null);
request.onerror = () => reject(request.error);
}, reject);
});

const write = async (key, value) => new Promise((resolve, reject) => {
database.then((db) => {
const request = db.transaction(DATABASE_STORE, "readwrite").objectStore(DATABASE_STORE).put(value, key);
request.onsuccess = () => resolve();
request.onerror = () => reject(request.error);
}, reject);
});

return {
get: async (key) => {
const storedValue = await read(key);
if (storedValue != null) return { value: storedValue };

const legacyValue = localStorage.getItem(key);
if (legacyValue == null) return null;
await write(key, legacyValue);
return { value: legacyValue };
},
set: (key, value) => write(key, value),
};
};

const getStorageAdapter = () => {
if (typeof window !== "undefined" && window.storage?.get && window.storage?.set) {
return {
get: (key) => window.storage.get(key),
set: (key, value) => window.storage.set(key, value),
};
}

return getIndexedDbStorageAdapter();
};

const parseStoredJson = (rawValue, fallbackValue, label) => {
if (!rawValue) return fallbackValue;
try {
return JSON.parse(rawValue);
} catch (e) {
console.error(`Failed to parse ${label} from storage`, e);
return fallbackValue;
}
};

const withBaseUrl = (path) => {
const base = import.meta.env.BASE_URL || "/";
const normalizedBase = base.endsWith("/") ? base : `${base}/`;
return `${normalizedBase}${path.replace(/^\/+/, "")}`;
};

const fetchJsonFirstAvailable = async (paths, errorMessage) => {
let lastError;
for (const path of paths) {
try {
const response = await fetch(path, { cache: "no-store" });
if (!response.ok) {
lastError = new Error(`${response.status} ${response.statusText}`);
continue;
}
return response.json();
} catch (error) {
lastError = error;
}
}
throw new Error(errorMessage || lastError?.message || "Request failed");
};

const fetchCloudSnapshot = async () => {
const response = await fetch(CLOUD_SYNC_ENDPOINT, { cache: "no-store" });
if (response.status === 404 || response.status === 503) return null;
if (!response.ok) {
const details = await response.json().catch(() => ({}));
throw new Error(details.error || `Cloud sync request failed: ${response.status}`);
}
const payload = await response.json();
if (!payload || !Array.isArray(payload.trainingData) || !Array.isArray(payload.history)) return null;
return payload;
};

const shrinkImageDataUrl = async (dataUrl, maxDimension = 320) => {
const image = await loadImageFromDataUrl(dataUrl);
const largestDimension = Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height);
if (!largestDimension || largestDimension <= maxDimension) return dataUrl;

const scale = maxDimension / largestDimension;
const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
const context = canvas.getContext("2d");
if (!context) return dataUrl;
context.drawImage(image, 0, 0, width, height);
return canvas.toDataURL("image/jpeg", 0.78);
};

const buildCloudPayload = async (snapshot) => {
const compressedTrainingData = await Promise.all(snapshot.trainingData.map(async (entry) => {
if (!entry?.image || typeof entry.image !== "string" || !entry.image.startsWith("data:image/")) return entry;
try {
const compressedImage = await shrinkImageDataUrl(entry.image);
return { ...entry, image: compressedImage };
} catch {
return entry;
}
}));

return {
version: 1,
updatedAt: new Date().toISOString(),
trainingData: compressedTrainingData,
history: snapshot.history,
synaxariumCatalog: snapshot.synaxariumCatalog,
reviewDenials: snapshot.reviewDenials,
};
};

const parseModelJson = (text) => {
if (!text || typeof text !== "string") {
throw new Error("Empty AI response");
}

const cleaned = text
.replace(/^\s*```(?:json)?/i, "")
.replace(/```\s*$/i, "")
.trim();

const firstBrace = cleaned.indexOf("{");
const lastBrace = cleaned.lastIndexOf("}");
if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
throw new Error("AI response did not include JSON");
}

return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
};

const loadImageFromDataUrl = (dataUrl) =>
new Promise((resolve, reject) => {
const img = new Image();
img.onload = () => resolve(img);
img.onerror = () => reject(new Error("Could not load image data"));
img.src = dataUrl;
});

const readBlobAsDataUrl = (blob) => new Promise((resolve, reject) => {
const reader = new FileReader();
reader.onload = () => resolve(reader.result);
reader.onerror = () => reject(new Error("Could not read image data"));
reader.readAsDataURL(blob);
});

const normalizeVector = (values) => {
const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0)) || 1;
return values.map((value) => value / magnitude);
};

const cosineSimilarity = (left, right) => {
let dot = 0;
const length = Math.min(left.length, right.length);
for (let index = 0; index < length; index += 1) {
dot += left[index] * right[index];
}
return dot;
};

const normalizeSaintName = (value) => value
.toLowerCase()
.replace(/\bsaint\b|\bst\.?\b/g, "")
.replace(/[^a-z0-9]+/g, " ")
.trim()
.replace(/\s+/g, " ");

const cleanBiographyText = (text) => text.replace(/_/g, "");

const isGregorianLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

const getCopticYearStart = (today = new Date()) => {
const currentYear = today.getFullYear();
const newYearDay = isGregorianLeapYear(currentYear + 1) ? 12 : 11;
const thisYearsNewYear = new Date(currentYear, 8, newYearDay);
const startYear = today >= thisYearsNewYear ? currentYear : currentYear - 1;
const startDay = isGregorianLeapYear(startYear + 1) ? 12 : 11;
return new Date(Date.UTC(startYear, 8, startDay));
};

const getGregorianDateForCopticFeast = (feastDay) => {
const match = feastDay.match(/^([A-Za-z]+)\s+(\d+)$/);
if (!match) return "";

const monthIndex = COPTIC_MONTHS.indexOf(match[1]);
if (monthIndex === -1) return "";

const dayOffset = monthIndex * 30 + Number(match[2]) - 1;
const gregorianDate = new Date(getCopticYearStart().getTime() + dayOffset * 86_400_000);
return gregorianDate.toLocaleDateString("en-US", {
month: "long",
day: "numeric",
year: "numeric",
timeZone: "UTC",
});
};

const getSynaxariumMirrorUrl = (url) => url.replace(/^http:\/\//, "https://r.jina.ai/http://");

const fetchCopticSynaxariumBiography = async (entry) => {
const response = await fetch(getSynaxariumMirrorUrl(entry.url));
if (!response.ok) throw new Error("Coptic Synaxarium entry was unavailable");

const lines = (await response.text()).split("\n").map((line) => line.trim());
const headingIndex = lines.findIndex((line) => line.startsWith("### "));
const contentStart = headingIndex === -1 ? 0 : headingIndex + 1;
const contentEnd = lines.findIndex((line, index) =>
index > contentStart && (/^May their prayers/i.test(line) || /^If you have benefited/i.test(line)),
);
const biography = lines
.slice(contentStart, contentEnd === -1 ? undefined : contentEnd)
.filter((line) => line && !line.startsWith("#") && !line.startsWith("["))
.join(" ")
.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
.replace(/_/g, "")
.replace(/\s+/g, " ")
.trim();

if (!biography) return null;
return {
biography,
biography_source: "Coptic Orthodox Synaxarium",
biography_url: entry.url,
};
};

const fetchCopticSynaxarium = async () => {
if (!copticSynaxariumPromise) {
copticSynaxariumPromise = fetch(COPTIC_SYNXARIUM_MIRROR_URL)
.then((response) => {
if (!response.ok) throw new Error("Coptic Synaxarium was unavailable");
return response.text();
})
.then((text) => text.split("\n").map((line) => {
const match = line.match(/^\[([A-Za-z]+ \d+)\]\(([^)]+)\)(.+)$/);
if (!match) return null;
return { feastDay: match[1], url: match[2], commemoration: match[3] };
}).filter(Boolean));
}
return copticSynaxariumPromise;
};

const getSynaxariumTrainingLabel = (commemoration) => {
const match = commemoration.match(/\b(?:St\.|Saint|Anba|Abba|Pope)\s+[^.,;]+/i);
return match?.[0]?.trim() || "";
};

const buildSynaxariumCatalog = (entries) => entries.map((entry) => ({
id: `${entry.feastDay}-${entry.url}`,
feastDay: entry.feastDay,
gregorianDate: getGregorianDateForCopticFeast(entry.feastDay),
commemoration: entry.commemoration,
trainingLabel: getSynaxariumTrainingLabel(entry.commemoration),
url: entry.url,
}));

const fetchCopticCalendarEntry = async (saintName) => {
const normalizedName = normalizeSaintName(saintName || "");
if (!normalizedName || normalizedName === "unknown") return null;

const searchName = COPTIC_SAINT_ALIASES[normalizedName] || normalizedName;
if (!COPTIC_SAINT_ALIASES[normalizedName] && searchName.split(" ").length < 2) return null;

const entries = await fetchCopticSynaxarium();
const entry = entries.find(({ commemoration }) =>
normalizeSaintName(commemoration).includes(searchName),
);
if (!entry) return null;

return {
...entry,
feast_day: `${entry.feastDay} / ${getGregorianDateForCopticFeast(entry.feastDay)} (Coptic Synaxarium)`,
tradition: "Coptic Orthodox",
coptic_calendar_url: COPTIC_SYNXARIUM_URL,
doxology_url: COPTIC_DOXOLOGY_LINKS[normalizedName],
};
};

const fetchSaintBiography = async (saintName) => {
if (!saintName || saintName === "Unknown Saint") return null;

const fetchSummary = async (title) => {
const summaryResponse = await fetch(
`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
);
if (!summaryResponse.ok) return null;

const summary = await summaryResponse.json();
if (!summary.extract) return null;

return {
biography: summary.extract,
biography_source: summary.title || title,
biography_url: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`,
};
};

const exactMatch = await fetchSummary(saintName);
if (exactMatch) return exactMatch;

const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
searchUrl.search = new URLSearchParams({
action: "query",
format: "json",
list: "search",
origin: "*",
srsearch: `"${saintName}" saint`,
srlimit: "1",
}).toString();

const searchResponse = await fetch(searchUrl);
if (!searchResponse.ok) throw new Error("Biography search was unavailable");

const searchData = await searchResponse.json();
const title = searchData.query?.search?.[0]?.title;
if (!title) return null;

return fetchSummary(title);
};

// ── Inject CSS ─────────────────────────────────────────────────────────────
function useGlobalCSS(css) {
useEffect(() => {
const el = document.createElement("style");

el.textContent = css;
document.head.appendChild(el);
return () => el.remove();
}, [css]);
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function SaintIconApp() {
useGlobalCSS(GLOBAL_CSS);
const [tab, setTab] = useState("identify"); // identify | train | history
const [image, setImage] = useState(null); // base64 data URL
const [loading, setLoading] = useState(false);
const [result, setResult] = useState(null);
const [error, setError] = useState("");
const [drag, setDrag] = useState(false);

const [cameraOn, setCameraOn] = useState(false);
const [cameraStatus, setCameraStatus] = useState("");
const [trainingData, setTrainingData] = useState([]);
const [history, setHistory] = useState([]);
const [synaxariumCatalog, setSynaxariumCatalog] = useState([]);
const [catalogLoading, setCatalogLoading] = useState(false);
const [catalogQuery, setCatalogQuery] = useState("");
const [collectionImporting, setCollectionImporting] = useState(false);
const [downloaderStatus, setDownloaderStatus] = useState(null);
const [reviewCandidates, setReviewCandidates] = useState([]);
const [reviewLoading, setReviewLoading] = useState(false);
const [reviewDenials, setReviewDenials] = useState([]);
const [trainName, setTrainName] = useState("");
const [trainImg, setTrainImg] = useState(null);
const [selectedHistory, setSelectedHistory] = useState(null);
const [apiKey, setApiKey] = useState("");
const [identifyEngine, setIdentifyEngine] = useState("local");
const [cloudSyncStatus, setCloudSyncStatus] = useState("Local archive mode");

const fileRef = useRef();
const trainFileRef = useRef();
const backupFileRef = useRef();
const videoRef = useRef();
const streamRef = useRef();
const storageRef = useRef(getStorageAdapter());
const idRef = useRef(1);
const embeddingCacheRef = useRef(new Map());
const cloudSyncReadyRef = useRef(false);
const cloudSyncTimerRef = useRef(null);
const trainingLabelList = useMemo(
() => trainingData.map((item) => `- "${item.name}"`).join("\n"),
[trainingData],
);
const catalogResults = useMemo(() => {
const query = catalogQuery.trim().toLowerCase();
if (!query) return synaxariumCatalog.slice(0, 60);
return synaxariumCatalog.filter((entry) =>
`${entry.feastDay} ${entry.commemoration} ${entry.trainingLabel}`.toLowerCase().includes(query),
).slice(0, 60);
}, [catalogQuery, synaxariumCatalog]);
const trainingHealth = useMemo(() => {
const groups = new Map();
trainingData.forEach((entry) => {
const key = normalizeSaintName(entry.name) || entry.name.trim().toLowerCase();
groups.set(key, (groups.get(key) || 0) + 1);
});
const singleSampleSaints = [...groups.values()].filter((count) => count === 1).length;
return {
saints: groups.size,
icons: trainingData.length,
singleSampleSaints,
};
}, [trainingData]);

const queueCloudSync = useCallback((nextSnapshot) => {
if (!cloudSyncReadyRef.current) return;
if (cloudSyncTimerRef.current) window.clearTimeout(cloudSyncTimerRef.current);

cloudSyncTimerRef.current = window.setTimeout(async () => {
try {
const payload = await buildCloudPayload(nextSnapshot);
const response = await fetch(CLOUD_SYNC_ENDPOINT, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
});

if (response.status === 404 || response.status === 503) {
setCloudSyncStatus("Local archive mode");
return;
}
if (response.status === 413) {
setCloudSyncStatus("Cloud payload too large");
return;
}
if (!response.ok) throw new Error(`Cloud sync failed: ${response.status}`);
setCloudSyncStatus("Cloud synced");
} catch (error) {
console.warn("Cloud sync save failed", error);
setCloudSyncStatus("Cloud sync unavailable");
}
}, 500);
}, []);

const pushCloudSnapshotNow = useCallback(async (nextSnapshot) => {
try {
const payload = await buildCloudPayload(nextSnapshot);
const response = await fetch(CLOUD_SYNC_ENDPOINT, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
});

if (response.status === 404 || response.status === 503) {
setCloudSyncStatus("Local archive mode");
return false;
}
if (response.status === 413) {
setCloudSyncStatus("Cloud payload too large");
return false;
}
if (!response.ok) {
const details = await response.json().catch(() => ({}));
throw new Error(details.error || `Cloud sync failed: ${response.status}`);
}

setCloudSyncStatus("Cloud synced");
return true;
} catch (error) {
console.warn("Immediate cloud sync failed", error);
setCloudSyncStatus("Cloud sync unavailable");
return false;
}
}, []);

// ── Persist training data & history ──────────────────────────────────────
useEffect(() => {
(async () => {
const storage = storageRef.current;
if (navigator.storage?.persist) {
try {
await navigator.storage.persist();
} catch (e) {
console.warn("Could not request persistent browser storage", e);
}
}
let loadedTrainingData = [];
let loadedHistory = [];
let loadedCatalog = [];
let loadedDenials = [];
try {
const td = await storage.get(STORAGE_KEYS.trainingData);
if (td) {
loadedTrainingData = parseStoredJson(td.value, [], "training data");
setTrainingData(loadedTrainingData);
}
} catch (e) {
console.error("Could not load training data", e);
}
try {
const h = await storage.get(STORAGE_KEYS.history);
if (h) {
loadedHistory = parseStoredJson(h.value, [], "history");
setHistory(loadedHistory);
}
} catch (e) {
console.error("Could not load history", e);
}
try {
const catalog = await storage.get(STORAGE_KEYS.synaxariumCatalog);
if (catalog) {
loadedCatalog = parseStoredJson(catalog.value, [], "Synaxarium catalog");
setSynaxariumCatalog(loadedCatalog);
}
} catch (e) {
console.error("Could not load Synaxarium catalog", e);
}
try {
const denied = await storage.get(STORAGE_KEYS.reviewDenials);
if (denied) {
loadedDenials = parseStoredJson(denied.value, [], "review denials");
setReviewDenials(loadedDenials);
}
} catch (e) {
console.error("Could not load review denials", e);
}
try {
const key = await storage.get(STORAGE_KEYS.apiKey);
if (key?.value) {
setApiKey(key.value);
}
} catch (e) {
console.error("Could not load API key", e);
}

try {
const cloudSnapshot = await fetchCloudSnapshot();
if (cloudSnapshot) {
const cloudTraining = Array.isArray(cloudSnapshot.trainingData) ? cloudSnapshot.trainingData : [];
const cloudHistory = Array.isArray(cloudSnapshot.history) ? cloudSnapshot.history : [];
const cloudCatalog = Array.isArray(cloudSnapshot.synaxariumCatalog) ? cloudSnapshot.synaxariumCatalog : [];
const cloudDenials = Array.isArray(cloudSnapshot.reviewDenials) ? cloudSnapshot.reviewDenials : [];
const cloudLooksRicher = cloudTraining.length > loadedTrainingData.length
|| (cloudTraining.length === loadedTrainingData.length && cloudHistory.length > loadedHistory.length);
const cloudIsEmpty = cloudTraining.length === 0 && cloudHistory.length === 0 && cloudCatalog.length === 0 && cloudDenials.length === 0;
const localHasData = loadedTrainingData.length > 0 || loadedHistory.length > 0 || loadedCatalog.length > 0 || loadedDenials.length > 0;

if (cloudLooksRicher) {
loadedTrainingData = cloudTraining;
loadedHistory = cloudHistory;
setTrainingData(cloudTraining);
setHistory(cloudHistory);
setSynaxariumCatalog(cloudCatalog);
setReviewDenials(cloudDenials);
await storage.set(STORAGE_KEYS.trainingData, JSON.stringify(cloudTraining));
await storage.set(STORAGE_KEYS.history, JSON.stringify(cloudHistory));
await storage.set(STORAGE_KEYS.synaxariumCatalog, JSON.stringify(cloudCatalog));
await storage.set(STORAGE_KEYS.reviewDenials, JSON.stringify(cloudDenials));
}
if (!cloudLooksRicher && cloudIsEmpty && localHasData) {
const seeded = await pushCloudSnapshotNow({
trainingData: loadedTrainingData,
history: loadedHistory,
synaxariumCatalog: loadedCatalog,
reviewDenials: loadedDenials,
});
setCloudSyncStatus(seeded ? "Cloud bootstrapped from local" : "Cloud connected");
} else {
setCloudSyncStatus("Cloud connected");
}
} else {
setCloudSyncStatus("Local archive mode");
}
} catch (cloudError) {
console.warn("Could not load cloud snapshot", cloudError);
if (/not configured|UPSTASH/i.test(cloudError?.message || "")) {
setCloudSyncStatus("Cloud not configured");
} else {
setCloudSyncStatus("Cloud sync unavailable");
}
}

const maxExistingId = [...loadedTrainingData, ...loadedHistory]
.map((item) => Number(item?.id) || 0)
.reduce((max, value) => Math.max(max, value), 0);
idRef.current = maxExistingId + 1;
cloudSyncReadyRef.current = true;
})();
}, [pushCloudSnapshotNow]);

useEffect(() => {
return () => {
if (cloudSyncTimerRef.current) window.clearTimeout(cloudSyncTimerRef.current);
streamRef.current?.getTracks().forEach((t) => t.stop());
};
}, []);

useEffect(() => {
if (!downloaderStatus?.running) return undefined;

const refreshStatus = async () => {
try {
const response = await fetch("/api/synaxarium-image-importer");
if (response.ok) setDownloaderStatus(await response.json());
} catch (e) {
console.error("Could not read Synaxarium importer status", e);
}
};
const intervalId = window.setInterval(refreshStatus, 3_000);
return () => window.clearInterval(intervalId);
}, [downloaderStatus?.running]);

useEffect(() => {
if (!cameraOn || !videoRef.current || !streamRef.current) return;

videoRef.current.srcObject = streamRef.current;
videoRef.current.play().catch((e) => {
console.error("Could not start camera preview", e);
setError("Camera preview could not start. Please try again.");
});
}, [cameraOn]);

const saveTraining = async (data) => {
setTrainingData(data);
try {
await storageRef.current.set(STORAGE_KEYS.trainingData, JSON.stringify(data));
queueCloudSync({
trainingData: data,
history,
synaxariumCatalog,
reviewDenials,
});
} catch (e) {
console.error("Could not persist training data", e);
setError("Could not save training data locally.");
}
};
const clearTrainingCollection = async () => {
if (!window.confirm("Clear every saved training image? This cannot be undone unless you restore a backup.")) return;
embeddingCacheRef.current.clear();
await saveTraining([]);
setError("");
};
const saveHistory = async (data) => {
setHistory(data);
try {
await storageRef.current.set(STORAGE_KEYS.history, JSON.stringify(data));
queueCloudSync({
trainingData,
history: data,
synaxariumCatalog,
reviewDenials,
});
} catch (e) {
console.error("Could not persist history", e);
setError("Could not save history locally.");
}
};
const saveSynaxariumCatalog = async (data) => {
setSynaxariumCatalog(data);
try {
await storageRef.current.set(STORAGE_KEYS.synaxariumCatalog, JSON.stringify(data));
queueCloudSync({
trainingData,
history,
synaxariumCatalog: data,
reviewDenials,
});
} catch (e) {
console.error("Could not save Synaxarium catalog", e);
setError("Could not save Synaxarium catalog locally.");
}
};
const saveReviewDenials = async (data) => {
setReviewDenials(data);
try {
await storageRef.current.set(STORAGE_KEYS.reviewDenials, JSON.stringify(data));
queueCloudSync({
trainingData,
history,
synaxariumCatalog,
reviewDenials: data,
});
} catch (e) {
console.error("Could not save denied review candidates", e);
setError("Could not save denied candidates locally.");
}
};
const fetchReviewQueueCandidates = async () => {
const manifest = await fetchJsonFirstAvailable(
[withBaseUrl("synaxarium-icon-review-manifest.json"), "/synaxarium-icon-review-manifest.json"],
"No icon review manifest was found. Download review candidates first.",
);
if (!Array.isArray(manifest.candidates)) throw new Error("The icon review manifest is invalid.");

let mergedDenials = reviewDenials;
try {
const denialsResponse = await fetch("/api/synaxarium-review-denials", { cache: "no-store" });
if (denialsResponse.ok) {
const denialPayload = await denialsResponse.json();
if (Array.isArray(denialPayload.denied)) {
const mergedBySource = new Map();
[...reviewDenials, ...denialPayload.denied].forEach((entry) => {
const key = entry.sourceUrl || entry.path;
if (key) mergedBySource.set(key, entry);
});
mergedDenials = [...mergedBySource.values()];
await saveReviewDenials(mergedDenials);
}
}
} catch (denialsError) {
console.warn("Could not load saved review denials", denialsError);
}

const existingSources = new Set(trainingData.map((entry) => entry.source).filter(Boolean));
const deniedSources = new Set(
mergedDenials
.map((entry) => entry.sourceUrl || entry.path || "")
.filter(Boolean),
);

return manifest.candidates.filter((candidate) => {
if (!candidate.path || !candidate.label) return false;
if (existingSources.has(candidate.path)) return false;
const sourceKey = candidate.sourceUrl || candidate.path;
return !deniedSources.has(sourceKey);
});
};
const loadReviewCandidates = async () => {
setCollectionImporting(true);
setError("");
try {
setReviewCandidates(await fetchReviewQueueCandidates());
} catch (e) {
console.error("Could not load icon review queue", e);
const failedFetch = /failed to fetch/i.test(e?.message || "");
setError(
failedFetch
? "Could not reach the downloaded icon manifest. Confirm the app is running from the project dev server and that Images/synaxarium-icon-review-manifest.json exists."
: (e.message || "Could not load icon review queue."),
);
} finally {
setCollectionImporting(false);
}
};
const importAllReviewCandidates = async () => {
setReviewLoading(true);
setCollectionImporting(true);
setError("");
try {
const queueCandidates = await fetchReviewQueueCandidates();
if (queueCandidates.length === 0) {
setReviewCandidates([]);
throw new Error("No downloaded candidates are ready to import.");
}

const seenSources = new Set();
const uniqueCandidates = queueCandidates.filter((candidate) => {
const key = candidate.sourceUrl || candidate.path;
if (!key || seenSources.has(key)) return false;
seenSources.add(key);
return true;
});

const importedEntries = [];
const failedCandidates = [];

for (const candidate of uniqueCandidates) {
try {
const response = await fetch(candidate.path);
if (!response.ok) throw new Error(`Could not read ${candidate.path}`);
const blob = await response.blob();
if (!blob.type.startsWith("image/")) throw new Error("Candidate is not a supported image file.");
const importedImage = await readBlobAsDataUrl(blob);
await loadImageFromDataUrl(importedImage);
importedEntries.push({
id: nextId(),
name: candidate.label,
image: importedImage,
source: candidate.path,
attribution: candidate.attribution || "Wikimedia Commons",
license: candidate.license,
sourceUrl: candidate.sourceUrl,
});
} catch {
failedCandidates.push(candidate);
}
}

if (importedEntries.length === 0) {
setReviewCandidates(failedCandidates);
throw new Error("No candidates could be imported. Check candidate image files and try again.");
}

await saveTraining([...trainingData, ...importedEntries]);
setReviewCandidates(failedCandidates);

if (failedCandidates.length > 0) {
setError(`Imported ${importedEntries.length} candidate(s). ${failedCandidates.length} candidate(s) could not be imported and remain in the queue.`);
}
} catch (e) {
console.error("Could not import all icon candidates", e);
setError(e.message || "Could not import all downloaded candidates.");
} finally {
setReviewLoading(false);
setCollectionImporting(false);
}
};
const approveReviewCandidate = async (candidate) => {
setReviewLoading(true);
setError("");
try {
const response = await fetch(candidate.path);
if (!response.ok) throw new Error(`Could not read ${candidate.path}`);
const blob = await response.blob();
if (!blob.type.startsWith("image/")) throw new Error("This candidate is not a supported image file.");
const image = await readBlobAsDataUrl(blob);
await loadImageFromDataUrl(image);
await saveTraining([...trainingData, {
id: nextId(), name: candidate.label, image, source: candidate.path,
attribution: candidate.attribution || "Wikimedia Commons", license: candidate.license, sourceUrl: candidate.sourceUrl,
}]);
setReviewCandidates((candidates) => candidates.filter((entry) => entry.id !== candidate.id));
} catch (e) {
console.error("Could not approve icon candidate", e);
setError(e.message || "Could not approve this icon candidate.");
} finally {
setReviewLoading(false);
}
};
const denyReviewCandidate = async (candidate) => {
setReviewLoading(true);
setError("");
try {
const deniedEntry = {
id: candidate.id,
label: candidate.label,
tradition: candidate.tradition,
path: candidate.path,
sourceUrl: candidate.sourceUrl,
qualityScore: candidate.qualityScore,
deniedAt: new Date().toISOString(),
};
const deniedKey = deniedEntry.sourceUrl || deniedEntry.path;
const updatedDenials = deniedKey
? [...reviewDenials.filter((entry) => (entry.sourceUrl || entry.path) !== deniedKey), deniedEntry]
: [...reviewDenials, deniedEntry];
await saveReviewDenials(updatedDenials);

try {
const response = await fetch("/api/synaxarium-review-denials", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(deniedEntry),
});
if (!response.ok) {
const details = await response.json().catch(() => ({}));
throw new Error(details.error || "Could not persist denial.");
}
} catch (persistError) {
console.warn("Could not persist denied candidate to review denials file", persistError);
}

setReviewCandidates((candidates) => candidates.filter((entry) => entry.id !== candidate.id));
} catch (e) {
console.error("Could not deny icon candidate", e);
setError(e.message || "Could not deny this icon candidate.");
} finally {
setReviewLoading(false);
}
};
const startSynaxariumImageDownload = async () => {
setError("");
try {
const response = await fetch("/api/synaxarium-image-importer", { method: "POST" });
const status = await response.json();
if (!response.ok) throw new Error(status.error || "Could not start the Synaxarium image importer.");
setDownloaderStatus(status);
} catch (e) {
console.error("Could not start Synaxarium image importer", e);
setError(`${e.message || "Could not start the importer."} Run this button from npm run dev.`);
}
};
const importSynaxariumCatalog = async () => {
setCatalogLoading(true);
setError("");
try {
const catalog = buildSynaxariumCatalog(await fetchCopticSynaxarium());
await saveSynaxariumCatalog(catalog);
} catch (e) {
console.error("Could not import Synaxarium catalog", e);
setError("Could not import the Coptic Synaxarium. Please try again.");
} finally {
setCatalogLoading(false);
}
};
const exportBackup = () => {
const backup = {
version: 1,
exportedAt: new Date().toISOString(),
trainingData,
history,
synaxariumCatalog,
};
const downloadUrl = URL.createObjectURL(new Blob([JSON.stringify(backup)], { type: "application/json" }));
const link = document.createElement("a");
link.href = downloadUrl;
link.download = `shere-pistavros-backup-${new Date().toISOString().slice(0, 10)}.json`;
document.body.appendChild(link);
link.click();
link.remove();
setTimeout(() => URL.revokeObjectURL(downloadUrl), 30_000);
};
const restoreBackup = async (file) => {
if (!file) return;
try {
const backup = JSON.parse(await file.text());
if (backup.version !== 1 || !Array.isArray(backup.trainingData) || !Array.isArray(backup.history) || !Array.isArray(backup.synaxariumCatalog)) {
throw new Error("This is not a valid Shere Pistavros backup file.");
}
if (!window.confirm("Restore this backup and replace the current local training data, history, and Synaxarium catalog?")) return;

await saveTraining(backup.trainingData);
await saveHistory(backup.history);
await saveSynaxariumCatalog(backup.synaxariumCatalog);
const maxId = [...backup.trainingData, ...backup.history]
.map((entry) => Number(entry?.id) || 0)
.reduce((maximum, id) => Math.max(maximum, id), 0);
idRef.current = maxId + 1;
setError("");
} catch (e) {
console.error("Could not restore backup", e);
setError(e.message || "Could not restore backup.");
}
};

const nextId = () => {
const id = idRef.current;
idRef.current += 1;
return id;
};

// ── Image helpers ─────────────────────────────────────────────────────────
const getImageEmbedding = useCallback(async (dataUrl) => {
const cached = embeddingCacheRef.current.get(dataUrl);
if (cached) return cached;

const img = await loadImageFromDataUrl(dataUrl);
const canvas = document.createElement("canvas");
canvas.width = 64;
canvas.height = 64;
const ctx = canvas.getContext("2d");
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

const computeRegionVector = (sx, sy, width, height) => {
const pixels = ctx.getImageData(sx, sy, width, height).data;
const lumaBins = new Array(20).fill(0);
const saturationBins = new Array(10).fill(0);
const edgeBins = new Array(8).fill(0);
const grid = [];

const getLumaAt = (x, y) => {
const idx = (y * width + x) * 4;
const r = pixels[idx];
const g = pixels[idx + 1];
const b = pixels[idx + 2];
return {
    luma: 0.2126 * r + 0.7152 * g + 0.0722 * b,
    saturation: Math.max(r, g, b) - Math.min(r, g, b),
};
};

for (let y = 0; y < height; y += 1) {
for (let x = 0; x < width; x += 1) {
const { luma, saturation } = getLumaAt(x, y);
const lumaBin = Math.min(lumaBins.length - 1, Math.floor(luma / (256 / lumaBins.length)));
const saturationBin = Math.min(saturationBins.length - 1, Math.floor(saturation / (256 / saturationBins.length)));
lumaBins[lumaBin] += 1;
saturationBins[saturationBin] += 1;
}
}

for (let y = 1; y < height - 1; y += 1) {
for (let x = 1; x < width - 1; x += 1) {
const center = getLumaAt(x, y).luma;
const gx = getLumaAt(x + 1, y).luma - getLumaAt(x - 1, y).luma;
const gy = getLumaAt(x, y + 1).luma - getLumaAt(x, y - 1).luma;
const magnitude = Math.sqrt(gx * gx + gy * gy);
if (magnitude < 10) continue;
const angle = Math.atan2(gy, gx);
const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);
const edgeBin = Math.min(edgeBins.length - 1, Math.floor(normalizedAngle * edgeBins.length));
edgeBins[edgeBin] += Math.min(4, magnitude / 40) + center / 512;
}
}

for (let gy = 0; gy < 8; gy += 1) {
for (let gx = 0; gx < 8; gx += 1) {
const cellX = Math.floor((gx / 8) * width);
const cellY = Math.floor((gy / 8) * height);
const sample = getLumaAt(Math.min(width - 1, cellX), Math.min(height - 1, cellY));
grid.push(sample.luma / 255);
}
}

return normalizeVector([...lumaBins, ...saturationBins, ...edgeBins, ...grid]);
};

const regions = [
{ sx: 0, sy: 0, width: 64, height: 64, weight: 0.55 },
{ sx: 8, sy: 8, width: 48, height: 48, weight: 0.35 },
{ sx: 16, sy: 8, width: 40, height: 40, weight: 0.1 },
];

const weighted = regions.map(({ sx, sy, width, height, weight }) => ({
weight,
vector: computeRegionVector(sx, sy, width, height),
}));
const vectorLength = weighted[0]?.vector.length || 0;
const mergedVector = new Array(vectorLength).fill(0);
weighted.forEach(({ weight, vector: regionVector }) => {
for (let index = 0; index < regionVector.length; index += 1) {
mergedVector[index] += regionVector[index] * weight;
}
});

const vector = normalizeVector(mergedVector);
embeddingCacheRef.current.set(dataUrl, vector);
return vector;
}, []);

const readFile = useCallback((file) =>
new Promise((res) => {
const r = new FileReader();
r.onload = (e) => res(e.target.result);
r.readAsDataURL(file);
}), []);

const handleFile = useCallback(async (file) => {
if (!file) {
setError("No file selected.");
return;
}
if (!file.type.startsWith("image/")) {
setError("Please select an image file (PNG/JPG/WEBP).");
return;
}
const url = await readFile(file);
try {
await loadImageFromDataUrl(url);
} catch {
setError("This image could not be decoded. Choose a valid PNG, JPG, or WEBP file.");
return;
}
setImage(url);
setResult(null);
setError("");
}, [readFile]);

// ── Camera ────────────────────────────────────────────────────────────────
const startCamera = async () => {
try {
if (!navigator.mediaDevices?.getUserMedia) {
throw new Error("unsupported");
}
const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
streamRef.current = s;
setCameraOn(true);
setCameraStatus("Tap Capture any time. Auto-capture triggers when the icon is clear.");
setError("");
} catch (e) {
console.error("Could not access camera", e);
const messageByError = {
NotAllowedError: "Camera permission was blocked. Allow camera access in your browser settings and try again.",
NotFoundError: "No camera was found on this device.",
NotReadableError: "The camera is already in use by another application.",
SecurityError: "Camera access requires a secure connection. Open the app through localhost or HTTPS.",
};
setError(messageByError[e?.name] || "Camera access is unavailable in this browser.");
}
};
const stopCamera = useCallback(() => {
streamRef.current?.getTracks().forEach(t => t.stop());
if (videoRef.current) {
videoRef.current.srcObject = null;
}

setCameraOn(false);
setCameraStatus("");
}, []);
const capturePhoto = useCallback(() => {
const v = videoRef.current;
if (!v?.videoWidth || !v.videoHeight) return;
const c = document.createElement("canvas");
c.width = v.videoWidth; c.height = v.videoHeight;
c.getContext("2d").drawImage(v, 0, 0);
setImage(c.toDataURL("image/jpeg", 0.92));
stopCamera();
setResult(null); setError("");
}, [stopCamera]);

useEffect(() => {
if (!cameraOn) return undefined;

const canvas = document.createElement("canvas");
canvas.width = 64;
canvas.height = 64;
const context = canvas.getContext("2d", { willReadFrequently: true });
let previousSignature = null;
let stableFrames = 0;
let captured = false;

const detectIcon = () => {
const video = videoRef.current;
if (!context || !video?.videoWidth || captured) return;

context.drawImage(video, 0, 0, canvas.width, canvas.height);
const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
const signature = [];
let luminanceTotal = 0;
let luminanceSquaredTotal = 0;
let edgeTotal = 0;
let edgeCount = 0;

for (let y = 4; y < 60; y += 8) {
for (let x = 4; x < 60; x += 8) {
const index = (y * canvas.width + x) * 4;
const luminance = 0.2126 * pixels[index] + 0.7152 * pixels[index + 1] + 0.0722 * pixels[index + 2];
signature.push(luminance);
luminanceTotal += luminance;
luminanceSquaredTotal += luminance * luminance;

const rightIndex = (y * canvas.width + x + 1) * 4;
const lowerIndex = ((y + 1) * canvas.width + x) * 4;
const rightLuminance = 0.2126 * pixels[rightIndex] + 0.7152 * pixels[rightIndex + 1] + 0.0722 * pixels[rightIndex + 2];
const lowerLuminance = 0.2126 * pixels[lowerIndex] + 0.7152 * pixels[lowerIndex + 1] + 0.0722 * pixels[lowerIndex + 2];
edgeTotal += Math.abs(luminance - rightLuminance) + Math.abs(luminance - lowerLuminance);
edgeCount += 2;
}
}

const sampleCount = signature.length;
const averageLuminance = luminanceTotal / sampleCount;
const contrast = Math.sqrt(Math.max(0, luminanceSquaredTotal / sampleCount - averageLuminance ** 2));
const detail = edgeTotal / edgeCount;
const movement = previousSignature
? signature.reduce((total, value, index) => total + Math.abs(value - previousSignature[index]), 0) / sampleCount
: Infinity;
const iconVisible = averageLuminance > 25 && averageLuminance < 235 && contrast > 18 && detail > 8;

if (iconVisible && movement < 12) {
stableFrames += 1;
setCameraStatus(stableFrames >= 2 ? "Icon is clear. Auto-capturing…" : "Icon detected. Keep it roughly centered.");
} else {
stableFrames = 0;
setCameraStatus(iconVisible ? "Good framing. Tap Capture now for an instant shot." : "Tap Capture any time. Auto-capture triggers when the icon is clear.");
}
previousSignature = signature;

if (stableFrames >= 3) {
captured = true;
capturePhoto();
}
};

const intervalId = window.setInterval(detectIcon, 180);
return () => window.clearInterval(intervalId);
}, [cameraOn, capturePhoto]);

// ── Identify saint ────────────────────────────────────────────────────────
const identifyLocally = useCallback(async () => {
if (trainingData.length === 0) {
return {
name: "Unknown Saint",
confidence: 0,
local_candidates: [],
feast_day: "Unknown",
died: "",
born: "",
origin: "",
canonized_by: "",
tradition: "Local trained model",
patronage: [],
attributes: ["No local training icons found"],
biography: "No local model data is available yet. Add a few labeled icons in the Train tab, then try identification again.",
prayer: "",
identified_from: "Local matcher had no training examples.",
};
}

const sourceEmbedding = await getImageEmbedding(image);
const embeddingResults = await Promise.allSettled(
trainingData.map(async (item) => ({
id: item.id,
name: item.name,
embedding: await getImageEmbedding(item.image),
})),
);
const embeddings = embeddingResults
.filter((result) => result.status === "fulfilled")
.map((result) => result.value);
const skippedSampleCount = embeddingResults.length - embeddings.length;
if (embeddings.length === 0) throw new Error("None of the saved training images could be read. Remove or replace invalid training samples.");

const scoreMap = new Map();
embeddings.forEach((sample) => {
const score = cosineSimilarity(sourceEmbedding, sample.embedding);
const existing = scoreMap.get(sample.name) || [];
existing.push(score);
scoreMap.set(sample.name, existing);
});

const rankedCandidates = [...scoreMap.entries()]
.map(([name, scores]) => {
const topScores = [...scores].sort((a, b) => b - a).slice(0, 2);
const score = topScores.reduce((sum, value) => sum + value, 0) / topScores.length;
return {
name,
score,
samples: scores.length,
similarity: Math.max(0, Math.min(100, Math.round(score * 100))),
};
})
.sort((left, right) => right.score - left.score);

const bestCandidate = rankedCandidates[0];
const bestName = bestCandidate?.name || "Unknown Saint";
const bestScore = bestCandidate?.score ?? -1;
const secondScore = rankedCandidates[1]?.score ?? Math.max(0, bestScore - 0.12);
const separation = Math.max(0, bestScore - secondScore);
const supportBoost = Math.min(0.08, (bestCandidate?.samples || 1) * 0.015);

const baseConfidence = (bestScore - 0.48) / 0.45;
const confidence = Math.max(0, Math.min(0.99, baseConfidence + separation * 2 + supportBoost));
const isConfident = confidence >= LOCAL_MATCH_THRESHOLD && separation >= 0.018;
const displayName = isConfident ? bestName : "Unknown Saint";
const similarityPct = Math.max(0, Math.min(100, Math.round(bestScore * 100)));

return {
name: displayName,
confidence,
local_candidates: rankedCandidates.slice(0, 3),
feast_day: "Unknown (local mode)",
died: "",
born: "",
origin: "",
canonized_by: "",
tradition: "Local trained model",
patronage: [],
attributes: [
`Compared against ${trainingData.length} locally labeled icons`,
...(skippedSampleCount > 0 ? [`Skipped ${skippedSampleCount} unreadable training image${skippedSampleCount === 1 ? "" : "s"}`] : []),
`Best visual similarity: ${similarityPct}%`,
],
biography: isConfident
? `This result was produced by your local training model. The uploaded icon most closely matched "${bestName}" in your own labeled examples. Add more samples for this saint and for similar-looking saints to improve accuracy and confidence.`
: "The local model could not match this icon confidently. Add more labeled examples in the Train tab to improve recognition quality.",
prayer: "",
identified_from: "Matched by local visual embedding similarity (fully local and free).",
};
}, [getImageEmbedding, image, trainingData]);

const identifyWithAnthropic = useCallback(async () => {
const trainingCtx = trainingLabelList
? `\n\nYou also have access to a custom training database with these labeled icons:\n${trainingLabelList}\nIf the image closely resembles one of these trained saints, prioritize that match.`
: "";
const base64 = image.split(",")[1];
const mediaType = image.startsWith("data:image/png") ? "image/png" : "image/jpeg";

const systemPrompt = `
You are an expert in Christian iconography with deep knowledge of saints from the Catholic, Orthodox, and other Christian traditions. When shown an icon or image of a saint, provide accurate identification and rich biographical information.${trainingCtx}

Always respond with a JSON object only (no markdown, no extra text) using this exact schema:
{
"name": "Full name of saint (e.g. Saint Francis of Assisi)",
"confidence": 0.0-1.0,
"feast_day": "Date(s) in format like 'October 4' or 'June 29 (Western) / June 29 (Eastern)'",
"died": "Year or approximate year of death, e.g. 'c. 1226 AD'",
"born": "Year or approximate year of birth, e.g. 'c. 1181 AD'",
"origin": "Country or region of origin",
"canonized_by": "Name of pope or council, e.g. 'Pope Gregory IX, 1228'",
"tradition": "Catholic / Eastern Orthodox / Anglican / etc.",
"patronage": ["list", "of", "patronages"],
"attributes": ["visual symbols", "seen in icon", "e.g. stigmata", "brown habit"],
"biography": "A rich 3-4 paragraph biography covering their life, spiritual significance, miracles, and legacy. Write in an elevated, reverent prose style.",
"prayer": "A short traditional or composed prayer to this saint (2-4 lines)",
"identified_from": "Brief note on what visual clues led to the identification"
}

If you cannot identify the saint with reasonable certainty, set confidence below 0.4 and name to "Unknown Saint" with whatever partial information you can provide. If the image does not appear to be a saint icon at all, explain in the biography field.`;

const resp = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: {
"Content-Type": "application/json",
"x-api-key": apiKey,
"anthropic-version": "2023-06-01",
},
body: JSON.stringify({
model: "claude-sonnet-4-20250514",
max_tokens: 1000,
system: systemPrompt,
messages: [{
role: "user",
content: [
{ type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
{ type: "text", text: "Please identify this saint icon and provide complete information." }
]
}]
}),
});

if (!resp.ok) {
const errText = await resp.text();
throw new Error(`API error ${resp.status}: ${errText.slice(0, 160)}`);
}

const data = await resp.json();
const text = data.content?.map((block) => block.text || "").join("") || "";
return parseModelJson(text);
}, [apiKey, image, trainingLabelList]);

const identifySaint = async () => {
if (!image) {
setError("Please upload or capture an icon image first.");
return;
}

setIdentifyEngine("local");
setLoading(true); setError(""); setResult(null);

try {
let parsed = await identifyLocally();
if (parsed.confidence < LOCAL_MATCH_THRESHOLD && apiKey) {
setIdentifyEngine("api");
parsed = await identifyWithAnthropic();
}
try {
const copticEntry = await fetchCopticCalendarEntry(parsed.name);
if (copticEntry) {
parsed = { ...parsed, ...copticEntry };
const copticBiography = await fetchCopticSynaxariumBiography(copticEntry);
if (copticBiography) parsed = { ...parsed, ...copticBiography };
}
} catch (calendarError) {
console.warn("Could not load Coptic Synaxarium entry", calendarError);
}
let enrichedResult = parsed;
try {
if (!parsed.coptic_calendar_url) {
const biography = await fetchSaintBiography(parsed.name);
if (biography) enrichedResult = { ...parsed, ...biography };
}
} catch (biographyError) {
console.warn("Could not load biography from Wikipedia", biographyError);
}
setResult(enrichedResult);
const entry = { ...enrichedResult, imageThumb: image, id: nextId() };
const newHistory = [entry, ...history].slice(0, MAX_HISTORY);
await saveHistory(newHistory);
} catch (e) {
setError("Could not identify the saint. Please try a clearer image. (" + (e.message || "parse error") + ")");
} finally {
setLoading(false);
}
};


// ── Train tab ─────────────────────────────────────────────────────────────
const addTraining = async () => {
if (!trainImg || !trainName.trim()) return;
const entry = { id: nextId(), name: trainName.trim(), image: trainImg };
await saveTraining([...trainingData, entry]);
setTrainName(""); setTrainImg(null);
};
const removeTraining = async (id) => {
await saveTraining(trainingData.filter(t => t.id !== id));
};

// ── Drag & drop ───────────────────────────────────────────────────────────
const onDrop = useCallback((e) => {
e.preventDefault(); setDrag(false);
const file = e.dataTransfer.files?.[0];
if (file) handleFile(file);
}, [handleFile]);

// ── Render ────────────────────────────────────────────────────────────────
return (
<div className="app-wrap">
<div className="container">
{/* Header */}
<header className="halo-header">
<p className="crown"><Sparkles size={13} /> Coptic icon archive</p>
<h1>Shere Pistavros</h1>
<p className="header-subtitle">Identify, preserve, and explore sacred iconography</p>
<div className="header-status">{cloudSyncStatus}</div>

</header>

{/* Tab nav */}
<div className="tab-row">
{[
{ key: "identify", label: "Identify", Icon: ScanSearch },
{ key: "train", label: "Train", Icon: LibraryBig },
{ key: "synaxarium", label: "Synaxarium", Icon: BookOpenText },
{ key: "history", label: "History", Icon: History },
].map(({ key, label, Icon })=>(
<button 
    key={key} 
    className={`tab-btn ${tab === key ? "active" : ""}`} 
    onClick={() => {setTab(key); setSelectedHistory(null);}}
>
<Icon size={16} strokeWidth={1.7} />
{label}
</button>
))}
</div>

{/* ── IDENTIFY TAB ── */}
{tab === "identify" && (
<div className="card workspace-card">
{!cameraOn && !image && (
<>
<div

className={`upload-zone ${drag?"drag":""}`}
onDragOver={e=>{e.preventDefault();setDrag(true);}}
onDragLeave={()=>setDrag(false)}
onDrop={onDrop}
onClick={()=>fileRef.current.click()}
>
<div className="uz-icon"><Upload size={25} strokeWidth={1.5} /></div>
<div className="uz-title">Add an icon for identification</div>
<div className="uz-sub">Drop an image here or browse your device</div>
<input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>handleFile(e.target.files[0])} />
</div>
<div className="result-action">
<button className="btn-ghost" onClick={startCamera}><Camera size={16} /> Use camera</button>

</div>
</>
)}

{/* Camera live */}
{cameraOn && (
<div className="camera-wrap" style={{marginBottom:"16px"}}>
<video ref={videoRef} playsInline style={{width:"100%"}} />
<div className="camera-overlay" />
<p style={{marginTop:"10px",textAlign:"center",color:"var(--muted)",fontStyle:"italic",fontSize:"14px"}}>{cameraStatus}</p>
<div style={{display:"flex",gap:"10px",justifyContent:"center",marginTop:"14px"}}>
<button className="btn-gold" onClick={capturePhoto}>Capture</button>
<button className="btn-ghost" onClick={stopCamera}>Cancel</button>
</div>
</div>

)}

{/* Image preview */}
{image && !cameraOn && (
<div style={{textAlign:"center",marginBottom:"20px"}}>
<div className="img-preview-wrap">
<img className="img-preview" src={image} alt="Icon preview" />
<button className="clear-btn" aria-label="Remove icon" title="Remove icon" onClick={()=>{setImage(null);setResult(null);setError("");}}><X size={16} /></button>
</div>
</div>
)}

{/* Identify button */}
{image && !cameraOn && !loading && (
<div className="result-action">
<button className="btn-gold" onClick={identifySaint}><ScanSearch size={17} /> Identify icon</button>
</div>
)}

{/* Loading */}
{loading && (
<div className="loading-halo">
<div className="halo-ring" />
<p>{identifyEngine === "api" ? "Checking an uncertain match through the hagiographic archives…" : "Running local trained model…"}</p>
</div>
)}

{/* Error */}
{error && <div className="err-box" style={{marginTop:"16px"}}>{error}</div>}

{/* Result */}
{result && !loading && (
<>

<hr className="gold-rule" />
<SaintProfile result={result} />
</>
)}
</div>
)}

{/* ── TRAIN TAB ── */}
{tab === "train" && (
<div className="card workspace-card">
<h2 className="view-heading"><LibraryBig size={20} strokeWidth={1.7} /> Training collection</h2>
<p className="view-copy">Build a local visual reference set with labeled icons. More varied examples give the matcher a stronger basis for comparison.</p>

<div className="collection-health">
<div className="health-metric"><div className="health-value">{trainingHealth.saints}</div><div className="health-label">Saints represented</div></div>
<div className="health-metric"><div className="health-value">{trainingHealth.icons}</div><div className="health-label">Total icon references</div></div>
<div className="health-metric"><div className="health-value">{trainingHealth.singleSampleSaints}</div><div className="health-label">Need another sample</div></div>
</div>
{trainingHealth.singleSampleSaints > 0 && <p className="training-guidance">Add a second icon for each under-sampled saint to reduce false visual matches.</p>}

<div className="subpanel">
<div className="subpanel-title">Collection backup</div>
<div className="action-row">
<button className="btn-ghost" onClick={exportBackup}><Download size={15} /> Export backup</button>
<button className="btn-ghost" onClick={() => backupFileRef.current.click()}><ArchiveRestore size={15} /> Restore backup</button>
<input
ref={backupFileRef}
type="file"
accept="application/json,.json"
hidden
onChange={async (e) => { await restoreBackup(e.target.files?.[0]); e.target.value = ""; }}
/>
</div>
</div>

<div className="subpanel">
<div className="subpanel-title">Downloaded icon collection</div>
<p className="training-guidance" style={{margin:"0 0 12px"}}>Download licensed Coptic, Greek, and Orthodox icon candidates. Review each source before approving it for training.</p>
<div className="action-row">
<button className="btn-gold" onClick={startSynaxariumImageDownload} disabled={downloaderStatus?.running}><Download size={15} /> {downloaderStatus?.running ? "Downloading Synaxarium…" : "Download Synaxarium icons"}</button>
<button className="btn-ghost" onClick={loadReviewCandidates} disabled={collectionImporting || downloaderStatus?.running}><LibraryBig size={15} /> {collectionImporting ? "Loading review queue…" : "Review downloaded icons"}</button>
<button className="btn-gold" onClick={importAllReviewCandidates} disabled={reviewLoading || collectionImporting || downloaderStatus?.running}><BadgeCheck size={15} /> {reviewLoading ? "Importing all…" : "Import all to training"}</button>
</div>
{reviewDenials.length > 0 && <p className="training-guidance" style={{margin:"12px 0 0"}}>{reviewDenials.length} denied candidate{reviewDenials.length === 1 ? "" : "s"} saved for replacement runs.</p>}
{downloaderStatus && (
<p className="training-guidance" style={{margin:"12px 0 0"}}>
{downloaderStatus.running
? (downloaderStatus.output?.at(-1) || "Downloading licensed images in the background…")
: downloaderStatus.exitCode === 0
? "Download completed. Import the downloaded icons when you are ready."
: "Download paused or unavailable. Check the terminal output, then try again later."}
</p>
)}
</div>
{reviewCandidates.length > 0 && (
<div className="subpanel">
<div className="subpanel-title">Icon review queue · {reviewCandidates.length} candidates</div>
<p className="training-guidance" style={{margin:"0 0 12px"}}>Approve only clear depictions of the named saint. Candidates remain outside the matcher until approved.</p>
<div className="train-grid">
{reviewCandidates.slice(0, 24).map((candidate) => (
<div className="train-item" key={candidate.id}>
<img src={candidate.path} alt={`${candidate.label} ${candidate.tradition} icon candidate`} />
<div className="ti-name">{candidate.label}</div>
<div className="hr-feast" style={{margin:"5px 0 8px"}}>{candidate.tradition} · score {candidate.qualityScore}</div>
<div className="action-row" style={{justifyContent:"center"}}>
<button className="btn-gold" style={{minHeight:"34px",padding:"7px 10px",fontSize:"10px"}} onClick={() => approveReviewCandidate(candidate)} disabled={reviewLoading}><BadgeCheck size={14} /> Approve</button>
<button className="btn-ghost" style={{minHeight:"34px",padding:"7px 10px",fontSize:"10px"}} onClick={() => denyReviewCandidate(candidate)} disabled={reviewLoading}><X size={14} /> Deny</button>
<a href={candidate.sourceUrl} target="_blank" rel="noreferrer" style={{color:"var(--gold)",display:"inline-flex"}} title="Open source"><ExternalLink size={16} /></a>
</div>
</div>
))}
</div>
</div>
)}
<div className="subpanel">
<div className="subpanel-title">Collection maintenance</div>
<button className="btn-ghost" onClick={clearTrainingCollection}><X size={15} /> Clear training collection</button>
</div>
{error && <div className="err-box" style={{marginBottom:"16px"}}>{error}</div>}

{/* Add new */}
<div className="subpanel">
<div className="subpanel-title">Add a visual reference</div>
<div
className="upload-zone"
style={{padding:"24px",marginBottom:"14px"}}
onClick={()=>trainFileRef.current.click()}
>
{trainImg

? <img src={trainImg} alt="train preview" style={{maxHeight:"120px",maxWidth:"100%",display:"block",margin:"0 auto"}} />
: <><div className="uz-icon" style={{fontSize:"28px"}}><Upload size={22} /></div><div className="uz-title">Select an icon image</div></>
}
<input ref={trainFileRef} type="file" accept="image/*" hidden
onChange={async e => { const f=e.target.files[0]; if(f){const u=await readFile(f);setTrainImg(u);}}} />
</div>
<input
type="text"
placeholder="Saint's name (e.g. Saint Seraphim of Sarov)"
value={trainName}
onChange={e=>setTrainName(e.target.value)}
className="app-input"
style={{marginBottom:"12px"}}
/>
<button className="btn-gold" onClick={addTraining} disabled={!trainImg||!trainName.trim()}>
<LibraryBig size={16} /> Add to collection
</button>
</div>

{/* Grid */}
{trainingData.length === 0
? <p style={{color:"var(--muted)",fontStyle:"italic",textAlign:"center",padding:"24px 0"}}>No training data yet. Add labeled icons above.</p>
: <>
<div className="subpanel-title">
{trainingData.length} ICON{trainingData.length!==1?"S":""} IN DATABASE
</div>
<div className="train-grid">
{trainingData.map(t=>(
<div key={t.id} className="train-item">
<img src={t.image} alt={t.name} />
<div className="ti-name">{t.name}</div>
<button className="ti-del" aria-label={`Remove ${t.name}`} title={`Remove ${t.name}`} onClick={()=>removeTraining(t.id)}><X size={12} /></button>
</div>
))}

</div>
</>
}
</div>
)}

{/* ── SYNAXARIUM TAB ── */}
{tab === "synaxarium" && (
<div className="card workspace-card">
<h2 className="view-heading"><BookOpenText size={20} strokeWidth={1.7} /> Coptic Synaxarium</h2>
<p className="view-copy">Browse the calendar, inspect commemorations, and send canonical saint labels directly into your visual training collection.</p>
<button className="btn-gold" onClick={importSynaxariumCatalog} disabled={catalogLoading}>
<BookOpenText size={16} /> {catalogLoading ? "Importing Synaxarium…" : synaxariumCatalog.length ? "Refresh catalog" : "Import complete Synaxarium"}
</button>

{synaxariumCatalog.length > 0 && (
<>
<div className="subpanel-title" style={{margin:"24px 0 12px"}}>
{synaxariumCatalog.length} COMMEMORATIONS AVAILABLE
</div>
<input
type="search"
placeholder="Search a saint, feast, or commemoration"
value={catalogQuery}
onChange={(e) => setCatalogQuery(e.target.value)}
className="app-input"
style={{marginBottom:"14px"}}
/>
{catalogResults.map((entry) => (
<div key={entry.id} className="history-row" style={{cursor:"default"}}>
<div style={{minWidth:"118px",color:"var(--gold)",fontFamily:"Cinzel,serif",fontSize:"12px",lineHeight:"1.4"}}>
{entry.feastDay}<br />{entry.gregorianDate}
</div>
<div style={{flex:1}}>
<div className="hr-name" style={{fontFamily:"EB Garamond,serif",fontSize:"16px",color:"var(--text)"}}>{entry.commemoration}</div>
{entry.trainingLabel && <div className="hr-feast">Training label: {entry.trainingLabel}</div>}
</div>
{entry.trainingLabel && (
<button className="btn-ghost" onClick={() => { setTrainName(entry.trainingLabel); setTab("train"); }}>
<LibraryBig size={14} /> Use label
</button>
)}
<a href={entry.url} target="_blank" rel="noreferrer" style={{marginLeft:"10px",color:"var(--gold)",fontSize:"13px",display:"inline-flex",alignItems:"center",gap:"4px"}}><ExternalLink size={14} /> Source</a>
</div>
))}
{catalogResults.length === 0 && <p style={{color:"var(--muted)",fontStyle:"italic",textAlign:"center",padding:"24px 0"}}>No matching commemorations found.</p>}
</>
)}
</div>
)}

{/* ── HISTORY TAB ── */}
{tab === "history" && (
<div className="card workspace-card">
<h2 className="view-heading"><History size={20} strokeWidth={1.7} /> Identification history</h2>
<p className="view-copy">Your latest identifications are stored locally for quick reference.</p>


{selectedHistory ? (
<>
<button className="btn-ghost" style={{marginBottom:"20px"}} onClick={()=>setSelectedHistory(null)}><ChevronLeft size={15} /> Back to history</button>
<div style={{textAlign:"center",marginBottom:"20px"}}>
<img src={selectedHistory.imageThumb} alt="" className="img-preview" style={{maxHeight:"240px"}} />
</div>
<SaintProfile result={selectedHistory} />
</>
) : history.length === 0 ? (
<p style={{color:"var(--muted)",fontStyle:"italic",textAlign:"center",padding:"24px 0"}}>No identifications yet.</p>
) : (

history.map(h=>(
<div key={h.id} className="history-row" onClick={()=>setSelectedHistory(h)}>
<img src={h.imageThumb} alt={h.name} />
<div>
<div className="hr-name">{h.name}</div>
<div className="hr-feast">Feast: {h.feast_day || "Unknown"}</div>
</div>
<div style={{marginLeft:"auto",color:"var(--muted)",display:"grid",placeItems:"center"}}><ChevronRight size={18} /></div>
</div>
))
)}
</div>
)}

{/* Footer */}
<p style={{textAlign:"center",marginTop:"36px",color:

"var(--muted)",fontSize:"13px",fontStyle:"italic",opacity:0.6}}>
✦ © 2026 | Peter Mikhail | All rights reserved ✦
</p>
</div>
</div>
);
}

// ── Saint Profile Component ────────────────────────────────────────────────
function SaintProfile({ result }) {
const conf = Math.round((result.confidence || 0) * 100);
return (
<div className="saint-profile">
<div className="saint-name">{result.name}</

div>
{result.feast_day && <div className="feast-badge">Feast Day: {result.feast_day}</div>}

{/* Confidence */}
<div className="confidence-bar-wrap">
<div className="cb-label">Identification Confidence — {conf}%</div>
<div className="cb-track"><div className="cb-fill" style={{width:`${conf}%`}} /></div>
</div>

{result.local_candidates?.length > 0 && (
<div className="candidate-panel">
<div className="candidate-heading">LOCAL VISUAL CANDIDATES</div>
{result.local_candidates.map((candidate, index) => (
<div className="candidate-row" key={candidate.name}>
<span className="candidate-rank">0{index + 1}</span>
<span className="candidate-name">{candidate.name}</span>
<span className="candidate-score">{candidate.similarity}% similar</span>
</div>
))}
</div>
)}

{/* Info grid */}
<div className="info-grid">
{result.born && <Cell label="Born" val={result.born} />}
{result.died && <Cell label="Died" val={result.died} />}
{result.origin && <Cell label="Origin" val={result.origin} />}

{result.tradition && <Cell label="Tradition" val={result.tradition} centered />}
{result.canonized_by && <Cell label="Canonized By" val={result.canonized_by} />}
</div>

{/* Biography */}
{result.biography && (
<>
<hr className="gold-rule" />
<div style={{fontFamily:"Cinzel,serif",fontSize:"11px",color:"var(--gold)",letterSpacing:"2px",marginBottom:"8px"}}>BIOGRAPHY</div>
<p className="bio-text">{cleanBiographyText(result.biography)}</p>
{result.biography_url && (
<a
href={result.biography_url}
target="_blank"
rel="noreferrer"
style={{display:"inline-block",marginTop:"12px",color:"var(--gold)",fontSize:"14px"}}
>
Read the full biography on {result.biography_source || "Wikipedia"}
</a>
)}
</>
)}

{result.doxology_url && (
<>
<hr className="gold-rule" />
<div style={{fontFamily:"Cinzel,serif",fontSize:"11px",color:"var(--gold)",letterSpacing:"2px",marginBottom:"8px"}}>DOXOLOGIES</div>
<a
href={result.doxology_url}
target="_blank"
rel="noreferrer"
style={{display:"inline-block",color:"var(--gold)",fontSize:"14px"}}
>
View {result.name}'s doxologies on Tasbeha
</a>
</>
)}

{/* Patronage */}

{result.patronage?.length > 0 && (
<>
<hr className="gold-rule" />
<div style={{fontFamily:"Cinzel,serif",fontSize:"11px",color:"var(--gold)",letterSpacing:"2px",marginBottom:"8px"}}>PATRONAGE</div>
<div className="attrib-list">
{result.patronage.map((p,i)=><span key={i} className="attrib-tag">{p}</span>)}
</div>
</>
)}

{/* Attributes / symbols */}
{result.attributes?.length > 0 && (
<>
<hr className="gold-rule" />
<div 

style={{fontFamily:"Cinzel,serif",fontSize:"11px",color:"var(--gold)",letterSpacing:"2px",marginBottom:"8px"}}>ICONOGRAPHIC ATTRIBUTES</div>
<div className="attrib-list">
{result.attributes.map((a,i)=><span key={i} className="attrib-tag">{a}</span>)}
</div>
</>
)}

{/* Prayer */}
{result.prayer && (
<>
<hr className="gold-rule" />
<div style={{fontFamily:"Cinzel,serif",fontSize:"11px",color:"var(--gold)",letterSpacing:"2px",marginBottom:"8px"}}>PRAYER</div>

<p style={{fontStyle:"italic",color:"var(--muted)",lineHeight:"1.75",fontSize:"15px",textAlign:"center",padding:"0 10px"}}>
{result.prayer}
</p>
</>
)}

{/* Identified from */}
{result.identified_from && (
<p style={{marginTop:"20px",fontSize:"13px",color:"var(--muted)",fontStyle:"italic",borderTop:"1px solid var(--border)",paddingTop:"14px"}}>
<strong style={{color:"var(--gold)",fontFamily:"Cinzel,serif",fontSize:"11px",letterSpacing:"1px"}}>IDENTIFIED FROM: </strong>
{result.identified_from}
</p>
)}

</div>
);
}

function Cell({ label, val, centered = false }) {
return (
<div className="info-cell" style={centered ? { textAlign: "center", gridColumn: "1 / -1", justifySelf: "center", minWidth: "180px" } : undefined}>
<div className="ic-label">{label}</div>
<div className="ic-val">{val}</div>
</div>
);
}
