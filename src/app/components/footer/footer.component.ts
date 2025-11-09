import { Component } from "@angular/core";
@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
})
export class FooterComponent {
  navLinks = [
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
    { name: "Rooms", url: "/rooms" },
    { name: "Amenities", url: "/amenities" },
    { name: "Location", url: "/location" },
    { name: "FAQ", url: "/faq" },
    { name: "Contact", url: "/contact" },
  ];
  socialLinks = [
    {
      icon: "fa-facebook",
      url: "https://www.facebook.com/people/Katwates-Resort/100069341206901/",
    },
    { icon: "fa-instagram", url: "https://instagram.com/katwatesresort" },
    {
      icon: "fa-brands fa-linkedin",
      url: "https://twitter.com/katwatesresort",
    },
  ];
  contactInfo = {
    phone: "+91 7738052224",
    email: "katwate01@gmail.com",
    address:
      "Near Shitla Devi Temple Road, Bokharpada, Kelva Beach Road, Kelva, Palghar, Maharashtra 401404, India",
  };
  currentYear = new Date().getFullYear();
}
