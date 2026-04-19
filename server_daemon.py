#!/usr/bin/env python3
"""Daemonized server - double-fork to detach from any parent session."""
import os, sys

# First fork
if os.fork() > 0:
    sys.exit(0)
os.setsid()
# Second fork - prevents reacquiring controlling tty
if os.fork() > 0:
    sys.exit(0)

# In the grandchild - fully detached
os.chdir("/home/claude/cloudagentiq")
# Redirect stdio
devnull = open("/dev/null", "rb")
logfile = open("/tmp/caiq-server.log", "ab", buffering=0)
os.dup2(devnull.fileno(), sys.stdin.fileno())
os.dup2(logfile.fileno(), sys.stdout.fileno())
os.dup2(logfile.fileno(), sys.stderr.fileno())

# Write pid
with open("/tmp/caiq-server.pid", "w") as f:
    f.write(str(os.getpid()))

# Now run the actual server
import http.server, socketserver
from datetime import datetime

PORT = 8080
ROOT = "/home/claude/cloudagentiq"

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)
    def log_message(self, fmt, *args):
        ts = datetime.now().strftime("%H:%M:%S")
        sys.stderr.write(f"[{ts}] {self.address_string()} {fmt % args}\n")
    def end_headers(self):
        if self.path.endswith('.html') or self.path in ('/', ''):
            self.send_header('Cache-Control', 'no-cache')
        else:
            self.send_header('Cache-Control', 'public, max-age=300')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy', 'interest-cohort=()')
        super().end_headers()
    def send_error(self, code, message=None, explain=None):
        # Serve our themed 404 instead of the default text page
        if code == 404:
            try:
                with open(os.path.join(ROOT, '404.html'), 'rb') as f:
                    body = f.read()
                self.send_response(404)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            except Exception:
                pass
        super().send_error(code, message, explain)

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("0.0.0.0", PORT), H) as httpd:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] daemon serving on :{PORT}", flush=True)
    httpd.serve_forever()
