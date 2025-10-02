// components/LandingPage.tsx
import { useRef } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";

const LandingPage: React.FC = () => {
  const featureRef = useRef<HTMLDivElement | null>(null);
  const howItWorkRef = useRef<HTMLDivElement | null>(null);
  const handleScroll = (props: string) => {
    if (props == "features") {
      featureRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (props == "howitworks") {
      howItWorkRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header handleScroll={handleScroll} />
      <Hero />
      <Features featureRef={featureRef} />
      <HowItWorks howItworksRef={howItWorkRef} />
      <Footer />
    </div>
  );
};

export default LandingPage;
