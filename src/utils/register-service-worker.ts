if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/service-worker.js", { scope: "/" })
            .then((registration) => {
                console.log("[SW] Registered:", registration);

                // Listen for updates
                registration.addEventListener("updatefound", () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener("statechange", () => {
                        if (newWorker.state === "installed") {
                            if (navigator.serviceWorker.controller) {
                                console.log("[SW] New content available");
                                showUpdateSnackbar();
                            }
                        }
                    });
                });

                // Auto check for updates every 1 minute
                setInterval(() => {
                    registration.update();
                }, 60 * 1000);
            })
            .catch((err) => {
                console.error("[SW] Registration failed:", err);
            });
    });

    if (localStorage.getItem("show-updated-message") === "true") {
        localStorage.removeItem("show-updated-message");
        showUpdatedSnackbar();
    }
}

function showUpdateSnackbar() {
    const snackbar = document.createElement("div");
    snackbar.id = "update-snackbar";
    snackbar.className = "snackbar";
    snackbar.innerHTML = `
    <div class="max">New update available!</div>
    <a id="reload-sw" class="inverse-link">Update</a>
  `;
    document.body.appendChild(snackbar);

    document.getElementById("reload-sw")?.addEventListener("click", () => {
        localStorage.setItem("show-updated-message", "true");
        window.location.reload();
    });

    ui("#update-snackbar", -1);
}

function showUpdatedSnackbar() {
    const snackbar = document.createElement("div");
    snackbar.id = "updated-snackbar";
    snackbar.className = "snackbar success active";
    snackbar.innerHTML = `
    <div class="max">Updated Successfully!</div>
  `;
    document.body.appendChild(snackbar);
    setTimeout(() => {
        ui("#updated-snackbar");
    }, 1500);
}
