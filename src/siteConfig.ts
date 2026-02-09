export const siteConfig = {
  heroHeader: "EXPERT DIGITAL\nPRODUCTION",
  subtext: "Award-winning motion, design and interactive experiences that connect culture, technology, and contemporary aesthetics.",
  colors: { background: "#242424", text: "#FFFFFF", accent: "#CCFF00" },
  images: Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    url: `/portfolio/work-${i + 1}.jpg`,
    alt: `Project ${i + 1}`
  })),
  navItems: ["MENU"],
  capabilities: [
    { 
      name: 'Experience Strategy & Design', 
      number: '01',
      description: 'We craft digital-first strategies that align brand vision with user needs, creating cohesive ecosystems that scale across multiple touchpoints and platforms.',
      image: '/portfolio/work-1.jpg'
    },
    { 
      name: '3D Visualisation', 
      number: '02',
      description: 'High-fidelity 3D rendering and animation that brings complex concepts to life with technical precision and artistic flair, for web, film, and interactive setups.',
      image: '/portfolio/work-2.jpg'
    },
    { 
      name: 'Rapid Concept Prototyping', 
      number: '03',
      description: 'Quickly turning ideas into functional, interactive prototypes. This agile approach allows for immediate testing, refinement, and validation of groundbreaking concepts.',
      image: '/portfolio/work-3.jpg'
    },
    { 
      name: 'Motion & Production', 
      number: '04',
      description: 'Dynamic motion graphics and high-end video production that captures attention and tells compelling stories through fluid movement and cinematic quality.',
      image: '/portfolio/work-4.jpg'
    },
    { 
      name: 'Website & App Experience', 
      number: '05',
      description: 'Building immersive web and mobile applications that prioritize performance and accessibility while delivering unique, memorable user journeys.',
      image: '/portfolio/work-5.jpg'
    },
  ],
};
