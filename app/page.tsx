'use client';

import React, { useState } from 'react';
import { Github, Linkedin, Mail, ExternalLink, ChevronDown, Menu, X } from 'lucide-react';

const Portfolio = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const projects = [
    {
      id: 1,
      title: "ML-Driven Statistical Arbitrage",
      description: "Ensemble trading strategy achieving Sharpe 1.4-1.6 through GPU-accelerated feature engineering on 50M+ daily ticks",
      metrics: "Sharpe: 1.4-1.6 | 30% DD Reduction",
      tech: ["PyTorch", "LightGBM", "Kalman", "CUDA"],
      category: "quant",
      gradient: "from-blue-500 to-cyan-500",
      github: null,
      demo: null
    },
    {
      id: 2,
      title: "Low-Latency Market Simulator",
      description: "Multi-venue trading simulator with microsecond scheduling and realistic order book dynamics processing 500K+ events/second",
      metrics: "40% Better Slippage Prediction | 500K Events/sec",
      tech: ["C++", "Python", "Multi-threading"],
      category: "quant",
      gradient: "from-blue-600 to-indigo-600",
      github: null,
      demo: null
    },
    {
      id: 3,
      title: "Production RAG System with RLHF",
      description: "Retrieval-augmented generation with FAISS vector search achieving sub-10ms cached responses and 100% relevance scores",
      metrics: "Sub-10ms Cached | 100% Relevance | 60% Hit Rate",
      tech: ["LangChain", "FAISS", "FastAPI", "Gemini", "Redis"],
      category: "ml",
      gradient: "from-purple-500 to-pink-500",
      github: "https://github.com/shivangraval50/rag-chatbot-rlhf",
      demo: null
    },
    {
      id: 4,
      title: "Distributed ML Training Platform",
      description: "Multi-GPU infrastructure scaling training from 8 hours to 45 minutes through data parallelism",
      metrics: "10.6× Training Speedup | 100+ Experiments",
      tech: ["PyTorch", "Ray", "Kubernetes", "MLflow"],
      category: "mlops",
      gradient: "from-green-500 to-emerald-500",
      github: null,
      demo: null
    },
    {
      id: 5,
      title: "Smart Order Router",
      description: "Real-time venue latency tracking across 8 exchanges improving fill rates by 12% through adaptive routing",
      metrics: "12% Fill Rate Improvement",
      tech: ["C++", "Rust", "Lock-Free"],
      category: "quant",
      gradient: "from-blue-500 to-purple-500",
      github: null,
      demo: null
    },
    {
      id: 6,
      title: "High-Throughput Streaming Pipeline",
      description: "Real-time data processing handling 200K messages/second with 2s end-to-end latency",
      metrics: "200K msgs/sec | 18s → 2s Latency",
      tech: ["Kafka", "Flink", "ClickHouse"],
      category: "systems",
      gradient: "from-orange-500 to-red-500",
      github: null,
      demo: null
    }
  ];

  const skills = [
    {
      category: "Quantitative Trading",
      items: ["Statistical Arbitrage", "Market Microstructure", "Execution Algorithms", "Kalman Filters", "Backtesting"]
    },
    {
      category: "ML & AI Engineering",
      items: ["Production ML", "Distributed Training", "Time Series", "NLP & RAG", "Model Optimization"]
    },
    {
      category: "MLOps & DevOps",
      items: ["Kubernetes", "Docker", "MLflow", "CI/CD", "Model Serving"]
    },
    {
      category: "High-Performance Systems",
      items: ["Low-Latency C++", "Concurrency", "Real-Time Processing", "Performance Optimization"]
    }
  ];

  const stats = [
    { value: "500K+", label: "Events/Second" },
    { value: "1.4-1.6", label: "Sharpe Ratio" },
    { value: "10.6×", label: "Training Speedup" },
    { value: "<10ms", label: "Cached Latency" },
    { value: "100K+", label: "Daily Users" },
    { value: "20", label: "Team Size Led" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-xl text-gray-900">SR</div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition">About</a>
              <a href="#projects" className="text-gray-700 hover:text-blue-600 transition">Projects</a>
              <a href="#skills" className="text-gray-700 hover:text-blue-600 transition">Skills</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition">Contact</a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <a href="#about" className="block text-gray-700 hover:text-blue-600">About</a>
              <a href="#projects" className="block text-gray-700 hover:text-blue-600">Projects</a>
              <a href="#skills" className="block text-gray-700 hover:text-blue-600">Skills</a>
              <a href="#contact" className="block text-gray-700 hover:text-blue-600">Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-blue-500">
                 <img
                  src="/images/logo1.jpeg"
                  alt="Shivang Raval"
                  className="w-full h-full object-cover"
                  />
                </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
            Shivang Raval
          </h1>

          <p className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
            Quant Trader & AI Engineer
          </p>

          <div className="text-lg text-gray-600 mb-4 space-y-1">
            <p>Quant Developer | ML & MLOps</p>
            <p className="font-mono text-sm">Python • C++ • LangChain • PyTorch • Kubernetes</p>
            <p className="text-blue-600 font-medium">MS CS @ Northeastern</p>
          </div>

          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Building high-performance trading systems and production ML infrastructure —
            from microsecond execution engines to distributed GPU training platforms
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a
              href="#projects"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              View Projects
            </a>
            <a
              href="/Shivang_Raval_ML_Engineer_JaneStreet.pdf"
              download
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition font-medium"
              >
              Download Resume
            </a>
          </div>

          <div className="flex justify-center space-x-6">
            <a href="mailto:shivangraval50@gmail.com" className="text-gray-600 hover:text-blue-600 transition">
              <Mail size={24} />
            </a>
            <a href="https://linkedin.com/in/shivang-raval" className="text-gray-600 hover:text-blue-600 transition">
              <Linkedin size={24} />
            </a>
            <a href="https://github.com/shivangraval50" className="text-gray-600 hover:text-blue-600 transition">
              <Github size={24} />
            </a>
          </div>

          <div className="mt-12 animate-bounce">
            <ChevronDown className="mx-auto text-gray-400" size={32} />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">About Me</h2>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              I'm a <strong>Quant Trader and AI Engineer</strong> currently pursuing my Master's in Computer Science
              at Northeastern University (4.0 GPA), specializing in quantitative finance and production machine learning systems.
            </p>

            <p>
              As a <strong>Quant Developer</strong>, I build trading infrastructure that operates at microsecond precision —
              from statistical arbitrage strategies achieving Sharpe ratios of 1.4-1.6 to low-latency market simulators
              processing 500K+ events per second.
            </p>

            <p>
              On the <strong>ML & MLOps</strong> side, I architect production systems that scale — recently leading a
              team of 20 engineers at Webearl AI, where we built inference platforms serving 100K+ daily requests with
              sub-500ms latency. I've reduced training times from 8 hours to 45 minutes through distributed GPU acceleration
              and built RAG systems with sub-10ms cached response times.
            </p>

            <p>
              My tech stack spans the full spectrum: <strong>Python and C++</strong> for core systems, <strong>PyTorch</strong> for
              ML modeling, <strong>LangChain</strong> for LLM applications, and <strong>Kubernetes</strong> for orchestration.
              I'm passionate about the intersection where quantitative rigor meets engineering excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Featured Projects</h2>
          <p className="text-center text-gray-600 mb-12">
            From quantitative trading strategies to production ML infrastructure
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
              >
                <div className={`h-2 bg-gradient-to-r ${project.gradient}`}></div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">
                    {project.title}
                  </h3>

                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900">
                      📈 {project.metrics}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium text-sm transition"
                      >
                        <Github size={16} />
                        Code
                      </a>
                    )}
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium text-sm transition"
                      >
                        <ExternalLink size={16} />
                        Demo
                      </a>
                    )}
                    {!project.github && !project.demo && (
                      <span className="text-gray-400 text-sm italic">Private Repository</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Skills & Expertise</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {skills.map((skillGroup, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
                  {skillGroup.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((item, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-blue-100 hover:text-blue-800 transition"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Core Technologies</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {["Python", "C++", "Rust", "PyTorch", "TensorFlow", "LangChain", "Kubernetes", "Docker", "Kafka", "PostgreSQL"].map((tech, i) => (
                <span
                  key={i}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Let's Build Something</h2>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Whether you're looking for quantitative trading expertise, ML engineering,
            or technical leadership — I'd love to hear from you.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center space-x-3">
              <Mail className="text-blue-400" />
              <a href="mailto:shivangraval50@gmail.com" className="text-blue-400 hover:text-blue-300 transition">
                shivangraval50@gmail.com
              </a>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Linkedin className="text-blue-400" />
              <a href="https://linkedin.com/in/shivang-raval" className="text-blue-400 hover:text-blue-300 transition">
                linkedin.com/in/shivang-raval
              </a>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Github className="text-blue-400" />
              <a href="https://github.com/shivangraval50" className="text-blue-400 hover:text-blue-300 transition">
                github.com/shivangraval50
              </a>
            </div>
          </div>

          <div className="text-gray-400 mb-8">
            <p className="mb-2">📍 Boston, MA</p>
            <p>Currently: MS CS @ Northeastern University (4.0 GPA)</p>
            <p className="mt-4 text-sm">
              Open to: Quantitative Trading • ML Engineering • MLOps • Research Opportunities
            </p>
          </div>

          <div className="pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              © 2025 Shivang Raval. Built with React & Tailwind CSS.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;