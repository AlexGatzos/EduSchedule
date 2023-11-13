import type { Config } from 'tailwindcss'
import formPlugin from '@tailwindcss/forms'
import racPlugin from 'tailwindcss-react-aria-components'
import animatePlugin from 'tailwindcss-animate'
import containerQueriesPlugin from '@tailwindcss/container-queries'

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [formPlugin, racPlugin, animatePlugin, containerQueriesPlugin],
} satisfies Config

