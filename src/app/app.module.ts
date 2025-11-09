import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";

// Firebase
import { provideFirebaseApp, initializeApp } from "@angular/fire/app";
import { provideAuth, getAuth } from "@angular/fire/auth";
import { provideFirestore, getFirestore } from "@angular/fire/firestore";
import { environment } from "../../environments/environment";

// Shared pipe
import { SafePipe } from "../../safe-pipe";

// Components
import { HeaderComponent } from "./components/header/header.component";
import { HeroComponent } from "./components/hero/hero.component";
import { AboutComponent } from "./components/about/about.component";
import { VideoSectionComponent } from "./components/video-section/video-section.component";
import { FooterComponent } from "./components/footer/footer.component";
import { BookingFormComponent } from "./components/booking-form/booking-form.component";
import { TariffsComponent } from "./components/tariffs/tariffs.component";
import { NearbyAttractionsComponent } from "./components/nearby-attractions/nearby-attractions.component";
import { LocationComponent } from "./components/location/location.component";
import { FaqSectionComponent } from "./components/faq-section/faq-section.component";
import { ReviewsComponent } from "./components/reviews/reviews.component";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import { HomePageComponent } from "./components/home-page/home-page.component";
import { AdminLoginComponent } from "./components/admin-login/admin-login.component";
import { AdminDashboardComponent } from "./components/admin-dashboard/admin-dashboard.component";
import { GalleryComponent } from "./components/gallery/gallery.component";
import { SidebarComponent } from "./components/admin-dashboard/sidebar/sidebar.component";
import { HeaderBarComponent } from "./components/admin-dashboard/header-bar/header-bar.component";
import { GuestTableComponent } from "./components/admin-dashboard/guest-table/guest-table.component";
import { NotificationPopupComponent } from "./components/notification-popup/notification-popup.component";
import { EventBookingComponent } from "./components/event-booking/event-booking.component";

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    HeroComponent,
    HeaderComponent,
    AboutComponent,
    FaqSectionComponent,
    LocationComponent,
    ReviewsComponent,
    FooterComponent,
    NearbyAttractionsComponent,
    TariffsComponent,
    VideoSectionComponent,
    AdminLoginComponent,
    AdminDashboardComponent,
    BookingFormComponent,
    NotFoundComponent,
    SafePipe,
    GalleryComponent,
    SidebarComponent,
    HeaderBarComponent,
    GuestTableComponent,
    NotificationPopupComponent,
    EventBookingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
