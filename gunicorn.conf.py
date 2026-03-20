import multiprocessing

# Limit workers to 2 for small containers (512MB RAM)
workers = 2
bind = "0.0.0.0:8000"
timeout = 120
