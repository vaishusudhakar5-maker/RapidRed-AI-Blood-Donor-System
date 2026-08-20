import Navbar from "../../components/layout/Navbar";
import Hero from "../../components/layout/Hero";
import Statistics from "../../components/layout/Statistics";
import Features from "../../components/layout/Features";
import HowItWorks from "../../components/layout/HowItWorks";
import Footer from "../../components/layout/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Statistics />
      <Features />
      <HowItWorks />
      <Footer />
    </>
  );
}

export default Home;