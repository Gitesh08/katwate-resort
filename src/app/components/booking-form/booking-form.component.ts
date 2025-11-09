import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { ModalService } from "src/app/services/modal.service";
import { RoomService } from "src/app/services/room.service";

@Component({
  selector: "app-booking-form",
  templateUrl: "./booking-form.component.html",
  styleUrls: ["./booking-form.component.css"],
})
export class BookingFormComponent implements OnInit, OnDestroy {
  bookingForm!: FormGroup;
  ownerWhatsappNumber = "9172167073";
  private submitSubject = new Subject<void>();
  isSubmitting = false;
  minDate: string;
  showSuccessPopup = false;
  showErrorPopup = false;

  isModalOpen = false;
  selectedRoom: any = null;
  private modalSubscription: Subscription = new Subscription();
  private roomSubscription: Subscription = new Subscription();

  selectedRoomDetails: any = {};
  bookingSummary: any = {};

  packageTypes = [
    { value: "day", label: "Day Package" },
    { value: "night", label: "Night Package" },
  ];

  roomTypes = [
    {
      value: "standard",
      label: "Standard Room",
      forPackages: ["night"],
      roomId: "standard-room",
    },
    {
      value: "deluxe",
      label: "Deluxe Room",
      forPackages: ["night"],
      roomId: "deluxe-room",
    },
    {
      value: "day-pass",
      label: "Day Pass",
      forPackages: ["day"],
      roomId: "day-pass",
    },
    {
      value: "couple-package",
      label: "Couple Package",
      forPackages: ["night"],
      roomId: "couple-package",
    },
  ];

  showCheckInCalendar = false;
  showCheckOutCalendar = false;
  currentMonth: Date = new Date();
  weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private roomService: RoomService,
  ) {
    const today = new Date();
    this.minDate = this.formatDateForInput(today);
  }

  ngOnInit() {
    this.bookingForm = this.fb.group({
      packageType: ["day", Validators.required],
      roomType: ["standard", Validators.required],
      checkInDate: ["", Validators.required],
      checkOutDate: ["", this.conditionalValidator()],
      adultCount: [1, [Validators.required, Validators.min(1)]],
      childCount: [0, [Validators.required, Validators.min(0)]],
      specialRequests: [""],
      acOption: [false],
    });

    this.submitSubject.pipe(debounceTime(500)).subscribe(() => {
      this.processSubmit();
    });

    this.modalSubscription = this.modalService.isBookingModalOpen$.subscribe(
      (isOpen) => {
        this.isModalOpen = isOpen;
        if (isOpen) {
          document.body.classList.add("modal-open");
          this.currentMonth = new Date();
        } else {
          document.body.classList.remove("modal-open");
        }
      },
    );

    this.roomSubscription = this.modalService.selectedRoom$.subscribe(
      (room) => {
        this.selectedRoom = room;
        if (room) {
          this.prePopulateFormWithRoomData(room);
          this.updateSelectedRoomDetails(room);
          this.onPackageTypeChange();
          this.updateBookingSummary();
        }
      },
    );

    this.bookingForm.valueChanges.subscribe(() => {
      this.updateBookingSummary();
    });
  }

  ngOnDestroy() {
    this.modalSubscription.unsubscribe();
    this.roomSubscription.unsubscribe();
    this.submitSubject.complete();
  }

  prePopulateFormWithRoomData(room: any) {
    let packageType = room.packageType || "day";
    let roomType = room.roomType || "standard";

    if (!room.roomType && room.id) {
      const roomOption = this.roomTypes.find((r) => r.roomId === room.id);
      if (roomOption) {
        roomType = roomOption.value;
        packageType = roomOption.forPackages[0];
      }
    }

    this.bookingForm.patchValue({
      packageType: packageType,
      roomType: roomType,
      acOption: room.acSelected || false,
    });

    let minAdults = 1;
    if (room.minPersons) {
      minAdults = room.minPersons;
    } else if (room.capacity) {
      const capacityMatch = room.capacity.match(/(\d+)/);
      if (capacityMatch && capacityMatch[1]) {
        const capacity = parseInt(capacityMatch[1], 10);
        if (room.id === "day-pass") {
          const minMatch = room.capacity.match(/Min\.\s*(\d+)/i);
          minAdults = minMatch && minMatch[1] ? parseInt(minMatch[1], 10) : 6;
        } else if (room.id === "couple-package") {
          minAdults = 2;
        } else {
          minAdults = capacity;
        }
      }
    }

    this.bookingForm.get("adultCount")?.setValue(minAdults);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedTomorrow = this.formatDateForInput(tomorrow);
    this.bookingForm.get("checkInDate")?.setValue(formattedTomorrow);

    if (packageType === "night") {
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      const formattedDayAfterTomorrow =
        this.formatDateForInput(dayAfterTomorrow);
      this.bookingForm.get("checkOutDate")?.setValue(formattedDayAfterTomorrow);
    }
  }

  updateSelectedRoomDetails(room: any) {
    const roomId = this.roomTypes.find(
      (r) => r.value === this.bookingForm.get("roomType")?.value,
    )?.roomId;
    const fullRoom = this.roomService.getRoomById(roomId || room.id);
    if (!fullRoom) return;

    const acSelected =
      this.bookingForm.get("acOption")?.value || room.acSelected || false;
    let price: number | null = null;
    let extraPerson: number | null = null;
    let extraChild: number | null = null;

    if (fullRoom.id === "corporate-event") {
      price = null;
      extraPerson = null;
      extraChild = null;
    } else if (fullRoom.acOptions) {
      const acOption = fullRoom.acOptions[acSelected ? "true" : "false"];
      price =
        this.bookingForm.get("packageType")?.value === "night"
          ? acOption.nightPrice
          : acOption.dayPrice;
      extraPerson = acOption.extraPerson ?? null;
      extraChild = acOption.extraChild ?? null;
    } else {
      price = room.price;
      extraPerson = room.extraPerson ?? null;
      extraChild = room.extraChild ?? null;
    }

    this.selectedRoomDetails = {
      id: fullRoom.id,
      name: fullRoom.name,
      price: price,
      inclusions:
        this.bookingForm.get("packageType")?.value === "night"
          ? fullRoom.nightInclusions
          : fullRoom.dayInclusions,
      extraPerson: extraPerson,
      extraChild: extraChild,
      personPricing:
        (fullRoom.acOptions &&
          fullRoom.acOptions[acSelected ? "true" : "false"]?.personPricing) ||
        [],
      timing: fullRoom.timing,
      capacity: fullRoom.capacity,
      hasACOption: fullRoom.hasACOption,
      acOptions: fullRoom.acOptions,
    };
  }

  conditionalValidator() {
    return (control: any) => {
      if (this.bookingForm && this.isNightPackage() && !control.value) {
        return { required: true };
      }
      return null;
    };
  }

  isNightPackage(): boolean {
    return this.bookingForm?.get("packageType")?.value === "night";
  }

  isEventPackage(): boolean {
    return this.bookingForm?.get("packageType")?.value === "event";
  }

  onPackageTypeChange() {
    const currentRoomType = this.bookingForm.get("roomType")?.value;
    const availableRooms = this.getAvailableRoomTypes();

    const isRoomAvailable = availableRooms.some(
      (room) => room.value === currentRoomType,
    );
    if (!isRoomAvailable && availableRooms.length > 0) {
      this.bookingForm.get("roomType")?.setValue(availableRooms[0].value);
    }

    if (this.isNightPackage()) {
      this.bookingForm.get("checkOutDate")?.setValidators(Validators.required);
      const checkInDate = this.bookingForm.get("checkInDate")?.value;
      if (checkInDate && !this.bookingForm.get("checkOutDate")?.value) {
        const nextDay = new Date(checkInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const formattedNextDay = this.formatDateForInput(nextDay);
        this.bookingForm.get("checkOutDate")?.setValue(formattedNextDay);
      }
    } else {
      this.bookingForm.get("checkOutDate")?.clearValidators();
      this.bookingForm.get("checkOutDate")?.setValue("");
    }

    this.bookingForm.get("checkOutDate")?.updateValueAndValidity();
    this.bookingForm.get("checkInDate")?.updateValueAndValidity();

    this.updateSelectedRoomDetails(this.selectedRoom || {});
    this.updateBookingSummary();
  }

  onRoomTypeChange() {
    this.updateSelectedRoomDetails(this.selectedRoom || {});
    this.onPackageTypeChange();
    this.updateBookingSummary();

    const roomId = this.roomTypes.find(
      (r) => r.value === this.bookingForm.get("roomType")?.value,
    )?.roomId;
    const room = this.roomService.getRoomById(roomId || "");
    if (room) {
      let minAdults = 1;
      if (room.capacity) {
        const capacityMatch = room.capacity.match(/(\d+)/);
        if (capacityMatch && capacityMatch[1]) {
          const capacity = parseInt(capacityMatch[1], 10);
          if (room.id === "day-pass") {
            const minMatch = room.capacity.match(/Min\.\s*(\d+)/i);
            minAdults = minMatch && minMatch[1] ? parseInt(minMatch[1], 10) : 6;
          } else if (room.id === "couple-package") {
            minAdults = 2;
          } else if (room.id !== "corporate-event") {
            minAdults = capacity;
          }
        }
      }
      this.bookingForm.get("adultCount")?.setValue(minAdults);
    }
  }

  getAvailableRoomTypes() {
    const packageType = this.bookingForm?.get("packageType")?.value || "day";
    return this.roomTypes.filter((room) =>
      room.forPackages.includes(packageType),
    );
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

    const checkInDateValue = this.bookingForm.get("checkInDate")?.value;
    if (!checkInDateValue) return false;

    const checkInDate = new Date(checkInDateValue);
    const selectedDate = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      day,
    );

    return selectedDate > checkInDate;
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

    // Create date in local timezone without UTC conversion
    const selectedDate = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      day,
    );
    const formattedDate = this.formatDateForInput(selectedDate);

    if (type === "checkIn") {
      this.bookingForm.get("checkInDate")?.setValue(formattedDate);
      this.showCheckInCalendar = false;

      const checkOutDate = this.bookingForm.get("checkOutDate")?.value;
      if (checkOutDate && new Date(checkOutDate) <= new Date(formattedDate)) {
        if (this.isNightPackage()) {
          const nextDay = new Date(selectedDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const formattedNextDay = this.formatDateForInput(nextDay);
          this.bookingForm.get("checkOutDate")?.setValue(formattedNextDay);
        } else {
          this.bookingForm.get("checkOutDate")?.setValue("");
        }
      }
    } else {
      this.bookingForm.get("checkOutDate")?.setValue(formattedDate);
      this.showCheckOutCalendar = false;
    }

    this.updateBookingSummary();
  }

  private formatDateForInput(date: Date): string {
    // Format date as YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  getMinAdults(): number {
    const roomId = this.roomTypes.find(
      (r) => r.value === this.bookingForm.get("roomType")?.value,
    )?.roomId;
    const room = this.roomService.getRoomById(roomId || "");
    if (!room) return 1;

    if (room.id === "day-pass") {
      const minMatch = room.capacity.match(/Min\.\s*(\d+)/i);
      return minMatch && minMatch[1] ? parseInt(minMatch[1], 10) : 6;
    } else if (room.id === "couple-package") {
      return 2;
    } else if (room.id === "corporate-event") {
      return 0;
    }
    const capacityMatch = room.capacity.match(/(\d+)/);
    return capacityMatch && capacityMatch[1]
      ? parseInt(capacityMatch[1], 10)
      : 1;
  }

  queueCounterAction(type: string, operation: string) {
    if (type === "adult") {
      if (operation === "increment") {
        this.incrementAdults();
      } else {
        this.decrementAdults();
      }
    } else {
      if (operation === "increment") {
        this.incrementChildren();
      } else {
        this.decrementChildren();
      }
    }
  }

  incrementAdults() {
    const currentValue = this.bookingForm.get("adultCount")!.value;
    let maxCapacity = 20;

    if (this.selectedRoomDetails && this.selectedRoomDetails.capacity) {
      const capacityMatch = this.selectedRoomDetails.capacity.match(/(\d+)/);
      if (
        capacityMatch &&
        capacityMatch[1] &&
        this.selectedRoomDetails.id !== "corporate-event"
      ) {
        maxCapacity = parseInt(capacityMatch[1], 10);
      }
    }

    if (currentValue < maxCapacity) {
      this.bookingForm.get("adultCount")!.setValue(currentValue + 1);
    }
  }

  decrementAdults() {
    const currentValue = this.bookingForm.get("adultCount")!.value;
    const minAdults = this.getMinAdults();

    if (currentValue > minAdults) {
      this.bookingForm.get("adultCount")!.setValue(currentValue - 1);
    }
  }

  incrementChildren() {
    const currentValue = this.bookingForm.get("childCount")!.value;
    this.bookingForm.get("childCount")!.setValue(currentValue + 1);
  }

  decrementChildren() {
    const currentValue = this.bookingForm.get("childCount")!.value;
    if (currentValue > 0) {
      this.bookingForm.get("childCount")!.setValue(currentValue - 1);
    }
  }

  sendToWhatsApp() {
    this.submitSubject.next();
  }

  processSubmit() {
    if (this.bookingForm.invalid) {
      Object.keys(this.bookingForm.controls).forEach((key) => {
        this.bookingForm.get(key)!.markAsTouched();
      });
      this.showErrorPopup = true;
      return;
    }

    this.isSubmitting = true;
    const formValue = this.bookingForm.value;
    const packageTypeLabel = this.packageTypes.find(
      (p) => p.value === formValue.packageType,
    )?.label;
    const roomTypeLabel = this.roomTypes.find(
      (r) => r.value === formValue.roomType,
    )?.label;

    let bookingMessage = `New Reservation Request

        Katwate's Resort
        ----------------------------------
        Package Type     : ${packageTypeLabel}
        Room / Package   : ${roomTypeLabel}`;

    if (formValue.packageType === "event") {
      const eventTypeLabel =
        formValue.eventType.charAt(0).toUpperCase() +
        formValue.eventType.slice(1);
      bookingMessage += `
        Event Type       : ${eventTypeLabel}`;
    } else {
      bookingMessage += `
        ${formValue.packageType === "night" ? "Check-in Date" : "Date"} : ${formValue.checkInDate}`;
      if (formValue.packageType === "night") {
        bookingMessage += `
        Check-out Date   : ${formValue.checkOutDate}`;
      }
      bookingMessage += `
        Adults           : ${formValue.adultCount}
        Children         : ${formValue.childCount}
        AC Option        : ${formValue.acOption ? "Yes" : "No"}`;
    }

    if (this.bookingSummary.totalPrice && !this.isEventPackage()) {
      bookingMessage += `
        Estimated Price  : ${this.bookingSummary.totalPrice}`;
    } else {
      bookingMessage += `
        Price            : To be confirmed`;
    }

    if (formValue.specialRequests) {
      bookingMessage += `
        Special Requests : ${formValue.specialRequests}`;
    }

    bookingMessage += `

        ----------------------------------
        Thank you for the reservation request.
        Kindly confirm availability at your earliest convenience.`;

    const encodedMessage = encodeURIComponent(bookingMessage);
    const whatsappUrl = `https://wa.me/${this.ownerWhatsappNumber}?text=${encodedMessage}`;

    this.showSuccessPopup = true;

    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
      this.isSubmitting = false;
      this.resetForm();
      this.closeModal();
    }, 1000);
  }

  resetForm() {
    this.bookingForm.reset({
      packageType: "day",
      roomType: "standard",
      checkInDate: "",
      checkOutDate: "",
      adultCount: 1,
      childCount: 0,
      specialRequests: "",
      acOption: false,
    });
  }

  closePopup() {
    this.showSuccessPopup = false;
    this.showErrorPopup = false;
  }

  formatSelectedDate(type: "checkIn" | "checkOut"): string {
    const dateValue = this.bookingForm.get(
      type === "checkIn" ? "checkInDate" : "checkOutDate",
    )?.value;
    if (!dateValue) return "Select date";

    const date = new Date(dateValue);
    // Adjust for local timezone to prevent day shift
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

  closeModal() {
    this.modalService.closeBookingModal();
  }

  handleOverlayClick(event: MouseEvent) {
    if (
      (event.target as HTMLElement).classList.contains("booking-modal-overlay")
    ) {
      this.closeModal();
    }
  }

  toggleAcOption() {
    const currentValue = this.bookingForm.get("acOption")?.value;
    this.bookingForm.get("acOption")?.setValue(!currentValue);
    this.updateSelectedRoomDetails(this.selectedRoom || {});
    this.updateBookingSummary();
  }

  updateBookingSummary() {
    if (!this.selectedRoomDetails) return;

    const formValue = this.bookingForm.value;
    const isNightPackage = formValue.packageType === "night";
    const adultCount = formValue.adultCount || 1;
    const childCount = formValue.childCount || 0;
    const acOption = formValue.acOption;

    let basePrice: number | null = null;
    let totalPrice: number | null = null;
    let pricePerPerson =
      this.selectedRoomDetails.id !== "corporate-event" &&
      !this.selectedRoomDetails.id.includes("couple");

    if (this.selectedRoomDetails.personPricing?.length > 0) {
      pricePerPerson = true;
    }

    if (this.selectedRoomDetails.price != null) {
      basePrice = parseFloat(
        this.selectedRoomDetails.price.toString().replace("₹", "") || "0",
      );
    }

    if (pricePerPerson && basePrice != null) {
      if (
        isNightPackage &&
        this.selectedRoomDetails.personPricing?.length > 0
      ) {
        const pricingOption = this.selectedRoomDetails.personPricing.find(
          (p: any) => p.persons === adultCount,
        );
        if (pricingOption) {
          const tierPrice = pricingOption.price;
          basePrice = tierPrice;
          totalPrice = tierPrice * adultCount; // Per-person pricing from tier
        } else {
          totalPrice = basePrice * adultCount; // Default per-person pricing
        }
      } else {
        totalPrice = basePrice * adultCount; // Day package or non-tiered pricing
      }
    } else if (basePrice != null) {
      totalPrice = basePrice; // Non-per-person pricing (e.g., couple package)
    }

    let extraPersonCost = 0;
    let extraChildCost = 0;

    if (!pricePerPerson && basePrice != null) {
      const roomCapacity =
        this.extractCapacityNumber(this.selectedRoomDetails.capacity) || 2;

      if (isNightPackage) {
        const extraPersonRate = this.selectedRoomDetails.extraPerson;
        const extraChildRate = this.selectedRoomDetails.extraChild;

        if (adultCount > roomCapacity && extraPersonRate != null) {
          const extraAdults = adultCount - roomCapacity;
          extraPersonCost = extraAdults * extraPersonRate;
          totalPrice = (totalPrice || 0) + extraPersonCost;
        }

        if (childCount > 0 && extraChildRate != null) {
          extraChildCost = childCount * extraChildRate;
          totalPrice = (totalPrice || 0) + extraChildCost;
        }
      }
    }

    let inclusions = isNightPackage
      ? this.selectedRoomDetails.nightInclusions
      : this.selectedRoomDetails.dayInclusions || [];

    this.bookingSummary = {
      roomName: this.selectedRoomDetails.name,
      packageType:
        this.packageTypes.find((p) => p.value === formValue.packageType)
          ?.label || formValue.packageType,
      acOption: this.selectedRoomDetails.hasACOption
        ? formValue.acOption
          ? "AC"
          : "Non-AC"
        : null,
      adults: adultCount,
      children: childCount,
      basePrice:
        basePrice != null
          ? `₹${basePrice}${pricePerPerson ? " per person" : ""}`
          : "N/A",
      extraPersonCost: extraPersonCost > 0 ? `₹${extraPersonCost}` : null,
      extraChildCost: extraChildCost > 0 ? `₹${extraChildCost}` : null,
      totalPrice:
        totalPrice != null ? `₹${totalPrice} (Inclusive of GST)` : "N/A",
      inclusions: inclusions,
      checkInDate: formValue.checkInDate
        ? this.formatDate(formValue.checkInDate)
        : null,
      checkOutDate: formValue.checkOutDate
        ? this.formatDate(formValue.checkOutDate)
        : null,
      timing: this.selectedRoomDetails.timing,
    };
  }

  private extractCapacityNumber(capacityString: string): number | null {
    if (!capacityString) return null;
    const matches = capacityString.match(/(\d+)/);
    if (matches && matches[1]) {
      return parseInt(matches[1], 10);
    }
    return null;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    // Adjust for local timezone to prevent day shift
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

  getInclusionIcon(inclusion: string): string {
    const inclusionLower = inclusion.toLowerCase();
    if (inclusionLower.includes("swimming pool")) {
      return "fas fa-swimming-pool";
    } else if (inclusionLower.includes("breakfast")) {
      return "fas fa-coffee";
    } else if (inclusionLower.includes("lunch")) {
      return "fas fa-utensils";
    } else if (inclusionLower.includes("dinner")) {
      return "fas fa-utensils";
    } else if (
      inclusionLower.includes("tea") ||
      inclusionLower.includes("coffee") ||
      inclusionLower.includes("snacks")
    ) {
      return "fas fa-cookie-bite";
    } else if (
      inclusionLower.includes("room access") ||
      inclusionLower.includes("overnight stay")
    ) {
      return "fas fa-door-open";
    } else if (inclusionLower.includes("games")) {
      return "fas fa-gamepad";
    } else if (inclusionLower.includes("wifi")) {
      return "fas fa-wifi";
    } else if (inclusionLower.includes("parking")) {
      return "fas fa-parking";
    } else if (inclusionLower.includes("garden")) {
      return "fas fa-tree";
    } else if (inclusionLower.includes("spa")) {
      return "fas fa-spa";
    } else if (inclusionLower.includes("gym")) {
      return "fas fa-dumbbell";
    } else if (
      inclusionLower.includes("event") ||
      inclusionLower.includes("party")
    ) {
      return "fas fa-calendar-check";
    } else {
      return "fas fa-check-circle";
    }
  }
}
