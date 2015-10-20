from django.contrib import admin

# Register your models here.
from layouts.models import Restaurant, Room, Table

class RestaurantAdmin(admin.ModelAdmin):
    pass
    
class RoomAdmin(admin.ModelAdmin):
    pass
    
class TableAdmin(admin.ModelAdmin):
    pass

admin.site.register(Room, RoomAdmin)
admin.site.register(Restaurant, RestaurantAdmin)
admin.site.register(Table, TableAdmin)