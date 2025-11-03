import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import path from 'node:path';
import fs from 'fs';
import started from 'electron-squirrel-startup';

// Import sqlite-electron (CommonJS-Modul)
const {
  setdbPath,
  executeQuery,
  executeMany,
  executeScript,
  fetchOne,
  fetchMany,
  fetchAll,
  load_extension,
  backup,
  iterdump
}: {
  setdbPath: (dbPath: string, isuri?: boolean, autocommit?: boolean) => Promise<any>;
  executeQuery: (query: string, value?: any) => Promise<any>;
  executeMany: (query: string, values: any[]) => Promise<any>;
  executeScript: (scriptPath: string) => Promise<any>;
  fetchOne: (query: string, value?: any) => Promise<any>;
  fetchMany: (query: string, size: number, value?: any) => Promise<any>;
  fetchAll: (query: string, value?: any) => Promise<any>;
  load_extension: (path: string) => Promise<any>;
  backup: (target: string, pages: number, name: string, sleep: number) => Promise<any>;
  iterdump: (path: string, filter?: string) => Promise<any>;
} = require('sqlite-electron');

// ---------------------------------------------------------
// 🔧 Logging-System
// ---------------------------------------------------------
const logFile = path.join(app.getPath('userData'), 'db_access.log');

function log(message: string, level: 'INFO' | 'ERROR' = 'INFO') {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${level}] ${message}`;
  console.log(entry);
  fs.appendFileSync(logFile, entry + '\n');
}

// ---------------------------------------------------------
// 🪟 Fenster erstellen
// ---------------------------------------------------------
if (started) app.quit();

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // @ts-ignore – diese Konstanten werden von Vite/Electron-Builder gesetzt
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // @ts-ignore
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    // @ts-ignore
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.openDevTools();
};

// ---------------------------------------------------------
// 🔌 App Events
// ---------------------------------------------------------
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---------------------------------------------------------
// 🧠 IPC Handler mit Logging
// ---------------------------------------------------------

ipcMain.handle('potd', async (_event: IpcMainInvokeEvent, dbPath: string, isuri?: boolean, autocommit?: boolean) => {
  try {
    const result = await setdbPath(dbPath, isuri, autocommit);
    log(`✅ Verbindung zur Datenbank hergestellt: ${dbPath}`);
    return result;
  } catch (error: any) {
    log(`❌ Fehler bei Datenbankverbindung: ${error.message || error}`, 'ERROR');
    return { error: error.toString() };
  }
});

ipcMain.handle('executeQuery', async (_event: IpcMainInvokeEvent, query: string, value?: any) => {
  try {
    const result = await executeQuery(query, value);
    log(`✅ Query erfolgreich ausgeführt: ${query}`);
    return result;
  } catch (error: any) {
    log(`❌ Fehler bei Query: ${query} → ${error.message || error}`, 'ERROR');
    return { error: error.toString() };
  }
});

ipcMain.handle('fetchone', async (_event: IpcMainInvokeEvent, query: string, value?: any) => {
  try {
    const result = await fetchOne(query, value);
    log(`✅ fetchOne erfolgreich: ${query}`);
    return result;
  } catch (error: any) {
    log(`❌ Fehler bei fetchOne: ${query} → ${error.message || error}`, 'ERROR');
    return { error: error.toString() };
  }
});

ipcMain.handle('fetchmany', async (_event: IpcMainInvokeEvent, query: string, size: number, value?: any) => {
  try {
    const result = await fetchMany(query, size, value);
    log(`✅ fetchMany erfolgreich (${size} Zeilen): ${query}`);
    return result;
  } catch (error: any) {
    log(`❌ Fehler bei fetchMany: ${query} → ${error.message || error}`, 'ERROR');
    return { error: error.toString() };
  }
});

ipcMain.handle('fetchall', async (_event: IpcMainInvokeEvent, query: string, value?: any) => {
  try {
    const result = await fetchAll(query, value);
    log(`✅ fetchAll erfolgreich: ${query}`);
    return result;
  } catch (error: any) {
    log(`❌ Fehler bei fetchAll: ${query} → ${error.message || error}`, 'ERROR');
    return { error: error.toString() };
  }
});

ipcMain.handle('executeMany', async (_event: IpcMainInvokeEvent, query: string, values: any[]) => {
  try {
    const result = await executeMany(query, values);
    log(`✅ executeMany erfolgreich: ${query}`);
    return result;
  } catch (error: any) {
    log(`❌ Fehler bei executeMany: ${query} → ${error.message || error}`, 'ERROR');
    return { error: error.toString() };
  }
});

ipcMain.handle('executeScript', async (_event: IpcMainInvokeEvent, scriptPath: string) => {
  try {
    const result = await executeScript(scriptPath);
    log(`✅ Script erfolgreich ausgeführt: ${scriptPath}`);
    return result;
  } catch (error: any) {
    log(`❌ Fehler beim Ausführen des Scripts: ${error.message || error}`, 'ERROR');
    return { error: error.toString() };
  }
});

ipcMain.handle('load_extension', async (_event: IpcMainInvokeEvent, extPath: string) => {
  try {
    const result = await load_extension(extPath);
    log(`✅ SQLite-Erweiterung geladen: ${extPath}`);
    return result;
  } catch (error: any) {
    log(`❌ Fehler beim Laden der Erweiterung: ${error.message || error}`, 'ERROR');
    return { error: error.toString() };
  }
});

ipcMain.handle('backup', async (_event: IpcMainInvokeEvent, target: string, pages: number, name: string, sleep: number) => {
  try {
    const result = await backup(target, Number(pages), name, Number(sleep));
    log(`✅ Backup erfolgreich: ${target}`);
    return result;
  } catch (error: any) {
    log(`❌ Fehler beim Backup: ${error.message || error}`, 'ERROR');
    return { error: error.toString() };
  }
});

ipcMain.handle('iterdump', async (_event: IpcMainInvokeEvent, dumpPath: string, filter?: string) => {
  try {
    const result = await iterdump(dumpPath, filter);
    log(`✅ Dump erfolgreich: ${dumpPath}`);
    return result;
  } catch (error: any) {
    log(`❌ Fehler beim Dump: ${error.message || error}`, 'ERROR');
    return { error: error.toString() };
  }
});
