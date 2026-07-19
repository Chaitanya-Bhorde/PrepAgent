const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');

const seedContests = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prep-agent';
    await mongoose.connect(mongoUri);

    console.log('🌱 Connected to MongoDB to seed contests...');

    // Delete existing contests
    await Contest.deleteMany({});

    // Fetch seeded problems to link
    const allProblems = await Problem.find({});
    if (allProblems.length === 0) {
      console.warn('⚠️ No problems found in DB! Please seed problems first.');
      process.exit(1);
    }

    const easyAndMedium = allProblems.slice(0, 3).map(p => p._id);
    const harderSet = allProblems.slice(3, 6).map(p => p._id);

    const mockContests = [
      {
        title: "Weekly Contest #402",
        description: "Settle in for our standard weekly programming challenge. Complete 3 tasks under 60 minutes to raise your Global Placement Readiness Rating.",
        durationMinutes: 60,
        startTime: new Date(), // Active right now
        problems: easyAndMedium,
        participants: [
          {
            name: "Amit Sharma",
            score: 40,
            finishTime: new Date(Date.now() - 1000 * 60 * 20)
          },
          {
            name: "Rohan Joshi",
            score: 30,
            finishTime: new Date(Date.now() - 1000 * 60 * 35)
          }
        ]
      },
      {
        title: "Biweekly Contest #135",
        description: "A challenging weekend code sprint containing medium and hard tree traversal and list manipulation challenges.",
        durationMinutes: 90,
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // Starts tomorrow
        problems: harderSet,
        participants: []
      }
    ];

    await Contest.insertMany(mockContests);
    console.log(`✅ Successfully seeded ${mockContests.length} contests!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding contests:', error);
    process.exit(1);
  }
};

seedContests();
