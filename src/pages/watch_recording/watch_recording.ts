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
    <nav class="row no-marign no-padding">
        <h6 class="small bold max" id="dialog-title">${json_data.name}</h6>
        <div class="badge none border">${formatDuration(json_data.videoMediaMetadata.durationMillis)}</div>
    </nav>
    <span style="color: var(--on-surface-variant);" id="created-at">${readableDate} <span style="opacity: 0.7;">(${relative})</span>
    </span>
    <nav class="row top-padding">
        <img id="dialog-profile-picture" src="${json_data.owners[0].photoLink}" class="circle" alt="Profile Picture" />
        <div class="max">
            <h6 class="small bold">${json_data.owners[0].displayName}</h6>
            <a href="mailto:${json_data.owners[0].emailAddress}" class="link" id="dialog-email">${json_data.owners[0].emailAddress}</a>
        </div>
    </nav>
    `;
}

document.addEventListener("DOMContentLoaded", async () => {
    document.body.classList.add("hidden");
    await initializeCoreUI();
    const video = document.getElementById("video-player") as HTMLDivElement;
    const spinner = document.getElementById("loading-spinner") as HTMLProgressElement;
    const videoInfo = document.getElementById("video-info") as HTMLDivElement;

    // use proper url query params
    const id = new URLSearchParams(window.location.search).get("id");
    console.log(id);
    const response = await fetch(`/api/recordings?id=${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        throw new Error(`Failed to save assignment: ${response.statusText}`);
    }else{
        const json = await response.json();
        loadVideoInformation(videoInfo, json);
    }

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
                videoInfo.classList.add('show');
            });
        };

        video.appendChild(wrapper);
    }
    document.body.classList.remove("hidden");
});
