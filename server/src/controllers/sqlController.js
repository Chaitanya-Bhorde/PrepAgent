const { queryAll } = require('../config/sqlDb');
const { updateSQLStats } = require('../services/placementScoreService');

// Map of expected queries for validation
const EXPECTED_SOLUTIONS = {
  // Easy (1-12)
  'sql-1': "SELECT * FROM Employee WHERE city = 'Mumbai'",
  'sql-2': "SELECT * FROM Product WHERE price > 500",
  'sql-3': "SELECT dept_id, COUNT(*) AS employee_count FROM Employee GROUP BY dept_id",
  'sql-4': "SELECT MAX(salary) AS max_salary FROM Employee",
  'sql-5': "SELECT DISTINCT c.name FROM Customer c JOIN Orders o ON c.id = o.customer_id",
  'sql-6': "SELECT email FROM Customer GROUP BY email HAVING COUNT(email) > 1",
  'sql-7': "SELECT * FROM Employee WHERE hire_date LIKE '2024%'",
  'sql-8': "SELECT * FROM Product ORDER BY price DESC",
  'sql-9': "SELECT customer_id, COUNT(*) AS order_count FROM Orders GROUP BY customer_id",
  'sql-10': "SELECT * FROM Customer WHERE city = 'Delhi'",
  'sql-11': "SELECT dept_id, AVG(salary) AS avg_salary FROM Employee GROUP BY dept_id",
  'sql-12': "SELECT DISTINCT city FROM Employee",

  // Medium (13-25)
  'sql-13': "SELECT MAX(salary) AS SecondHighestSalary FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee)",
  'sql-14': "SELECT name AS Customers FROM Customer WHERE id NOT IN (SELECT DISTINCT customer_id FROM Orders)",
  'sql-15': "SELECT dept_id, MAX(salary) AS max_salary FROM Employee GROUP BY dept_id",
  'sql-16': "SELECT e.name FROM Employee e JOIN Employee m ON e.manager_id = m.id WHERE e.salary > m.salary",
  'sql-17': "SELECT product_id, SUM(amount) AS total_sales FROM Orders GROUP BY product_id ORDER BY total_sales DESC LIMIT 3",
  'sql-18': "SELECT date FROM Attendance WHERE status = 'Present'",
  'sql-19': "SELECT * FROM Student WHERE marks > (SELECT AVG(marks) FROM Student)",
  'sql-20': "SELECT manager_id FROM Employee GROUP BY manager_id HAVING COUNT(*) >= 5",
  'sql-21': "SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS total_sales FROM Orders GROUP BY month",
  'sql-22': "SELECT * FROM Product WHERE id NOT IN (SELECT DISTINCT product_id FROM Orders)",
  'sql-23': "SELECT DISTINCT emp_id FROM Attendance",
  'sql-24': "SELECT name, dept_id, salary, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank FROM Employee",
  'sql-25': "SELECT customer_id, COUNT(*) AS purchase_count FROM Orders GROUP BY customer_id",

  // Hard (26-30)
  'sql-26': "SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 2",
  'sql-27': "SELECT name, dept_id, salary FROM (SELECT name, dept_id, salary, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank FROM Employee) WHERE rank <= 3",
  'sql-28': "SELECT id FROM Product WHERE stock > 20",
  'sql-29': "SELECT * FROM Attendance",
  'sql-30': "SELECT AVG(salary) FROM Employee"
};

const translateToSQLite = (query) => {
  if (!query) return '';
  return query
    .replace(/DATE_SUB\(\s*CURDATE\(\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "date('now', '-$1 days')")
    .replace(/CURDATE\(\)/gi, "date('now')")
    .replace(/MONTH\(([^)]+)\)/gi, "strftime('%m', $1)")
    .replace(/YEAR\(([^)]+)\)/gi, "strftime('%Y', $1)")
    .replace(/DATE_SUB\(([^,]+),\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "date($1, '-$2 days')");
};

const executeSQLQuery = async (req, res) => {
  try {
    const userId = req.user._id;
    const { query, problemId, action = 'run' } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'SQL query is required' });
    }

    const sqliteQuery = translateToSQLite(query);
    console.log(`🗄️ User ${userId} - Executing SQL (Action: ${action}): "${sqliteQuery}"`);

    const startTime = Date.now();
    let success = false;
    let userRows;
    let columns = [];

    try {
      userRows = await queryAll(sqliteQuery);
      if (userRows.length > 0) {
        columns = Object.keys(userRows[0]);
      } else {
        columns = ['Result'];
      }
      success = true;
    } catch (error) {
      console.error('SQL Execution Error:', error.message);
      return res.status(200).json({
        success: false,
        error: `SQL Driver Error: ${error.message}`
      });
    }

    const executionTime = Date.now() - startTime;
    let result = {
      success: true,
      columns,
      rows: userRows,
      executionTime
    };

    // If action is submit, validate query against expected solution
    if (action === 'submit' && problemId) {
      const expectedQuery = EXPECTED_SOLUTIONS[problemId];
      if (expectedQuery) {
        try {
          const sqliteExpected = translateToSQLite(expectedQuery);
          const expectedRows = await queryAll(sqliteExpected);
          
          // Compare rows
          const userStr = JSON.stringify(userRows);
          const expectedStr = JSON.stringify(expectedRows);

          if (userStr === expectedStr) {
            result.status = 'ACCEPTED';
            result.message = '🎉 Success! Your query returned the correct results.';
          } else {
            result.status = 'WRONG_ANSWER';
            result.message = '❌ Wrong Answer. Output results do not match expected records.';
            result.expected = {
              columns: expectedRows.length > 0 ? Object.keys(expectedRows[0]) : ['Result'],
              rows: expectedRows
            };
          }
        } catch (err) {
          console.error('Error running expected SQL for verification:', err.message);
        }
      }
    }

    // Update SQL stats asynchronously
    if (userId) {
      updateSQLStats(userId, {
        success: result.status === 'ACCEPTED' || (action === 'run' && success),
        executionTime
      }).catch(err => console.error('Failed to update SQL stats:', err));
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = { executeSQLQuery };
