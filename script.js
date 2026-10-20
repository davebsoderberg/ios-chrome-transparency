const track = document.getElementById("track");
const deepEnd = document.getElementById("deepEnd");
const verdict = document.getElementById("verdict");
const subjects = ["topBar", "bottomBar", "topDecoy", "bottomDecoy"].map((id) =>
  document.getElementById(id)
);

const defaults = { gap: "5", width: "100", deep: "no", decoy: "no" };
const state = { ...defaults };

// Every toggle is mirrored into the URL so a reload starts in the chosen
// config — the only reliable way back once the opaque chrome gets stuck.
const paramCodec = {
  gap: {
    param: "gap",
    encode: (v) => v,
    decode: (v) => (["5", "4", "0"].includes(v) ? v : null),
  },
  width: {
    param: "width",
    encode: (v) => v,
    decode: (v) => (["100", "85", "48"].includes(v) ? v : null),
  },
  deep: {
    param: "depth",
    encode: (v) => (v === "yes" ? "4" : "1"),
    decode: (v) => (v === "4" ? "yes" : v === "1" ? "no" : null),
  },
  decoy: {
    param: "decoy",
    encode: (v) => (v === "yes" ? "on" : "off"),
    decode: (v) => (v === "on" ? "yes" : v === "off" ? "no" : null),
  },
};

function readURL() {
  const params = new URLSearchParams(location.search);
  for (const [key, codec] of Object.entries(paramCodec)) {
    const raw = params.get(codec.param);
    if (raw === null) continue;
    const decoded = codec.decode(raw);
    if (decoded !== null) state[key] = decoded;
  }
}

function writeURL() {
  const params = new URLSearchParams();
  for (const [key, codec] of Object.entries(paramCodec)) {
    if (state[key] !== defaults[key]) {
      params.set(codec.param, codec.encode(state[key]));
    }
  }
  const qs = params.toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}

function syncButtons() {
  document.querySelectorAll(".seg").forEach((seg) => {
    const key = seg.dataset.key;
    seg.querySelectorAll("button").forEach((b) =>
      b.classList.toggle("active", b.dataset.val === state[key])
    );
  });
}

document.querySelectorAll(".seg").forEach((seg) => {
  seg.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    state[seg.dataset.key] = btn.dataset.val;
    syncButtons();
    render();
  });
});

function predict() {
  if (state.decoy === "yes")
    return {
      opaque: false,
      why: "the probe hits the tiny decoy chip, which fails the size checks — the real bar behind it shouldn't matter",
    };
  if (Number(state.gap) > 4)
    return {
      opaque: false,
      why: "the probe sits 4px in from the edge; a 5px gap means it lands on the track, which has no sticky ancestor",
    };
  if (state.width === "48")
    return {
      opaque: false,
      why: "the probe is at the edge's horizontal midpoint; a left-aligned 48% bar never covers it",
    };
  if (state.width === "85")
    return {
      opaque: false,
      why: "the probe hits the bar, but 85% is under the 0.9 viewport-width ratio",
    };
  return {
    opaque: true,
    why: "a ≥90%-width sticky bar within 4px of the edge — depth should make no difference",
  };
}

function render() {
  track.style.setProperty("--gap", state.gap + "px");
  track.dataset.width = state.width;
  track.dataset.decoy = state.decoy;

  // Depth toggle: physically re-parent the bars 4 wrappers deep (or back)
  const target = state.deep === "yes" ? deepEnd : track;
  subjects.forEach((el) => {
    if (el.parentElement !== target) target.appendChild(el);
  });

  const p = predict();
  verdict.innerHTML =
    `hypothesis predicts: <b class="${p.opaque ? "bad" : "good"}">` +
    `${p.opaque ? "OPAQUE" : "translucent"} chrome</b><span>${p.why}</span>`;

  writeURL();

  // nudge Safari to re-evaluate the edges without a manual scroll
  window.scrollBy(0, 1);
}

readURL();
syncButtons();
render();
