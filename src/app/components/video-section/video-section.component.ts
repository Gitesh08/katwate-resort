// video-section.component.ts
import { Component } from "@angular/core";

@Component({
  selector: "app-video-section",
  templateUrl: "./video-section.component.html",
  styleUrls: ["./video-section.component.css"],
})
export class VideoSectionComponent {
  videoUrl =
    "https://www.youtube-nocookie.com/embed/9XqrYOCt9M0?si=OuVNq1F_be2UdMT3";
  videoTitle = "Through Our Guest’s Lens";
  videoDescription =
    "Watch how a guest enjoyed their time at Katwate’s Resort.";
}
