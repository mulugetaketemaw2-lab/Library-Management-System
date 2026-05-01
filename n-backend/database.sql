CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- users: both librarians and students
CREATE TABLE users (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  email    VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role     ENUM('librarian', 'student') DEFAULT 'student'
);

-- books in the library
CREATE TABLE books (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(200) NOT NULL,
  author           VARCHAR(100) NOT NULL,
  isbn             VARCHAR(50)  UNIQUE NOT NULL,
  category         VARCHAR(100),
  total_copies     INT DEFAULT 1,
  available_copies INT DEFAULT 1
);

-- tracks which student borrowed which book
CREATE TABLE issued_books (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  book_id     INT  NOT NULL,
  student_id  INT  NOT NULL,
  issue_date  DATE NOT NULL,
  due_date    DATE NOT NULL,
  return_date DATE DEFAULT NULL,
  fine        DECIMAL(10,2) DEFAULT 0.00,
  status      ENUM('issued', 'returned') DEFAULT 'issued',
  FOREIGN KEY (book_id)    REFERENCES books(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- default librarian  (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@library.com', '$2b$10$rQZ9uAVUE5gDqeV1k3mHOeKqX1mZ2nP8vL4wY7sT6uI0jF3cN5aGe', 'librarian');

-- sample books
INSERT INTO books (title, author, isbn, category, total_copies, available_copies) VALUES
('The Great Gatsby',        'F. Scott Fitzgerald', '978-0743273565', 'Fiction',           3, 3),
('To Kill a Mockingbird',   'Harper Lee',          '978-0061935466', 'Fiction',           2, 2),
('Introduction to Algorithms', 'Thomas Cormen',    '978-0262033848', 'Computer Science',  4, 4),
('Clean Code',              'Robert C. Martin',    '978-0132350884', 'Programming',       3, 3),
('1984',                    'George Orwell',       '978-0451524935', 'Fiction',           2, 2);
