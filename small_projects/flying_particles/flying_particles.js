
//  --  Constants  -- 
// particles 
const nParticles = 30; 
const minParticleSize = 3; 
const maxParticleSize = 5; 
const particleColor = "#51ff51"
const minParticleSpeed = 0.25; 
const maxParticleSpeed = 2; 
// connections 
const connectionColor = "#51ff51"; 
const connectionWidth = 0.5; 
const maxConnectedDistance = 300; 









//  --  Tech objects  -------------------------------------------------------------------s

function Canvas ( id ) 
{
    // canvas context 
    this.canvasElement = document.getElementById( id ); 
    this.context = this.canvasElement.getContext( "2d" ); 

    // geometry 
    this.x = undefined; 
    this.y = undefined; 
    this.width = undefined; 
    this.height = undefined; 


    this.updateGeometry = function () 
    {
        // get canvas rect 
        let rect = this.canvasElement.getBoundingClientRect(); 

        // update geometry data 
        this.x = rect.x; 
        this.y = rect.y; 
        this.width = rect.width; 
        this.height = rect.height; 
    }

    this.updateScale = function () 
    {
        // update geometry 
        this.updateGeometry(); 

        // update canvas space 
        this.canvasElement.setAttribute( "width", this.width ); 
        this.canvasElement.setAttribute( "height", this.height ); 
    }


    // init stuff 
    this.updateGeometry(); 
    this.updateScale(); 


    // assign event listeners 
    window.addEventListener( "resize", this.updateScale.bind( this ) ); 
}; 
let canvas = new Canvas( "canvas" ); 
let canvasBackground = new Canvas( "canvas-background" ); 

let mouse = new function () 
{
    // creating object 
    this.x = canvas.width / 2, 
    this.y = canvas.height / 2, 

    this.update = function ( event ) 
    {
        this.x = event.clientX - canvas.x; 
        this.y = event.clientY - canvas.y; 
    }

    // adding event listeners 
    canvas.canvasElement.addEventListener( "mousemove", this.update.bind( this ) ); 
}; 









//  --  Particles  ----------------------------------------------------------------------

function Particle ( x, y, size, color, velocity )  
{
    //  --  Data  -- 
    this.x = x; 
    this.y = y; 
    this.size = size; 
    this.color = color; 
    this.velocity = velocity; 



    //  --  Methods  -- 
    this.update = function () 
    {
        this.x += this.velocity.x; 
        this.y += this.velocity.y; 
    }

    this.drawMe = function ( context ) 
    {
        context.fillStyle = this.color; 
        context.beginPath(); 
        context.arc
        (
            this.x, 
            this.y, 
            this.size / 2, 
            0, 
            Math.PI * 2 
        ); 
        context.fill(); 
    }
}; 

function ParticleFactory ( minSize, maxSize, color, minSpeed, maxSpeed ) 
{
    // particle creation interface 
    return function createParticle () 
    {
        // generate position 
        let x = canvas.width * Math.random(); 
        let y = canvas.height * Math.random(); 

        // generate size 
        let size = minSize + Math.random() * ( maxSize - minSize ); 

        // generate velocity 
        let direction = Math.random() * Math.PI * 2; 
        let speed = minSpeed + Math.random() * ( maxSpeed - minSpeed ); 
        let velocity = 
        {
            x: speed * Math.cos( direction ), 
            y: speed * Math.sin( direction ) 
        }; 

        // create particle 
        return new Particle( x, y, size, color, velocity ); 
    }
}; 









//  --  Connections  -------------------------------------------------------------------- 

function ConnectionsDrawer ( color, maxDistance ) 
{
    //  --  Interface  -- 
    return function drawConnections ( particles, context ) 
    {
        // go over each pair of particles 
        for ( let i = 0; i < particles.length - 1; i++ ) 
        {
            for ( let i2 = i + 1; i2 < particles.length; i2++ ) 
            {
                // pairt of particles 
                let a = particles[i]; 
                let b = particles[i2]; 

                // if particles are connected, draw connection 
                let connection = createConnectionIfPossible( a, b ); 
                if ( connection != null ) 
                {
                    drawConnection( connection, context ); 
                }
            }
        }
    }


    //  --  Tech  -- 
    function createConnectionIfPossible ( particleA, particleB ) 
    {
        let distance = Math.sqrt(
            ( particleA.x - particleB.x ) * ( particleA.x - particleB.x ) 
            + 
            ( particleA.y - particleB.y ) * ( particleA.y - particleB.y ) 
        ); 

        if ( distance <= maxDistance ) 
        {
            return {
                a: particleA, 
                b: particleB, 
                distance: distance 
            }; 
        } 
        else 
        {
            return null; 
        }
    }

    function drawConnection ( connection, context ) 
    {
        // calculate opacity 
        let proximity = 1 - connection.distance / maxDistance; 
        let opacity = numberToColorChannel( proximity ); 

        // draw connections 
        context.strokeStyle = color + opacity; 
        context.lineWidth = connectionWidth; 
        context.beginPath(); 
        context.moveTo( connection.a.x, connection.a.y ); 
        context.lineTo( connection.b.x, connection.b.y ); 
        context.stroke(); 
    }

    function numberToColorChannel ( n ) 
    {
        // map [0, 1] range to [0, 255] 
        let n255 = Math.round( 255 * n ); 

        // convert base 10 to base 16 
        let a = Math.floor( n255 / 16 ); 
        let b = n255 - 16 * a; 

        // convert digits to string 
        let s = digitToHex( a ) + digitToHex( b ); 
        return s; 

        // tech 
        function digitToHex ( d ) 
        {
            switch ( d ) 
            {
                case 10: return "a"; 
                case 11: return "b"; 
                case 12: return "c"; 
                case 13: return "d"; 
                case 14: return "e"; 
                case 15: return "f"; 
                default: return d.toString(); 
            }
        }
    }
}









//  --  World  -------------------------------------------------------------------------- 

let world = new function () 
{
    //  --  Data  -- 
    // particles 
    this.particles = []; 
    this.createParticle = ParticleFactory( 
        minParticleSize, 
        maxParticleSize, 
        particleColor, 
        minParticleSpeed, 
        maxParticleSpeed 
    ); 
    // connections 
    this.drawConnections = ConnectionsDrawer( 
        connectionColor, 
        maxConnectedDistance 
    ); 



    //  --  Life cycle  -- 
    this.update = function () 
    {
        // update each particle 
        this.particles.forEach( 
            particle => { particle.update() } 
        ); 

        // respawn particles that leave the world 
        this.checkLeavingWorld(); 
    }

    this.drawMe = function ( context ) 
    {
        // draw each particle 
        this.particles.forEach( 
            particle => { particle.drawMe( context ) } 
        ); 

        // draw connections between particles 
        this.drawConnections( this.particles, context ); 
    }



    //  --  Leaving world checks  -- 
    // respawn particles that are leaving the world 
    this.checkLeavingWorld = function () 
    {
        this.particles.forEach(
            particle =>
            {
                // find area that particle is in 
                let area = this.getArea( particle.x, particle.y ); 

                // if particle is outside the world, respawn it 
                if ( area != "inside" ) 
                {
                    let point = this.getRespawnPoint( particle ); 
                    particle.x = point.x; 
                    particle.y = point.y; 
                }
            }
        ); 
    }

    // get new position for objects that leave the world 
    this.getRespawnPoint = function ( particle ) 
    {
        // see where particle is 
        let area = this.getArea( particle.x, particle.y ); 

        // check that the particle is inside the world 
        if ( area == "inside" ) 
            throw new Error( "Particle wants to respawn but it's inside the world" ); 

        // create respawn point 
        let newArea = this.getOppositeArea( area ); 
        let point = this.randomPointOnEdge( newArea ); 

        return point; 
    }

    // get area of the world where the point is 
    this.getArea = function ( x, y ) 
    {
        if ( y < 0 ) return "top"; 
        if ( y > canvas.height ) return "bottom"; 
        if ( x < 0 ) return "left"; 
        if ( x > canvas.width ) return "right"; 
        return "inside"; 
    }

    // get area of the world opposite to given area 
    this.getOppositeArea = function ( area ) 
    {
        switch ( area ) 
        {
            case "top": return "bottom"; 
            case "bottom": return "top"; 
            case "left": return "right"; 
            case "right": return "left"; 
            default: 
                throw new Error( "Unrecognized area" ); 
        }
    }

    // create random point on the edge that corresponds to given area 
    this.randomPointOnEdge = function ( area ) 
    {
        switch ( area ) 
        {
            case "top": 
                return {
                    x: canvas.width * Math.random(), 
                    y: 0 
                }; 
            case "bottom": 
                return {
                    x: canvas.width * Math.random(), 
                    y: canvas.height  
                }; 
            case "left": 
                return {
                    x: 0, 
                    y: canvas.height * Math.random() 
                }; 
            case "right": 
                return {
                    x: canvas.width, 
                    y: canvas.height * Math.random() 
                }; 
            default: 
                throw new Error( "Unrecognized area" ); 
        }
    }



    //  --  Init  -- 
    // create particles 
    for ( let i = 0; i < nParticles; i++ ) 
    {
        let s = this.createParticle(); 
        this.particles.push( s ); 
    }
}; 









//  --  Main part  ----------------------------------------------------------------------

(function init () 
{
    // draw background 
    drawBackground(); 
    window.addEventListener( "resize", drawBackground ); 
})(); 

(function update () 
{
    // update tech objects 
    canvas.updateGeometry(); 


    // update stuff 
    world.update(); 


    // draw stuff 
    let context = canvas.context; 
    context.clearRect( 0, 0, canvas.width, canvas.height ); 
    world.drawMe( context ); 


    // ask for next update 
    window.requestAnimationFrame( update ); 
})(); 


function drawBackground () 
{
    // get context 
    let context = canvasBackground.context; 
    console.log( "drawing background" ); 
    // clear screen 
    context.clearRect( 0, 0, canvasBackground.width, canvasBackground.height ); 

    // create gradient 
    let x0 = 0.2 * canvasBackground.width; 
    let y0 = 1 * canvasBackground.height; 
    let x1 = x0 + 0.11 * canvasBackground.width; 
    let y1 = y0 - 0.24 * canvasBackground.width; 
    let gradient = context.createLinearGradient( x0, y0, x1, y1 ); 
    gradient.addColorStop( 0, "#50aaff" ); 
    gradient.addColorStop( 1, "#ffffff" ); 

    // use gradient as style 
    context.fillStyle = gradient; 

    // draw gradient 
    context.fillRect( 0, 0, canvasBackground.width, canvasBackground.height ); 
}



