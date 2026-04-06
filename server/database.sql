-- Create database
CREATE DATABASE IF NOT EXISTS community_tools;
USE community_tools;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tools table
CREATE TABLE IF NOT EXISTS tools (
  tool_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  quantity_available INT DEFAULT 1,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage table (tracks borrows and returns)
CREATE TABLE IF NOT EXISTS usage (
  usage_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tool_id INT NOT NULL,
  borrow_date DATE NOT NULL,
  expected_return_date DATE,
  return_date DATE,
  status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (tool_id) REFERENCES tools(tool_id) ON DELETE CASCADE
);

-- Sample data
INSERT INTO users (name, email, phone) VALUES
('John Doe', 'john@example.com', '555-0001'),
('Jane Smith', 'jane@example.com', '555-0002'),
('Bob Johnson', 'bob@example.com', '555-0003');

INSERT INTO tools (name, description, category, quantity_available, location) VALUES
('Drill', 'Electric power drill', 'Power Tools', 3, 'Storage A'),
('Hammer', 'Claw hammer', 'Hand Tools', 5, 'Storage A'),
('Saw', 'Hand saw', 'Hand Tools', 2, 'Storage B'),
('Ladder', 'Aluminum ladder', 'Access Equipment', 1, 'Storage C'),
('Screwdriver Set', 'Multi-bit screwdriver set', 'Hand Tools', 4, 'Storage A');
