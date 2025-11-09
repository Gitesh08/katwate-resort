import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
  HostListener,
  NgZone,
} from "@angular/core";
import { ModalService } from "src/app/services/modal.service";
import { RoomService } from "src/app/services/room.service";

interface Room {
  id: string;
  name: string;
  images: string[];
  description: string;
  capacity: string;
  dayInclusions: string[];
  nightInclusions: string[];
  currentImageIndex: number;
  expanded: boolean;
  hasACOption: boolean;
  acSelected: boolean;
  timing?: string;
  badge?: string;
  acOptions: {
    [key: string]: {
      dayPrice: number | null;
      nightPrice: number | null;
      capacity?: string;
      personPricing?: Array<{ persons: number; price: number }>;
      extraPerson?: number;
      extraChild?: number;
    };
  };
}

@Component({
  selector: "app-tariffs",
  templateUrl: "./tariffs.component.html",
  styleUrls: ["./tariffs.component.css"],
})
export class TariffsComponent implements AfterViewInit, OnInit {
  @ViewChild("scrollContainer") scrollContainer!: ElementRef;

  activeView = "day";
  currentCardIndex = 0;
  totalVisibleCards = 0;
  maxIndex = 0;
  isModalOpen = false;
  selectedImageUrl: string | null = null;
  selectedImageAlt: string | null = null;
  rooms: Room[] = [];
  specialEvents: string = "";

  constructor(
    private modalService: ModalService,
    private ngZone: NgZone,
    private roomService: RoomService,
  ) {}

  showLeftScroll = false;
  showRightScroll = true;
  autoScrollTimeout: any = null;
  autoScrollInterval = 5000;
  touchStartX = 0;
  touchEndX = 0;

  ngOnInit() {
    this.rooms = this.roomService.getRooms().map((room) => ({
      ...room,
      expanded: false,
      acSelected: room.acSelected || false,
      hasACOption: room.hasACOption || false,
    }));
    this.specialEvents = this.roomService.getSpecialEvents();
    this.calculateVisibleCards();
    this.startAutoScroll();
  }

  ngAfterViewInit() {
    this.checkScrollButtons();
    this.scrollContainer.nativeElement.addEventListener("scroll", () => {
      this.checkScrollButtons();
      this.updateCurrentCardIndex();
    });
    setTimeout(() => {
      this.calculateVisibleCards();
      this.maxIndex = Math.max(
        0,
        this.getVisibleRooms().length - this.totalVisibleCards,
      );
    }, 100);
  }

  @HostListener("window:resize")
  onResize() {
    this.calculateVisibleCards();
    this.checkScrollButtons();
    this.maxIndex = Math.max(
      0,
      this.getVisibleRooms().length - this.totalVisibleCards,
    );
  }

  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.isModalOpen) {
      this.closeImageModal();
    }
  }

  calculateVisibleCards() {
    if (!this.scrollContainer) return;
    const containerWidth = this.scrollContainer.nativeElement.clientWidth;
    const cardWidth = 350;
    this.totalVisibleCards = Math.floor(containerWidth / cardWidth);
  }

  getVisibleRooms() {
    let filteredRooms;
    if (this.activeView === "day") {
      filteredRooms = this.rooms.filter((room) => {
        if (room.hasACOption && room.acOptions) {
          const acOption = room.acSelected
            ? room.acOptions["true"]
            : room.acOptions["false"];
          return acOption.dayPrice !== null;
        }
        return false;
      });
    } else {
      filteredRooms = this.rooms.filter((room) => {
        if (room.hasACOption && room.acOptions) {
          const acOption = room.acSelected
            ? room.acOptions["true"]
            : room.acOptions["false"];
          return acOption.nightPrice !== null;
        }
        return false;
      });
    }
    // Exclude corporate-event from cards
    return filteredRooms.filter((room) => room.id !== "corporate-event");
  }

  toggleView(view: string) {
    this.activeView = view;
    this.currentCardIndex = 0;
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollLeft = 0;
        this.checkScrollButtons();
        this.calculateVisibleCards();
        this.maxIndex = Math.max(
          0,
          this.getVisibleRooms().length - this.totalVisibleCards,
        );
      }
    }, 0);
  }

  nextImage(room: Room, event: Event) {
    event.stopPropagation();
    room.currentImageIndex = (room.currentImageIndex + 1) % room.images.length;
    this.resetAutoScroll();
  }

  prevImage(room: Room, event: Event) {
    event.stopPropagation();
    room.currentImageIndex =
      (room.currentImageIndex - 1 + room.images.length) % room.images.length;
    this.resetAutoScroll();
  }

  setImage(room: Room, index: number, event: Event) {
    event.stopPropagation();
    room.currentImageIndex = index;
    this.resetAutoScroll();
  }

  scrollRight() {
    if (this.currentCardIndex < this.maxIndex) {
      this.currentCardIndex++;
      this.scrollToCard(this.currentCardIndex);
    }
    this.resetAutoScroll();
  }

  scrollLeft() {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.scrollToCard(this.currentCardIndex);
    }
    this.resetAutoScroll();
  }

  scrollToCard(index: number) {
    const container = this.scrollContainer.nativeElement;
    const cardWidth = 350 + 30;
    const scrollPosition = index * cardWidth;
    container.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });
  }

  checkScrollButtons() {
    const container = this.scrollContainer.nativeElement;
    this.showLeftScroll = container.scrollLeft > 10;
    this.showRightScroll =
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10;
  }

  updateCurrentCardIndex() {
    const container = this.scrollContainer.nativeElement;
    const cardWidth = 350 + 30;
    this.currentCardIndex = Math.round(container.scrollLeft / cardWidth);
  }

  startAutoScroll() {
    this.autoScrollTimeout = setInterval(() => {
      if (this.showRightScroll) {
        this.scrollRight();
      } else {
        this.currentCardIndex = 0;
        this.scrollToCard(0);
      }
    }, this.autoScrollInterval);
  }

  resetAutoScroll() {
    if (this.autoScrollTimeout) {
      clearInterval(this.autoScrollTimeout);
      this.startAutoScroll();
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    if (this.autoScrollTimeout) {
      clearInterval(this.autoScrollTimeout);
    }
  }

  onTouchMove(event: TouchEvent) {
    this.touchEndX = event.touches[0].clientX;
  }

  onTouchEnd() {
    const threshold = 100;
    const swipeDistance = this.touchEndX - this.touchStartX;
    if (swipeDistance > threshold) {
      this.scrollLeft();
    } else if (swipeDistance < -threshold) {
      this.scrollRight();
    }
    this.startAutoScroll();
  }

  goToCard(index: number) {
    this.currentCardIndex = index;
    this.scrollToCard(index);
    this.resetAutoScroll();
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

  toggleExpand(room: Room) {
    room.expanded = !room.expanded;
  }

  toggleAC(room: Room, isAC: boolean) {
    room.acSelected = isAC;
  }

  getCurrentPrice(room: Room) {
    if (this.activeView === "day") {
      if (room.id === "corporate-event") {
        return "Contact for Pricing";
      }
      if (room.hasACOption && room.acOptions) {
        const acOption = room.acSelected
          ? room.acOptions["true"]
          : room.acOptions["false"];
        return acOption.dayPrice !== null ? `₹${acOption.dayPrice}` : "N/A";
      }
      return "₹N/A";
    } else {
      if (room.hasACOption && room.acOptions) {
        const acOption = room.acSelected
          ? room.acOptions["true"]
          : room.acOptions["false"];
        return acOption.nightPrice !== null ? `₹${acOption.nightPrice}` : "N/A";
      }
      return "₹N/A";
    }
  }

  getApplicablePricing(room: Room) {
    if (room.hasACOption && room.acOptions) {
      const acOption = room.acSelected
        ? room.acOptions["true"]
        : room.acOptions["false"];
      return acOption.personPricing || [];
    }
    return [];
  }

  getCurrentExtraPerson(room: Room) {
    if (room.hasACOption && room.acOptions) {
      const acOption = room.acSelected
        ? room.acOptions["true"]
        : room.acOptions["false"];
      return acOption.extraPerson;
    }
    return null;
  }

  getCurrentExtraChild(room: Room) {
    if (room.hasACOption && room.acOptions) {
      const acOption = room.acSelected
        ? room.acOptions["true"]
        : room.acOptions["false"];
      return acOption.extraChild;
    }
    return null;
  }

  getCurrentInclusions(room: Room) {
    if (this.activeView === "day") {
      return room.dayInclusions || [];
    } else {
      return room.nightInclusions || [];
    }
  }

  hasExtraPersonCharges(room: Room): boolean {
    if (room.hasACOption && room.acOptions) {
      const acOption = room.acSelected
        ? room.acOptions["true"]
        : room.acOptions["false"];
      return (
        acOption.extraPerson !== undefined || acOption.extraChild !== undefined
      );
    }
    return false;
  }

  openBookingModal(room: Room) {
    if (this.autoScrollTimeout) {
      clearInterval(this.autoScrollTimeout);
    }
    const acOption = room.acSelected
      ? room.acOptions["true"]
      : room.acOptions["false"];
    const isNightPackage = this.activeView === "night";
    const roomData = {
      id: room.id,
      name: room.name,
      packageType: this.activeView,
      roomType: room.id.replace("-pass", "").replace("-package", ""),
      price: isNightPackage ? acOption.nightPrice : acOption.dayPrice,
      acSelected: room.acSelected,
      capacity: room.capacity,
      inclusions: isNightPackage ? room.nightInclusions : room.dayInclusions,
      minPersons: room.capacity.includes("Min")
        ? this.extractMinPersons(room.capacity)
        : null,
      extraPerson: isNightPackage ? this.getCurrentExtraPerson(room) : null,
      extraChild: isNightPackage ? this.getCurrentExtraChild(room) : null,
      personPricing: isNightPackage ? this.getApplicablePricing(room) : [],
      timing: room.timing,
      hasACOption: room.hasACOption,
      acOptions: room.acOptions,
    };
    this.modalService.openBookingModal(roomData);
    setTimeout(() => {
      this.ngZone.run(() => {
        this.startAutoScroll();
      });
    }, 1000);
  }

  openCorporateBooking() {
    const corporateRoom = this.rooms.find(
      (room) => room.id === "corporate-event",
    );
    if (corporateRoom) {
      this.openBookingModal(corporateRoom);
    }
  }

  openImageModal(url: string, alt: string, event: Event) {
    event.stopPropagation();
    this.selectedImageUrl = url;
    this.selectedImageAlt = alt;
    this.isModalOpen = true;
    if (this.autoScrollTimeout) {
      clearInterval(this.autoScrollTimeout);
    }
  }

  closeImageModal() {
    this.isModalOpen = false;
    this.selectedImageUrl = null;
    this.selectedImageAlt = null;
    this.startAutoScroll();
  }

  private extractMinPersons(capacityString: string): number {
    const matches = capacityString.match(/Min\.\s*(\d+)(?:-(\d+))?\s*Persons/i);
    if (matches && matches[1]) {
      return parseInt(matches[1], 10);
    }
    return 1;
  }
}
