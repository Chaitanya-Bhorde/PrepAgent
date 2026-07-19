const sqlite3 = require('sqlite3').verbose();

// Initialize in-memory SQLite database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('❌ Failed to open in-memory SQLite database:', err.message);
  } else {
    console.log('🔌 Connected to in-memory SQLite Database for LeetCode SQL Simulator');
  }
});

const queryAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const queryRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

// Seed database tables and values for all 30 SQL questions
const seedSqlDatabase = async () => {
  try {
    // --- 1. EMPLOYEE TABLES ---
    await queryRun(`
      CREATE TABLE Employee (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        salary INTEGER NOT NULL,
        dept_id INTEGER,
        manager_id INTEGER,
        hire_date TEXT,
        city TEXT,
        age INTEGER
      )
    `);

    await queryRun(`
      CREATE TABLE Department (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        budget INTEGER,
        location TEXT
      )
    `);

    await queryRun(`
      CREATE TABLE Attendance (
        emp_id INTEGER,
        date TEXT,
        status TEXT
      )
    `);

    // --- 2. ECOMMERCE TABLES ---
    await queryRun(`
      CREATE TABLE Customer (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        city TEXT,
        join_date TEXT
      )
    `);

    await queryRun(`
      CREATE TABLE Orders (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        order_date TEXT,
        status TEXT,
        amount INTEGER
      )
    `);

    await queryRun(`
      CREATE TABLE Product (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        price INTEGER,
        stock INTEGER
      )
    `);

    await queryRun(`
      CREATE TABLE Review (
        id INTEGER PRIMARY KEY,
        product_id INTEGER,
        customer_id INTEGER,
        rating INTEGER,
        review_date TEXT
      )
    `);

    // --- 3. STUDENT TABLES ---
    await queryRun(`
      CREATE TABLE Student (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER,
        dept TEXT,
        city TEXT,
        marks INTEGER
      )
    `);

    await queryRun(`
      CREATE TABLE Course (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        credits INTEGER,
        dept_id INTEGER
      )
    `);

    await queryRun(`
      CREATE TABLE Enrollment (
        student_id INTEGER,
        course_id INTEGER,
        grade TEXT,
        semester TEXT
      )
    `);

    await queryRun(`
      CREATE TABLE Exam (
        id INTEGER PRIMARY KEY,
        student_id INTEGER,
        subject TEXT,
        marks INTEGER,
        exam_date TEXT
      )
    `);

    // --- 4. SALES TABLES ---
    await queryRun(`
      CREATE TABLE SalesPerson (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        region TEXT,
        target INTEGER
      )
    `);

    await queryRun(`
      CREATE TABLE Sale (
        id INTEGER PRIMARY KEY,
        salesperson_id INTEGER,
        customer_id INTEGER,
        amount INTEGER,
        sale_date TEXT,
        product TEXT
      )
    `);

    await queryRun(`
      CREATE TABLE Lead (
        id INTEGER PRIMARY KEY,
        salesperson_id INTEGER,
        status TEXT,
        created_date TEXT
      )
    `);

    // --- 5. HOSPITAL TABLES ---
    await queryRun(`
      CREATE TABLE Doctor (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        specialization TEXT,
        experience INTEGER,
        city TEXT
      )
    `);

    await queryRun(`
      CREATE TABLE Patient (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER,
        disease TEXT,
        doctor_id INTEGER,
        admit_date TEXT
      )
    `);

    await queryRun(`
      CREATE TABLE Appointment (
        id INTEGER PRIMARY KEY,
        patient_id INTEGER,
        doctor_id INTEGER,
        date TEXT,
        status TEXT
      )
    `);

    // --- 6. LEETCODE LEGACY TABLES ---
    await queryRun(`
      CREATE TABLE Person (
        personId INTEGER PRIMARY KEY,
        lastName TEXT,
        firstName TEXT
      )
    `);
    await queryRun(`
      CREATE TABLE Address (
        addressId INTEGER PRIMARY KEY,
        personId INTEGER,
        city TEXT,
        state TEXT
      )
    `);

    // --- SEED MOCK DATA (5-8 rows per table) ---
    
    // Employee
    await queryRun(`INSERT INTO Employee VALUES (1, 'Alice', 95000, 1, 3, '2024-01-15', 'Mumbai', 28)`);
    await queryRun(`INSERT INTO Employee VALUES (2, 'Bob', 80000, 1, 1, '2023-05-20', 'Delhi', 32)`);
    await queryRun(`INSERT INTO Employee VALUES (3, 'Charlie', 120000, 2, null, '2022-09-01', 'Mumbai', 41)`);
    await queryRun(`INSERT INTO Employee VALUES (4, 'David', 50000, 3, 3, '2024-03-10', 'Pune', 24)`);
    await queryRun(`INSERT INTO Employee VALUES (5, 'Eva', 75000, 1, 1, '2024-02-18', 'Mumbai', 29)`);
    await queryRun(`INSERT INTO Employee VALUES (6, 'Frank', 65000, 2, 3, '2024-04-01', 'Delhi', 27)`);

    // Department
    await queryRun(`INSERT INTO Department VALUES (1, 'Engineering', 500000, 'Mumbai')`);
    await queryRun(`INSERT INTO Department VALUES (2, 'HR', 150000, 'Delhi')`);
    await queryRun(`INSERT INTO Department VALUES (3, 'Marketing', 200000, 'Pune')`);

    // Attendance
    await queryRun(`INSERT INTO Attendance VALUES (1, '2026-07-01', 'Present')`);
    await queryRun(`INSERT INTO Attendance VALUES (2, '2026-07-01', 'Absent')`);
    await queryRun(`INSERT INTO Attendance VALUES (3, '2026-07-01', 'Present')`);

    // Customer
    await queryRun(`INSERT INTO Customer VALUES (101, 'Rahul', 'rahul@gmail.com', 'Delhi', '2023-01-10')`);
    await queryRun(`INSERT INTO Customer VALUES (102, 'Priya', 'priya@gmail.com', 'Mumbai', '2023-06-15')`);
    await queryRun(`INSERT INTO Customer VALUES (103, 'Amit', 'amit@gmail.com', 'Delhi', '2024-02-18')`);
    await queryRun(`INSERT INTO Customer VALUES (104, 'Sneha', 'sneha@gmail.com', 'Bangalore', '2023-11-20')`);

    // Orders
    await queryRun(`INSERT INTO Orders VALUES (501, 101, 201, 2, '2024-06-01', 'Completed', 1200)`);
    await queryRun(`INSERT INTO Orders VALUES (502, 102, 203, 1, '2024-06-03', 'Completed', 150)`);
    await queryRun(`INSERT INTO Orders VALUES (503, 101, 202, 1, '2024-06-05', 'Shipped', 450)`);
    await queryRun(`INSERT INTO Orders VALUES (504, 103, 201, 1, '2024-06-06', 'Pending', 600)`);

    // Product
    await queryRun(`INSERT INTO Product VALUES (201, 'Monitor', 'Electronics', 600, 15)`);
    await queryRun(`INSERT INTO Product VALUES (202, 'Keyboard', 'Electronics', 450, 40)`);
    await queryRun(`INSERT INTO Product VALUES (203, 'Mouse', 'Electronics', 150, 50)`);
    await queryRun(`INSERT INTO Product VALUES (204, 'Desk Lamp', 'Home', 80, 25)`);

    // Review
    await queryRun(`INSERT INTO Review VALUES (1, 201, 101, 5, '2024-06-02')`);
    await queryRun(`INSERT INTO Review VALUES (2, 203, 102, 4, '2024-06-04')`);

    // Student
    await queryRun(`INSERT INTO Student VALUES (1, 'Aman', 20, 'CS', 'Delhi', 85)`);
    await queryRun(`INSERT INTO Student VALUES (2, 'Nisha', 21, 'CS', 'Mumbai', 92)`);
    await queryRun(`INSERT INTO Student VALUES (3, 'Rohan', 19, 'Electrical', 'Pune', 74)`);
    await queryRun(`INSERT INTO Student VALUES (4, 'Kriti', 22, 'CS', 'Delhi', 89)`);

    // Course
    await queryRun(`INSERT INTO Course VALUES (10, 'DBMS', 4, 1)`);
    await queryRun(`INSERT INTO Course VALUES (11, 'Algorithms', 4, 1)`);

    // Enrollment
    await queryRun(`INSERT INTO Enrollment VALUES (1, 10, 'A', 'Sem 3')`);
    await queryRun(`INSERT INTO Enrollment VALUES (2, 11, 'O', 'Sem 3')`);

    // Exam
    await queryRun(`INSERT INTO Exam VALUES (1, 1, 'DBMS', 85, '2024-05-10')`);
    await queryRun(`INSERT INTO Exam VALUES (2, 2, 'DBMS', 92, '2024-05-10')`);

    // SalesPerson
    await queryRun(`INSERT INTO SalesPerson VALUES (1, 'Vikram', 'North', 150000)`);
    await queryRun(`INSERT INTO SalesPerson VALUES (2, 'Neha', 'South', 100000)`);
    await queryRun(`INSERT INTO SalesPerson VALUES (3, 'Karan', 'North', 120000)`);

    // Sale
    await queryRun(`INSERT INTO Sale VALUES (1, 1, 101, 80000, '2024-05-12', 'Monitor')`);
    await queryRun(`INSERT INTO Sale VALUES (2, 2, 102, 110000, '2024-05-14', 'Laptop')`);

    // Lead
    await queryRun(`INSERT INTO Lead VALUES (1, 1, 'Converted', '2024-05-01')`);
    await queryRun(`INSERT INTO Lead VALUES (2, 2, 'Contacted', '2024-05-02')`);

    // Doctor
    await queryRun(`INSERT INTO Doctor VALUES (1, 'Dr. Kapoor', 'Cardiology', 15, 'Mumbai')`);
    await queryRun(`INSERT INTO Doctor VALUES (2, 'Dr. Sen', 'Neurology', 10, 'Delhi')`);

    // Patient
    await queryRun(`INSERT INTO Patient VALUES (1001, 'Suresh', 55, 'Heart Blockage', 1, '2024-05-20')`);
    await queryRun(`INSERT INTO Patient VALUES (1002, 'Anil', 42, 'Migraine', 2, '2024-05-21')`);

    // Appointment
    await queryRun(`INSERT INTO Appointment VALUES (1, 1001, 1, '2024-05-22', 'Completed')`);

    // Person & Address
    await queryRun(`INSERT INTO Person VALUES (1, 'Wang', 'Allen')`);
    await queryRun(`INSERT INTO Person VALUES (2, 'Alice', 'Bob')`);
    await queryRun(`INSERT INTO Address VALUES (1, 2, 'New York City', 'New York')`);

    console.log('✅ In-memory SQLite Database successfully seeded with all 17 placement schemas.');
  } catch (error) {
    console.error('❌ Failed to seed SQLite database:', error.message);
  }
};

// Seed database immediately
seedSqlDatabase();

module.exports = {
  db,
  queryAll,
  queryRun
};
