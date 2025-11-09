import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface Room {
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

@Injectable({
  providedIn: "root",
})
export class RoomService {
  private rooms: Room[] = [
    {
      id: "day-pass",
      name: "Day Pass",
      images: [
        "/assets/images/resort-lounge.jpg",
        "/assets/images/resort-pool.jpg",
        "/assets/images/resort-lunch-food.jpg",
      ],
      description: "Access to resort facilities without overnight stay",
      capacity: "Per Person (Min. 6-10 Persons)",
      dayInclusions: [
        "Standard Room Access",
        "Morning Breakfast",
        "High Tea",
        "Buffet Lunch (Veg or Non-veg)",
        "Open Garden Access",
        "Swimming Pool Access",
        "Free WiFi",
      ],
      nightInclusions: [],
      currentImageIndex: 0,
      expanded: false,
      hasACOption: true,
      acSelected: false,
      timing: "9:30 AM to 5:00 PM",
      badge: "Popular",
      acOptions: {
        true: {
          dayPrice: 950,
          nightPrice: null,
          capacity: "Per Person (Min. 6 Persons)",
        },
        false: {
          dayPrice: 850,
          nightPrice: null,
          capacity: "Per Person (Min. 10 Persons)",
        },
      },
    },
    {
      id: "standard-room",
      name: "Standard Room",
      images: [
        "/assets/images/tariffs/standard-room-1.jpg",
        "/assets/images/tariffs/standard-room-2.jpg",
        "/assets/images/standard-room-3.jpg",
      ],
      description: "Comfortable accommodation for groups",
      capacity: "5 Adults",
      dayInclusions: [],
      nightInclusions: [
        "Overnight Stay",
        "Morning Breakfast",
        "High Tea",
        "Buffet Lunch",
        "Buffet Dinner (Veg or Non-veg)",
        "Open Garden Access",
        "Swimming Pool Access",
        "Free WiFi",
      ],
      currentImageIndex: 0,
      expanded: false,
      hasACOption: true,
      acSelected: false,
      acOptions: {
        true: {
          dayPrice: null,
          nightPrice: 2200,
          personPricing: [
            { persons: 5, price: 2200 },
            { persons: 4, price: 2400 },
            { persons: 3, price: 2600 },
          ],
        },
        false: {
          dayPrice: null,
          nightPrice: 1900,
          personPricing: [
            { persons: 5, price: 1900 },
            { persons: 4, price: 2000 },
            { persons: 3, price: 2200 },
          ],
        },
      },
    },
    {
      id: "couple-package",
      name: "Couple Package",
      images: [
        "/assets/images/tariffs/deluxe-room-1.jpg",
        "/assets/images/tariffs/deluxe-room-2.jpg",
        "/assets/images/family-suite-3.jpg",
      ],
      description: "Perfect for couples with all meals included",
      capacity: "2 Adults",
      dayInclusions: [],
      nightInclusions: [
        "Overnight Stay",
        "Morning Breakfast",
        "3 Tea or Coffee",
        "Buffet Lunch",
        "Buffet Dinner (Veg or Non-veg)",
        "Open Garden Access",
        "Swimming Pool Access",
      ],
      currentImageIndex: 0,
      expanded: false,
      hasACOption: true,
      acSelected: false,
      badge: "Best Value",
      acOptions: {
        true: {
          dayPrice: null,
          nightPrice: 6000,
          extraPerson: 1800,
          extraChild: 1400,
        },
        false: {
          dayPrice: null,
          nightPrice: 5000,
          extraPerson: 1600,
          extraChild: 1100,
        },
      },
    },
    {
      id: "deluxe-room",
      name: "Deluxe Room",
      images: [
        "/assets/images/tariffs/family-suite-1.jpg",
        "/assets/images/tariffs/deluxe-room-2.jpg",
        "/assets/images/deluxe-room-3.jpg",
      ],
      description: "Spacious room with additional amenities",
      capacity: "10 Adults",
      dayInclusions: [],
      nightInclusions: [
        "Overnight Stay",
        "Morning Breakfast",
        "High Tea",
        "Buffet Lunch",
        "Buffet Dinner (Veg or Non-veg)",
        "Open Garden Access",
        "Swimming Pool Access",
        "Free WiFi",
      ],
      currentImageIndex: 0,
      expanded: false,
      hasACOption: true,
      acSelected: false,
      acOptions: {
        true: {
          dayPrice: null,
          nightPrice: 2300,
        },
        false: {
          dayPrice: null,
          nightPrice: 2000,
        },
      },
    },
    {
      id: "corporate-event",
      name: "Corporate/Other Event",
      images: [
        "/assets/images/tariffs/party-hall-1.jpg",
        "/assets/images/tariffs/party-hall-2.jpg",
      ],
      description:
        "Special arrangement for Wedding, Birthday Party, Corporate Event and other events. (Party Hall 1000sq. ft.)",
      capacity: "Custom (Contact for details)",
      dayInclusions: [
        "Party Hall Access (1000 sq. ft.)",
        "Customizable Catering",
        "Event Planning Support",
        "Open Garden Access",
        "Free WiFi",
      ],
      nightInclusions: [],
      currentImageIndex: 0,
      expanded: false,
      hasACOption: false,
      acSelected: false,
      timing: "Custom (Contact for details)",
      badge: "Special Events",
      acOptions: {
        true: {
          dayPrice: null,
          nightPrice: null,
        },
        false: {
          dayPrice: null,
          nightPrice: null,
        },
      },
    },
  ];

  private specialEvents: string =
    "Special arrangement for Wedding, Birthday Party, Corporate Event and other events. (Party Hall 1000sq. ft.)";

  getRooms() {
    return this.rooms;
  }

  getRoomById(id: string) {
    return this.rooms.find((room) => room.id === id);
  }

  getSpecialEvents() {
    return this.specialEvents;
  }
}
