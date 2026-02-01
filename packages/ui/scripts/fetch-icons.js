const fs = require('fs');
const path = require('path');

// Check Node.js version assurance (optional but good)
if (!globalThis.fetch) {
  console.error(
    '\x1b[31mError: Native fetch is not available. Please use Node.js 18+.\x1b[0m',
  );
  process.exit(1);
}

// zero-dependency .env loader
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
}

// Configuration from Environment Variables
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY;
const NODE_ID = process.env.FIGMA_NODE_ID;

const ASSETS_DIR = path.join(__dirname, '../assets');

if (!FIGMA_TOKEN || !FILE_KEY || !NODE_ID) {
  console.error('Error: Missing Environment Variables.');
  console.error(
    'Please set FIGMA_ACCESS_TOKEN, FIGMA_FILE_KEY, and FIGMA_NODE_ID.',
  );
  process.exit(1);
}

// Helper for Fetch
const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
  });

  if (!response.ok) {
    throw new Error(
      `Status Code: ${response.status}, Status: ${response.statusText}`,
    );
  }
  return response.json();
};

const fetchFile = async (url, dest) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(arrayBuffer));
};

const main = async () => {
  try {
    // 1. Get Node Children (Icons)
    console.log('Fetching icon list from Figma...');
    const nodeUrl = `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${NODE_ID}`;
    const nodeData = await fetchJson(nodeUrl);

    // The node might be a Frame/ComponentSet containing children
    const rootNode = nodeData.nodes[NODE_ID.replace('-', ':')].document;

    if (!rootNode.children) {
      throw new Error(`No children found in node ${NODE_ID}`);
    }

    const icons = rootNode.children
      .filter(
        (child) =>
          child.type === 'COMPONENT' ||
          child.type === 'INSTANCE' ||
          child.type === 'FRAME' ||
          child.type === 'VECTOR',
      )
      .map((child) => ({
        id: child.id,
        name: child.name.trim(),
      }));

    if (icons.length === 0) {
      console.log('No icons found.');
      return;
    }

    console.log(`Found ${icons.length} icons.`);

    // 2. Get Image URLs
    const ids = icons.map((i) => i.id).join(',');
    const imageUrlsUrl = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${ids}&format=svg`;
    const imageData = await fetchJson(imageUrlsUrl);
    const images = imageData.images;

    // 3. Download SVGs
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    let downloadCount = 0;
    for (const icon of icons) {
      const imageUrl = images[icon.id];
      if (imageUrl) {
        // Sanitize name: "Home Icon" -> "home-icon" -> "ic-home-icon.svg"
        let safeName = icon.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        if (!safeName.startsWith('ic-')) {
          safeName = `ic-${safeName}`;
        }

        const fileName = `${safeName}.svg`;
        const filePath = path.join(ASSETS_DIR, fileName);

        await fetchFile(imageUrl, filePath);
        console.log(`Downloaded: ${fileName}`);
        downloadCount++;
      }
    }

    console.log(
      `\nSuccessfully downloaded ${downloadCount} icons to ${ASSETS_DIR}`,
    );
    console.log('Run "npm run icons:gen" to generate React components.');
  } catch (err) {
    console.error('Failed to fetch icons:', err);
    process.exit(1);
  }
};

main();
