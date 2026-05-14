import Navbar from "../components/Navbar";
import Main from "../components/Main";
import ProblemSolution from "../components/ProblemSolution";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Pricing from "../components/Pricing";
// import Testimonials from "../components/Testimonials";
// import Integrations from "../components/Integrations";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";
import WhatsAppFloat from "../components/WhatsAppFloat";
import ScrollToTop from "../components/ScrollToTop";

export default function App() {
  return (
    <div className="min-h-screen bg-[#FDF6EC]" dir="rtl" lang="ar">
      <Navbar />
      <main>
        <Main />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <Pricing />
        {/* <Testimonials /> */}
        {/* <Integrations /> */}
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
