import { io, type Socket } from 'socket.io-client'

import { API_BASE_URL } from '@core/api'

import type { OwnerTripStatus } from '../types/OwnerTripStatus'
import type { OwnerTripTelemetry } from '../types/OwnerTripTelemetry'

export interface TripStatusEventPayload {
  tripId: number
  status: OwnerTripStatus
}

export interface TelemetryUpdateEventPayload extends OwnerTripTelemetry {
  tripId: number
}

const trackingSocketUrl = `${API_BASE_URL}/tracking`
let socket: Socket | null = null
let activeToken: string | null = null
const companySubscriptions = new Set<number>()
const tripSubscriptions = new Set<number>()

const ensureSocket = (token: string): Socket => {
  if (socket && activeToken === token) {
    if (!socket.connected) {
      socket.connect()
    }

    return socket
  }

  socket?.disconnect()

  socket = io(trackingSocketUrl, {
    auth: {
      token,
    },
    autoConnect: true,
    transports: ['websocket'],
  })

  activeToken = token

  socket.on('connect', () => {
    companySubscriptions.forEach((companyId) => {
      socket?.emit('subscribe:company', { companyId })
    })

    tripSubscriptions.forEach((tripId) => {
      socket?.emit('subscribe:trip', { tripId })
    })
  })

  return socket
}

export const connectTrackingSocket = (token: string): Socket =>
  ensureSocket(token)

export const disconnectTrackingSocket = (): void => {
  companySubscriptions.clear()
  tripSubscriptions.clear()
  socket?.disconnect()
  socket = null
  activeToken = null
}

export const subscribeCompany = (token: string, companyId: number): void => {
  const instance = ensureSocket(token)
  companySubscriptions.add(companyId)
  instance.emit('subscribe:company', { companyId })
}

export const unsubscribeCompany = (companyId: number): void => {
  companySubscriptions.delete(companyId)
  socket?.emit('unsubscribe:company', { companyId })
}

export const subscribeTrip = (token: string, tripId: number): void => {
  const instance = ensureSocket(token)
  tripSubscriptions.add(tripId)
  instance.emit('subscribe:trip', { tripId })
}

export const unsubscribeTrip = (tripId: number): void => {
  tripSubscriptions.delete(tripId)
  socket?.emit('unsubscribe:trip', { tripId })
}

export const onTripStatus = (
  listener: (payload: TripStatusEventPayload) => void,
): (() => void) => {
  socket?.on('trip:status', listener)

  return () => {
    socket?.off('trip:status', listener)
  }
}

export const onTelemetryUpdate = (
  listener: (payload: TelemetryUpdateEventPayload) => void,
): (() => void) => {
  socket?.on('telemetry:update', listener)

  return () => {
    socket?.off('telemetry:update', listener)
  }
}
