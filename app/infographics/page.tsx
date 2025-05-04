import dynamic from "next/dynamic"

// Use dynamic import with SSR disabled for the HistoricalPandemics component
const HistoricalPandemics = dynamic(() => import("@/components/historical-pandemics"))

export default function HistoricalPage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Historical Pandemic Data</h1>
        <p className="text-muted-foreground">
          Explore data visualizations of major historical pandemics including COVID-19, the Bubonic Plague, Ebola,
          Spanish Flu, and more.
        </p>
      </div>
      <HistoricalPandemics />
    </div>
  )
}

