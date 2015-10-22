"""book URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin
from layouts.views import restaurantList,restaurant,restaurantRoom,trial,addRoomToRestaurant,roomUpdate, addRestaurant

urlpatterns = [
    url(r'^home/$', restaurantList),
    url(r'^restaurants/$', restaurantList),

    url(r'^restaurant/(\d+)/$', restaurant),# for one restaurant
    url(r'^restaurant/(\d+)/room/(\d+)/$', restaurantRoom),# for room in a restaurant
    url(r'^restaurant/(\d+)/room/(\d+)/update/$', roomUpdate),# for updating table info from canvas using ajax
    url(r'^restaurant/(\d+)/room/add/$', addRoomToRestaurant),# add room endpoint
    url(r'^restaurant/add/$', addRestaurant),# add Restaurant


    # url(r'^trial/$', trial),
    url(r'^admin/', include(admin.site.urls)),# admin app endpoint
]
