import fs from 'node:fs';
import path from 'node:path';

const missing = [
  'components/ui/card',
  'components/ui/table',
  'components/ui/pagination',
  'components/ui/info-tooltip',
  'components/assets/AssetCard',
  'components/assets/AssetFilters',
  'components/theme-provider',
  'components/layout/Header',
  'components/analytics/CookieConsentBanner',
  'contexts/AnalyticsContext',
];

for (const mod of missing) {
  const file = path.join('src', ...mod.split('/')) + '.tsx';
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      `// stub for ${mod}\nexport default function Stub() { return null; }\n`
    );
    console.log('stubbed', file);
  }
}
