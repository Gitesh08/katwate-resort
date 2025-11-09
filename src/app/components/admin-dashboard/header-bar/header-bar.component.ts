import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-header-bar",
  templateUrl: "./header-bar.component.html",
  styleUrls: ["./header-bar.component.css"],
})
export class HeaderBarComponent {
  @Input() userInfo: { name: string; role: string } = {
    name: "Unknown",
    role: "Guest",
  };
  @Input() currentDate: string = "";
  @Output() toggleSidebar = new EventEmitter<void>();

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}
