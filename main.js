
var canvas;
var gl;

var program ;

var near = -100;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var prevTime = 0.0 ;
var resetTimerFlag = true ;
var animFlag = false ;
var controller ;

function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    setColor(materialDiffuse) ;

    Cube.init(program);
    Cylinder.init(9,program);
    Cone.init(9,program) ;
    Sphere.init(36,program) ;

    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );

	
	document.getElementById("sliderXi").oninput = function() {
		RX = this.value ;
		window.requestAnimFrame(render);
	}
		
    
    document.getElementById("sliderYi").oninput = function() {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").oninput = function() {
        RZ =  this.value;
        window.requestAnimFrame(render);
    };

    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true  ;
            resetTimerFlag = true ;
            window.requestAnimFrame(render);
        }
        console.log(animFlag) ;
		
		controller = new CameraController(canvas);
		controller.onchange = function(xRot,yRot) {
			RX = xRot ;
			RY = yRot ;
			window.requestAnimFrame(render); };
    };

    render();
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix) ;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV() ;
    
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV() ;
    Cube.draw() ;
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV() ;
    Sphere.draw() ;
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV() ;
    Cylinder.draw() ;
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV() ;
    Cone.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modelViewMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}

// Function 1: Drawing a Seaweed
function drawSeaWeed(x, y, theta) {
    gPush(); {

        gTranslate(x, y, 0);

        gPush(); {
            //drawing TEN beads 
            for (var i = 0; i < 10; i++) {

                gTranslate(0, 0.6, 0);

                if (i > 0 && i < 9) {
                    //rotates about the base of each bead
                    gRotate(theta * Math.sin(TIME + i), 0, 0, 1);
                }

                gPush(); {
                    gScale(0.15, 0.3, 0.15);
                    setColor(vec4(1.5, 0.5, 0, 1.0));
                    drawSphere();
                }
                gPop();
            }
        } gPop();
    } gPop();
}



// Function 2: To Draw the Pupil of the Fish
function drawFishPupil(x) {
    gPush(); {
        gTranslate(x, 0, 0);
        gScale(0.05, 0.05, 0.05);
        setColor(vec4(0, 0, 0, 1));
        drawSphere();
    }
    gPop();
}


// Function 3: To Draw the eye of the fish that contains the pupil.
function drawFishEye(pupil, z) {
    gPush(); {
        gTranslate(0, 0.2, z);

        //Now passing the pupil in the eye
        gPush(); {
            drawFishPupil(pupil);
        }
        gPop();

        gScale(0.1, 0.1, 0.1);
        setColor(vec4(1, 1, 1, 1));
        drawSphere();
    }
    gPop();
}

//Function 4: To Draw the Legs of the Human Character
function drawHumanLegs(x, y, z, off) {
    gPush();
    {
        gTranslate(x, y, z);

        //rotation for both parts of the leg
        gRotate(15 * Math.sin(2 * TIME + off) + 45, 1, 0, 0);
        
        // upper leg
        gPush();
        {

            gScale(0.2, 0.8, 0.2);
            setColor(vec4(1, 0, 0, 1));
            drawCube();
        }
        gPop();

        // lower leg and foot
        gPush();
        {
            gTranslate(0, -1.2, -0.5);
            gRotate(45, 1, 0, 0);
            gRotate(5 * Math.sin(2 * TIME), 1, 0, 0);

            //leg
            gPush(); {
                gScale(0.2, 0.8, 0.2);

                setColor(vec4(0, 0, 0, 1));

                drawCube();
            }
            gPop();

            //foot
            gPush(); {
                gTranslate(0, -0.9, 0);
                gScale(0.3, 0.1, 0.5);
                drawCube();
            } gPop();
        }
        gPop();
    }
    gPop();
}

// Function 5: To draw a single bubble
function drawBubble(i) {
    //checking timer for 12 seconds on a bubble
    if ((TIME - drawingTime[i] > 12)) {
        visibility[i] = false;
    }

    gPush(); {
        //increasing the bubble height
        nextBubble[i] += 0.002;

        gTranslate(firstBubble[i], nextBubble[i], 1.5);
        //bubble size ocillate
        gScale(0.025 * Math.abs(Math.cos(TIME + bubbleOff[i])) + 0.1, 0.025 * Math.abs(Math.cos(TIME + 30 + bubbleOff[i])) + 0.1, 0.025 * Math.abs(Math.cos(TIME + 15 + bubbleOff[i])) + 0.1);
        setColor(vec4(1, 1, 1, 1));
        drawSphere();
    } gPop();

    //remove the bubble
    if (!visibility[i]) {
        visibility.splice(i, 1);
        drawingTime.splice(i, 1);
        firstBubble.splice(i, 1);
        nextBubble.splice(i, 1);
        bubbleOff.splice(i, 1);
    }
}

// These are the variables that need to be declared for some of the functions
// to work and the animations to be rendered. 

// x and y world directions for the human character
var x;
var y;

// For the Bubbles,

//drawing time 
var drawingTime = [];

// visibility of the bubble
var visibility = [];

//arrays for the bubbles coordinates
var firstBubble = [];
var nextBubble = [];

//array offset for the bubble ocillating in size
var bubbleOff = [];

// the time for bubbles to burst
var burstBubbles = 0;

//timer between individual bubbles
var bubbleTimer = 0;

// 4-5 bubbles should be coming out
var numberOfBubbles;
if (Math.random() > 0.5) {
     numberOfBubbles = 4;
     }
else {
     numberOfBubbles = 5; 
    }

//bubble timer between bursts of blowing bubbles
var burstTime = 0;



function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(0,0,10);
    MS = [] ; // Initialize modeling matrix stack
    
    // initialize the modeling matrix to identity
    modelMatrix = mat4() ;
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    
    // Rotations from the sliders
    gRotate(RZ,0,0,1) ;
    gRotate(RY,0,1,0) ;
    gRotate(RX,1,0,0) ;
    
    
    // set all the matrices
    setAllMatrices() ;
    
    var curTime ;
    if( animFlag )
    {
        curTime = (new Date()).getTime() /1000 ;
        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }
        TIME = TIME + curTime - prevTime ;
        prevTime = curTime ;
    }
   
    gTranslate(-4,0,0) ;

    // gPush() ;
    // {
    //     setColor(vec4(1.0,0.0,0.0,1.0)) ;
    //     drawSphere() ;
    // }
    // gPop() ;
    
    // gPush() ;
    // {
    //     gTranslate(3,0,0) ;
    //     setColor(vec4(0.0,1.0,0.0,1.0)) ;
    //     gRotate(TIME*180/3.14159,0,1,0) ;
    //     drawCube() ;
    // }
    // gPop() ;
    
    // gPush() ;
    // {
    //     gTranslate(5,0,0) ;
    //     setColor(vec4(0.0,0.0,1.0,1.0)) ;
    //     gRotate(TIME*180/3.14159,0,1,0) ;
    //     drawCylinder() ;
    // }
    // gPop() ;
    
    // gPush() ;
    // {
    //     gTranslate(7,0,0) ;
    //     setColor(vec4(1.0,1.0,0.0,1.0)) ;
    //     gRotate(TIME*180/3.14159,0,1,0) ;
    //     drawCone() ;
    // }
    // gPop() ;

    
    

    // These are the required drawings rendered to the GPU.


    // 1: The Floor Box
    gPush();
    {
        gTranslate(4, -5, 0);
        gScale(100, 1.5, 100);
        setColor(vec4(0.0, 0, 0.0, 0));
        drawCube();
    }
    gPop();


    // 2: Three Seaweeds
    gPush(); {
        drawSeaWeed(3.3, -2.8, 10);
        drawSeaWeed(4, -2.3, 10);
        drawSeaWeed(4.7, -2.8, 10);
    } gPop();


    // 3: Two Rocks
    // the big rock
    gPush();
    {
        gTranslate(4, -2.75, 0);
        gScale(0.75, 0.75, 0.75);
        setColor(vec4(0, 1, 0, 1.0));
        drawSphere();
    }
    gPop();
    // the small rock
    gPush();
    {
        gTranslate(2.8, -3.1, 0);
        gScale(0.4, 0.4, 0.4);
        setColor(vec4(0, 0.5, 0, 1.0));
        drawSphere();
    }
    gPop();


    // 4: The Fish
    gPush(); {
        gTranslate(4 + 3 * - Math.sin(0.5 * TIME), 0.5 * Math.cos(TIME) - 2, 3 * Math.cos(0.5 * TIME));
        gRotate(-0.5 * TIME * 180 / 3.14159, 0, 1, 0);


        // 4.1: the head
        gPush(); {
            gRotate(-90, 0, 1, 0);
            gScale(0.5, 0.5, 0.5);
            setColor(vec4(0, 0, 0.5, 1));
            drawCone();
        }
        gPop();

        // 4.2: the eyes 
        gPush(); {
            //left eye
            drawFishEye(-0.07, -0.2);
            //right eye
            drawFishEye(-0.07, 0.2);
        }
        gPop();

        // 4.3: the body of the fish
        gPush(); {
            gTranslate(1.25, 0, 0);
            gRotate(90, 0, 1, 0);
            gScale(0.5, 0.5, 2);
            setColor(vec4(0, 0, 1, 1));
            drawCone();
        }
        gPop();


        // 4.4: the tail
        gPush(); {
            gTranslate(2.6, 0.5, 0);
            gRotate(20 * Math.cos(5 * TIME), 0, 1, 0);
            gPush(); {

                gRotate(90, 1, 0, 0);
                gRotate(140, 0, 1, 0);
                gScale(0.2, 0.2, 1.2);
                setColor(vec4(1, 0, 0, 1));
                drawCone();
            }
            gPop();


            gPush(); {
                gTranslate(-0.01, -0.7, 0);
                gRotate(90, 1, 0, 0);
                gRotate(60, 0, 1, 0);
                gScale(0.2, 0.2, 0.7);
                setColor(vec4(1, 0, 0, 1));
                drawCone();
            }
            gPop();
        }
        gPop();
    }
    gPop();


    // 5: The Human Character
    gPush();
    {
        gTranslate(8 + 0.25 * Math.cos(0.75 * TIME), 1 + 0.5 * Math.cos(0.75 * TIME), 1);
        gRotate(30, 0, -1, 0);

        // 5.1: the head
        gPush();
        {
            gTranslate(0, 1.5, 0);

            gPush(); {
                gScale(0.5, 0.5, 0.5);
                setColor(vec4(1, 0, 0, 1));
                drawSphere();
            } gPop();

        }
        gPop();

        gPush();
        {
            // 5.2: the body
            gScale(0.8, 1, 0.5);
            setColor(vec4(1, 1, 0.5, 1));
            drawCube();
        }
        gPop();


        // 5.3: the legs (calling the function)
        drawHumanLegs(-0.5, -1.4, -0.5, 0);
        drawHumanLegs(0.5, -1.4, -0.5, 30);
    }
    gPop();

     // 6: Drawing the Bubbles
    gPush(); {

            x = 7.75 + 0.25 * Math.cos(0.75 * TIME);
            y = 2.25 + 0.5 * Math.cos(0.75 * TIME);
    
            //to make sure that bubbles are blown every 4 seconds
            if ((TIME - burstTime) > 4 && burstBubbles == numberOfBubbles) {
    
                //generating random number for how many bubbles between 4 and 5
                if (Math.random() > 0.5) { 
                    numberOfBubbles = 4;
                 }
                else {
                     numberOfBubbles = 5;
                     }
    
                burstTime = TIME;
                burstBubbles = 0;
            }
    
            // Only upto 5 bubbles
            if (TIME - bubbleTimer > 0.5 && burstBubbles < numberOfBubbles) {
                //pushing/adding a new bubble
                visibility.push(true);
                drawingTime.push(TIME);
                firstBubble.push(x);
                nextBubble.push(y);
                bubbleOff.push(Math.random() * 45);
    

                bubbleTimer = TIME;
                burstBubbles++;
            }
    
            //call the function to draw.
            for (var i = 0; i < visibility.length; i++) {
                drawBubble(i);
            }
    }
    gPop();
    
    if( animFlag )
        window.requestAnimFrame(render);
}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
	var controller = this;
	this.onchange = null;
	this.xRot = 0;
	this.yRot = 0;
	this.scaleFactor = 3.0;
	this.dragging = false;
	this.curX = 0;
	this.curY = 0;
	
	// Assign a mouse down handler to the HTML element.
	element.onmousedown = function(ev) {
		controller.dragging = true;
		controller.curX = ev.clientX;
		controller.curY = ev.clientY;
	};
	
	// Assign a mouse up handler to the HTML element.
	element.onmouseup = function(ev) {
		controller.dragging = false;
	};
	
	// Assign a mouse move handler to the HTML element.
	element.onmousemove = function(ev) {
		if (controller.dragging) {
			// Determine how far we have moved since the last mouse move
			// event.
			var curX = ev.clientX;
			var curY = ev.clientY;
			var deltaX = (controller.curX - curX) / controller.scaleFactor;
			var deltaY = (controller.curY - curY) / controller.scaleFactor;
			controller.curX = curX;
			controller.curY = curY;
			// Update the X and Y rotation angles based on the mouse motion.
			controller.yRot = (controller.yRot + deltaX) % 360;
			controller.xRot = (controller.xRot + deltaY);
			// Clamp the X rotation to prevent the camera from going upside
			// down.
			if (controller.xRot < -90) {
				controller.xRot = -90;
			} else if (controller.xRot > 90) {
				controller.xRot = 90;
			}
			// Send the onchange event to any listener.
			if (controller.onchange != null) {
				controller.onchange(controller.xRot, controller.yRot);
			}
		}
	};
}
