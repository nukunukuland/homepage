// ぬくぬくらんど サイトのビルド
// 使い方：node build.mjs  →  dist/ に公開用のファイルができます
// Node.js だけで動きます（npm install は不要）

import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://nukunukuland.pages.dev";
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "dist");
const NEWS_DIR = path.join(ROOT, "content", "news");
const NEWS_PER_PAGE = 10;
const NEWS_ON_TOP = 3;
const DEFAULT_IMAGE = { src: "/image/ogp.png", w: 1200, h: 630 };

// お知らせの種類（CMSの設定 src/public/admin/config.yml と合わせる）
const CATEGORIES = {
  event: "イベント",
  info: "お知らせ",
  important: "大切なお知らせ",
  other: "その他",
};

// ---------------------------------------------------------------- 小道具

const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, s) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
};
const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function copyDir(from, to) {
  for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, ent.name);
    const b = path.join(to, ent.name);
    if (ent.isDirectory()) copyDir(a, b);
    else {
      fs.mkdirSync(path.dirname(b), { recursive: true });
      fs.copyFileSync(a, b);
    }
  }
}

function walk(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((ent) => {
    const p = path.join(dir, ent.name);
    return ent.isDirectory() ? walk(p, base) : [path.relative(base, p)];
  });
}

// ---------------------------------------------------------------- 前書き（--- で囲んだ部分）

function parseScalar(v) {
  v = v.trim();
  if ((v.startsWith('"') && v.endsWith('"')) && v.length >= 2) {
    try { return JSON.parse(v); } catch { return v.slice(1, -1); }
  }
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) return v.slice(1, -1).replaceAll("''", "'");
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "" || v === "null" || v === "~") return "";
  return v;
}

function frontMatter(text, file) {
  const m = text.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data = {};
  const lines = m[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) throw new Error(`${file}: 前書きの ${i + 1} 行目が読めません →「${line}」`);
    const [, key, raw] = kv;
    if (/^[|>][-+]?$/.test(raw.trim())) {
      // 複数行の文字（| や >）
      const folded = raw.trim().startsWith(">");
      const block = [];
      while (i + 1 < lines.length && (/^\s+/.test(lines[i + 1]) || lines[i + 1] === "")) block.push(lines[++i].replace(/^\s{2}/, ""));
      data[key] = folded ? block.join(" ").trim() : block.join("\n").trim();
    } else {
      data[key] = parseScalar(raw);
    }
  }
  return { data, body: m[2] };
}

// ---------------------------------------------------------------- Markdown（安全のため必要な書き方だけ対応）

const SAFE_URL = /^(https?:\/\/|\/|#|mailto:|tel:)/i;

function inline(raw) {
  const keep = [];
  const hold = (html) => `\u0000${keep.push(html) - 1}\u0000`;
  let s = esc(raw);
  // 画像 ![説明](URL)
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (all, alt, url) =>
    SAFE_URL.test(url) ? hold(`<img src="${url}" alt="${alt}" loading="lazy">`) : alt);
  // リンク [文字](URL)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (all, text, url) => {
    if (!SAFE_URL.test(url)) return text;
    const ext = /^https?:/i.test(url) && !url.startsWith(SITE_URL);
    return hold(`<a href="${url}"${ext ? ' target="_blank" rel="noopener"' : ""}>${text}</a>`);
  });
  // そのまま貼ったURL
  s = s.replace(/https?:\/\/[^\s<\u0000]+/g, (url) => hold(`<a href="${url}" target="_blank" rel="noopener">${url}</a>`));
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, "$1<em>$2</em>");
  s = s.replace(/\\\n|  \n/g, "<br>\n").replace(/\n/g, "<br>\n");
  return s.replace(/\u0000(\d+)\u0000/g, (_, n) => keep[+n]);
}

function markdown(md) {
  const out = [];
  const blocks = md.replace(/\r\n?/g, "\n").trim().split(/\n{2,}/);
  for (const block of blocks) {
    const lines = block.split("\n");
    let m;
    if ((m = block.match(/^(#{1,4})\s+(.+)$/)) && lines.length === 1) {
      const lv = Math.min(4, Math.max(3, m[1].length + 1));
      out.push(`<h${lv}>${inline(m[2])}</h${lv}>`);
    } else if (/^(-{3,}|\*{3,})$/.test(block.trim())) {
      out.push("<hr>");
    } else if (lines.every((l) => /^\s*[-*+]\s+/.test(l))) {
      out.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*+]\s+/, ""))}</li>`).join("")}</ul>`);
    } else if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      out.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>`).join("")}</ol>`);
    } else if (lines.every((l) => /^>\s?/.test(l))) {
      out.push(`<blockquote><p>${inline(lines.map((l) => l.replace(/^>\s?/, "")).join("\n"))}</p></blockquote>`);
    } else {
      out.push(`<p>${inline(block)}</p>`);
    }
  }
  return out.join("\n");
}

// ---------------------------------------------------------------- お知らせ

function loadNews() {
  if (!fs.existsSync(NEWS_DIR)) return [];
  const items = [];
  for (const name of fs.readdirSync(NEWS_DIR).filter((f) => f.endsWith(".md"))) {
    const file = path.join("content/news", name);
    const { data, body } = frontMatter(read(path.join(NEWS_DIR, name)), file);
    if (data.draft === true) continue; // 下書きは公開しない
    const date = String(data.date ?? "").match(/\d{4}-\d{2}-\d{2}/)?.[0];
    if (!data.title) throw new Error(`${file}: タイトル（title）がありません`);
    if (!date) throw new Error(`${file}: 日付（date）がありません。2026-10-15 のように書いてください`);
    const category = CATEGORIES[data.category] ? data.category : "other";
    const slug = name.replace(/\.md$/, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug) throw new Error(`${file}: ファイル名は英数字にしてください`);
    let image = "";
    if (data.image) {
      if (!/^\/image\/news\/[^"'<>]+$/.test(data.image)) throw new Error(`${file}: 写真（image）の場所が正しくありません`);
      image = data.image;
    }
    items.push({ title: String(data.title), date, category, slug, image, body: body.trim(), url: `/news/${slug}/` });
  }
  const seen = new Set();
  for (const n of items) {
    if (seen.has(n.slug)) throw new Error(`お知らせのファイル名が重複しています：${n.slug}`);
    seen.add(n.slug);
  }
  return items.sort((a, b) => (a.date === b.date ? b.slug.localeCompare(a.slug) : b.date.localeCompare(a.date)));
}

const dot = (d) => d.replaceAll("-", ".");
const newsItem = (n) =>
  `<li><time datetime="${n.date}">${dot(n.date)}</time><span class="news-tag news-tag--${n.category}">${CATEGORIES[n.category]}</span><a href="${n.url}">${esc(n.title)}</a></li>`;
const newsList = (list) =>
  list.length ? `<ul class="news-list">\n${list.map(newsItem).join("\n")}\n</ul>` : `<p class="news-empty">いまはお知らせがありません。</p>`;

function newsFilters(current) {
  const tabs = [["", "すべて"], ...Object.entries(CATEGORIES)];
  return `<nav class="news-filter" aria-label="お知らせの種類"><ul>${tabs
    .map(([k, label]) => {
      const href = k ? `/news/${k}/` : "/news/";
      return `<li><a href="${href}"${k === current ? ' aria-current="page"' : ""}>${label}</a></li>`;
    })
    .join("")}</ul></nav>`;
}

function pager(base, page, pages) {
  if (pages <= 1) return "";
  const href = (p) => (p === 1 ? base : `${base}page/${p}/`);
  const links = [];
  if (page > 1) links.push(`<a class="pager__prev" href="${href(page - 1)}">新しいお知らせ</a>`);
  links.push(`<span class="pager__now">${page} / ${pages}</span>`);
  if (page < pages) links.push(`<a class="pager__next" href="${href(page + 1)}">前のお知らせ</a>`);
  return `<nav class="pager" aria-label="ページ">${links.join("")}</nav>`;
}

// ---------------------------------------------------------------- ページをつくる

const layout = read(path.join(SRC, "layout.html"));
const partials = Object.fromEntries(
  fs.readdirSync(path.join(SRC, "partials")).map((f) => [f.replace(/\.html$/, ""), read(path.join(SRC, "partials", f))]),
);

function withPartials(html) {
  for (let i = 0; i < 3; i++) html = html.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => {
    if (!(n in partials)) throw new Error(`部品 src/partials/${n}.html がありません`);
    return partials[n];
  });
  return html;
}

function render({ title, description, type = "article", urlPath, content, robots = "", image = DEFAULT_IMAGE }) {
  const vars = {
    title: esc(title),
    description: esc(description),
    type,
    url: SITE_URL + urlPath,
    image: SITE_URL + image.src,
    image_w: image.w ?? "",
    image_h: image.h ?? "",
    robots: robots ? `<meta name="robots" content="${esc(robots)}">` : "",
  };
  let html = withPartials(layout.replace("{{content}}", () => withPartials(content)));
  html = html.replace(/\{\{(\w+)\}\}/g, (all, k) => (k in vars ? String(vars[k]) : all));
  // 画像の情報が無いときは幅・高さの行を消す
  return html.replace(/\n\s*<meta property="og:image:(width|height)" content="">/g, "");
}

const sitemap = [];
function emit(urlPath, html, { index = true } = {}) {
  const file = urlPath.endsWith("/") ? urlPath + "index.html" : urlPath;
  write(path.join(OUT, file), html);
  if (index) sitemap.push(urlPath);
}

function pageShell(title, inner) {
  return `<main class="page page--momo">
  <header class="page-head wrap">
    <div class="page-head__text">
      <h1>${title}</h1>
    </div>
  </header>
  <div class="page-body wrap">
${inner}
  </div>
  {{> line-band}}
</main>`;
}

function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  copyDir(path.join(SRC, "public"), OUT);

  const news = loadNews();

  // 固定ページ
  for (const rel of walk(path.join(SRC, "pages"))) {
    const { data, body } = frontMatter(read(path.join(SRC, "pages", rel)), rel);
    let content = body.replace("{{news-latest}}", newsList(news.slice(0, NEWS_ON_TOP)));
    const urlPath = "/" + rel.replace(/index\.html$/, "").replace(/\\/g, "/");
    const is404 = rel === "404.html";
    emit(is404 ? "/404.html" : urlPath, render({ ...data, urlPath, content, robots: data.robots }), { index: !is404 });
  }

  // お知らせ一覧（すべて・種類別、10件ずつ）
  const lists = [["", news], ...Object.keys(CATEGORIES).map((k) => [k, news.filter((n) => n.category === k)])];
  for (const [cat, list] of lists) {
    const base = cat ? `/news/${cat}/` : "/news/";
    const pages = Math.max(1, Math.ceil(list.length / NEWS_PER_PAGE));
    for (let p = 1; p <= pages; p++) {
      const slice = list.slice((p - 1) * NEWS_PER_PAGE, p * NEWS_PER_PAGE);
      const name = cat ? `お知らせ（${CATEGORIES[cat]}）` : "お知らせ";
      const content = pageShell("お知らせ", `    <section class="news news--page">
      ${newsFilters(cat)}
      ${newsList(slice)}
      ${pager(base, p, pages)}
    </section>`);
      const urlPath = p === 1 ? base : `${base}page/${p}/`;
      emit(urlPath, render({
        title: `${name}${p > 1 ? `（${p}ページ目）` : ""}｜ぬくぬくらんど`,
        description: "ぬくぬくらんどからのお知らせ。イベントの開催や、活動のお知らせを載せています。",
        urlPath, content,
      }), { index: p === 1 });
    }
  }

  // お知らせの記事
  for (const [i, n] of news.entries()) {
    const newer = news[i - 1];
    const older = news[i + 1];
    const plain = n.body.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[#*>_`-]/g, "").replace(/\s+/g, " ").trim();
    const content = pageShell("お知らせ", `    <article class="article">
      <p class="article__meta"><time datetime="${n.date}">${dot(n.date)}</time><a class="news-tag news-tag--${n.category}" href="/news/${n.category}/">${CATEGORIES[n.category]}</a></p>
      <h2 class="article__title">${esc(n.title)}</h2>
      ${n.image ? `<figure class="article__photo"><img src="${n.image}" alt=""></figure>` : ""}
      <div class="article__body">
${markdown(n.body)}
      </div>
    </article>
    <nav class="pager pager--article" aria-label="前後のお知らせ">
      ${newer ? `<a class="pager__prev" href="${newer.url}">${esc(newer.title)}</a>` : "<span></span>"}
      <a class="pager__list" href="/news/">お知らせ一覧</a>
      ${older ? `<a class="pager__next" href="${older.url}">${esc(older.title)}</a>` : "<span></span>"}
    </nav>`);
    emit(n.url, render({
      title: `${n.title}｜ぬくぬくらんど`,
      description: plain.slice(0, 110) || n.title,
      urlPath: n.url, content,
      image: n.image ? { src: n.image } : DEFAULT_IMAGE,
    }));
  }

  // 検索エンジン向け
  write(path.join(OUT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap
      .map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join("\n")}\n</urlset>\n`);
  write(path.join(OUT, "robots.txt"), `User-agent: *\nDisallow: /admin/\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  console.log(`できました：ページ ${sitemap.length} 件、お知らせ ${news.length} 件 → dist/`);
}

try {
  build();
} catch (e) {
  console.error("\n✖ ビルドできませんでした：" + e.message + "\n");
  process.exit(1);
}
