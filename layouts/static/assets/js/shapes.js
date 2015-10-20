var tables = [];
var corners = [];
var canvas;
var context;
var canvasWidth;
var canvasHeight;
var redrawInterval = 20;
var isDrag = false;
var isResize = false;
var mouseX, mouseY;
var selectedTable = null;
var selectionColor = "#043345";
var strokeColor = "#043345";
var fillColor = "#00b6c7";
var selectionBorderWidth = 1;
var tempCanvas;
var tempContext;
var offsetX, offsetY;
var refreshCanvas = true;
var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
var gridSize = 25;
var gridColor = "#85bbe6";


function TableClass()
{
    this.name = "";
    this.type = ""; // 0 FOR CIRCLE, 1 FOR RECTANGLE
    this.xpos = 0;
    this.ypos = 0;
    this.size = 1;
    this.width = 1;
    this.height = 1;
    this.radius = 1;
    this.rotation = 0;
    this.id = null;
}
TableClass.prototype =
{
    draw: function (context)
    {
        if (context === tempContext)
        {
            context.fillStyle = '#000000';
        }
        else
        {
            context.fillStyle = fillColor;
        }
        if (this.type == 'CI')
        {
            context.beginPath();
            context.arc(this.xpos, this.ypos, this.radius, 0, 2 * Math.PI);
            context.closePath();
            context.fill();
            if (selectedTable === this)
            {
                context.strokeStyle = selectionColor;
                context.lineWidth = selectionBorderWidth;
                //context.strokeRect(this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius);
                context.strokeRect(this.xpos - this.radius - 1, this.ypos - this.radius - 1, (2 * this.radius) + 2, (2 * this.radius)+2);
            }
        }
        else
        {
            if(this.rotation != 0)
            {
                context.rotate(this.rotation*Math.PI/180);
            }
            newx = transformedCoords(this.xpos,this.ypos,this).x;
            newy = transformedCoords(this.xpos,this.ypos,this).y;
            context.fillRect(newx, newy, this.width, this.height);
            if (selectedTable === this)
            {
                context.strokeStyle = selectionColor;
                context.lineWidth = selectionBorderWidth;
                context.strokeRect(newx - 1, newy -1, this.width + 2, this.height + 2);
            }
            if(this.rotation != 0)
            {
                context.rotate(-this.rotation*Math.PI/180);
            }
        }
    },
    updateSizes: function ()
    {
        if (this.type == "HR")
        {
            this.height = 50;
            this.width = this.size;
        }
        if (this.type == "VR")
        {
            this.width = 50;
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
            this.rotation = 0;
        }
        enableRefresh();
    },
    toJSON: function()
    {
        return '{"type":"'+this.type+'","xpos":"'+this.xpos+'","ypos":"'+this.ypos+'","name":"'+this.name+'","id":"'+this.id+'","rotation":"'+this.rotation+'","size":"'+this.size+'"}';
    }
};


function addTable(name, x, y, type, size, rotation,id)
{
    var table = new TableClass();
    table.type = type;
    table.size = size;
    table.id = typeof id !== 'undefined' ? id : null;
    console.log(table.type);
    table.xpos = x;
    table.ypos = y;
    table.rotation = rotation;
    if (table.type == "HR")
    {
        table.height = 50;
        table.width = size;
    }
    if (table.type == "VR")
    {
        table.width = 50;
        table.height = size;
    }
    if (table.type == "SQ")
    {
        table.width = size;
        table.height = size;
    }
    if (table.type == "CI")
    {
        table.radius = size;
        table.rotation = 0;
    }
    tables.push(table);
    enableRefresh();
}

function initCanvas()
{
    canvas = document.getElementById('canvasMain');
    canvasHeight = canvas.height;
    canvasWidth = canvas.width;
    context = canvas.getContext('2d');
    tempCanvas = document.createElement('canvas');
    tempCanvas.height = canvasHeight;
    tempCanvas.width = canvasWidth;
    tempContext = tempCanvas.getContext('2d');

    canvas.onselectstart = function () { return false; };

    if (document.defaultView && document.defaultView.getComputedStyle)
    {
        stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
        stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
        styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
        styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
    }

    setInterval(mainDraw, redrawInterval);

    canvas.onmousedown = mouseDownEvent;
    canvas.onmouseup = mouseUpEvent;
    canvas.onmousemove = mouseMoveEvent;
    canvas.onmouseleave = mouseLeaveEvent;
    tempCanvas.onmousedown = mouseDownEvent;
    tempCanvas.onmouseup = mouseUpEvent;
    tempCanvas.onmousemove = mouseMoveEvent;
    tempCanvas.onmouseleave = mouseLeaveEvent;


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


function clearCanvas(context)
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

function mainDraw()
{
    if (refreshCanvas == true)
    {
        clearCanvas(context);
        for (var i = 0; i < tables.length; i++)
        {
            tables[i].draw(context);
        }

        refreshCanvas = false;
    }
}

function mouseMoveEvent(e)
{
    if (isDrag)
    {
        getMouse(e);
        selectedTable.xpos = mouseX - offsetX;
        selectedTable.ypos = mouseY - offsetY;
        enableRefresh();
        showProperties(selectedTable);
    }
   
}

function mouseDownEvent(e)
{
    getMouse(e);
           
    clearCanvas(tempContext);

    for (var i = tables.length - 1; i >= 0; i--)
    {
        tables[i].draw(tempContext);

        var imageData = tempContext.getImageData(mouseX, mouseY, 1, 1);
        console.log(imageData.data);
        
        if (imageData.data[3] > 0)
        {
            selectedTable = tables[i];
            offsetX = mouseX - selectedTable.xpos;
            offsetY = mouseY - selectedTable.ypos;
            selectedTable.xpos = mouseX - offsetX;
            selectedTable.ypos = mouseY - offsetY;

            showProperties(selectedTable);

            isDrag = true;
            enableRefresh();
            clearCanvas(tempContext);
            return;
        }

    }

    showProperties('');
    selectedTable = '';
    clearCanvas(tempContext);

    enableRefresh();
}

function mouseUpEvent()
{
    isDrag = false;
}

function mouseLeaveEvent() {
    isDrag = false;
}

function enableRefresh()
{
    refreshCanvas = true;
    // console.log(context);
}


function getMouse(e)
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
    addTable('Circle Table', 90, 90, 'CI', 100, 0);
}

function createNewTableSquare()
{
    t = addTable('Square Table', 90, 90, 'SQ', 100, 0);
}
function createNewTableVRect()
{
    t = addTable('Vertical Table', 90, 90, 'VR', 100, 0);
}
function createNewTableHRect()
{
    t = addTable('Horizontal Table', 90, 90, 'HR', 100, 0);
}

function showProperties(table)
{
    if(table == '')
    {
        document.getElementById('textBoxX').value = '';
        document.getElementById('textBoxY').value = '';
        document.getElementById('textBoxSize').value = '';
        document.getElementById('textBoxRotation').value = '';
        document.getElementById('textBoxType').value = '';

    }
    document.getElementById('textBoxX').value = table.xpos;
    document.getElementById('textBoxY').value = table.ypos;
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


}

function updateTable() 
{
    selectedTable.xpos = parseInt(document.getElementById('textBoxX').value,10);
    selectedTable.ypos = parseInt(document.getElementById('textBoxY').value,10);
    selectedTable.size = parseInt(document.getElementById('textBoxSize').value,10);
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

    enableRefresh();

}
function transformedCoords(mouseX,mouseY,obj)
{
    var angle = (obj.rotation*-1) * Math.PI / 180;   
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var newx = mouseX*cos - mouseY*sin; 
    var newy = mouseX*sin + mouseY*cos;
    return {
        x : Math.ceil(newx),
        y : Math.ceil(newy)
    };
}
// function showMouse()
// {
//     document.getElementById('mouseX').value = mouseX;
//     document.getElementById('mouseY').value = mouseY;
// }