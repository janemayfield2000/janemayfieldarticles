const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const articlesDir = path.join(root, "articles");
const indexPath = path.join(root, "index.html");

function getMeta(content, name) {
    const regex = new RegExp(
        `<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`,
        "i"
    );

    const match = content.match(regex);
    return match ? match[1] : "";
}

function getTitle(content) {
    const match = content.match(/<title>([\s\S]*?)<\/title>/i);
    return match ? match[1].trim() : "";
}

function getH1(content) {
    const match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

    if (!match) {
        return "";
    }

    return match[1]
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function createSlug(title) {
    return title
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

const files = fs
    .readdirSync(articlesDir)
    .filter(file => /^article-\d+\.html$/i.test(file))
    .sort((a, b) => {
        const numberA = parseInt(a.match(/\d+/)[0], 10);
        const numberB = parseInt(b.match(/\d+/)[0], 10);

        return numberA - numberB;
    });

const articles = files.map(file => {
    const filePath = path.join(articlesDir, file);
    const content = fs.readFileSync(filePath, "utf8");

    const title = getTitle(content) || getH1(content) || file;
    const description = getMeta(content, "description");
    const slug = createSlug(title);

    // Create clean URL directory
    const slugDir = path.join(articlesDir, slug);

    if (!fs.existsSync(slugDir)) {
        fs.mkdirSync(slugDir, { recursive: true });
    }

    // Copy article to slug/index.html
    const slugIndexPath = path.join(slugDir, "index.html");

    fs.writeFileSync(slugIndexPath, content, "utf8");

    console.log(`${file} -> /articles/${slug}/`);

    return {
        file,
        title,
        description,
        slug
    };
});

const articleList = articles.map(article => `
        <article class="article-card">

            <h2>
                <a href="/articles/${article.slug}/">
                    ${escapeHtml(article.title)}
                </a>
            </h2>

            ${
                article.description
                    ? `<p class="article-description">${escapeHtml(article.description)}</p>`
                    : ""
            }

            <a class="read-more" href="/articles/${article.slug}/">
                Read article →
            </a>

        </article>
`).join("\n");

const html = `<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>My Blog</title>

    <meta
        name="description"
        content="Articles about SEO, digital marketing, SaaS, AI and online business."
    >

    <link rel="stylesheet" href="/styles.css">

</head>

<body>

<header>

    <div class="header-inner">

        <a href="/" class="logo">
            My Blog
        </a>

    </div>

</header>

<main>

    <h1 class="home-title">
        Articles
    </h1>

    <p class="intro">
        Articles about SEO, digital marketing, SaaS, AI and online business.
    </p>

    <section class="articles">

${articleList}

    </section>

</main>

<footer>

    © 2026 My Blog

</footer>

</body>

</html>
`;

fs.writeFileSync(indexPath, html, "utf8");

console.log("");
console.log(`Generated index.html with ${articles.length} articles.`);
console.log("Clean article URLs generated successfully.");
