-- Rename coingecko_id to external_id (used for both crypto and stocks)
ALTER TABLE assets RENAME COLUMN coingecko_id TO external_id;

-- Add asset_type column
ALTER TABLE assets
  ADD COLUMN asset_type text NOT NULL DEFAULT 'crypto'
    CHECK (asset_type IN ('crypto', 'stock'));
