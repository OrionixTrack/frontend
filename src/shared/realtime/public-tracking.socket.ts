import { io, type Socket } from 'socket.io-client'

import { API_BASE_URL } from '@core/api'

export type PublicTripStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled'

export interface PublicPositionUpdatePayload {
  tripId: number
  latitude: number
  longitude: number
  speed?: number | null
  bearing?: number | null
  datetime: string
}

export interface PublicTripStatusPayload {
  tripId: number
  status: PublicTripStatus
}

export interface PublicChannelReassignedPayload {
  tripId: number | null
}

const socketUrl = `${API_BASE_URL}/tracking`
let socket: Socket | null = null
let pendingToken: string | null = null

const ensureSocket = (channelToken: string): Socket => {
  if (socket && pendingToken === channelToken) {
    if (!socket.connected) {
      socket.connect()
    }
    return socket
  }

  socket?.disconnect()
  pendingToken = channelToken

  socket = io(socketUrl, {
    autoConnect: true,
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    if (pendingToken) {
      socket?.emit('subscribe:channel', { token: pendingToken })
    }
  })

  return socket
}

export const connectPublicTrackingSocket = (channelToken: string): void => {
  ensureSocket(channelToken)
}

export const disconnectPublicTrackingSocket = (): void => {
  socket?.disconnect()
  socket = null
  pendingToken = null
}

export const onPublicPositionUpdate = (
  listener: (payload: PublicPositionUpdatePayload) => void,
): (() => void) => {
  socket?.on('position:update', listener)
  return () => {
    socket?.off('position:update', listener)
  }
}

export const onPublicTripStatus = (
  listener: (payload: PublicTripStatusPayload) => void,
): (() => void) => {
  socket?.on('trip:status', listener)
  return () => {
    socket?.off('trip:status', listener)
  }
}

export const onPublicChannelReassigned = (
  listener: (payload: PublicChannelReassignedPayload) => void,
): (() => void) => {
  socket?.on('channel:reassigned', listener)
  return () => {
    socket?.off('channel:reassigned', listener)
  }
}
