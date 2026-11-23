import React from 'react';

export function FinancialSummaryBox({ currentBalance, deltaPoints, direction = 'DEBIT', reason, extraRows = [] }) {
  const expected = direction === 'CREDIT' ? currentBalance + deltaPoints : currentBalance - deltaPoints;
  return (
    <div className="financial-box">
      <div className="financial-row">
        <span>Current Wallet Balance</span>
        <strong>{currentBalance.toLocaleString()} pts</strong>
      </div>
      {extraRows.map((row) => (
        <div className="financial-row" key={row.label}>
          <span>{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
      <div className="financial-row">
        <span>{direction === 'CREDIT' ? 'Points to Credit' : 'Points to Deduct'}</span>
        <strong style={{ color: direction === 'CREDIT' ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {direction === 'CREDIT' ? '+' : '-'}{deltaPoints.toLocaleString()} pts
        </strong>
      </div>
      <div className="financial-row total">
        <span>Expected Final Balance</span>
        <span style={{ color: expected < 0 ? 'var(--color-danger)' : 'var(--color-navy-dark)' }}>
          {expected.toLocaleString()} pts
        </span>
      </div>
      {reason && <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>Reason: {reason}</p>}
    </div>
  );
}
