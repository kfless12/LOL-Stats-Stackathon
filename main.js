const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev');   
const { nativeTheme } = require('electron/main');

function createWindow () {
  const win = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }

    
  })
  win.webContents.openDevTools()
    
  let popup =  new BrowserWindow({closable: true, parent: win, modal: true, show: false, frame: false, transparent: true, alwaysOnTop: true, width: 400, height: 200, webPreferences: {
    preload: path.join(__dirname, 'preloadforpopup.js'),
    nodeIntegration: true
  }})
    popup.on('close', function(){ popup=null })
   

    popup.loadFile('./src/getInfo.html')
    popup.once('ready-to-show', ()=>{
        popup.show()
    })


  win.loadFile('./src/index.html')
   
  
   const template = [
       { label: "LOL Stats",
    submenu: [
        {label: 'new summoner', click(){popup.show()}},
        {label: 'current patch information'},
        {label: 'pros', click(){console.log("pros")}},
        {role: 'quit'}
    ]},
       {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },{
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
        ]
      }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

  ipcMain.handle('dark-mode', ()=>{
      nativeTheme.themeSource = 'dark'
  })


  ipcMain.on('getInfo', (event, data)=>{
        win.webContents.send('getSummonerName', data)
      popup.hide()
  })


}



app.whenReady().then(() => {
    createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})