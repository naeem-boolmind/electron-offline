// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ApiRequest } from './database';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },

    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

contextBridge.exposeInMainWorld('electronAPI', {
  sendData: (params: ApiRequest) => ipcRenderer.invoke('sendData', params),
  fetchSavedData: () => ipcRenderer.invoke('fetchSavedData'),
  onSyncUpdate: (callback: (data: any) => void) => {
    ipcRenderer.removeAllListeners('api-sync-update');
    ipcRenderer.on('api-sync-update', (_event, data) => callback(data));
  },
});

export type ElectronHandler = typeof electronHandler;

window.addEventListener('offline', (e) => console.log('offline'));
window.addEventListener('online', () =>
  ipcRenderer.invoke('checkNetworkAndProcessRequests'),
);
