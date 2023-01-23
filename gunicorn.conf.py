from glob import glob

bind = "0.0.0.0:80"
workers = 4 
reload = True 
wsgi_app = "routes:app"
reload_extra_files = glob("templates/*")
