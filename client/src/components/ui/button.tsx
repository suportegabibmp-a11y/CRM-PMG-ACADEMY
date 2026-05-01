import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glass' | 'success' | 'warning' | 'info'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg'
  loading?: boolean
}

const getVariantClasses = (variant?: string) => {
  switch (variant) {
    case 'destructive': return "bg-red-600 text-white hover:bg-red-700"
    case 'outline': return "border border-gray-300 bg-white hover:bg-gray-50"
    case 'secondary': return "bg-gray-100 text-gray-900 hover:bg-gray-200"
    case 'ghost': return "hover:bg-gray-100 hover:text-gray-900"
    case 'link': return "text-blue-600 underline-offset-4 hover:underline"
    case 'success': return "bg-green-600 text-white hover:bg-green-700"
    case 'warning': return "bg-yellow-600 text-white hover:bg-yellow-700"
    case 'info': return "bg-blue-600 text-white hover:bg-blue-700"
    default: return "bg-blue-600 text-white hover:bg-blue-700"
  }
}

const getSizeClasses = (size?: string) => {
  switch (size) {
    case 'sm': return "h-9 rounded-md px-3"
    case 'lg': return "h-11 rounded-md px-8"
    case 'xl': return "h-12 rounded-lg px-10 text-base"
    case 'icon': return "h-10 w-10"
    case 'icon-sm': return "h-8 w-8 rounded-md"
    case 'icon-lg': return "h-12 w-12 rounded-lg"
    default: return "h-10 px-4 py-2"
  }
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
    const variantClasses = getVariantClasses(variant)
    const sizeClasses = getSizeClasses(size)
    
    return (
      <button
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className || ''}`}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
