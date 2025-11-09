import { Component, OnInit, ViewChild } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { GuestService } from "src/app/services/guest.service";
import { StaffService } from "src/app/services/staff.service";
import { GuestTableComponent } from "src/app/components/admin-dashboard/guest-table/guest-table.component";
import { NgForm } from "@angular/forms";
import { ChartConfiguration } from "chart.js";

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.css"],
})
export class AdminDashboardComponent implements OnInit {
  @ViewChild(GuestTableComponent) guestTable!: GuestTableComponent;
  currentDate: string = new Date().toISOString().split("T")[0];
  userInfo = { name: "Unknown", role: "Guest" };
  activeTab: string = "guests";
  showAddStaffModal = false;
  showAddGuestModal = false;
  showGuestPreviewModal = false;
  newStaff = { email: "", name: "", role: "" };
  newGuest = {
    id: "",
    name: "",
    email: "",
    mobile: "",
    roomType: "",
    roomNumber: "",
    numberOfGuests: 1,
    checkIn: "",
    checkOut: "",
    status: "",
    idType: "",
    idNumber: "",
    avatarColor: "",
  };
  previewGuest: any = null;
  summaryMetrics: any = { checkIns: 0, checkOuts: 0, pending: 0 };
  roomAvailability: any = { single: 0, double: 0, suite: 0 };
  calendarDays: any[] = [];
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  sidebarCollapsed: boolean = false;
  minCheckOutDate: string = this.currentDate;

  public barChartOptions: ChartConfiguration["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {},
      y: {
        beginAtZero: true,
        suggestedMax: 10,
      },
    },
    plugins: {
      legend: { display: false },
    },
  };
  public barChartLabels: string[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  public barChartData: ChartConfiguration["data"] = {
    labels: this.barChartLabels,
    datasets: [{ data: [], label: "Bookings", backgroundColor: "#0d6efd" }],
  };

  constructor(
    private authService: AuthService,
    private staffService: StaffService,
    public guestService: GuestService,
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user?.uid) {
        this.authService
          .getAdminData(user.uid)
          .then((data) => {
            if (data) {
              this.userInfo.name = data.name || "Admin";
              this.userInfo.role = data.role || "Guest";
            } else {
              console.warn("⚠️ No user profile found");
            }
          })
          .catch((err) => {
            console.error("🚫 Error fetching profile:", err);
          });
      }
    });
    this.updateDashboard();
  }

  updateDashboard() {
    this.guestService
      .getSummaryMetrics(this.currentDate)
      .subscribe((metrics) => {
        this.summaryMetrics = metrics;
      });
    this.guestService
      .getRoomAvailability(this.currentDate)
      .subscribe((availability) => {
        this.roomAvailability = availability;
      });
    this.generateCalendar();
    this.guestService.getMonthlyBookings(this.currentYear).subscribe((data) => {
      this.barChartData.datasets[0].data = data;
    });
  }

  generateCalendar() {
    this.guestService.getGuests().subscribe((guests) => {
      const firstDay = new Date(
        this.currentYear,
        this.currentMonth,
        1,
      ).getDay();
      const daysInMonth = new Date(
        this.currentYear,
        this.currentMonth + 1,
        0,
      ).getDate();
      this.calendarDays = [];
      for (let i = 0; i < firstDay; i++) {
        this.calendarDays.push({ day: "", booked: false });
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(this.currentYear, this.currentMonth, day)
          .toISOString()
          .split("T")[0];
        const booked = guests.some(
          (g) => g.checkIn <= date && (!g.checkOut || g.checkOut >= date),
        );
        this.calendarDays.push({ day, booked });
      }
    });
  }

  openAddStaffModal() {
    this.newStaff = { email: "", name: "", role: "" };
    this.showAddStaffModal = true;
  }

  closeAddStaffModal() {
    this.showAddStaffModal = false;
  }

  addStaff(form: NgForm) {
    if (form.valid) {
      this.staffService
        .addStaff(this.newStaff)
        .then(() => {
          console.log("✅ Staff added successfully!");
          this.closeAddStaffModal();
        })
        .catch((err) => {
          console.error("❌ Failed to add staff:", err);
        });
    } else {
      console.warn("⚠️ Please fill all fields correctly.");
    }
  }

  openAddGuestModal(guest?: any) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (guest) {
      this.newGuest = { ...guest };
      this.previewGuest = guest;
      this.minCheckOutDate = guest.checkIn || this.currentDate;
    } else {
      this.newGuest = {
        id: "",
        name: "",
        email: "",
        mobile: "",
        roomType: "",
        roomNumber: "",
        numberOfGuests: 1,
        checkIn: today.toISOString().split("T")[0],
        checkOut: tomorrow.toISOString().split("T")[0],
        status: "",
        idType: "",
        idNumber: "",
        avatarColor: this.guestService.getRandomColor(),
      };
      this.minCheckOutDate = this.currentDate;
    }
    this.showAddGuestModal = true;
  }

  closeAddGuestModal() {
    this.showAddGuestModal = false;
  }

  addGuest(form: NgForm) {
    this.guestService
      .addGuest(this.newGuest)
      .then((result) => {
        this.guestTable.showNotification(result.message, "success");
        this.closeAddGuestModal();
        this.updateDashboard();
      })
      .catch((error) => {
        this.guestTable.showNotification(error.message, "error");
      });
  }

  openGuestPreviewModal(guest: any) {
    this.previewGuest = guest;
    this.showGuestPreviewModal = true;
  }

  closeGuestPreviewModal() {
    this.showGuestPreviewModal = false;
    this.previewGuest = null;
  }

  updateCheckOutMin() {
    this.minCheckOutDate = this.newGuest.checkIn || this.currentDate;
    if (
      this.newGuest.checkOut &&
      this.newGuest.checkOut < this.minCheckOutDate
    ) {
      const checkInDate = new Date(this.newGuest.checkIn);
      const nextDay = new Date(checkInDate);
      nextDay.setDate(checkInDate.getDate() + 1);
      this.newGuest.checkOut = nextDay.toISOString().split("T")[0];
    }
  }

  sendReminder(guestId: string) {
    this.guestService.sendReminder(guestId);
  }

  exportGuests() {
    this.guestService.exportToCSV();
  }

  changeMonth(offset: number) {
    this.currentMonth += offset;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
    this.guestService.getMonthlyBookings(this.currentYear).subscribe((data) => {
      this.barChartData.datasets[0].data = data;
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
