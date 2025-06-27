// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import './style.css'

import Documate from '@documate/vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-content-before': () => h(Documate, {
        endpoint: 'https://localhost:3000/ask',
        predefinedQuestions: [
          'What is Documate?',
        ],
      }),
    })
  },
}
