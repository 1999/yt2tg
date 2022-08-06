import { getNewPinnedMessages } from '../telegram';
import { restoreCache } from '@actions/cache';
import { info, warning } from '@actions/core';
import { promises as fs } from 'fs';

const CACHE_KEY = 'telegram_last_update_id';
const CACHE_FILE_PATH = 'telegram_last_update_id';

const getLastUpdateId = async (): Promise<string | void> => {
  const cacheKey = await restoreCache([CACHE_FILE_PATH], CACHE_KEY);

  if (!cacheKey) {
    warning('Could not find an artifact for last update ID');
    return;
  }

  info('Found artifact for last update ID');
  return fs.readFile(CACHE_FILE_PATH, { encoding: 'utf-8' });
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
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
