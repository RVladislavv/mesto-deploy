const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env.deploy') });

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
      'pre-deploy-local': `scp "${path.join(__dirname, '.env')}" ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/source/frontend/.env`,
      'post-deploy':
        'cd frontend && npm ci && export NODE_OPTIONS=--openssl-legacy-provider && npm run build',
    },
  },
};
