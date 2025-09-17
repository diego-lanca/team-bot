export interface Session {
    step: string,
    data: { name?: string },
    updatedAt: FirebaseFirestore.Timestamp
}
