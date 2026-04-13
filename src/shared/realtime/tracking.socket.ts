import { io, type Socket } from 'socket.io-client'

import { API_BASE_URL } from '@core/api'

export type RealtimeTripStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled'

export interface TripStatusEventPayload {
  tripId: number
  status: RealtimeTripStatus
}

export interface TelemetryUpdateEventPayload {
  tripId: number
  latitude: number
  longitude: number
  speed?: number | null
  bearing?: number | null
  datetime: string
  temperature?: number | null
  humidity?: number | null
}

type TripStatusListener = (payload: TripStatusEventPayload) => void
type TelemetryUpdateListener = (payload: TelemetryUpdateEventPayload) => void

const trackingSocketUrl = `${API_BASE_URL}/tracking`

class TrackingSocketClient {
  private socket: Socket | null = null
  private activeToken: string | null = null
  private readonly companySubscriptions = new Map<number, number>()
  private readonly tripSubscriptions = new Map<number, number>()
  private readonly tripStatusListeners = new Set<TripStatusListener>()
  private readonly telemetryListeners = new Set<TelemetryUpdateListener>()

  connect(token: string): Socket {
    if (this.socket && this.activeToken === token) {
      if (!this.socket.connected) {
        this.socket.connect()
      }

      return this.socket
    }

    this.teardownSocket()

    this.socket = io(trackingSocketUrl, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
      transports: ['websocket'],
    })
    this.activeToken = token
    this.bindSocketEvents(this.socket)

    return this.socket
  }

  disconnect(): void {
    this.companySubscriptions.clear()
    this.tripSubscriptions.clear()
    this.teardownSocket()
    this.activeToken = null
  }

  subscribeCompany(token: string, companyId: number): void {
    const socket = this.connect(token)
    const nextCount = (this.companySubscriptions.get(companyId) ?? 0) + 1
    this.companySubscriptions.set(companyId, nextCount)

    if (nextCount === 1) {
      socket.emit('subscribe:company', { companyId })
    }
  }

  unsubscribeCompany(companyId: number): void {
    const currentCount = this.companySubscriptions.get(companyId)

    if (!currentCount) {
      return
    }

    if (currentCount === 1) {
      this.companySubscriptions.delete(companyId)
      this.socket?.emit('unsubscribe:company', { companyId })
      return
    }

    this.companySubscriptions.set(companyId, currentCount - 1)
  }

  subscribeTrip(token: string, tripId: number): void {
    const socket = this.connect(token)
    const nextCount = (this.tripSubscriptions.get(tripId) ?? 0) + 1
    this.tripSubscriptions.set(tripId, nextCount)

    if (nextCount === 1) {
      socket.emit('subscribe:trip', { tripId })
    }
  }

  unsubscribeTrip(tripId: number): void {
    const currentCount = this.tripSubscriptions.get(tripId)

    if (!currentCount) {
      return
    }

    if (currentCount === 1) {
      this.tripSubscriptions.delete(tripId)
      this.socket?.emit('unsubscribe:trip', { tripId })
      return
    }

    this.tripSubscriptions.set(tripId, currentCount - 1)
  }

  onTripStatus(listener: TripStatusListener): () => void {
    this.tripStatusListeners.add(listener)

    return () => {
      this.tripStatusListeners.delete(listener)
    }
  }

  onTelemetryUpdate(listener: TelemetryUpdateListener): () => void {
    this.telemetryListeners.add(listener)

    return () => {
      this.telemetryListeners.delete(listener)
    }
  }

  private bindSocketEvents(socket: Socket): void {
    socket.on('connect', () => {
      this.replaySubscriptions()
    })

    socket.on('trip:status', (payload: TripStatusEventPayload) => {
      this.tripStatusListeners.forEach((listener) => listener(payload))
    })

    socket.on('telemetry:update', (payload: TelemetryUpdateEventPayload) => {
      this.telemetryListeners.forEach((listener) => listener(payload))
    })
  }

  private replaySubscriptions(): void {
    this.companySubscriptions.forEach((_count, companyId) => {
      this.socket?.emit('subscribe:company', { companyId })
    })

    this.tripSubscriptions.forEach((_count, tripId) => {
      this.socket?.emit('subscribe:trip', { tripId })
    })
  }

  private teardownSocket(): void {
    if (!this.socket) {
      return
    }

    this.socket.removeAllListeners()
    this.socket.disconnect()
    this.socket = null
  }
}

const trackingSocketClient = new TrackingSocketClient()

export const connectTrackingSocket = (token: string): Socket => trackingSocketClient.connect(token)

export const disconnectTrackingSocket = (): void => {
  trackingSocketClient.disconnect()
}

export const subscribeCompany = (token: string, companyId: number): void => {
  trackingSocketClient.subscribeCompany(token, companyId)
}

export const unsubscribeCompany = (companyId: number): void => {
  trackingSocketClient.unsubscribeCompany(companyId)
}

export const subscribeTrip = (token: string, tripId: number): void => {
  trackingSocketClient.subscribeTrip(token, tripId)
}

export const unsubscribeTrip = (tripId: number): void => {
  trackingSocketClient.unsubscribeTrip(tripId)
}

export const onTripStatus = (listener: TripStatusListener): (() => void) =>
  trackingSocketClient.onTripStatus(listener)

export const onTelemetryUpdate = (listener: TelemetryUpdateListener): (() => void) =>
  trackingSocketClient.onTelemetryUpdate(listener)
