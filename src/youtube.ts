import { google, youtube_v3 } from 'googleapis';
import { Credentials } from 'google-auth-library';

type Video = {
  id: string;
  title: string;
};

type Channel = {
  id: string;
  title: string;
};

type PagedSubscriptions = {
  channels: Channel[];
  nextPageToken?: string;
};

type ChannelVideos = {
  channel: Channel;
  videos: Video[];
};

type PagedVideos = {
  videos: Video[];
  nextPageToken?: string;
};

const MAX_ACTIVITIES_VIDEOS = 10;

const getYoutubeClient = (
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  credentials: Credentials
): youtube_v3.Youtube => {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials(credentials);

  return google.youtube({ version: 'v3', auth: oauth2Client });
};

const getSubscriptionChannelsPaged = async (
  youtube: youtube_v3.Youtube,
  pageToken?: string
): Promise<PagedSubscriptions> => {
  const subscriptions = await youtube.subscriptions.list(
    {
      part: ['snippet'],
      mine: true,
      maxResults: 50,
      ...(pageToken ? { pageToken } : {}),
    },
    { responseType: 'json' }
  );

  const channels = new Array<Channel>();
  for (const item of subscriptions.data.items || []) {
    if (item.snippet?.resourceId?.channelId) {
      channels.push({
        id: item.snippet.resourceId.channelId,
        title: item.snippet.channelTitle || 'Untitled',
      });
    }
  }

  return {
    channels,
    nextPageToken: subscriptions.data.nextPageToken || undefined,
  };
};

const getUploadedVideosForChannelPaged = async (
  youtube: youtube_v3.Youtube,
  channelId: string,
  publishedAfter: Date | undefined,
  pageToken?: string
): Promise<PagedVideos> => {
  const activities = await youtube.activities.list(
    {
      part: ['id', 'snippet', 'contentDetails'],
      channelId,
      maxResults: 10,
      ...(publishedAfter ? { publishedAfter: publishedAfter.toISOString() } : {}),
      ...(pageToken ? { pageToken } : {}),
    },
    { responseType: 'json' }
  );

  const videos = new Array<Video>();
  for (const item of activities.data.items || []) {
    if (item.snippet?.type === 'upload' && item.contentDetails?.upload?.videoId) {
      videos.push({
        id: item.contentDetails.upload.videoId,
        title: item.snippet.title || 'Untitled',
      });
    }
  }

  return {
    videos,
    nextPageToken: activities.data.nextPageToken || undefined,
  };
};

const getChannelUploadPlaylists = async (
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  credentials: Credentials,
  channelId: string
): Promise<string[]> => {
  const youtube = getYoutubeClient(clientId, clientSecret, redirectUri, credentials);
  const channelsList = await youtube.channels.list(
    { id: [channelId], part: ['snippet', 'contentDetails', 'statistics'] },
    { responseType: 'json' }
  );

  const output = new Array<string>();
  for (const item of channelsList.data.items || []) {
    if (item.contentDetails?.relatedPlaylists?.uploads) {
      output.push(item.contentDetails.relatedPlaylists.uploads);
    }
  }

  return output;
};

const getUploadedVideosForChannel = async (
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  credentials: Credentials,
  channelId: string,
  publishedAfter?: Date
): Promise<Video[]> => {
  const youtube = getYoutubeClient(clientId, clientSecret, redirectUri, credentials);
  const allVideos = new Array<Video>();
  let pageToken: string | undefined = undefined;

  do {
    const { videos, nextPageToken } = (await getUploadedVideosForChannelPaged(
      youtube,
      channelId,
      publishedAfter,
      pageToken
    )) as PagedVideos;
    allVideos.push(...videos);

    pageToken = nextPageToken;
  } while (pageToken !== undefined && allVideos.length < MAX_ACTIVITIES_VIDEOS);

  return allVideos;
};

const getSubscriptionChannels = async (
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  credentials: Credentials
): Promise<Channel[]> => {
  const youtube = getYoutubeClient(clientId, clientSecret, redirectUri, credentials);
  const allChannels = new Array<Channel>();
  let pageToken: string | undefined = undefined;

  do {
    const { channels, nextPageToken } = (await getSubscriptionChannelsPaged(youtube, pageToken)) as PagedSubscriptions;
    allChannels.push(...channels);

    pageToken = nextPageToken;
  } while (pageToken !== undefined);

  return allChannels;
};

export const getNewVideos = async (
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  credentials: Credentials,
  publishedAfter?: Date
): Promise<ChannelVideos[]> => {
  const channels = await getSubscriptionChannels(clientId, clientSecret, redirectUri, credentials);
  const ops = channels.map(async (channel) => {
    const videos = await getUploadedVideosForChannel(
      clientId,
      clientSecret,
      redirectUri,
      credentials,
      channel.id,
      publishedAfter
    );
    return { channel, videos };
  });

  const videos = await Promise.all(ops);
  return videos;
};

export const getVideoUrl = (id: string): string => {
  const urlObj = new URL('/watch', 'https://www.youtube.com');
  urlObj.searchParams.set('v', id);

  return urlObj.toString();
};
