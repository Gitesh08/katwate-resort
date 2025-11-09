import { Injectable } from "@angular/core";
import {
  Firestore,
  setDoc,
  doc,
  collection,
  query,
  where,
  CollectionReference,
  DocumentData,
} from "@angular/fire/firestore";
import { collectionData } from "@angular/fire/firestore";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { Auth, createUserWithEmailAndPassword } from "@angular/fire/auth";

interface StaffData {
  email: string;
  name: string;
  role: string;
}

@Injectable({ providedIn: "root" })
export class StaffService {
  private userCollection: CollectionReference<DocumentData>;
  private allowedRoles = ["admin", "receptionist", "manager", "cleaner"];

  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {
    this.userCollection = collection(this.firestore, "users");
  }

  async addStaff(staffData: StaffData): Promise<void> {
    try {
      // Validate required fields
      if (!staffData.email || !staffData.name || !staffData.role) {
        throw new Error("Missing required fields: email, name, role");
      }
      // Validate role
      if (!this.allowedRoles.includes(staffData.role.toLowerCase())) {
        throw new Error(
          `Invalid role. Allowed roles: ${this.allowedRoles.join(", ")}`,
        );
      }
      // Create user in Firebase Auth
      const password = this.generateTempPassword(); // Implement secure password generation
      const cred = await createUserWithEmailAndPassword(
        this.auth,
        staffData.email,
        password,
      );
      // Set user document with UID
      const userDoc = doc(this.firestore, `users/${cred.user.uid}`);
      await setDoc(userDoc, {
        email: staffData.email,
        name: staffData.name,
        role: staffData.role.toLowerCase(),
      });
      console.log("✅ Staff added successfully with UID:", cred.user.uid);
      // TODO: Send password reset email to staff for initial login
      // await sendPasswordResetEmail(this.auth, staffData.email);
    } catch (error) {
      console.error("❌ Error adding staff:", error);
      throw error;
    }
  }

  getStaffByEmail(email: string): Observable<StaffData | null> {
    try {
      const q = query(this.userCollection, where("email", "==", email));
      return collectionData(q, { idField: "id" }).pipe(
        map((data) => {
          console.log("📦 Fetched users by email:", data);
          return data.length > 0 ? (data[0] as StaffData) : null;
        }),
      );
    } catch (error) {
      console.error("❌ Error fetching staff by email:", error);
      throw error;
    }
  }

  private generateTempPassword(): string {
    // Generate a secure temporary password (e.g., 12 characters)
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
