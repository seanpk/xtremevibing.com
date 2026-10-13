// Strip the mermaid fence into <pre class="mermaid"> for client-side rendering,
// and wrap tables so they scroll sideways on narrow screens.
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
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
