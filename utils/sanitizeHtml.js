import xss from "xss";

const options = {
  whiteList: {
    ...xss.whiteList,
    div: ["class", "style"],
    span: ["class", "style"],
    pre: ["class"],
    code: ["class"],
    img: ["src", "alt", "class", "style"],
    table: ["class", "style"],
    thead: ["class"],
    tbody: ["class"],
    tr: ["class"],
    td: ["class", "colspan", "rowspan"],
    th: ["class", "colspan", "rowspan"],
    iframe: ["src", "title", "allow", "allowfullscreen", "loading"]
  },
  css: false
};

export default function sanitizeHtml(html = "") {
  return xss(html, options);
}
