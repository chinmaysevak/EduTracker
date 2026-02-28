// ============================================
// User Storage Service (IndexedDB)
// ============================================

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

class UserStorageService {
  private dbName = 'EduTrackDB';
  private storeName = 'users';
  private version = 1;

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
          db.createObjectStore(this.storeName).createIndex('email', 'email', { unique: true });
        }
      };
    });
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const db = await this.openDB();
    const user: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.add(user);
      request.onsuccess = () => resolve(user);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('email');
      
      const request = index.get(email);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const getRequest = store.get(userId);
      getRequest.onsuccess = () => {
        const user = getRequest.result;
        if (user) {
          user.lastLogin = new Date().toISOString();
          const updateRequest = store.put(user);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('User not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}

// Fallback to localStorage if IndexedDB fails
class LocalStorageUserStorage {
  private usersKey = 'edutrack_users';

  private getUsers(): User[] {
    const users = localStorage.getItem(this.usersKey);
    return users ? JSON.parse(users) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = this.getUsers();
    
    // Check for duplicate email
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }

    const user: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    users.push(user);
    this.saveUsers(users);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].lastLogin = new Date().toISOString();
      this.saveUsers(users);
    }
  }
}

// Detect storage capability and use appropriate service
export const userStorage = typeof indexedDB !== 'undefined' 
  ? new UserStorageService() 
  : new LocalStorageUserStorage();
