// EXTENSION: variables
// loop statuses
const INCORRECT_PATH = 'Incorrect URL path(go to youtube)';
const LOOP_RUNNING = 'Loop running';
const READY_TO_RUN = 'Ready to run new loop';
const CANT_DEFINE = 'Cant define';
// dom elements
const loopBtn = document.getElementById("loop");
const stopLoopBtn = document.getElementById("stop-loop");
const startInput = document.getElementById("start-time");
const endInput = document.getElementById("end-time");
const extensionStatus = document.getElementById("extension-status");
// interval for schedule injectScript
let intervalId = undefined;

// EXTENSION: scheduled function that calls content script
async function injectScript(startSecond, tab) {
    let injectResult = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: loopVideoSegment,
        args: [startSecond, INCORRECT_PATH, LOOP_RUNNING]
    });
    const { result } = injectResult[0];
    if (result === INCORRECT_PATH) {
        if (intervalId) clearInterval(intervalId);
        extensionStatus.textContent = INCORRECT_PATH;
    } else if (result === LOOP_RUNNING) {
        extensionStatus.textContent = LOOP_RUNNING;
    } else {
        extensionStatus.textContent = CANT_DEFINE;
    }
}

// CONTENT: content-script
function loopVideoSegment(startSecond, INCORRECT_PATH, LOOP_RUNNING) {
    if (!window.location.href.startsWith("https://www.youtube.com/")) {
        console.error('Please go to https://www.youtube.com');
        return INCORRECT_PATH;
    }

    const video = document.querySelector(".html5-main-video");
    video.currentTime = startSecond;

    return LOOP_RUNNING;
}

// EXTENSION: button handlers
loopBtn.addEventListener("click", async () => {
    const { startSecond, endSecond, duration } = await chrome.runtime.sendMessage({ type: 'getSeconds', start: startInput.value, end: endInput.value });
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (intervalId) clearInterval(intervalId);
    await injectScript(startSecond, tab);
    intervalId = setInterval(() => injectScript(startSecond, tab), duration * 1000);
});

stopLoopBtn.addEventListener('click', () => {
    if (intervalId) clearInterval(intervalId);
    extensionStatus.textContent = READY_TO_RUN;
});
