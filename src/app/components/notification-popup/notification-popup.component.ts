import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-notification-popup",
  templateUrl: "./notification-popup.component.html",
  styleUrls: ["./notification-popup.component.css"],
})
export class NotificationPopupComponent {
  @Input() message: string = "";
  @Input() type: "success" | "error" = "success";
  @Input() isVisible: boolean = false;
  @Output() closed = new EventEmitter<void>();

  close() {
    this.isVisible = false;
    this.closed.emit();
  }
}
