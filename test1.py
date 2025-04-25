# Importing Libraries
from directory_tree import DisplayTree

# Main Method
if __name__ == "__main__":
    DisplayTree(
        ignoreList=["__pycache__", ".git", ".idea", "node_modules", ".venv", "public"],
    )
