const SubTrackerUI = {
  formatMoney(amount) {
    return `${Math.round(amount).toLocaleString('ko-KR')}원`;
  },

  formatDday(diffDays) {
    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    if (diffDays === 0) return 'D-day';
    return `D-${diffDays}`;
  },

  renderSubscriptionList(subscriptions) {
    const list = document.getElementById('subscription-list');
    if (!subscriptions.length) {
      list.innerHTML = `<div class="empty-state">아직 구독이 없습니다.</div>`;
      return;
    }

    list.innerHTML = subscriptions.map((sub) => {
      const date = new Date(sub.nextPaymentDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = getDaysUntilNextPayment(
        today.toISOString().slice(0, 10),
        sub.nextPaymentDate
      );

      return `<article class="subscription-card" data-id="${sub.id}">
        <div class="subscription-main">
          <div class="subscription-meta">
            <span class="subscription-name">${this.escapeHtml(sub.name)}</span>
            <span class="subscription-category">${this.escapeHtml(sub.category)}</span>
            <span class="subscription-dday">${this.formatDday(diffDays)}</span>
          </div>
          <div class="subscription-meta">
            <span class="subscription-amount">${this.formatMoney(getMonthlyAmount(sub))}</span>
            <span class="subscription-date">${sub.nextPaymentDate} · ${sub.paymentMethod}</span>
          </div>
        </div>
        <div class="subscription-controls">
          <button class="edit-button" data-action="edit" data-id="${sub.id}">수정</button>
          <button class="delete-button" data-action="delete" data-id="${sub.id}">삭제</button>
        </div>
      </article>`;
    }).join('');
  },

  renderSummary(subscriptions) {
    const monthlyTotal = getTotalMonthlyAmount(subscriptions);
    const yearlyTotal = getTotalYearlyAmount(subscriptions);
    const thisWeekPay = this.getThisWeekPayments(subscriptions);

    document.getElementById('monthly-total').textContent = this.formatMoney(monthlyTotal);
    document.getElementById('yearly-total').textContent = this.formatMoney(yearlyTotal);
    document.getElementById('weekly-payment-total').textContent = this.formatMoney(thisWeekPay);
  },

  getThisWeekPayments(subscriptions) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayText = today.toISOString().slice(0, 10);
    const weekEnd = 7;

    const payable = subscriptions.filter((sub) => {
      const diffDays = getDaysUntilNextPayment(todayText, sub.nextPaymentDate);
      return diffDays >= 0 && diffDays <= weekEnd;
    });

    return getTotalMonthlyAmount(payable);
  },

  renderCategoryChart(subscriptions) {
    const chart = document.getElementById('category-chart');
    const categoryMap = getMonthlyAmountByCategory(subscriptions);
    const categories = Object.keys(categoryMap);
    const maxCategory = Math.max(...Object.values(categoryMap), 1);

    if (!categories.length) {
      chart.innerHTML = `<div class="empty-state">카테고리 데이터가 없습니다.</div>`;
      return;
    }

    const rows = categories.map((category) => {
      const amount = categoryMap[category];
      const percent = Math.round((amount / getTotalMonthlyAmount(subscriptions)) * 100);
      const width = Math.max((amount / maxCategory) * 100, 6);
      const color = this.getColorForCategory(category);

      return `<div class="chart-row">
        <span class="chart-label">${this.escapeHtml(category)}</span>
        <span class="chart-track">
          <span class="chart-bar" style="width: ${width}%; background: ${color};"></span>
        </span>
        <span class="chart-percent">${percent}%</span>
      </div>`;
    });

    chart.innerHTML = rows.join('');
  },

  getColorForCategory(category) {
    const palette = ['#4f46e5', '#10b981', '#f97316', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
  },

  escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
