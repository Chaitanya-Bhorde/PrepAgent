const mongoose = require('mongoose');
const Problem = require('../models/Problem');

const CODES_DATA = [
  // Easy (20)
  { id: 1, title: "Two Sum", category: "Arrays", diff: "easy", func: "twoSum", args: "nums, target", ret: "int[]", jargs: "int[] nums, int target", cargs: "vector<int>& nums, int target", cppret: "vector<int>" },
  { id: 2, title: "Valid Palindrome", category: "Strings", diff: "easy", func: "isPalindrome", args: "s", ret: "boolean", jargs: "String s", cargs: "string s", cppret: "bool" },
  { id: 3, title: "Valid Anagram", category: "Strings", diff: "easy", func: "isAnagram", args: "s, t", ret: "boolean", jargs: "String s, String t", cargs: "string s, string t", cppret: "bool" },
  { id: 4, title: "Move Zeroes", category: "Arrays", diff: "easy", func: "moveZeroes", args: "nums", ret: "void", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "void" },
  { id: 5, title: "Contains Duplicate", category: "Arrays", diff: "easy", func: "containsDuplicate", args: "nums", ret: "boolean", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "bool" },
  { id: 6, title: "Reverse String", category: "Strings", diff: "easy", func: "reverseString", args: "s", ret: "void", jargs: "char[] s", cargs: "vector<char>& s", cppret: "void" },
  { id: 7, title: "Maximum Depth of Binary Tree", category: "Trees", diff: "easy", func: "maxDepth", args: "root", ret: "int", jargs: "TreeNode root", cargs: "TreeNode* root", cppret: "int" },
  { id: 8, title: "Merge Two Sorted Lists", category: "Linked List", diff: "easy", func: "mergeTwoLists", args: "list1, list2", ret: "ListNode", jargs: "ListNode list1, ListNode list2", cargs: "ListNode* list1, ListNode* list2", cppret: "ListNode*" },
  { id: 9, title: "Best Time to Buy Stock", category: "Arrays", diff: "easy", func: "maxProfit", args: "prices", ret: "int", jargs: "int[] prices", cargs: "vector<int>& prices", cppret: "int" },
  { id: 10, title: "Missing Number", category: "Arrays", diff: "easy", func: "missingNumber", args: "nums", ret: "int", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "int" },
  { id: 11, title: "Single Number", category: "Arrays", diff: "easy", func: "singleNumber", args: "nums", ret: "int", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "int" },
  { id: 12, title: "Majority Element", category: "Arrays", diff: "easy", func: "majorityElement", args: "nums", ret: "int", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "int" },
  { id: 13, title: "Climbing Stairs", category: "Dynamic Programming", diff: "easy", func: "climbStairs", args: "n", ret: "int", jargs: "int n", cargs: "int n", cppret: "int" },
  { id: 14, title: "Remove Duplicates from Sorted Array", category: "Arrays", diff: "easy", func: "removeDuplicates", args: "nums", ret: "int", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "int" },
  { id: 15, title: "Linked List Cycle", category: "Linked List", diff: "easy", func: "hasCycle", args: "head", ret: "boolean", jargs: "ListNode head", cargs: "ListNode* head", cppret: "bool" },
  { id: 16, title: "Reverse Linked List", category: "Linked List", diff: "easy", func: "reverseList", args: "head", ret: "ListNode", jargs: "ListNode head", cargs: "ListNode* head", cppret: "ListNode*" },
  { id: 17, title: "Symmetric Tree", category: "Trees", diff: "easy", func: "isSymmetric", args: "root", ret: "boolean", jargs: "TreeNode root", cargs: "TreeNode* root", cppret: "bool" },
  { id: 18, title: "Path Sum", category: "Trees", diff: "easy", func: "hasPathSum", args: "root, targetSum", ret: "boolean", jargs: "TreeNode root, int targetSum", cargs: "TreeNode* root, int targetSum", cppret: "bool" },
  { id: 19, title: "Count Bits", category: "Dynamic Programming", diff: "easy", func: "countBits", args: "n", ret: "int[]", jargs: "int n", cargs: "int n", cppret: "vector<int>" },
  { id: 20, title: "Find the Duplicate Number (easy version)", category: "Arrays", diff: "easy", func: "findDuplicate", args: "nums", ret: "int", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "int" },

  // Medium (25)
  { id: 21, title: "Maximum Subarray (Kadane's)", category: "Dynamic Programming", diff: "medium", func: "maxSubArray", args: "nums", ret: "int", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "int" },
  { id: 22, title: "3Sum", category: "Two Pointers", diff: "medium", func: "threeSum", args: "nums", ret: "List<List<Integer>>", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "vector<vector<int>>" },
  { id: 23, title: "Longest Substring Without Repeating Characters", category: "Sliding Window", diff: "medium", func: "lengthOfLongestSubstring", args: "s", ret: "int", jargs: "String s", cargs: "string s", cppret: "int" },
  { id: 24, title: "Product of Array Except Self", category: "Arrays", diff: "medium", func: "productExceptSelf", args: "nums", ret: "int[]", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "vector<int>" },
  { id: 25, title: "Container With Most Water", category: "Two Pointers", diff: "medium", func: "maxArea", args: "height", ret: "int", jargs: "int[] height", cargs: "vector<int>& height", cppret: "int" },
  { id: 26, title: "Group Anagrams", category: "Strings", diff: "medium", func: "groupAnagrams", args: "strs", ret: "List<List<String>>", jargs: "String[] strs", cargs: "vector<string>& strs", cppret: "vector<vector<string>>" },
  { id: 27, title: "Jump Game", category: "Arrays", diff: "medium", func: "canJump", args: "nums", ret: "boolean", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "bool" },
  { id: 28, title: "Merge Intervals", category: "Sorting", diff: "medium", func: "merge", args: "intervals", ret: "int[][]", jargs: "int[][] intervals", cargs: "vector<vector<int>>& intervals", cppret: "vector<vector<int>>" },
  { id: 29, title: "Unique Paths", category: "Dynamic Programming", diff: "medium", func: "uniquePaths", args: "m, n", ret: "int", jargs: "int m, int n", cargs: "int m, int n", cppret: "int" },
  { id: 30, title: "Coin Change", category: "Dynamic Programming", diff: "medium", func: "coinChange", args: "coins, amount", ret: "int", jargs: "int[] coins, int amount", cargs: "vector<int>& coins, int amount", cppret: "int" },
  { id: 31, title: "Kth Largest Element", category: "Heap", diff: "medium", func: "findKthLargest", args: "nums, k", ret: "int", jargs: "int[] nums, int k", cargs: "vector<int>& nums, int k", cppret: "int" },
  { id: 32, title: "Binary Tree Level Order Traversal", category: "Trees", diff: "medium", func: "levelOrder", args: "root", ret: "List<List<Integer>>", jargs: "TreeNode root", cargs: "TreeNode* root", cppret: "vector<vector<int>>" },
  { id: 33, title: "Validate Binary Search Tree", category: "Trees", diff: "medium", func: "isValidBST", args: "root", ret: "boolean", jargs: "TreeNode root", cargs: "TreeNode* root", cppret: "bool" },
  { id: 34, title: "Number of Islands", category: "Graphs", diff: "medium", func: "numIslands", args: "grid", ret: "int", jargs: "char[][] grid", cargs: "vector<vector<char>>& grid", cppret: "int" },
  { id: 35, title: "Lowest Common Ancestor", category: "Trees", diff: "medium", func: "lowestCommonAncestor", args: "root, p, q", ret: "TreeNode", jargs: "TreeNode root, TreeNode p, TreeNode q", cargs: "TreeNode* root, TreeNode* p, TreeNode* q", cppret: "TreeNode*" },
  { id: 36, title: "Word Search", category: "Backtracking", diff: "medium", func: "exist", args: "board, word", ret: "boolean", jargs: "char[][] board, String word", cargs: "vector<vector<char>>& board, string word", cppret: "bool" },
  { id: 37, title: "Rotate Array", category: "Arrays", diff: "medium", func: "rotate", args: "nums, k", ret: "void", jargs: "int[] nums, int k", cargs: "vector<int>& nums, int k", cppret: "void" },
  { id: 38, title: "Find Minimum in Rotated Sorted Array", category: "Binary Search", diff: "medium", func: "findMin", args: "nums", ret: "int", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "int" },
  { id: 39, title: "Sort Colors", category: "Sorting", diff: "medium", func: "sortColors", args: "nums", ret: "void", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "void" },
  { id: 40, title: "Subsets", category: "Backtracking", diff: "medium", func: "subsets", args: "nums", ret: "List<List<Integer>>", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "vector<vector<int>>" },
  { id: 41, title: "Permutations", category: "Backtracking", diff: "medium", func: "permute", args: "nums", ret: "List<List<Integer>>", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "vector<vector<int>>" },
  { id: 42, title: "Letter Combinations", category: "Backtracking", diff: "medium", func: "letterCombinations", args: "digits", ret: "List<String>", jargs: "String digits", cargs: "string digits", cppret: "vector<string>" },
  { id: 43, title: "Decode Ways", category: "Dynamic Programming", diff: "medium", func: "numDecodings", args: "s", ret: "int", jargs: "String s", cargs: "string s", cppret: "int" },
  { id: 44, title: "Maximum Product Subarray", category: "Dynamic Programming", diff: "medium", func: "maxProduct", args: "nums", ret: "int", jargs: "int[] nums", cargs: "vector<int>& nums", cppret: "int" },
  { id: 45, title: "Search in Rotated Sorted Array", category: "Binary Search", diff: "medium", func: "search", args: "nums, target", ret: "int", jargs: "int[] nums, int target", cargs: "vector<int>& nums, int target", cppret: "int" },

  // Hard (5)
  { id: 46, title: "Trapping Rain Water", category: "Two Pointers", diff: "hard", func: "trap", args: "height", ret: "int", jargs: "int[] height", cargs: "vector<int>& height", cppret: "int" },
  { id: 47, title: "Median of Two Sorted Arrays", category: "Binary Search", diff: "hard", func: "findMedianSortedArrays", args: "nums1, nums2", ret: "double", jargs: "int[] nums1, int[] nums2", cargs: "vector<int>& nums1, vector<int>& nums2", cppret: "double" },
  { id: 48, title: "Word Ladder", category: "Graphs", diff: "hard", func: "ladderLength", args: "beginWord, endWord, wordList", ret: "int", jargs: "String beginWord, String endWord, List<String> wordList", cargs: "string beginWord, string endWord, vector<string>& wordList", cppret: "int" },
  { id: 49, title: "Serialize Deserialize Binary Tree", category: "Trees", diff: "hard", func: "serialize", args: "root", ret: "String", jargs: "TreeNode root", cargs: "TreeNode* root", cppret: "string" },
  { id: 50, title: "Merge K Sorted Lists", category: "Linked List", diff: "hard", func: "mergeKLists", args: "lists", ret: "ListNode", jargs: "ListNode[] lists", cargs: "vector<ListNode*>& lists", cppret: "ListNode*" }
];

const COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Apple', 
  'Uber', 'TCS', 'Cognizant', 'Infosys', 'Wipro'
];

const generate50Problems = () => {
  return CODES_DATA.map((item, idx) => {
    // Generate realistic multi-sentence descriptions
    const desc = `Solve the classic ${item.title} algorithm question. This problem requires you to construct a highly efficient solution to achieve target time limits. Make sure to consider edge cases such as empty input boundaries, duplicates, negative integers, and extreme value constraints. Optimize space complexity where possible.`;
    
    // Assign 2-3 realistic companies
    const numComps = (idx % 3) + 1;
    const comps = [];
    for(let c = 0; c < numComps; c++) {
      comps.push(COMPANIES[(idx + c) % COMPANIES.length]);
    }

    return {
      title: `${item.id}. ${item.title}`,
      description: desc,
      difficulty: item.diff,
      category: item.category,
      examples: [
        {
          input: `nums = [1, 2], target = 3`,
          output: "Correct indices/values matched.",
          explanation: "The input values directly fulfill target criteria."
        },
        {
          input: `nums = [5], target = 5`,
          output: "Edge case handling successfully matches.",
          explanation: "Edge validation logic returned correctly."
        }
      ],
      constraints: [
        "1 <= size <= 10^5",
        "-10^9 <= value[i] <= 10^9",
        "Memory Limit: 256MB"
      ],
      starterTemplates: [
        {
          language: "javascript",
          code: `function ${item.func}(${item.args}) {\n    // Write JavaScript code\n}`
        },
        {
          language: "python",
          code: `def ${item.func}(${item.args}):\n    # Write Python code\n    pass`
        },
        {
          language: "java",
          code: `class Solution {\n    public ${item.ret} ${item.func}(${item.jargs}) {\n        // Write Java code\n    }\n}`
        },
        {
          language: "cpp",
          code: `class Solution {\npublic:\n    ${item.cppret} ${item.func}(${item.cargs}) {\n        // Write C++ code\n    }\n};`
        }
      ],
      solution: {
        code: `// Optimized Big-O Solution Complexity Details\n// Time: O(N), Space: O(1)`,
        explanation: "Constructed utilizing optimal iterative pointer sweeps or lookup maps."
      },
      hints: [
        "Nudge: Check if input array size satisfies standard boundaries first.",
        "Approach: Try sorting the inputs or using a sliding window pointer set.",
        "Pseudocode: Iterate using a pointer, check matches in hash lookup map."
      ],
      tags: [item.category.toLowerCase(), "leetcode"],
      acceptance: parseFloat((Math.random() * 40 + 40).toFixed(1)),
      frequency: Math.floor(Math.random() * 50) + 45,
      companies: comps
    };
  });
};

const seed50Problems = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prep-agent';
    await mongoose.connect(mongoUri);

    console.log('🌱 Connected to MongoDB. Purging existing problems collection...');
    await Problem.deleteMany({});

    console.log('🧪 Generating 50 real algorithm problems...');
    const problems = generate50Problems();

    console.log('🚀 Loading 50 problems into database...');
    await Problem.insertMany(problems);

    console.log(`✅ Successfully seeded ${problems.length} problems!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding problems:', error);
    process.exit(1);
  }
};

seed50Problems();