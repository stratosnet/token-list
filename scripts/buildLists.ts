import fs from "fs/promises";
import * as process from "process";
import { rawTokens } from "./utils/rawTokens";
import { TokenInfo, TokenList } from "@uniswap/token-lists";

import { requireOrNull } from "./utils/requireOrNull";
import {
  PROJECT_NAME,
  REPO_PATH,
  TOKEN_LIST_NAME,
  VERSION_DESTRUCTED,
  RELEASE_VERSION,
} from "./utils/constants";

const LOGO_URI_BASE = `https://raw.githubusercontent.com/${REPO_PATH}/${RELEASE_VERSION}`;

const makeTokenList = (
  previousTokenList: TokenList | null,
  tokens: TokenInfo[]
): TokenList => {
  let timestamp: string = new Date().toISOString();
  if (process.env.CI) {
    if (!previousTokenList) {
      throw new Error("Token list not found");
    }
    // if in CI, use the timestamp generated from the previous process
    timestamp = previousTokenList.timestamp;
  }
  return {
    name: previousTokenList?.name ?? TOKEN_LIST_NAME ?? "Unknown List",
    logoURI: `${LOGO_URI_BASE}/logo.svg`,
    keywords: ["stos", "defi", "bridge"],
    timestamp,
    tokens,
    version: {
      major: parseInt(VERSION_DESTRUCTED[0]),
      minor: parseInt(VERSION_DESTRUCTED[1]),
      patch: parseInt(VERSION_DESTRUCTED[2]),
    },
  };
};

const main = async () => {
  const allTokens = await Promise.all(
    rawTokens.map(async ({ logoURI: elLogoURI, logoFile, ...el }) => {
      const symbol = el.symbol;
      const logoURI =
        elLogoURI ||
        (logoFile ? `${LOGO_URI_BASE}/assets/${logoFile}` : null) ||
        `${LOGO_URI_BASE}/assets/asset_${symbol}.svg`;

      // Validate
      if (logoURI.startsWith(LOGO_URI_BASE)) {
        const logoPath = `${__dirname}/..${logoURI.substring(
          LOGO_URI_BASE.length
        )}`;
        const stat = await fs.stat(logoPath);
        if (!stat.isFile()) {
          throw new Error(
            `logo for ${el.address} on ${el.chainId} does not exist`
          );
        }
      }
      return {
        ...el,
        decimals: el.decimals || 18,
        logoURI,
        isExperimental: el.isExperimental,
      };
    })
  );

  const [mainTokenListTokens, experimentalTokenListTokens] = allTokens.reduce(
    ([mainTokens, experimentalTokens], { isExperimental, ...tok }) => {
      if (isExperimental !== true) {
        return [
          [...mainTokens, tok],
          [...experimentalTokens, tok],
        ];
      } else {
        return [mainTokens, [...experimentalTokens, tok]];
      }
    },
    [[] as TokenInfo[], [] as TokenInfo[]]
  );

  const previousTokenList = requireOrNull(
    __dirname,
    `../${PROJECT_NAME}.token-list.json`
  );
  const previousExperimentalTokenList = requireOrNull(
    __dirname,
    `../${PROJECT_NAME}-experimental.token-list.json`
  );

  const tokenList = makeTokenList(previousTokenList, mainTokenListTokens);
  const experimentalTokenList = makeTokenList(
    previousExperimentalTokenList,
    experimentalTokenListTokens
  );

  await fs.writeFile(
    __dirname + `/../${PROJECT_NAME}.token-list.json`,
    JSON.stringify(tokenList, null, 4)
  );

  await fs.writeFile(
    __dirname + `/../${PROJECT_NAME}-experimental.token-list.json`,
    JSON.stringify(experimentalTokenList, null, 4)
  );
};

main().catch((err) => {
  console.error("Error", err);
  process.exit(1);
});
