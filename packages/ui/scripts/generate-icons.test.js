const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const scriptPath = path.join(__dirname, 'generate-icons.js');
const scriptSource = fs.readFileSync(scriptPath, 'utf8');
const assetsDir = path.join(__dirname, '../assets');
const outputDir = path.join(__dirname, '../src/icons');

const runGenerateIcons = ({ files, assetNames }) => {
  const readFiles = [];
  const writtenFiles = [];
  const mutableFiles = { ...files };

  const fakeFs = {
    existsSync(filePath) {
      return filePath === outputDir || Object.hasOwn(mutableFiles, filePath);
    },
    mkdirSync() {},
    readdirSync(filePath) {
      assert.equal(filePath, assetsDir);
      return assetNames;
    },
    readFileSync(filePath, encoding) {
      assert.equal(encoding, 'utf8');
      readFiles.push(filePath);
      return mutableFiles[filePath];
    },
    writeFileSync(filePath, content) {
      writtenFiles.push({ filePath, content });
      mutableFiles[filePath] = content;
    },
  };

  vm.runInNewContext(scriptSource, {
    __dirname,
    console: {
      log() {},
      warn() {},
    },
    require(moduleName) {
      if (moduleName === 'fs') return fakeFs;
      if (moduleName === 'path') return path;
      throw new Error(`Unexpected module: ${moduleName}`);
    },
  });

  return { readFiles, writtenFiles };
};

test('rewrites an existing icon component when generated SVG output changes', () => {
  const assetPath = path.join(assetsDir, 'ic-sample.svg');
  const componentPath = path.join(outputDir, 'IcSample.tsx');
  const { writtenFiles } = runGenerateIcons({
    assetNames: ['ic-sample.svg'],
    files: {
      [assetPath]:
        '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#000" d="M1 1h2v2H1z"/></svg>',
      [componentPath]: 'stale component content',
    },
  });

  const componentWrite = writtenFiles.find(
    (writtenFile) => writtenFile.filePath === componentPath,
  );

  assert.ok(
    componentWrite,
    'expected existing component to be rewritten when generated content differs',
  );
  assert.match(componentWrite.content, /fill="currentColor"/);
  assert.match(componentWrite.content, /M1 1h2v2H1z/);
});

test('keeps an existing icon component untouched when generated output is unchanged', () => {
  const assetPath = path.join(assetsDir, 'ic-sample.svg');
  const componentPath = path.join(outputDir, 'IcSample.tsx');
  const svgContent =
    '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#000" d="M1 1h2v2H1z"/></svg>';

  const firstRun = runGenerateIcons({
    assetNames: ['ic-sample.svg'],
    files: {
      [assetPath]: svgContent,
    },
  });
  const generatedComponent = firstRun.writtenFiles.find(
    (writtenFile) => writtenFile.filePath === componentPath,
  ).content;

  const secondRun = runGenerateIcons({
    assetNames: ['ic-sample.svg'],
    files: {
      [assetPath]: svgContent,
      [componentPath]: generatedComponent,
    },
  });

  assert.ok(
    secondRun.readFiles.includes(componentPath),
    'expected existing component to be read for content comparison',
  );
  assert.equal(
    secondRun.writtenFiles.some(
      (writtenFile) => writtenFile.filePath === componentPath,
    ),
    false,
  );
});
