import packageJSON from "../../package.json";

export const PROJECT_NAME = "stratos";
export const REPO_PATH = "stratosnet/token-lists";
export const VERSION_DESTRUCTED = packageJSON.version.split(".");
export const RELEASE_VERSION = `v${packageJSON.version}`;
export const TOKEN_LIST_NAME = packageJSON.description;
