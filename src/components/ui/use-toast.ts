// Adapted from https://ui.shadcn.com/
import { useEffect, useState } from "react"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000

export type ToastActionElement = React.ReactElement

export type Toast = {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function generateId() {
  return `${count++}`
}

// Simple toast store
const toasts: Toast[] = []
const listeners: Set<Function> = new Set()

const addToast = (toast: Omit<Toast, "id">) => {
  const id = generateId()
  const newToast = { id, ...toast }
  toasts.unshift(newToast)
  
  if (toasts.length > TOAST_LIMIT) {
    toasts.pop()
  }
  
  listeners.forEach(listener => listener([...toasts]))
  
  return id
}

const updateToast = (id: string, toast: Partial<Toast>) => {
  const index = toasts.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts[index] = { ...toasts[index], ...toast }
    listeners.forEach(listener => listener([...toasts]))
  }
}

const dismissToast = (id: string) => {
  const index = toasts.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.splice(index, 1)
    listeners.forEach(listener => listener([...toasts]))
  }
  
  setTimeout(() => {
    removeToast(id)
  }, TOAST_REMOVE_DELAY)
}

const removeToast = (id: string) => {
  const index = toasts.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.splice(index, 1)
    listeners.forEach(listener => listener([...toasts]))
  }
}

export function useToast() {
  const [state, setState] = useState<Toast[]>([])
  
  useEffect(() => {
    listeners.add(setState)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  return {
    toasts: state,
    toast: (props: Omit<Toast, "id">) => {
      return addToast(props)
    },
    dismiss: (toastId?: string) => {
      if (toastId) {
        dismissToast(toastId)
      }
    },
    update: (toastId: string, props: Partial<Toast>) => {
      updateToast(toastId, props)
    },
  }
}