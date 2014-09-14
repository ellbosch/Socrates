// Execute the inject.js in a tab and call a method,
// passing the result to a callback function.
function injectedMethod (tab, method, callback) {
  chrome.tabs.executeScript(tab.id, { file: 'inject.js' }, function(){
    chrome.tabs.sendMessage(tab.id, { method: method }, callback);
  });
}

function toggleApp (tab) {
  // When we get a result back from the getBgColors
  // method, alert the data
  injectedMethod(tab, 'toggleApp', function (response) {
    alert(response.data);
    return true;
  });
}

// Listeners
chrome.browserAction.onClicked.addListener(toggleApp);

