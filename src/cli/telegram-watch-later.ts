import { getNewPinnedMessages } from '../telegram';
import { warning } from '@actions/core';
import { promises as fs } from 'fs';

const CACHE_FILE_PATH = 'telegram_last_update_id';

const getLastUpdateId = async (): Promise<string | void> => {
  try {
    return fs.readFile(CACHE_FILE_PATH, { encoding: 'utf-8' });
  } catch (err) {
    warning('Could not find last update ID cache file');
    return;
  }
};

const setLastUpdateId = async (lastUpdateId: string): Promise<void> => {
  await fs.writeFile(CACHE_FILE_PATH, lastUpdateId);
};

async function main() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN env is not set');
  }

  if (!process.env.TELEGRAM_CHAT_ID) {
    throw new Error('TELEGRAM_CHAT_ID env is not set');
  }

  const lastUpdateId = await getLastUpdateId();
  // await getNewPinnedMessages(process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_ID, 908776462);
  // await unpinMessage(process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_ID, 107);

  await setLastUpdateId('1');
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
