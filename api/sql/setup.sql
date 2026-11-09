DROP DATABASE IF EXISTS seveste_db;
CREATE DATABASE seveste_db;
\c seveste

-- 1. User Types Table
CREATE TABLE user_types (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL
);

-- 2. Users Table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(300) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_type_id INT NOT NULL,

  CONSTRAINT fk_users_user_type FOREIGN KEY (user_type_id) REFERENCES user_types(id)
);

-- 3. Cities Table
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL
);

-- 4. Addresses Table
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  address_line1 VARCHAR(400) NOT NULL,
  number VARCHAR(20),
  state CHAR(2) NOT NULL,
  complement VARCHAR(100),
  city_id INT NOT NULL,

  CONSTRAINT fk_addresses_city FOREIGN KEY (city_id) REFERENCES cities(id)
);

-- 5. Donations Table
CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  address_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description VARCHAR(400) NOT NULL,
  condition VARCHAR(40) NOT NULL,
  delivery_type VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_donations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_donations_address FOREIGN KEY (address_id) REFERENCES addresses(id)
);

-- 6. Requests Table
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  donation_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_requests_donation FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
);

-- 7. Donation Images Table
CREATE TABLE donation_images (
  id SERIAL PRIMARY KEY,
  donation_id INT NOT NULL,
  position INT,
  is_cover SMALLINT DEFAULT 0,
  url VARCHAR(300) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_donation_images_donation FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
);

-- 8. Listing History Table
CREATE TABLE listing_histories (
  id SERIAL PRIMARY KEY,
  donation_id INT NOT NULL,
  status VARCHAR(60) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_listing_histories_donation FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
);
