/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./index.html", 
  ],
  theme: {
  	extend: {
  	    fontFamily: {
  	        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  	        'display': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  	    },
  	    fontSize: {
  	        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
  	        'sm': ['0.875rem', { lineHeight: '1.5714', letterSpacing: '0.01em' }],
  	        'base': ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],
  	        'lg': ['1.125rem', { lineHeight: '1.5556', letterSpacing: '-0.01em' }],
  	        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
  	        '2xl': ['1.5rem', { lineHeight: '1.4167', letterSpacing: '-0.02em' }],
  	        '3xl': ['1.875rem', { lineHeight: '1.3333', letterSpacing: '-0.02em' }],
  	        '4xl': ['2.25rem', { lineHeight: '1.2778', letterSpacing: '-0.025em' }],
  	        '5xl': ['3rem', { lineHeight: '1.1667', letterSpacing: '-0.025em' }],
  	        '6xl': ['3.75rem', { lineHeight: '1.1333', letterSpacing: '-0.025em' }],
  	    },
  	    fontWeight: {
  	        'light': '300',
  	        'normal': '400',
  	        'medium': '500',
  	        'semibold': '600',
  	        'bold': '700',
  	        'extrabold': '800',
  	        'black': '900',
  	    },
  	    animation: {
  	        'shine': 'shine 2s infinite linear',
  	        'subtle-bounce': 'subtle-bounce 2s infinite ease-in-out',
  	        'fadeIn': 'fadeIn 0.3s ease-in-out',
  	        'scaleIn': 'scaleIn 0.3s ease-in-out',
  	        'gradient-x': 'gradient-x 3s ease infinite',
  	    },
  	    keyframes: {
  	        'shine': {
  	            'from': { transform: 'translateX(-100%)' },
  	            'to': { transform: 'translateX(100%)' }
  	        },
  	        'subtle-bounce': {
  	            '0%, 100%': { transform: 'translateY(0)' },
  	            '50%': { transform: 'translateY(-10%)' }
  	        },
  	        'fadeIn': {
  	            '0%': { opacity: '0' },
  	            '100%': { opacity: '1' }
  	        },
  	        'scaleIn': {
  	            '0%': { transform: 'scale(0.9)', opacity: '0' },
  	            '100%': { transform: 'scale(1)', opacity: '1' }
  	        },
  	        'gradient-x': {
  	            '0%, 100%': {
  	                'background-position': '0% 50%'
  	            },
  	            '50%': {
  	                'background-position': '100% 50%'
  	            }
  	        }
  	    },
  		colors: {
  			primary: {
  				'50': '#eef2ff',
  				'100': '#e0e7ff',
  				'200': '#c7d2fe',
  				'300': '#a5b4fc',
  				'400': '#818cf8',
  				'500': '#6366f1',
  				'600': '#4f46e5',
  				'700': '#4338ca',
  				'800': '#3730a3',
  				'900': '#312e81',
  				'950': '#1e1b4b',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			surface: {
  				'50': '#f9fafb',
  				'100': '#f3f4f6',
  				'200': '#e5e7eb',
  				'300': '#d1d5db',
  				'400': '#9ca3af',
  				'500': '#6b7280',
  				'600': '#4b5563',
  				'700': '#374151',
  				'800': '#1f2937',
  				'900': '#111827',
  				'950': '#030712'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		boxShadow: {
  			soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)'
  		},
  		animation: {
  			'slide-in': 'slide-in 0.2s ease-out'
  		},
  		keyframes: {
  			'slide-in': {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(0)'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/forms'),
      require("tailwindcss-animate")
],
}
