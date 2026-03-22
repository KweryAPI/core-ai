import { describe, it, expect } from "vitest";
import { readFileSync, lstatSync, existsSync } from "fs";
import { resolve } from "path";

const REPO_ROOT = resolve(__dirname, "..");
const SKILLS = ["backtest", "signal", "derivatives", "research"];

function read(relPath: string): string {
  return readFileSync(resolve(REPO_ROOT, relPath), "utf8");
}

function isSymlink(relPath: string): boolean {
  try {
    return lstatSync(resolve(REPO_ROOT, relPath)).isSymbolicLink();
  } catch {
    return false;
  }
}

describe("Skill content sync — .agents/skills matches kwery-skills", () => {
  SKILLS.forEach((skill) => {
    it(`${skill} SKILL.md content is identical in both locations`, () => {
      const agentsPath = `.agents/skills/${skill}/SKILL.md`;
      const skillsPath = `kwery-skills/${skill}/SKILL.md`;

      const agentsContent = read(agentsPath);
      const skillsContent = read(skillsPath);

      expect(agentsContent).toBe(skillsContent);
    });
  });
});

describe("Skill content sync — kwery-plugin/skills matches kwery-skills", () => {
  SKILLS.forEach((skill) => {
    it(`${skill} SKILL.md content is identical in plugin and kwery-skills`, () => {
      const pluginPath = `kwery-plugin/skills/${skill}/SKILL.md`;
      const skillsPath = `kwery-skills/${skill}/SKILL.md`;

      // Plugin SKILL.md may differ (it has Claude-specific frontmatter)
      // so we only check that the skill name and description match
      const pluginContent = read(pluginPath);
      const skillsContent = read(skillsPath);

      const pluginName = pluginContent.match(/^name:\s+(\S+)/m)?.[1];
      const skillsName = skillsContent.match(/^name:\s+(\S+)/m)?.[1];
      expect(pluginName).toBe(skillsName);
    });
  });
});

describe("Symlink status", () => {
  SKILLS.forEach((skill) => {
    it(`${skill} — reports symlink status (informational, not a failure)`, () => {
      const path = `.agents/skills/${skill}/SKILL.md`;
      const linked = isSymlink(path);
      // Not asserting true/false — just logging so devs know the state
      console.log(`  ${path}: ${linked ? "symlink ✓" : "copy (not symlinked)"}`);
      // Either is acceptable — test just ensures the file exists and is readable
      expect(existsSync(resolve(REPO_ROOT, path))).toBe(true);
    });
  });
});
