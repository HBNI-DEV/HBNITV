from tornado.web import RequestHandler

from app.routes.view_routes import load_view_routes


class SitemapHandler(RequestHandler):
    def get(self):
        self.set_header("Content-Type", "application/xml")

        routes = load_view_routes()

        self.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        self.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')

        base_url = "https://hbnitv.net"

        for route in routes:
            loc = base_url + route.regex.pattern.replace("\\/", "/").replace(
                "^", ""
            ).replace("$", "")
            # Skip dynamic paths (basic check)
            if "*" not in loc and "(?P" not in loc:
                self.write(
                    f"  <url>\n    <loc>{loc}</loc>\n    <changefreq>weekly</changefreq>\n  </url>\n"
                )

        self.write("</urlset>")
