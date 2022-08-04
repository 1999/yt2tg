import { getOAuthTokens } from './auth';
import { getNewVideos } from './youtube';
import { Credentials } from 'google-auth-library';
import { sendMesage } from './telegram';

async function main() {
  if (!process.env.GOOGLE_OAUTH_CREDENTIALS) {
    throw new Error('GOOGLE_OAUTH_CREDENTIALS env is not set');
  }

  console.log('About to run...');
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
