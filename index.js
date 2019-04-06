import midi from 'midi'
import startClock from './src/clock'

const channel = 0x8f + 14 // 0x8f + MIDI channel
const velocity = 100
const newNotes = [] // notes waiting to get on
const noteOn = [ channel, 60, velocity ]
const noteOff = [ channel, 60, 0 ]
const noteOns = {}
const noteOffs = {}
let frameNumber = 0
let patternStep = 0

const triggerNote = (note, frameLength, framesFromNow = 0) => {
  const frame = frameNumber + framesFromNow
  noteOns[frame] = note
  noteOffs[frame + frameLength] = note
}

let notes = [ 20, 25, 32, 37, 44, 51, 58, 66, ]

function triggerStep(step) {
  console.log(step)
  if (Math.random() > 0.3) {
    triggerNote(60 + Math.random() * 80, 1)
  }

  if (step % 4 === 0) {
    triggerNote(notes[Math.floor(Math.random() * notes.length)], 2)
  }
}

// Connect MIDI
const output = new midi.output()
console.log(output.getPortName(0))
output.openPort(0)

// Start the clock
startClock(output, () => {
  frameNumber++

  patternStep = frameNumber / 6 - 1 % 16

  // Trigger note-offs queued for this frame
  if (noteOffs[frameNumber]) {
    noteOff[1] = noteOffs[frameNumber]
    output.sendMessage(noteOff)
    delete noteOffs[frameNumber]
  }

  // Trigger logic for frame
  if (frameNumber % 6 === 0) {
    triggerStep(patternStep % 16)
  }

  // Trigger new notes created in this frame.
  if (noteOns[frameNumber]) {
    noteOn[1] = noteOns[frameNumber]
    // Run note middleware here.
    output.sendMessage(noteOn)
    delete noteOns[frameNumber]
  }
})
