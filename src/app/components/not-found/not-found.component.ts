// not-found.component.ts
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";

@Component({
  selector: "app-not-found",
  templateUrl: "./not-found.component.html",
  styleUrls: ["./not-found.component.css"],
  animations: [
    trigger("waveAnimation", [
      state(
        "start",
        style({
          transform: "translateX(-100%)",
        }),
      ),
      state(
        "end",
        style({
          transform: "translateX(100%)",
        }),
      ),
      transition("start => end", [animate("10s ease-in-out")]),
      transition("end => start", [animate("0s")]),
    ]),
    trigger("palmSwayAnimation", [
      state(
        "left",
        style({
          transform: "rotate(-5deg)",
        }),
      ),
      state(
        "right",
        style({
          transform: "rotate(5deg)",
        }),
      ),
      transition("left <=> right", [animate("3s ease-in-out")]),
    ]),
  ],
})
export class NotFoundComponent implements OnInit {
  waveState = "start";
  palmState = "left";
  countdownSeconds = 10;
  redirectTimer: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.animateWaves();
    this.animatePalms();
    this.startRedirectCountdown();
  }

  animateWaves(): void {
    setInterval(() => {
      this.waveState = this.waveState === "start" ? "end" : "start";
    }, 10000);
  }

  animatePalms(): void {
    setInterval(() => {
      this.palmState = this.palmState === "left" ? "right" : "left";
    }, 3000);
  }

  startRedirectCountdown(): void {
    this.redirectTimer = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        clearInterval(this.redirectTimer);
        this.navigateToHome();
      }
    }, 1000);
  }

  navigateToHome(): void {
    this.router.navigate(["/"]);
  }
}
