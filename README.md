# midi

Playing around with Node.js MIDI. 

This is a baseline test for whether it's possible to build a tight MIDI system in Node.

Currently, this just sends a stable clock, along with some random notes on one channel.

Trying to keep the timing stable and avoid GC, it pools all the note messages.

Some directions to go from here:
- Various note generator functions
- Separate trigger and note generator functions
- Some way to "track" triggers/functions/notes in pattern steps
- MIDI note middleware (for MIDI effect functions like delay)
- Multiple channels support
- CC generator functions

