import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "@/mcp/server";

async function connect() {
  const server = createServer();
  const client = new Client({ name: "test", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

describe("colorbrew MCP server", () => {
  it("exposes exactly the six color tools", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(
      [
        "contrast_ratio",
        "contrast_text",
        "convert_color",
        "generate_palette",
        "gradient_css",
        "simulate_color_blindness",
      ].sort(),
    );
    await client.close();
  });

  it("builds gradients from hex stops and normalizes angles (−45 → 315)", async () => {
    const client = await connect();
    const g = await client.callTool({
      name: "gradient_css",
      arguments: {
        stops: [
          { color: "#ff0000", position: 0 },
          { color: "#0000ff", position: 100 },
        ],
        kind: "linear",
        angle: -45,
      },
    });
    expect((g.content as any)[0].text).toBe("linear-gradient(315deg, #ff0000 0%, #0000ff 100%)");

    const auto = await client.callTool({
      name: "gradient_css",
      arguments: {
        stops: [{ color: "#111111" }, { color: "#222222" }, { color: "#333333" }],
        kind: "linear",
        angle: 90,
      },
    });
    expect((auto.content as any)[0].text).toBe(
      "linear-gradient(90deg, #111111 0%, #222222 50%, #333333 100%)",
    );
    await client.close();
  });

  it("rejects gradients with a bad stop color or fewer than two stops via isError", async () => {
    const client = await connect();
    const badColor = await client.callTool({
      name: "gradient_css",
      arguments: {
        stops: [{ color: "#ff0000" }, { color: "nope" }],
        kind: "linear",
        angle: 0,
      },
    });
    expect((badColor as any).isError).toBe(true);
    expect((badColor.content as any)[0].text).toContain("invalid stop color");
    // schema 层:1 个 stop 被 zod 拒绝 → SDK 返回 isError 结果(不 throw)
    const tooFew = await client.callTool({
      name: "gradient_css",
      arguments: { stops: [{ color: "#ff0000" }], kind: "linear", angle: 0 },
    });
    expect((tooFew as any).isError).toBe(true);
    expect((tooFew.content as any)[0].text).toContain("-32602");
    await client.close();
  });

  it("computes WCAG contrast against the known 4.54 gray anchor", async () => {
    const client = await connect();
    const c = await client.callTool({
      name: "contrast_ratio",
      arguments: { foreground: "#767676", background: "#ffffff" },
    });
    const parsed = JSON.parse((c.content as any)[0].text);
    expect(parsed.ratio).toBeCloseTo(4.54, 1);
    expect(parsed.aaNormal).toBe(true);
    expect(parsed.aaaNormal).toBe(false);
    expect(parsed.aaLarge).toBe(true);

    const bad = await client.callTool({
      name: "contrast_ratio",
      arguments: { foreground: "#767676", background: "not-a-color" },
    });
    expect((bad as any).isError).toBe(true);
    await client.close();
  });

  it("converts colors across all four formats with OKLCH anchors", async () => {
    const client = await connect();
    const r = await client.callTool({ name: "convert_color", arguments: { color: "#ff0000" } });
    const parsed = JSON.parse((r.content as any)[0].text);
    expect(parsed.detected).toBe("hex");
    expect(parsed.rgb).toEqual({ r: 255, g: 0, b: 0 });
    expect(parsed.hsl).toEqual({ h: 0, s: 100, l: 50 });
    expect(parsed.oklch.l).toBeCloseTo(0.628, 3);
    expect(parsed.oklch.c).toBeCloseTo(0.2577, 3);
    expect(parsed.oklch.h).toBeCloseTo(29.23, 1);

    const hslIn = await client.callTool({
      name: "convert_color",
      arguments: { color: "hsl(210, 50%, 40%)" },
    });
    const hslParsed = JSON.parse((hslIn.content as any)[0].text);
    expect(hslParsed.detected).toBe("hsl");
    expect(hslParsed.hex).toBe("#336699");

    const alpha = await client.callTool({
      name: "convert_color",
      arguments: { color: "rgba(0, 0, 0, 0.5)" },
    });
    expect((alpha as any).isError).toBe(true);
    await client.close();
  });

  it("generates palettes with exact complementary hue math", async () => {
    const client = await connect();
    const r = await client.callTool({
      name: "generate_palette",
      arguments: { base_color: "#336699", harmony: "complementary" },
    });
    const parsed = JSON.parse((r.content as any)[0].text);
    // 互补:i0 基色 #336699,i1 = 基色+180°(rotateHue 已验 = #996633),i2 = 基色提亮 +18
    expect(parsed.colors[0]).toBe("#336699");
    expect(parsed.colors[1]).toBe("#996633");
    expect(parsed.colors).toHaveLength(5);
    expect(parsed.css_variables).toContain("--color-1: #336699;");
    expect(parsed.css_variables).toContain("--color-5: #");

    const bad = await client.callTool({
      name: "generate_palette",
      arguments: { base_color: "tomato-red-not-hex" },
    });
    expect((bad as any).isError).toBe(true);
    await client.close();
  });

  it("simulates color blindness with gray invariance and the known red→dark-yellow anchor", async () => {
    const client = await connect();
    const all = await client.callTool({
      name: "simulate_color_blindness",
      arguments: { color: "#ff0000" },
    });
    const parsed = JSON.parse((all.content as any)[0].text);
    expect(parsed.color).toBe("#ff0000");
    expect(parsed.protanopia).toBe("#5e5e0d");
    expect(parsed.deuteranopia).toBe("#939300");
    expect(parsed.tritanopia).toBe("#ff0000");

    const gray = await client.callTool({
      name: "simulate_color_blindness",
      arguments: { color: "#808080", type: "deuteranopia" },
    });
    expect(JSON.parse((gray.content as any)[0].text).deuteranopia).toBe("#808080");
    await client.close();
  });

  it("finds WCAG text shades and reports unreachable levels honestly", async () => {
    const client = await connect();
    const r = await client.callTool({
      name: "contrast_text",
      arguments: { background: "#ffffff", target: 4.5 },
    });
    const parsed = JSON.parse((r.content as any)[0].text);
    // 经典锚点:白底上恰好 AA 的最浅灰 = #767676
    expect(parsed.lightest_passing.color).toBe("#767676");
    expect(parsed.darkest_passing.color).toBe("#000000");
    expect(parsed.best_simple_pick).toEqual({ color: "#000000", ratio: 21 });

    // 深蓝底 @7:白字原生达标;黑端沿黑↔白线搜索,最近达标色 = #d5d5d5(7.06:1)
    const dark = await client.callTool({
      name: "contrast_text",
      arguments: { background: "#1e3a8a", target: 7 },
    });
    const darkParsed = JSON.parse((dark.content as any)[0].text);
    expect(darkParsed.lightest_passing.color).toBe("#ffffff");
    expect(darkParsed.darkest_passing.color).toBe("#d5d5d5");
    expect(darkParsed.darkest_passing.ratio).toBeGreaterThanOrEqual(7);

    // 中灰底 @7:纯黑也只有 ~5.3:1,两端都不可达 → 诚实报告
    const unreach = await client.callTool({
      name: "contrast_text",
      arguments: { background: "#808080", target: 7 },
    });
    const unreachParsed = JSON.parse((unreach.content as any)[0].text);
    expect(unreachParsed.lightest_passing).toBe("unreachable");
    expect(unreachParsed.darkest_passing).toBe("unreachable");
    await client.close();
  });
});
