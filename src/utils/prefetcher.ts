type Href = string;

class Prefetcher {
    private hovered = new Set<Href>();
    private seen = new Set<Href>();
    private io?: IntersectionObserver;

    constructor(private links: HTMLAnchorElement[]) { }

    static fromDocument(): Prefetcher {
        const anchors = Array.from(document.querySelectorAll('a[href^="/"]')) as HTMLAnchorElement[];
        return new Prefetcher(anchors.filter(a => a.origin === location.origin));
    }

    install() {
        this.installSpeculationRules();
        this.installHoverPrefetch();
        this.installViewportPrefetch();
        this.installVisibilityBoost();
    }

    /** Prefer Chromium's Speculation Rules when available */
    private installSpeculationRules() {
        try {
            // Only prefetch (lightweight). You can add {prerender: [...]} for a couple of top routes.
            const urls = this.links
                .map(a => a.pathname + a.search)
                .filter(u => u !== location.pathname)
                .filter((u, i, arr) => arr.indexOf(u) === i);

            if (!('SpeculationRules' in window)) return;

            const el = document.createElement('script');
            el.type = 'speculationrules';
            el.textContent = JSON.stringify({
                prefetch: [{ source: 'list', urls }],
                // prerender: [{ source: 'list', urls: ['/news'] }], // use sparingly
            });
            document.head.appendChild(el);
        } catch { }
    }

    private installHoverPrefetch() {
        const hoverPrefetch = (href: Href) => {
            if (this.hovered.has(href)) return;
            this.hovered.add(href);
            this.prefetch(href);
            this.prefetchCSS(href);
            this.prefetchJS(href);
        };

        this.links.forEach(a => {
            const href = a.getAttribute('href')!;
            if (!href || href === '/' || href === location.pathname) return;

            let t: number | null = null;
            a.addEventListener('pointerenter', () => {
                t = window.setTimeout(() => hoverPrefetch(href), 65); // tiny debounce like instant.page
            }, { passive: true });
            a.addEventListener('pointerleave', () => {
                if (t) { clearTimeout(t); t = null; }
            }, { passive: true });
            a.addEventListener('touchstart', () => hoverPrefetch(href), { passive: true });
        });
    }

    private installViewportPrefetch() {
        if (!('IntersectionObserver' in window)) return;
        this.io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const a = e.target as HTMLAnchorElement;
                const href = a.getAttribute('href')!;
                if (!href || this.seen.has(href)) return;
                this.seen.add(href);
                // Idle prefetch to avoid contention with current work
                ('requestIdleCallback' in window
                    ? (window as any).requestIdleCallback
                    : (cb: Function) => setTimeout(cb, 1)
                )(() => this.prefetch(href));
                this.io?.unobserve(a);
            });
        }, { rootMargin: '200px' });

        this.links.forEach(a => this.io!.observe(a));
    }

    /** If page becomes visible from bfcache/back-forward, fire a silent warmup */
    private installVisibilityBoost() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Preconnect helps subsequent navigations/APIs
                this.preconnect(location.origin);
            }
        });
    }

    private preconnect(origin: string) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        link.crossOrigin = '';
        document.head.appendChild(link);
    }

    private prefetch(href: Href) {
        // <link rel="prefetch"> will warm the cache with low priority
        const l = document.createElement('link');
        l.rel = 'prefetch';
        l.href = href;
        l.as = 'document';
        l.fetchPriority = 'low' as any;
        document.head.appendChild(l);
    }
    private prefetchCSS(href: string) {
        const page = href.split("/").pop();
        if (document.querySelector(`link[href="/public/css/${page}.bundle.css"]`)) return; // already loaded/prefetched
        const l = document.createElement("link");
        l.rel = "prefetch"; // or "preload"
        if (l.rel === "preload") l.as = "style";
        l.href = `/public/css/${page}.bundle.css`;
        document.head.appendChild(l);
    }

    private prefetchJS(href: string) {
        const page = href.split("/").pop();
        if (document.querySelector(`script[src="/public/js/${page}.bundle.js"]`)) return; // already loaded/prefetched
        const script = document.createElement("script");
        script.src = `/public/js/${page}.bundle.js`;
        script.defer = true;
        document.head.appendChild(script);
    }

    /** Optional: pre-warm known bundles for a route */
    modulePreload(url: string) {
        const l = document.createElement('link');
        l.rel = 'modulepreload';
        l.href = url;
        document.head.appendChild(l);
    }
}

export default Prefetcher;
