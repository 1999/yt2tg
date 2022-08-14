import { getNewPinnedMessages } from '../telegram';
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

  const previousLastFetchDate = await readLatestArtifact(
    githubRepoOwner,
    githubRepoName,
    githubToken,
    LAST_UPDATE_ARTIFACT_NAME
  );
  info(`Last update ID offset: ${previousLastFetchDate}`);

  const pinnedMessages = await getNewPinnedMessages(botToken, chatId, previousLastFetchDate);
  if (!pinnedMessages.length) {
    info('No new pinned messages');
    return;
  }

  console.log(JSON.stringify(pinnedMessages, null, 2));

  // await unpinMessage(process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_ID, 107);

  // get all updates: update.update_id and update.channel_post.pinned_message.text, update.channel_post.message_id

  await fs.writeFile(LAST_UPDATE_ARTIFACT_NAME, pinnedMessages.at(-1)!.id.toString());
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
