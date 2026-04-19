#!/usr/bin/env python3
"""
Cloud Agent IQ — static site server.
Serves the site on 0.0.0.0:8080 with correct MIME types and a lightweight
access log. Designed to sit behind the cloudflared tunnel.
"""
import http.server
import socketserver
import os
import sys
import signal
from datetime import datetime

PORT = 8080
ROOT = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    # nicer logs
    def log_message(self, fmt, *args):
        ts = datetime.now().strftime("%H:%M:%S")
        sys.stderr.write(f"[{ts}] {self.address_string()} {fmt % args}\n")

    def end_headers(self):
        # Reasonable caching for assets, no cache for html during dev
        if self.path.endswith('.html') or self.path == '/' or self.path == '':
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
        else:
            self.send_header('Cache-Control', 'public, max-age=300')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

# Allow quick restart without TIME_WAIT issues
socketserver.TCPServer.allow_reuse_address = True

def shutdown(signum, frame):
    print("\n[server] shutting down")
    sys.exit(0)

signal.signal(signal.SIGTERM, shutdown)
signal.signal(signal.SIGINT, shutdown)

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"[server] Cloud Agent IQ serving on http://0.0.0.0:{PORT}")
    print(f"[server] root: {ROOT}")
    httpd.serve_forever()
