const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  { name: "Basic SELECT", count: 50, easy: 40, medium: 10, hard: 0 },
  { name: "WHERE Clause", count: 40, easy: 30, medium: 10, hard: 0 },
  { name: "ORDER BY + LIMIT", count: 35, easy: 25, medium: 10, hard: 0 },
  { name: "Aggregate Functions", count: 50, easy: 20, medium: 25, hard: 5 },
  { name: "GROUP BY + HAVING", count: 50, easy: 15, medium: 30, hard: 5 },
  { name: "Joins (INNER/LEFT/RIGHT)", count: 70, easy: 20, medium: 40, hard: 10 },
  { name: "Subqueries", count: 50, easy: 10, medium: 30, hard: 10 },
  { name: "Window Functions", count: 40, easy: 0, medium: 25, hard: 15 },
  { name: "CTEs (WITH clause)", count: 30, easy: 0, medium: 20, hard: 10 },
  { name: "String Functions", count: 25, easy: 15, medium: 10, hard: 0 },
  { name: "Date & Time Functions", count: 25, easy: 15, medium: 10, hard: 0 },
  { name: "NULL Handling", count: 20, easy: 15, medium: 5, hard: 0 },
  { name: "Self Join", count: 15, easy: 0, medium: 10, hard: 5 }
];

const COMPANIES_POOL = {
  easy: ["TCS", "Infosys", "Wipro", "Cognizant"],
  medium: ["Cognizant", "TCS", "Amazon", "Infosys"],
  hard: ["Amazon", "Google"]
};

// Generate list of 500 problems
function generateAllProblems() {
  const problems = [];
  let currentId = 1;

  for (const cat of CATEGORIES) {
    const totalCatCount = cat.count;
    let easyCount = cat.easy;
    let mediumCount = cat.medium;
    let hardCount = cat.hard;

    for (let i = 0; i < totalCatCount; i++) {
      let difficulty = "Easy";
      if (easyCount > 0) {
        difficulty = "Easy";
        easyCount--;
      } else if (mediumCount > 0) {
        difficulty = "Medium";
        mediumCount--;
      } else {
        difficulty = "Hard";
        hardCount--;
      }

      const problem = generateProblemInstance(currentId, cat.name, difficulty, i);
      problems.push(problem);
      currentId++;
    }
  }

  return problems;
}

// Generate an individual problem instance
function generateProblemInstance(id, category, difficulty, idx) {
  // Determine template details based on category
  let title = "";
  let description = "";
  let tables = [];
  let expectedOutput = [];
  let examples = [];
  let constraints = [];
  let hints = [];
  let solutionQuery = "";
  let solutionApproach = "";
  let tags = [category];

  // Pick companies
  const companyPool = COMPANIES_POOL[difficulty.toLowerCase()];
  const companyCount = Math.floor(Math.random() * 2) + 1;
  const companies = [];
  while (companies.length < companyCount) {
    const comp = companyPool[Math.floor(Math.random() * companyPool.length)];
    if (!companies.includes(comp)) companies.push(comp);
  }

  // Switch schema contexts (Employee, E-commerce, Student, Sales, Hospital)
  const contextId = (id % 5);

  if (contextId === 0) {
    // --- EMPLOYEE SCHEMA ---
    tables = [
      {
        name: "Employee",
        columns: [
          { name: "id", type: "int", key: "PK" },
          { name: "name", type: "varchar", key: "" },
          { name: "salary", type: "int", key: "" },
          { name: "dept_id", type: "int", key: "FK" },
          { name: "manager_id", type: "int", key: "FK" },
          { name: "hire_date", type: "date", key: "" },
          { name: "city", type: "varchar", key: "" },
          { name: "age", type: "int", key: "" }
        ],
        sampleData: [
          { id: 1, name: "Alice", salary: 90000, dept_id: 1, manager_id: null, hire_date: "2023-01-15", city: "New York", age: 34 },
          { id: 2, name: "Bob", salary: 80000, dept_id: 1, manager_id: 1, hire_date: "2023-03-20", city: "Chicago", age: 29 },
          { id: 3, name: "Charlie", salary: 95000, dept_id: 2, manager_id: null, hire_date: "2022-05-10", city: "New York", age: 41 },
          { id: 4, name: "David", salary: 60000, dept_id: 2, manager_id: 3, hire_date: "2024-01-11", city: "San Francisco", age: 26 },
          { id: 5, name: "Eva", salary: 75000, dept_id: 1, manager_id: 1, hire_date: "2023-07-01", city: "Chicago", age: 31 }
        ]
      },
      {
        name: "Department",
        columns: [
          { name: "id", type: "int", key: "PK" },
          { name: "name", type: "varchar", key: "" },
          { name: "budget", type: "int", key: "" },
          { name: "location", type: "varchar", key: "" }
        ],
        sampleData: [
          { id: 1, name: "Engineering", budget: 500000, location: "New York" },
          { id: 2, name: "HR", budget: 150000, location: "Chicago" },
          { id: 3, name: "Marketing", budget: 200000, location: "San Francisco" }
        ]
      }
    ];

    if (category === "Basic SELECT") {
      title = `Select High salary Employees Var ${idx}`;
      description = `Write an SQL query to select all columns for employees who make more than 70000 and reside in Chicago. Reside values are case sensitive.`;
      solutionQuery = `SELECT * FROM Employee WHERE salary > 70000 AND city = 'Chicago';`;
      solutionApproach = "Basic SELECT with WHERE condition";
      expectedOutput = [
        { id: 2, name: "Bob", salary: 80000, dept_id: 1, manager_id: 1, hire_date: "2023-03-20", city: "Chicago", age: 29 },
        { id: 5, name: "Eva", salary: 75000, dept_id: 1, manager_id: 1, hire_date: "2023-07-01", city: "Chicago", age: 31 }
      ];
      examples = [{ input: "Employee Table", output: "Bob, Eva data", explanation: "Salary above 70000 and city is Chicago." }];
      constraints = ["salary is not null", "city is not null"];
      hints = ["Check SELECT syntax", "Add WHERE condition", "Use AND operator"];
    } else if (category === "Aggregate Functions") {
      title = `Calculate Average Department Salary Var ${idx}`;
      description = `Write a SQL query to calculate the average salary of employees per department. Return the dept_id and the average salary as avg_salary rounded to 2 decimals.`;
      solutionQuery = `SELECT dept_id, ROUND(AVG(salary), 2) AS avg_salary FROM Employee GROUP BY dept_id;`;
      solutionApproach = "GROUP BY with ROUND AVG";
      expectedOutput = [
        { dept_id: 1, avg_salary: 81666.67 },
        { dept_id: 2, avg_salary: 77500.00 }
      ];
      examples = [{ input: "Employee Table", output: "Department avg salaries", explanation: "Average calculated grouped by department." }];
      constraints = ["dept_id is not null"];
      hints = ["Use AVG()", "Group by dept_id", "Use ROUND()"];
    } else {
      title = `Employee Query Spec ${idx}`;
      description = `Find employee statistics matching target metrics for department id 1. List names and salaries.`;
      solutionQuery = `SELECT name, salary FROM Employee WHERE dept_id = 1;`;
      solutionApproach = "Filter by department";
      expectedOutput = [{ name: "Alice", salary: 90000 }];
      examples = [{ input: "Employee table", output: "Names and salaries", explanation: "Filter matching department 1" }];
      constraints = ["dept_id > 0"];
      hints = ["Filter on dept_id", "Output name and salary", "Simple WHERE query"];
    }

  } else if (contextId === 1) {
    // --- ECOMMERCE SCHEMA ---
    tables = [
      {
        name: "Customer",
        columns: [
          { name: "id", type: "int", key: "PK" },
          { name: "name", type: "varchar", key: "" },
          { name: "email", type: "varchar", key: "" },
          { name: "city", type: "varchar", key: "" },
          { name: "join_date", type: "date", key: "" }
        ],
        sampleData: [
          { id: 101, name: "John", email: "john@ecommerce.com", city: "Dallas", join_date: "2023-05-15" },
          { id: 102, name: "Sarah", email: "sarah@ecommerce.com", city: "Dallas", join_date: "2023-08-22" },
          { id: 103, name: "Mike", email: "mike@ecommerce.com", city: "Seattle", join_date: "2024-01-10" }
        ]
      },
      {
        name: "Orders",
        columns: [
          { name: "id", type: "int", key: "PK" },
          { name: "customer_id", type: "int", key: "FK" },
          { name: "product_id", type: "int", key: "FK" },
          { name: "quantity", type: "int", key: "" },
          { name: "order_date", type: "date", key: "" },
          { name: "status", type: "varchar", key: "" },
          { name: "amount", type: "int", key: "" }
        ],
        sampleData: [
          { id: 1001, customer_id: 101, product_id: 501, quantity: 2, order_date: "2024-02-14", status: "Shipped", amount: 120 },
          { id: 1002, customer_id: 102, product_id: 502, quantity: 1, order_date: "2024-02-15", status: "Pending", amount: 80 },
          { id: 1003, customer_id: 101, product_id: 502, quantity: 1, order_date: "2024-02-16", status: "Shipped", amount: 80 }
        ]
      }
    ];

    if (category === "WHERE Clause") {
      title = `Dallas Customers Who Joined Recently Var ${idx}`;
      description = `Identify customers residing in Dallas who joined the platform on or after August 1, 2023. Return customer id, name, and join_date.`;
      solutionQuery = `SELECT id, name, join_date FROM Customer WHERE city = 'Dallas' AND join_date >= '2023-08-01';`;
      solutionApproach = "WHERE with multiple conditions";
      expectedOutput = [
        { id: 102, name: "Sarah", join_date: "2023-08-22" }
      ];
      examples = [{ input: "Dallas customers", output: "Sarah details", explanation: "Dallas matching join date range" }];
      constraints = ["join_date is standard YYYY-MM-DD format"];
      hints = ["Use filter on city", "Use >= condition on date", "Combine with AND"];
    } else if (category === "Joins (INNER/LEFT/RIGHT)") {
      title = `Customer Order Breakdown Var ${idx}`;
      description = `Find the total order amount placed by each customer. Include customer name, email, and total order amount sum as total_spent. Sorted by total_spent descending.`;
      solutionQuery = `SELECT c.name, c.email, SUM(o.amount) AS total_spent FROM Customer c JOIN Orders o ON c.id = o.customer_id GROUP BY c.id, c.name, c.email ORDER BY total_spent DESC;`;
      solutionApproach = "INNER JOIN with SUM aggregation";
      expectedOutput = [
        { name: "John", email: "john@ecommerce.com", total_spent: 200 },
        { name: "Sarah", email: "sarah@ecommerce.com", total_spent: 80 }
      ];
      examples = [{ input: "Customer and Orders tables", output: "Sum spendings list", explanation: "Calculated spendings sorted" }];
      constraints = ["amount values are positive"];
      hints = ["Join on customer_id", "GROUP BY customer fields", "Use SUM(amount)"];
    } else {
      title = `Ecommerce Orders Query Spec ${idx}`;
      description = `Retrieve list of all active orders with total values higher than 50. Return order ID and customer ID.`;
      solutionQuery = `SELECT id, customer_id FROM Orders WHERE amount > 50;`;
      solutionApproach = "Filter by amount";
      expectedOutput = [{ id: 1001, customer_id: 101 }];
      examples = [{ input: "Orders table", output: "Filtered orders list", explanation: "Filter order amounts" }];
      constraints = ["amount > 0"];
      hints = ["Filter on amount", "Output ID fields", "Simple WHERE query"];
    }

  } else if (contextId === 2) {
    // --- STUDENT SCHEMA ---
    tables = [
      {
        name: "Student",
        columns: [
          { name: "id", type: "int", key: "PK" },
          { name: "name", type: "varchar", key: "" },
          { name: "age", type: "int", key: "" },
          { name: "dept", type: "varchar", key: "" },
          { name: "city", type: "varchar", key: "" },
          { name: "marks", type: "int", key: "" }
        ],
        sampleData: [
          { id: 1, name: "Roy", age: 20, dept: "CS", city: "Boston", marks: 88 },
          { id: 2, name: "Kim", age: 21, dept: "CS", city: "New York", marks: 92 },
          { id: 3, name: "Lisa", age: 19, dept: "Math", city: "Boston", marks: 76 },
          { id: 4, name: "Tom", age: 22, dept: "Math", city: "Chicago", marks: 85 }
        ]
      }
    ];

    if (category === "ORDER BY + LIMIT") {
      title = `Top Performing CS Students Var ${idx}`;
      description = `Find the highest scoring student in the Computer Science (CS) department. Return their name and marks.`;
      solutionQuery = `SELECT name, marks FROM Student WHERE dept = 'CS' ORDER BY marks DESC LIMIT 1;`;
      solutionApproach = "Filter, ORDER BY and LIMIT";
      expectedOutput = [
        { name: "Kim", marks: 92 }
      ];
      examples = [{ input: "Student table", output: "Kim 92", explanation: "Highest score in CS." }];
      constraints = ["marks is integer between 0 and 100"];
      hints = ["Filter on CS", "Order by marks desc", "Apply limit 1"];
    } else if (category === "GROUP BY + HAVING") {
      title = `Departments with High Average Marks Var ${idx}`;
      description = `List all departments where the average marks of students is greater than 80. Return dept and average marks as avg_marks.`;
      solutionQuery = `SELECT dept, AVG(marks) AS avg_marks FROM Student GROUP BY dept HAVING AVG(marks) > 80;`;
      solutionApproach = "GROUP BY with HAVING filter";
      expectedOutput = [
        { dept: "CS", avg_marks: 90.0 }
      ];
      examples = [{ input: "Student marks", output: "CS avg marks", explanation: "CS department average is 90 (> 80)" }];
      constraints = ["average is decimal rounded"];
      hints = ["Group by dept", "Apply HAVING average > 80", "Use AVG(marks)"];
    } else {
      title = `Student Grade Evaluation Spec ${idx}`;
      description = `Query students scoring above 80 marks. Return name and department.`;
      solutionQuery = `SELECT name, dept FROM Student WHERE marks > 80;`;
      solutionApproach = "Filter by marks threshold";
      expectedOutput = [{ name: "Roy", dept: "CS" }];
      examples = [{ input: "Student records", output: "Roy CS, Kim CS", explanation: "Filter scores above 80" }];
      constraints = ["marks > 0"];
      hints = ["Filter on marks", "Output name and dept", "Simple WHERE query"];
    }

  } else if (contextId === 3) {
    // --- SALES SCHEMA ---
    tables = [
      {
        name: "SalesPerson",
        columns: [
          { name: "id", type: "int", key: "PK" },
          { name: "name", type: "varchar", key: "" },
          { name: "region", type: "varchar", key: "" },
          { name: "target", type: "int", key: "" }
        ],
        sampleData: [
          { id: 1, name: "Gary", region: "North", target: 100000 },
          { id: 2, name: "Amy", region: "South", target: 120000 },
          { id: 3, name: "Ted", region: "North", target: 80000 }
        ]
      },
      {
        name: "Sale",
        columns: [
          { name: "id", type: "int", key: "PK" },
          { name: "salesperson_id", type: "int", key: "FK" },
          { name: "customer_id", type: "int", key: "" },
          { name: "amount", type: "int", key: "" },
          { name: "sale_date", type: "date", key: "" },
          { name: "product", type: "varchar", key: "" }
        ],
        sampleData: [
          { id: 10, salesperson_id: 1, customer_id: 201, amount: 45000, sale_date: "2024-01-05", product: "Server Rack" },
          { id: 11, salesperson_id: 1, customer_id: 202, amount: 60000, sale_date: "2024-01-10", product: "Cables" },
          { id: 12, salesperson_id: 2, customer_id: 203, amount: 130000, sale_date: "2024-01-12", product: "Server Rack" }
        ]
      }
    ];

    if (category === "Subqueries") {
      title = `Salespeople Exceeding Targets Var ${idx}`;
      description = `Find salespeople whose total sales amount exceeds their allocated target. Return salesperson name and region.`;
      solutionQuery = `SELECT name, region FROM SalesPerson WHERE id IN (SELECT salesperson_id FROM Sale GROUP BY salesperson_id HAVING SUM(amount) > (SELECT target FROM SalesPerson sp WHERE sp.id = salesperson_id));`;
      solutionApproach = "Correlated Subquery with SUM HAVING";
      expectedOutput = [
        { name: "Gary", region: "North" },
        { name: "Amy", region: "South" }
      ];
      examples = [{ input: "Sales records", output: "Gary, Amy", explanation: "Total sales amounts exceed targets" }];
      constraints = ["amount is positive integer"];
      hints = ["Sum sale amount by salesperson", "Compare with target using subquery", "Output name and region"];
    } else if (category === "Window Functions") {
      title = `Rank Sales Amount within Region Var ${idx}`;
      description = `Rank individual sale transactions within each region based on their sale amount. Return salesperson name, region, sale amount, and their rank as sale_rank.`;
      solutionQuery = `SELECT sp.name, sp.region, s.amount, RANK() OVER (PARTITION BY sp.region ORDER BY s.amount DESC) AS sale_rank FROM SalesPerson sp JOIN Sale s ON sp.id = s.salesperson_id;`;
      solutionApproach = "Window Function RANK OVER PARTITION BY";
      expectedOutput = [
        { name: "Gary", region: "North", amount: 60000, sale_rank: 1 },
        { name: "Gary", region: "North", amount: 45000, sale_rank: 2 },
        { name: "Amy", region: "South", amount: 130000, sale_rank: 1 }
      ];
      examples = [{ input: "Sales transaction ranking", output: "Ranks inside region", explanation: "Transacted amounts ranked per region" }];
      constraints = ["multiple ranks allowed on duplicate amounts"];
      hints = ["Join tables on id", "Use RANK() window function", "Partition by region, order by amount desc"];
    } else {
      title = `Sales Territory Query Spec ${idx}`;
      description = `Retrieve list of all active salespersons in North region. Return name and target.`;
      solutionQuery = `SELECT name, target FROM SalesPerson WHERE region = 'North';`;
      solutionApproach = "Filter by region";
      expectedOutput = [{ name: "Gary", target: 100000 }];
      examples = [{ input: "Salesperson list", output: "Gary, Ted", explanation: "Filter matching region North" }];
      constraints = ["target > 0"];
      hints = ["Filter on region", "Output name and target", "Simple WHERE query"];
    }

  } else {
    // --- HOSPITAL SCHEMA ---
    tables = [
      {
        name: "Doctor",
        columns: [
          { name: "id", type: "int", key: "PK" },
          { name: "name", type: "varchar", key: "" },
          { name: "specialization", type: "varchar", key: "" },
          { name: "experience", type: "int", key: "" },
          { name: "city", type: "varchar", key: "" }
        ],
        sampleData: [
          { id: 1, name: "Dr. Smith", specialization: "Cardiology", experience: 12, city: "Boston" },
          { id: 2, name: "Dr. Adams", specialization: "Neurology", experience: 8, city: "Chicago" },
          { id: 3, name: "Dr. Baker", specialization: "Cardiology", experience: 15, city: "Boston" }
        ]
      },
      {
        name: "Patient",
        columns: [
          { name: "id", type: "int", key: "PK" },
          { name: "name", type: "varchar", key: "" },
          { name: "age", type: "int", key: "" },
          { name: "disease", type: "varchar", key: "" },
          { name: "doctor_id", type: "int", key: "FK" },
          { name: "admit_date", type: "date", key: "" }
        ],
        sampleData: [
          { id: 101, name: "John", age: 45, disease: "Heart Attack", doctor_id: 1, admit_date: "2024-01-10" },
          { id: 102, name: "Mary", age: 34, disease: "Migraine", doctor_id: 2, admit_date: "2024-01-12" },
          { id: 103, name: "Steve", age: 50, disease: "Arrhythmia", doctor_id: 1, admit_date: "2024-01-15" }
        ]
      }
    ];

    if (category === "CTEs (WITH clause)") {
      title = `Cardiologists Treatment Statistics Var ${idx}`;
      description = `Find doctors specializing in Cardiology with more than 10 years experience, and count the total patients treated by them. Return doctor name, experience, and patient count as patient_count.`;
      solutionQuery = `WITH CardDocs AS (SELECT id, name, experience FROM Doctor WHERE specialization = 'Cardiology' AND experience > 10) SELECT cd.name, cd.experience, COUNT(p.id) AS patient_count FROM CardDocs cd LEFT JOIN Patient p ON cd.id = p.doctor_id GROUP BY cd.id, cd.name, cd.experience;`;
      solutionApproach = "Common Table Expressions with Left Join Grouping";
      expectedOutput = [
        { name: "Dr. Smith", experience: 12, patient_count: 2 },
        { name: "Dr. Baker", experience: 15, patient_count: 0 }
      ];
      examples = [{ input: "Doctor and Patients list", output: "Doctors and treated counts", explanation: "Calculated patient count per doctor" }];
      constraints = ["experience > 0"];
      hints = ["Construct CTE for Cardiology", "Join patient records to count ID", "Apply group by doctor"];
    } else if (category === "String Functions") {
      title = `Format Doctor Specialty Labels Var ${idx}`;
      description = `Generate custom lowercase label for each doctor. Format string: doctor name, specialization and city. Return specialization string upper-cased.`;
      solutionQuery = `SELECT LOWER(name) AS formatted_name, UPPER(specialization) AS spec_label FROM Doctor;`;
      solutionApproach = "LOWER and UPPER string format functions";
      expectedOutput = [
        { formatted_name: "dr. smith", spec_label: "CARDIOLOGY" },
        { formatted_name: "dr. adams", spec_label: "NEUROLOGY" }
      ];
      examples = [{ input: "Doctors specialized fields", output: "Formatted titles", explanation: "Formatted specialization keys" }];
      constraints = ["Doctor name length is positive"];
      hints = ["Use UPPER function", "Use LOWER function", "Output label fields"];
    } else {
      title = `Hospital Admittance Query Spec ${idx}`;
      description = `Select patients matching cardiology doctor treatments. Return patient ID and name.`;
      solutionQuery = `SELECT id, name FROM Patient WHERE doctor_id = 1;`;
      solutionApproach = "Filter by doctor id";
      expectedOutput = [{ id: 101, name: "John" }];
      examples = [{ input: "Patient list", output: "John, Steve", explanation: "Filter matching doctor 1" }];
      constraints = ["doctor_id > 0"];
      hints = ["Filter on doctor_id", "Output name and id", "Simple WHERE query"];
    }
  }

  // Generate slug
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Assemble the result
  return {
    id,
    title,
    slug,
    difficulty,
    category,
    companies,
    tags,
    acceptance: `${(Math.random() * 40 + 35).toFixed(1)}%`,
    description,
    tables,
    expectedOutput,
    examples,
    constraints,
    hints,
    solution: {
      approach: solutionApproach,
      query: solutionQuery
    },
    topics_covered: [category, "SQL Logic"]
  };
}

// Generate the 500 problems and write to JSON
const problems = generateAllProblems();
const outputFilePath = path.join(__dirname, 'sqlProblems.json');

fs.writeFileSync(outputFilePath, JSON.stringify(problems, null, 2), 'utf-8');
console.log(`✅ Success! Generated ${problems.length} SQL problems inside: ${outputFilePath}`);
