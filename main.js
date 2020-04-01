const { app, BrowserWindow } = require('electron')
var path = require('path')
const puppeteer = require('puppeteer')
const screencap = require('screencap');
const { record } = require('puppeteer-recorder');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function blank() {
    return true;
}

function createPuppetWindow(url, password, name) {
    (async () => {
        // change this back to being in headless mode after we are finished; keep the app cleaner
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto(url);
    
        // type the password into the textbox and log in
        const passwordbox = await page.$('#inputpasscode');
        await passwordbox.click({clickCount: 3});
        await page.keyboard.type(password);

        const namebox = await page.$('#inputname');
        await namebox.click({clickCount: 3});
        await page.keyboard.type(name);

        const joinbtn = await page.$('#joinBtn');
        await joinbtn.click({clickCount: 3});

        // the page will now redirect, so we wait for the video
        console.log("Waiting for the video");
        await page.waitForSelector('#main-video');
        const videoCanvas = await page.$('#main-video');

        await new Promise(r => setTimeout(r, 5000));

        // remove the annoying dialogue selector that pops up
        await page.evaluate((sel) => {
            var elements = document.querySelectorAll(sel);
            for(var i=0; i< elements.length; i++){
                elements[i].parentNode.removeChild(elements[i]);
            }
        }, '#dialog-join')

        // start recording the screen and audio
        await record({
            browser: browser, // Optional: a puppeteer Browser instance,
            page, // Optional: a puppeteer Page instance,
            output: 'output.webm',
            fps: 24,
            frames: 24 * 5, // 5 seconds at 60 fps,
            prepare: function () {}, // <-- add this line
            render: function () {} // <-- add this line
          });
    })();
}

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true
    },
    //icon: path.join(__dirname, 'assets/icons/png/64x64.png') (uncomment me when we need a favicon)
  })

  // and load the index.html of the app.
  win.loadFile('src/index.html')

  // Open the DevTools (if required)
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    
    // keep it this way for easier debugging; change it back
    // for standard macOS behaviour
    
    //win = null
    app.quit()
  })
  createPuppetWindow('https://success.zoom.us/wc/join/630591375', '998141', 'Harold Virtual')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.