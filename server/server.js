const dotenv = require('dotenv');
dotenv.config();

// 1. Initialize OpenTelemetry BEFORE any modules are imported for auto-instrumentation
const { initializeOpenTelemetry } = require('./src/services/monitoring');
initializeOpenTelemetry();

const connectDB = require('./src/config/db');
const app = require('./src/app');
const { initializeSocket } = require('./src/services/socketService');
const { initializeKafka } = require('./src/services/kafkaService');
const { startGrpcServer } = require('./src/grpc/grpcServer');
const { expressMiddleware } = require('@apollo/server/express4');
const { createGraphQLServer } = require('./src/graphql/graphqlSchema');

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // 2. Initialize Apollo GraphQL Server
  const apolloServer = createGraphQLServer();
  await apolloServer.start();
  app.use('/graphql', expressMiddleware(apolloServer));
  console.log('🚀 Apollo GraphQL server initialized on /graphql');

  // 3. Start Express HTTP Server
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // 4. Initialize Socket.io
  initializeSocket(server);
  console.log('🔌 Socket.io server initialized for real-time dialogue');

  // 5. Initialize Kafka submission queues
  await initializeKafka();

  // 6. Start gRPC Server
  startGrpcServer();
});
