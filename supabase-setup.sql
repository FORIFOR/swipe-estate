-- Create properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  address TEXT NOT NULL,
  layout TEXT NOT NULL,
  area NUMERIC NOT NULL,
  station TEXT NOT NULL,
  walk_minutes INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  is_liked BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(user_id, property_id)
);

-- Insert sample data
INSERT INTO properties (title, price, address, layout, area, station, walk_minutes, image_url) VALUES
  ('新宿駅徒歩8分', 100000, '東京都新宿区新宿1-1-1', '1K', 25, '新宿駅', 8, 'https://picsum.photos/400/300?random=1'),
  ('渋谷駅徒歩5分', 120000, '東京都渋谷区渋谷2-2-2', '1LDK', 35, '渋谷駅', 5, 'https://picsum.photos/400/300?random=2'),
  ('池袋駅徒歩3分', 150000, '東京都豊島区池袋3-3-3', '2LDK', 50, '池袋駅', 3, 'https://picsum.photos/400/300?random=3'),
  ('品川駅徒歩10分', 90000, '東京都港区品川4-4-4', '1R', 20, '品川駅', 10, 'https://picsum.photos/400/300?random=4'),
  ('上野駅徒歩7分', 110000, '東京都台東区上野5-5-5', '1DK', 30, '上野駅', 7, 'https://picsum.photos/400/300?random=5');

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Properties are viewable by everyone" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own likes" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own likes" ON likes
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (true);
