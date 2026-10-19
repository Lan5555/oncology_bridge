import BackToTop from "@/app/components/Landing/BackToTop";
import Footer from "@/app/components/Landing/Footer";
import Hero from "@/app/components/Landing/Hero";
import Nav from "@/app/components/Landing/Nav";
import PortalCapabilities from "@/app/components/Landing/PortalCapabilities";
import PracticalGuide from "@/app/components/Landing/PracticalGuide";
import PublicFlows from "@/app/components/Landing/PublicFlows";
import TrustBar from "@/app/components/Landing/TrustBar";
import MotionPage from "@/app/components/MotionPage";

const HomePage: React.FC = () => {
  return (
    <MotionPage>
      <Nav />
      <Hero />
      <TrustBar />
      <PortalCapabilities />
      <PublicFlows />
      <PracticalGuide />
      <Footer />
      <BackToTop />
    </MotionPage>
  );
};
export default HomePage;
