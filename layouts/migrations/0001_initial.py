# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Restaurant',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=1000)),
            ],
        ),
        migrations.CreateModel(
            name='Room',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=1000)),
            ],
        ),
        migrations.CreateModel(
            name='Table',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=1000)),
                ('xpos', models.IntegerField()),
                ('ypos', models.IntegerField()),
                ('tableType', models.CharField(max_length=2, choices=[(b'CI', b'Circlur Table'), (b'SQ', b'Square Table'), (b'VR', b'Vertically Rectangular Table'), (b'HR', b'Horizontally Rectangular Table')])),
                ('size', models.IntegerField()),
                ('rotation', models.IntegerField(default=0, validators=[django.core.validators.MaxValueValidator(179), django.core.validators.MinValueValidator(0)])),
            ],
        ),
    ]
