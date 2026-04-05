'use strict';

const COLOR_MAP = {
  red: '#e94560', white: '#f0f0f0', black: '#444', blue: '#4a90e2',
  green: '#7ed321', yellow: '#f8e71c', grey: '#888', gray: '#888',
  orange: '#f5a623',
};

let cables = [];
let editingId = null;

// --- Data ---

async function loadCables() {
  const stored = localStorage.getItem('cables');
  if (stored) {
    cables = JSON.parse(stored);
  } else {
    const res = await fetch('data/cables.json');
    cables = await res.json();
    save();
  }
}

function save() {
  localStorage.setItem('cables', JSON.stringify(cables));
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
    const endA = connectorLabel(c.end_a) + colorDots(c.end_a.colors);
    const endB = connectorLabel(c.end_b) + colorDots(c.end_b.colors);
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

loadCables().then(render);
