import http.server
import socketserver
import os
import sys

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

# Change directory to this script's directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("-" * 50)
print(f"Konter-TrackApp Dev Server is running!")
print(f"Open your browser and visit: http://localhost:{PORT}")
print("Press CTRL+C to stop the server.")
print("-" * 50)

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nStopping server...")
    sys.exit(0)
except Exception as e:
    print(f"Error starting server: {e}")
    sys.exit(1)
