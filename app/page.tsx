import dynamic from "next/dynamic"

// Use dynamic import with SSR disabled for the PandemicSimulator component
// This ensures the component only loads on the client side where it can access browser APIs
const PandemicSimulator = dynamic(() => import("@/components/pandemic-simulator"))

export default function Home() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Pandemic Spread Simulator</h1>
        <p className="text-muted-foreground">
          Visualise how a pandemic spreads across the globe. This simulation uses a LSTM model to simulate the spread of a disease. You can adjust the parameters to see how they affect the spread of the disease.
        </p>
      </div>
      <PandemicSimulator />
    </div>
  )
}

