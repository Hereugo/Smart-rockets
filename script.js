const W = 400
const H = 400


var count = 0
var lifeSpan = 300
var population
var objs
var target

function setup() {
	createCanvas(W , H).center();
	population = new Population()
	objs = new Boxes()
	target = new Target()
}

function draw() {	
	background(0)
	population.run()
	objs.show()
	target.show()
	count++
	if (count == lifeSpan) {
		population.evaluate()
		population.selection()
		count = 0
	}
}

function Boxes() {
	this.boxes = []
	this.size = 5
	this.boxes[0] = new Box(0 , 100 , 300 , 100)


	this.boxes[1] = new Box(0 , 0 , 3 , H)
	this.boxes[2] = new Box(0 , H , W , 3)
	this.boxes[3] = new Box(W , 0 , 3 , H)
	this.boxes[4] = new Box(0 , 0 , W , 3)

	this.show = function(){
		for (let i=0; i<this.size; i++) {
			this.boxes[i].show()
		}
	}
}

function Box(x , y , width , height) {
	this.pos = createVector(x , y)
	this.width = width
	this.height = height
	this.show = function() {
		noStroke()
		fill(255)
		rect(this.pos.x , this.pos.y , this.width , this.height)
	}
}


function Target() {
	this.pos = createVector(W/2 , 20)
	this.radius = 27
	this.show = function() {
		noStroke()
		fill(255)
		ellipse(this.pos.x , this.pos.y , this.radius , this.radius)
	}
}


function Population() {
	this.rockets = []
	this.popsize =  200
	this.matingpool = []

	for (let i=0; i<this.popsize; i++) {
		this.rockets[i] = new Rocket()
	}

	this.run = function() {
		for (let i=0; i<this.popsize; i++) {
			this.rockets[i].update()
			this.rockets[i].show()
		}
	}

	this.evaluate = function() {
		let mx = 0
		for (let i=0; i<this.popsize; i++) {
			this.rockets[i].calcEffect()
			if (mx < this.rockets[i].effect) {
				mx = this.rockets[i].effect
			}
		}
		this.matingpool = []
		for (let i=0; i<this.popsize; i++) {
			this.rockets[i].effect /= mx
		}
		for (let i=0; i<this.popsize; i++) {
			let n = this.rockets[i].effect * 100
			for (let j=0; j<n; j++) {
				this.matingpool.push(this.rockets[i])
			}
		}
	}

	this.selection = function() {
		var newRockets = []
		for (let i=0; i<this.popsize; i++) {
			var parentA = random(this.matingpool).dna
			var parentB = random(this.matingpool).dna
			var child = parentA.crossover(parentB)
			child.mutation()
			newRockets[i] = new Rocket(child)
		}
		this.rockets = newRockets
	}
}

function DNA(genes) {
	function randomsign() {
		var res = 1
		if (random(1) > 0.5) res = -1
		return res
	}

	if (genes) {
		this.genes = genes
	} else {
		this.genes = []

		this.genes[0] = p5.Vector.random2D()
		this.genes[0].setMag(0.1)
		for (let i=1; i<lifeSpan; i++) {
			this.genes[i] = this.genes[i-1].copy()
			this.genes[i].rotate(randomsign()*radians(random(55)))
			this.genes[i].setMag(0.1)
		}
	}
	this.crossover = function(partner) {
		var newgenes = []
		var mid = floor(random(lifeSpan))
		for (let i=0; i<lifeSpan; i++) {
			if (i > mid) {
				newgenes[i] = this.genes[i]
			} else {
				newgenes[i] = partner.genes[i]
			}
		}
		return new DNA(newgenes)
	}
	this.mutation = function() {
		for (let i=1; i<lifeSpan; i++) {
			if (random(1) < 0.05) {
				this.genes[i] = this.genes[i-1].copy()
				this.genes[i].rotate(randomsign()*radians(random(55)))
				this.genes[i].setMag(0.1)
			}
		}
	}
}


function Rocket(dna) {
	this.pos = createVector(W/2 , H-10)
	this.vel = createVector()
	this.acc = createVector()
	this.completed = -1
	this.crashed = false

	if (dna) {
		this.dna = dna
	} else {
		this.dna = new DNA()
	}
	this.effect = 0


	this.applyForce = function(force) {
		this.acc.add(force)
	}
	this.update = function() {
		var d = dist(this.pos.x , this.pos.y , target.pos.x , target.pos.y)
		if (d < target.radius) this.completed = count
		this.collision()

		this.applyForce(this.dna.genes[count])
		if (this.completed == -1 && !this.crashed) {
			this.vel.add(this.acc)
			this.pos.add(this.vel)
			this.acc.mult(0)
		}
	}
	this.show = function() {
		if (!this.crashed && this.completed == -1) {
			push()
			translate(this.pos.x , this.pos.y)
			rotate(this.vel.heading())
			rectMode(CENTER)
			noStroke()
			fill(255 , 150)
			rect(0 , 0 , 25 , 5)
			pop()
		}
	}

	this.collision = function() {
		for (let i=0; i<objs.size; i++) {
			if (objs.boxes[i].pos.x <= this.pos.x && this.pos.x <= objs.boxes[i].pos.x + objs.boxes[i].width)			
				if (objs.boxes[i].pos.y <= this.pos.y && this.pos.y <= objs.boxes[i].pos.y + objs.boxes[i].height)
					this.crashed = true
		}
	}

	this.calcEffect = function() {
		var d = dist(this.pos.x , this.pos.y , target.pos.x , target.pos.y)
		this.effect = 1/d
		if (this.completed != -1) this.effect *= (lifeSpan-this.completed)*10
		if (this.crashed) this.effect *= 0
	}
}

