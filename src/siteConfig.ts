export const siteConfig = {
  heroHeader: "THE SHOOTLESS\nREVOLUTION",
  subtext: "We replace traditional photography with deterministic AI pipelines. Studio-grade images and video for luxury brands—generated in days, not months.",
  colors: { background: "#242424", text: "#FFFFFF", accent: "#CCFF00" },
  images: Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    url: `/portfolio/work-${i + 1}.jpg`,
    alt: `Project ${i + 1}`
  })),
  navItems: ["MENU"],
  capabilities: [
    { 
      name: 'Virtual Photography', 
      number: '01',
      description: 'Replace $10k photoshoots with infinite generation. We place your products in any environment—from minimalist studios to exotic locations—without a single physical shutter click.',
      image: '/portfolio/work-1.jpg'
    },
    { 
      name: 'AI Cinematography', 
      number: '02',
      description: 'Full-motion video ads generated entirely by code. Liquid simulations, slow-motion reveals, and dynamic camera movements that rival high-end cinema production.',
      image: '/portfolio/work-2.jpg'
    },
    { 
      name: 'Synthetic Influencers', 
      number: '03',
      description: 'De-risk your marketing spend. We create AI twins of celebrity archetypes to A/B test campaigns and measure engagement before you hire real talent.',
      image: '/portfolio/work-3.jpg'
    },
    { 
      name: 'The Infinite Catalog', 
      number: '04',
      description: 'Move from "digitize once" to "always on." We scale your creative output from 10 SKUs to 10,000, syncing fresh assets directly to your store for seasonal drops and tests.',
      image: '/portfolio/work-4.jpg'
    },
    { 
      name: 'One-off work', 
      number: '05',
      description: 'Dashboarding, internal process automations, data scraping, and more.',
      image: '/portfolio/work-5.jpg'
    },
  ],
};
