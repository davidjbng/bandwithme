import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export function checkRelease({ version, appVersion, tag, changelog, pending, ascAppId }) {
  assert.match(version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, "Use a numeric app version");
  assert.equal(appVersion, version, "Run pnpm version-packages to synchronize app.json");
  if (tag === undefined) return;
  assert.equal(tag, `v${version}`, "Release tag must match the app version");
  assert.equal(pending.length, 0, "Consume pending changesets before releasing");
  assert.ok(
    changelog.split(/\r?\n/).includes(`## ${version}`),
    "Missing generated changelog entry",
  );
  assert.match(ascAppId ?? "", /^\d+$/, "Configure submit.production.ios.ascAppId in eas.json");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, tag] = process.argv.slice(2);
  assert.ok(
    mode === undefined || mode === "--sync" || mode === "--release",
    "Unknown release command",
  );
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  const app = JSON.parse(await readFile("app.json", "utf8"));
  if (mode === "--sync") {
    checkRelease({ version: pkg.version, appVersion: pkg.version });
    app.expo.version = pkg.version;
    await writeFile("app.json", `${JSON.stringify(app, null, 2)}\n`);
  } else if (mode === "--release") {
    assert.ok(tag, "Provide the release tag");
    const eas = JSON.parse(await readFile("eas.json", "utf8"));
    checkRelease({
      version: pkg.version,
      appVersion: app.expo.version,
      tag,
      changelog: await readFile("CHANGELOG.md", "utf8"),
      pending: (await readdir(".changeset")).filter(
        (name) => name.endsWith(".md") && name !== "README.md",
      ),
      ascAppId: eas.submit?.production?.ios?.ascAppId,
    });
  } else {
    checkRelease({ version: pkg.version, appVersion: app.expo.version });
  }
}
