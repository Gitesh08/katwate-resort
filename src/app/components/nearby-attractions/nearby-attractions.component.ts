import { Component } from "@angular/core";

@Component({
  selector: "app-nearby-attractions",
  templateUrl: "./nearby-attractions.component.html",
  styleUrls: ["./nearby-attractions.component.css"],
})
export class NearbyAttractionsComponent {
  attractions = [
    {
      name: "Kelva Beach",
      image: "/assets/images/kelve-beach.JPG",
      distance: "2 min walk",
      description:
        "Beautiful sandy beach with clear waters, perfect for relaxation and sunset views.",
    },
    {
      name: "Shitla Devi Temple",
      image: "/assets/images/shitladevi-temple.jpg",
      distance: "2 min walk",
      description:
        "Historic temple dedicated to Goddess Shitla Devi, a popular pilgrimage site.",
    },
    {
      name: "Kelve Fort",
      image: "/assets/images/kelve-fort.jpg",
      distance: "5 min walk",
      description:
        "Ancient fort with historical significance, offering panoramic views of the Arabian Sea.",
    },
  ];
}
