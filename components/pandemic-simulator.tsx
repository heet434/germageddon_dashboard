"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import dynamic from "next/dynamic"

// // Import GlobeVisualization with dynamic import to avoid SSR issues
// const GlobeVisualization = dynamic(() => import("@/components/globe-visualization"), {
//   ssr: false,
//   loading: () => (
//     <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg">
//       <div className="text-center">Loading 3D visualization...</div>
//     </div>
//   ),
// })

const GlobeGLVisualization = dynamic(() => import("@/components/globeGL"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="text-center">Loading 3D visualization...</div>
    </div>
  ),
})

export default function PandemicSimulator() {
  // Initialize with safe default values
  const [selectedCountry, setSelectedCountry] = useState("China")
  const [displayType, setDisplayType] = useState("cumulative_cases")
  const [mortalityRate, setMortalityRate] = useState(2)
  const [spreadRate, setSpreadRate] = useState(0.3)
  const [startLocation, setStartLocation] = useState({ lat: 30.5928, lng: 114.3055 }) // Wuhan, China
  const [simulationSpeed, setSimulationSpeed] = useState(5)
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [simulationDay, setSimulationDay] = useState(1)
  const [pointData, setPointData] = useState([]) // Placeholder for point data
  const [spreadData, setSpreadData] = useState([]) // Placeholder for spread data
  const [totalDays, setTotalDays] = useState(0)
  const [currTab, setCurrTab] = useState("historical")

  // load simulated spread data from json file in ../data/output.json
  useEffect(() => {
    // load data from JSON file according to the tab selected
    // historical data is in ../data/historical.json
    // simulated data is in ../data/output.json
    if (currTab === "historical") {
      setSelectedCountry("China")
      if (displayType === "cumulative_cases") {
        setSpreadData(require("../data/historical.json"))
      } else {
        setSpreadData(require("../data/historical_percent.json"))
      }
    }
    if (currTab === "simulator") {
      setSelectedCountry("India")
      setSpreadData(require("../data/output1.json"))
    }
    // setSpreadData(spreadData)
    setTotalDays(spreadData.length)
  }, [currTab])

  // for each day in spreadData, update pointData with its values in fixed intervals
  useEffect(() => {
    const interval = setInterval(() => {
      if (simulationRunning && simulationDay < spreadData.length) {
        const dayKey = `day_${simulationDay}`
        setPointData(spreadData[simulationDay][dayKey])
        console.log("Day: ", simulationDay, "Data: ", spreadData[simulationDay][dayKey])
        setSimulationDay((prev) => prev + 1)
      } else if (simulationDay >= spreadData.length) {
        clearInterval(interval)
      }
    }, 1000 / simulationSpeed)

    return () => clearInterval(interval)
  }, [simulationRunning, simulationDay, spreadData, simulationSpeed])

  // Handle simulation controls
  const toggleSimulation = () => {
    setSimulationRunning((prev) => !prev)
    if (!simulationRunning) {
      setSimulationDay(1)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardContent className="p-0">
            <div className="relative h-[600px] w-full">
              <GlobeGLVisualization pointData={pointData} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="historical" value={currTab} onValueChange={setCurrTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="historical">Historical</TabsTrigger>
                <TabsTrigger value="simulator">Simulator</TabsTrigger>
              </TabsList>

              <TabsContent value="historical" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="hist-country">Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry} disabled>
                    <SelectTrigger id="hist-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="China">China</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="USA">USA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hist-display-type">Display Type</Label>
                  <Select value={displayType} onValueChange={setDisplayType}>
                    <SelectTrigger id="hist-display-type">
                      <SelectValue placeholder="Select display type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cumulative_cases">Cumulative Cases</SelectItem>
                      <SelectItem value="percent_population">Percent of Population</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="hist-mortality-rate">Mortality Rate</Label>
                    <span className="text-sm text-muted-foreground">{mortalityRate}%</span>
                  </div>
                  <Select value={mortalityRate.toString()} onValueChange={(value) => setMortalityRate(Number(value))} disabled>
                    <SelectTrigger id="hist-mortality-rate">
                      <SelectValue placeholder="Select mortality rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="hist-spread-rate">Spread Rate</Label>
                    <span className="text-sm text-muted-foreground">
                      {spreadRate === 0.3 ? "Low (0.3)" : "High (0.6)"}
                    </span>
                  </div>
                  <Select 
                    value={spreadRate.toString()} 
                    onValueChange={(value) => setSpreadRate(Number(value))}
                    disabled
                  >
                    <SelectTrigger id="hist-spread-rate">
                      <SelectValue placeholder="Select spread rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.3">Low (0.3)</SelectItem>
                      <SelectItem value="0.6">High (0.6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="simulator" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="sim-country">Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger id="sim-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="China">China</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="USA">USA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sim-display-type">Display Type</Label>
                  <Select value={displayType} onValueChange={setDisplayType}>
                    <SelectTrigger id="sim-display-type">
                      <SelectValue placeholder="Select display type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent_population">Percent of Population</SelectItem>
                      <SelectItem value="cumulative_cases">Cumulative Cases</SelectItem>
                      <SelectItem value="new_cases">New Cases</SelectItem>
                      <SelectItem value="cumulative_deaths">Cumulative Deaths</SelectItem>
                      <SelectItem value="new_deaths">New Deaths</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="sim-mortality-rate">Mortality Rate</Label>
                    <span className="text-sm text-muted-foreground">{mortalityRate}%</span>
                  </div>
                  <Select value={mortalityRate.toString()} onValueChange={(value) => setMortalityRate(Number(value))}>
                    <SelectTrigger id="sim-mortality-rate">
                      <SelectValue placeholder="Select mortality rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="sim-spread-rate">Spread Rate</Label>
                    <span className="text-sm text-muted-foreground">
                      {spreadRate === 0.3 ? "Low (0.3)" : "High (0.6)"}
                    </span>
                  </div>
                  <Select 
                    value={spreadRate.toString()} 
                    onValueChange={(value) => setSpreadRate(Number(value))}
                  >
                    <SelectTrigger id="sim-spread-rate">
                      <SelectValue placeholder="Select spread rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.3">Low (0.3)</SelectItem>
                      <SelectItem value="0.6">High (0.6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="simulation-speed">Simulation Speed</Label>
                    <span className="text-sm text-muted-foreground">{simulationSpeed}x</span>
                  </div>
                  <Slider
                    id="simulation-speed"
                    min={0.5}
                    max={5}
                    step={0.5}
                    value={[simulationSpeed]}
                    onValueChange={([value]) => setSimulationSpeed(value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">Day: {simulationDay}</div>
                  {simulationRunning && <div className="text-xs text-muted-foreground">Running...</div>}
                </div>
                <button
                  onClick={toggleSimulation}
                  className={`px-4 py-2 rounded-md ${
                    simulationRunning
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                >
                  {simulationRunning ? "Stop" : "Start"}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardContent className="p-6">
              {/* div for credits */}
            <div className="mt-1 text-sm text-muted-foreground">
              <p>
               Project by Heet Patel, Priyansh Awasthi & Shivansh Pal, for DA332 - Data Visualization course at IITG.
              </p>
            </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}