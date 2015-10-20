from django.shortcuts import render
from django.http import HttpResponse, JsonResponse,HttpResponseRedirect
from django.core import serializers
from django.template import Context, Template
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt


from layouts.models import Restaurant, Room, Table
# Create your views here.
import simplejson,json

def restaurantList(request):
    restaurants = Restaurant.objects.all()
    return render_to_response('restaurantslist.html', Context({'restaurants':restaurants}))

def restaurant(request,restID):
    restaurant = Restaurant.objects.get(id = restID)
    rooms = restaurant.rooms.all()
    return render_to_response('restaurant.html',Context({'restaurant':restaurant,'rooms':rooms}))

def restaurantRoom(request, restID, roomID):
    restaurant = Restaurant.objects.get(id = restID)
    room = Room.objects.get(id = roomID)
    tables = room.tables.all()
    #tlist = serializers.serialize('json', room.tables.all())
    # tlist = json.dumps(room.tables.values())
    # return HttpResponse(tables)
    # return JsonResponse(tables,safe=False)
    print "tables = ",tables
    return render_to_response('restaurantroom.html',Context({'room':room,'restaurant':restaurant,'tables':tables}))

def addRoomToRestaurant(request,restID):
    restaurant = Restaurant.objects.get(id = restID)

    room = Room(name = "Room"+str(restaurant.rooms.count()))
    room.save() 
    restaurant.rooms.add(room)
    restaurant.save()
    return HttpResponseRedirect('/restaurant/'+str(restaurant.id)+'/room/'+str(room.id)+'/')

@csrf_exempt
def roomUpdate(request,restID,roomID):
    tables = request.GET['data'].split('|')[:-1]
    restaurant = Restaurant.objects.get(id = restID)
    room = Room.objects.get(id = roomID)
    for t in tables:
        data = json.loads(t)
        print data
        uid = data['id']
        shape =  data['type']
        name = data['name']
        xpos = data['xpos']
        ypos = data['ypos']
        size = data['size']
        rotation = data['rotation']
        shape = data['type']
        if (uid!="null"):
            table = Table.objects.get(id = int(uid))
        else:
            table = Table()
        table.name = name
        table.xpos = xpos
        table.ypos = ypos
        table.size = size
        table.rotation = rotation
        table.tableType = shape
        print "table",table
        table.save()
        print "saved"

        print "saving table to room"
        room.tables.add(table)
        room.save()
    return HttpResponse("Success")

def trial(request):
    return render_to_response('trial.html')
