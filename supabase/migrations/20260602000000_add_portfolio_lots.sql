CREATE TABLE portfolio_lots (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  asset_id      uuid        REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
  quantity      numeric     NOT NULL CHECK (quantity > 0),
  cost_basis    numeric     NOT NULL CHECK (cost_basis > 0),
  purchase_date date        NOT NULL,
  created_at    timestamptz DEFAULT now()
);

