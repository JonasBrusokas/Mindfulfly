/*
DELAY is set to 6 seconds in this example. Such a short period is chosen to make
the extension's behavior more obvious, but this is not recommended in real life.
Note that in Chrome, alarms cannot be set for less than a minute. In Chrome:

* if you install this extension "unpacked", you'll see a warning
in the console, but the alarm will still go off after 6 seconds
* if you package the extension and install it, then the alarm will go off after
a minute.
*/
var DELAY = 0.1;
var CATGIFS = "https://giphy.com/explore/cat";

/*
Restart alarm for the currently active tab, whenever background.js is run.
*/
// var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
// gettingActiveTab.then((tabs) => {
//   restartAlarm(tabs[0].id);
// });


// 
// Setting up the 'alarm'
// 

const YOUTUBE_TIME_PROP_NAME = "yt_time"
const DELAY_IN_MINUTES = 0.05;
const ALARM_NAME = "every-minute"

browser.alarms.create(ALARM_NAME, {
  delayInMinutes: DELAY_IN_MINUTES,
  periodInMinutes: DELAY_IN_MINUTES
});

async function handleAlarm(alarmInfo) {
  console.log("on alarm: " + alarmInfo.name);

  if (alarmInfo.name === ALARM_NAME) {
    // TODO NOTE: If you call it from a background script or a popup, it will return undefined.
    let currentTab = await browser.tabs.getCurrent()
    console.log(`Period passed! Current tab: ${JSON.stringify(currentTab)}`)

    if (currentTab.url && currentTab.url.includes("youtube.com")) {

      browser.storage.local.get().then( (resultStorageObject) => {
        // TODO: why doesn't this work properly?
        // Nice use of the "null coalescning operator"
        // let localStorageObject = resultStorageObject ?? {[CLICKED_PROP_NAME]: 0} 

        if (resultStorageObject.length) {
          localStorageObject = {}
        } 
        if (!resultStorageObject[YOUTUBE_TIME_PROP_NAME]) {
          localStorageObject[YOUTUBE_TIME_PROP_NAME] = 0;
        } else {
          localStorageObject = resultStorageObject;
        }
        localStorageObject[YOUTUBE_TIME_PROP_NAME] += 1
        browser.storage.local.set(localStorageObject);
      });
    }
  }
}

let currentTab = browser.tabs.getCurrent()
console.log(JSON.stringify(currentTab))
browser.alarms.onAlarm.addListener(handleAlarm);

// 
// 
// 


/*
Restart alarm for the currently active tab, whenever the user navigates.
*/
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // console.log(`UPDATED: tabId: ${tabId}, changeInfo: ${JSON.stringify(changeInfo)}, tab: ${JSON.stringify(tab)}`)

  // TODO: what does this do
  if (!changeInfo.url) {
    return;
  }

  // browser.storage.local.get().then( (resultStorageObject) => {
  //   // TODO: why doesn't this work properly?
  //   // Nice use of the "null coalescning operator"
  //   // let localStorageObject = resultStorageObject ?? {[CLICKED_PROP_NAME]: 0} 

  //   if (resultStorageObject.length) {
  //     localStorageObject = {}
  //   } 
  //   if (!resultStorageObject[YOUTUBE_TIME_PROP_NAME]) {
  //     localStorageObject[YOUTUBE_TIME_PROP_NAME] = 0;
  //   } else {
  //     localStorageObject = resultStorageObject;
  //   }
  //   localStorageObject[YOUTUBE_TIME_PROP_NAME] += 1
  //   browser.storage.local.set(localStorageObject);
  // });

});

/*
Restart alarm for the currently active tab, whenever a new tab becomes active.
*/
browser.tabs.onActivated.addListener((activeInfo) => {
  // console.log(`ACTIVATED: ${JSON.stringify(activeInfo)}`)
  // restartAlarm(activeInfo.tabId);
});

/*
restartAlarm: clear all alarms,
then set a new alarm for the given tab.
*/
function restartAlarm(tabId) {
  browser.pageAction.hide(tabId);
  browser.alarms.clearAll();
  var gettingTab = browser.tabs.get(tabId);
  gettingTab.then((tab) => {
    if (tab.url != CATGIFS) {
      browser.alarms.create("", {delayInMinutes: DELAY});
    }
  });
}

/*
On alarm, show the page action.
*/
browser.alarms.onAlarm.addListener((alarm) => {
  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then((tabs) => {
    browser.pageAction.show(tabs[0].id);
  });
});

/*
On page action click, navigate the corresponding tab to the cat gifs.
*/
browser.pageAction.onClicked.addListener(() => {
  browser.tabs.update({url: CATGIFS});
});
