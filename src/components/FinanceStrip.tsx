import { FINANCE_BADGES } from '../constants/branding';

export function FinanceStrip() {
  return (
    <ul className="finance-strip" aria-label="Domaines métier bancaires">
      {FINANCE_BADGES.map((badge) => (
        <li key={badge} className="finance-strip__badge">
          {badge}
        </li>
      ))}
    </ul>
  );
}
