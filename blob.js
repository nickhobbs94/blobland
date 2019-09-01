let AREA_LEFT_MAX = 0
let AREA_RIGHT_MAX = 500
let AREA_UP_MAX = 0
let AREA_DOWN_MAX = 500
let MAX_BLOBS = 1000


let UMOVE = ["UMOVE", 1]
let DMOVE = ["DMOVE", 1]
let LMOVE = ["LMOVE", 1]
let RMOVE = ["RMOVE", 1]
let CONVERT = ["CONVERT", 0]
let REPRODUCE = ["REPRODUCE", 4]
let NOP = ["NOP", 0]
let DETECT = ["DETECT", 0]
let U1JUMP = ["U1JUMP", 0]
let U2JUMP = ["U2JUMP", 0]
let U3JUMP = ["U3JUMP", 0]
let U4JUMP = ["U4JUMP", 0]
let D1JUMP = ["D1JUMP", 0]
let D2JUMP = ["D2JUMP", 0]
let D3JUMP = ["D3JUMP", 0]
let D4JUMP = ["D4JUMP", 0]
let TOP = ["TOP", 0]
let REVERSE = ["REVERSE", 0]


let = all_instructions = [
  UMOVE,
  DMOVE,
  LMOVE,
  RMOVE,
  CONVERT,
  REPRODUCE,
  NOP,
  DETECT,
  U1JUMP,
  U2JUMP,
  U3JUMP,
  U4JUMP,
  D1JUMP,
  D2JUMP,
  D3JUMP,
  D4JUMP,
  TOP,
  REVERSE
]

function randint(min, max) {
  return Math.floor(Math.random() * max) + min;
}

class Blob {
  constructor() {
    this.id = randint(0, 1000000000)
    this.x = 0
    this.y = 0
    this.energy = 0
    this.instructions = []
    this.counter = 0
    this.reverse = false
    this.color = {r: 0, g: 0, b: 0}
  }
  summary() {
    return ("X: " + this.x + ", Y: " + this.y + ", Energy: " + this.energy 
      + ", Current Instructions: " 
      + this.instructions[this.counter-4][0] + " "
      + this.instructions[this.counter-3][0] + " "
      + this.instructions[this.counter-2][0] + " "
      + this.instructions[this.counter-1][0] + " _"
      + this.instructions[this.counter][0] + "_ "
      + this.instructions[this.counter+1][0] + " "
      + this.instructions[this.counter+2][0] + " "
      )
  }
}

class EnergyZone {
  constructor(x, y, radius){
    this.x = x
    this.y = y
    this.radius = radius
  }
  contains(x,y) {
    return (dist(x, y, this.x, this.y) < this.radius)
  }
  draw(r,g,b,alpha) {
    let c = color(r, g, b, alpha);
    fill(c);
    noStroke();
    circle(this.x, this.y, this.radius * 2);
  }
}

function energyDistribution(blob, energyZones) {
  for (const zone of energyZones) {
    if (zone.contains(blob.x, blob.y)){
      return 20
    }
  }
  return 0
}

function generate_our_blobbly_boys() {
  all_new_blobby_boys = []
  
  for(let i = 0; i < 1000; i++) {
    let the_only_blob = new Blob()
    the_only_blob.x = randint(AREA_LEFT_MAX, AREA_RIGHT_MAX)
    the_only_blob.y = randint(AREA_UP_MAX, AREA_DOWN_MAX)
    the_only_blob.energy = 400
    the_only_blob.color.r = randint(50,255)
    the_only_blob.color.g = randint(50,255)
    the_only_blob.color.b = randint(50,255)
    the_only_blob.instructions = []

    for (let i = 0; i < randint(1, 10000); i++) {
      rando_instruction_index = randint(0, all_instructions.length - 1)
      the_only_blob.instructions.push(all_instructions[rando_instruction_index])
    }
    
    all_new_blobby_boys.push(the_only_blob)
  }
  
  return all_new_blobby_boys

}

function generate_our_zones(n) {
  newZones = []
  for (let i=0; i<n; i++) {
    newZones.push(
      new EnergyZone(randint(100,400), randint(100,400), randint(10,100))
    )
  }
  return newZones
}

function mutate(instructions) {

  let new_instructions = []

  for (let instruction of instructions) {
    if (randint(0, 10) == 5) {
      rando_instruction_index = randint(0, all_instructions.length - 1)
      new_instructions.push(all_instructions[rando_instruction_index])
    } else {
      new_instructions.push(instruction)
    }

    if (randint(0, 50) == 1) {
      new_instructions.push(instruction)
    }

    if (randint(0, 10) == 5) {
      at_rando_index = randint(0, instructions.length)
      rando_instruction_index = randint(0, all_instructions.length - 1)
      new_instructions.splice(at_rando_index, 0, all_instructions[rando_instruction_index])
    }
  }

  return new_instructions
}

function reproduce(blob, all_blobs, threshold){
  if (blob.energy > threshold) {
      baby_blob = new Blob()
      baby_blob.x = blob.x + randint(-10,10)
      baby_blob.y = blob.y + randint(-10,10)
      baby_blob.color = blob.color

      baby_blob.energy = blob.energy / 2
      blob.energy = blob.energy / 2

      baby_blob.instructions = mutate(blob.instructions)

      all_blobs.push(baby_blob)
    }
}

function step(blob, all_blobs, energyZones) {
  reproduce(blob, all_blobs, 2000)
  blob.energy -= 1 // Living sucks man

  if (blob.counter >= blob.instructions.length || blob.counter < 0) return;

  if (blob.energy <= 0) return;

  curr = blob.instructions[blob.counter]

  switch (curr[0]) {
    case NOP[0]: {}
    break;
  case UMOVE[0]: {
    blob.y += 1
  }
  break;
  case DMOVE[0]: {
    blob.y -= 1
  }
  break;
  case LMOVE[0]: {
    blob.x -= 1
  }
  break;
  case RMOVE[0]: {
    blob.x += 1
  }
  break;
  case CONVERT[0]: {
    blob.energy += energyDistribution(blob, energyZones)
  }
  break;
  case REPRODUCE[0]: {
    reproduce(blob, all_blobs, 1000)
  }
  break;
  case DETECT[0]: {
    for (let zone of energyZones) {
      if (zone.contains(blob)) {
        if (blob.reverse) {
          blob.counter -= 1
        } else {
          blob.counter += 1
        }
      }
    }
  }
  break;
  case U1JUMP[0]: {
    blob.counter -= 1
  }
  break;
  case U2JUMP[0]: {
    blob.counter -= 2
  }
  break;
  case U3JUMP[0]: {
    blob.counter -= 3
  }
  break;
  case U4JUMP[0]: {
    blob.counter -= 4
  }
  break;
  case D1JUMP[0]: {
    blob.counter += 1
  }
  break;
  case D2JUMP[0]: {
    blob.counter += 2
  }
  break;
  case D3JUMP[0]: {
    blob.counter += 3
  }
  break;
  case D4JUMP[0]: {
    blob.counter += 4
  }
  break;
  case TOP[0]: {
    blob.counter = 0
  }
  break;
  case REVERSE[0]: {
    blob.reverse = !blob.reverse
  }
  break;
  }

  blob.energy -= curr[1]

  if (blob.reverse) blob.counter -= 1;
  else blob.counter += 1;

}


all_blobs = []
energyZones = []

function setup() {
  frameRate(30);
  var canvas = createCanvas(AREA_RIGHT_MAX, AREA_DOWN_MAX);
  canvas.parent('canvas');
  all_blobs = generate_our_blobbly_boys()
  energyZones = generate_our_zones(5)
}

function draw_blob(blob) {
  let c = color(blob.color.r, blob.color.g, blob.color.b);
  fill(c);
  noStroke();
  circle(blob.x, blob.y, 5);
}

function squish(blob, all_blobs) {
  for (let otherBlob of all_blobs) {
    if (dist(otherBlob.x,otherBlob.y,blob.x,blob.y) < 1) {
      otherBlob.x += 0.5 * (otherBlob.x - blob.x)
      otherBlob.y += 0.5 * (otherBlob.y - blob.y)
      blob.x -= 0.5 * (otherBlob.x - blob.x)
      blob.y -= 0.5 * (otherBlob.y - blob.y)
    }
  }
}

function mouseClicked() {
  for (let blob of all_blobs) {
    if (dist(blob.x, blob.y, mouseX, mouseY) < 10) {
      document.getElementById("blobinfo").innerHTML = blob.summary();
    }
  }
}

let cycleCount = 0

function draw() {
  background(0, 0, 0);

  for (let blob of all_blobs) {
    step(blob, all_blobs, energyZones)
    //squish(blob, all_blobs)
    draw_blob(blob)

    if (blob.energy <= 0 || all_blobs.length > MAX_BLOBS) {
      all_blobs = all_blobs.filter(b => b.id != blob.id)
    }
  }
  for (let zone of energyZones){
    zone.draw(0,255,255,100);
  }

  cycleCount += 1
  if (cycleCount > 100) {
    cycleCount = 0
    energyZones = generate_our_zones(5)
  }
}
