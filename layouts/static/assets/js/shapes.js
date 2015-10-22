var tables = []; // keep track of all tables on canvas, array of table class

var corners = []; // for keeping track of corners of selected table, array of corner class
var cornerRadius = 4;
var cornerColor = "#000000";

// canvas and drawing params
var canvas;
var context;
var canvasWidth;
var canvasHeight;
var redrawInterval = 20;
var tempCanvas;
var tempContext;// tempContext helps to determine the selected table on clicking on canvas

// flags which are set to determine whether a mouse down event is for drag or resize or neither
var isDrag = false;
var isResize = false;

var mouseX, mouseY;// contain the current mouse coordinates on canvas when getMouse() is called

//properties related to the style of canvas which help us determine proper offsets for mouse coordinates
var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

var selectedTable = ''; // to keep track of selected table

var dim =50; // the fixed dim of the vrect an hrect

// properties of table bounding box
var selectionColor = "#043345"; 
var strokeColor = "#043345";
var selectionBorderWidth = 1;

// fill color of tables
var fillColor = "#00b6c7"; 
var nameColor = "#000000";

var offsetX, offsetY;// offset of mouse coordinate vs selectedTable.x, SelectedTable y
var refreshCanvas = true;// flag to monitor whether anything changed on the canvas and does it need to be refreshed

// canvas grid params
var gridSize = 25;
var gridColor = "#85bbe6";

// variables to assist in resize operation
var oldX = 0;
var oldY = 0;
var oldSize = 0;
var corner=null;
var cornerOpp=null;
var cornerDist=null;
var cornerIndex=null;

var m;// to store recieved ajax response

function CornerClass(x,y)
{
    this.x = typeof x !== 'undefined' ? x:0;
    this.y = typeof y !== 'undefined' ? y:0;
    this.radius = cornerRadius;
}
CornerClass.prototype = 
{
    draw: function(context)
    {
        context.fillStyle = cornerColor;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
    }
};

function TableClass(name,type,x,y,size,rotation)
{
    this.name = typeof name !== 'undefined' ? name : "table";
    this.type = typeof type !== 'undefined' ? type : ""; // 0 FOR CIRCLE, 1 FOR RECTANGLE
    this.x = typeof x !== 'undefined' ? x:0;
    this.y = typeof y !== 'undefined' ? y:0;
    this.size = typeof size !== 'undefined' ? size:0; // this is the main param deciding the rest of the dimensions
    this.width = 1;
    this.height = 1;
    this.radius = 1;
    this.rotation = typeof rotation !== 'undefined' ? rotation:0;
    this.id = null; // primary key of table in DB
    this.newx = 0;// to keep track of new coords after rotation
    this.newy = 0;

}
TableClass.prototype =
{
    draw: function (context)// draw function
    {
        this.updateSizes();
        if (context === tempContext)// context tempcontext will be passed when determining selectedTable
        {
            context.fillStyle = '#000000';
        }
        else
        {
            context.fillStyle = fillColor;
        }
        if (this.type == 'CI')// if table is a circle draw using arcs method, no need to take care of rotation
        {
            context.beginPath();
            context.arc(this.x+this.radius, this.y+this.radius, this.radius, 0, 2 * Math.PI);
            context.closePath();
            context.fill();
            prevFill = context.fillStyle;
            context.fillStyle = nameColor;
            context.font = "20px Arial";
            textx = transformedCoords(this.x+this.radius,this.y+this.radius,0).x;
            texty = transformedCoords(this.x+this.radius,this.y+this.radius,0).y;
            context.fillText(this.name,textx,texty);
            context.fillStyle = prevFill;

            if (selectedTable === this)
            {
                context.strokeStyle = selectionColor;
                context.lineWidth = selectionBorderWidth;
                //context.strokeRect(this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius);
                context.strokeRect(this.x-1, this.y-1, (2 * this.radius), (2 * this.radius)+1);

            }
            enableRefresh();
        }
        else // draw square, vrect,hrect using rect methods
        {

            
            context.rotate(this.rotation*Math.PI/180); // rotating the context based on the rot value of table
            newx = transformedCoords(this.x,this.y,this.rotation).x;// drawing is to be done at transformed coords
            newy = transformedCoords(this.x,this.y,this.rotation).y;// while for details the normals coords will be shown
            context.fillRect(newx, newy, this.width, this.height);

            prevFill = context.fillStyle;
            context.fillStyle = nameColor;
            context.font = "20px Arial";
            textx = transformedCoords(this.x+this.width/2,this.y+this.height/2,this.rotation).x;
            texty = transformedCoords(this.x+this.width/2,this.y+this.height/2,this.rotation).y;
            context.fillText(this.name,this.newx+this.width/2,this.newy+this.height/2);
            context.fillStyle = prevFill;
            
            if (selectedTable === this)
            {
                context.strokeStyle = selectionColor;
                context.lineWidth = selectionBorderWidth;
                context.strokeRect(newx - 1, newy -1, this.width + 2, this.height + 2);

            }
            context.rotate(-this.rotation*Math.PI/180);// inverting rotation
            enableRefresh();

        }
        if (selectedTable===this)
        {    
        this.generateCorners(); //compute and draw corners
        enableRefresh();
        }
    },
    updateSizes: function ()// determine all the toher dimensions of the table on the basis of the size
    {
        if(this.size<cornerRadius)// avoid negative and 0 size errors
        {
            this.size=2*cornerRadius;
        }
        if (this.type == "HR")
        {
            this.height = dim;
            this.width = this.size;
        }
        if (this.type == "VR")
        {
            this.width = dim;
            this.height = this.size;
        }
        if (this.type == "SQ")
        {
            this.width = this.size;
            this.height = this.size;
        }
        if (this.type == "CI")
        {
            this.radius = this.size;
            // this.rotation = 0;
            this.width = 2*this.size;
            this.height = 2*this.size;
            this.newx = this.x;
            this.newy = this.y;
        }
        if (this.type!="CI") 
        {
            this.newx = transformedCoords(this.x,this.y,this.rotation).x;
            this.newy = transformedCoords(this.x,this.y,this.rotation).y;
        }
        enableRefresh();
    },
    toJSON: function()// get a clean json repr of the table to send to the backend
    {
        return '{"type":"'+this.type+'","x":"'+this.x+'","y":"'+this.y+'","name":"'+this.name+'","id":"'+this.id+'","rotation":"'+this.rotation+'","size":"'+this.size+'"}';
    },
    generateCorners: function()// funciton to generate corners of the table and store it in the corners array
    {// generating only one now
        this.updateSizes();
        corners = [];
        // corners[0] = new CornerClass(this.newx+this.width,this.newy+this.height);
        corners[0] = new CornerClass(this.newx+this.width,this.newy+this.height);
        corners[1] = new CornerClass(this.newx,this.newy+this.height);
        corners[2] = new CornerClass(this.newx,this.newy);
        corners[3] = new CornerClass(this.newx+this.width,this.newy);
        for (var i = 0; i < corners.length; i++)// drawing all corners
        {
            context.fillStyle = cornerColor;
            context.strokeStyle = null;
            if (this.type=="CI")
            {
                rot = 0;
            }
            else
            {
                rot = this.rotation;
            }
            context.rotate(rot*Math.PI/180);
            corners[i].draw(context);
            context.rotate(-rot*Math.PI/180);
            context.fillStyle = fillColor;
            context.strokeStyle = selectionColor;
        }
    }
};


function addTable(name, x, y, type, size, rotation,id)// to add a table to tables array
{
    var table = new TableClass(name, type, x, y, size, rotation);
    table.id = typeof id !== 'undefined' ? id : null;
    table.updateSizes();
    tables.push(table);
    enableRefresh();
}

function initCanvas()// intialize canvas params and determine padding and offsets
{
    canvas = document.getElementById('canvasMain');
    canvasHeight = canvas.height;
    canvasWidth = canvas.width;
    context = canvas.getContext('2d');
    context.textAlign = "center";

    tempCanvas = document.createElement('canvas');
    tempCanvas.height = canvasHeight;
    tempCanvas.width = canvasWidth;
    tempContext = tempCanvas.getContext('2d');
    
    // canvas.addEventListener('onselectstart', function(e) { e.preventDefault(); return false; }, false);

    canvas.onselectstart = function(e){ e.preventDefault(); return false; };// to stop the default blue selection

    if (document.defaultView && document.defaultView.getComputedStyle)
    {
        stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
        stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
        styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
        styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
    }

    setInterval(mainDraw, redrawInterval);// calling mainDraw every redraw interval millisecs
    // the function actually performs only when the refreshCanvas flag is set

    // attaching event handlers
    canvas.onmousedown = mouseDownEvent;
    canvas.onmouseup = mouseUpEvent;
    canvas.onmousemove = mouseMoveEvent;
    canvas.onmouseleave = mouseLeaveEvent;
    // canvas.onkeypress = keyPressEvent;
    tempCanvas.onmousedown = mouseDownEvent;
    tempCanvas.onmouseup = mouseUpEvent;
    tempCanvas.onmousemove = mouseMoveEvent;
    tempCanvas.onmouseleave = mouseLeaveEvent;

    // drawing grids
    for (var x = 0; x <= canvasWidth; x += gridSize) {
        context.moveTo(x, 0);
        context.lineTo(x, canvasHeight);
    }
    for (var x = 0; x <= canvasHeight; x += gridSize) {
        context.moveTo(0, 0.5 + x);
        context.lineTo(canvasWidth, 0.5 + x);
    }
    context.strokeStyle = gridColor;
    context.stroke();
}


function clearCanvas(context)// clear the canvas and redraw grid
{
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    for (var x = 0; x <= canvasWidth; x += gridSize) {
        context.moveTo(x, 0);
        context.lineTo(x, canvasHeight);
    }
    for (var x = 0; x <= canvasHeight; x += gridSize) {
        context.moveTo(0, 0.5 + x);
        context.lineTo(canvasWidth, 0.5 + x);
    }
    context.strokeStyle = gridColor;
    context.stroke();
}

function mainDraw()// drawing funciton which is called repetitively
{
    if (refreshCanvas == true)
    {
        clearCanvas(context);
        for (var i = 0; i < tables.length; i++)
        {
            tables[i].updateSizes();
            tables[i].draw(context);
        }
        refreshCanvas = false;
    }
}
// function keyPressEvent(e)
// {
//     e.preventDefault();
//     console.log(e);
// }

function mouseMoveEvent(e)// handles mouse move on canvas
{
    // getMouse(e);
    // console.log("x "+mouseX);
    // console.log("Y "+mouseY);
    if (isDrag)// if this motion is drag
    {
        getMouse(e);
        selectedTable.x = mouseX - offsetX;
        selectedTable.y = mouseY - offsetY;
        enableRefresh();
        showProperties(selectedTable);
        return;
    }
    if(isResize)// if the motion is resize
    {
        getMouse(e);
        canvas.style.cursor = 'crosshair';
        // other techniques
        // // console.log("diff = "+(mouseX - oldX+mouseY - oldY));
        // // distOrig = Math.sqrt((oldX-selectedTable.x)*(oldX-selectedTable.x)+(oldY-selectedTable.y)*(oldY-selectedTable.y));
        // // distNew = Math.sqrt((mouseX-selectedTable.x)*(mouseX-selectedTable.x)+(mouseY-selectedTable.y)*(mouseY-selectedTable.y));
        // // diff = Math.sqrt((oldX-mouseX)*(oldX-mouseX)+(oldY-mouseY)*(oldY-mouseY));
        // // finalDiff = distNew>distOrig?1:-1;
        
        // // console.log("distOrig "+ distOrig);
        // // console.log("distNew "+ distNew);
        // // console.log("diff "+ diff);
        // // console.log("finalDiff "+ finalDiff);
        
        //         rmx = transformedCoords(mouseX,mouseY,selectedTable.rotation).x;

        //         rmy = transformedCoords(mouseX,mouseY,selectedTable.rotation).y;
        //         if (selectedTable.type=="HR")
        //         cornerDiff = (cornerOpp.y-rmy);
        //         if (selectedTable.type=="VR")
        //         cornerDiff = (cornerOpp.x-rmx);
        //     if (selectedTable.type=="SQ")

        //         cornerDiff = Math.sqrt((cornerOpp.x-rmx)*(cornerOpp.x-rmx)+(cornerOpp.y-rmy)*(cornerOpp.y-rmy));
        //         else
        //             cornerDiff = Math.sqrt((cornerOpp.x-rmx)*(cornerOpp.x-rmx)+(cornerOpp.y-rmy)*(cornerOpp.y-rmy))/(2*Math.sqrt(2));

        //         console.log("rmx "+rmx);    

        //         console.log("rmy "+rmy); 
        // cornerDiff = Math.sqrt((cornerOpp.x-mouseX)*(cornerOpp.x-mouseX)+(cornerOpp.y-mouseY)*(cornerOpp.y-mouseY))-cornerDist ;
        // cornerDiff = Math.sqrt((corner.x-mouseX)*(corner.x-mouseX)+(corner.y-mouseY)*(corner.y-mouseY))-cornerDist ;
        // console.log(cornerDiff);

        // // console.log(corner);
        // // todo better resize tech
        // selectedTable.size = cornerDiff;// update size on the basis of the mouse movement(last working)
        // // corner = corners[cornerIndex];
        // // cornerOpp = corners[(cornerIndex+2)%4];
        // cornerDist = Math.sqrt((cornerOpp.x-corner.x)*(cornerOpp.x-corner.x)+(cornerOpp.y-corner.y)*(cornerOpp.y-corner.y));

        // update size on the basis of the mouse movement
        // selectedTable.size = oldSize+mouseX - selectedTable.x+mouseY - selectedTable.y;// update size on the basis of the mouse movement
        //selectedTable.size +=finalDiff;// update size on the basis of the mouse movement
        
        selectedTable.size = oldSize+mouseX - oldX+mouseY - oldY; //working 
        selectedTable.updateSizes();
        selectedTable.generateCorners();
        enableRefresh();
        showProperties(selectedTable);
        return;
    }
}

function mouseDownEvent(e)// handles mouse down on canvas
{
    getMouse(e);
    clearCanvas(tempContext);
    if (selectedTable!=='')// if there is a selected table then the person can drag the corner, hence check for click on corner
    {
        // console.log("mx "+mouseX);    //debug
        // console.log("my "+mouseY);    //debug
        selectedTable.generateCorners();
        for (i=0;i<4;i++)
        {
            corner = corners[i];
            
            newx = transformedCoords(mouseX,mouseY,selectedTable.rotation).x;// generate the coords of mouse 
            newy = transformedCoords(mouseX,mouseY,selectedTable.rotation).y;// corresponding to the rotation of the selctedTable
            if (newx >= corner.x - cornerRadius && newx <= corner.x + cornerRadius && newy >= corner.y - cornerRadius && newy <= corner.y + cornerRadius)
            {
                isResize = true;// set flag for resize
                //keep track of the resize start coords, and the intial size
                oldX = mouseX;
                oldY = mouseY;
                oldSize = selectedTable.size;

                //help assist for other resize strategies
                cornerIndex = i;
                corner = corners[cornerIndex];
                cornerOpp = corners[(cornerIndex+2)%4];
                rmx = transformedCoords(mouseX,mouseY,selectedTable.rotation).x;
                rmy = transformedCoords(mouseX,mouseY,selectedTable.rotation).y;
                cornerDist = Math.sqrt((cornerOpp.x-corner.x)*(cornerOpp.x-corner.x)+(cornerOpp.y-corner.y)*(cornerOpp.y-corner.y));
                // cornerDiff = selectedTable.Size;
                // debug log output
                // console.log("cx "+corner.x);    
                // console.log("cy "+corner.y);
                // console.log("cox "+cornerOpp.x);    
                // console.log("coy "+cornerOpp.y);    
                // console.log("rmx "+rmx);    
                // console.log("rmy "+rmy); 
                console.log("RESIZE TRUE");return;
            }
        }
        
    }
    // determine the table on which the user has clicked and store it in selectedTable
    for (var i = tables.length - 1; i >= 0; i--)
    {
        tables[i].draw(tempContext);
        var imageData = tempContext.getImageData(mouseX, mouseY, 1, 1);
        //console.log(imageData.data);// debug
        if (imageData.data[3] > 0)
        {
            selectedTable = tables[i];
            offsetX = mouseX - selectedTable.x;
            offsetY = mouseY - selectedTable.y;
            selectedTable.x = mouseX - offsetX;
            selectedTable.y = mouseY - offsetY;
            showProperties(selectedTable);
            isDrag = true;
            console.log("DRAG TRUE");
            enableRefresh();
            
            return;// return if a table is selected
        }
        clearCanvas(tempContext);
    }
    // if no table is selected
    showProperties('');
    selectedTable = '';// reset selected table
    corners=[]; // empty corners
    clearCanvas(tempContext);
    enableRefresh();// set the canvas to refresh
}

function mouseUpEvent()// handles mouse up on canvas
{
    isDrag = false;// unset the drag flag
    isResize = false;// unset resize
    canvas.style.cursor = 'auto';// set the cursor to normal
    oldX = 0;
    oldY = 0;
}

function mouseLeaveEvent()  // handles mouse leave
{
    isDrag = false;
    isResize = false;
    canvas.style.cursor = 'auto';// set the cursor to normal
}

function enableRefresh()
{
    refreshCanvas = true;// set flag to redraw canvas at the next main draw call
}


function getMouse(e)// set the update mouse coordinates (on the canvas) on mouseX and mouseY vars
{
    var element = canvas, elementOffsetX = 0, elementOffsetY = 0;
    if (element.offsetParent)
    {
        do
        {
            elementOffsetX += element.offsetLeft;
            elementOffsetY += element.offsetTop;
        }
        while ((element = element.offsetParent));
    }
    elementOffsetX += stylePaddingLeft;
    elementOffsetY += stylePaddingTop;
    elementOffsetX += styleBorderLeft;
    elementOffsetY += styleBorderTop;

    mouseX = e.pageX - elementOffsetX;
    mouseY = e.pageY - elementOffsetY
}

// name, x, y, type, size, rotation
function createNewTableCircle()
{
    addTable('CT'+tables.length, 90, 90, 'CI', 100, 0);
}

function createNewTableSquare()
{
    t = addTable('ST'+tables.length, 90, 90, 'SQ', 100, 0);
}

function createNewTableVRect()
{
    t = addTable('VT'+tables.length, 90, 90, 'VR', 100, 0);
}

function createNewTableHRect()
{
    t = addTable('HT'+tables.length, 90, 90, 'HR', 100, 0);
}

function showProperties(table)// function to set the textboxes to show the properties of the selected tables
{
    if(table === '')
    {
        document.getElementById('textBoxX').value = "--";
        document.getElementById('textBoxY').value = "--";
        document.getElementById('textBoxSize').value = "--";
        document.getElementById('textBoxRotation').value = "--";
        document.getElementById('textBoxType').value = "--";
        document.getElementById('textBoxName').value = "--";
    }
    else
    {
        validateRotation();
        document.getElementById('textBoxName').value = table.name;
        document.getElementById('textBoxX').value = table.x;
        document.getElementById('textBoxY').value = table.y;
        document.getElementById('textBoxSize').value = table.size;
        document.getElementById('textBoxRotation').value = table.rotation;
        switch(table.type)
        {
            case "CI":
                var shape="Circle";

                break;
            case "SQ":
                var shape="Square";
                break;
            case "VR":
                var shape="Vertical Rectangle";
                break;
            case "HR":
                var shape="Horizontal Rectangle";
                break;
        }
        document.getElementById('textBoxType').value = shape;
        validateRotation();
    }
}

function updateTable() // on the click of update button
{
    // set the changed properties of the selected table from the form
    if (selectedTable!=="")
    {
        selectedTable.x = parseInt(document.getElementById('textBoxX').value,10);
        selectedTable.y = parseInt(document.getElementById('textBoxY').value,10);
        selectedTable.size = parseInt(document.getElementById('textBoxSize').value,10);
        selectedTable.name = document.getElementById('textBoxName').value;
        switch(document.getElementById('textBoxType').value)
        {
            case "Circle":
                var shape="CI";
                break;
            case "Square":
                var shape="SQ";
                break;
            case "Vertical Rectangle":
                var shape="VR";
                break;
            case "Horizontal Rectangle":
                var shape="HR";
                break;
        }
        selectedTable.type = shape;
        selectedTable.rotation = parseInt(document.getElementById('textBoxRotation').value,10);
        selectedTable.updateSizes();
    }
    // sending data to backend and recieving back the updated data with the ids attached
    var senddata = "";
            tables.forEach(function(i,e){
            // console.log(i.toJSON());
                senddata+=(i.toJSON()+"|");
            });
            $.ajax({
                type: "GET",
                url: "update/",
                dataType: 'text',
                contentType: 'application/json',
                success: function (msg) {
                    m = msg;
                    // console.log(msg); //DEBUG
                    m = m.split('|');
                    tables = [];
                    for (i=0;i <= m.length-1;i++)
                    {
                        tab = JSON.parse(m[i]);
                        addTable(tab.name, parseInt(tab.xpos,10), parseInt(tab.ypos,10), tab.type, parseInt(tab.size,10), parseInt(tab.rotation,10), tab.id);
                    }
                    // console.log(tables); //DEBUG
                    enableRefresh();
                },
                data:'data='+senddata,
            });
        selectedTable="";
        showProperties(selectedTable);
    enableRefresh();

}

function transformedCoords(mouseX,mouseY,rot)// generated transformed coords of the passed coords according to the rotation of the object passed
{
    var angle = (rot*-1) * Math.PI / 180;   
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var newx = mouseX*cos - mouseY*sin; 
    var newy = mouseX*sin + mouseY*cos;
    return {
        x : Math.ceil(newx),
        y : Math.ceil(newy)
    };
}

function validateRotation()// function to make sure the rotation val is in 0 to 90
{
    rot = parseInt(document.getElementById('textBoxRotation').value,10);
    document.getElementById('textBoxRotation').value = rot%180;
}