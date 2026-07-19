import { create } from 'zustand';
import { problemAPI } from '../lib/api';

const SQL_PROBLEMS = [
  // Easy (1-12)
  {
    id: 'sql-1',
    title: '1. Find all employees from Mumbai',
    description: 'Write a SQL query to find all details of employees whose city is Mumbai.',
    schema: 'Table: Employee\n- id (INT, PK)\n- name (VARCHAR)\n- salary (INT)\n- city (VARCHAR)\n- age (INT)',
    starterQuery: 'SELECT * FROM Employee WHERE city = \'Mumbai\';',
    difficulty: 'easy',
    company: 'Cognizant'
  },
  {
    id: 'sql-2',
    title: '2. List products with price > 500',
    description: 'Write a SQL query to list all products with a unit price greater than 500.',
    schema: 'Table: Product\n- id (INT, PK)\n- name (VARCHAR)\n- category (VARCHAR)\n- price (INT)\n- stock (INT)',
    starterQuery: 'SELECT * FROM Product WHERE price > 500;',
    difficulty: 'easy',
    company: 'TCS'
  },
  {
    id: 'sql-3',
    title: '3. Count employees per department',
    description: 'Write a SQL query to count the number of employees associated with each department ID.',
    schema: 'Table: Employee\n- id (INT, PK)\n- dept_id (INT)\n- name (VARCHAR)',
    starterQuery: 'SELECT dept_id, COUNT(*) AS employee_count FROM Employee GROUP BY dept_id;',
    difficulty: 'easy',
    company: 'Amazon'
  },
  {
    id: 'sql-4',
    title: '4. Find maximum salary',
    description: 'Write a SQL query to find the maximum salary among all employees.',
    schema: 'Table: Employee\n- id (INT, PK)\n- salary (INT)',
    starterQuery: 'SELECT MAX(salary) AS max_salary FROM Employee;',
    difficulty: 'easy',
    company: 'Infosys'
  },
  {
    id: 'sql-5',
    title: '5. List customers who placed orders',
    description: 'Write a SQL query to list the names of all customers who have placed at least one order.',
    schema: 'Table: Customer\n- id (INT, PK)\n- name (VARCHAR)\n\nTable: Orders\n- id (INT, PK)\n- customer_id (INT)',
    starterQuery: 'SELECT DISTINCT c.name FROM Customer c JOIN Orders o ON c.id = o.customer_id;',
    difficulty: 'easy',
    company: 'TCS'
  },
  {
    id: 'sql-6',
    title: '6. Find duplicate emails',
    description: 'Write a SQL query to find all duplicate emails in the Customer table.',
    schema: 'Table: Customer\n- id (INT, PK)\n- email (VARCHAR)',
    starterQuery: 'SELECT email FROM Customer GROUP BY email HAVING COUNT(email) > 1;',
    difficulty: 'easy',
    company: 'Cognizant'
  },
  {
    id: 'sql-7',
    title: '7. Employees hired in 2024',
    description: 'Write a SQL query to find all details of employees hired in the year 2024.',
    schema: 'Table: Employee\n- id (INT, PK)\n- name (VARCHAR)\n- hire_date (VARCHAR)',
    starterQuery: 'SELECT * FROM Employee WHERE hire_date LIKE \'2024%\';',
    difficulty: 'easy',
    company: 'Infosys'
  },
  {
    id: 'sql-8',
    title: '8. Products sorted by price descending',
    description: 'Write a SQL query to list all products sorted by their price in descending order.',
    schema: 'Table: Product\n- id (INT, PK)\n- name (VARCHAR)\n- price (INT)',
    starterQuery: 'SELECT * FROM Product ORDER BY price DESC;',
    difficulty: 'easy',
    company: 'Amazon'
  },
  {
    id: 'sql-9',
    title: '9. Count orders per customer',
    description: 'Write a SQL query to count the total number of orders placed by each customer ID.',
    schema: 'Table: Orders\n- id (INT, PK)\n- customer_id (INT)',
    starterQuery: 'SELECT customer_id, COUNT(*) AS order_count FROM Orders GROUP BY customer_id;',
    difficulty: 'easy',
    company: 'TCS'
  },
  {
    id: 'sql-10',
    title: '10. Find customers from Delhi',
    description: 'Write a SQL query to list all details of customers located in Delhi.',
    schema: 'Table: Customer\n- id (INT, PK)\n- city (VARCHAR)',
    starterQuery: 'SELECT * FROM Customer WHERE city = \'Delhi\';',
    difficulty: 'easy',
    company: 'Cognizant'
  },
  {
    id: 'sql-11',
    title: '11. Average salary per department',
    description: 'Write a SQL query to compute the average salary of employees per department.',
    schema: 'Table: Employee\n- id (INT, PK)\n- dept_id (INT)\n- salary (INT)',
    starterQuery: 'SELECT dept_id, AVG(salary) AS avg_salary FROM Employee GROUP BY dept_id;',
    difficulty: 'easy',
    company: 'Amazon'
  },
  {
    id: 'sql-12',
    title: '12. List all distinct cities',
    description: 'Write a SQL query to list all unique cities where employees live.',
    schema: 'Table: Employee\n- id (INT, PK)\n- city (VARCHAR)',
    starterQuery: 'SELECT DISTINCT city FROM Employee;',
    difficulty: 'easy',
    company: 'Infosys'
  },

  // Medium (13-25)
  {
    id: 'sql-13',
    title: '13. Second Highest Salary',
    description: 'Write a SQL query to find the second highest salary from the Employee table.',
    schema: 'Table: Employee\n- id (INT, PK)\n- salary (INT)',
    starterQuery: 'SELECT MAX(salary) AS SecondHighestSalary FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);',
    difficulty: 'medium',
    company: 'Cognizant'
  },
  {
    id: 'sql-14',
    title: '14. Customers Who Never Ordered',
    description: 'Write a SQL query to report all customers who never placed an order.',
    schema: 'Table: Customer\n- id (INT, PK)\n- name (VARCHAR)\n\nTable: Orders\n- id (INT, PK)\n- customer_id (INT)',
    starterQuery: 'SELECT name AS Customers FROM Customer WHERE id NOT IN (SELECT DISTINCT customer_id FROM Orders);',
    difficulty: 'medium',
    company: 'Amazon'
  },
  {
    id: 'sql-15',
    title: '15. Department Highest Salary',
    description: 'Write a SQL query to find employees who have the highest salary in each of the departments.',
    schema: 'Table: Employee\n- id (INT, PK)\n- dept_id (INT)\n- salary (INT)',
    starterQuery: 'SELECT dept_id, MAX(salary) AS max_salary FROM Employee GROUP BY dept_id;',
    difficulty: 'medium',
    company: 'Infosys'
  },
  {
    id: 'sql-16',
    title: '16. Employees earning more than manager',
    description: 'Write a SQL query to find employees who earn more than their direct manager.',
    schema: 'Table: Employee\n- id (INT, PK)\n- name (VARCHAR)\n- salary (INT)\n- manager_id (INT)',
    starterQuery: 'SELECT e.name FROM Employee e JOIN Employee m ON e.manager_id = m.id WHERE e.salary > m.salary;',
    difficulty: 'medium',
    company: 'TCS'
  },
  {
    id: 'sql-17',
    title: '17. Top 3 products by sales',
    description: 'Write a SQL query to report the top 3 product IDs sorted by their total order amount.',
    schema: 'Table: Orders\n- id (INT, PK)\n- product_id (INT)\n- amount (INT)',
    starterQuery: 'SELECT product_id, SUM(amount) AS total_sales FROM Orders GROUP BY product_id ORDER BY total_sales DESC LIMIT 3;',
    difficulty: 'medium',
    company: 'Amazon'
  },
  {
    id: 'sql-18',
    title: '18. Rising Temperature',
    description: 'Write a SQL query to find all dates where the attendance status was Present.',
    schema: 'Table: Attendance\n- emp_id (INT)\n- date (VARCHAR)\n- status (VARCHAR)',
    starterQuery: 'SELECT date FROM Attendance WHERE status = \'Present\';',
    difficulty: 'medium',
    company: 'Cognizant'
  },
  {
    id: 'sql-19',
    title: '19. Students with above average marks',
    description: 'Write a SQL query to list all students who scored above average marks.',
    schema: 'Table: Student\n- id (INT, PK)\n- name (VARCHAR)\n- marks (INT)',
    starterQuery: 'SELECT * FROM Student WHERE marks > (SELECT AVG(marks) FROM Student);',
    difficulty: 'medium',
    company: 'TCS'
  },
  {
    id: 'sql-20',
    title: '20. Find managers with 5+ direct reports',
    description: 'Write a SQL query to find manager IDs who manage at least 5 employees.',
    schema: 'Table: Employee\n- id (INT, PK)\n- manager_id (INT)',
    starterQuery: 'SELECT manager_id FROM Employee GROUP BY manager_id HAVING COUNT(*) >= 5;',
    difficulty: 'medium',
    company: 'Infosys'
  },
  {
    id: 'sql-21',
    title: '21. Monthly sales summary',
    description: 'Write a SQL query to summarize sales amounts grouped by month.',
    schema: 'Table: Orders\n- id (INT, PK)\n- amount (INT)\n- order_date (VARCHAR)',
    starterQuery: 'SELECT strftime(\'%Y-%m\', order_date) AS month, SUM(amount) AS total_sales FROM Orders GROUP BY month;',
    difficulty: 'medium',
    company: 'Amazon'
  },
  {
    id: 'sql-22',
    title: '22. Products never ordered',
    description: 'Write a SQL query to list all products that have never been ordered.',
    schema: 'Table: Product\n- id (INT, PK)\n- name (VARCHAR)\n\nTable: Orders\n- id (INT, PK)\n- product_id (INT)',
    starterQuery: 'SELECT * FROM Product WHERE id NOT IN (SELECT DISTINCT product_id FROM Orders);',
    difficulty: 'medium',
    company: 'Infosys'
  },
  {
    id: 'sql-23',
    title: '23. Consecutive login days',
    description: 'Write a SQL query to select all employee IDs who recorded attendance logs.',
    schema: 'Table: Attendance\n- emp_id (INT)\n- date (VARCHAR)',
    starterQuery: 'SELECT DISTINCT emp_id FROM Attendance;',
    difficulty: 'medium',
    company: 'TCS'
  },
  {
    id: 'sql-24',
    title: '24. Rank employees by salary in department',
    description: 'Write a SQL query to rank employees within their department by salary.',
    schema: 'Table: Employee\n- id (INT, PK)\n- dept_id (INT)\n- salary (INT)',
    starterQuery: 'SELECT name, dept_id, salary, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank FROM Employee;',
    difficulty: 'medium',
    company: 'Cognizant'
  },
  {
    id: 'sql-25',
    title: '25. Customer purchase frequency',
    description: 'Write a SQL query to count total orders per customer ID.',
    schema: 'Table: Orders\n- id (INT, PK)\n- customer_id (INT)',
    starterQuery: 'SELECT customer_id, COUNT(*) AS purchase_count FROM Orders GROUP BY customer_id;',
    difficulty: 'medium',
    company: 'Amazon'
  },

  // Hard (26-30)
  {
    id: 'sql-26',
    title: '26. Nth Highest Salary',
    description: 'Write a SQL query to find the 3rd highest salary from the Employee table.',
    schema: 'Table: Employee\n- id (INT, PK)\n- salary (INT)',
    starterQuery: 'SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 2;',
    difficulty: 'hard',
    company: 'Cognizant'
  },
  {
    id: 'sql-27',
    title: '27. Department top 3 salaries',
    description: 'Write a SQL query to find employees who have the top 3 highest salaries in each department.',
    schema: 'Table: Employee\n- id (INT, PK)\n- dept_id (INT)\n- salary (INT)',
    starterQuery: 'SELECT name, dept_id, salary FROM (SELECT name, dept_id, salary, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank FROM Employee) WHERE rank <= 3;',
    difficulty: 'hard',
    company: 'Amazon'
  },
  {
    id: 'sql-28',
    title: '28. Consecutive available seats',
    description: 'Write a SQL query to list all product IDs with more than 20 items in stock.',
    schema: 'Table: Product\n- id (INT, PK)\n- stock (INT)',
    starterQuery: 'SELECT id FROM Product WHERE stock > 20;',
    difficulty: 'hard',
    company: 'Infosys'
  },
  {
    id: 'sql-29',
    title: '29. Human traffic of stadium',
    description: 'Write a SQL query to output all columns from the Attendance table.',
    schema: 'Table: Attendance\n- emp_id (INT)\n- date (VARCHAR)\n- status (VARCHAR)',
    starterQuery: 'SELECT * FROM Attendance;',
    difficulty: 'hard',
    company: 'TCS'
  },
  {
    id: 'sql-30',
    title: '30. Find median salary',
    description: 'Write a SQL query to calculate the median salary of all employees (using average as approximation).',
    schema: 'Table: Employee\n- id (INT, PK)\n- salary (INT)',
    starterQuery: 'SELECT AVG(salary) FROM Employee;',
    difficulty: 'hard',
    company: 'Google'
  }
];

const usePracticeStore = create((set, get) => ({
  mode: 'dsa',
  setMode: (mode) => set({ mode }),

  questions: [],
  loading: false,
  selectedQuestionId: '',

  fetchQuestions: async () => {
    set({ loading: true });
    try {
      const res = await problemAPI.list();
      set({ questions: res.data, loading: false });
      if (res.data.length > 0 && !get().selectedQuestionId) {
        set({ selectedQuestionId: res.data[0]._id });
      }
    } catch {
      set({ loading: false });
    }
  },

  selectQuestion: (id) => set({ selectedQuestionId: id }),

  // Code editor - now supports 4 languages
  language: 'javascript',
  code: '',
  setLanguage: (lang) => set({ language: lang }),
  setCode: (code) => set({ code }),

  output: '',
  error: '',
  running: false,
  stats: null,
  terminalOpen: false,

  setOutput: (output) => set({ output }),
  setError: (error) => set({ error }),
  setRunning: (running) => set({ running }),
  setStats: (stats) => set({ stats }),
  setTerminalOpen: (open) => set({ terminalOpen: open }),

  // SQL with company-specific problems
  selectedSqlIndex: 0,
  sqlProblems: SQL_PROBLEMS,
  sqlQuery: SQL_PROBLEMS[0].starterQuery,
  sqlOutput: null,
  sqlError: '',
  runningSql: false,
  sqlCompanyFilter: 'all',

  setSqlCompanyFilter: (f) => {
    const filtered = f === 'all' ? SQL_PROBLEMS : SQL_PROBLEMS.filter(p => p.company.toLowerCase() === f.toLowerCase());
    set({ sqlCompanyFilter: f, selectedSqlIndex: 0, sqlQuery: filtered[0]?.starterQuery || '', sqlOutput: null, sqlError: '' });
  },

  getFilteredSqlProblems: () => {
    const f = get().sqlCompanyFilter;
    return f === 'all' ? SQL_PROBLEMS : SQL_PROBLEMS.filter(p => p.company.toLowerCase() === f.toLowerCase());
  },

  selectSqlProblem: (index) => {
    const filtered = get().getFilteredSqlProblems();
    const problem = filtered[index];
    if (problem) {
      set({ selectedSqlIndex: index, sqlQuery: problem.starterQuery, sqlOutput: null, sqlError: '' });
    }
  },

  setSqlQuery: (q) => set({ sqlQuery: q }),
  setSqlOutput: (o) => set({ sqlOutput: o }),
  setSqlError: (e) => set({ sqlError: e }),
  setRunningSql: (r) => set({ runningSql: r }),

  // Interview session
  sessionId: null,
  question: null,
  chatHistory: [],
  suggestions: [],
  interviewer: 'dsa_interviewer',
  typing: false,
  inputText: '',

  setSessionId: (id) => set({ sessionId: id }),
  setQuestion: (q) => set({ question: q }),
  setChatHistory: (h) => set({ chatHistory: h }),
  addChatMessage: (msg) => set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
  setSuggestions: (s) => set({ suggestions: s }),
  setInterviewer: (i) => set({ interviewer: i }),
  setTyping: (t) => set({ typing: t }),
  setInputText: (t) => set({ inputText: t }),

  resetSession: () => set({
    sessionId: null, question: null, chatHistory: [], suggestions: [],
    interviewer: 'dsa_interviewer', typing: false, inputText: '',
    output: '', error: '', stats: null,
  }),

  // Agent Round configs & Timer
  interviewerType: 'dsa', // 'dsa' | 'system-design' | 'hr'
  selectedTopicId: 'url-shortener',
  interviewDuration: 45, // in minutes
  timeLeft: 45 * 60,
  timerActive: false,
  setInterviewerType: (type) => set({ interviewerType: type }),
  setSelectedTopicId: (id) => set({ selectedTopicId: id }),
  setInterviewDuration: (duration) => set({ interviewDuration: duration, timeLeft: duration * 60 }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setTimerActive: (active) => set({ timerActive: active }),

  activeTab: 'problem',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default usePracticeStore;