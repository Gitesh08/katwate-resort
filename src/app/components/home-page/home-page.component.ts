import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-home-page",
  templateUrl: "./home-page.component.html",
  styleUrls: ["./home-page.component.css"],
})
export class HomePageComponent implements OnInit {
  showContactOptions: boolean = false;

  constructor() {}

  ngOnInit(): void {
    console.log("Home Component loaded");
  }

  toggleContactOptions(): void {
    this.showContactOptions = !this.showContactOptions;
  }
}
