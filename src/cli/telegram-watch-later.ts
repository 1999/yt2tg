import { getNewPinnedMessages, unpinMessage } from '../telegram';
import { info } from '@actions/core';
import { promises as fs } from 'fs';
import { readLatestArtifact } from '../github';
import { checkEnvironmentVariableSet } from './environment';

const LAST_UPDATE_ARTIFACT_NAME = 'telegram_last_update_id';

async function main() {
  const [botToken, chatId, githubToken, githubRepoOwner, githubRepoName] = checkEnvironmentVariableSet(
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID',
    'GITHUB_TOKEN',
    'GITHUB_REPO_OWNER',
    'GITHUB_REPO_NAME'
  );

  const lastUpdateOffset = await readLatestArtifact(
    githubRepoOwner,
    githubRepoName,
    githubToken,
    LAST_UPDATE_ARTIFACT_NAME
  );
  info(`Last update ID offset: ${lastUpdateOffset}`);

  const pinnedEvents = await getNewPinnedMessages(botToken, chatId, lastUpdateOffset);
  for (const event of pinnedEvents) {
    await unpinMessage(botToken, chatId, event.message.id);
  }

  if (pinnedEvents.length || lastUpdateOffset) {
    const offset = pinnedEvents.length ? pinnedEvents.at(-1)!.id.toString() : lastUpdateOffset;
    await fs.writeFile(LAST_UPDATE_ARTIFACT_NAME, offset!);
  }
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
