// Every request runs through here first (run_worker_first in wrangler.toml).
// Any host other than the apex (www, extremevibing.com and its www) is sent
// to the same path on https://xtremevibing.com. Everything else is a static
// asset from _site.
const CANONICAL = "xtremevibing.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname !== CANONICAL) {
      url.hostname = CANONICAL;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
