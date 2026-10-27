# strybe-site

The Strybe app's website, served by GitHub Pages: a landing page plus the Privacy Policy and Terms of Service.

- `index.html` is the landing page. Edit it by hand. Its entrance animation (GSAP, loaded from a CDN) is in `assets/js/site.js`, and is driven by the `data-marker-*` attributes in the page.
- `assets/css/site.css` holds all the styling. The look follows the Arcs site, written as plain CSS.
- `privacy.md` and `terms.md` are generated, so don't edit them. Regenerate them from the app repo with `node scripts/exportLegal.mjs ../strybe-site`.

## Preview locally

Needs Homebrew Ruby with Jekyll installed for your user (`/opt/homebrew/opt/ruby/bin/gem install --user-install jekyll`). Then run:

    PATH=/opt/homebrew/opt/ruby/bin:$PATH ~/.local/share/gem/ruby/4.0.0/bin/jekyll serve --baseurl /strybe-site --livereload

and open http://localhost:4000/strybe-site/. Pages reload as you save.
