const STORE_KEY = 'sub-tracker-data-v1';

const defaultSubscriptions = [
  {
    id: 'sub_1',
    name: '넷플릭스',
    amount: 13500,
    cycle: 'monthly',
    nextPaymentDate: '2026-08-16',
    category: '영상',
    paymentMethod: '신한카드'
  },
  {
    id: 'sub_2',
    name: '스포티파이',
    amount: 10900,
    cycle: 'monthly',
    nextPaymentDate: '2026-08-20',
    category: '음악',
    paymentMethod: '현대카드'
  },
  {
    id: 'sub_3',
    name: '헬스장',
    amount: 45000,
    cycle: 'monthly',
    nextPaymentDate: '2026-09-01',
    category: '운동',
    paymentMethod: 'KB카드'
  },
  {
    id: 'sub_4',
    name: '클라우드',
    amount: 120000,
    cycle: 'yearly',
    nextPaymentDate: '2027-02-01',
    category: '생산성',
    paymentMethod: 'BC카드'
  }
];

let subscriptions = loadSubscriptions();

function loadSubscriptions() {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) {
    localStorage.setItem(STORE_KEY, JSON.stringify(defaultSubscriptions));
    return defaultSubscriptions;
  }

  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : defaultSubscriptions;
  } catch (err) {
    localStorage.setItem(STORE_KEY, JSON.stringify(defaultSubscriptions));
    return defaultSubscriptions;
  }
}

function saveSubscriptions() {
  localStorage.setItem(STORE_KEY, JSON.stringify(subscriptions));
}

function nextId() {
  if (!subscriptions.length) return 'sub_1';
  const max = subscriptions.reduce((memo, item) => Math.max(memo, Number(item.id.replace(/\D/g, '')) || 0), 0);
  return `sub_${max + 1}`;
}

function render() {
  SubTrackerUI.renderSummary(subscriptions);
  SubTrackerUI.renderSubscriptionList(subscriptions);
  SubTrackerUI.renderCategoryChart(subscriptions);
}

function resetForm() {
  document.getElementById('subscription-form').reset();
  document.getElementById('cycle').value = 'monthly';
  document.getElementById('paymentMethod').value = '신한카드';
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);

  const newSub = {
    id: nextId(),
    name: String(formData.get('name')).trim(),
    amount: Number(formData.get('amount')),
    cycle: String(formData.get('cycle')),
    nextPaymentDate: String(formData.get('nextPaymentDate')),
    category: String(formData.get('category')).trim(),
    paymentMethod: String(formData.get('paymentMethod'))
  };

  if (!newSub.name || !newSub.category || !newSub.nextPaymentDate || newSub.amount <= 0) {
    return;
  }

  subscriptions.push(newSub);
  saveSubscriptions();
  render();
  resetForm();
}

function handleListClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === 'delete') {
    subscriptions = subscriptions.filter((item) => item.id !== id);
    saveSubscriptions();
    render();
  }

  if (action === 'edit') {
    const sub = subscriptions.find((item) => item.id === id);
    if (!sub) return;

    document.getElementById('name').value = sub.name;
    document.getElementById('amount').value = sub.amount;
    document.getElementById('cycle').value = sub.cycle;
    document.getElementById('nextPaymentDate').value = sub.nextPaymentDate;
    document.getElementById('category').value = sub.category;
    document.getElementById('paymentMethod').value = sub.paymentMethod;

    const form = document.getElementById('subscription-form');
    form.dataset.editingId = id;
    form.querySelector('[type="submit"]').textContent = '수정하기';
  }
}

function handleFormEdit(event) {
  const form = event.currentTarget;
  if (!form.dataset.editingId) return;

  event.preventDefault();
  const formData = new FormData(form);
  const targetId = form.dataset.editingId;
  const target = subscriptions.find((item) => item.id === targetId);

  if (!target) return;

  target.name = String(formData.get('name')).trim();
  target.amount = Number(formData.get('amount'));
  target.cycle = String(formData.get('cycle'));
  target.nextPaymentDate = String(formData.get('nextPaymentDate'));
  target.category = String(formData.get('category')).trim();
  target.paymentMethod = String(formData.get('paymentMethod'));

  if (!target.name || !target.category || !target.nextPaymentDate || target.amount <= 0) {
    return;
  }

  saveSubscriptions();
  render();
  resetForm();
  delete form.dataset.editingId;
  form.querySelector('[type="submit"]').textContent = '추가하기';
}

function init() {
  const form = document.getElementById('subscription-form');
  const list = document.getElementById('subscription-list');

  form.addEventListener('submit', (event) => {
    if (form.dataset.editingId) {
      handleFormEdit(event);
    } else {
      handleFormSubmit(event);
    }
  });

  list.addEventListener('click', handleListClick);

  document.getElementById('seed-button').addEventListener('click', () => {
    subscriptions = defaultSubscriptions.map((item) => ({ ...item }));
    saveSubscriptions();
    resetForm();
    render();
  });

  render();
}

init();
