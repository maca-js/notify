ALTER TABLE alerts DROP CONSTRAINT alerts_timeframe_check;
ALTER TABLE alerts ADD CONSTRAINT alerts_timeframe_check CHECK (timeframe IN ('1h', '24h'));
