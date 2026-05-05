import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost:3000',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const win = dom.window as any;

Object.assign(globalThis, {
    CustomEvent: win.CustomEvent,
    document: win.document,
    Element: win.Element,
    Event: win.Event,
    getComputedStyle: win.getComputedStyle,
    HTMLAnchorElement: win.HTMLAnchorElement,
    HTMLButtonElement: win.HTMLButtonElement,
    HTMLElement: win.HTMLElement,
    HTMLInputElement: win.HTMLInputElement,
    HTMLOptionElement: win.HTMLOptionElement,
    HTMLSelectElement: win.HTMLSelectElement,
    HTMLTextAreaElement: win.HTMLTextAreaElement,
    MouseEvent: win.MouseEvent,
    MutationObserver: win.MutationObserver,
    Node: win.Node,
    window: win,
});
