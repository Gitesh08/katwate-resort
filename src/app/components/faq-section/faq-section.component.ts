import { Component } from "@angular/core";

interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: "app-faq-section",
  templateUrl: "./faq-section.component.html",
  styleUrls: ["./faq-section.component.css"],
})
export class FaqSectionComponent {
  faqs: FAQ[] = [
    {
      question: "What are the check-in and check-out times?",
      answer:
        "For day passes: 9:30 AM to 5:00 PM. For overnight stays: Either 11:00 AM to 10:00 AM the next day, or 5:00 PM to 4:00 PM the next day.",
      isOpen: false,
    },
    {
      question: "Do you allow pets?",
      answer: "Yes, pets are allowed in rooms.",
      isOpen: false,
    },
    {
      question: "How far is the beach from the resort?",
      answer:
        "Kelva Beach is just a 2-minute walk from our resort, making it very convenient for our guests to enjoy the beach.",
      isOpen: false,
    },
    {
      question: "What food options are available?",
      answer:
        "We offer both vegetarian and non-vegetarian options with home-style cooking. Meals are typically served as buffets. We also have customized seafood available for guests who enjoy fresh catch from the nearby coast.",
      isOpen: false,
    },
    {
      question: "Are there any nearby attractions?",
      answer:
        "Yes, Shitla Devi Temple is just a 2-minute walk away, and Kelve Fort is about 5 minutes from our resort. Both are popular tourist attractions worth visiting.",
      isOpen: false,
    },
    {
      question: "Is there WiFi available?",
      answer:
        "Yes, we provide complimentary high-speed WiFi throughout the resort, including in all guest rooms and common areas.",
      isOpen: false,
    },
    {
      question: "Is there parking available?",
      answer: "Yes, we offer free parking for our guests.",
      isOpen: false,
    },
  ];

  toggleFAQ(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;

    // Close other FAQs when one is opened
    if (this.faqs[index].isOpen) {
      for (let i = 0; i < this.faqs.length; i++) {
        if (i !== index) {
          this.faqs[i].isOpen = false;
        }
      }
    }
  }
}
