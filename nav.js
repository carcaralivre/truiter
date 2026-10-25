// Lists and Settings in the side nav, in place of the "More" menu (which
// styles.css hides). Each item is a copy of one of X's own nav links, so it
// gets the same layout, hover and collapsed-nav behaviour.

const ITEMS = [
  {
    id: "lists",
    href: user => `/${user}/lists`,
    label: { en: "Lists", pt: "Listas" },
    path: "M3 4.5C3 3.12 4.12 2 5.5 2h13C19.88 2 21 3.12 21 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 22 3 20.88 3 19.5v-15zM5.5 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-13zM16 10H8V8h8v2zm-8 2h8v2H8v-2z",
  },
  {
    id: "settings",
    href: () => "/settings",
    label: { en: "Settings", pt: "Configurações" },
    path: "M10.54 1.75h2.92l1.57 2.36c.11.17.32.25.53.21l2.53-.59 2.17 2.17-.58 2.54c-.05.2.04.41.21.53l2.36 1.57v2.92l-2.36 1.57c-.17.12-.26.33-.21.53l.58 2.54-2.17 2.17-2.53-.59c-.21-.04-.42.04-.53.21l-1.57 2.36h-2.92l-1.58-2.36c-.11-.17-.32-.25-.52-.21l-2.54.59-2.17-2.17.58-2.54c.05-.2-.03-.41-.21-.53l-2.35-1.57v-2.92L4.1 8.97c.18-.12.26-.33.21-.53L3.73 5.9 5.9 3.73l2.54.59c.2.04.41-.04.52-.21l1.58-2.36zm1.07 2l-.98 1.47C10.05 6.08 9 6.5 7.99 6.27l-1.46-.34-.6.6.33 1.46c.24 1.01-.18 2.07-1.05 2.64l-1.46.98v.78l1.46.98c.87.57 1.29 1.63 1.05 2.64l-.33 1.46.6.6 1.46-.34c1.01-.23 2.06.19 2.64 1.05l.98 1.47h.78l.97-1.47c.58-.86 1.63-1.28 2.65-1.05l1.45.34.61-.6-.34-1.46c-.23-1.01.18-2.07 1.05-2.64l1.47-.98v-.78l-1.47-.98c-.87-.57-1.28-1.63-1.05-2.64l.34-1.46-.61-.6-1.45.34c-1.02.23-2.07-.19-2.65-1.05l-.97-1.47h-.78zM12 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zM8.5 12c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5z",
  },
];

const NAV = "header nav";

// X's router (the history object from the app's top-level React props), read
// through the page's own wrapper of the root element, where React keeps it.
function xRouter() {
  try {
    const root = document.getElementById("react-root")?.firstElementChild;
    const raw = root?.wrappedJSObject ?? root;
    if (!raw) return null;
    const key = Object.keys(raw).find(k => k.startsWith("__reactProps"));
    const history = raw[key]?.children?.props?.children?.props?.history;
    return typeof history?.push === "function" ? history : null;
  } catch {
    return null;
  }
}
const MORE = '[data-testid="AppTabBar_More_Menu"]'; // a <button> on current X

function addNavItems() {
  const nav = document.querySelector(NAV);
  const more = nav?.querySelector(MORE);
  if (!nav || !more || nav.querySelector(".truiter-nav")) return;

  const pathOf = a => new URL(a.getAttribute("href") ?? "", location.origin).pathname;
  const profile = nav.querySelector('a[data-testid="AppTabBar_Profile_Link"]');
  const user = profile && pathOf(profile).slice(1);
  if (!user) return;

  // Copy a link that isn't the current page, so the copy doesn't carry the
  // bold "you are here" style or a notification badge.
  const template = [profile, nav.querySelector('a[data-testid="AppTabBar_Home_Link"]')]
    .find(a => a && pathOf(a) !== location.pathname && a.querySelector("svg path"));
  if (!template) return;

  const lang = document.documentElement.lang?.startsWith("pt") ? "pt" : "en";
  for (const item of ITEMS) {
    const a = template.cloneNode(true);
    a.classList.add("truiter-nav");
    a.id = `truiter-nav-${item.id}`;
    a.removeAttribute("data-testid");
    a.removeAttribute("aria-current");
    const href = item.href(user);
    a.href = href;
    a.setAttribute("aria-label", item.label[lang]);

    const svg = a.querySelector("svg");
    svg.replaceChildren();
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", item.path);
    svg.append(path);

    // The label is the deepest span with text; any other spans are badges.
    const spans = [...a.querySelectorAll("span")];
    const label = spans.find(s => s.childElementCount === 0 && s.textContent.trim());
    if (label) label.textContent = item.label[lang];
    for (const s of spans) if (s !== label && !s.contains(label)) s.remove();

    // Navigate inside the app, like X's own links do, instead of reloading.
    a.addEventListener("click", event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const router = xRouter();
      if (!router) return; // plain navigation, with a reload
      event.preventDefault();
      router.push(href);
    });

    more.before(a);
  }
}

addNavItems();
// X re-renders the nav on its own schedule (login, layout changes, navigation).
new MutationObserver(addNavItems).observe(document.documentElement, { childList: true, subtree: true });
