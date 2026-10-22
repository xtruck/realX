// Output preview: shows the same picture as the control room, full window, for a second screen or an OBS Window Capture.
// It reads /stream.mjpg and /api/stats with the same cookie as the control room and sends nothing back.
(function () {
  const out = document.getElementById("out");
  const wait = document.getElementById("wait");
  const msg = document.getElementById("msg");
  const badge = document.getElementById("badge");
  let live = false;

  function show(on, text) {
    live = on;
    out.hidden = !on;
    wait.hidden = on;
    if (text) msg.textContent = text;
  }

  out.addEventListener("load", () => show(true));
  out.addEventListener("error", () => show(false, "The live picture stopped. Trying again…"));

  function connect() {
    out.src = "/stream.mjpg?t=" + Date.now();   // a new URL forces a fresh connection
  }

  async function poll() {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const s = await res.json();
      // the label stays on whenever the picture is realX's: only the plain camera ("original" mode) is not labelled
      badge.hidden = !!s.config && s.config.mode === "original";
      const info = s.error_info;
      if (info) show(false, `${info.title}. ${info.hint}`);
      else if (!live && s.frames > 0) connect();
      else if (!live) msg.textContent = "Waiting for the live picture…";
    } catch (e) {
      badge.hidden = false;  // when the mode cannot be read, show the label
      show(false, "Cannot reach realX. Is the control room still running?");
    }
  }

  connect();
  setInterval(poll, 2000);
  poll();
})();
