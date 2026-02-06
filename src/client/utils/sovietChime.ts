// Soviet-era inspired digital coo-coo chime
// Inspired by 1960s-70s Soviet electronic music - simple, pure tones with minimal ornamentation
// Each hour has unique sonic characteristics for variety

// Hour-specific sound profiles
const hourProfiles = [
  { name: 'Midnight', wave: 'sine' as OscillatorType, freq1: 400, freq2: 300, rhythm: 0.7, volume: 0.12 },      // 12 AM - Deep, mysterious
  { name: 'One', wave: 'square' as OscillatorType, freq1: 650, freq2: 500, rhythm: 0.5, volume: 0.10 },         // 1 - Quick, quiet
  { name: 'Two', wave: 'triangle' as OscillatorType, freq1: 700, freq2: 520, rhythm: 0.55, volume: 0.11 },     // 2 - Soft triangle
  { name: 'Three', wave: 'square' as OscillatorType, freq1: 750, freq2: 580, rhythm: 0.6, volume: 0.13 },       // 3 - Classic square
  { name: 'Four', wave: 'sine' as OscillatorType, freq1: 680, freq2: 540, rhythm: 0.65, volume: 0.11 },         // 4 - Smooth sine
  { name: 'Five', wave: 'sawtooth' as OscillatorType, freq1: 720, freq2: 560, rhythm: 0.5, volume: 0.14 },     // 5 - Bright sawtooth
  { name: 'Six', wave: 'triangle' as OscillatorType, freq1: 780, freq2: 600, rhythm: 0.6, volume: 0.13 },      // 6 - Morning triangle
  { name: 'Seven', wave: 'square' as OscillatorType, freq1: 820, freq2: 640, rhythm: 0.55, volume: 0.15 },     // 7 - Bright square
  { name: 'Eight', wave: 'sine' as OscillatorType, freq1: 760, freq2: 590, rhythm: 0.6, volume: 0.13 },        // 8 - Calm sine
  { name: 'Nine', wave: 'sawtooth' as OscillatorType, freq1: 800, freq2: 620, rhythm: 0.5, volume: 0.14 },     // 9 - Energetic saw
  { name: 'Ten', wave: 'triangle' as OscillatorType, freq1: 740, freq2: 570, rhythm: 0.65, volume: 0.12 },     // 10 - Mellow triangle
  { name: 'Eleven', wave: 'square' as OscillatorType, freq1: 790, freq2: 610, rhythm: 0.6, volume: 0.13 },     // 11 - Classic square
  { name: 'Noon', wave: 'sawtooth' as OscillatorType, freq1: 850, freq2: 650, rhythm: 0.55, volume: 0.16 },   // 12 PM - Bright, prominent
]

export function playSovietChime(hour: number) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

  // How many chimes based on 12-hour format
  const chimeCount = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

  // Get the hour profile (0-11 for 12-hour clock)
  const hourIndex = hour === 0 ? 0 : hour > 12 ? hour - 12 : hour
  const profile = hourProfiles[hourIndex]

  console.log(`🔔 Chiming ${chimeCount} time${chimeCount !== 1 ? 's' : ''} for ${profile.name} - ${profile.wave} wave`)

  // Play a two-tone "coo-coo" sound with hour-specific characteristics
  const playCooCoo = (startTime: number, bellNumber: number) => {
    // Subtle pitch variation for each bell in the sequence (every 3rd bell slightly higher)
    const pitchVariation = bellNumber % 3 === 0 ? 1.02 : 1.0

    // First tone: Higher pitch (like "coo")
    const osc1 = audioContext.createOscillator()
    const gain1 = audioContext.createGain()

    osc1.type = profile.wave
    osc1.frequency.setValueAtTime(profile.freq1 * pitchVariation, startTime)
    osc1.frequency.exponentialRampToValueAtTime(profile.freq1 * pitchVariation * 0.94, startTime + 0.08)

    gain1.gain.setValueAtTime(0, startTime)
    gain1.gain.linearRampToValueAtTime(profile.volume, startTime + 0.01) // Attack
    gain1.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15) // Decay

    osc1.connect(gain1)
    gain1.connect(audioContext.destination)

    osc1.start(startTime)
    osc1.stop(startTime + 0.15)

    // Second tone: Lower pitch (like "coo")
    const osc2 = audioContext.createOscillator()
    const gain2 = audioContext.createGain()

    osc2.type = profile.wave
    osc2.frequency.setValueAtTime(profile.freq2 * pitchVariation, startTime + 0.15)
    osc2.frequency.exponentialRampToValueAtTime(profile.freq2 * pitchVariation * 0.93, startTime + 0.23)

    gain2.gain.setValueAtTime(0, startTime + 0.15)
    gain2.gain.linearRampToValueAtTime(profile.volume, startTime + 0.16)
    gain2.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)

    osc2.connect(gain2)
    gain2.connect(audioContext.destination)

    osc2.start(startTime + 0.15)
    osc2.stop(startTime + 0.3)
  }

  // Play the chime sequence with hour-specific rhythm
  for (let i = 0; i < chimeCount; i++) {
    const chimeTime = audioContext.currentTime + (i * profile.rhythm)
    playCooCoo(chimeTime, i)
  }
}
