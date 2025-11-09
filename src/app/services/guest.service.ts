import { Injectable } from "@angular/core";
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class GuestService {
  private totalRooms = { single: 10, double: 8, suite: 2 };
  private guestsCollection = collection(this.firestore, "guests");

  constructor(private firestore: Firestore) {}

  getGuests(): Observable<any[]> {
    return collectionData(this.guestsCollection, { idField: "id" });
  }

  async addGuest(guest: any) {
    try {
      // Validate required fields
      if (!guest.name || !guest.email || !guest.checkIn || !guest.roomType) {
        throw new Error(
          "Missing required guest fields: name, email, checkIn, roomType",
        );
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guest.email)) {
        throw new Error("Invalid email format");
      }

      // Mobile number validation (10-12 digits, allowing international formats)
      const mobileRegex = /^\+?\d{10,12}$/;
      if (guest.mobile && !mobileRegex.test(guest.mobile)) {
        throw new Error("Invalid mobile number. Must be 10-12 digits");
      }

      // Document number validation based on ID type
      if (guest.idType && guest.idNumber) {
        switch (guest.idType.toLowerCase()) {
          case "passport":
            // Passport: 6-9 alphanumeric characters
            const passportRegex = /^[A-Za-z0-9]{6,9}$/;
            if (!passportRegex.test(guest.idNumber)) {
              throw new Error(
                "Invalid passport number. Must be 6-9 alphanumeric characters",
              );
            }
            break;
          case "driver license":
            // Driver's License: 8-16 alphanumeric characters
            const dlRegex = /^[A-Za-z0-9]{8,16}$/;
            if (!dlRegex.test(guest.idNumber)) {
              throw new Error(
                "Invalid driver's license number. Must be 8-16 alphanumeric characters",
              );
            }
            break;
          case "national id":
            // National ID: 8-12 digits
            const nationalIdRegex = /^\d{8,12}$/;
            if (!nationalIdRegex.test(guest.idNumber)) {
              throw new Error(
                "Invalid national ID number. Must be 8-12 digits",
              );
            }
            break;
          default:
            throw new Error("Unsupported ID type");
        }
      } else if (guest.idType || guest.idNumber) {
        throw new Error("Both ID type and ID number must be provided together");
      }

      // Date validations
      const today = new Date().toISOString().split("T")[0];
      if (guest.checkIn < today) {
        throw new Error("Check-in date cannot be in the past");
      }
      if (guest.checkOut && guest.checkOut <= guest.checkIn) {
        throw new Error("Check-out date must be after check-in date");
      }

      // Normalize roomType to title case
      guest.roomType = this.normalizeRoomType(guest.roomType);
      if (!guest.id) {
        guest.avatarColor = this.getRandomColor();
        await addDoc(this.guestsCollection, guest);
        return { success: true, message: "Guest added successfully" };
      } else {
        const guestDoc = doc(this.firestore, `guests/${guest.id}`);
        await updateDoc(guestDoc, guest);
        return { success: true, message: "Guest updated successfully" };
      }
    } catch (error) {
      console.error("❌ Error adding/updating guest:", error);
      throw error;
    }
  }

  async deleteGuest(guestId: string) {
    try {
      const guestDoc = doc(this.firestore, `guests/${guestId}`);
      await deleteDoc(guestDoc);
      console.log("✅ Guest deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting guest:", error);
      throw error;
    }
  }

  getRandomColor() {
    const colors = ["#ffe8cc", "#d1e7dd", "#d3d3d3", "#f5c6cb"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getSummaryMetrics(
    date: string,
  ): Observable<{ checkIns: number; checkOuts: number; pending: number }> {
    const today = date.split("T")[0];
    return this.getGuests().pipe(
      map((guests) => ({
        checkIns: guests.filter(
          (g) => g.checkIn === today && g.status === "Checked In",
        ).length,
        checkOuts: guests.filter(
          (g) => g.checkOut === today && g.status === "Checked Out",
        ).length,
        pending: guests.filter(
          (g) => g.checkIn === today && g.status === "Confirmed",
        ).length,
      })),
    );
  }

  getRoomAvailability(
    date: string,
  ): Observable<{ single: number; double: number; suite: number }> {
    const today = date.split("T")[0];
    return this.getGuests().pipe(
      map((guests) => {
        const bookedRooms = guests
          .filter(
            (g) => g.checkIn <= today && (!g.checkOut || g.checkOut >= today),
          )
          .reduce((acc, g) => {
            const roomType = this.normalizeRoomType(g.roomType).toLowerCase();
            acc[roomType] = (acc[roomType] || 0) + 1;
            return acc;
          }, {} as any);
        return {
          single: this.totalRooms.single - (bookedRooms["single room"] || 0),
          double: this.totalRooms.double - (bookedRooms["double room"] || 0),
          suite: this.totalRooms.suite - (bookedRooms.suite || 0),
        };
      }),
    );
  }

  getMonthlyBookings(year: number): Observable<number[]> {
    return this.getGuests().pipe(
      map((guests) => {
        const months = Array(12).fill(0);
        guests.forEach((guest) => {
          const checkInDate = new Date(guest.checkIn);
          if (checkInDate.getFullYear() === year) {
            months[checkInDate.getMonth()]++;
          }
        });
        return months;
      }),
    );
  }

  exportToCSV() {
    this.getGuests().subscribe({
      next: (guests) => {
        if (guests.length === 0) {
          console.warn("⚠️ No guests to export");
          return;
        }
        const headers = [
          "Booking ID,Name,Email,Mobile,Room Type,Room Number,Guests,Check In,Check Out,Status,ID Type,ID Number",
        ];
        const rows = guests.map(
          (g) =>
            `${g.id},${g.name},${g.email},${g.mobile},${g.roomType},${g.roomNumber},${g.numberOfGuests},${g.checkIn},${g.checkOut || "-"},${g.status},${g.idType || "-"},${g.idNumber || "-"}`,
        );
        const csv = headers.concat(rows).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "guests_export.csv";
        a.click();
        window.URL.revokeObjectURL(url);
        console.log("✅ CSV exported successfully");
      },
      error: (error) => {
        console.error("❌ Error exporting CSV:", error);
      },
    });
  }

  sendReminder(guestId: string) {
    this.getGuests().subscribe({
      next: (guests) => {
        const guest = guests.find((g) => g.id === guestId);
        if (guest && guest.status === "Confirmed") {
          console.log(
            `📩 Sending reminder to ${guest.name} (${guest.email}) for check-in on ${guest.checkIn}`,
          );
          // TODO: Integrate with EmailJS or similar
          /*
          import emailjs from '@emailjs/browser';
          emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
            to_name: guest.name,
            to_email: guest.email,
            check_in: guest.checkIn
          }, 'YOUR_PUBLIC_KEY').then(() => console.log('📩 Reminder sent!'));
          */
        } else {
          console.warn("⚠️ Guest not found or not in Confirmed status");
        }
      },
      error: (error) => {
        console.error("❌ Error sending reminder:", error);
      },
    });
  }

  private normalizeRoomType(roomType: string): string {
    const roomTypeMap: { [key: string]: string } = {
      single: "Single Room",
      double: "Double Room",
      suite: "Suite",
      "single room": "Single Room",
      "double room": "Double Room",
    };
    return roomTypeMap[roomType.toLowerCase()] || roomType;
  }
}
