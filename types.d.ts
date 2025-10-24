// types.d.ts
declare module 'expo-file-system' {
  export interface FileSystemSessionType {
    [key: string]: any;
  }
  
  export const cacheDirectory: string | null;
  export const documentDirectory: string | null;
  
  export enum EncodingType {
    UTF8 = 'utf8',
    Base64 = 'base64'
  }
  
  export function makeDirectoryAsync(dirUri: string, options?: { intermediates: boolean }): Promise<void>;
  export function writeAsStringAsync(fileUri: string, contents: string, options?: { encoding: EncodingType }): Promise<void>;
  export function getInfoAsync(fileUri: string, options?: { md5?: boolean, size?: boolean }): Promise<{ exists: boolean }>;

  export function deleteAsync(arg0: string) {
    throw new Error('Function not implemented.');
  }

  export function moveAsync(arg0: { from: string; to: string; }) {
    throw new Error('Function not implemented.');
  }
}