import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, lstatSync } from "fs";
import { resolve } from "path";

// Resolve repo root from this test file's location
const REPO_ROOT = resolve(__dirname, "..");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function read(relPath: string): string {
  return readFileSync(resolve(REPO_ROOT, relPath), "utf8");
}

function exists(relPath: string): boolean {
  return existsSync(resolve(REPO_ROOT, relPath));
}

function isSymlink(relPath: string): boolean {
  try {
    return lstatSync(resolve(REPO_ROOT, relPath)).isSymbolicLink();
  } catch {
    return false;
  }
}

// ─── Required files ───────────────────────────────────────────────────────────

describe("Required files exist", () => {
  const required = [
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    ".env.example",
    ".gitignore",
    "package.json",
    "pnpm-workspace.yaml",
  ];

  required.forEach((file) => {
    it(file, () => {
      expect(exists(file), `${file} is missing`).toBe(true);
    });
  });
});

// ─── Package directories ──────────────────────────────────────────────────────

describe("Package directories exist", () => {
  const packages = [
    "kwery-mcp",
    "kwery-cli",
    "kwery-skills",
    "kwery-plugin",
    "kwery-cursor",
  ];

  packages.forEach((pkg) => {
    it(pkg, () => {
      expect(exists(pkg), `${pkg}/ directory is missing`).toBe(true);
    });
  });
});

// ─── Skill files — kwery-skills ──────────────────────────────────────────────

const SKILLS = ["backtest", "signal", "derivatives", "research"];

describe("kwery-skills — SKILL.md files exist", () => {
  SKILLS.forEach((skill) => {
    it(`kwery-skills/${skill}/SKILL.md`, () => {
      expect(exists(`kwery-skills/${skill}/SKILL.md`)).toBe(true);
    });
  });
});

describe("kwery-skills — install.sh files exist and are not empty", () => {
  SKILLS.forEach((skill) => {
    it(`kwery-skills/${skill}/install.sh`, () => {
      expect(exists(`kwery-skills/${skill}/install.sh`)).toBe(true);
      const content = read(`kwery-skills/${skill}/install.sh`);
      expect(content.length).toBeGreaterThan(50);
    });
  });
});

describe("kwery-skills — SKILL.md frontmatter is valid", () => {
  SKILLS.forEach((skill) => {
    it(`${skill} has opening --- delimiter`, () => {
      const content = read(`kwery-skills/${skill}/SKILL.md`);
      expect(content.startsWith("---\n")).toBe(true);
    });

    it(`${skill} has name field`, () => {
      const content = read(`kwery-skills/${skill}/SKILL.md`);
      expect(content).toMatch(/^name:\s+\S+/m);
    });

    it(`${skill} has description field`, () => {
      const content = read(`kwery-skills/${skill}/SKILL.md`);
      expect(content).toMatch(/^description:\s+.{20,}/m);
    });

    it(`${skill} frontmatter name matches directory name`, () => {
      const content = read(`kwery-skills/${skill}/SKILL.md`);
      const match = content.match(/^name:\s+(\S+)/m);
      expect(match?.[1]).toBe(skill);
    });
  });
});

describe("kwery-skills — SKILL.md content requirements", () => {
  SKILLS.forEach((skill) => {
    it(`${skill} mentions kwery-api.com`, () => {
      const content = read(`kwery-skills/${skill}/SKILL.md`);
      expect(content).toContain("kwery-api.com");
    });

    it(`${skill} has at least one code block`, () => {
      const content = read(`kwery-skills/${skill}/SKILL.md`);
      expect(content).toContain("```");
    });

    it(`${skill} mentions KWERY_API_KEY`, () => {
      const content = read(`kwery-skills/${skill}/SKILL.md`);
      expect(content).toContain("KWERY_API_KEY");
    });
  });

  it("backtest skill mentions token_id (critical gotcha)", () => {
    const content = read("kwery-skills/backtest/SKILL.md");
    expect(content).toContain("token_id");
  });

  it("backtest skill mentions snapshot_at", () => {
    const content = read("kwery-skills/backtest/SKILL.md");
    expect(content).toContain("snapshot_at");
  });

  it("signal skill mentions Kalshi price normalization (/ 100)", () => {
    const content = read("kwery-skills/signal/SKILL.md");
    expect(content).toContain("/ 100");
  });

  it("signal skill mentions funding rate annualization (× 3 × 365)", () => {
    const content = read("kwery-skills/signal/SKILL.md");
    // Accept × or * notation
    expect(content).toMatch(/[×*]\s*3\s*[×*]\s*365/);
  });

  it("derivatives skill mentions liquidation side (long/short)", () => {
    const content = read("kwery-skills/derivatives/SKILL.md");
    expect(content).toContain("long");
    expect(content).toContain("short");
  });

  it("research skill mentions winner field", () => {
    const content = read("kwery-skills/research/SKILL.md");
    expect(content).toContain("winner");
  });
});

// ─── Skill files — .agents ────────────────────────────────────────────────────

describe(".agents/skills — SKILL.md files exist", () => {
  SKILLS.forEach((skill) => {
    it(`.agents/skills/${skill}/SKILL.md`, () => {
      expect(exists(`.agents/skills/${skill}/SKILL.md`)).toBe(true);
    });
  });
});

describe(".agents/skills — SKILL.md frontmatter is valid", () => {
  SKILLS.forEach((skill) => {
    it(`${skill} has name field`, () => {
      const content = read(`.agents/skills/${skill}/SKILL.md`);
      expect(content).toMatch(/^name:\s+\S+/m);
    });

    it(`${skill} has description field`, () => {
      const content = read(`.agents/skills/${skill}/SKILL.md`);
      expect(content).toMatch(/^description:\s+.{20,}/m);
    });
  });
});

// ─── Claude Code plugin ───────────────────────────────────────────────────────

describe("kwery-plugin structure", () => {
  it(".claude-plugin/plugin.json exists", () => {
    expect(exists("kwery-plugin/.claude-plugin/plugin.json")).toBe(true);
  });

  it(".mcp.json exists", () => {
    expect(exists("kwery-plugin/.mcp.json")).toBe(true);
  });

  it("plugin.json has name field", () => {
    const json = JSON.parse(read("kwery-plugin/.claude-plugin/plugin.json"));
    expect(json.name).toBe("kwery");
  });

  it("plugin.json has version field", () => {
    const json = JSON.parse(read("kwery-plugin/.claude-plugin/plugin.json"));
    expect(json.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it(".mcp.json has mcpServers.kwery", () => {
    const json = JSON.parse(read("kwery-plugin/.mcp.json"));
    expect(json.mcpServers?.kwery).toBeDefined();
    expect(json.mcpServers.kwery.command).toBe("npx");
  });

  SKILLS.forEach((skill) => {
    it(`plugin skills/${skill}/SKILL.md exists`, () => {
      expect(exists(`kwery-plugin/skills/${skill}/SKILL.md`)).toBe(true);
    });

    it(`plugin skills/${skill}/SKILL.md has name and description`, () => {
      const content = read(`kwery-plugin/skills/${skill}/SKILL.md`);
      expect(content).toMatch(/^name:\s+\S+/m);
      expect(content).toMatch(/^description:\s+.{20,}/m);
    });
  });

  const commands = ["setup", "limits", "status", "explore"];
  commands.forEach((cmd) => {
    it(`commands/${cmd}.md exists`, () => {
      expect(exists(`kwery-plugin/commands/${cmd}.md`)).toBe(true);
    });

    it(`commands/${cmd}.md has description frontmatter`, () => {
      const content = read(`kwery-plugin/commands/${cmd}.md`);
      expect(content).toMatch(/^description:\s+.{10,}/m);
    });
  });
});

// ─── Cursor plugin ────────────────────────────────────────────────────────────

describe("kwery-cursor structure", () => {
  it(".cursor/mcp.json exists", () => {
    expect(exists("kwery-cursor/.cursor/mcp.json")).toBe(true);
  });

  it(".cursor/mcp.json has mcpServers.kwery", () => {
    const json = JSON.parse(read("kwery-cursor/.cursor/mcp.json"));
    expect(json.mcpServers?.kwery).toBeDefined();
    expect(json.mcpServers.kwery.command).toBe("npx");
  });

  const rules = [
    "kwery-overview",
    "kwery-backtest",
    "kwery-signal",
    "kwery-derivatives",
    "kwery-research",
  ];

  rules.forEach((rule) => {
    it(`rules/${rule}.mdc exists`, () => {
      expect(exists(`kwery-cursor/rules/${rule}.mdc`)).toBe(true);
    });

    it(`rules/${rule}.mdc has description frontmatter`, () => {
      const content = read(`kwery-cursor/rules/${rule}.mdc`);
      expect(content).toMatch(/^description:\s+.{10,}/m);
    });

    it(`rules/${rule}.mdc has alwaysApply field`, () => {
      const content = read(`kwery-cursor/rules/${rule}.mdc`);
      expect(content).toMatch(/^alwaysApply:/m);
    });
  });

  it("install.sh exists", () => {
    expect(exists("kwery-cursor/install.sh")).toBe(true);
  });
});

// ─── .gitignore validation ────────────────────────────────────────────────────

describe(".gitignore", () => {
  const gitignore = read(".gitignore");

  it("ignores .env", () => {
    expect(gitignore).toContain(".env");
  });

  it("ignores node_modules", () => {
    expect(gitignore).toContain("node_modules");
  });

  it("ignores dist", () => {
    expect(gitignore).toContain("dist");
  });

  it("ignores coverage", () => {
    expect(gitignore).toContain("coverage");
  });

  it("does NOT ignore .env.example", () => {
    // .env.example should be committed
    expect(gitignore).not.toContain(".env.example");
  });
});

// ─── .env.example validation ─────────────────────────────────────────────────

describe(".env.example", () => {
  const content = read(".env.example");

  it("contains KWERY_API_KEY", () => {
    expect(content).toContain("KWERY_API_KEY");
  });

  it("does not contain an actual key value", () => {
    // Should be empty or placeholder, not a real key
    expect(content).not.toMatch(/KWERY_API_KEY=\S{20,}/);
  });
});
