import { navigation } from './data';

const routes = new Set([...navigation.map(([id]) => id), 'dashboard']);

export function routeHref(id) {
  return id === 'home' ? '/' : `/${id}`;
}

export function normalizeLocation(browser = window) {
  const legacy = browser.location.hash.match(/^#\/(home|about|services|programmes|scholarships|blog|contact|dashboard)(\?[^#]*)?$/);
  if (legacy) {
    const target = `${routeHref(legacy[1])}${legacy[2] || ''}`;
    browser.history.replaceState(browser.history.state, '', target);
    return target;
  }
  if (browser.location.pathname === '/home') {
    const target = `/${browser.location.search}`;
    browser.history.replaceState(browser.history.state, '', target);
    return target;
  }
  return `${browser.location.pathname}${browser.location.search}`;
}

export function routeFromLocation(browser = window) {
  const path = browser.location.pathname.replace(/^\//, '').replace(/\/$/, '') || 'home';
  const page = routes.has(path) ? path : 'home';
  return {
    key: `${browser.location.pathname}${browser.location.search}`,
    page,
    interest: new URLSearchParams(browser.location.search).get('interest') || '',
  };
}

export function isPageLink(anchor, event, browser = window) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return false;
  const url = new URL(anchor.href, browser.location.href);
  const path = url.pathname.replace(/^\//, '').replace(/\/$/, '') || 'home';
  return url.origin === browser.location.origin && routes.has(path) && !url.hash;
}
