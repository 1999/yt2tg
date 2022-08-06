/**
 * @see https://core.telegram.org/bots/api#available-methods
 */
const sendHttpRequest = async <TResponse>(
  token: string,
  method: 'sendMessage' | 'getUpdates' | 'unpinChatMessage',
  body: unknown
) => {
  const { default: fetch } = await import('node-fetch');
  const urlPath = `/bot${token}/${method}`;
  const urlObj = new URL(urlPath, 'https://api.telegram.org');

  const resp = await fetch(urlObj.toString(), {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    method: 'POST',
  });

  return {
    response: (await resp.json()) as TResponse,
    status: resp.status,
  };
};

export const sendMesage = async (chatId: string, text: string, token: string): Promise<void> => {
  const { response, status } = await sendHttpRequest<{ ok: boolean }>(token, 'sendMessage', {
    chat_id: chatId,
    text,
    disable_notification: true,
  });

  if (!response.ok) {
    throw new Error(`Failed to send message to Telegram (${status})`);
  }
};

/**
 * @see https://core.telegram.org/bots/api#getupdates
 */
export const getNewPinnedMessages = async (token: string, chatId: string, offset?: number): Promise<void> => {
  const { response, status } = await sendHttpRequest<unknown>(token, 'getUpdates', {
    allowed_updates: ['channel_post'],
    ...(offset ? { offset } : {}),
  });

  console.log(JSON.stringify(response, null, 2));
};

export const unpinMessage = async (token: string, chatId: string, id: number): Promise<void> => {
  const { response, status } = await sendHttpRequest<{ ok: boolean }>(token, 'unpinChatMessage', {
    chat_id: chatId,
    message_id: id,
  });

  if (!response.ok) {
    throw new Error('Failed to unpin message');
  }
};
