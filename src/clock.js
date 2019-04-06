import NanoTimer from 'nanotimer'
const timer = new NanoTimer()

let stepNumber = 0
let message = []

// MIDI Clock
export default function startClock(output, tickFn) {
  // Send MIDI clock start
  message[0] = 0xFA
  output.sendMessage(message)

  const clockStep = () => {
    stepNumber++
    if (stepNumber > 0 && stepNumber % 96 === 0) {
      // Send MIDI continue
      message[0] = 0xFB
      output.sendMessage(message)
    }

    // Send MIDI clock
    message[0] = 0xF8
    output.sendMessage(message)

    // Tick local frame
    tickFn()
  }

  timer.setInterval(clockStep, '', '19m')
}
