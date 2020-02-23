const {
  promisify
} = require('util');
const exec = promisify(require('child_process').exec);
const assert = require('assert').strict;
const fs = require('fs').promises;
const tmpdir = require('os').tmpdir();
const {
  join
} = require('path');
const randomBytes = promisify(require('crypto').randomBytes)
const rimraf = promisify(require('rimraf'))
const compare = require('../index.js')
const comparePath = require.resolve('../index.js')

let tmpdirCompare;
// A == B, C == D
let files = ['fileA', 'fileB', 'fileC', 'fileD']

describe('main test suite', () => {
  before(async () => {
    // create temporary files
    tmpdirCompare = await fs.mkdtemp(join(tmpdir, 'testing-compare'));
    const bytes = await Promise.all(
      Array(Math.floor(files.length / 2))
      .fill(null)
      .map(el => randomBytes(1024))
    )
    files = files.map(name => join(tmpdirCompare, name))
    await Promise.all(
      files.map((path, i) =>
        fs.writeFile(path, bytes[Math.floor(i / 2)]))
    )
  })
  after(async () => {
    // cleanup temp files
    await rimraf(tmpdirCompare);
  })
  describe('testing as a required module', () => {

    for (let i = 0; i < files.length; i += 2) {
      it(`${files[i]} should be equal to ${files[i + 1]}`, async () => {
        const file1 = files[i]
        const file2 = files[i + 1]
        assert.strictEqual(await compare(file1, file2), true);
      })
    }
    for (let i = 0; i < Math.floor(files.length / 2); i++) {
      it(`${files[i]} shouldn't be equal to ${files[i + 2]}`, async () => {
        const file1 = files[i]
        const file2 = files[i + 2]
        assert.strictEqual(await compare(file1, file2), false);
      })
    }
  })
  describe('testing as a child process', () => {
    for (let i = 0; i < files.length; i += 2) {
      it(`${files[i]} should be equal to ${files[i + 1]}`, async () => {
        const file1 = files[i]
        const file2 = files[i + 1]
        const {
          stdout
        } = await exec(`node ${comparePath} ${file1} ${file2}`)
        assert.strictEqual(stdout, 'true\n');
      })
    }
    for (let i = 0; i < Math.floor(files.length / 2); i++) {
      it(`${files[i]} shouldn't be equal to ${files[i + 2]}`, async () => {
        const file1 = files[i]
        const file2 = files[i + 2]
        const {
          stdout
        } = await exec(`node ${comparePath} ${file1} ${file2}`)
        assert.strictEqual(stdout, 'false\n');
      })
    }
  })
})