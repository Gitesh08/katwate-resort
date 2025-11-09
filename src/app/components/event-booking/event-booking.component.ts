import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { ModalService } from "src/app/services/modal.service";

@Component({
  selector: "app-event-booking",
  templateUrl: "./event-booking.component.html",
  styleUrls: ["./event-booking.component.css"],
})
export class EventBookingComponent implements OnInit, OnDestroy {
  eventForm!: FormGroup;
  ownerWhatsappNumber = "9172167073";
  private submitSubject = new Subject<void>();
  isSubmitting = false;
  minDate: string;
  showSuccessPopup = false;
  showErrorPopup = false;
  isModalOpen = false;
  showCheckInCalendar = false;
  showCheckOutCalendar = false;
  currentMonth: Date = new Date();

  weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  private modalSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
  ) {
    const today = new Date();
    this.minDate = this.formatDateForInput(today);
  }

  ngOnInit() {
    this.eventForm = this.fb.group({
      eventType: ["", Validators.required],
      checkInDate: ["", Validators.required],
      checkOutDate: [""], // Optional for multi-day events
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.min(0)]],
      specialRequests: [""],
    });

    this.submitSubject.pipe(debounceTime(500)).subscribe(() => {
      this.processSubmit();
    });

    this.modalSubscription = this.modalService.isEventModalOpen$.subscribe(
      (isOpen) => {
        this.isModalOpen = isOpen;
        if (isOpen) {
          document.body.classList.add("modal-open");
          this.currentMonth = new Date();
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          this.eventForm.patchValue({
            checkInDate: this.formatDateForInput(tomorrow),
          });
        } else {
          document.body.classList.remove("modal-open");
        }
      },
    );
  }

  ngOnDestroy() {
    this.modalSubscription.unsubscribe();
    this.submitSubject.complete();
  }

  openEventForm() {
    this.modalService.openEventModal();
  }

  closeForm() {
    this.modalService.closeEventModal();
  }

  getDaysInMonth(year: number, month: number): number[] {
    const days = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(0);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }

  getMonthYearString(): string {
    return this.currentMonth.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }

  navigateMonth(direction: number) {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + direction,
      1,
    );
  }

  isDateSelectable(day: number): boolean {
    if (day === 0) return false;

    const selectedDate = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      day,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate >= today;
  }

  isCheckOutDateSelectable(day: number): boolean {
    if (day === 0) return false;

    const checkInDateValue = this.eventForm.get("checkInDate")?.value;
    if (!checkInDateValue) return false;

    const checkInDate = new Date(checkInDateValue);
    const selectedDate = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      day,
    );

    return selectedDate >= checkInDate;
  }

  isDaySelected(day: number, type: "checkIn" | "checkOut"): boolean {
    if (day === 0) return false;

    const formDate = this.eventForm.get(
      type === "checkIn" ? "checkInDate" : "checkOutDate",
    )?.value;
    if (!formDate) return false;

    const selectedDate = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      day,
    );
    const formattedSelectedDate = this.formatDateForInput(selectedDate);
    return formattedSelectedDate === formDate;
  }

  toggleCalendar(type: "checkIn" | "checkOut") {
    if (type === "checkIn") {
      this.showCheckInCalendar = !this.showCheckInCalendar;
      if (this.showCheckInCalendar) {
        this.showCheckOutCalendar = false;
      }
    } else {
      this.showCheckOutCalendar = !this.showCheckOutCalendar;
      if (this.showCheckOutCalendar) {
        this.showCheckInCalendar = false;
      }
    }
  }

  selectDate(type: "checkIn" | "checkOut", day: number) {
    if (type === "checkIn" && !this.isDateSelectable(day)) return;
    if (type === "checkOut" && !this.isCheckOutDateSelectable(day)) return;

    const selectedDate = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      day,
    );
    const formattedDate = this.formatDateForInput(selectedDate);

    if (type === "checkIn") {
      this.eventForm.get("checkInDate")?.setValue(formattedDate);
      this.showCheckInCalendar = false;

      const checkOutDate = this.eventForm.get("checkOutDate")?.value;
      if (checkOutDate && new Date(checkOutDate) < new Date(formattedDate)) {
        this.eventForm.get("checkOutDate")?.setValue("");
      }
    } else {
      this.eventForm.get("checkOutDate")?.setValue(formattedDate);
      this.showCheckOutCalendar = false;
    }
  }

  formatSelectedDate(type: "checkIn" | "checkOut"): string {
    const dateValue = this.eventForm.get(
      type === "checkIn" ? "checkInDate" : "checkOutDate",
    )?.value;
    if (!dateValue)
      return type === "checkIn"
        ? "Select start date"
        : "Select end date (optional)";

    const date = new Date(dateValue);
    const adjustedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    return adjustedDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  public formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  incrementAdults() {
    const currentValue = this.eventForm.get("adults")!.value;
    this.eventForm.get("adults")!.setValue(currentValue + 1);
  }

  decrementAdults() {
    const currentValue = this.eventForm.get("adults")!.value;
    if (currentValue > 1) {
      this.eventForm.get("adults")!.setValue(currentValue - 1);
    }
  }

  incrementChildren() {
    const currentValue = this.eventForm.get("children")!.value;
    this.eventForm.get("children")!.setValue(currentValue + 1);
  }

  decrementChildren() {
    const currentValue = this.eventForm.get("children")!.value;
    if (currentValue > 0) {
      this.eventForm.get("children")!.setValue(currentValue - 1);
    }
  }

  sendToWhatsApp() {
    this.submitSubject.next();
  }

  processSubmit() {
    if (this.eventForm.invalid) {
      Object.keys(this.eventForm.controls).forEach((key) => {
        this.eventForm.get(key)!.markAsTouched();
      });
      this.showErrorPopup = true;
      return;
    }

    this.isSubmitting = true;
    const formValue = this.eventForm.value;

    let bookingMessage = `New Event Enquiry from Katwate's Resort Website:
* Event Type: ${formValue.eventType.charAt(0).toUpperCase() + formValue.eventType.slice(1)}
* Start Date: ${formValue.checkInDate}`;
    if (formValue.checkOutDate) {
      bookingMessage += `
* End Date: ${formValue.checkOutDate}`;
    }
    bookingMessage += `
* Adults: ${formValue.adults}
* Children: ${formValue.children}
* Price: To be confirmed (inclusive of GST)`;

    if (formValue.specialRequests) {
      bookingMessage += `
* Special Requests: ${formValue.specialRequests}`;
    }

    bookingMessage += `
Thank you for your enquiry. We will confirm availability and pricing shortly.`;

    const encodedMessage = encodeURIComponent(bookingMessage);
    const whatsappUrl = `https://wa.me/${this.ownerWhatsappNumber}?text=${encodedMessage}`;

    this.showSuccessPopup = true;

    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
      this.isSubmitting = false;
      this.resetForm();
      this.closeForm();
    }, 1000);
  }

  resetForm() {
    this.eventForm.reset({
      eventType: "",
      checkInDate: "",
      checkOutDate: "",
      adults: 1,
      children: 0,
      specialRequests: "",
    });
  }

  closePopup() {
    this.showSuccessPopup = false;
    this.showErrorPopup = false;
  }

  handleOverlayClick(event: MouseEvent) {
    if (
      (event.target as HTMLElement).classList.contains("booking-modal-overlay")
    ) {
      this.closeForm();
    }
  }
}
