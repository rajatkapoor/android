from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

class Restaurant(models.Model):
    #Restaurant Model
    name = models.CharField(max_length=1000)
    rooms = models.ManyToManyField('Room', blank = True)
    def __unicode__(self):
        return self.name

class Room(models.Model):
    #Room model
    name = models.CharField(max_length=1000)
    tables = models.ManyToManyField('Table', blank = True)
    def __unicode__(self):
        return self.name

class Table(models.Model):
    name = models.CharField(max_length=1000)
    xpos = models.IntegerField()
    ypos = models.IntegerField()
    TABLE_TYPE_CHOICES = (
        ('CI', 'Circlar Table'),
        ('SQ', 'Square Table'),
        ('VR', 'Vertically Rectangular Table'),
        ('HR', 'Horizontally Rectangular Table'),
    )
    tableType = models.CharField(max_length = 2, choices = TABLE_TYPE_CHOICES)
    size = models.IntegerField()
    rotation = models.IntegerField(
        default=0,
        validators=[
            MaxValueValidator(179),
            MinValueValidator(0)
        ]
     )
    def __unicode__(self):
        #The unicode representation of Table object is JSON Parse-able by Javascript
        return '{"type":"'+self.tableType+'","xpos":"'+str(self.xpos)+'","ypos":"'+str(self.ypos)+'","name":"'+str(self.name)+'","id":"'+str(self.id)+'","rotation":"'+str(self.rotation)+'","size":"'+str(self.size)+'"}'