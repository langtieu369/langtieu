"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const TuTienClient_1 = require("./client/TuTienClient");
const ready_1 = require("./events/ready");
const interactionCreate_1 = require("./events/interactionCreate");
const database_1 = __importDefault(require("./database/database"));
const DeploymentRuntimeService_1 = require("./services/DeploymentRuntimeService");
if (!config_1.config.token) {
    console.error('❌ Thiếu DISCORD_TOKEN');
    process.exit(1);
}
DeploymentRuntimeService_1.deploymentRuntime.validateStorage();
DeploymentRuntimeService_1.deploymentRuntime.startHealthServer();
const client = new TuTienClient_1.TuTienClient();
let stopping = false;
async function shutdown(signal, exitCode = 0) { if (stopping)
    return; stopping = true; DeploymentRuntimeService_1.deploymentRuntime.markStopping(); DeploymentRuntimeService_1.deploymentRuntime.log('info', 'shutdown.begin', { signal }); (0, ready_1.stopEventScheduler)(); client.destroy(); DeploymentRuntimeService_1.deploymentRuntime.checkpoint(); await DeploymentRuntimeService_1.deploymentRuntime.stopHealthServer(); try {
    database_1.default.close();
}
catch { } DeploymentRuntimeService_1.deploymentRuntime.log('info', 'shutdown.complete', { signal }); process.exit(exitCode); }
process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', error => DeploymentRuntimeService_1.deploymentRuntime.log('error', 'process.unhandledRejection', { error: String(error) }));
process.on('uncaughtException', error => { DeploymentRuntimeService_1.deploymentRuntime.log('fatal', 'process.uncaughtException', { error: String(error), stack: error.stack || '' }); void shutdown('UNCAUGHT_EXCEPTION', 1); });
client.once('ready', () => (0, ready_1.onReady)(client).then(() => DeploymentRuntimeService_1.deploymentRuntime.markReady()).catch(error => { DeploymentRuntimeService_1.deploymentRuntime.log('fatal', 'startup.failed', { error: String(error) }); void shutdown('STARTUP_FAILURE', 1); }));
client.on('interactionCreate', i => (0, interactionCreate_1.onInteraction)(client, i).catch(error => DeploymentRuntimeService_1.deploymentRuntime.log('error', 'interaction.unhandled', { error: String(error) })));
client.start(config_1.config.token).catch(error => { DeploymentRuntimeService_1.deploymentRuntime.log('fatal', 'discord.login.failed', { error: String(error) }); void shutdown('LOGIN_FAILURE', 1); });
