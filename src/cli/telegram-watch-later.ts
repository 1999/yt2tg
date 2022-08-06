import { getNewPinnedMessages } from '../telegram';
import { info, warning } from '@actions/core';
import { promises as fs } from 'fs';

const CACHE_FILE_PATH = 'telegram_last_update_id';

const getLastUpdateId = async (): Promise<string | undefined> => {
  try {
    return await fs.readFile(CACHE_FILE_PATH, { encoding: 'utf-8' });
  } catch (err) {
    warning('Could not find last update ID cache file');
    return;
  }
};

const setLastUpdateId = async (lastUpdateId: number): Promise<void> => {
  await fs.writeFile(CACHE_FILE_PATH, lastUpdateId.toString());
};

async function main() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN env is not set');
  }

  if (!process.env.TELEGRAM_CHAT_ID) {
    throw new Error('TELEGRAM_CHAT_ID env is not set');
  }

  const lastUpdateId = await getLastUpdateId();
  info(`Last update ID offset: ${lastUpdateId}`);

  const pinnedMessages = await getNewPinnedMessages(
    process.env.TELEGRAM_BOT_TOKEN,
    process.env.TELEGRAM_CHAT_ID,
    lastUpdateId
  );

  if (!pinnedMessages.length) {
    info('No new pinned messages');
    return;
  }

  console.log(JSON.stringify(pinnedMessages, null, 2));

  // await unpinMessage(process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_ID, 107);

  // get all updates: update.update_id and update.channel_post.pinned_message.text, update.channel_post.message_id

  await setLastUpdateId(pinnedMessages.at(-1)!.id);
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
