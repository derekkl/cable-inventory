'use strict';

// --- Connector Icons (side profile SVGs) ---

function connectorIcon(type, subtype, end = {}) {
  const s = `xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 32" width="60" height="24"`;

  switch (type) {
    case '3.5mm': {
      const rings = subtype === 'TRS'
        ? `<rect x="20" y="13" width="5" height="6" fill="#111"/><rect x="33" y="13" width="5" height="6" fill="#111"/>`
        : `<rect x="26" y="13" width="5" height="6" fill="#111"/>`;
      return `<svg ${s}>
        <rect x="42" y="5" width="34" height="22" rx="6" fill="#555"/>
        <rect x="5" y="13" width="40" height="6" fill="#aaa"/>
        ${rings}
        <ellipse cx="5" cy="16" rx="4" ry="3" fill="#bbb"/>
      </svg>`;
    }
    case '1/4"': {
      const rings = subtype === 'TRS'
        ? `<rect x="18" y="11" width="5" height="10" fill="#111"/><rect x="31" y="11" width="5" height="10" fill="#111"/>`
        : `<rect x="24" y="11" width="5" height="10" fill="#111"/>`;
      return `<svg ${s}>
        <rect x="40" y="4" width="36" height="24" rx="6" fill="#555"/>
        <rect x="5" y="11" width="38" height="10" fill="#aaa"/>
        ${rings}
        <ellipse cx="5" cy="16" rx="4" ry="5" fill="#bbb"/>
      </svg>`;
    }
    case 'RCA': {
      const colors = end.colors || ['grey'];
      if (end.pairing === 'pair') {
        // Stacked pair — two RCA plugs, each colored
        const p = `xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 64" width="60" height="48"`;
        const rcaPlug = (y, color) => {
          const fill = COLOR_MAP[color] || '#888';
          return `
            <rect x="28" y="${y+3}" width="48" height="22" rx="5" fill="${fill}" opacity="0.85"/>
            <rect x="18" y="${y+7}" width="14" height="14" rx="3" fill="#777"/>
            <rect x="4"  y="${y+11}" width="24" height="6" rx="3" fill="#bbb"/>`;
        };
        return `<svg ${p}>
          ${rcaPlug(0,  colors[0] || 'grey')}
          ${rcaPlug(32, colors[1] || 'grey')}
        </svg>`;
      }
      // Single RCA
      const fill = COLOR_MAP[colors[0]] || '#888';
      return `<svg ${s}>
        <rect x="28" y="5" width="48" height="22" rx="5" fill="${fill}" opacity="0.85"/>
        <rect x="18" y="9" width="14" height="14" rx="3" fill="#777"/>
        <rect x="4" y="13" width="24" height="6" rx="3" fill="#bbb"/>
      </svg>`;
    }
    case 'XLR': {
      // Face-on (top-down) view — circular shell, keyway, 3-pin triangle
      const f = `xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28"`;
      const pinFill = subtype === 'female' ? '#111' : '#bbb';
      const pinStroke = subtype === 'female' ? '#555' : 'none';
      return `<svg ${f}>
        <!-- outer shell -->
        <circle cx="16" cy="16" r="14" fill="#444" stroke="#666" stroke-width="1"/>
        <!-- inner face -->
        <circle cx="16" cy="16" r="11" fill="#333"/>
        <!-- keyway notch at top -->
        <rect x="13" y="2" width="6" height="5" rx="1" fill="#444"/>
        <!-- pin 1 (top center) -->
        <circle cx="16" cy="9"  r="2.5" fill="${pinFill}" stroke="${pinStroke}" stroke-width="0.5"/>
        <!-- pin 2 (bottom left) -->
        <circle cx="10" cy="21" r="2.5" fill="${pinFill}" stroke="${pinStroke}" stroke-width="0.5"/>
        <!-- pin 3 (bottom right) -->
        <circle cx="22" cy="21" r="2.5" fill="${pinFill}" stroke="${pinStroke}" stroke-width="0.5"/>
        <!-- male/female indicator text -->
        <text x="16" y="17" text-anchor="middle" font-size="5" fill="#888" font-family="monospace">${subtype === 'female' ? 'F' : 'M'}</text>
      </svg>`;
    }
    case 'MIDI DIN': {
      // Face-on view — fully circular housing, 5-pin horseshoe arc
      const f = `xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28"`;
      return `<svg ${f}>
        <!-- outer circular housing -->
        <circle cx="16" cy="16" r="14" fill="#444" stroke="#666" stroke-width="1"/>
        <!-- inner face -->
        <circle cx="16" cy="16" r="11" fill="#333"/>
        <!-- 5 pins in horseshoe arc (open at bottom) -->
        <circle cx="16" cy="7"  r="2" fill="#bbb"/>
        <circle cx="24" cy="11" r="2" fill="#bbb"/>
        <circle cx="22" cy="22" r="2" fill="#bbb"/>
        <circle cx="10" cy="22" r="2" fill="#bbb"/>
        <circle cx="8"  cy="11" r="2" fill="#bbb"/>
      </svg>`;
    }
    case 'USB-C': {
      const f = `xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28"`;
      return `<svg ${f}>
        <!-- outer oval housing -->
        <rect x="4" y="9" width="24" height="14" rx="7" fill="#444" stroke="#666" stroke-width="1"/>
        <!-- inner tongue/blade -->
        <rect x="8" y="13" width="16" height="6" rx="3" fill="#888"/>
      </svg>`;
    }
    default:
      return `<svg ${s}>
        <rect x="10" y="10" width="60" height="12" rx="4" fill="#555"/>
        <text x="40" y="20" text-anchor="middle" font-size="8" fill="#aaa">${type}</text>
      </svg>`;
  }
}

const COLOR_MAP = {
  red: '#e94560', white: '#f0f0f0', black: '#444', blue: '#4a90e2',
  green: '#7ed321', yellow: '#f8e71c', grey: '#888', gray: '#888',
  orange: '#f5a623',
};

let cables = [];
let editingId = null;

// --- Data ---

function loadCables() {
  const stored = localStorage.getItem('cables');
  if (stored) cables = JSON.parse(stored);
}

function save() {
  localStorage.setItem('cables', JSON.stringify(cables));
}

function importFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      cables = JSON.parse(e.target.result);
      save();
      render();
    } catch {
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
}

function exportFile() {
  const blob = new Blob([JSON.stringify(cables, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cables.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function nextId() {
  return cables.length ? Math.max(...cables.map(c => c.id)) + 1 : 1;
}

// --- Formatting ---

function connectorLabel(end) {
  let label = end.type;
  if (end.subtype) label += ` ${end.subtype}`;
  if (end.gender && end.gender !== 'n/a') label += ` ${end.gender}`;
  if (end.pairing === 'pair') label += ' pair';
  return label;
}

function connectorDisplay(end) {
  const iconSubtype = end.type === 'XLR' ? end.gender : end.subtype;
  const icon = connectorIcon(end.type, iconSubtype, end);
  const label = connectorLabel(end);
  return `<span class="connector-display"><span class="connector-icon">${icon}${colorDots(end.colors)}</span><span class="connector-name">${label}</span></span>`;
}

function colorDots(colors) {
  if (!colors || colors.length === 0) return '';
  return `<span class="color-dots">${colors.map(c =>
    `<span class="color-dot" style="background:${COLOR_MAP[c] || '#888'}" title="${c}"></span>`
  ).join('')}</span>`;
}

function conditionClass(c) {
  return `condition-${c || 'unknown'}`;
}

// --- Render ---

function renderStats(filtered) {
  const total = filtered.reduce((sum, c) => sum + (c.quantity || 1), 0);
  const types = [...new Set(filtered.map(c => c.signal_type))];
  const adapters = filtered.filter(c => c.is_adapter).length;

  document.getElementById('stats').innerHTML = `
    <div class="stat"><span>${total}</span>Total Cables</div>
    <div class="stat"><span>${filtered.length}</span>Unique Types</div>
    <div class="stat"><span>${types.length}</span>Signal Types</div>
    ${adapters ? `<div class="stat"><span>${adapters}</span>Adapters</div>` : ''}
  `;
}

function renderList(filtered) {
  const el = document.getElementById('cable-list');
  if (filtered.length === 0) {
    el.innerHTML = '<div class="empty">No cables found.</div>';
    return;
  }

  el.innerHTML = filtered.map(c => {
    const endA = connectorDisplay(c.end_a);
    const endB = connectorDisplay(c.end_b);
    const length = c.length ? `${c.length} ${c.length_unit}` : '';

    return `
      <div class="cable-card" data-id="${c.id}">
        <div class="cable-main">
          <div class="cable-ends">${endA}<span class="arrow">→</span>${endB}</div>
          <div class="cable-signal">${c.signal_type}</div>
          ${c.brand ? `<div class="cable-brand">${c.brand}</div>` : ''}
          ${c.is_adapter ? '<div class="cable-adapter-badge">ADAPTER</div>' : ''}
          ${c.notes ? `<div class="cable-notes">${c.notes}</div>` : ''}
          ${length ? `<div class="cable-notes">${length}</div>` : ''}
        </div>
        <div class="cable-qty">×${c.quantity || 1}</div>
        <div class="cable-condition ${conditionClass(c.condition)}">${c.condition || 'unknown'}</div>
        <div class="cable-actions">
          <button onclick="editCable(${c.id})">Edit</button>
          <button onclick="deleteCable(${c.id})">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function render() {
  const search = document.getElementById('search').value.toLowerCase();
  const signal = document.getElementById('filter-signal').value;

  const filtered = cables.filter(c => {
    const text = JSON.stringify(c).toLowerCase();
    const matchSearch = !search || text.includes(search);
    const matchSignal = !signal || c.signal_type === signal;
    return matchSearch && matchSignal;
  });

  renderStats(filtered);
  renderList(filtered);
}

// --- Modal ---

function openModal(cable = null) {
  editingId = cable ? cable.id : null;
  document.getElementById('modal-title').textContent = cable ? 'Edit Cable' : 'Add Cable';
  const form = document.getElementById('cable-form');
  form.reset();

  if (cable) {
    form.end_a_type.value    = cable.end_a.type || '';
    form.end_a_subtype.value = cable.end_a.subtype || '';
    form.end_a_gender.value  = cable.end_a.gender || 'male';
    form.end_a_pairing.value = cable.end_a.pairing || 'single';
    form.end_a_colors.value  = (cable.end_a.colors || []).join(', ');
    form.end_b_type.value    = cable.end_b.type || '';
    form.end_b_subtype.value = cable.end_b.subtype || '';
    form.end_b_gender.value  = cable.end_b.gender || 'male';
    form.end_b_pairing.value = cable.end_b.pairing || 'single';
    form.end_b_colors.value  = (cable.end_b.colors || []).join(', ');
    form.signal_type.value   = cable.signal_type || 'stereo audio';
    form.quantity.value      = cable.quantity || 1;
    form.condition.value     = cable.condition || 'unknown';
    form.length.value        = cable.length || '';
    form.length_unit.value   = cable.length_unit || '';
    form.brand.value         = cable.brand || '';
    form.notes.value         = cable.notes || '';
    form.is_adapter.value    = cable.is_adapter ? 'true' : 'false';
  }

  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  editingId = null;
}

function parseColors(str) {
  if (!str.trim()) return null;
  return str.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

document.getElementById('cable-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;

  const cable = {
    id: editingId || nextId(),
    end_a: {
      type:    form.end_a_type.value,
      subtype: form.end_a_subtype.value || null,
      gender:  form.end_a_gender.value,
      pairing: form.end_a_pairing.value,
      colors:  parseColors(form.end_a_colors.value),
    },
    end_b: {
      type:    form.end_b_type.value,
      subtype: form.end_b_subtype.value || null,
      gender:  form.end_b_gender.value,
      pairing: form.end_b_pairing.value,
      colors:  parseColors(form.end_b_colors.value),
    },
    signal_type:  form.signal_type.value,
    quantity:     parseInt(form.quantity.value) || 1,
    condition:    form.condition.value,
    length:       form.length.value ? parseFloat(form.length.value) : null,
    length_unit:  form.length_unit.value || null,
    brand:        form.brand.value.trim() || null,
    notes:        form.notes.value.trim() || null,
    is_adapter:   form.is_adapter.value === 'true',
  };

  if (editingId) {
    const idx = cables.findIndex(c => c.id === editingId);
    if (idx !== -1) cables[idx] = cable;
  } else {
    cables.push(cable);
  }

  save();
  closeModal();
  render();
});

// --- Actions ---

function editCable(id) {
  const cable = cables.find(c => c.id === id);
  if (cable) openModal(cable);
}

function deleteCable(id) {
  if (!confirm('Delete this cable?')) return;
  cables = cables.filter(c => c.id !== id);
  save();
  render();
}

// --- Init ---

document.getElementById('btn-add').addEventListener('click', () => openModal());
document.getElementById('btn-cancel').addEventListener('click', closeModal);
document.getElementById('search').addEventListener('input', render);
document.getElementById('filter-signal').addEventListener('change', render);

document.getElementById('btn-import').addEventListener('click', () => {
  document.getElementById('file-input').click();
});
document.getElementById('file-input').addEventListener('change', e => {
  if (e.target.files[0]) importFile(e.target.files[0]);
  e.target.value = '';
});
document.getElementById('btn-export').addEventListener('click', exportFile);

loadCables();
render();
