import { getOAuthTokens } from './auth';
import { getNewVideos } from './youtube';
import { Credentials } from 'google-auth-library';
import { sendMesage } from './telegram';

async function main() {}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
