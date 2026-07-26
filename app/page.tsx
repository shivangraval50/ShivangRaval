import GridBackground from "@/components/GridBackground";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import MarqueeTicker from "@/components/MarqueeTicker";
import Stats from "@/components/Stats";
import About from "@/components/About";
import Experience from "@/components/Experience";
import ProjectsSection from "@/components/ProjectsSection";
import Skills from "@/components/Skills";
import Credentials from "@/components/Credentials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { PROJECTS } from "@/data/projects";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <GridBackground />
      <Nav />
      <Hero />
      <MarqueeTicker />
      <Stats />
      <About />
      <Experience />
      <ProjectsSection projects={PROJECTS} />
      <Skills />
      <Credentials />
      <Contact />
      <Footer />
    </div>
  );
}
