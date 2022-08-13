import { promises as fs } from 'fs';
import { resolve } from 'path';
import { Octokit } from '@octokit/core';
import extractZip from 'extract-zip';

// @see https://docs.github.com/en/rest/actions/artifacts#list-artifacts-for-a-repository
type Artifact = {
  id: number;
  name: string;
  archive_download_url: string;
  created_at: string;
};

const readZipArchive = async (archive: ArrayBuffer, artifactName: string): Promise<string> => {
  const { temporaryDirectory, temporaryFile } = await import('tempy');
  const tmpArchiveFilePath = temporaryFile();
  const tmpExtractDir = temporaryDirectory();
  const view = new DataView(archive);

  await fs.writeFile(tmpArchiveFilePath, view);
  await extractZip(tmpArchiveFilePath, { dir: tmpExtractDir });

  const extractedArtifactPath = resolve(tmpExtractDir, artifactName);
  return (await fs.readFile(extractedArtifactPath, { encoding: 'utf-8' })).trim();
};

const getMostRecentArtifact = async (
  repoOwner: string,
  repoName: string,
  authToken: string,
  artifactName: string
): Promise<Artifact | undefined> => {
  const octokit = new Octokit({
    auth: authToken,
  });

  const response = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts', {
    owner: repoOwner,
    repo: repoName,
  });

  if (response.status !== 200) {
    throw new Error(`Could not fetch the list of artifacts (${response.status})`);
  }

  let filteredArtifact: Artifact | undefined = undefined;
  for (const artifact of response.data.artifacts) {
    if (artifact.name !== artifactName || !artifact.created_at) {
      continue;
    }

    if (!filteredArtifact || new Date(artifact.created_at) > new Date(filteredArtifact.created_at)) {
      filteredArtifact = {
        ...artifact,
        // avoid TS compilation error :(
        created_at: artifact.created_at,
      };
    }
  }

  return filteredArtifact;
};

const readArtifact = async (
  repoOwner: string,
  repoName: string,
  authToken: string,
  artifact: Artifact
): Promise<string> => {
  const octokit = new Octokit({
    auth: authToken,
  });

  const response = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts/{id}/zip', {
    owner: repoOwner,
    repo: repoName,
    id: artifact.id,
  });

  if (response.status !== 200) {
    throw new Error(`Could not download the artifact (${response.status})`);
  }

  if (response.headers['content-type'] !== 'application/zip') {
    throw new Error(`Downloaded artifact content type is wrong (${response.headers['content-type']})`);
  }

  return await readZipArchive(response.data, artifact.name);
};

export const readLatestArtifact = async (
  repoOwner: string,
  repoName: string,
  authToken: string,
  artifactName: string
): Promise<string | undefined> => {
  const artifact = await getMostRecentArtifact(repoOwner, repoName, authToken, artifactName);
  if (!artifact) {
    return;
  }

  return await readArtifact(repoOwner, repoName, authToken, artifact);
};
