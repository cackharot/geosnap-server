#!/bin/sh
sudo uwsgi -s /tmp/uwsgi_geosnap.sock -w wsgi:app --chown=www-data:www-data --logto2 /var/log/nginx/uwsgi_geosnap_log.log