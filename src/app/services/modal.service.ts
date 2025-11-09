import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { RoomService } from "./room.service";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  private isBookingModalOpenSubject = new BehaviorSubject<boolean>(false);
  private isEventModalOpenSubject = new BehaviorSubject<boolean>(false);
  private selectedRoomSubject = new BehaviorSubject<any>(null);

  isBookingModalOpen$ = this.isBookingModalOpenSubject.asObservable();
  isEventModalOpen$ = this.isEventModalOpenSubject.asObservable();
  selectedRoom$ = this.selectedRoomSubject.asObservable();

  constructor(private roomService: RoomService) {}

  openBookingModal(roomData?: any) {
    document.body.classList.add("modal-open");
    this.selectedRoomSubject.next(roomData || null);
    this.isBookingModalOpenSubject.next(true);
  }

  closeBookingModal() {
    document.body.classList.remove("modal-open");
    this.isBookingModalOpenSubject.next(false);
  }

  openEventModal() {
    document.body.classList.add("modal-open");
    this.isEventModalOpenSubject.next(true);
  }

  closeEventModal() {
    document.body.classList.remove("modal-open");
    this.isEventModalOpenSubject.next(false);
  }
}
