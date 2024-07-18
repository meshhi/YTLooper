const INCORRECT_PATH = 'Incorrect URL path(go to youtube)';
const LOOP_RUNNING = 'Loop running';
const READY_TO_RUN = 'Ready to run loop';
const CANT_DEFINE = 'Cant define';

function invokePopup() {
    // extension code
    const loopBtn = document.getElementById("loop");
    const stopLoopBtn = document.getElementById("stop-loop");

    const startInput = document.getElementById("start-time");
    const endInput = document.getElementById("end-time");

    const extensionStatus = document.getElementById("extension-status");

    let intervalId = undefined;

    loopBtn.addEventListener("click", async () => {
        const { startSecond, endSecond, duration } = await chrome.runtime.sendMessage({ type: 'ms-cast', start: startInput.value, end: endInput.value });
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(async () => {
            let injectResult = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: loopVideoSegment,
                args: [startSecond, INCORRECT_PATH, LOOP_RUNNING]
            });
            debugger
            const { result } = injectResult[0];
            if (result === INCORRECT_PATH) {
                clearInterval(intervalId);
                extensionStatus.textContent = INCORRECT_PATH;
            } else if (result === LOOP_RUNNING) {
                extensionStatus.textContent = LOOP_RUNNING;
            } else {
                extensionStatus.textContent = CANT_DEFINE;
            }
        }, duration * 1000);
    });

    stopLoopBtn.addEventListener('click', () => {
        if (intervalId) clearInterval(intervalId);
        extensionStatus.textContent = READY_TO_RUN;
    });

    function loopVideoSegment(startSecond, INCORRECT_PATH, LOOP_RUNNING) {
        if (!window.location.href.startsWith("https://www.youtube.com/")) {
            console.error('Please go to https://www.youtube.com');
            return INCORRECT_PATH;
        }

        const video = document.querySelector(".html5-main-video");
        video.currentTime = startSecond;

        return LOOP_RUNNING;
    }
}
invokePopup();

