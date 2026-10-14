// お知らせ管理画面（Sveltia CMS）の GitHub ログイン処理
// sveltia-cms-auth（MIT License, https://github.com/sveltia/sveltia-cms-auth）を参考に、
// このサイト専用にしぼって作ったものです。
//
// Cloudflare Pages の「環境変数」に次を設定してください（どれも「暗号化」にする）
//   GITHUB_CLIENT_ID       … GitHub OAuth App の Client ID
//   GITHUB_CLIENT_SECRET   … GitHub OAuth App の Client Secret
//   ALLOWED_GITHUB_USERS   … 管理画面に入ってよい GitHub ユーザー名（カンマ区切り）

const COOKIE = "nuku-oauth-state";
const ALLOWED_SCOPES = ["public_repo", "repo"];

/** 管理画面（呼び出し元のウィンドウ）に結果を渡すページ。自分のサイト以外には渡さない */
function reply(origin, { token, error }) {
  const state = token ? "success" : "error";
  const payload = token ? { provider: "github", token } : { provider: "github", error };
  const message = `authorization:github:${state}:${JSON.stringify(payload)}`;
  const js = (v) => JSON.stringify(v).replaceAll("<", "\\u003c");
  const html = `<!doctype html><html lang="ja"><meta charset="utf-8"><title>ログイン</title><body><p>${
    token ? "ログインしました。この画面は自動で閉じます。" : "ログインできませんでした：" + String(error).replace(/[<>&]/g, "")
  }</p><script>
(() => {
  const ORIGIN = ${js(origin)};
  const MESSAGE = ${js(message)};
  window.addEventListener("message", (e) => {
    if (e.origin !== ORIGIN || e.data !== "authorizing:github") return;
    window.opener && window.opener.postMessage(MESSAGE, ORIGIN);
  });
  window.opener && window.opener.postMessage("authorizing:github", ORIGIN);
})();
</script></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "no-store",
      "Set-Cookie": `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
    },
  });
}

/** /auth … GitHub のログイン画面へ送る */
export async function startAuth({ request, env }) {
  const url = new URL(request.url);
  const p = url.searchParams;
  if (p.get("provider") !== "github") return reply(url.origin, { error: "GitHub 以外には対応していません" });
  // 自分のサイトの管理画面からの呼び出しだけ受け付ける
  if (p.get("site_id") && p.get("site_id") !== url.hostname) return reply(url.origin, { error: "このサイト以外からは使えません" });
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) return reply(url.origin, { error: "ログインの設定（環境変数）がまだです" });

  const requested = (p.get("scope") || "").split(/[\s,]+/).filter(Boolean);
  const scope = requested.length && requested.every((s) => ALLOWED_SCOPES.includes(s)) ? requested.join(",") : "public_repo";

  const state = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const authURL = "https://github.com/login/oauth/authorize?" + new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${url.origin}/callback`,
    scope,
    state,
    allow_signup: "false",
  });
  return new Response(null, {
    status: 302,
    headers: {
      Location: authURL,
      "Cache-Control": "no-store",
      "Set-Cookie": `${COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
}

/** /callback … GitHub から戻ってきたら、本人確認をしてから管理画面に鍵を渡す */
export async function finishAuth({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = (request.headers.get("Cookie") || "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([0-9a-f]{64})`))?.[1];

  if (!code || !state) return reply(url.origin, { error: "GitHub から戻ってくる途中で止まりました。もう一度お試しください" });
  if (!cookieState || cookieState !== state) return reply(url.origin, { error: "不正なアクセスの可能性があるため中止しました。もう一度お試しください" });

  let token;
  try {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/callback`,
      }),
    });
    ({ access_token: token } = await res.json());
  } catch {
    /* 下でまとめて扱う */
  }
  if (!token) return reply(url.origin, { error: "GitHub からログインの許可をもらえませんでした" });

  // 管理画面に入ってよい人かを確認（ALLOWED_GITHUB_USERS に名前がある人だけ）
  const allowed = (env.ALLOWED_GITHUB_USERS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  let login = "";
  try {
    const me = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "nukunukuland-cms-auth" },
    });
    if (me.ok) login = String((await me.json()).login || "").toLowerCase();
  } catch {
    /* 下でまとめて扱う */
  }
  if (!allowed.length || !login || !allowed.includes(login)) {
    // 許可されていない人の鍵は、その場で無効にする
    try {
      await fetch(`https://api.github.com/applications/${env.GITHUB_CLIENT_ID}/token`, {
        method: "DELETE",
        headers: {
          Authorization: "Basic " + btoa(`${env.GITHUB_CLIENT_ID}:${env.GITHUB_CLIENT_SECRET}`),
          Accept: "application/vnd.github+json",
          "User-Agent": "nukunukuland-cms-auth",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: token }),
      });
    } catch {
      /* 無効化に失敗しても、鍵は渡さない */
    }
    return reply(url.origin, { error: "このアカウントには、お知らせを書く権限がありません" });
  }

  return reply(url.origin, { token });
}
