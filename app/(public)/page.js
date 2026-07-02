import { PageShell } from "@/components/shared/page-shell";
import Hero from "@/components/home/hero";
import ExperienceSection from "@/components/home/experience-section";
import FeaturedDestinations from "@/components/home/featured-destination";
import FestivalSection from "@/components/home/festival-section";
import WhyChooseSection from "@/components/home/why-choose-section";
import StatsSection from "@/components/home/stats-section";
import Testimonials from "@/components/home/testimonials";
import CTASection from "@/components/home/cta-section";

export default function PublicHomePage() {
  return (
    <PageShell>
      <Hero />
      <ExperienceSection />
      <FeaturedDestinations />
      <FestivalSection />
      <WhyChooseSection />
      <StatsSection />
      <Testimonials />
      <CTASection />
    </PageShell>
  );
}
