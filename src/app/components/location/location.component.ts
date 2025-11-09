import { Component } from "@angular/core";

@Component({
  selector: "app-location",
  templateUrl: "./location.component.html",
  styleUrls: ["./location.component.css"],
})
export class LocationComponent {
  mapUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5319.013568541845!2d72.72916569853116!3d19.608598641929206!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be70269c5bd33c9%3A0x6eb080e571cd3c50!2sKatwate%20Resort!5e0!3m2!1sen!2sin!4v1743435953487!5m2!1sen!2sin";
  address =
    "Katwate's Resort, Near Shitla Devi Temple Road, Bokharpada, Kelva Beach Road, Kelva, Palghar, Maharashtra 401404, India";

  directions = [
    {
      mode: "car",
      icon: "fa-car",
      title: "By Car",
      description:
        "Approximately 2 hours drive from Mumbai via NH48 and Kelva Beach Road",
    },
    {
      mode: "train",
      icon: "fa-train",
      title: "By Train",
      description:
        "Take a train to Palghar Station, then a 20-minute auto-rickshaw ride to the resort",
    },
    {
      mode: "bus",
      icon: "fa-bus",
      title: "By Bus",
      description:
        "Regular buses from Mumbai to Palghar, followed by a short auto-rickshaw ride",
    },
  ];
}
