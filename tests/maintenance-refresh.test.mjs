import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { listSkillRecords, validatePlugin } from "../scripts/validate-plugin.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const formalName = "create-formal-verification-skill";

test("formal verification is registered with bounded proof and draft outcomes", async () => {
  const skill = (await listSkillRecords(root)).find((record) => record.name === formalName);
  assert.ok(skill);
  assert.deepEqual(Object.keys(skill.frontmatter).sort(), ["description", "name"]);
  assert.equal(skill.metadata.policy.allow_implicit_invocation, false);
  assert.deepEqual(skill.metadata.policy.products, ["CODEX"]);
  assert.match(skill.body, /codex-agent-runtime\.md/);
  assert.match(skill.body, /required verifier cannot run.*marked draft/);
  assert.match(skill.body, /bounds and assumptions/);
  assert.match(skill.body, /do not change product code unless the user asks/);
  assert.match(skill.body, /isolated copy or worktree of the real code/);
  assert.match(skill.body, /It must catch the break/);
  assert.match(skill.body, /confirm that the check is back where it started/);
  assert.match(skill.body, /agents\/openai\.yaml.*allow_implicit_invocation: false/);
});

test("validator rejects implicit invocation and non-Codex policy for the new skill", async (context) => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "pstack-explicit-policy-"));
  context.after(() => fs.rm(temporary, { recursive: true, force: true }));
  await fs.cp(root, temporary, {
    recursive: true,
    filter: (source) => !source.split(path.sep).some((part) => part === ".git" || part === "node_modules"),
  });
  assert.deepEqual((await validatePlugin(temporary, { probeBun: false })).errors, []);
  const metadata = path.join(temporary, "skills", formalName, "agents/openai.yaml");
  const original = await fs.readFile(metadata, "utf8");
  await fs.writeFile(metadata, original.replace("allow_implicit_invocation: false", "allow_implicit_invocation: true"));
  assert.ok((await validatePlugin(temporary, { probeBun: false })).errors.includes(`${formalName}: implicit invocation must remain disabled`));
  await fs.writeFile(metadata, original.replace("- CODEX", "- OTHER"));
  assert.ok((await validatePlugin(temporary, { probeBun: false })).errors.includes(`${formalName}: policy.products must be CODEX-only`));
  await fs.writeFile(metadata, original);
  const skillPath = path.join(temporary, "skills", formalName, "SKILL.md");
  const skill = await fs.readFile(skillPath, "utf8");
  await fs.writeFile(skillPath, skill.replace(`name: ${formalName}`, `name: ${formalName}\ndisable-model-invocation: true`));
  assert.match((await validatePlugin(temporary, { probeBun: false })).errors.join("\n"), /unsupported skill frontmatter field: disable-model-invocation/);
});

test("accepted maintenance pins match the reviewed source and host omission", async () => {
  const read = async (file) => JSON.parse(await fs.readFile(path.join(root, file), "utf8"));
  const [state, lock, map] = await Promise.all([
    read("maintenance/sync-state.json"), read("upstream.lock.json"), read("compatibility/pstack-map.json"),
  ]);
  assert.equal(state.aqua, "d5b20bce6f0602e3155960b5ea46e47fa0692ad2");
  assert.equal(state.cursor, lock.source.commit);
  assert.equal(map.refresh.to.commit, state.cursor);
  assert.equal(map.refresh.from.commit, "1e5c90a4b6f249917bd21fe361b3a2a7deb741b8");
  const omitted = map.entries.find((entry) => entry.upstreamPath === "docs/harness/claude-code.md");
  assert.equal(omitted.classification, "provenance-only");
  assert.equal(omitted.derivedPath, null);
  await assert.rejects(fs.stat(path.join(root, "docs/harness/claude-code.md")), { code: "ENOENT" });
});
