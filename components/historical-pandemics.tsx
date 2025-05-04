"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const covidData = [
  { month: "Jan 2020", cases: 11953, deaths: 259 },
  { month: "Feb 2020", cases: 87137, deaths: 2_873 },
  { month: "Mar 2020", cases: 823_626, deaths: 40_598 },
  { month: "Apr 2020", cases: 3_175_207, deaths: 224_172 },
  { month: "May 2020", cases: 6_057_853, deaths: 371_166 },
  { month: "Jun 2020", cases: 10_357_662, deaths: 508_055 },
  { month: "Jul 2020", cases: 17_396_943, deaths: 675_060 },
  { month: "Aug 2020", cases: 25_356_942, deaths: 851_989 },
  { month: "Sep 2020", cases: 33_846_093, deaths: 1_008_525 },
  { month: "Oct 2020", cases: 45_968_798, deaths: 1_187_360 },
  { month: "Nov 2020", cases: 62_844_837, deaths: 1_460_000 },
  { month: "Dec 2020", cases: 81_963_694, deaths: 1_800_000 },
  { month: "Jan 2021", cases: 102_593_717, deaths: 2_100_000 },
  { month: "Feb 2021", cases: 113_793_180, deaths: 2_500_000 },
  { month: "Mar 2021", cases: 128575654, deaths: 2_800_000 },
];


// Covid- Country wise
const covidCountryData = [
  { name: "USA", cases: 29423015, deaths: 534673 },
  { name: "India", cases: 11359048, deaths: 158607 },
  { name: "Brazil", cases: 11439558, deaths: 277102 },
  { name: "France", cases: 4131872, deaths: 90583 },
  { name: "Russia", cases: 4341381, deaths: 90558 },
  { name: "UK", cases: 4271710, deaths: 125753 },
  { name: "Italy", cases: 3223142, deaths: 102145 },
  { name: "Spain", cases: 3183704, deaths: 72258 },
];

// Plague

const plagueData = [
  { year: "1347", deaths: 1000000, region: "Europe" },
  { year: "1348", deaths: 7000000, region: "Europe" },
  { year: "1349", deaths: 10000000, region: "Europe" },
  { year: "1350", deaths: 8000000, region: "Europe" },
  { year: "1351", deaths: 4000000, region: "Europe" },
];


//Ebola

const ebolaData = [
  { year: "2014", cases: 3906, deaths: 2536, country: "Guinea" },
  { year: "2014", cases: 8018, deaths: 3436, country: "Liberia" },
  { year: "2014", cases: 9446, deaths: 2758, country: "Sierra Leone" },
  { year: "2015", cases: 10875, deaths: 279, country: "Guinea" },
  { year: "2015", cases: 2657, deaths: 1373, country: "Liberia" },
  { year: "2015", cases: 4615, deaths: 1198, country: "Sierra Leone" },
];

//Spanish flu
const spanishFluData = [
  { month: "Mar 1918", cases: 48200, deaths: 1530 },
  { month: "Apr 1918", cases: 124500, deaths: 3870 },
  { month: "May 1918", cases: 238900, deaths: 7450 },
  { month: "Jun 1918", cases: 387600, deaths: 12040 },
  { month: "Jul 1918", cases: 523400, deaths: 16250 },
  { month: "Aug 1918", cases: 987600, deaths: 31020 },
  { month: "Sep 1918", cases: 1543200, deaths: 51230 },
  { month: "Oct 1918", cases: 2876500, deaths: 143200 },
  { month: "Nov 1918", cases: 2438900, deaths: 121560 },
  { month: "Dec 1918", cases: 1987600, deaths: 98740 },
  { month: "Jan 1919", cases: 1432100, deaths: 71250 },
  { month: "Feb 1919", cases: 987600, deaths: 49830 },
];

// Mortality rate comparison
const mortalityRateData = [
  { name: "COVID-19", rate: 2.1 },
  { name: "Spanish Flu", rate: 2.5 },
  { name: "Bubonic Plague", rate: 40 },
  { name: "Ebola", rate: 50 },
  { name: "SARS", rate: 9.6 },
  { name: "MERS", rate: 34.4 },
];

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

// Format large numbers to K (thousands) or M (millions)
const formatYAxis = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value;
};

// Custom tooltip formatter to show values in K/M format
const customTooltipFormatter = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value;
};

export default function HistoricalPandemics() {
  const [selectedPandemic, setSelectedPandemic] = useState("covid19")

  // Ensure all data arrays are properly initialized
  const safeCovidData = covidData || []
  const safeCovidCountryData = covidCountryData || []
  const safePlagueData = plagueData || []
  const safeEbolaData = ebolaData || []
  const safeSpanishFluData = spanishFluData || []
  const safeMortalityRateData = mortalityRateData || []

  // Wrap the component in a try-catch to prevent crashes
  try {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="covid19" onValueChange={setSelectedPandemic} value={selectedPandemic}>
          <TabsList className="grid grid-cols-4 md:w-[600px]">
            <TabsTrigger value="covid19">COVID-19</TabsTrigger>
            <TabsTrigger value="plague">Bubonic Plague</TabsTrigger>
            <TabsTrigger value="ebola">Ebola</TabsTrigger>
            <TabsTrigger value="spanishflu">Spanish Flu</TabsTrigger>
          </TabsList>

          <TabsContent value="covid19" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>COVID-19 Global Cases and Deaths</CardTitle>
                  <CardDescription>Cumulative cases and deaths from January 2020 to March 2021</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={safeCovidData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={formatYAxis} />
                        <Tooltip formatter={customTooltipFormatter} />
                        <Legend />
                        <Line type="monotone" dataKey="cases" stroke="#8884d8" name="Cases" />
                        <Line type="monotone" dataKey="deaths" stroke="#ff7300" name="Deaths" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>COVID-19 Cases by Country</CardTitle>
                  <CardDescription>Top countries by confirmed cases as of March 2021</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={safeCovidCountryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={formatYAxis} />
                        <Tooltip formatter={customTooltipFormatter} />
                        <Legend />
                        <Bar dataKey="cases" fill="#8884d8" name="Cases" />
                        <Bar dataKey="deaths" fill="#ff7300" name="Deaths" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>COVID-19 Timeline</CardTitle>
                <CardDescription>Key events and milestones during the COVID-19 pandemic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-24 font-bold">Dec 2019</div>
                    <div>First cases reported in Wuhan, China</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">Jan 2020</div>
                    <div>WHO declares Public Health Emergency of International Concern</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">Mar 2020</div>
                    <div>WHO declares COVID-19 a pandemic; global lockdowns begin</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">Dec 2020</div>
                    <div>First vaccines receive emergency use authorization</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">2021</div>
                    <div>Mass vaccination campaigns begin worldwide</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plague" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bubonic Plague (Black Death)</CardTitle>
                  <CardDescription>Estimated deaths in Europe during the Black Death (1347-1353)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={safePlagueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={formatYAxis} />
                        <Tooltip formatter={customTooltipFormatter} />
                        <Legend />
                        <Area type="monotone" dataKey="deaths" fill="#8884d8" stroke="#8884d8" name="Deaths" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plague Impact</CardTitle>
                  <CardDescription>The Black Death killed an estimated 30-60% of Europe's population</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold">~75-200M</div>
                      <div className="text-xl mt-2">Estimated Deaths</div>
                      <div className="mt-4 text-muted-foreground">
                        The plague reduced the world population from an estimated 475 million to 350-375 million in the
                        14th century.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Bubonic Plague Timeline</CardTitle>
                <CardDescription>Key events during the Black Death pandemic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-24 font-bold">1347</div>
                    <div>Plague arrives in Sicily from ships coming from the Black Sea</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">1348</div>
                    <div>Plague spreads throughout Italy, France, and Spain</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">1349</div>
                    <div>Plague reaches England, Scotland, and Scandinavia</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">1350-1351</div>
                    <div>Plague reaches Eastern Europe and Russia</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">1353</div>
                    <div>First wave of the Black Death subsides in Europe</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ebola" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>2014-2016 Ebola Outbreak</CardTitle>
                  <CardDescription>Cases and deaths by country during the West African Ebola epidemic</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={safeEbolaData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="country" />
                        <YAxis tickFormatter={formatYAxis} />
                        <Tooltip formatter={customTooltipFormatter} />
                        <Legend />
                        <Bar dataKey="cases" fill="#8884d8" name="Cases" />
                        <Bar dataKey="deaths" fill="#ff7300" name="Deaths" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ebola Fatality Rate</CardTitle>
                  <CardDescription>Ebola virus disease has an average case fatality rate of around 50%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold">~11,300</div>
                      <div className="text-xl mt-2">Deaths (2014-2016)</div>
                      <div className="mt-4 text-muted-foreground">
                        The 2014-2016 outbreak was the largest Ebola outbreak in history, with more than 28,600 cases.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ebola Timeline</CardTitle>
                <CardDescription>Key events during the 2014-2016 West African Ebola outbreak</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-24 font-bold">Dec 2013</div>
                    <div>First case identified in Guinea (retrospectively)</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">Mar 2014</div>
                    <div>Outbreak officially recognized by WHO</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">Aug 2014</div>
                    <div>WHO declares Public Health Emergency of International Concern</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">2015</div>
                    <div>Vaccine trials begin; cases start to decline</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">Jun 2016</div>
                    <div>WHO declares end of Ebola transmission in West Africa</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spanishflu" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>1918 Spanish Flu Pandemic</CardTitle>
                  <CardDescription>Monthly cases and deaths during the 1918-1919 influenza pandemic</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={safeSpanishFluData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={formatYAxis} />
                        <Tooltip formatter={customTooltipFormatter} />
                        <Legend />
                        <Line type="monotone" dataKey="cases" stroke="#8884d8" name="Cases" />
                        <Line type="monotone" dataKey="deaths" stroke="#ff7300" name="Deaths" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spanish Flu Impact</CardTitle>
                  <CardDescription>The Spanish Flu infected about one-third of the world's population</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold">~50M</div>
                      <div className="text-xl mt-2">Estimated Deaths</div>
                      <div className="mt-4 text-muted-foreground">
                        The Spanish Flu killed more people than World War I, which had about 20 million deaths.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Spanish Flu Timeline</CardTitle>
                <CardDescription>Key events during the 1918-1919 influenza pandemic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-24 font-bold">Mar 1918</div>
                    <div>First wave begins in the United States</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">Aug 1918</div>
                    <div>Second, more deadly wave begins</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">Sep-Nov 1918</div>
                    <div>Peak of the pandemic with highest mortality rates</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">Jan-Feb 1919</div>
                    <div>Third wave begins</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 font-bold">Summer 1919</div>
                    <div>Pandemic subsides</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mortality Rate Comparison</CardTitle>
              <CardDescription>Case fatality rates of major pandemics throughout history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={safeMortalityRateData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 70]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rate" fill="#8884d8" name="Mortality Rate (%)" radius={[0, 4, 4, 0]}>
                      {safeMortalityRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pandemic Comparison</CardTitle>
              <CardDescription>Key statistics and characteristics of major pandemics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 font-bold border-b pb-2">
                  <div>Pandemic</div>
                  <div>Time Period</div>
                  <div>Est. Deaths</div>
                  <div>Causative Agent</div>
                </div>
                <div className="grid grid-cols-4">
                  <div>COVID-19</div>
                  <div>2019-Present</div>
                  <div>6.8M+</div>
                  <div>SARS-CoV-2</div>
                </div>
                <div className="grid grid-cols-4">
                  <div>Spanish Flu</div>
                  <div>1918-1919</div>
                  <div>50M</div>
                  <div>H1N1 Influenza</div>
                </div>
                <div className="grid grid-cols-4">
                  <div>Bubonic Plague</div>
                  <div>1347-1353</div>
                  <div>75-200M</div>
                  <div>Yersinia pestis</div>
                </div>
                <div className="grid grid-cols-4">
                  <div>Ebola</div>
                  <div>2014-2016</div>
                  <div>11,300</div>
                  <div>Ebolavirus</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error rendering HistoricalPandemics:", error)
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center p-6">
          <h3 className="text-xl font-bold mb-2">Unable to load historical data</h3>
          <p className="text-muted-foreground">
            There was an error loading the pandemic data visualizations. Please try refreshing the page.
          </p>
        </div>
      </div>
    )
  }
}