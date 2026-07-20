const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const SQLProblem = require('../models/SQLProblem');

const seedAllProblems = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prep-agent';
    await mongoose.connect(mongoUri);

    console.log('🌱 Connected to MongoDB...\n');

    // Seed DSA Problems
    console.log('📚 Seeding DSA Problems...');
    const dsaProblems = require('./problemSeeds');
    const dsaData = dsaProblems.generate50Problems ? dsaProblems.generate50Problems() : [];
    
    if (dsaData.length > 0) {
      await Problem.deleteMany({});
      await Problem.insertMany(dsaData);
      console.log(`✅ Seeded ${dsaData.length} DSA problems\n`);
    } else {
      console.log('⚠️  No DSA problems to seed\n');
    }

    // Seed SQL Problems from company seeds
    console.log('🔍 Seeding Company-Specific SQL Problems...');
    const companySqlProblems = require('./companySqlSeeds');
    
    if (companySqlProblems.length > 0) {
      await SQLProblem.deleteMany({});
      
      const formattedSqlProblems = companySqlProblems.map(prob => ({
        title: prob.title,
        description: prob.description,
        difficulty: prob.id.includes('leetcode') ? 'medium' : 
                    prob.id.includes('cognizant') || prob.id.includes('tcs') ? 'easy' : 'medium',
        category: 'Company Pattern',
        schema: prob.schema,
        expectedResult: prob.starterQuery,
        hints: [
          "Review the table schemas carefully",
          "Consider using JOINs if multiple tables are involved",
          "Think about which aggregation functions might be needed"
        ],
        tags: [prob.company.toLowerCase(), 'company-specific'],
        companies: [prob.company],
        acceptance: parseFloat((Math.random() * 30 + 50).toFixed(1))
      }));

      await SQLProblem.insertMany(formattedSqlProblems);
      console.log(`✅ Seeded ${formattedSqlProblems.length} company-specific SQL problems\n`);
    } else {
      console.log('⚠️  No SQL problems to seed\n');
    }

    // Seed additional SQL problems from JSON if available
    try {
      const sqlProblemsJson = require('./sqlProblems.json');
      if (sqlProblemsJson && sqlProblemsJson.length > 0) {
        console.log('🔍 Seeding Generated SQL Problems...');
        
        // Take first 30 problems from the generated set
        const additionalProblems = sqlProblemsJson.slice(0, 30).map(prob => ({
          title: prob.title,
          description: prob.description,
          difficulty: prob.difficulty.toLowerCase(),
          category: prob.category,
          schema: prob.tables.map(t => 
            `${t.name}(${t.columns.map(c => `${c.name} ${c.type}`).join(', ')})`
          ).join('\n\n'),
          expectedResult: prob.solution.query,
          hints: prob.hints,
          tags: prob.tags,
          companies: prob.companies,
          acceptance: parseFloat(prob.acceptance)
        }));

        await SQLProblem.insertMany(additionalProblems);
        console.log(`✅ Seeded ${additionalProblems.length} additional SQL problems\n`);
      }
    } catch (err) {
      console.log('ℹ️  No additional SQL problems JSON found, skipping...\n');
    }

    // Summary
    const dsaCount = await Problem.countDocuments();
    const sqlCount = await SQLProblem.countDocuments();
    
    console.log('📊 Seeding Summary:');
    console.log(`   - DSA Problems: ${dsaCount}`);
    console.log(`   - SQL Problems: ${sqlCount}`);
    console.log(`   - Total: ${dsaCount + sqlCount}\n`);

    console.log('✅ All problems seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding problems:', error);
    process.exit(1);
  }
};

seedAllProblems();