// storage.service.ts
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    this._storage = await this.storage.create();
  }

  // Métodos wrapper
  async get(key: string) {
    await this.ensureStorageReady();
    return this._storage?.get(key);
  }

  async set(key: string, value: any) {
    await this.ensureStorageReady();
    return this._storage?.set(key, value);
  }

  private async ensureStorageReady() {
    if (!this._storage) {
      await this.init();
    }
  }
}