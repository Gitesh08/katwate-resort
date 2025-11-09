import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-hero",
  templateUrl: "./hero.component.html",
  styleUrls: ["./hero.component.css"],
})
export class HeroComponent implements OnInit {
  ngOnInit(): void {
    // Parallax effect
    window.addEventListener("scroll", () => {
      const heroContent = document.querySelector(".hero-content");
      if (heroContent) {
        const scrollPosition = window.scrollY;
        heroContent.setAttribute(
          "style",
          `transform: translateY(${scrollPosition * 0.2}px)`,
        );
      }
    });
  }

  showTariff(): void {
    // Example: Scroll to tariff section
    const tariffSection = document.getElementById("tariffs");
    if (tariffSection) {
      tariffSection.scrollIntoView({ behavior: "smooth" });
    } else {
      console.log(
        "Tariff section not found. Add logic to display tariff component.",
      );
    }
  }
}
