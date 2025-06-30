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
          { text: 'Philbot & This Portfolio Site', link: '/projects.html#philbot-this-portfolio-site' },
          { text: 'Scaling Shipcode Globally', link: '/projects.html#shipcode-scaling-globally' },
          { text: 'Documentation & AI', link: '/projects.html#shipcode-documentation-ai' },
          { text: 'Monitoring, Stability, & Security', link: '/projects.html#shipcode-monitoring-stability-security' },
          { text: 'Testing, Deployment, & CI/CD', link: '/projects.html#shipcode-development-testing-deployment-and-ci-cd' },
          { text: 'Developer Tooling Overhaul', link: '/projects.html#shipcode-developer-tooling-overhaul' },
          { text: 'Real-Time Collaboration', link: '/projects.html#shipcode-real-time-collaboration' },
          { text: 'Shipcode from 0-1', link: '/projects#shipcode-from-0-1' },
          { text: 'Flagship Integrations', link: '/projects.html#branding-brand-flagship-integrations' },
          { text: 'Home Test Pro', link: '/projects.html#adapify-home-test-pro' },
          { text: 'RxSoil Algorithm to AI', link: '/projects.html#adapify-rxsoil-algorithm-to-ai' },
          { text: 'Laboratory SaaS', link: '/projects.html#adapify-laboratory-saas' },
          { text: 'Adapify Sports', link: '/projects.html#adapify-adapify-sports' },
          { text: 'We Evolve Us', link: '/projects.html#adapify-we-evolve-us' },
          { text: 'Sands Casino Hack', link: '/projects.html#microsoft-sands-casino-hack-response' },
          { text: 'Microsoft Acquires Nokia', link: '/projects.html#microsoft-nokia-acquisition' },
          { text: 'Adobe on Microsoft', link: '/projects.html#microsoft-adobe-email-down' },
          { text: 'Inside Netflix in 2013', link: '/projects.html#microsoft-netflix-in-2013' },
          { text: '3M Cloud Storage', link: '/projects.html#microsoft-3m-azure-cloud-storage-and-onedrive' },
          { text: '50k person cloud migration', link: '/projects.html#microsoft-nielsen-50-000-person-cloud-migration' },
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
