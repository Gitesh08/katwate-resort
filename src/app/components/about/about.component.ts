import { Component, type OnInit } from "@angular/core";
@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.css"],
})
export class AboutComponent implements OnInit {
  // Shortened description
  formattedDescription = "";
  isMobile = false;

  ngOnInit() {
    // Check if the viewport is mobile
    this.checkIfMobile();
    window.addEventListener("resize", () => {
      this.checkIfMobile();
    });

    // Add animation effects when scrolling
    this.initScrollAnimations();
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 },
    );

    // Observe elements that should animate when scrolled into view
    setTimeout(() => {
      document
        .querySelectorAll(".animate-fade-in, .animate-slide-up")
        .forEach((el) => {
          observer.observe(el);
        });
    }, 100);
  }
}
