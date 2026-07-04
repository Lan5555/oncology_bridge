import BackToTop from "@/app/components/Landing/BackToTop";
import CTA from "@/app/components/Landing/CTA";
import Footer from "@/app/components/Landing/Footer";
import Hero from "@/app/components/Landing/Hero";
import Nav from "@/app/components/Landing/Nav";
import Problem from "@/app/components/Landing/Problem";
import Regulatory from "@/app/components/Landing/Regulatory";
import Roles from "@/app/components/Landing/Roles";
import Solution from "@/app/components/Landing/Solution";
import Stats from "@/app/components/Landing/Stats";
import TrustBar from "@/app/components/Landing/TrustBar";
import Workflow from "@/app/components/Landing/Workflow";


const HomePage:React.FC = () => {
  return (
    <>
      <Nav />
      <Hero />
      <TrustBar />
      <Stats />
      <Problem />
      <Solution />
      <Workflow />
      <Roles />
      <Regulatory />
      <CTA />
      <Footer />
      <BackToTop />
    </>
  );
}
export default HomePage;
