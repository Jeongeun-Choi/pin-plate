const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets');
const OUTPUT_DIR = path.join(__dirname, '../src/icons');

// Helper to convert kebab-case to PascalCase
const toPascalCase = (str) => {
  return str.replace(/(^\w|-\w)/g, (match) =>
    match.replace('-', '').toUpperCase(),
  );
};

// Helper to convert kebab-case attributes to camelCase (for React)
const toCamelCaseAttr = (str) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

const writeFileIfChanged = ({
  filePath,
  content,
  createdMessage,
  updatedMessage,
  unchangedMessage,
}) => {
  const hasExistingFile = fs.existsSync(filePath);

  if (hasExistingFile) {
    const existingContent = fs.readFileSync(filePath, 'utf8');

    if (existingContent === content) {
      console.log(unchangedMessage);
      return;
    }
  }

  fs.writeFileSync(filePath, content);
  console.log(hasExistingFile ? updatedMessage : createdMessage);
};

// Main process
const generateIcons = () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(ASSETS_DIR)
    .filter((file) => file.endsWith('.svg'));
  const exportStatements = [];

  files.forEach((file) => {
    const fileName = path.basename(file, '.svg');
    // Ensure "Ic" prefix
    const componentName = fileName.toLowerCase().startsWith('ic')
      ? toPascalCase(fileName)
      : `Ic${toPascalCase(fileName)}`;

    const componentFilePath = path.join(OUTPUT_DIR, `${componentName}.tsx`);
    const filePath = path.join(ASSETS_DIR, file);
    let svgContent = fs.readFileSync(filePath, 'utf8');

    // 1. Sanitize: Remove XML declaration and comments
    svgContent = svgContent.replace(/<\?xml.*?\?>/g, '');
    svgContent = svgContent.replace(/<!--.*?-->/g, '');

    // 2. Extract SVG tag content and attributes
    const svgTagMatch = svgContent.match(/<svg([^>]*)>([\s\S]*?)<\/svg>/);
    if (!svgTagMatch) {
      console.warn(`Skipping invalid SVG: ${file}`);
      return;
    }

    let [_, attributes, innerContent] = svgTagMatch;

    // 3. Replace fill/stroke colors with currentColor
    // Regex matches fill="..." or stroke="..." where value is NOT "none"
    innerContent = innerContent.replace(
      /(fill|stroke)="([^"]+)"/g,
      (match, attr, value) => {
        if (value === 'none') return match;
        return `${attr}="currentColor"`;
      },
    );

    // Also handle attributes in the svg tag itself if necessary, but usually we pass props there.
    // For safety, let's just make the svg tag flexible via props.

    // 4. Convert attributes to camelCase (e.g. stroke-width -> strokeWidth)
    // This is a naive regex but works for standard SVG props
    innerContent = innerContent.replace(/([a-z]+-[a-z]+)=/g, (match) =>
      toCamelCaseAttr(match),
    );
    attributes = attributes.replace(/([a-z]+-[a-z]+)=/g, (match) =>
      toCamelCaseAttr(match),
    );

    // 5. Construct React Component
    const componentContent = `import { SVGProps } from 'react';

export const ${componentName} = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg 
      ${attributes.trim()} 
      {...props}
    >
      ${innerContent.trim()}
    </svg>
  );
};
`;

    writeFileIfChanged({
      filePath: componentFilePath,
      content: componentContent,
      createdMessage: `Generated: ${componentName}`,
      updatedMessage: `Updated: ${componentName}`,
      unchangedMessage: `Unchanged: ${componentName}`,
    });
    exportStatements.push(`export * from './${componentName}';`);
  });

  // Generate index.ts
  writeFileIfChanged({
    filePath: path.join(OUTPUT_DIR, 'index.ts'),
    content: exportStatements.join('\n') + '\n',
    createdMessage: 'Generated: index.ts',
    updatedMessage: 'Updated: index.ts',
    unchangedMessage: 'Unchanged: index.ts',
  });
  console.log('Icon generation complete!');
};

generateIcons();
