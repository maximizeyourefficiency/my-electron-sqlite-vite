"use strict";
const electron = require("electron");
window.addEventListener("DOMContentLoaded", async () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };
  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
function getInputValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}
function getCheckedValue(id) {
  const el = document.getElementById(id);
  return el ? el.checked : false;
}
function setOutput(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = "Output: " + text;
}
electron.contextBridge.exposeInMainWorld("api", {
  path: async () => {
    const path = getInputValue("dbpath");
    const isuri = getCheckedValue("isuri");
    const autocommit = getCheckedValue("autocommit");
    try {
      const res = await electron.ipcRenderer.invoke("potd", path, isuri, autocommit);
      setOutput("pout", res);
    } catch (error) {
      setOutput("pout", error.message ?? String(error));
    }
  },
  equery: async () => {
    const query = getInputValue("singlequery");
    const values = getInputValue("value");
    try {
      const arr = JSON.parse("[" + values + "]");
      const res = await electron.ipcRenderer.invoke("executeQuery", query, arr[0]);
      setOutput("pout1", res);
    } catch (error) {
      setOutput("pout1", error.message ?? String(error));
    }
  },
  fetchall: async () => {
    const query = getInputValue("fetchallquery");
    const values = getInputValue("fetchallvalue");
    try {
      const arr = JSON.parse("[" + values + "]");
      const res = await electron.ipcRenderer.invoke("fetchall", query, arr[0]);
      setOutput("poutfa", JSON.stringify(res));
    } catch (error) {
      setOutput("poutfa", error.message ?? String(error));
    }
  },
  fetchone: async () => {
    const query = getInputValue("fetchonequery");
    const values = getInputValue("fetchonevalue");
    try {
      const arr = JSON.parse("[" + values + "]");
      const res = await electron.ipcRenderer.invoke("fetchone", query, arr[0]);
      setOutput("poutfo", JSON.stringify(res));
    } catch (error) {
      setOutput("poutfo", error.message ?? String(error));
    }
  },
  fetchmany: async () => {
    const query = getInputValue("fetchmanyquery");
    const values = getInputValue("fetchmanyvalue");
    const size = Number(getInputValue("fetchmanysize"));
    try {
      const arr = JSON.parse("[" + values + "]");
      const res = await electron.ipcRenderer.invoke("fetchmany", query, size, arr[0]);
      setOutput("poutfm", JSON.stringify(res));
    } catch (error) {
      setOutput("poutfm", error.message ?? String(error));
    }
  },
  mquery: async () => {
    const query = getInputValue("query");
    const values = getInputValue("values");
    try {
      const arr = JSON.parse("[" + values + "]");
      const res = await electron.ipcRenderer.invoke("executeMany", query, arr[0]);
      setOutput("pout2", res);
    } catch (error) {
      setOutput("pout2", error.message ?? String(error));
    }
  },
  escript: async () => {
    const spath = getInputValue("scriptPath");
    try {
      const res = await electron.ipcRenderer.invoke("executeScript", spath);
      setOutput("pout3", res);
    } catch (error) {
      setOutput("pout3", error.message ?? String(error));
    }
  },
  load_extension: async () => {
    const path = getInputValue("extensionPath");
    try {
      const res = await electron.ipcRenderer.invoke("load_extension", path);
      console.log(res);
      setOutput("pout4", res);
    } catch (error) {
      setOutput("pout4", error.message ?? String(error));
    }
  },
  backup: async () => {
    const target = getInputValue("backupPath");
    const pages = getInputValue("pages");
    const name = getInputValue("name");
    const sleep = getInputValue("sleep");
    try {
      const res = await electron.ipcRenderer.invoke("backup", target, pages, name, sleep);
      console.log(res);
      setOutput("pout5", res);
    } catch (error) {
      setOutput("pout5", error.message ?? String(error));
    }
  },
  iterdump: async () => {
    const path = getInputValue("iterdumpPath");
    const filter = getInputValue("iterdumpFilter");
    try {
      const res = await electron.ipcRenderer.invoke("iterdump", path, filter);
      console.log(res);
      setOutput("pout6", res);
    } catch (error) {
      setOutput("pout6", error.message ?? String(error));
    }
  }
});
