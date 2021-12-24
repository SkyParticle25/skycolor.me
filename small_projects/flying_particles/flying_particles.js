
//  Constants  -------------------------------------------------------------------------- 

// particles 
const PARTICLES_PER_PIXEL = 0.000035; 
const PARTICLES_NUMBER = 50; 
const PARTICLES_MIN_SIZE = 3; 
const PARTICLES_MAX_SIZE = 5; 
const PARTICLES_COLOR = "#51ff51"; 
const PARTICLES_MIN_SPEED = 0.25; 
const PARTICLES_MAX_SPEED = 2; 
// connections 
const CONNECTION_COLOR = "#51ff51"; 
const CONNECTION_WIDTH = 0.5; 
const CONNECTION_MAX_DISTANCE = 300; 
// gradient 
const GRADIENT_ANGLE = 70; 
const GRADIENT_SCREEN_COVERAGE = 0.7; 
const GRADIENT_FIRST_POINT = 0.25; 
const GRADIENT_FIRST_COLOR = "#50aaff"; 
const GRADIENT_SECOND_POINT = 1; 
const GRADIENT_SECOND_COLOR = "#ffffff"; 









//  Tech objects  ----------------------------------------------------------------------- 

class Viewport 
{
    constructor ( homeElementId ) 
    {
        // dom stuff 
        this.homeElement = document.getElementById( homeElementId ); 

        // geometry 
        this.x; 
        this.y; 
        this.width; 
        this.height; 

        // init geometry data 
        this.update(); 
    }

    update () 
    {
        // get home element rect 
        let rect = this.homeElement.getBoundingClientRect(); 

        // update geometry data 
        this.x = rect.x; 
        this.y = rect.y; 
        this.width = rect.width; 
        this.height = rect.height; 
    }
}

class Canvas 
{
    constructor ( id ) 
    {
        // dom stuff 
        this.canvasElement = document.getElementById( id ); 
        this.context = this.canvasElement.getContext( "2d" ); 

        // set proper scale 
        this.update(); 
    }
    
    update = function () 
    {
        // update canvas space 
        this.canvasElement.setAttribute( "width", viewport.width ); 
        this.canvasElement.setAttribute( "height", viewport.height ); 
    }
}; 

class Mouse 
{
    constructor () 
    {
        // mouse position 
        this.x = canvas.width / 2; 
        this.y = canvas.height / 2; 

        // adding event listeners 
        viewport.homeElement.addEventListener( "mousemove", this.update.bind( this ) ); 
    }

    update ( event ) 
    {
        // update mouse position 
        this.x = event.clientX - canvas.x; 
        this.y = event.clientY - canvas.y; 
    }
}; 









//  Particles  -------------------------------------------------------------------------- 

class Particle 
{
    constructor ( x, y, size, color, velocity ) 
    {
        //  --  Data  -- 
        this.x = x; 
        this.y = y; 
        this.size = size; 
        this.color = color; 
        this.velocity = velocity; 
    }


    //  Updating  ------------------------------- 
    update = function () 
    {
        this.x += this.velocity.x; 
        this.y += this.velocity.y; 
    }


    //  Operations  ----------------------------- 
    translateToSpace ( translationFactor ) 
    {
        this.x *= translationFactor.scaleX; 
        this.y *= translationFactor.scaleY; 
    }


    //  Drawing  -------------------------------- 
    drawMe = function ( context ) 
    {
        context.moveTo( this.x + this.size / 2, this.y ); 
        context.arc
        (
            this.x, 
            this.y, 
            this.size / 2, 
            0, 
            Math.PI * 2 
        );    
    }
}

class Particles 
{
    constructor ( 
        { 
            particlesPerPixel, 
            minSize, 
            maxSize, 
            color, 
            minSpeed, 
            maxSpeed 
        } 
    ) {
        //  Parameters  ------------------------- 
        this.particlesPerPixel = particlesPerPixel; 
        this.color = color; 
        this.minSize = minSize; 
        this.maxSize = maxSize; 
        this.minSpeed = minSpeed; 
        this.maxSpeed = maxSpeed; 

        //  Data  ------------------------------- 
        this._particles = []; 
        this._space = {
            width: viewport.width, 
            height: viewport.height 
        }; 

        //  Init logic  ------------------------- 
        this._updatePopulation(); 
    }


    //  Partice population  --------------------- 
    _updatePopulation () 
    {
        // goal population size 
        let windowArea = viewport.width * viewport.height; 
        let goalSize = Math.round( this.particlesPerPixel * windowArea ); 

        // particles to create / delete 
        let populationDelta = goalSize - this._particles.length; 

        // change population 
        if ( populationDelta > 0 ) 
        {
            // create particles 
            this._addParticles( populationDelta ); 
        }
        else if ( populationDelta < 0 )
        {
            // delete particles 
            this._deleteParticles( - populationDelta ); 
        }
    }

    _addParticles ( nParticles ) 
    {
        for ( let i = 0; i < nParticles; i++ ) 
        {
            // create particle 
            let particle = this._createParticle(); 
            
            // add particle to the list 
            this._particles.push( particle ); 
        }
    }

    _deleteParticles ( nParticles ) 
    {
        this._particles.splice(
            this._particles.length - nParticles, 
            nParticles 
        ); 
    }

    _createParticle () 
    {
        // generate particle data 
        let { x, y } = this._generatePosition( 
            { 
                x: 0, 
                y: 0, 
                width: this._space.width, 
                height: this._space.height 
            } 
        ); 
        let velocity = this._generateVelocity( this.minSpeed, this.maxSpeed ); 
        let size = this._generateSize( this.minSize, this.maxSize ); 

        // create particle 
        let particle = new Particle( x, y, size, this.color, velocity ); 

        return particle; 
    }

    _generatePosition ( area ) 
    {
        let x = area.x + area.width * Math.random(); 
        let y = area.y + area.height * Math.random(); 
        return { x, y }; 
    }

    _generateVelocity ( minSpeed, maxSpeed ) 
    {
        let direction = Math.random() * Math.PI * 2; 
        let speed = minSpeed + Math.random() * ( maxSpeed - minSpeed ); 

        return {
            x: speed * Math.cos( direction ), 
            y: speed * Math.sin( direction ) 
        }; 
    }

    _generateSize ( minSize, maxSize ) 
    {
        return minSize + Math.random() * ( maxSize - minSize ); 
    }


    //  Particle access  ------------------------ 
    forEach ( callback ) 
    {
        return this._particles.forEach( callback ); 
    }

    getParticle ( i ) 
    {
        return this._particles[ i ]; 
    }

    count () 
    {
        return this._particles.length; 
    }


    //  Updating  ------------------------------- 
    update () 
    {
        // update each particle 
        this._particles.forEach( particle => particle.update() ); 
    }


    //  Operations  ----------------------------- 
    resize () 
    {
        this._updatePopulation(); 
        this._updateSpace(); 
    }

    _updateSpace () 
    {
        // spaces for particles 
        let oldSpace = this._space; 
        let newSpace = {
            width: viewport.width, 
            height: viewport.height 
        }; 

        // find translation from old space to new space 
        let translation = {
            scaleX: newSpace.width / oldSpace.width, 
            scaleY: newSpace.height / oldSpace.height 
        }; 

        // set current space to new one 
        this._space = newSpace; 

        // translate all particles to new space 
        this._particles.forEach(
            particle => particle.translateToSpace( translation ) 
        ); 
    }


    //  Drawing  -------------------------------- 
    drawMe ( context ) 
    {
        // start drawing 
        context.beginPath(); 

        // draw each particle 
        this._particles.forEach( 
            particle => { particle.drawMe( context ) } 
        ); 

        // finish drawing 
        context.fillStyle = this.color; 
        context.fill(); 
    }
} 









//  Connections  ------------------------------------------------------------------------ 

class ConnectionColors 
{
    constructor ( nColors ) 
    {
        //  Data  -------------------------------
        this._colors = new Array( nColors ); 


        //  Init logic  -------------------------
        let baseColor = CONNECTION_COLOR; 
        for ( let i = 0; i < nColors; i++ ) 
        {
            let opacity = this._numberToColorChannel( i / ( nColors - 1 ) ); 
            this._colors[i] = baseColor + opacity; 
        }
    }


    //  Interface  ------------------------------
    getColor ( opacity ) 
    {
        // map opacity from [0, 1] to [0, maxIndex] 
        let i = opacity * ( this._colors.length - 1 ); 
        i = Math.round( i ); 

        // get color 
        return this._colors[i]; 
    }


    //  Tech  -----------------------------------
    _numberToColorChannel ( n ) 
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

class Connections 
{
    constructor ( particles, color, maxDistance ) 
    {
        //  --  Data  -- 
        this.color = color; 
        this.maxDistance = maxDistance; 
        this._particles = particles; 
        this._colors = new ConnectionColors( 100 ); 
    }


    //  Drawing  -------------------------------- 
    drawMe ( context ) 
    {
        // common drawing state 
        context.lineWidth = CONNECTION_WIDTH; 

        // go over each pair of particles 
        for ( let i = 0; i < this._particles.count() - 1; i++ ) 
        {
            for ( let i2 = i + 1; i2 < this._particles.count(); i2++ ) 
            {
                // pairt of particles 
                let a = this._particles.getParticle( i ); 
                let b = this._particles.getParticle( i2 ); 

                // if particles are connected, draw connection 
                let connection = this._createConnectionIfPossible( a, b ); 
                if ( connection != null ) 
                {
                    this._drawConnection( connection, context ); 
                }
            }
        }
    }

    _drawConnection ( connection, context ) 
    {
        // calculate proximity 
        let proximity = 1 - connection.distance / this.maxDistance; 

        // draw connections 
        context.strokeStyle = this._colors.getColor( proximity ); 
        context.beginPath(); 
        context.moveTo( connection.a.x, connection.a.y ); 
        context.lineTo( connection.b.x, connection.b.y ); 
        context.stroke(); 
    }


    //  Tech  ----------------------------------- 
    _createConnectionIfPossible ( particleA, particleB ) 
    {
        let distance = Math.sqrt(
            ( particleA.x - particleB.x ) * ( particleA.x - particleB.x ) 
            + 
            ( particleA.y - particleB.y ) * ( particleA.y - particleB.y ) 
        ); 

        if ( distance <= this.maxDistance ) 
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
}










//  World  ------------------------------------------------------------------------------ 

let WorldAreas = {
    INSIDE: 0, 
    TOP: 1, 
    BOTTOM: 2, 
    LEFT: 3, 
    RIGHT: 4 
}; 

class WorldGeometry 
{
    //  Areas  ---------------------------------- 
    getArea ( x, y ) 
    {
        if ( y < 0 ) return WorldAreas.TOP; 
        if ( y > viewport.height ) return WorldAreas.BOTTOM; 
        if ( x < 0 ) return WorldAreas.LEFT; 
        if ( x > viewport.width ) return WorldAreas.RIGHT; 
        return WorldAreas.INSIDE; 
    }

    getOppositeArea ( area ) 
    {
        switch ( area ) 
        {
            case WorldAreas.TOP: return WorldAreas.BOTTOM; 
            case WorldAreas.BOTTOM: return WorldAreas.TOP; 
            case WorldAreas.LEFT: return WorldAreas.RIGHT; 
            case WorldAreas.RIGHT: return WorldAreas.LEFT; 
            default: 
                throw new Error( "Unrecognized area" ); 
        }
    }


    //  Creating points  ------------------------ 
    randomPointOnEdge ( area ) 
    {
        switch ( area ) 
        {
            case WorldAreas.TOP: 
                return {
                    x: viewport.width * Math.random(), 
                    y: 0 
                }; 
            case WorldAreas.BOTTOM: 
                return {
                    x: viewport.width * Math.random(), 
                    y: viewport.height  
                }; 
            case WorldAreas.LEFT: 
                return {
                    x: 0, 
                    y: viewport.height * Math.random() 
                }; 
            case WorldAreas.RIGHT: 
                return {
                    x: viewport.width, 
                    y: viewport.height * Math.random() 
                }; 
            default: 
                throw new Error( "Unrecognized area" ); 
        }
    }
}

class World 
{
    constructor () 
    {
        //  Data  ------------------------------- 
        // particles 
        this._particles = new Particles(
            {
                particlesPerPixel: PARTICLES_PER_PIXEL, 
                minSize: PARTICLES_MIN_SIZE, 
                maxSize: PARTICLES_MAX_SIZE, 
                color: PARTICLES_COLOR, 
                minSpeed: PARTICLES_MIN_SPEED, 
                maxSpeed: PARTICLES_MAX_SPEED 
            }
        );

        // connections 
        this._connections = new Connections( 
            this._particles, 
            CONNECTION_COLOR, 
            CONNECTION_MAX_DISTANCE 
        ); 

        // geometry 
        this._worldGeometry = new WorldGeometry(); 
    }


    //  Updating  ----------------------------- 
    update = function () 
    {
        this._particles.update(); 
        this._respawnLeavingWorldParticles(); 
    }


    //  Operations  -----------------------------  
    resize () 
    {
        this._particles.resize(); 
    }


    //  Drawing  -------------------------------- 
    drawMe = function ( context ) 
    {
        this._particles.drawMe( context ); 
        this._connections.drawMe( context ); 
    }


    //  Leaving world particles  ---------------- 
    _respawnLeavingWorldParticles () 
    {
        this._particles.forEach(
            particle =>
            {
                // find area that particle is in 
                let area = this._worldGeometry.getArea( particle.x, particle.y ); 

                // if particle is outside the world, respawn it 
                if ( area != WorldAreas.INSIDE ) 
                {
                    // generate respawn point 
                    let newArea = this._worldGeometry.getOppositeArea( area ); 
                    let point = this._worldGeometry.randomPointOnEdge( newArea ); 

                    // move particle to respawn point 
                    particle.x = point.x; 
                    particle.y = point.y; 
                }
            }
        ); 
    }
}; 









//  Gradient  ------------------------------------------------------------------------- 

class Gradient 
{
    constructor ( canvas ) 
    {
        //  Data  ------------------------------- 
        this.direction = {
            x: Math.cos( - GRADIENT_ANGLE / 180 * Math.PI ), 
            y: Math.sin( - GRADIENT_ANGLE / 180 * Math.PI ) 
        }; 
        this._context = canvas.context; 
    }

    drawMe () 
    {
        // clear screen 
        this._context.clearRect( 0, 0, viewport.width, viewport.height ); 

        // create gradient points 
        let pointA = {
            x: 0, 
            y: viewport.height 
        }; 
        let pointB = {
            x: pointA.x + this.direction.x * GRADIENT_SCREEN_COVERAGE * viewport.height, 
            y: pointA.y + this.direction.y * GRADIENT_SCREEN_COVERAGE * viewport.height 
        }; 

        // create gradient 
        let gradient = this._context.createLinearGradient( 
            pointA.x, 
            pointA.y, 
            pointB.x, 
            pointB.y 
        ); 
        gradient.addColorStop( GRADIENT_FIRST_POINT, GRADIENT_FIRST_COLOR ); 
        gradient.addColorStop( GRADIENT_SECOND_POINT, GRADIENT_SECOND_COLOR ); 
        
        // draw gradient 
        this._context.fillStyle = gradient; 
        this._context.fillRect( 0, 0, viewport.width, viewport.height ); 
    }
}








//  Events  ----------------------------------------------------------------------------- 

function onResize ( event ) 
{
    // update tech objects 
    viewport.update(); 
    canvas.update(); 
    canvasBackground.update(); 

    // resize the world 
    world.resize(); 

    // draw background 
    gradient.drawMe(); 
}









//  Main part  -------------------------------------------------------------------------- 

//  Tech objects  ------------------------------- 
let viewport = new Viewport( "canvas" ); 
let canvas = new Canvas( "canvas" ); 
let canvasBackground = new Canvas( "canvas-background" ); 
let mouse = new Mouse(); 
let gradient = new Gradient( canvasBackground ); 


//  Data  --------------------------------------- 
let world = new World(); 





//  Logic  -------------------------------------- 

function init () 
{
    // create background 
    gradient.drawMe(); 

    // add event listeners 
    window.addEventListener( "resize", onResize ); 
} 

function update () 
{    
    // update stuff 
    world.update(); 

    // draw stuff 
    let context = canvas.context; 
    context.clearRect( 0, 0, viewport.width, viewport.height ); 
    world.drawMe( context ); 
    gradient.drawMe(); 

    // ask for next update 
    window.requestAnimationFrame( update ); 
} 





//  Start  -------------------------------------- 
init(); 
update(); 
