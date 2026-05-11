export { PlaywrightParser, playwrightParser } from './playwright.parser';
export { SeleniumParser, seleniumParser } from './selenium.parser';
export { GenericParser, genericParser } from './generic.parser';

import { playwrightParser, seleniumParser, genericParser } from './index';
import type { ParsedFailure, Framework } from '../types';

export type Parser = {
  parse(content: string): ParsedFailure;
  parseJSON?(content: string): ParsedFailure | null;
};

export function getParser(framework: Framework): Parser {
  switch (framework) {
    case 'playwright':
      return playwrightParser;
    case 'selenium':
      return seleniumParser;
    default:
      return genericParser;
  }
}

export function parseContent(content: string, framework: Framework): ParsedFailure {
  const parser = getParser(framework);

  // Try JSON first if it looks like JSON
  if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
    const jsonResult = parser.parseJSON?.(content);
    if (jsonResult) return jsonResult;
  }

  return parser.parse(content);
}