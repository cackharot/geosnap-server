# Set the path
import os, sys
from flask_script import Manager, Server

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from geosnap import app

manager = Manager(app)

# Turn on debugger by default and reloader
manager.add_command("run", Server(
    use_debugger=True,
    use_reloader=True,
    host='0.0.0.0',
    port=5500)
)

# Turn on debugger by default and reloader
manager.add_command("prod", Server(
    use_debugger=False,
    use_reloader=False,
    host='0.0.0.0',
    port=8080)
)

if __name__ == "__main__":
    manager.run()