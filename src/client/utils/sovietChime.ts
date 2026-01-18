// Soviet-era inspired digital coo-coo chime
// Inspired by 1960s-70s Soviet electronic music - simple, pure tones with minimal ornamentation

export function playSovietChime(hour: number) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

  // How many chimes based on 12-hour format
  const chimeCount = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

  // Play a two-tone "coo-coo" sound, Soviet electronic style
  const playCooCoo = (startTime: number) => {
    // First tone: Higher pitch (like "coo")
    const osc1 = audioContext.createOscillator()
    const gain1 = audioContext.createGain()

    osc1.type = 'square' // Soviet-era square waves
    osc1.frequency.setValueAtTime(800, startTime)
    osc1.frequency.exponentialRampToValueAtTime(750, startTime + 0.08) // Slight pitch bend

    gain1.gain.setValueAtTime(0, startTime)
    gain1.gain.linearRampToValueAtTime(0.15, startTime + 0.01) // Attack
    gain1.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15) // Decay

    osc1.connect(gain1)
    gain1.connect(audioContext.destination)

    osc1.start(startTime)
    osc1.stop(startTime + 0.15)

    // Second tone: Lower pitch (like "coo")
    const osc2 = audioContext.createOscillator()
    const gain2 = audioContext.createGain()

    osc2.type = 'square'
    osc2.frequency.setValueAtTime(600, startTime + 0.15)
    osc2.frequency.exponentialRampToValueAtTime(560, startTime + 0.23)

    gain2.gain.setValueAtTime(0, startTime + 0.15)
    gain2.gain.linearRampToValueAtTime(0.15, startTime + 0.16)
    gain2.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)

    osc2.connect(gain2)
    gain2.connect(audioContext.destination)

    osc2.start(startTime + 0.15)
    osc2.stop(startTime + 0.3)
  }

  // Play the chime sequence
  for (let i = 0; i < chimeCount; i++) {
    const chimeTime = audioContext.currentTime + (i * 0.6) // 600ms between chimes
    playCooCoo(chimeTime)
  }
}
