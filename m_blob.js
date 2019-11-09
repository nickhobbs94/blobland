//~~~~~~~~~~~~~~~~~//
function randint(min, max) {
    return Math.floor(Math.random() * max) + min;
}
//~~~~~~~~~~~~~~~~~//
let AREA_LEFT_MAX = 0
let AREA_RIGHT_MAX = 500
let AREA_UP_MAX = 0
let AREA_DOWN_MAX = 500
let MAX_BLOBS = 2000
//~~~~~~~~~~~~~~~~~//



// Inputs
let IN_ENERGY_ZONE = "IN_ENERGY_ZONE"
let NONE = "NONE"
let NEAR_OTHER_SIBLING_BLOB = "NEAR_OTHER_SIBLING_BLOB"
let NEAR_EDGE_OF_SCREEN = "NEAR_EDGE_OF_SCREEN"
let REMAIN_IN_ENERGY_ZONE = "REMAIN_IN_ENERGY_ZONE"
let MOVED_INTO_ENERGY_ZONE = "MOVED_INTO_ENERGY_ZONE"
let MOVED_OUT_OF_ENERGY_ZONE = "MOVED_OUT_OF_ENERGY_ZONE"

let all_inputs = [
IN_ENERGY_ZONE,
// MOVED_INTO_ENERGY_ZONE,
// MOVED_OUT_OF_ENERGY_ZONE,
// REMAIN_IN_ENERGY_ZONE,
NONE
]
// ===================

// Instructions
let UMOVE = ["UMOVE", 1]
let DMOVE = ["DMOVE", 1]
let LMOVE = ["LMOVE", 1]
let RMOVE = ["RMOVE", 1]
let CONVERT = ["CONVERT", 0]
let REPRODUCE = ["REPRODUCE", 0]
let NOP = ["NOP", 0]
let DETECT = ["DETECT", 1]
let U1JUMP = ["U1JUMP", 1]
let U2JUMP = ["U2JUMP", 1]
let U3JUMP = ["U3JUMP", 1]
let U4JUMP = ["U4JUMP", 1]
let D1JUMP = ["D1JUMP", 1]
let D2JUMP = ["D2JUMP", 1]
let D3JUMP = ["D3JUMP", 1]
let D4JUMP = ["D4JUMP", 1]
let TOP = ["TOP", 1]
let REVERSE = ["REVERSE", 1]

all_instructions = [
    UMOVE,
    DMOVE,
    LMOVE,
    RMOVE,
    CONVERT,
    REPRODUCE,
    NOP,
    DETECT,
    TOP,
    REVERSE
]

// ===================


// Blob 
class Blob {

    constructor() {
        this.id = randint(0, 1000000000)
        this.x = 0
        this.y = 0
        this.energy = 0
        this.color = {r: 0, g: 0, b: 0}
        
        // Operations
        this.ops = {}
        this.current = null
        this.counter = 0

        this.prev_input = null
    }

    on(input, ops) { 
        this.ops[input] = ops 
    }

    get_input(all_blobs, energy_zones) {

        let in_energy_zone = false;
        for(let zone of energy_zones) {
            if (zone.contains(this.x, this.y)) return IN_ENERGY_ZONE;
        }

        // if(in_energy_zone) {
        //     return IN_ENERGY_ZONE; // if(this.prev_input != IN_ENERGY_ZONE &&
        //     //    this.prev_input != MOVED_INTO_ENERGY_ZONE) 
        //     // {
        //     //     return MOVED_INTO_ENERGY_ZONE;
        //     // }
        //     // if(this.prev_input == IN_ENERGY_ZONE || 
        //     //     this.prev_input == MOVED_INTO_ENERGY_ZONE) 
        //     // {
        //     //     return REMAIN_IN_ENERGY_ZONE;
        //     // }
        // } else {
        //     // if(this.prev_input == IN_ENERGY_ZONE) return MOVED_OUT_OF_ENERGY_ZONE;
        // }

        return "NONE"
    }

    draw() {
        let c = color(this.color.r, this.color.g, this.color.b);
        fill(c);
        noStroke();
        circle(this.x, this.y, 5);
    }

    summary() {
        return ("X: " + this.x + ", Y: " + this.y + ", Energy: " + this.energy 
            )
    }

}

function generate_our_blobbly_boys() {
    all_new_blobby_boys = []

    for(let i = 0; i < 500; i++) {
        let new_blob = new Blob()
        new_blob.x = randint(AREA_LEFT_MAX, AREA_RIGHT_MAX)
        new_blob.y = randint(AREA_UP_MAX, AREA_DOWN_MAX)
        new_blob.energy = 40
        new_blob.color.r = randint(50,255)
        new_blob.color.g = randint(50,255)
        new_blob.color.b = randint(50,255)

        for(const input of all_inputs) {
            let operations = []
            for (let i = 0; i < randint(0, 40); i++) {
                rando_instruction_index = randint(0, all_instructions.length - 1)
                operations.push(all_instructions[rando_instruction_index])
            }
            new_blob.on(input, operations)
        }

        all_new_blobby_boys.push(new_blob)
    }

    return all_new_blobby_boys

}

function reproduce(blob, all_blobs, threshold){
    if (blob.energy > threshold) {
        baby_blob = new Blob()
        baby_blob.x = blob.x + randint(-5,5)
        baby_blob.y = blob.y + randint(-5,5)
        baby_blob.color = blob.color

        baby_blob.energy = blob.energy / 2
        blob.energy = blob.energy / 2

        baby_blob.ops = mutate(blob.ops)

        all_blobs.push(baby_blob)
    }
}

function mutate(ops) {
    let new_ops = {}
    for(let op in ops) {
        let instructions = ops[op];
        let new_instructions = []

        for (let instruction of instructions) {
            if (randint(0, 100) == 1) {
                continue;
            }

            if (randint(0, 100) == 1) {
                rando_instruction_index = randint(0, all_instructions.length - 1)
                new_instructions.push(all_instructions[rando_instruction_index])
            } else {
                new_instructions.push(instruction)
            }

            if (randint(0, 100) == 1) {
                new_instructions.push(instruction)
            }

            if (randint(0, 100) == 1) {
                at_rando_index = randint(0, instructions.length)
                rando_instruction_index = randint(0, all_instructions.length - 1)
                new_instructions.splice(at_rando_index, 0, all_instructions[rando_instruction_index])
            }
        }
        new_ops[op] = new_instructions
    }
    return new_ops
}


// ===================


// Energy Zone

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


function energy_distribution(blob, energy_zones) {
    let energy = 0
    for (const zone of energy_zones) {
        if (zone.contains(blob.x, blob.y)){
            energy += 8
        }
    }
    return energy
}

function generate_our_zones(n) {
    newZones = []
    for (let i=0; i<n; i++) {
        newZones.push(
            new EnergyZone(
                randint(AREA_LEFT_MAX + 100,AREA_RIGHT_MAX - 240), 
                randint(AREA_UP_MAX + 100,AREA_DOWN_MAX - 240), 
                randint(5,40)
            )
        )
    }
    return newZones
}


// ===================

function do_op(blob, op) {
    if (op == undefined) {
        return
    }

    const op_name = op[0];
    const op_cost = op[1];

    if(blob.energy <= 0) return;

    switch(op_name) {
        case UMOVE[0]: blob.y += .8; break;
        case DMOVE[0]: blob.y -= .8; break;
        case LMOVE[0]: blob.x -= .8; break;
        case RMOVE[0]: blob.x += .8; break;
        case CONVERT[0]: blob.energy += energy_distribution(blob, energy_zones); break;
        case NOP[0]: break;
        // case REPRODUCE[0]: reproduce(blob, all_blobs, 1000); break;
        case U1JUMP[0]: blob.counter -= 1; break;
        case U2JUMP[0]: blob.counter -= 2; break;
        case U3JUMP[0]: blob.counter -= 3; break;
        case U4JUMP[0]: blob.counter -= 4; break;
        case D1JUMP[0]: blob.counter += 1; break;
        case D2JUMP[0]: blob.counter += 2; break;
        case D3JUMP[0]: blob.counter += 3; break;
        case D4JUMP[0]: blob.counter += 4; break;
        case TOP[0]: blob.counter = 0; break;
    }
    blob.energy -= op_cost
}

function step(blob, all_blobs, energy_zones) {

    reproduce(blob, all_blobs, 2000)

    if((blob.current && blob.counter >= blob.current.length) || blob.counter < 0) {
        blob.current = null
        blob.counter = 0
    }

    if(!blob.current) {
        const input = blob.get_input(all_blobs, energy_zones)
        const ops = blob.ops[input]
        blob.current = ops
        blob.counter = 0
    }

    if(blob.current) {
        const op = blob.current[blob.counter]
        blob.counter += 1
        do_op(blob, op)
    }

    blob.energy -= 1;
}

let zone_num = 100;
let energy_zones = []
let all_blobs = []

function setup() {
    frameRate(30);
    var canvas = createCanvas(AREA_RIGHT_MAX, AREA_DOWN_MAX);
    canvas.parent('canvas');
    all_blobs = generate_our_blobbly_boys()
    energy_zones = generate_our_zones(zone_num)
}

let cycleCount = 0
function draw() {
    background(0, 0, 0);

    for (let blob of all_blobs) 
    {
        step(blob, all_blobs, energy_zones)
        blob.draw()

        if (blob.energy <= 0 
            ||  all_blobs.length > MAX_BLOBS
            ||  blob.current == null
            ) {
            all_blobs = all_blobs.filter(b => b.id != blob.id)
    }
}

for (let zone of energy_zones){
    zone.draw(0,255,255,20);
}

cycleCount += 1
if (cycleCount > 100) {
    cycleCount = 0
    zone_num -= 2;
    if(zone_num < 10) zone_num = 10;
    energy_zones = generate_our_zones(zone_num)
    console.log(10 + (10 * (100 - zone_num)/100))
}
}
