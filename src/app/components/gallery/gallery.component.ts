import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-gallery",
  templateUrl: "./gallery.component.html",
  styleUrls: ["./gallery.component.css"],
})
export class GalleryComponent implements OnInit {
  galleryImages = [
    {
      url: "/assets/images/resort-pool-night.jpg",
      alt: "Swimming Pool at Night",
      category: "views",
    },
    {
      url: "/assets/images/resort-umbrella.jpg",
      alt: "Poolside Umbrella",
      category: "outdoors",
    },
    {
      url: "/assets/images/resort-entrance-2.jpg",
      alt: "Resort Entrance 2",
      category: "outdoors",
    },
    {
      url: "/assets/images/resort-breakfast-food.jpg",
      alt: "Breakfast Food",
      category: "dining",
    },
    {
      url: "/assets/images/resort-lounge.jpg",
      alt: "Lounge Area",
      category: "amenities",
    },
    {
      url: "/assets/images/resort-lounge-2.jpg",
      alt: "Lounge Area 2",
      category: "amenities",
    },
    {
      url: "/assets/images/resort-lunch-food.jpg",
      alt: "Lunch Food",
      category: "dining",
    },
    {
      url: "/assets/images/resort-lounge-3.jpg",
      alt: "Lounge Area 3",
      category: "amenities",
    },
    {
      url: "/assets/images/resort-entrance.jpg",
      alt: "Resort Entrance",
      category: "outdoors",
    },
    {
      url: "/assets/images/resort-exterior-night.jpg",
      alt: "Resort Exterior at Night",
      category: "views",
    },
    {
      url: "/assets/images/resort-pool.jpg",
      alt: "Swimming Pool",
      category: "amenities",
    },
    {
      url: "/assets/images/resort-pool-night-2.jpg",
      alt: "Pool Night View 2",
      category: "views",
    },
    {
      url: "/assets/images/resort-terrace.jpg",
      alt: "Terrace Sitting Area",
      category: "outdoors",
    },
    {
      url: "/assets/images/resort-pool-night-view.jpg",
      alt: "Night Pool Scenic View",
      category: "views",
    },
  ];

  filteredImages = [...this.galleryImages];
  displayImages: typeof this.galleryImages = [];
  categories = [
    { value: "all", label: "All" },
    { value: "amenities", label: "Amenities" },
    { value: "views", label: "Views" },
    { value: "dining", label: "Dining" },
    { value: "outdoors", label: "Outdoors" },
  ];
  selectedCategory = "all";
  currentIndex = 0;
  visibleImages = 3; // Default for desktop
  touchStartX = 0;
  touchEndX = 0;
  isModalOpen = false;
  selectedImageUrl: string | null = null;
  selectedImageAlt: string | null = null;

  ngOnInit() {
    this.updateFilteredImages();
    this.setupTouchEvents();
    this.updateVisibleImages();
    window.addEventListener("resize", () => this.updateVisibleImages());
  }

  setupTouchEvents() {
    const galleryContainer = document.querySelector(".gallery-slider");
    if (galleryContainer) {
      galleryContainer.addEventListener(
        "touchstart",
        (e: any) => {
          this.touchStartX = e.changedTouches[0].screenX;
        },
        false,
      );

      galleryContainer.addEventListener(
        "touchend",
        (e: any) => {
          this.touchEndX = e.changedTouches[0].screenX;
          this.handleSwipe();
        },
        false,
      );
    }
  }

  handleSwipe() {
    if (this.touchEndX < this.touchStartX - 50) {
      this.nextSlide();
    }
    if (this.touchEndX > this.touchStartX + 50) {
      this.prevSlide();
    }
  }

  updateFilteredImages() {
    if (this.selectedCategory === "all") {
      this.filteredImages = [...this.galleryImages];
    } else {
      this.filteredImages = this.galleryImages.filter(
        (img) => img.category === this.selectedCategory,
      );
    }
    this.updateDisplayImages();
  }

  updateDisplayImages() {
    const length = this.filteredImages.length;
    if (length === 0) {
      this.displayImages = [];
      this.currentIndex = 0;
      return;
    }

    // Create enough duplicates for seamless looping
    const extraImages = Math.max(this.visibleImages, 3);
    const startImages = this.filteredImages.slice(-extraImages);
    const endImages = this.filteredImages.slice(0, extraImages);
    this.displayImages = [...startImages, ...this.filteredImages, ...endImages];

    // Set currentIndex to show the first image in the center
    const centerOffset = Math.floor(this.visibleImages / 2);
    this.currentIndex = extraImages + centerOffset;
  }

  updateVisibleImages() {
    const width = window.innerWidth;
    if (width <= 768) {
      this.visibleImages = 1;
    } else if (width <= 992) {
      this.visibleImages = 2;
    } else {
      this.visibleImages = 3;
    }
    this.updateDisplayImages();
  }

  normalizeIndex(index: number): number {
    const length = this.filteredImages.length;
    if (length === 0) return 0;

    const extraImages = Math.max(this.visibleImages, 3);
    const mainStartIndex = extraImages;
    const mainEndIndex = extraImages + length;

    // If we're in the main section, return the corresponding filtered image index
    if (index >= mainStartIndex && index < mainEndIndex) {
      return index - mainStartIndex;
    }

    // If we're in the start duplicates
    if (index < mainStartIndex) {
      return length - (mainStartIndex - index);
    }

    // If we're in the end duplicates
    return (index - mainEndIndex) % length;
  }

  prevSlide() {
    this.currentIndex--;
    this.checkResetTransition();
  }

  nextSlide() {
    this.currentIndex++;
    this.checkResetTransition();
  }

  checkResetTransition() {
    const length = this.filteredImages.length;
    if (length === 0) return;

    const extraImages = Math.max(this.visibleImages, 3);
    const mainStartIndex = extraImages;
    const mainEndIndex = extraImages + length;
    const track = document.querySelector(".gallery-track") as HTMLElement;

    if (this.currentIndex < mainStartIndex) {
      // Reset to end of main section
      setTimeout(() => {
        this.currentIndex =
          mainEndIndex -
          this.visibleImages +
          (this.currentIndex - (mainStartIndex - this.visibleImages));
        if (track) {
          track.style.transition = "none";
          track.style.transform = this.getTransformStyle();
          // Force reflow
          void track.offsetHeight;
          // Re-enable transition
          setTimeout(() => {
            track.style.transition = "transform 0.3s ease";
          }, 50);
        }
      }, 300); // Wait for current transition to complete
    } else if (this.currentIndex >= mainEndIndex) {
      // Reset to start of main section
      setTimeout(() => {
        this.currentIndex = mainStartIndex + (this.currentIndex - mainEndIndex);
        if (track) {
          track.style.transition = "none";
          track.style.transform = this.getTransformStyle();
          // Force reflow
          void track.offsetHeight;
          // Re-enable transition
          setTimeout(() => {
            track.style.transition = "transform 0.3s ease";
          }, 50);
        }
      }, 300); // Wait for current transition to complete
    }
  }

  getTransformStyle() {
    const length = this.filteredImages.length;
    if (length === 0) return `translateX(0%)`;

    const itemWidth = 100 / this.visibleImages;
    const translateX = -this.currentIndex * itemWidth;
    return `translateX(${translateX}%)`;
  }

  openImageModal(url: string, alt: string) {
    this.selectedImageUrl = url;
    this.selectedImageAlt = alt;
    this.isModalOpen = true;
  }

  closeImageModal() {
    this.isModalOpen = false;
    this.selectedImageUrl = null;
    this.selectedImageAlt = null;
  }

  isCenterImage(index: number): boolean {
    const length = this.filteredImages.length;
    if (length === 0) return false;

    const centerOffset = Math.floor(this.visibleImages / 2);
    const centerIndex = this.currentIndex + centerOffset;

    return index === centerIndex;
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.updateFilteredImages();
  }
}
