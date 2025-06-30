import { defineConfig } from 'vitepress'
import { loadEnv } from 'vite'

// Load environment variables
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '')

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Phil Tompkins",
  description: "Builder of things",
  
  // Vite configuration for environment variables
  vite: {
    define: {
      __BACKEND_URL__: JSON.stringify(env.BACKEND_URL || 'http://localhost:3000'),
      __IS_PRODUCTION__: JSON.stringify(env.NODE_ENV === 'production' || env.BUILD_ENV === 'production')
    }
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Projects', link: '/projects' },
      { text: 'About Me', link: '/story' },
      { text: 'Contact', link: '/contact' }
    ],

    sidebar: [
      {
        text: 'Projects',
        items: [
          { text: 'Philbot & This Portfolio Site', link: '/projects#philbot-this-portfolio-site' },
          { text: 'Scaling Shipcode Globally', link: '/projects#scaling-shipcode-globally' },
          { text: 'Documentation & AI', link: '/projects#documentation-ai' },
          { text: 'Monitoring, Stability, & Security', link: '/projects#monitoring-stability-security' },
          { text: 'Testing, Deployment, & CI/CD', link: '/projects#testing-deployment-ci-cd' },
          { text: 'The Host System', link: '/projects#the-host-system' },
          { text: 'Real-Time Collaboration', link: '/projects#real-time-collaboration' },
          { text: 'The Canvas System', link: '/projects#the-canvas-system' },
          { text: 'Shipcode from 0-1', link: '/projects#shipcode-from-0-1' },
          { text: 'Developer Tooling Overhaul', link: '/projects#developer-tooling-overhaul' },
          { text: 'Flagship Integrations', link: '/projects#flagship-integrations' },
          { text: 'Home Test Pro', link: '/projects#home-test-pro' },
          { text: 'RxSoil Algorithm to AI', link: '/projects#rxsoil-algorithm-to-ai' },
          { text: 'Laboratory SaaS', link: '/projects#laboratory-saas' },
          { text: 'Adapify Sports', link: '/projects#adapify-sports' },
          { text: 'We Evolve Us', link: '/projects#we-evolve-us' },
          { text: 'Sands Casino Hack', link: '/projects#sands-casino-hack' },
          { text: 'Microsoft Acquires Nokia', link: '/projects#microsoft-acquires-nokia' },
          { text: 'Adobe on Microsoft', link: '/projects#adobe-on-microsoft' },
          { text: 'Inside Netflix in 2013', link: '/projects#netflix-in-2013' },
          { text: 'Multi-touch Wall & Table', link: '/projects#pheon-technologies-group' }
        ]
      },
      {
        text: 'Companies',
        items: [
          { text: 'Branding Brand', link: '/bb' },
          { text: 'Adapify', link: '/adapify' },
          { text: 'Microsoft', link: '/msft' },
          { text: "---During & Before College---"},
          { text: '1901 Group', link: '/oldjobs#_1901-group' },
          { text: 'Genworth Financial', link: '/oldjobs#genworth-financial' },
          { text: 'Pheon Tech', link: '/projects#pheon-technologies-group' },
          { text: 'Phil-Tech', link: '/oldjobs#phil-tech' },
          { text: "Phil's MTG Cards", link: '/oldjobs#phil-s-mtg-cards' },
          { text: 'Random Old and Odd Jobs', link: '/oldjobs#old-and-odd-jobs' },
        ]
      },
      {
        text: 'About Me',
        items: [
          { text: 'My Story', link: '/story' },
          { text: 'Interests & Hobbies', link: '/hobbies' },
          { text: 'Get in Touch', link: '/contact' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/philbert440' },
      { icon: 'x', link: 'https://x.com/philbert440' },
      { icon: 'youtube', link: 'https://www.youtube.com/philbert440' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/philtompkins' }
    ]
  }
})
