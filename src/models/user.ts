export interface User {
  name?: string,
  phone: string,
  createdAt: FirebaseFirestore.Timestamp,
  lastSeen?: FirebaseFirestore.Timestamp
}

export interface UserDoc extends User {
  id: string;
}
