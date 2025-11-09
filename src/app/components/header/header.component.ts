import { Component, HostListener } from "@angular/core";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent {
  mobileMenuOpen = false;
  isScrolled = false;

  sections = [
    { name: "Home", id: "hero", icon: "fa-home" },
    { name: "About", id: "about", icon: "fa-info-circle" },
    { name: "Tariffs", id: "tariffs", icon: "fa-tag" },
    { name: "Reviews", id: "reviews", icon: "fa-star" },
    { name: "Location", id: "location", icon: "fa-map-marker-alt" },
  ];

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 50;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    document.body.classList.toggle("no-scroll", this.mobileMenuOpen);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}
