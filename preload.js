const { contextBridge, ipcMain, ipcRenderer } = require("electron");

let saveData = (theme) => {
  let data = { theme };
  console.log(data);
  ipcRenderer.send("saveData", data);
};

let sendConfig = (message) => {
  ipcRenderer.on('sendConfig', message);
}

let openDialog = (method, config) => {
  return ipcRenderer.invoke('dialog', method, config);
}

let generateFile = (options) => {
  ipcRenderer.send("generateFile", options);
}

let bridge = {
  saveData,
  sendConfig,
  openDialog,
  generateFile
};

contextBridge.exposeInMainWorld('bridge', bridge)

window.addEventListener('DOMContentLoaded', () => {

  let x = 1;

});