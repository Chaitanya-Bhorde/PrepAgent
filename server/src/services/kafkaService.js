const { Kafka } = require('kafkajs');
const { executeCode } = require('./sandboxService');
const Submission = require('../models/Submission');
const { updateCodingStats } = require('./placementScoreService');
const { getIO } = require('./socketService');

let kafka = null;
let producer = null;
let consumer = null;
let isKafkaConnected = false;

// Local fallback queue (in-memory emitter)
const EventEmitter = require('events');
class LocalQueue extends EventEmitter {}
const localQueue = new LocalQueue();

// Handle local queue worker
localQueue.on('submission', async ({ submissionId, code, language, userId, problemId }) => {
  console.log(`📦 [Local Queue] Processing submission ${submissionId} for user ${userId}...`);
  try {
    const result = await executeCode(code, language);
    
    // Update submission record
    const status = result.success ? 'ACCEPTED' : 'COMPILE_ERROR';
    await Submission.findByIdAndUpdate(submissionId, {
      status,
      executionTime: result.executionTime,
      output: result.output,
      error: result.error
    });

    // Update user stats
    await updateCodingStats(userId, {
      success: result.success,
      language,
      difficulty: 'medium', // can be dynamic based on problem
      timeSpent: result.executionTime / 1000,
      problemId
    });

    // Emit results
    const io = getIO();
    if (io) {
      io.to(userId).emit('submissionResult', {
        submissionId,
        status,
        executionTime: result.executionTime,
        output: result.output,
        error: result.error
      });
    }

    console.log(`✅ [Local Queue] Finished processing submission ${submissionId}`);
  } catch (err) {
    console.error(`❌ [Local Queue] Failed to process submission ${submissionId}:`, err.message);
  }
});

const initializeKafka = async () => {
  const brokers = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];
  
  try {
    console.log('🔌 Connecting to Apache Kafka brokers:', brokers);
    
    kafka = new Kafka({
      clientId: 'prep-agent-server',
      brokers,
      connectionTimeout: 3000, // Timeout fast
    });

    producer = kafka.producer();
    consumer = kafka.consumer({ groupId: 'submission-group' });

    await producer.connect();
    await consumer.connect();
    
    await consumer.subscribe({ topic: 'submissions', fromBeginning: true });
    
    // Kafka Worker logic
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const payload = JSON.parse(message.value.toString());
        const { submissionId, code, language, userId, problemId } = payload;
        
        console.log(`📦 [Kafka Consumer] Processing submission ${submissionId}...`);
        const result = await executeCode(code, language);
        
        // Update submission in Mongo
        const status = result.success ? 'ACCEPTED' : 'COMPILE_ERROR';
        await Submission.findByIdAndUpdate(submissionId, {
          status,
          executionTime: result.executionTime,
          output: result.output,
          error: result.error
        });

        // Update user stats
        await updateCodingStats(userId, {
          success: result.success,
          language,
          difficulty: 'medium',
          timeSpent: result.executionTime / 1000,
          problemId
        });

        // Emit results
        const io = getIO();
        if (io) {
          io.to(userId).emit('submissionResult', {
            submissionId,
            status,
            executionTime: result.executionTime,
            output: result.output,
            error: result.error
          });
        }
        
        console.log(`✅ [Kafka Consumer] Successfully processed submission ${submissionId}`);
      },
    });

    isKafkaConnected = true;
    console.log('✅ Apache Kafka Producer & Consumer connected and listening.');
  } catch (error) {
    console.warn('⚠️ Apache Kafka connection timed out or failed. Falling back to local in-memory event-queue...');
    isKafkaConnected = false;
  }
};

const sendSubmissionToQueue = async (submissionId, userId, problemId, code, language) => {
  const payload = { submissionId, userId, problemId, code, language };
  
  if (isKafkaConnected && producer) {
    try {
      console.log(`📡 [Kafka Producer] Sending submission ${submissionId} to Kafka...`);
      await producer.send({
        topic: 'submissions',
        messages: [{ value: JSON.stringify(payload) }],
      });
      return;
    } catch (err) {
      console.error('❌ Kafka send failed. Re-routing to local queue fallback...');
    }
  }

  // Local fallback trigger
  console.log(`📡 [Local Queue] Routing submission ${submissionId} to local fallback queue...`);
  localQueue.emit('submission', payload);
};

module.exports = {
  initializeKafka,
  sendSubmissionToQueue
};
