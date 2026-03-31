import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // 初始值设置为false，确保服务器端和客户端渲染一致
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // 只在客户端执行，避免服务器端错误
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const onChange = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }
      mql.addEventListener("change", onChange)
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      return () => mql.removeEventListener("change", onChange)
    }
  }, [])

  return isMobile
}
