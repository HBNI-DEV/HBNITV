import "beercss";
import '@styles/maintheme.css';
import '@styles/style.css';
import "material-dynamic-colors";

export let savedTheme: string = localStorage.getItem("theme") || "#006a60";
export let savedMode: string = localStorage.getItem("mode") || "auto";

function hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace(/^#/, '');

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return [r, g, b];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h: number = 0;
    let s: number = (max === 0 ? 0 : diff / max);
    let l: number = (max + min) / 2;

    if (diff === 0) {
        h = 0;
    } else {
        switch (max) {
            case r:
                h = (g - b) / diff + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / diff + 2;
                break;
            case b:
                h = (r - g) / diff + 4;
                break;
        }
        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
}

function checkLogos() {
    const [r, g, b] = hexToRgb(savedTheme);
    const [hue, saturation, lightness] = rgbToHsl(r, g, b);
    const hueRotateValue = `${hue}deg`;
    const logos = document.querySelectorAll(".logo") as NodeListOf<HTMLImageElement>;
    logos.forEach(logo => {
        logo.style.filter = `invert(${savedMode === "light" ? "1" : "0"}) hue-rotate(${hueRotateValue})`;
    });

}

export function loadTheme() {
    ui("mode", savedMode);
    ui("theme", savedTheme);

    checkLogos();
}

export function setTheme(color: string) {
    localStorage.setItem("theme", color);
    savedTheme = color;
    ui("theme", color);
}

export function setMode(mode: string) {
    localStorage.setItem("mode", mode);
    savedMode = mode;
    ui("mode", mode);

    checkLogos();
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const newTheme = e.matches ? 'dark' : 'light';
    ui("mode", newTheme);
});

export function triggerThemeTransition(duration = 500) {
    const html = document.documentElement;
    html.classList.add("theme-transition");
    setTimeout(() => {
        html.classList.remove("theme-transition");
    }, duration);
}

export function loadAnimationStyleSheet() {
    const style = document.createElement("style");
    style.id = "theme-transition-style"; // so we can manage it if needed
    style.textContent = `
    html.theme-transition *,
    html.theme-transition dialog {
        transition-property: background-color, color;
        transition-duration: var(--speed3), var(--speed1);
        transition-timing-function: ease-in-out, ease;
        transition-delay: 0s, 0s;
    }
    `;
    document.head.appendChild(style);
}
