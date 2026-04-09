export interface OwnerTripMetricAggregate {
  min?: number | null
  max?: number | null
  avg?: number | null
}

export interface OwnerTripMetricChartPoint {
  datetime: string
  value: number
}

export interface OwnerTripStats {
  tripId?: number | null
  temperature?: OwnerTripMetricAggregate | null
  humidity?: OwnerTripMetricAggregate | null
  speed?: OwnerTripMetricAggregate | null
  totalPoints?: number | null
  temperatureChart?: OwnerTripMetricChartPoint[] | null
  humidityChart?: OwnerTripMetricChartPoint[] | null
  speedChart?: OwnerTripMetricChartPoint[] | null
}
