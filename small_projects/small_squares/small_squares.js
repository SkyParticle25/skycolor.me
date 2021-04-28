



//  --  Constants  -- 
const Colors = 
{
    square: "#0070ff" 
}; 





//  --  Canvas  -- 
let canvas = new function () 
{
    // canvas context 
    this.canvasElement = document.getElementById( "canvas" ); 
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

    this.resize = function () 
    {
        // update geometry 
        this.updateGeometry(); 

        // update canvas space 
        this.canvasElement.setAttribute( "width", this.width ); 
        this.canvasElement.setAttribute( "height", this.height ); 
    }


    // init stuff 
    this.updateGeometry(); 
    this.resize(); 


    // assign event listeners 
    window.addEventListener( "resize", this.resize.bind( this ) ); 
}; 




//  --  Mouse tracker  -- 
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





//  --  Squares  -- 
function Square ( target, speed ) 
{
    // geometry 
    this.x = canvas.width / 2; 
    this.y = canvas.height / 2; 
    this.size = 20; 

    // motion 
    this.target = target; 
    this.speed = speed; 


    this.update = function () 
    {
        this.x = this.x + ( target.x - this.x ) * this.speed; 
        this.y = this.y + ( target.y - this.y ) * this.speed; 
    }

    this.drawMe = function ( context ) 
    {
        context.strokeStyle = Colors.square; 
        context.strokeRect
        ( 
            this.x - this.size / 2, 
            this.y - this.size / 2, 
            this.size, 
            this.size 
        ); 
    }
}

function Squares ( nSquares, speed ) 
{
    //  Squares 
    this.squares = new Array( nSquares ); 

    // create squares 
    this.squares[0] = new Square( mouse, speed ); 
    for ( let i = 1; i < this.squares.length; i++ ) 
    {
        this.squares[i] = new Square( this.squares[i - 1], speed ); 
    }; 



    //  Updating 
    this.update = function () 
    {
        this.squares.forEach(
            item => { item.update(); } 
        ); 
    }; 



    //  Drawing 
    this.drawMe = function ( context ) 
    {
        this.squares.forEach(
            item => { item.drawMe( context ); } 
        ); 
    }; 
}





//  --  Main logic  -- 
let squares = new Squares( 5, 0.2 ); 

(function update () 
{
    // canvas stuff 
    canvas.updateGeometry(); 
    let context = canvas.context; 

    
    // update stuff 
    squares.update(); 

    // draw stuff 
    context.clearRect( 0, 0, canvas.width, canvas.height ); 
    squares.drawMe( context ); 


    // ask for next update 
    requestAnimationFrame( update ); 
})() 


