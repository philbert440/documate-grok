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
      { text: 'Companies', link: '/companies' },
      { text: 'About Me', link: '/story' }
    ],

    sidebar: [
      {
        text: 'Projects',
        items: [
          { text: 'Shipcode from 0-1', link: '/shipcode' },
          { text: 'Flagship Integrations', link: '/shipcode' },
          { text: 'Home Test Pro', link: '/adapify' },
          { text: 'RxSoil Algorithm to AI', link: '/adapify' },
          { text: 'Laboratory SaaS', link: '/adapify' },
          { text: 'Adapify Sports', link: '/adapify' },
          { text: 'We Evolve Us', link: '/weu' },
          { text: 'Sands Casino Hack', link: '/msft' },
          { text: 'Microsoft acquires Nokia', link: '/msft' },
          { text: 'Multi-touch Wall and Table', link: '/pheon' }
        ]
      },
      {
        text: 'Companies',
        items: [
          { text: 'Branding Brand', link: '/shipcode' },
          { text: 'Adapify', link: '/adapify' },
          { text: 'Microsoft', link: '/msft' },
          { text: "-----During College-----"},
          { text: '1901 Group', link: '/1901' },
          { text: 'Genworth Financial', link: '/genworth' },
          { text: 'Pheon Tech', link: '/pheon' },
          { text: 'Starbucks', link: '/oldjobs' },
          { text: 'Medco', link: '/oldjobs' },
          { text: "-----Before College-----"},
          { text: 'HSN', link: '/oldjobs' },
          { text: 'Phil-Tech', link: '/oldjobs' },
          { text: 'Pepsi', link: '/oldjobs' },
          { text: 'Firehouse Subs', link: '/oldjobs' },
          { text: 'Quiznos', link: '/oldjobs' },
          { text: 'McDonalds', link: '/oldjobs' },
          { text: "Noah's Electronics", link: '/oldjobs' },
          { text: "Medley's Cafe", link: '/oldjobs' },
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
