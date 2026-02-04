-- LOT-Computer Database Initialization Script
-- This script runs on first database creation

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create application schema
CREATE SCHEMA IF NOT EXISTS app;

-- Set default search path
ALTER DATABASE lot_computer SET search_path TO app, public;

-- Grant permissions
GRANT ALL ON SCHEMA app TO lot_user;
GRANT ALL ON ALL TABLES IN SCHEMA app TO lot_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO lot_user;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'LOT-Computer database initialized successfully';
END $$;
