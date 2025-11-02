import { contextBridge, ipcRenderer } from 'electron'

// Hilfsfunktion zum Text-Ersetzen
window.addEventListener('DOMContentLoaded', async () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron'] as const) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

// Typdefinitionen für DOM-Elemente
function getInputValue(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement | null
  return el ? el.value : ''
}

function getCheckedValue(id: string): boolean {
  const el = document.getElementById(id) as HTMLInputElement | null
  return el ? el.checked : false
}

function setOutput(id: string, text: string) {
  const el = document.getElementById(id)
  if (el) el.innerText = 'Output: ' + text
}

// Expose API ins Renderer-Fenster
contextBridge.exposeInMainWorld('api', {
  path: async (): Promise<void> => {
    const path = getInputValue('dbpath')
    const isuri = getCheckedValue('isuri')
    const autocommit = getCheckedValue('autocommit')
    try {
      const res = await ipcRenderer.invoke('potd', path, isuri, autocommit)
      setOutput('pout', res)
    } catch (error: any) {
      setOutput('pout', error.message ?? String(error))
    }
  },

  equery: async (): Promise<void> => {
    const query = getInputValue('singlequery')
    const values = getInputValue('value')
    try {
      const arr = JSON.parse('[' + values + ']')
      const res = await ipcRenderer.invoke('executeQuery', query, arr[0])
      setOutput('pout1', res)
    } catch (error: any) {
      setOutput('pout1', error.message ?? String(error))
    }
  },

  fetchall: async (): Promise<void> => {
    const query = getInputValue('fetchallquery')
    const values = getInputValue('fetchallvalue')
    try {
      const arr = JSON.parse('[' + values + ']')
      const res = await ipcRenderer.invoke('fetchall', query, arr[0])
      setOutput('poutfa', JSON.stringify(res))
    } catch (error: any) {
      setOutput('poutfa', error.message ?? String(error))
    }
  },

  fetchone: async (): Promise<void> => {
    const query = getInputValue('fetchonequery')
    const values = getInputValue('fetchonevalue')
    try {
      const arr = JSON.parse('[' + values + ']')
      const res = await ipcRenderer.invoke('fetchone', query, arr[0])
      setOutput('poutfo', JSON.stringify(res))
    } catch (error: any) {
      setOutput('poutfo', error.message ?? String(error))
    }
  },

  fetchmany: async (): Promise<void> => {
    const query = getInputValue('fetchmanyquery')
    const values = getInputValue('fetchmanyvalue')
    const size = Number(getInputValue('fetchmanysize'))
    try {
      const arr = JSON.parse('[' + values + ']')
      const res = await ipcRenderer.invoke('fetchmany', query, size, arr[0])
      setOutput('poutfm', JSON.stringify(res))
    } catch (error: any) {
      setOutput('poutfm', error.message ?? String(error))
    }
  },

  mquery: async (): Promise<void> => {
    const query = getInputValue('query')
    const values = getInputValue('values')
    try {
      const arr = JSON.parse('[' + values + ']')
      const res = await ipcRenderer.invoke('executeMany', query, arr[0])
      setOutput('pout2', res)
    } catch (error: any) {
      setOutput('pout2', error.message ?? String(error))
    }
  },

  escript: async (): Promise<void> => {
    const spath = getInputValue('scriptPath')
    try {
      const res = await ipcRenderer.invoke('executeScript', spath)
      setOutput('pout3', res)
    } catch (error: any) {
      setOutput('pout3', error.message ?? String(error))
    }
  },

  load_extension: async (): Promise<void> => {
    const path = getInputValue('extensionPath')
    try {
      const res = await ipcRenderer.invoke('load_extension', path)
      console.log(res)
      setOutput('pout4', res)
    } catch (error: any) {
      setOutput('pout4', error.message ?? String(error))
    }
  },

  backup: async (): Promise<void> => {
    const target = getInputValue('backupPath')
    const pages = getInputValue('pages')
    const name = getInputValue('name')
    const sleep = getInputValue('sleep')
    try {
      const res = await ipcRenderer.invoke('backup', target, pages, name, sleep)
      console.log(res)
      setOutput('pout5', res)
    } catch (error: any) {
      setOutput('pout5', error.message ?? String(error))
    }
  },

  iterdump: async (): Promise<void> => {
    const path = getInputValue('iterdumpPath')
    const filter = getInputValue('iterdumpFilter')
    try {
      const res = await ipcRenderer.invoke('iterdump', path, filter)
      console.log(res)
      setOutput('pout6', res)
    } catch (error: any) {
      setOutput('pout6', error.message ?? String(error))
    }
  }
})

// Typdefinition für window.api im Renderer
declare global {
  interface Window {
    api: {
      path(): Promise<void>
      equery(): Promise<void>
      fetchall(): Promise<void>
      fetchone(): Promise<void>
      fetchmany(): Promise<void>
      mquery(): Promise<void>
      escript(): Promise<void>
      load_extension(): Promise<void>
      backup(): Promise<void>
      iterdump(): Promise<void>
    }
  }
}
