import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { ProductSection } from "@/components/home/ProductSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <ProductSection
        title="Featured Products"
        subtitle="Handpicked favorites just for you"
      />
      <ProductSection
        title="Latest Products"
        subtitle="Fresh arrivals added daily"
      />
      <BenefitsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}