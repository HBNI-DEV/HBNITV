type PageInit = () => void;

const pageRegistry = new Map<string, PageInit>();

export function registerPage(name: string, init: PageInit) {
    pageRegistry.set(name, init);
    console.log(pageRegistry);
}


function eligibleLink(a: HTMLAnchorElement) {
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return false;
    if (a.target && a.target !== "_self") return false;
    if (a.hasAttribute("download")) return false;
    return true;
}

async function fetchDocument(url: string): Promise<Document> {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return new DOMParser().parseFromString(html, "text/html");
}

function runPageInit(doc: Document) {
    const nextMain = doc.querySelector("main") as HTMLElement | null;
    const pageName = nextMain?.dataset.page;
    if (!pageName) return;
    const init = pageRegistry.get(pageName);
    if (init) init();
}

async function swapMain(doc: Document) {
    const currMain = document.querySelector("main");
    const nextMain = doc.querySelector("main");
    if (!currMain || !nextMain) return;

    // Copy over the new main’s attrs (including data-page)
    for (const { name, value } of Array.from(nextMain.attributes)) {
        currMain.setAttribute(name, value);
    }
    currMain.innerHTML = nextMain.innerHTML;
    document.dispatchEvent(new Event("DOMContentLoaded"));    // Replace content
}

async function navigate(url: string, push = true) {
    const doSwap = async () => {
        const doc = await fetchDocument(url);

        // Update <title>
        const nextTitle = doc.querySelector("title")?.textContent ?? document.title;

        // Swap <main> content
        await swapMain(doc);

        // Optionally sync anything else that’s page-dependent (footer, etc.)
        // (Rail and header seem shared; you can leave them.)

        document.title = nextTitle;

        // Re-run any global boot (if needed)
        // initializeCoreUI(); // uncomment if you require this after swap

        // Run the registered page initializer
        runPageInit(document);

        if (push) history.pushState(null, "", url);
        // Re-mark active tab
        dispatchEvent(new CustomEvent("softnav:after"));
    };

    // Use View Transitions if available for zero-flash swaps
    // (SAFE: will no-op in Firefox/Safari and we fall back)
    const supportsVT = "startViewTransition" in document;
    if (supportsVT) {
        await (document as any).startViewTransition(doSwap).finished;
    } else {
        // Fade fallback
        document.body.classList.add("softnav-fade-out");
        await doSwap();
        document.body.classList.remove("softnav-fade-out");
    }
}

function onClick(e: MouseEvent) {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const a = (e.target as Element).closest("a") as HTMLAnchorElement | null;
    if (!a || !a.href) return;
    if (!eligibleLink(a)) return;

    const dest = new URL(a.href, location.href);
    if (dest.pathname === location.pathname && dest.search === location.search) return;

    e.preventDefault();
    navigate(dest.pathname + dest.search);
}

function onPopState() {
    navigate(location.pathname + location.search, /*push*/ false);
}

export function installSoftNav() {
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    // Allow nav UI to re-mark active tabs after swaps
    // Your NavigationDialog can listen to this event.
}
