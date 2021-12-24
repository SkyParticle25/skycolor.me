



//  Events  ----------------------------------------------------------------------------- 

function moveLight ( event ) 
{
    // get mouse position 
    let x = event.offsetX; 
    let y = event.offsetY; 

    // get geometry of parent element 
    let rect = svg.getBoundingClientRect(); 

    // move light to mouse position 
    let dx = x - rect.width / 2; 
    let dy = y - rect.height / 2; 
    lightGradient.setAttributeNS( 
        null, "gradientTransform", 
        `translate( ${dx}, ${dy} )` 
    ); 
}









//  Init  ------------------------------------------------------------------------------- 

let svg = document.getElementsByTagName( "svg" )[0]; 
let lightGradient = document.getElementById( "light-gradient" ); 
svg.addEventListener( 'mousemove', moveLight ); 


