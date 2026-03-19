import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { printSchema } from "graphql";
import { schema } from "../../server/src/schema/schema";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(currentDir, "../schema.graphql");

async function main() {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${printSchema(schema)}\n`, "utf8");

  console.log(`Relay schema gerado em: ${outputPath}`);
}

main().catch((error) => {
  console.error("Falha ao gerar schema Relay:", error);
  process.exit(1);
});
