const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { executeCode } = require('../services/sandboxService');
const { calculatePlacementReadinessScore } = require('../services/placementScoreService');

const PROTO_PATH = path.join(__dirname, 'prep_agent.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const prepAgentProto = grpc.loadPackageDefinition(packageDefinition).prepagent;

// Implement Execute method
const execute = async (call, callback) => {
  try {
    const { code, language } = call.request;
    console.log(`📡 [gRPC] Executing code in language: ${language}`);
    const result = await executeCode(code, language);
    callback(null, {
      success: result.success,
      output: result.output,
      error: result.error,
      exitCode: result.exitCode,
      executionTime: result.executionTime
    });
  } catch (err) {
    callback(err, null);
  }
};

// Implement CalculateReadiness method
const calculateReadiness = async (call, callback) => {
  try {
    const { userId, targetCompany } = call.request;
    console.log(`📡 [gRPC] Calculating readiness for user: ${userId}, company: ${targetCompany}`);
    const score = await calculatePlacementReadinessScore(userId, targetCompany);
    callback(null, {
      overallScore: score.overallScore,
      resumeScore: score.breakdown.resumeScore,
      codingScore: score.breakdown.codingScore,
      interviewScore: score.breakdown.interviewScore,
      sqlScore: score.breakdown.sqlScore,
      companyFit: score.companyFit,
      recommendations: score.recommendations
    });
  } catch (err) {
    callback(err, null);
  }
};

const startGrpcServer = () => {
  const server = new grpc.Server();
  
  server.addService(prepAgentProto.CodeExecutionService.service, { Execute: execute });
  server.addService(prepAgentProto.AssessmentService.service, { CalculateReadiness: calculateReadiness });

  const PORT = process.env.GRPC_PORT || '50051';
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('❌ Failed to bind gRPC server:', err.message);
    } else {
      console.log(`📡 gRPC server successfully running on port ${port}`);
    }
  });
};

module.exports = { startGrpcServer };
