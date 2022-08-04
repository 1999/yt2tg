import { google } from 'googleapis';
import { createServer } from 'http';
import open from 'open';
import destroyer from 'server-destroy';
import { Credentials } from 'google-auth-library';

const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtubepartner',
  'https://www.googleapis.com/auth/youtubepartner-channel-audit',
];

/**
 * Run this function and save the stdout
 */
export const getOAuthTokens = async (
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<Credentials> => {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  google.options({ auth: oauth2Client });

  return new Promise<Credentials>((resolve, reject) => {
    // grab the url that will be used for authorization
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: OAUTH_SCOPES.join(' '),
    });

    const server = createServer(async (req, res) => {
      try {
        if (!req.url?.startsWith('/oauth2callback')) {
          return;
        }

        const url = new URL(req.url, 'https://example.com');
        const code = url.searchParams.get('code');

        if (!code) {
          reject(new Error('No code in OAuth2 redirect URL'));
          return;
        }

        res.end('Authentication successful! Please return to the console.');
        server.destroy();

        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.refresh_token) {
          reject(
            new Error(
              'No refresh token in response. Remove access for your app here: https://myaccount.google.com/u/0/permissions'
            )
          );
          return;
        }

        resolve(tokens);
      } catch (err) {
        reject(err);
      }
    }).listen(3000, () => {
      open(authorizeUrl, { wait: false }).then((cp) => cp.unref());
    });

    destroyer(server);
  });
};
