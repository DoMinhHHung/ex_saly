'use strict';
require('tsx/cjs');

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { timAnhTrongPhanHoi } = require('../lib/studio/sinh-anh.ts');

test('timAnhTrongPhanHoi only reads image blocks from model_output', () => {
  const ketQua = timAnhTrongPhanHoi({
    steps: [
      { type: 'user_input', content: [{ type: 'image', data: 'INPUT', mime_type: 'image/png' }] },
      {
        type: 'model_output',
        content: [
          { type: 'text', text: 'done' },
          { type: 'image', data: 'OUTPUT', mime_type: 'image/jpeg' },
        ],
      },
    ],
  });

  assert.deepEqual(ketQua, { data: 'OUTPUT', mimeType: 'image/jpeg' });
});

test('timAnhTrongPhanHoi rejects missing or unsupported image blocks', () => {
  assert.equal(timAnhTrongPhanHoi({ steps: [{ type: 'model_output', content: [{ type: 'text', text: 'x' }] }] }), null);
  assert.equal(timAnhTrongPhanHoi({ steps: [{ type: 'model_output', content: [{ type: 'image', data: 'X', mime_type: 'image/tiff' }] }] }), null);
});
