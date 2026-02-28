import Dexie, { type Table } from 'dexie';
import type { User } from '../models';

class UserDatabase extends Dexie {
  users!: Table<User, string>;

  constructor() {
    super('PhoneListDB');
    this.version(1).stores({
      users: 'userPrincipalName, displayName, surname, department'
    });
  }
}

const db = new UserDatabase();

export const userCache = {
  async getAll(): Promise<User[]> {
    return db.users.toArray();
  },
  async putAll(users: User[]): Promise<void> {
    await db.users.clear();
    await db.users.bulkPut(users);
  },
  async clear(): Promise<void> {
    await db.users.clear();
  }
};
