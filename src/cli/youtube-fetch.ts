import { promises as fs } from 'fs';
import { info, setOutput } from '@actions/core';
import { getNewVideos } from '../youtube';
import { readLatestArtifact } from '../github';
import { checkEnvironmentVariableSet } from './environment';

const LAST_FETCH_ARTIFACT_NAME = 'youtube_last_fetch_date';

const getSinceDate = async (githubToken: string): Promise<Date> => {
  const previousLastFetchDate = await readLatestArtifact(repoOwner, repoName, githubToken, LAST_FETCH_ARTIFACT_NAME);
  if (previousLastFetchDate) {
    return new Date(previousLastFetchDate);
  }

  const since = new Date();
  since.setHours(since.getHours() - 1);

  return since;
};

async function main() {
  const [clientId, clientSecret, redirectUri, credentials, githubToken] = checkEnvironmentVariableSet(
    'GOOGLE_OAUTH_CLIENT_ID',
    'GOOGLE_OAUTH_CLIENT_SECRET',
    'GOOGLE_OAUTH_CLIENT_REDIRECT_URI',
    'GOOGLE_OAUTH_CREDENTIALS',
    'GITHUB_TOKEN'
  );

  const since = await getSinceDate(githubToken);
  info(`Fetching videos since ${since}`);

  const channelVideos = await getNewVideos(clientId, clientSecret, redirectUri, JSON.parse(credentials), since);

  const output = new Array<string>();
  for (const { channel, videos } of channelVideos) {
    for (const video of videos) {
      const message = { channel, video };
      output.push(JSON.stringify(message));
    }
  }

  setOutput('videos', output);
  await fs.writeFile(LAST_FETCH_ARTIFACT_NAME, new Date().toISOString());
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
