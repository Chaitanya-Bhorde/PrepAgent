const COMPANY_SQL_PROBLEMS = [
  {
    id: 'cognizant-1',
    company: 'Cognizant',
    title: 'Cognizant Pattern: Employee Department Salary',
    description: 'Find employees who have a salary greater than the average salary of their department.\n\nTables:\n- employees (emp_id, name, salary, dept_id)\n- departments (dept_id, dept_name)',
    schema: 'Table: employees\n- emp_id (INT, PK)\n- name (VARCHAR)\n- salary (INT)\n- dept_id (INT, FK)\n\nTable: departments\n- dept_id (INT, PK)\n- dept_name (VARCHAR)',
    starterQuery: 'SELECT e.name, e.salary, d.dept_name\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nWHERE e.salary > (\n  SELECT AVG(e2.salary)\n  FROM employees e2\n  WHERE e2.dept_id = e.dept_id\n);'
  },
  {
    id: 'tcs-1',
    company: 'TCS',
    title: 'TCS Pattern: Project Allocation Count',
    description: 'List all employees along with the number of projects they are assigned to. Include employees with 0 projects.\n\nTables:\n- employees (emp_id, name, hire_date)\n- projects (project_id, project_name)\n- assignments (assignment_id, emp_id, project_id)',
    schema: 'Table: employees\n- emp_id (INT, PK)\n- name (VARCHAR)\n- hire_date (DATE)\n\nTable: projects\n- project_id (INT, PK)\n- project_name (VARCHAR)\n\nTable: assignments\n- assignment_id (INT, PK)\n- emp_id (INT, FK)\n- project_id (INT, FK)',
    starterQuery: 'SELECT e.name, COUNT(a.project_id) AS project_count\nFROM employees e\nLEFT JOIN assignments a ON e.emp_id = a.emp_id\nGROUP BY e.emp_id, e.name\nORDER BY project_count DESC;'
  },
  {
    id: 'amazon-1',
    company: 'Amazon',
    title: 'Amazon Pattern: Order Fulfillment Analysis',
    description: 'Find the top 5 customers who have spent the most in the last 30 days.\n\nTables:\n- company_customers (customer_id, name, email)\n- company_orders (order_id, customer_id, order_date, total_amount)',
    schema: 'Table: company_customers\n- customer_id (INT, PK)\n- name (VARCHAR)\n- email (VARCHAR)\n\nTable: company_orders\n- order_id (INT, PK)\n- customer_id (INT, FK)\n- order_date (DATE)\n- total_amount (DECIMAL)',
    starterQuery: 'SELECT c.name, c.email, SUM(o.total_amount) AS total_spent\nFROM company_customers c\nJOIN company_orders o ON c.customer_id = o.customer_id\nWHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)\nGROUP BY c.customer_id, c.name, c.email\nORDER BY total_spent DESC\nLIMIT 5;'
  },
  {
    id: 'cognizant-2',
    company: 'Cognizant',
    title: 'Cognizant Pattern: Second Highest Salary',
    description: 'Find the employee with the second highest salary in the company.\n\nTable: employees (emp_id, name, salary)',
    schema: 'Table: employees\n- emp_id (INT, PK)\n- name (VARCHAR)\n- salary (INT)',
    starterQuery: 'SELECT MAX(salary) AS second_highest_salary\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);'
  },
  {
    id: 'tcs-2',
    company: 'TCS',
    title: 'TCS Pattern: Attendance Report',
    description: 'Generate a monthly attendance report showing the number of days each employee was present.\n\nTables:\n- employees (emp_id, name)\n- attendance (attendance_id, emp_id, date, status)',
    schema: 'Table: employees\n- emp_id (INT, PK)\n- name (VARCHAR)\n- attendance_id (INT, PK)\n- emp_id (INT, FK)\n- date (DATE)\n- status (VARCHAR: Present/Absent/Leave)',
    starterQuery: 'SELECT e.name, \n  COUNT(CASE WHEN a.status = \'Present\' THEN 1 END) AS days_present,\n  COUNT(CASE WHEN a.status = \'Absent\' THEN 1 END) AS days_absent\nFROM employees e\nLEFT JOIN attendance a ON e.emp_id = a.emp_id\n  AND MONTH(a.date) = MONTH(CURDATE())\n  AND YEAR(a.date) = YEAR(CURDATE())\nGROUP BY e.emp_id, e.name;'
  },
  {
    id: 'leetcode-175',
    company: 'Infosys',
    title: 'LeetCode 175: Combine Two Tables',
    description: 'Write a SQL query to report the first name, last name, city, and state of each person in the Person table. If the address of a personId is not in the Address table, report null instead.',
    schema: 'Table: Person\n- personId (INT, PK)\n- lastName (VARCHAR)\n- firstName (VARCHAR)\n\nTable: Address\n- addressId (INT, PK)\n- personId (INT)\n- city (VARCHAR)\n- state (VARCHAR)',
    starterQuery: 'SELECT p.firstName, p.lastName, a.city, a.state\nFROM Person p\nLEFT JOIN Address a ON p.personId = a.personId;'
  },
  {
    id: 'leetcode-181',
    company: 'Wipro',
    title: 'LeetCode 181: Employees Earning More Than Their Managers',
    description: 'Write a SQL query to find the employees who earn more than their managers.\n\nTable: Employee (id, name, salary, managerId)',
    schema: 'Table: Employee\n- id (INT, PK)\n- name (VARCHAR)\n- salary (INT)\n- managerId (INT, FK)',
    starterQuery: 'SELECT e1.name AS Employee\nFROM Employee e1\nJOIN Employee e2 ON e1.managerId = e2.id\nWHERE e1.salary > e2.salary;'
  },
  {
    id: 'leetcode-182',
    company: 'Cognizant',
    title: 'LeetCode 182: Duplicate Emails',
    description: 'Write a SQL query to report all the duplicate emails of customers in the company_customers table.',
    schema: 'Table: company_customers\n- customer_id (INT, PK)\n- name (VARCHAR)\n- email (VARCHAR)',
    starterQuery: 'SELECT email\nFROM company_customers\nGROUP BY email\nHAVING COUNT(email) > 1;'
  },
  {
    id: 'leetcode-183',
    company: 'Amazon',
    title: 'LeetCode 183: Customers Who Never Order',
    description: 'Write a SQL query to report all customers who never order anything. Return table column as Customers.',
    schema: 'Table: Customers\n- id (INT, PK)\n- name (VARCHAR)\n\nTable: Orders\n- id (INT, PK)\n- customerId (INT, FK)',
    starterQuery: 'SELECT c.name AS Customers\nFROM Customers c\nLEFT JOIN Orders o ON c.id = o.customerId\nWHERE o.id IS NULL;'
  },
  {
    id: 'leetcode-184',
    company: 'Google',
    title: 'LeetCode 184: Department Highest Salary',
    description: 'Write a SQL query to find employees who have the highest salary in each of the departments.\n\nTables:\n- Employee (id, name, salary, dept_id)\n- Department (id, name, budget, location)',
    schema: 'Table: Employee\n- id (INT, PK)\n- name (VARCHAR)\n- salary (INT)\n- dept_id (INT, FK)\n\nTable: Department\n- id (INT, PK)\n- name (VARCHAR)',
    starterQuery: 'SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary\nFROM Employee e\nJOIN Department d ON e.dept_id = d.id\nWHERE (e.dept_id, e.salary) IN (\n  SELECT dept_id, MAX(salary)\n  FROM Employee\n  GROUP BY dept_id\n);'
  }
];

module.exports = COMPANY_SQL_PROBLEMS;