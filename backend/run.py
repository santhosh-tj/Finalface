import os
import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
from app import create_app

from app.models.user import User

app = create_app()

# Ensure indexes on first run
with app.app_context():
    User.ensure_indexes(app.db)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    # Disable auto-reloader to prevent constant restarts from TensorFlow file changes
    app.run(host="0.0.0.0", port=port, debug=app.config.get("DEBUG", False), use_reloader=False)
