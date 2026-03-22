import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const REPO_ROOT = resolve(__dirname, "..");

function read(relPath: string): string {
  return readFileSync(resolve(REPO_ROOT, relPath), "utf8");
}

describe("AGENTS.md — existence", () => {
  it("exists at repo root", () => {
    expect(existsSync(resolve(REPO_ROOT, "AGENTS.md"))).toBe(true);
  });
});

describe("AGENTS.md — package manager", () => {
  const content = read("AGENTS.md");

  it("specifies pnpm as the package manager", () => {
    expect(content).toContain("pnpm");
  });

  it("does not tell agents to use npm or yarn", () => {
    // Should not use npm install or yarn install as primary commands
    expect(content).not.toMatch(/^npm install$/m);
    expect(content).not.toMatch(/^yarn install$/m);
  });
});

describe("AGENTS.md — build and test commands", () => {
  const content = read("AGENTS.md");

  it("includes pnpm build command", () => {
    expect(content).toContain("pnpm build");
  });

  it("includes pnpm test command", () => {
    expect(content).toContain("pnpm test");
  });

  it("mentions Node.js version requirement", () => {
    expect(content).toMatch(/node.*20|20.*node/i);
  });
});

describe("AGENTS.md — environment", () => {
  const content = read("AGENTS.md");

  it("mentions KWERY_API_KEY", () => {
    expect(content).toContain("KWERY_API_KEY");
  });

  it("references .env.example", () => {
    expect(content).toContain(".env.example");
  });

  it("includes kwery.xyz/dashboard link", () => {
    expect(content).toContain("kwery.xyz/dashboard");
  });
});

describe("AGENTS.md — cross-references", () => {
  const content = read("AGENTS.md");

  it("references CLAUDE.md for Claude Code users", () => {
    expect(content).toContain("CLAUDE.md");
  });

  it("references .agents/skills for Codex users", () => {
    expect(content).toContain(".agents/skills");
  });

  it("references kwery-cursor for Cursor users", () => {
    expect(content).toContain("kwery-cursor");
  });
});

describe("AGENTS.md — critical API conventions", () => {
  const content = read("AGENTS.md");

  it("mentions token_id gotcha for Polymarket", () => {
    expect(content).toContain("token_id");
  });

  it("mentions Kalshi price normalization", () => {
    // Should mention cents or normalization
    expect(content).toMatch(/cents|normalize|\/\s*100/i);
  });

  it("mentions cursor-based pagination", () => {
    expect(content).toMatch(/cursor|after.*param/i);
  });

  it("mentions tier gate errors", () => {
    expect(content).toMatch(/403|tier|upgrade/i);
  });
});

describe("AGENTS.md — skill listing", () => {
  const content = read("AGENTS.md");
  const skills = ["backtest", "signal", "derivatives", "research"];

  skills.forEach((skill) => {
    it(`mentions ${skill} skill`, () => {
      expect(content).toContain(skill);
    });
  });
});

describe("AGENTS.md — package listing", () => {
  const content = read("AGENTS.md");
  const packages = ["kwery-mcp", "kwery-cli", "kwery-skills", "kwery-plugin", "kwery-cursor"];

  packages.forEach((pkg) => {
    it(`mentions ${pkg}`, () => {
      expect(content).toContain(pkg);
    });
  });
});

describe("CLAUDE.md — cross-references AGENTS.md", () => {
  it("CLAUDE.md references AGENTS.md", () => {
    const content = read("CLAUDE.md");
    expect(content).toContain("AGENTS.md");
  });
});
