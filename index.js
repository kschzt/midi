import midi from 'midi'
import startClock from './src/clock'
import deepool from 'deepool'

const port = 4 // MIDI output port
const channel = 0x8f + 1 // 0x8f + MIDI channel
const frameEvents = new Map()
let frameNumber = 0
let patternStep = 0

// Create array pool for frame MIDI events
const pool = deepool.create(() => {
  console.log('Grow Array Pool to', pool.size())
  return [ 0, 0, 0 ]
})
pool.grow(8)

// Trigger a note.
const triggerNote = (channel, note, velocity, frameLength) => {
  // Take arrays for on/off messages from the pool.
  const noteOn = pool.use()
  const noteOff = pool.use()
  noteOn.length = noteOff.length = 0
  noteOn[0] = noteOff[0] = channel
  noteOn[1] = noteOff[1] = note
  noteOn[2] = velocity
  noteOff[2] = 0
  scheduleFrameEvent(frameNumber, noteOn)
  scheduleFrameEvent(frameNumber + frameLength, noteOff)
}

// Schedule a MIDI event for a frame.
function scheduleFrameEvent(frameNumber, evt) {
  let events = frameEvents.get(frameNumber)
  if (!events) {
    // Take an array for the frame's events from the pool.
    events = pool.use()
    events.length = 0
  }
  events.push(evt)
  frameEvents.set(frameNumber, events)
}

// Trigger the scheduled MIDI events for a frame.
function triggerFrameEvents(frameNumber) {
  const events = frameEvents.get(frameNumber)
  for (let i = 0; i < events.length; i++) {
    output.sendMessage(events[i])
    // Return the event's array to the pool.
    pool.recycle(events[i])
  }
  frameEvents.delete(frameNumber)
  // Return the frame's array to the pool.
  pool.recycle(events)
}

// Generate notes for pattern step.
const notes = [ 24, 25, 36, 39, 48, 51, 60, ]
function triggerStep(step) {
  if (step % 4 === 0) {
    triggerNote(channel, notes[Math.floor(Math.random() * notes.length)], 100, 4)
  }
  if (Math.random() > 0.3) {
    triggerNote(channel, notes[Math.floor(Math.random() * notes.length)], 50, 2)
  }
}

// Connect MIDI
const output = new midi.output()
console.log(output.getPortName(port))
output.openPort(port)

// Start the clock
startClock(output, () => {
  frameNumber++
  patternStep = frameNumber / 6 - 1 % 16

  // Trigger logic for step.
  if (frameNumber % 6 === 0) {
    triggerStep(patternStep % 16)
  }

  // Trigger MIDI events for this frame.
  if (frameEvents.has(frameNumber)) {
    triggerFrameEvents(frameNumber)
  }
})
