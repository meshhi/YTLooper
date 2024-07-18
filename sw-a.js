console.log("sw-a.js executes")

function convertMsToSeconds(ms) {
    var a = ms.split(':');
    var seconds = (+a[0]) * 60 + (+a[1]);
    return seconds;
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
    console.log(reason);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ms-cast') {
        const startSecond = convertMsToSeconds(message.start);
        const endSecond = convertMsToSeconds(message.end);
        const duration = endSecond - startSecond;
        sendResponse({ startSecond, endSecond, duration })
    }
});