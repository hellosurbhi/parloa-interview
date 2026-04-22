function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getGitHubCredentials() {
  return {
    clientId: required("GITHUB_ID"),
    clientSecret: required("GITHUB_SECRET"),
  };
}
