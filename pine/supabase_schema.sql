-- Activity Value Tracker - Supabase Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Activity logs table
CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  activity_name TEXT NOT NULL,
  hourly_value NUMERIC NOT NULL,
  block_value NUMERIC NOT NULL,
  time_slot_start TIMESTAMP WITH TIME ZONE NOT NULL,
  time_slot_end TIMESTAMP WITH TIME ZONE NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL,
  device_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily summaries table
CREATE TABLE daily_summaries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  total_value NUMERIC NOT NULL,
  activity_count INTEGER NOT NULL,
  computed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  device_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_activity_logs_device_id ON activity_logs(device_id);
CREATE INDEX idx_activity_logs_time_slot ON activity_logs(time_slot_start, time_slot_end);
CREATE INDEX idx_daily_summaries_device_id ON daily_summaries(device_id);
CREATE INDEX idx_daily_summaries_date ON daily_summaries(date);

-- Enable Row Level Security (RLS)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since there's no auth)
CREATE POLICY "Allow all operations on activity_logs" ON activity_logs
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on daily_summaries" ON daily_summaries
  FOR ALL USING (true);

-- Add triggers to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_activity_logs_updated_at 
  BEFORE UPDATE ON activity_logs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_summaries_updated_at 
  BEFORE UPDATE ON daily_summaries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();