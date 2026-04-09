const fs = require('fs');
const path = require('path');

/** Читает KEY=value из файла без пакета dotenv (чтобы pm2 deploy работал до npm ci). */
function loadEnvFile(absPath) {
  if (!fs.existsSync(absPath)) return;
  fs.readFileSync(absPath, 'utf8').split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) process.env[key] = val;
  });
}

loadEnvFile(path.join(__dirname, '.env.deploy'));

const {
  DEPLOY_USER,
  DEPLOY_HOST,
  DEPLOY_PATH,
  DEPLOY_REF = 'origin/master',
  DEPLOY_REPO,
} = process.env;

module.exports = {
  apps: [
    {
      name: 'mesto-api',
      script: 'npm',
      args: 'start',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],

  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      ref: DEPLOY_REF,
      repo: DEPLOY_REPO,
      path: DEPLOY_PATH,
      'pre-deploy-local': `scp ${path.join(__dirname, '.env')} ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/source/backend/.env`,
      'post-deploy':
        'cd backend && npm ci && pm2 startOrRestart ecosystem.config.js --only mesto-api --update-env',
    },
  },
};
