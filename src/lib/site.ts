// Facts about the release. Everything here is taken from the GitHub release
// page for v1.0.0 so the site and the download never disagree.
export const REPO_URL = 'https://github.com/prabhu-omkar/Zypher'
export const RELEASE_URL = `${REPO_URL}/releases/tag/v1.0.0`
export const DOWNLOAD_URL = `${REPO_URL}/releases/download/v1.0.0/Zypher_Setup.exe`
export const ISSUES_URL = `${REPO_URL}/issues`
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`

export const RELEASE = {
  version: 'v1.0.0',
  file: 'Zypher_Setup.exe',
  size: '122.1 MB',
  sha256: 'A7339E8FE99BF4FF98F81FA01D60247165C2A619AAB91B2F69E759FEAE47E6F5',
  installPath: String.raw`%LOCALAPPDATA%\Programs\Zypher`,
}

export const VERIFY_COMMAND = String.raw`Get-FileHash .\Zypher_Setup.exe -Algorithm SHA256`
