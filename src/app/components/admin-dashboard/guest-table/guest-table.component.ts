import { Component, Output, EventEmitter } from "@angular/core";
import { GuestService } from "src/app/services/guest.service";

@Component({
  selector: "app-guest-table",
  templateUrl: "./guest-table.component.html",
  styleUrls: ["./guest-table.component.css"],
})
export class GuestTableComponent {
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;
  displayItemsTo: number = 0;
  guests: any[] = [];
  showNotificationPopup: boolean = false;
  notificationMessage: string = "";
  notificationType: "success" | "error" = "success";

  constructor(public guestService: GuestService) {
    this.guestService.getGuests().subscribe((guests) => {
      this.guests = guests;
      this.updatePagination();
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.guests.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, Math.max(1, this.totalPages));
    this.displayItemsTo = Math.min(
      this.currentPage * this.itemsPerPage,
      this.guests.length,
    );
  }

  getPaginatedGuests() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.guests.slice(start, end);
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  @Output() viewGuest = new EventEmitter<any>();
  @Output() editGuest = new EventEmitter<any>();
  @Output() sendReminder = new EventEmitter<string>();

  onViewGuest(guest: any) {
    this.viewGuest.emit(guest);
  }

  onEditGuest(guest: any) {
    this.editGuest.emit(guest);
  }

  onSendReminder(guestId: string) {
    this.sendReminder.emit(guestId);
  }

  deleteGuest(guestId: string) {
    this.guestService.deleteGuest(guestId).then(() => {
      this.updatePagination();
    });
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  showNotification(message: string, type: "success" | "error") {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotificationPopup = true;
  }

  closeNotificationPopup() {
    this.showNotificationPopup = false;
    this.notificationMessage = "";
    this.notificationType = "success";
  }
}
