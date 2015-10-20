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
    this.strokeColor = "#AAAAAA"
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

            context.fillRect(this.x, this.y, this.width, this.height);
            if (selectedTable === this)
            {
                context.strokeStyle = selectionColor;
                context.lineWidth = selectionBorderWidth;
                //context.strokeRect(this.x, this.y, this.width, this.height);
                context.strokeRect(this.x - 1, this.y -1, this.width + 2, this.height + 2);
            }
        }

    }
}

function addTable(type, x, y, width, height, radius, strokeColor, fillColor)
{
    var table = new TableClass;
    table.type = type;
    table.x = x;
    table.y = y;
    table.width = width;
    table.height = height;
    table.radius = radius;
    table.strokeColor = strokeColor;
    table.fillColor = fillColor;
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

    canvas.onselectstart = function () { return false; }

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

    showProperties(null);
    selectedTable = null;
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
    addTable(0, 90, 90, 100, 100, 40, "#DDDDDD", "#DDDDDD");
}

function createNewTableSquare()
{
    addTable(1, 90, 90, 100, 100, 40, "#DDDDDD", "#DDDDDD");
}

function showProperties(table)
{
    document.getElementById('textBoxX').value = table.x;
    document.getElementById('textBoxY').value = table.y;
    document.getElementById('textBoxWidth').value = table.width;
    document.getElementById('textBoxHeight').value = table.height;
    document.getElementById('textBoxColor').value = table.fillColor;
}

function updateTable() {
    selectedTable.x = document.getElementById('textBoxX').value;
    selectedTable.y = document.getElementById('textBoxY').value;
    selectedTable.width = document.getElementById('textBoxWidth').value;
    selectedTable.height = document.getElementById('textBoxHeight').value;
    selectedTable.fillColor = document.getElementById('textBoxColor').value;

    enableRefresh();

}
