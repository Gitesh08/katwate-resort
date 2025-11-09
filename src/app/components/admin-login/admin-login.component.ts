import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
@Component({
  selector: "app-admin-login",
  templateUrl: "./admin-login.component.html",
  styleUrls: ["./admin-login.component.css"],
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  popupMessage = "";
  popupType: "success" | "error" | "" = "";
  popupTimeout: any;
  // Debounce and Rate Limit
  lastLoginAttemptTime: number = 0;
  loginAttempts: number[] = [];
  loginInProgress = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  showPopup(message: string, type: "success" | "error") {
    this.popupMessage = message;
    this.popupType = type;
    if (this.popupTimeout) clearTimeout(this.popupTimeout);
    this.popupTimeout = setTimeout(() => {
      this.closePopup();
    }, 4000);
  }
  closePopup() {
    this.popupMessage = "";
    this.popupType = "";
  }

  resetForm() {
    this.loginForm.reset();
    this.showPassword = false;
  }

  onSubmit() {
    const now = Date.now();
    // Debounce: ignore if clicked within 1 second
    if (now - this.lastLoginAttemptTime < 1000 || this.loginInProgress) return;
    this.lastLoginAttemptTime = now;
    // Rate limit: allow max 5 attempts in last 5 minutes
    this.loginAttempts = this.loginAttempts.filter(
      (timestamp) => now - timestamp < 5 * 60 * 1000,
    );
    if (this.loginAttempts.length >= 5) {
      this.showPopup("Too many login attempts. Try again later.", "error");
      return;
    }
    this.loginInProgress = true;
    const { email, password } = this.loginForm.value;
    this.authService
      .login(email, password)
      .then(() => {
        this.showPopup("Login successful!", "success");
      })
      .catch((err) => {
        this.loginAttempts.push(now);
        this.showPopup(err.message, "error");
        // Call resetForm when login fails
        this.resetForm();
      })
      .finally(() => {
        this.loginInProgress = false;
      });
  }
  resetPassword() {
    const email = this.loginForm.get("email")?.value;
    if (!email) {
      this.showPopup("Please enter your email to reset password", "error");
      return;
    }
    this.authService
      .resetPassword(email)
      .then(() => {
        this.showPopup("Reset link sent to your email", "success");
      })
      .catch((err) => {
        this.showPopup(err.message, "error");
      });
  }
}
