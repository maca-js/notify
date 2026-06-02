DROP POLICY IF EXISTS "users manage own lots" ON portfolio_lots;
ALTER TABLE portfolio_lots DISABLE ROW LEVEL SECURITY;
