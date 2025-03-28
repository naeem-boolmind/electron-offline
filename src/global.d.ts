import { ApiRequest } from './main/database';

export {};

declare global {
  interface Window {
    electronAPI: {
      sendData: (params: ApiRequest) => Promise<void>;
      fetchSavedData: () => Promise<ApiRequest[]>;
      onSyncUpdate: (
        callback: (data: { id: number; status: string }) => void,
      ) => void;
    };
  }
}
