import React, { Suspense, useEffect, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Glitch, Noise } from '@react-three/postprocessing'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { getProject } from '@theatre/core'
import studio from '@theatre/studio'
import LocomotiveScroll from 'locomotive-scroll'
import barba from '@barba/core'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Physics } from 'gsap/Physics2DPlugin'
import AOS from 'aos'
import Rellax from 'rellax'
import { GPU } from 'gpu.js'

// Import custom components
import Hero from './components/Hero'
import Navigation from './components/Navigation'
import NewsAnchor3D from './components/NewsAnchor3D'
import ParticleBackground from './components/ParticleBackground'
import NewsGrid from './components/NewsGrid'
import LiveTicker from './components/LiveTicker'
import WeatherVisualization from './components/WeatherVisualization'
import AudioVisualizer from './components/AudioVisualizer'
import PageTransitions from './components/PageTransitions'
import CustomCursor from './components/CustomCursor'
import ShaderBackground from './components/ShaderBackground'
import LoadingAnimation from './components/LoadingAnimation'

// Import Theatre.js project
import theatreProjectState from './data/theatre-project.json'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Physics)

// Initialize Theatre.js
const theatreProject = getProject('Static News Animations', { state: theatreProjectState })
const mainSheet = theatreProject.sheet('Main Timeline')

// Initialize GPU.js for acceleration
const gpu = new GPU()

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState('home')
  const [newsData, setNewsData] = useState([])
  const scrollRef = useRef()
  const { scrollYProgress } = useScroll()
  
  // Transform scroll progress for parallax effects
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -500])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  useEffect(() => {
    // Initialize Locomotive Scroll
    const scroll = new LocomotiveScroll({
      el: scrollRef.current,
      smooth: true,
      multiplier: 0.5,
      lerp: 0.05,
      smartphone: {
        smooth: true
      }
    })

    // Initialize AOS
    AOS.init({
      duration: 1200,
      easing: 'ease-out-cubic',
      once: false,
      mirror: true
    })

    // Initialize Rellax for parallax
    new Rellax('.rellax', {
      speed: -10,
      center: false,
      wrapper: null,
      round: true,
      vertical: true,
      horizontal: false
    })

    // Initialize Barba.js for page transitions
    barba.init({
      transitions: [{
        name: 'opacity-transition',
        leave(data) {
          return gsap.to(data.current.container, {
            opacity: 0,
            duration: 0.5
          })
        },
        enter(data) {
          return gsap.from(data.next.container, {
            opacity: 0,
            duration: 0.5
          })
        }
      }]
    })

    // Start Theatre.js studio in development
    if (process.env.NODE_ENV === 'development') {
      studio.initialize()
    }

    // Fetch news data from backend
    fetchNewsData()

    // Cleanup
    return () => {
      scroll.destroy()
      AOS.refresh()
    }
  }, [])

  const fetchNewsData = async () => {
    try {
      // In production, this would connect to your backend API
      const response = await fetch('/api/news')
      const data = await response.json()
      setNewsData(data)
    } catch (error) {
      console.error('Error fetching news:', error)
      // Use mock data for now
      setNewsData(getMockNewsData())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockNewsData = () => [
    {
      id: 1,
      title: "Breaking: Revolutionary AI Technology Transforms Digital Media",
      category: "Technology",
      image: "/images/ai-news.jpg",
      author: "Sarah Chen",
      timestamp: new Date().toISOString(),
      content: "In a groundbreaking development that promises to reshape the digital landscape..."
    },
    {
      id: 2,
      title: "Global Climate Summit Reaches Historic Agreement",
      category: "Environment",
      image: "/images/climate-summit.jpg",
      author: "Michael Rodriguez",
      timestamp: new Date().toISOString(),
      content: "World leaders gathered in Geneva have announced an unprecedented accord..."
    },
    {
      id: 3,
      title: "SpaceX Successfully Launches First Mars Colony Ship",
      category: "Space",
      image: "/images/spacex-mars.jpg",
      author: "Emma Watson",
      timestamp: new Date().toISOString(),
      content: "The dawn of interplanetary civilization began today as SpaceX's Starship..."
    }
  ]

  return (
    <div className="app" ref={scrollRef}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingAnimation key="loading" />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Custom Cursor */}
            <CustomCursor />

            {/* WebGL Background Canvas */}
            <div className="webgl-container">
              <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                gl={{ antialias: true, alpha: true }}
              >
                <Suspense fallback={null}>
                  <ShaderBackground />
                  <ParticleBackground />
                  <EffectComposer>
                    <Bloom intensity={0.5} luminanceThreshold={0.9} />
                    <ChromaticAberration offset={[0.002, 0.002]} />
                    <Noise opacity={0.02} />
                  </EffectComposer>
                </Suspense>
              </Canvas>
            </div>

            {/* Audio Visualizer */}
            <AudioVisualizer />

            {/* Navigation */}
            <Navigation currentSection={currentSection} />

            {/* Main Content */}
            <main className="main-content">
              {/* Hero Section with 3D News Anchor */}
              <motion.section 
                className="hero-section"
                style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
              >
                <Hero />
                <div className="news-anchor-container">
                  <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                    <Suspense fallback={null}>
                      <NewsAnchor3D />
                    </Suspense>
                  </Canvas>
                </div>
              </motion.section>

              {/* Live News Ticker */}
              <LiveTicker newsData={newsData} />

              {/* Main News Grid with Physics */}
              <section className="news-grid-section" data-aos="fade-up">
                <NewsGrid newsData={newsData} />
              </section>

              {/* Weather Visualization Section */}
              <section className="weather-section" data-aos="zoom-in">
                <WeatherVisualization />
              </section>

              {/* Interactive Categories */}
              <section className="categories-section">
                <motion.div 
                  className="categories-container"
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 100 }}
                  transition={{ duration: 0.8, staggerChildren: 0.1 }}
                >
                  {['Politics', 'Technology', 'Science', 'Entertainment', 'Sports', 'Business'].map((category, index) => (
                    <motion.div
                      key={category}
                      className="category-card rellax"
                      data-rellax-speed={index % 2 === 0 ? -5 : -3}
                      whileHover={{ scale: 1.05, rotateY: 10 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <h3>{category}</h3>
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            </main>

            {/* Page Transitions Handler */}
            <PageTransitions />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App