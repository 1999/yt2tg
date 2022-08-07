import { Octokit } from '@octokit/core';

// @see https://docs.github.com/en/rest/actions/artifacts#list-artifacts-for-a-repository
type Artifact = {
  id: number;
  archive_download_url: string;
  created_at: string;
};

export const getMostRecentArtifact = async (
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
