import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent {
  @Input() activeTab: string = "guests";
  @Input() collapsed: boolean = false;
  @Output() tabChange = new EventEmitter<string>();

  navItems = [
    { id: "dashboard", icon: "dashboard", label: "Dashboard" },
    { id: "calendar", icon: "calendar_today", label: "Calendar" },
    { id: "guests", icon: "people", label: "Guests" },
    { id: "services", icon: "room_service", label: "Services" },
    { id: "stats", icon: "bar_chart", label: "Statistics" },
    { id: "settings", icon: "settings", label: "Settings" },
  ];

  setActiveTab(tab: string) {
    this.tabChange.emit(tab);
  }
}
