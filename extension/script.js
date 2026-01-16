let STATE = { VOLUME: 0 };
let elementClones = [];
let originalElements = [];
let intervalId;

function volumeChange(e) {
	STATE.VOLUME = e.target.value;
	propagateState();
}

function findInShadows(selector, root = document) {
	const results = [];

	// Collect direct matches in current root
	Array.from(root.querySelectorAll(selector)).forEach((el) => results.push(el));

	// Recurse into shadow roots of children
	Array.from(root.querySelectorAll("*")).forEach((el) => {
		if (el.shadowRoot) {
			results.push(...findInShadows(selector, el.shadowRoot));
		}
	});

	return results;
}

function propagateState() {
	elementClones.forEach((p) => {
		p.value = STATE.VOLUME;
		p.setAttribute("style", `--progress:${STATE.VOLUME * 100}%;`);
	});

	originalElements.forEach((p) => {
		p.value = parseFloat(STATE.VOLUME) ** 2;
		p.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
		p.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
	});
}

function clearStagnantElements() {
	elementClones.forEach((e) => e.remove());
	elementClones = [];
}

function scanForAudio() {
	let audioElements = findInShadows("input[type='range']");

	if (audioElements) {
		clearInterval(intervalId);

		audioElements = audioElements.filter((e) => {
			if (e.getAttribute("aria-label") != "Volume") return false;
			if (
				e.nextElementSibling &&
				e.nextElementSibling.classList.contains("__quad_volume")
			)
				return false;
			if (
				e.previousElementSibling &&
				e.previousElementSibling.classList.contains("__quad_volume")
			)
				return false;
			if (e.classList.contains("__quad_volume")) return;

			return true;
		});

		audioElements.forEach((e) => {
			const clone = e.cloneNode(true);
			elementClones.push(clone);
			originalElements.push(e);

			e.step = 0.001;
			clone.step = 0.001;
			clone.classList.add("__quad_volume");
			clone.style.display = "block";
			e.style.display = "none";

			clone.addEventListener("input", volumeChange);
			e.insertAdjacentElement("beforebegin", clone);
		});

		propagateState();
	}
}

document.addEventListener("click", () => {
	clearInterval(intervalId);
	intervalId = setInterval(scanForAudio, 100);
});

document.addEventListener("resize", () => {
	clearInterval(intervalId);
	intervalId = setInterval(scanForAudio, 100);
});

intervalId = setInterval(scanForAudio, 100);
