import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vite-plus/test";
import { checkRelease } from "./release-metadata.mjs";

const release = {
  version: "1.2.3",
  appVersion: "1.2.3",
  tag: "v1.2.3",
  changelog: "# bandwithme\n\n## 1.2.3\n\nA useful feature.\n",
  pending: [],
  ascAppId: "1234567890",
};

test("accepts matching generated release metadata and ordinary development versions", () => {
  checkRelease(release);
  checkRelease({ version: "1.2.3", appVersion: "1.2.3" });
});

test("version command preserves unrelated Expo configuration", async () => {
  const directory = await mkdtemp(join(tmpdir(), "bandwithme-release-"));
  try {
    await writeFile(join(directory, "package.json"), JSON.stringify({ version: "2.3.4" }));
    await writeFile(
      join(directory, "app.json"),
      JSON.stringify({ expo: { version: "1.0.0", plugins: ["expo-router"] } }),
    );
    execFileSync(
      process.execPath,
      [fileURLToPath(new URL("./release-metadata.mjs", import.meta.url)), "--sync"],
      {
        cwd: directory,
      },
    );
    assert.deepEqual(JSON.parse(await readFile(join(directory, "app.json"), "utf8")), {
      expo: { version: "2.3.4", plugins: ["expo-router"] },
    });
  } finally {
    await rm(directory, { recursive: true });
  }
});

for (const [name, patch] of Object.entries({
  "mismatched Expo version": { appVersion: "1.2.2" },
  "wrong release tag": { tag: "v1.2.2" },
  "pending feature changesets": { pending: ["feature.md"] },
  "missing changelog section": { changelog: "## 1.2.30\n" },
  "missing Apple app": { ascAppId: undefined },
  "placeholder Apple app": { ascAppId: "your-app-id" },
  "unsupported native version": { version: "1.2.3-beta.1", appVersion: "1.2.3-beta.1" },
})) {
  test(`rejects ${name}`, () => assert.throws(() => checkRelease({ ...release, ...patch })));
}
