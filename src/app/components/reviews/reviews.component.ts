import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-reviews",
  templateUrl: "./reviews.component.html",
  styleUrls: ["./reviews.component.css"],
})
export class ReviewsComponent implements OnInit {
  reviews = [
    {
      id: 1,
      name: "Priya Sharma",
      avatar: "/assets/images/avatar-1.jpg",
      rating: 5,
      date: "March 15, 2023",
      text: "Absolutely loved our stay at Katwate's Resort! The proximity to Kelva Beach was perfect for morning walks. The staff was incredibly attentive and the food was delicious. Will definitely be coming back with family.",
      source: "Google",
      highlight: true,
    },
    {
      id: 2,
      name: "Rahul Mehta",
      avatar: "/assets/images/avatar-2.jpg",
      rating: 5,
      date: "February 8, 2023",
      text: "Our corporate retreat at Katwate's Resort was a huge success. The spacious grounds and excellent service made our team-building activities enjoyable. The swimming pool is well-maintained and the rooms are comfortable.",
      source: "TripAdvisor",
      highlight: false,
    },
    {
      id: 3,
      name: "Ananya Patel",
      avatar: "/assets/images/avatar-3.jpg",
      rating: 4,
      date: "April 22, 2023",
      text: "A perfect weekend getaway from Mumbai! The resort is peaceful and the beach is just a short walk away. We enjoyed the day package with access to all amenities. The high tea was a delightful surprise!",
      source: "Google",
      highlight: true,
    },
    {
      id: 4,
      name: "Vikram Singh",
      avatar: "/assets/images/avatar-4.jpg",
      rating: 5,
      date: "January 30, 2023",
      text: "My wife and I celebrated our anniversary at Katwate's Resort and it was magical. The staff arranged a special dinner for us. The nearby Kelve Fort and temple were interesting places to visit during our stay.",
      source: "Booking.com",
      highlight: false,
    },
    {
      id: 5,
      name: "Meera Desai",
      avatar: "/assets/images/avatar-5.jpg",
      rating: 5,
      date: "May 12, 2023",
      text: "The day package at Katwate's Resort was perfect for our family outing. Kids loved the swimming pool and the food was excellent. The resort is very well-maintained and the staff is friendly and helpful.",
      source: "Google",
      highlight: true,
    },
  ];

  highlightedReviews: any[] = [];
  activeIndex: number = 0;
  autoplayInterval: any;
  touchStartX: number = 0;
  touchEndX: number = 0;

  ngOnInit() {
    // Pre-filter highlighted reviews
    this.highlightedReviews = this.reviews.filter((review) => review.highlight);

    this.startAutoplay();

    // For mobile swipe functionality
    const reviewsContainer = document.querySelector(".reviews-slider");
    if (reviewsContainer) {
      reviewsContainer.addEventListener(
        "touchstart",
        (e: any) => {
          this.touchStartX = e.changedTouches[0].screenX;
        },
        false,
      );

      reviewsContainer.addEventListener(
        "touchend",
        (e: any) => {
          this.touchEndX = e.changedTouches[0].screenX;
          this.handleSwipe();
        },
        false,
      );
    }
  }

  startAutoplay() {
    this.autoplayInterval = setInterval(() => {
      this.nextReview();
    }, 5000);
  }

  stopAutoplay() {
    clearInterval(this.autoplayInterval);
  }

  resetAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }

  setActiveReview(index: number) {
    this.activeIndex = index;
    this.resetAutoplay();
  }

  prevReview() {
    this.activeIndex =
      this.activeIndex === 0 ? this.reviews.length - 1 : this.activeIndex - 1;
    this.resetAutoplay();
  }

  nextReview() {
    this.activeIndex =
      this.activeIndex === this.reviews.length - 1 ? 0 : this.activeIndex + 1;
    this.resetAutoplay();
  }

  handleSwipe() {
    if (this.touchEndX < this.touchStartX - 50) {
      // Swipe left
      this.nextReview();
    }

    if (this.touchEndX > this.touchStartX + 50) {
      // Swipe right
      this.prevReview();
    }
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  getTransformStyle(): string {
    return `translateX(${-this.activeIndex * 100}%)`;
  }
}
