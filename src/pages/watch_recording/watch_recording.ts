import { initializeCoreUI } from "@utils/ui-core";


export function formatDuration(durationMs: string): string {
    try {
        const totalSeconds = Math.floor(parseInt(durationMs) / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        } else if (minutes > 0) {
            return `${minutes}:${String(seconds).padStart(2, "0")}`;
        } else {
            return `${seconds}s`;
        }
    } catch {
        return "";
    }
}


function loadVideoInformation(videoInfo: HTMLDivElement, json_data: any) {
    const createdDate = new Date(json_data.createdTime);
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    const readableDate = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(createdDate);

    const relative = daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`;

    document.title = json_data.name;

    videoInfo.innerHTML = `
    <nav>
        <h6 class="small bold max" id="dialog-title">${json_data.name}</h6>
        <div class="badge none border">${formatDuration(json_data.videoMediaMetadata.durationMillis)}</div>
    </nav>
    <p style="color: var(--on-surface-variant);" id="created-at">${readableDate} <span style="opacity: 0.7;">(${relative})</span>
    </p>
    <nav class="row top-padding">
        <img id="dialog-profile-picture" src="${json_data.owners[0].photoLink}" class="circle" alt="Profile Picture" />
        <div class="max">
            <h6 class="small bold">${json_data.owners[0].displayName}</h6>
            <a href="mailto:${json_data.owners[0].emailAddress}" class="link" id="dialog-email">${json_data.owners[0].emailAddress}</a>
        </div>
        <button class="circle transparent">
            <i>more_vert</i>
            <menu class="left no-wrap">
                <li id="copy-link-button">
                    <i>content_copy</i>
                    <span>Copy Link</span>
                </li>
                <li id="share-button">
                    <i>share</i>
                    <span>Share</span>
                </li>
            </menu>
        </button>
    </nav>
    `;
}

function load() {

    const id = new URLSearchParams(window.location.search).get("id");

    fetch(`/api/recordings?id=${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to save assignment: ${response.statusText}`);
            }
            return response.json();
        })
        .then(json => {
            const videoInfo = document.getElementById("video-info") as HTMLDivElement;
            loadVideoInformation(videoInfo, json);
            videoInfo.classList.add('show');

            const copyLinkButton = document.getElementById("copy-link-button") as HTMLLIElement;
            const shareButton = document.getElementById("share-button") as HTMLLIElement;

            copyLinkButton.addEventListener("click", () => {
                navigator.clipboard.writeText(window.location.href);
                ui("#copied-snackbar", 1000);
            });

            shareButton.addEventListener("click", () => {
                const shareUrl = window.location.href;
                const shareText = document.title;
                navigator.share({
                    title: shareText,
                    text: shareText,
                    url: shareUrl,
                });
            });
        })
        .catch(error => {
            console.error("Error fetching video data:", error);
        });

    // document.body.classList.add("hidden");

    const video = document.getElementById("video-player") as HTMLDivElement;
    const spinner = document.getElementById("loading-spinner") as HTMLProgressElement;

    if (video && spinner) {
        const iFrame = document.createElement("iframe");
        const wrapper = document.createElement("div");
        wrapper.classList.add("aspect-ratio-16-9");
        wrapper.appendChild(iFrame);
        iFrame.src = `https://drive.google.com/file/d/${id}/preview`;
        iFrame.classList.add("small-round");
        iFrame.setAttribute("allowfullscreen", "");
        iFrame.setAttribute("frameborder", "0");
        iFrame.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
        iFrame.style.width = "100%";
        iFrame.style.height = "100%";
        iFrame.onload = () => {
            spinner.style.display = "none";
            video.style.display = "block";
            requestAnimationFrame(() => {
                video.classList.add('show');
            });
        };

        video.appendChild(wrapper);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // use proper url query params
    initializeCoreUI();
    load();
    // document.body.classList.add("hidden");
});
