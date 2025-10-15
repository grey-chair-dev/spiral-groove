-- Events and event_inquiries tables
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  capacity INTEGER CHECK (capacity > 0),
  price DECIMAL(10,2) CHECK (price >= 0),
  image VARCHAR(255),
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE event_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT,
  attendees INTEGER CHECK (attendees > 0),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for events table
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_created_at ON events(created_at);

-- Create indexes for event_inquiries table
CREATE INDEX idx_event_inquiries_event_id ON event_inquiries(event_id);
CREATE INDEX idx_event_inquiries_email ON event_inquiries(email);
CREATE INDEX idx_event_inquiries_status ON event_inquiries(status);
CREATE INDEX idx_event_inquiries_created_at ON event_inquiries(created_at);

-- Create updated_at triggers
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_inquiries_updated_at 
    BEFORE UPDATE ON event_inquiries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
