# django specific imports
from django.shortcuts import render, render_to_response
from django.http import HttpResponse, JsonResponse,HttpResponseRedirect
from django.core import serializers
from django.template import Context, Template
from django.views.decorators.csrf import csrf_exempt

# models 
from layouts.models import Restaurant, Room, Table

# python imports
import json

# List of all the restaurants present
def restaurantList(request): 
    restaurants = Restaurant.objects.all()
    return render_to_response('restaurantslist.html', Context({'restaurants':restaurants}))

# list the rooms inside the restaurant with id = restID
def restaurant(request,restID):
    restaurant = Restaurant.objects.get(id = restID)
    rooms = restaurant.rooms.all()
    return render_to_response('restaurant.html',Context({'restaurant':restaurant,'rooms':rooms}))

# to show the layout of the rest room with id = roomID in restaurant with id = restID
def restaurantRoom(request, restID, roomID): 
    restaurant = Restaurant.objects.get(id = restID)
    room = Room.objects.get(id = roomID)
    tables = room.tables.all()
    print "tables = ",tables
    return render_to_response('restaurantroom.html',Context({'room':room,'restaurant':restaurant,'tables':tables}))

@csrf_exempt
def addRestaurant(request):
    name = request.POST['name']
    restaurant = Restaurant(name=name);
    restaurant.save();
    return HttpResponseRedirect('/restaurant/'+str(restaurant.id)+'/')


def addRoomToRestaurant(request,restID):# endpoint for adding room, invoked on clicking the add room button
    restaurant = Restaurant.objects.get(id = restID)
    room = Room(name = "Room"+str(restaurant.rooms.count()))
    room.save() 
    restaurant.rooms.add(room)
    restaurant.save()
    return HttpResponseRedirect('/restaurant/'+str(restaurant.id)+'/room/'+str(room.id)+'/')

# This website is protected form CSRF attacks
# This decorator exempts this endpoint from being protected from csrf attacks 
# This had to be done to make this url accessible through ajax
@csrf_exempt
def roomUpdate(request,restID,roomID):
    tables = request.GET['data'].split('|')[:-1]# table data recieved as text with '|' separating diff tables
    restaurant = Restaurant.objects.get(id = restID)
    room = Room.objects.get(id = roomID)
    for t in tables:
        data = json.loads(t)# generating python dict from json parse-able string 
        # print data
        uid = data['id']
        shape =  data['type']
        name = data['name']
        xpos = data['x']
        ypos = data['y']
        size = data['size']
        rotation = data['rotation']
        shape = data['type']
        chairs = data['chairs']
        try:# to see if table with the same id exists already then update that table
            table = Table.objects.get(id = int(uid))
        except:# create new table otherwise
            table = Table()
        # setting recieved values to table 
        table.name = name
        table.xpos = xpos
        table.ypos = ypos
        table.size = size
        table.rotation = rotation
        table.tableType = shape
        table.chairs = chairs
        table.save()
        room.tables.add(table)# saving table to room
        room.save()
    # send back updated table data
    updatedTables = room.tables.all()
    data = ""
    for t in updatedTables:
        data+=(str(t)+'|')
    return HttpResponse(data[:-1])

def trial(request):
    return render_to_response('trial.html')
