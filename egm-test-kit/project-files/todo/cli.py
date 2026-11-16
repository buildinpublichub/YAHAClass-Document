"""Command line: todo add "title" | todo list | todo done 3"""
import sys
from . import store


def main(argv=None):
    argv = argv if argv is not None else sys.argv[1:]
    if not argv or argv[0] == "list":
        for t in store.load():
            mark = "x" if t["done"] else " "
            print(f"[{mark}] {t['id']}. {t['title']}")
    elif argv[0] == "add":
        t = store.add(" ".join(argv[1:]))
        print(f"Added {t['id']}. {t['title']}")
    elif argv[0] == "done":
        store.complete(int(argv[1]))
        print("Done.")
    else:
        print("usage: todo add TITLE | todo list | todo done ID")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
