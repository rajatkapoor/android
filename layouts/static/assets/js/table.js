var tables = [];
var canvas;
var context;
var canvasWidth;
var canvasHeight;
var redrawInterval = 20;
var isDrag = false;
var mouseX, mouseY;
var selectedTable = null;
var selectionColor = "#000088";
var selectionBorderWidth = 1;
var tempCanvas;
var tempContext;
var offsetX, offsetY;
var refreshCanvas = true;
var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;


function TableClass()
{
    this.type = 0; // 0 FOR CIRCLE, 1 FOR RECTANGLE
    this.x = 0;
    this.y = 0;
    this.width = 1;
    this.height = 1;
    this.radius = 1;
    this.rotation = 0;
    this.strokeColor = "#AAAAAA";
    this.fillColor = "#AAAAAA";
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
            context.fillStyle = this.fillColor;
        }

        if (this.type == 0)
        {
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            context.closePath();
            context.fill();
            if (selectedTable === this)
            {
                context.strokeStyle = selectionColor;
                context.lineWidth = selectionBorderWidth;
                //context.strokeRect(this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius);
                context.strokeRect(this.x - this.radius - 1, this.y - this.radius - 1, (2 * this.radius) + 2, (2 * this.radius)+2);
            }
        }
        else
        {
            //if (this.x > canvasWidth || this.y > canvasHeight) return;
            //if (this.x + this.width < 0 || this.y + this.height < 0) return;

            if(this.rotation != 0)
            {
                context.rotate(this.rotation*Math.PI/180);
            }
            newx = transformedCoords(this.x,this.y,this).x;
            newy = transformedCoords(this.x,this.y,this).y;
            context.fillRect(newx, newy, this.width, this.height);
            if (selectedTable === this)
            {
                context.strokeStyle = selectionColor;
                context.lineWidth = selectionBorderWidth;
                //context.strokeRect(this.x, this.y, this.width, this.height);
                context.strokeRect(newx - 1, newy -1, this.width + 2, this.height + 2);
            }
            if(this.rotation != 0)
            {
                context.rotate(-this.rotation*Math.PI/180);
            }
        }

    }
};

function addTable(type, x, y, width, height, radius, rotation, strokeColor, fillColor)
{
    var table = new TableClass();
    table.type = type;
    table.width = width;
    table.height = height;
    table.radius = radius;
    table.strokeColor = strokeColor;
    table.fillColor = fillColor;
    table.rotation = rotation;
    table.x = x;
    table.y = y;
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
}


function clearCanvas(context)
{
    context.clearRect(0, 0, canvasWidth, canvasHeight);
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
        selectedTable.x = mouseX - offsetX;
        selectedTable.y = mouseY - offsetY;
        enableRefresh();
        showProperties(selectedTable);
    }
    showMouse();

        
}


function mouseDownEvent(e)
{
    getMouse(e);
           
    clearCanvas(tempContext);

    for (var i = tables.length - 1; i >= 0; i--)
    {
        tables[i].draw(tempContext);

        var imageData = tempContext.getImageData(mouseX, mouseY, 1, 1);
        
        if (imageData.data[3] > 0)
        {
            selectedTable = tables[i];
            offsetX = mouseX - selectedTable.x;
            offsetY = mouseY - selectedTable.y;
            selectedTable.x = mouseX - offsetX;
            selectedTable.y = mouseY - offsetY;

            showProperties(selectedTable);

            isDrag = true;
            enableRefresh();
            clearCanvas(tempContext);
            return;
        }

    }

    showProperties('');
    selectedTable = null;
    clearCanvas(tempContext);
    showMouse();

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




function createNewTableCircle()
{
    addTable(0, 90, 90, 100, 100, 40, 0, "#DDDDDD", "#DDDDDD");
}

function createNewTableSquare()
{
    addTable(1, 90, 90, 100, 100, 40, 0, "#DDDDDD", "#DDDDDD");
}

function showProperties(table)
{
    if(table == '')
    {
        document.getElementById('textBoxX').value = '';
        document.getElementById('textBoxY').value = '';
        document.getElementById('textBoxWidth').value = '';
        document.getElementById('textBoxHeight').value = '';
        document.getElementById('textBoxColor').value = '';
        document.getElementById('textBoxRotation').value = '';
    }
    document.getElementById('textBoxX').value = table.x;
    document.getElementById('textBoxY').value = table.y;
    document.getElementById('textBoxWidth').value = table.width;
    document.getElementById('textBoxHeight').value = table.height;
    document.getElementById('textBoxColor').value = table.fillColor;
    document.getElementById('textBoxRotation').value = table.rotation;

}

function updateTable() 
{
    
    selectedTable.x = parseInt(document.getElementById('textBoxX').value,10);
    selectedTable.y = parseInt(document.getElementById('textBoxY').value,10);
    selectedTable.width = parseInt(document.getElementById('textBoxWidth').value,10);
    selectedTable.height = parseInt(document.getElementById('textBoxHeight').value,10);
    selectedTable.fillColor = document.getElementById('textBoxColor').value;
    selectedTable.rotation = parseInt(document.getElementById('textBoxRotation').value,10);
    enableRefresh();

}
function transformedCoords(mouseX,mouseY,obj){

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
function showMouse()
{
    document.getElementById('mouseX').value = mouseX;
    document.getElementById('mouseY').value = mouseY;
}