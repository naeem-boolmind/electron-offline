import axios from 'axios';
import dns from 'dns';
import { ApiRequest, saveRequest } from '../main/database';

export const checkInternet = () => {
  return new Promise(async (resolve, reject) => {
    dns.lookup('google.com', (err) => {
      if (err && err.code === 'ENOTFOUND') {
        reject('No internet connection');
      } else {
        resolve('Internet is available');
      }
    });
  });
};

export const sendData = async (params: ApiRequest) => {
  return new Promise(async (resolve, reject) => {
    try {
      await checkInternet()
        .then(async (result) => {
          const response = await axios({
            url: params.url,
            method: params.method,
            data: params.payload,
            headers: params.headers as any,
          });
          console.log('API request successful:', response.data);

          resolve(response.data);
        })
        .catch((err) => {
          throw err;
        });
    } catch (error) {
      resolve(
        saveRequest(
          params.url as any,
          params.method as any,
          params.payload as any,
          params.headers as Record<string, any>,
        ),
      );
    }
  });
};
