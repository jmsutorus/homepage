-- Migration: Add budget tables (income, fixed costs)
-- Description: Track monthly income and fixed costs for budget calculations

-- ==================== Budget Income ====================

CREATE TABLE IF NOT EXISTS budget_income (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  label TEXT DEFAULT 'Primary',
  effective_date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_budget_income_userId ON budget_income(userId);
CREATE INDEX IF NOT EXISTS idx_budget_income_effective_date ON budget_income(effective_date);

CREATE TRIGGER IF NOT EXISTS update_budget_income_timestamp
AFTER UPDATE ON budget_income
BEGIN
  UPDATE budget_income SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ==================== Budget Fixed Costs ====================

CREATE TABLE IF NOT EXISTS budget_fixed_costs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'other'
    CHECK(category IN ('housing', 'utilities', 'groceries', 'transportation',
                        'insurance', 'healthcare', 'childcare', 'phone',
                        'internet', 'other')),
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_budget_fixed_costs_userId ON budget_fixed_costs(userId);
CREATE INDEX IF NOT EXISTS idx_budget_fixed_costs_category ON budget_fixed_costs(category);

CREATE TRIGGER IF NOT EXISTS update_budget_fixed_costs_timestamp
AFTER UPDATE ON budget_fixed_costs
BEGIN
  UPDATE budget_fixed_costs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
