import { promises as fs } from 'fs';
import { info, setOutput } from '@actions/core';
import { getNewVideos, getVideoUrl } from '../youtube';
import { parseRepository, readLatestArtifact } from '../github';
import { checkEnvironmentVariableSet } from './environment';

const LAST_FETCH_ARTIFACT_NAME = 'youtube_last_fetch_date';

const getSinceDate = async (githubToken: string, githubRepoOwner: string, githubRepoName: string): Promise<Date> => {
  const previousLastFetchDate = await readLatestArtifact(
    githubRepoOwner,
    githubRepoName,
    githubToken,
    LAST_FETCH_ARTIFACT_NAME
  );
  if (previousLastFetchDate) {
    return new Date(previousLastFetchDate);
  }

  const since = new Date();
  since.setHours(since.getHours() - 1);

  return since;
};

async function main() {
  const [clientId, clientSecret, redirectUri, credentials, githubToken, githubRepository] = checkEnvironmentVariableSet(
    'GOOGLE_OAUTH_CLIENT_ID',
    'GOOGLE_OAUTH_CLIENT_SECRET',
    'GOOGLE_OAUTH_CLIENT_REDIRECT_URI',
    'GOOGLE_OAUTH_CREDENTIALS',
    'GITHUB_TOKEN',
    'GITHUB_REPOSITORY'
  );

  const { owner, name } = parseRepository(githubRepository);
  const since = await getSinceDate(githubToken, owner, name);
  info(`Fetching videos since ${since}`);

  const channelVideos = await getNewVideos(clientId, clientSecret, redirectUri, JSON.parse(credentials), since);

  const output = new Array<string>();
  for (const { channel, videos } of channelVideos) {
    for (const video of videos) {
      const message = getVideoUrl(video.id);
      output.push(message);
    }
  }

  setOutput('videos', output);
  await fs.writeFile(LAST_FETCH_ARTIFACT_NAME, new Date().toISOString());
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
