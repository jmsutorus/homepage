-- Migration: Add restaurants and restaurant_visits tables
-- Description: Track restaurants as a separate entity that can be linked to events

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  cuisine TEXT,
  price_range INTEGER CHECK(price_range >= 1 AND price_range <= 4),
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  website TEXT,
  poster TEXT,
  rating INTEGER CHECK(rating >= 1 AND rating <= 10),
  notes TEXT,
  favorite INTEGER DEFAULT 0,
  status TEXT DEFAULT 'visited' CHECK(status IN ('visited', 'want_to_try', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, slug)
);

-- Create restaurant_visits junction table
CREATE TABLE IF NOT EXISTS restaurant_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  restaurantId INTEGER NOT NULL,
  eventId INTEGER,
  visit_date TEXT NOT NULL,
  notes TEXT,
  rating INTEGER CHECK(rating >= 1 AND rating <= 10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE SET NULL
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_restaurants_userId ON restaurants(userId);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_favorite ON restaurants(favorite);

CREATE INDEX IF NOT EXISTS idx_restaurant_visits_userId ON restaurant_visits(userId);
CREATE INDEX IF NOT EXISTS idx_restaurant_visits_restaurantId ON restaurant_visits(restaurantId);
CREATE INDEX IF NOT EXISTS idx_restaurant_visits_eventId ON restaurant_visits(eventId);
CREATE INDEX IF NOT EXISTS idx_restaurant_visits_date ON restaurant_visits(visit_date);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_restaurants_timestamp
AFTER UPDATE ON restaurants
BEGIN
  UPDATE restaurants SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
