import { expect, test } from 'vitest';
import { extractFragment } from 'albio/compiler';

test('should exclude head from tags', () => {
  const { tags } = extractFragment(
    `<!DOCTYPE html>
    <html>
        <head>
            <title>foo</title>
        </head>
        <body>
        </body>
    </html>`,
  );

  expect(tags);
});

