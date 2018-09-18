const {app, BrowserWindow, globalShortcut, ipcMain} = require('electron')
const { spawn } = require('child_process');
const path = require('path');
let appChannel;

const subprocess = spawn('python', ['src/main.py'], {
  detached: false
  //stdio: 'ignore'
});

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 768,
    height: 337,
    alwaysOnTop: true,
    resizable: false
  })

  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  globalShortcut.register('Control+Space', () => {
    appChannel.sender.send('start');
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('ready', e => {
  appChannel = e;
})

ipcMain.on('exit', e => {
  process.exit(1);
})
