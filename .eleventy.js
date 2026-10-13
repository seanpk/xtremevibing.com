// Strip the mermaid fence into <pre class="mermaid"> for client-side rendering,
// and wrap tables so they scroll sideways on narrow screens.
const slug = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy({ static: "/" });

  eleventyConfig.amendLibrary("md", (md) => {
    const fence = md.renderer.rules.fence;
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const t = tokens[idx];
      if (t.info.trim().split(/\s+/)[0] === "mermaid") {
        return `<div class="diagram"><pre class="mermaid">${md.utils.escapeHtml(t.content)}</pre></div>\n`;
      }
      return fence(tokens, idx, options, env, self);
    };
    md.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n';
    md.renderer.rules.table_close = () => "</table></div>\n";

    // Every h2 and h3 gets an id and a "#" link that copies its address.
    md.core.ruler.push("heading_anchors", (state) => {
      const seen = new Set();
      for (let i = 0; i < state.tokens.length; i++) {
        const t = state.tokens[i];
        if (t.type !== "heading_open" || !/^h[23]$/.test(t.tag)) continue;
        const inline = state.tokens[i + 1];
        const text = inline.children.filter((c) => c.type === "text" || c.type === "code_inline").map((c) => c.content).join("");
        let id = slug(text), n = 2;
        while (seen.has(id)) id = `${slug(text)}-${n++}`;
        seen.add(id);
        t.attrSet("id", id);
        const a = new state.Token("html_inline", "", 0);
        a.content = ` <a class="anchor" href="#${id}" aria-label="Link to this section">#</a>`;
        inline.children.push(a);
      }
    });
  });

  // Table rows get an id from their first cell, with the same "#" link, so a
  // single value, principle or practice can be linked to.
  eleventyConfig.addTransform("row_anchors", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    const seen = new Set();
    return content.replace(/<tr>\s*<td>([\s\S]*?)<\/td>/g, (whole, cell) => {
      const text = cell.replace(/<[^>]+>/g, "").trim();
      if (!text) return whole;
      let id = slug(text), n = 2;
      while (seen.has(id)) id = `${slug(text)}-${n++}`;
      seen.add(id);
      return `<tr id="${id}"><td>${cell} <a class="anchor" href="#${id}" aria-label="Link to this row">#</a></td>`;
    });
  });

  // Nav comes from front matter: pages with `nav` set, ordered by `order`.
  eleventyConfig.addCollection("pages", (api) =>
    api
      .getAll()
      .filter((p) => p.data.nav)
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99))
  );

  // Markdown bodies are generated and may contain braces, so they skip Nunjucks.
  return {
    dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
