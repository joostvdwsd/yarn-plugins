import { loadPreset } from "./loader";
import { writeFileSync } from 'fs';

async function main() {
  const config = await loadPreset('codemirror');
  writeFileSync('result.json', JSON.stringify(config, null, 2), 'utf-8');
}

main()