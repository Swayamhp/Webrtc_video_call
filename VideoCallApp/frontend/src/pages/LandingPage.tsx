// components/LandingPage.tsx
import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

const LandingPage: React.FC = () => {


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <Hero />
      <Footer />
    </div>
  );
};

export default LandingPage;
