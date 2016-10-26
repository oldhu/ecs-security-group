var app = require('app');
var BrowserWindow = require('browser-window');
var mainWindow = null;

app.on('window-all-closed', function () {
    app.quit();
});

global.sharedObject = { key : null, region : null, sg : null, cache : {} };

app.on('ready', function () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 900, height: 700});
    mainWindow.loadUrl('file://' + __dirname + '/sg.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});
