const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');

// Set environment
process.env.NODE_ENV = 'production';

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

// Main Window
function createMainWindow(){
    mainWindow = new BrowserWindow({
        title: 'ImageShrink',
        width: isDev ? 1000: 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    // Open DevTools in development mode
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// About Window
function createAboutWindow(){
    const aboutWindow = new BrowserWindow({
        title: 'ImageShrink - About Section',
        width: isDev ? 1000: 500,
        height: 600,
    })
    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// App is ready
app.whenReady().then(() => {
    createMainWindow();
    // Implement custom menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu); 
    // Remove app from memory when closed
    mainWindow.on('closed', () => mainWindow = null);
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

// Menu Template
const menu = [
    // Conditional for MacOS
    ...(isMac ? [{ 
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
     }] : []),
    // Each object is a dropdown
    {
        role: 'fileMenu',

    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }] : [])
];

// IPC Main
ipcMain.on('image:resize', (e, options) => {
    console.log('got')
    options.dest = path.join(os.homedir(), 'imageshrink');
    resizeImage(options);
});

// Image Resizer
async function resizeImage({ imgPath, width, height, dest }){
    try {
        console.log(imgPath, width, height, dest);
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        });
        const filename = path.basename(imgPath);
        // Create destination folder if it doesn't exist
        if (!fs.existsSync(dest)){
            fs.mkdirSync(dest);
        }    
        // Write the new file
        fs.writeFileSync(path.join(dest, filename), newPath);
        // Send success message to renderer
        mainWindow.webContents.send('image:done');
        // Open destination folder
        shell.openPath(dest);
    } catch (error) {
        console.log(error);
    }
}

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
})