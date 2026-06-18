'use client'
import { useState, useEffect } from 'react'

export default function GoldBarWelcome() {
  const [name, setName] = useState('')
  useEffect(() => {
    try { setName(localStorage.getItem('dudemd-first-name') || '') } catch {}
  }, [])
  if (!name) return null
  return <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-navy)' }}>Welcome, {name}</span>
}
