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

    return {
        file,
        title,
        description
    };
});

const articleList = articles.map(article => `
        <article class="article">
            <div class="article-content">
                <h2>
                    <a href="/articles/${article.file}">
                        ${escapeHtml(article.title)}
                    </a>
                </h2>

                ${
                    article.description
                        ? `<p class="article-description">${escapeHtml(article.description)}</p>`
                        : ""
                }

                <a class="read-more" href="/articles/${article.file}">
                    Read article →
                </a>
            </div>
        </article>
`).join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>My Blog</title>
    <meta name="description" content="Articles about SEO, digital marketing, SaaS, AI and online business.">

    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            background: #ffffff;
            color: #222222;
            line-height: 1.6;
        }

        header {
            border-bottom: 1px solid #eeeeee;
            padding: 25px 20px;
        }

        .header-inner {
            max-width: 1000px;
            margin: 0 auto;
        }

        .logo {
            font-size: 24px;
            font-weight: 700;
            color: #111111;
            text-decoration: none;
        }

        main {
            max-width: 1000px;
            margin: 0 auto;
            padding: 60px 20px;
        }

        h1 {
            font-size: 42px;
            line-height: 1.2;
            margin-bottom: 15px;
        }

        .intro {
            color: #666666;
            font-size: 18px;
            margin-bottom: 50px;
            max-width: 700px;
        }

        .articles {
            display: flex;
            flex-direction: column;
            gap: 25px;
        }

        .article {
            padding: 25px 0;
            border-bottom: 1px solid #eeeeee;
        }

        .article h2 {
            font-size: 25px;
            line-height: 1.3;
            margin-bottom: 10px;
        }

        .article h2 a {
            color: #111111;
            text-decoration: none;
        }

        .article h2 a:hover {
            text-decoration: underline;
        }

        .article-description {
            color: #666666;
            font-size: 16px;
            max-width: 750px;
            margin-bottom: 12px;
        }

        .read-more {
            color: #111111;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
        }

        .read-more:hover {
            text-decoration: underline;
        }

        footer {
            max-width: 1000px;
            margin: 40px auto 0;
            padding: 30px 20px;
            border-top: 1px solid #eeeeee;
            color: #888888;
            font-size: 14px;
        }

        @media (max-width: 600px) {
            h1 {
                font-size: 32px;
            }

            .intro {
                font-size: 16px;
            }

            .article h2 {
                font-size: 21px;
            }

            main {
                padding-top: 40px;
            }
        }
    </style>
</head>

<body>

<header>
    <div class="header-inner">
        <a href="/" class="logo">My Blog</a>
    </div>
</header>

<main>

    <h1>Articles</h1>

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

console.log(`Generated index.html with ${articles.length} articles.`);
