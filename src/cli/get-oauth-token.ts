import { getOAuthTokens } from '../auth';
import { checkEnvironmentVariableSet } from './environment';

async function main() {
  const [clientId, clientSecret, redirectUri] = checkEnvironmentVariableSet(
    'GOOGLE_OAUTH_CLIENT_ID',
    'GOOGLE_OAUTH_CLIENT_SECRET',
    'GOOGLE_OAUTH_CLIENT_REDIRECT_URI'
  );

  const tokens = await getOAuthTokens(clientId, clientSecret, redirectUri);
  console.log(JSON.stringify(tokens));
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
