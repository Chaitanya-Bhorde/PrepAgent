const client = require('prom-client');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in microseconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const submissionCounter = new client.Counter({
  name: 'code_submissions_total',
  help: 'Total number of code submissions processed',
  labelNames: ['language', 'status']
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(submissionCounter);

// OpenTelemetry Setup
const initializeOpenTelemetry = () => {
  console.log('📡 [OpenTelemetry] Initializing distributed tracing auto-instrumentations...');
  
  const sdk = new NodeSDK({
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
  console.log('✅ [OpenTelemetry] SDK started successfully.');
  
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('📡 [OpenTelemetry] SDK terminated.'))
      .catch((err) => console.error('❌ [OpenTelemetry] Error terminating SDK:', err))
      .finally(() => process.exit(0));
  });
};

module.exports = {
  register,
  metrics: {
    httpRequestDurationMicroseconds,
    submissionCounter
  },
  initializeOpenTelemetry
};
