/**
 * Копия базового сброса стилей Tailwind (preflight, v3.4) — тот же
 * reset, что живое превью получает через `@tailwind base`.
 *
 * Почему копия, а не `corePlugins: { preflight: true }`: preflight
 * Tailwind читает свой CSS-файл с диска в рантайме
 * (node_modules/tailwindcss/lib/css/preflight.css), а в serverless-
 * функции Vercel этот файл не попадает в бандл — выгрузка падала с
 * "ENOENT ... tailwindcss/lib/css/preflight.css". Строка в коде
 * ничего не читает, поэтому работает везде.
 *
 * Без этого reset в PDF (в отличие от превью) у p/h1–h3 оставались
 * браузерные поля, у ul/li — отступ и маркеры-точки, а у элементов с
 * border-* не было border-style, то есть не рисовались красные
 * линии у цитат и разделители между пунктами.
 *
 * Пропущено намеренно: font-family на html/code (шрифты здесь везде
 * заданы классами font-display/font-body), стили form-элементов и
 * ::placeholder — в печатной странице их нет.
 */
export const PREFLIGHT_CSS = `
*, ::before, ::after {
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: #e5e7eb;
}
::before, ::after { --tw-content: ''; }
html { line-height: 1.5; -webkit-text-size-adjust: 100%; tab-size: 4; }
body { margin: 0; line-height: inherit; }
hr { height: 0; color: inherit; border-top-width: 1px; }
h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
a { color: inherit; text-decoration: inherit; }
b, strong { font-weight: bolder; }
small { font-size: 80%; }
sub, sup { font-size: 75%; line-height: 0; position: relative; vertical-align: baseline; }
sub { bottom: -0.25em; }
sup { top: -0.5em; }
table { text-indent: 0; border-color: inherit; border-collapse: collapse; }
blockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre { margin: 0; }
fieldset { margin: 0; padding: 0; }
legend { padding: 0; }
ol, ul, menu { list-style: none; margin: 0; padding: 0; }
img, svg, video, canvas, audio, iframe, embed, object { display: block; vertical-align: middle; }
img, video { max-width: 100%; height: auto; }
[hidden] { display: none; }
`;
