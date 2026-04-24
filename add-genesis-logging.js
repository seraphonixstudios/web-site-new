const fs = require('fs');
let s = fs.readFileSync('/var/www/ai-image-generator/server.js', 'utf8');

const loggingVars = `
const LOG_FILE = path.join(__dirname, 'logs', 'genesis.log');
const ACCESS_LOG = path.join(__dirname, 'logs', 'access.log');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

function log(level, category, message, data = {}) {
    const entry = { timestamp: new Date().toISOString(), level, category, message, ...data };
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
    console.log(\`[\${level}] [\${category}] \${message}\`, data.error || '');
}

process.on('uncaughtException', (err) => { log('ERROR', 'PROCESS', 'Uncaught exception', {error: err.message, stack: err.stack}); process.exit(1); });
process.on('unhandledRejection', (r) => { log('ERROR', 'PROCESS', 'Unhandled rejection', {error: String(r)}); });
`;

s = s.replace("const TOGETHER_KEY = process.env.TOGETHER_API_KEY;", `const TOGETHER_KEY = process.env.TOGETHER_API_KEY;\n${loggingVars}`);
s = s.replace("console.log(`Genesis Engine v5.1.0 running on port ${PORT}`)", "log('INFO', 'SERVER', 'Genesis Engine v5.1.0 starting', {port: PORT});");
s = s.replace("console.log(`Providers: ${providers.join(', ')}`)", "log('INFO', 'SERVER', 'Providers initialized', {providers: providers.join(', ')});");
fs.writeFileSync('/var/www/ai-image-generator/server.js', s);
console.log('Logging added to Genesis');