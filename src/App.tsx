import Home from "@/views/Home/Home"
import { ThemeProvider } from "@/components/ThemeProvider"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="yy-fund-theme">
      <Home />
    </ThemeProvider>
  )
}

export default App
