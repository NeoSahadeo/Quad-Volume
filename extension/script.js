let audioElement;

function volumeChange(e) {
	audioElement.value = parseFloat(e.target.value) ** 2;
	audioElement.dispatchEvent(
		new Event("input", { bubbles: true, composed: true }),
	);
	audioElement.dispatchEvent(
		new Event("change", { bubbles: true, composed: true }),
	);
	e.target.setAttribute("style", `--progress:${e.target.value * 100}%;`);
}

function findInShadows(selector, root = document) {
	return (
		root.querySelector(selector) ||
		Array.from(root.querySelectorAll("*")).reduce(
			(found, el) =>
				found ||
				(el.shadowRoot ? findInShadows(selector, el.shadowRoot) : null),
			null,
		)
	);
}

function scanForAudio() {
	audioElement = findInShadows("input[type='range']");
	if (audioElement) {
		clearInterval(intervalId);
		const elementClone = audioElement.cloneNode(true);
		elementClone.step = 0.01;
		elementClone.id = "QuadraticAudio";
		audioElement.insertAdjacentElement("beforebegin", elementClone);
		audioElement.style.display = "none";
		elementClone.addEventListener("input", volumeChange);
	}
}

const intervalId = setInterval(scanForAudio, 100);
