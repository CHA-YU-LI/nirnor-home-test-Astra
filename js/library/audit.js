const cells = document.querySelectorAll('[data-status]');
cells.forEach(cell => { cell.textContent = '實作完成 / 待瀏覽器驗證'; });

try {
  const response = await fetch('evidence/validation.json');
  if (response.ok) {
    const report = await response.json();
    for (const item of report.demos || []) {
      const cell = [...cells].find(node => node.dataset.status === item.slug);
      if (cell) cell.textContent = item.passed === true
        ? '實作完成 / 桌面與手機檢查通過'
        : item.status === 'pending'
          ? '實作完成 / 待瀏覽器驗證'
          : '實作完成 / 驗證有待處理項目';
    }
  }
} catch {
  // No report is an explicit pending state, not a passing result.
}
