import { expect, test } from 'vitest';
import { extract_fragment } from 'albio/compiler';

test('should exclude head from tags', () => {
  const { tags } = extract_fragment(
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

