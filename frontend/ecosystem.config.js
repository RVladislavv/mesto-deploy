const fs = require('fs');
const path = require('path');

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
loadEnvFile(path.join(__dirname, '.env'));

const {
  DEPLOY_USER,
  DEPLOY_HOST,
  DEPLOY_PATH,
  DEPLOY_REF = 'origin/master',
  DEPLOY_REPO,
  REACT_APP_API_URL,
} = process.env;

if (!REACT_APP_API_URL) {
  throw new Error('В frontend/.env задайте REACT_APP_API_URL (URL бэкенда для production-сборки).');
}

module.exports = {
  apps: [
    {
      name: 'mesto-frontend',
      script: 'npm',
      args: 'run build',
      cwd: __dirname,
      autorestart: false,
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--openssl-legacy-provider',
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
      'pre-deploy-local': `scp ${path.join(__dirname, '.env')} ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/source/frontend/.env`,
      'post-deploy': `export NVM_DIR=$HOME/.nvm; [ -s $NVM_DIR/nvm.sh ] && . $NVM_DIR/nvm.sh; cd frontend && export REACT_APP_API_URL=${REACT_APP_API_URL} && npm ci && export NODE_OPTIONS=--openssl-legacy-provider && npm run build`,
    },
  },
};
