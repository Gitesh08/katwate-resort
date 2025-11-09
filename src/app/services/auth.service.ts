import { Injectable } from "@angular/core";
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
} from "@angular/fire/auth";
import { Firestore, doc, getDoc } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { authState } from "@angular/fire/auth";
import { Observable } from "rxjs";

interface UserData {
  email: string;
  name: string;
  role: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
  ) {}

  private safeSetLocalStorage(key: string, value: any): void {
    if (key && typeof key === "string" && key.trim()) {
      localStorage.setItem(key, value);
    } else {
      console.warn("❌ Invalid localStorage key:", key);
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      console.log("✅ Firebase login successful:", cred.user);

      const userRef = doc(this.firestore, `users/${cred.user.uid}`);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await signOut(this.auth);
        throw new Error("User profile not found in Firestore");
      }

      const data = userDoc.data() as UserData;
      console.log("📄 Firestore user data:", data);

      if (data.role === "admin") {
        this.safeSetLocalStorage("adminLoggedIn", "true");
        this.safeSetLocalStorage("adminName", data.name || "Admin");
        this.safeSetLocalStorage("adminEmail", data.email || email);
        await this.router.navigate(["/admin/dashboard"]);
      } else {
        await signOut(this.auth);
        throw new Error("Access denied: Not an admin");
      }
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        throw new Error("Invalid email or password");
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    // Removed empty key removal
    try {
      await signOut(this.auth);
      await this.router.navigate(["/admin"]);
      console.log("✅ Logged out successfully");
    } catch (error) {
      console.error("❌ Error during logout:", error);
      throw error;
    }
  }

  isLoggedIn(): boolean {
    return localStorage.getItem("adminLoggedIn") === "true";
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email).catch((error) => {
      console.error("❌ Error sending password reset email:", error);
      throw error;
    });
  }

  async getAdminData(uid: string): Promise<UserData | null> {
    try {
      const snap = await getDoc(doc(this.firestore, `users/${uid}`));
      if (snap.exists()) {
        return snap.data() as UserData;
      }
      console.warn("⚠️ User document not found for UID:", uid);
      return null;
    } catch (error) {
      console.error("❌ Error fetching admin data:", error);
      throw error;
    }
  }

  getCurrentUser(): Observable<User | null> {
    return authState(this.auth);
  }
}
