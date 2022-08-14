type Update = {
  id: number;
  message: {
    id: number;
    text: string;
  };
};

type UpdatesResponse = {
  ok: boolean;
  result: {
    update_id: number;
    channel_post?: {
      message_id: number;
      pinned_message?: {
        message_id: number;
        text: string;
      };
    };
  }[];
};

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
    throw new Error(`Failed to send message (${status})`);
  }
};

/**
 * @see https://core.telegram.org/bots/api#getupdates
 */
export const getNewPinnedMessages = async (token: string, chatId: string, offset?: string): Promise<Update[]> => {
  const { response, status } = await sendHttpRequest<UpdatesResponse>(token, 'getUpdates', {
    allowed_updates: ['channel_post'],
    ...(offset ? { offset } : {}),
  });

  if (!response.ok) {
    throw new Error(`Could not get updates (${status})`);
  }

  const output = new Array<Update>();
  for (const item of response.result) {
    if (item.channel_post?.pinned_message) {
      output.push({
        id: item.update_id,
        message: {
          id: item.channel_post.message_id,
          text: item.channel_post.pinned_message.text,
        },
      });
    }
  }

  return output;
};

export const unpinMessage = async (token: string, chatId: string, id: number): Promise<void> => {
  const { response, status } = await sendHttpRequest<{ ok: boolean }>(token, 'unpinChatMessage', {
    chat_id: chatId,
    message_id: id,
  });

  if (!response.ok) {
    throw new Error(`Failed to unpin message (${status})`);
  }
};
